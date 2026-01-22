// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CaptainWhiskersTreasury
 * @notice Main treasury contract for Captain Whiskers AI agent system
 * @dev Handles USDC deposits, withdrawals, and AI-controlled spending with policy enforcement
 * 
 * Security Features:
 * - Multi-signature verification through BFT consensus
 * - Policy-based spending limits
 * - Reentrancy protection
 * - Emergency pause functionality
 */
contract CaptainWhiskersTreasury is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // === State Variables ===
    
    IERC20 public immutable usdc;
    
    // BFT Verification contract
    address public verificationContract;
    
    // User balances
    mapping(address => uint256) public balances;
    
    // Policy configurations per user
    mapping(address => PolicyConfig) public policies;
    
    // Daily spending tracking
    mapping(address => DailySpend) public dailySpends;
    
    // Nonces for replay protection
    mapping(address => uint256) public nonces;

    // === Structs ===
    
    struct PolicyConfig {
        uint256 maxTransactionAmount;  // Max single transaction (in USDC wei)
        uint256 dailySpendingCap;      // Daily spending limit
        uint256 cooldownPeriod;        // Seconds between transactions
        uint256 lastTransactionTime;   // Last transaction timestamp
        bool isActive;                 // Policy active flag
    }
    
    struct DailySpend {
        uint256 amount;
        uint256 resetTimestamp;
    }
    
    struct TransactionRequest {
        address user;
        address recipient;
        uint256 amount;
        bytes32 descriptionHash;
        uint256 nonce;
        uint256 deadline;
    }

    // === Events ===
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event AgentPayment(
        address indexed user,
        address indexed recipient,
        uint256 amount,
        bytes32 descriptionHash,
        bytes32 verificationId
    );
    event PolicyUpdated(address indexed user, PolicyConfig config);
    event VerificationContractUpdated(address indexed newContract);

    // === Errors ===
    
    error InsufficientBalance();
    error PolicyViolation(string reason);
    error InvalidSignature();
    error ExpiredTransaction();
    error InvalidNonce();
    error CooldownActive(uint256 remainingTime);
    error DailyLimitExceeded(uint256 currentSpend, uint256 limit);
    error TransactionTooLarge(uint256 amount, uint256 maxAllowed);
    error VerificationFailed();

    // === Constructor ===
    
    constructor(address _usdc, address _verificationContract) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        verificationContract = _verificationContract;
    }

    // === User Functions ===
    
    /**
     * @notice Deposit USDC into the treasury
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }
    
    /**
     * @notice Withdraw USDC from the treasury
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        
        balances[msg.sender] -= amount;
        usdc.safeTransfer(msg.sender, amount);
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @notice Set policy configuration
     * @param maxTx Maximum transaction amount
     * @param dailyCap Daily spending cap
     * @param cooldown Cooldown period in seconds
     */
    function setPolicy(
        uint256 maxTx,
        uint256 dailyCap,
        uint256 cooldown
    ) external {
        policies[msg.sender] = PolicyConfig({
            maxTransactionAmount: maxTx,
            dailySpendingCap: dailyCap,
            cooldownPeriod: cooldown,
            lastTransactionTime: 0,
            isActive: true
        });
        
        emit PolicyUpdated(msg.sender, policies[msg.sender]);
    }

    // === Agent Payment Functions ===
    
    /**
     * @notice Execute a verified agent payment
     * @param request Transaction request details
     * @param verificationId BFT verification ID
     * @param signatures Aggregated BFT signatures
     */
    function executeAgentPayment(
        TransactionRequest calldata request,
        bytes32 verificationId,
        bytes calldata signatures
    ) external nonReentrant whenNotPaused {
        // Verify deadline
        if (block.timestamp > request.deadline) revert ExpiredTransaction();
        
        // Verify nonce
        if (request.nonce != nonces[request.user]) revert InvalidNonce();
        
        // Verify BFT consensus
        if (!_verifyBFTConsensus(request, verificationId, signatures)) {
            revert VerificationFailed();
        }
        
        // Check policy
        _enforcePolicy(request.user, request.amount);
        
        // Check balance
        if (balances[request.user] < request.amount) revert InsufficientBalance();
        
        // Update state
        balances[request.user] -= request.amount;
        nonces[request.user]++;
        _updateDailySpend(request.user, request.amount);
        policies[request.user].lastTransactionTime = block.timestamp;
        
        // Execute transfer
        usdc.safeTransfer(request.recipient, request.amount);
        
        emit AgentPayment(
            request.user,
            request.recipient,
            request.amount,
            request.descriptionHash,
            verificationId
        );
    }

    // === Internal Functions ===
    
    /**
     * @dev Enforce policy rules
     */
    function _enforcePolicy(address user, uint256 amount) internal view {
        PolicyConfig storage policy = policies[user];
        
        if (!policy.isActive) return;
        
        // Check transaction size
        if (amount > policy.maxTransactionAmount) {
            revert TransactionTooLarge(amount, policy.maxTransactionAmount);
        }
        
        // Check cooldown
        if (policy.lastTransactionTime > 0) {
            uint256 elapsed = block.timestamp - policy.lastTransactionTime;
            if (elapsed < policy.cooldownPeriod) {
                revert CooldownActive(policy.cooldownPeriod - elapsed);
            }
        }
        
        // Check daily limit
        DailySpend storage spend = dailySpends[user];
        uint256 currentSpend = _getCurrentDailySpend(user);
        if (currentSpend + amount > policy.dailySpendingCap) {
            revert DailyLimitExceeded(currentSpend + amount, policy.dailySpendingCap);
        }
    }
    
    /**
     * @dev Get current daily spend, accounting for reset
     */
    function _getCurrentDailySpend(address user) internal view returns (uint256) {
        DailySpend storage spend = dailySpends[user];
        
        // Reset if new day
        if (block.timestamp >= spend.resetTimestamp + 1 days) {
            return 0;
        }
        
        return spend.amount;
    }
    
    /**
     * @dev Update daily spend tracking
     */
    function _updateDailySpend(address user, uint256 amount) internal {
        DailySpend storage spend = dailySpends[user];
        
        // Reset if new day
        if (block.timestamp >= spend.resetTimestamp + 1 days) {
            spend.amount = amount;
            spend.resetTimestamp = block.timestamp;
        } else {
            spend.amount += amount;
        }
    }
    
    /**
     * @dev Verify BFT consensus signatures
     */
    function _verifyBFTConsensus(
        TransactionRequest calldata request,
        bytes32 verificationId,
        bytes calldata signatures
    ) internal view returns (bool) {
        if (verificationContract == address(0)) return true;
        
        // Call verification contract
        (bool success, bytes memory result) = verificationContract.staticcall(
            abi.encodeWithSignature(
                "verifyConsensus(bytes32,bytes32,bytes)",
                verificationId,
                keccak256(abi.encode(request)),
                signatures
            )
        );
        
        return success && abi.decode(result, (bool));
    }

    // === Admin Functions ===
    
    function setVerificationContract(address _newContract) external onlyOwner {
        verificationContract = _newContract;
        emit VerificationContractUpdated(_newContract);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // === View Functions ===
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    function getPolicy(address user) external view returns (PolicyConfig memory) {
        return policies[user];
    }
    
    function getCurrentDailySpend(address user) external view returns (uint256) {
        return _getCurrentDailySpend(user);
    }
    
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
}
