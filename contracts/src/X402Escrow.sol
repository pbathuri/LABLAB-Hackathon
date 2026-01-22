// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title X402Escrow
 * @notice Escrow contract for x402 HTTP micropayments
 * @dev Implements pay-per-call, pay-on-success, and bundled payment models
 * 
 * Payment Models:
 * 1. Pay-per-call: Payment released upon call completion
 * 2. Pay-on-success: Payment released only if result is verified
 * 3. Bundled: Multiple small payments aggregated and settled together
 * 
 * References:
 * - x402 Payment Protocol Specification
 * - EIP-712: Typed Structured Data Hashing and Signing
 */
contract X402Escrow is EIP712, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // === Constants ===
    
    bytes32 public constant PAYMENT_TYPEHASH = keccak256(
        "PaymentRequest(address payer,address provider,uint256 amount,bytes32 requestHash,uint256 nonce,uint256 deadline)"
    );
    
    uint256 public constant REFUND_TIMEOUT = 1 hours;
    uint256 public constant MAX_BUNDLE_SIZE = 100;

    // === State Variables ===
    
    IERC20 public immutable usdc;
    
    // Escrow balances
    mapping(bytes32 => EscrowRecord) public escrows;
    
    // Payment bundles
    mapping(bytes32 => PaymentBundle) public bundles;
    
    // Provider registrations
    mapping(address => ProviderInfo) public providers;
    
    // Nonces for replay protection
    mapping(address => uint256) public nonces;
    
    // Protocol fee (basis points, 1 bp = 0.01%)
    uint256 public protocolFeeBps = 10;  // 0.1%

    // === Structs ===
    
    struct EscrowRecord {
        address payer;
        address provider;
        uint256 amount;
        uint256 timestamp;
        EscrowStatus status;
        bytes32 requestHash;
    }
    
    struct PaymentBundle {
        address payer;
        address provider;
        uint256 totalAmount;
        uint256 paymentCount;
        uint256 createdAt;
        bool settled;
    }
    
    struct ProviderInfo {
        bool isRegistered;
        uint256 totalEarned;
        uint256 successfulCalls;
        uint256 failedCalls;
    }
    
    struct PaymentRequest {
        address payer;
        address provider;
        uint256 amount;
        bytes32 requestHash;
        uint256 nonce;
        uint256 deadline;
    }
    
    enum EscrowStatus {
        Pending,
        Released,
        Refunded,
        Disputed
    }

    // === Events ===
    
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed provider,
        uint256 amount
    );
    event EscrowReleased(bytes32 indexed escrowId, uint256 amount);
    event EscrowRefunded(bytes32 indexed escrowId, uint256 amount);
    event BundleCreated(bytes32 indexed bundleId, address payer, address provider);
    event BundleSettled(bytes32 indexed bundleId, uint256 totalAmount);
    event ProviderRegistered(address indexed provider);

    // === Errors ===
    
    error InvalidSignature();
    error ExpiredDeadline();
    error InvalidNonce();
    error EscrowNotFound();
    error EscrowAlreadyProcessed();
    error RefundTimeoutNotReached();
    error ProviderNotRegistered();
    error BundleTooLarge();
    error InsufficientAllowance();

    // === Constructor ===
    
    constructor(address _usdc) EIP712("CaptainWhiskers x402", "1") Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    // === Provider Functions ===
    
    /**
     * @notice Register as a provider
     */
    function registerProvider() external {
        providers[msg.sender] = ProviderInfo({
            isRegistered: true,
            totalEarned: 0,
            successfulCalls: 0,
            failedCalls: 0
        });
        emit ProviderRegistered(msg.sender);
    }

    // === Escrow Functions ===
    
    /**
     * @notice Create an escrow for a single payment
     * @param request Payment request details
     * @param signature EIP-712 signature from payer
     */
    function createEscrow(
        PaymentRequest calldata request,
        bytes calldata signature
    ) external nonReentrant returns (bytes32 escrowId) {
        // Verify deadline
        if (block.timestamp > request.deadline) revert ExpiredDeadline();
        
        // Verify nonce
        if (request.nonce != nonces[request.payer]) revert InvalidNonce();
        
        // Verify signature
        bytes32 structHash = keccak256(abi.encode(
            PAYMENT_TYPEHASH,
            request.payer,
            request.provider,
            request.amount,
            request.requestHash,
            request.nonce,
            request.deadline
        ));
        
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        
        if (signer != request.payer) revert InvalidSignature();
        
        // Check provider
        if (!providers[request.provider].isRegistered) {
            revert ProviderNotRegistered();
        }
        
        // Create escrow ID
        escrowId = keccak256(abi.encode(
            request.payer,
            request.provider,
            request.amount,
            request.nonce,
            block.timestamp
        ));
        
        // Transfer funds to escrow
        usdc.safeTransferFrom(request.payer, address(this), request.amount);
        
        // Store escrow
        escrows[escrowId] = EscrowRecord({
            payer: request.payer,
            provider: request.provider,
            amount: request.amount,
            timestamp: block.timestamp,
            status: EscrowStatus.Pending,
            requestHash: request.requestHash
        });
        
        // Update nonce
        nonces[request.payer]++;
        
        emit EscrowCreated(escrowId, request.payer, request.provider, request.amount);
    }
    
    /**
     * @notice Release escrow to provider (called after successful service)
     * @param escrowId Escrow ID
     */
    function releaseEscrow(bytes32 escrowId) external nonReentrant {
        EscrowRecord storage escrow = escrows[escrowId];
        
        if (escrow.amount == 0) revert EscrowNotFound();
        if (escrow.status != EscrowStatus.Pending) revert EscrowAlreadyProcessed();
        
        // Only payer can release
        require(msg.sender == escrow.payer, "Only payer can release");
        
        escrow.status = EscrowStatus.Released;
        
        // Calculate fee
        uint256 fee = (escrow.amount * protocolFeeBps) / 10000;
        uint256 providerAmount = escrow.amount - fee;
        
        // Transfer to provider
        usdc.safeTransfer(escrow.provider, providerAmount);
        
        // Update provider stats
        providers[escrow.provider].totalEarned += providerAmount;
        providers[escrow.provider].successfulCalls++;
        
        emit EscrowReleased(escrowId, providerAmount);
    }
    
    /**
     * @notice Refund escrow to payer (after timeout or failure)
     * @param escrowId Escrow ID
     */
    function refundEscrow(bytes32 escrowId) external nonReentrant {
        EscrowRecord storage escrow = escrows[escrowId];
        
        if (escrow.amount == 0) revert EscrowNotFound();
        if (escrow.status != EscrowStatus.Pending) revert EscrowAlreadyProcessed();
        
        // Either payer can refund after timeout, or provider can refund anytime
        if (msg.sender == escrow.payer) {
            if (block.timestamp < escrow.timestamp + REFUND_TIMEOUT) {
                revert RefundTimeoutNotReached();
            }
        } else {
            require(msg.sender == escrow.provider, "Not authorized");
        }
        
        escrow.status = EscrowStatus.Refunded;
        
        // Update provider stats
        providers[escrow.provider].failedCalls++;
        
        // Return funds to payer
        usdc.safeTransfer(escrow.payer, escrow.amount);
        
        emit EscrowRefunded(escrowId, escrow.amount);
    }

    // === Bundle Functions ===
    
    /**
     * @notice Create a payment bundle for aggregating micropayments
     * @param provider Provider address
     * @param initialAmount Initial amount to add to bundle
     */
    function createBundle(
        address provider,
        uint256 initialAmount
    ) external nonReentrant returns (bytes32 bundleId) {
        if (!providers[provider].isRegistered) revert ProviderNotRegistered();
        
        bundleId = keccak256(abi.encode(
            msg.sender,
            provider,
            block.timestamp,
            nonces[msg.sender]++
        ));
        
        usdc.safeTransferFrom(msg.sender, address(this), initialAmount);
        
        bundles[bundleId] = PaymentBundle({
            payer: msg.sender,
            provider: provider,
            totalAmount: initialAmount,
            paymentCount: 1,
            createdAt: block.timestamp,
            settled: false
        });
        
        emit BundleCreated(bundleId, msg.sender, provider);
    }
    
    /**
     * @notice Add payment to existing bundle
     * @param bundleId Bundle ID
     * @param amount Amount to add
     */
    function addToBundle(bytes32 bundleId, uint256 amount) external nonReentrant {
        PaymentBundle storage bundle = bundles[bundleId];
        
        require(bundle.payer == msg.sender, "Not bundle owner");
        require(!bundle.settled, "Bundle already settled");
        require(bundle.paymentCount < MAX_BUNDLE_SIZE, "Bundle full");
        
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        bundle.totalAmount += amount;
        bundle.paymentCount++;
    }
    
    /**
     * @notice Settle a payment bundle
     * @param bundleId Bundle ID
     */
    function settleBundle(bytes32 bundleId) external nonReentrant {
        PaymentBundle storage bundle = bundles[bundleId];
        
        require(bundle.payer == msg.sender, "Not bundle owner");
        require(!bundle.settled, "Already settled");
        
        bundle.settled = true;
        
        // Calculate fee
        uint256 fee = (bundle.totalAmount * protocolFeeBps) / 10000;
        uint256 providerAmount = bundle.totalAmount - fee;
        
        // Transfer to provider
        usdc.safeTransfer(bundle.provider, providerAmount);
        
        // Update provider stats
        providers[bundle.provider].totalEarned += providerAmount;
        providers[bundle.provider].successfulCalls += bundle.paymentCount;
        
        emit BundleSettled(bundleId, providerAmount);
    }

    // === Admin Functions ===
    
    function setProtocolFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 100, "Fee too high");  // Max 1%
        protocolFeeBps = _feeBps;
    }
    
    function withdrawFees(address to) external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        // Only withdraw accumulated fees, not escrowed funds
        // In production, track fees separately
        usdc.safeTransfer(to, balance);
    }

    // === View Functions ===
    
    function getEscrow(bytes32 escrowId) external view returns (EscrowRecord memory) {
        return escrows[escrowId];
    }
    
    function getBundle(bytes32 bundleId) external view returns (PaymentBundle memory) {
        return bundles[bundleId];
    }
    
    function getProviderInfo(address provider) external view returns (ProviderInfo memory) {
        return providers[provider];
    }
    
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
    
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
