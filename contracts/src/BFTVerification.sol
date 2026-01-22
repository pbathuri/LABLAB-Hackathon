// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title BFTVerification
 * @notice Byzantine Fault Tolerant verification contract for Captain Whiskers
 * @dev Implements on-chain verification of BFT consensus results
 * 
 * BFT Parameters:
 * - Total nodes (n): 11
 * - Fault tolerance (f): 3 (can tolerate up to 3 Byzantine nodes)
 * - Required signatures: 2f + 1 = 7
 * 
 * References:
 * - Castro & Liskov (1999), "Practical Byzantine Fault Tolerance"
 */
contract BFTVerification is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // === Constants ===
    
    uint256 public constant TOTAL_VERIFIERS = 11;
    uint256 public constant REQUIRED_SIGNATURES = 7;  // 2f + 1 where f = 3
    uint256 public constant SIGNATURE_LENGTH = 65;

    // === State Variables ===
    
    // Registered verifier addresses
    address[TOTAL_VERIFIERS] public verifiers;
    mapping(address => bool) public isVerifier;
    
    // Verification records
    mapping(bytes32 => VerificationRecord) public verificationRecords;
    
    // Nonces for replay protection
    mapping(bytes32 => bool) public usedNonces;

    // === Structs ===
    
    struct VerificationRecord {
        bytes32 requestHash;
        uint256 timestamp;
        uint256 signatureCount;
        bool isValid;
        address[] signers;
    }

    // === Events ===
    
    event VerifierRegistered(address indexed verifier, uint256 index);
    event VerifierRemoved(address indexed verifier);
    event ConsensusVerified(
        bytes32 indexed verificationId,
        bytes32 requestHash,
        uint256 signatureCount,
        bool isValid
    );

    // === Errors ===
    
    error InvalidSignatureCount();
    error DuplicateSigner();
    error InvalidSigner(address signer);
    error VerificationNotFound();
    error NonceAlreadyUsed();

    // === Constructor ===
    
    constructor(address[] memory _verifiers) Ownable(msg.sender) {
        require(_verifiers.length == TOTAL_VERIFIERS, "Must provide 11 verifiers");
        
        for (uint256 i = 0; i < TOTAL_VERIFIERS; i++) {
            verifiers[i] = _verifiers[i];
            isVerifier[_verifiers[i]] = true;
            emit VerifierRegistered(_verifiers[i], i);
        }
    }

    // === Verification Functions ===
    
    /**
     * @notice Verify BFT consensus for a request
     * @param verificationId Unique verification ID
     * @param requestHash Hash of the request being verified
     * @param signatures Concatenated signatures (65 bytes each)
     * @return bool Whether consensus was achieved
     */
    function verifyConsensus(
        bytes32 verificationId,
        bytes32 requestHash,
        bytes calldata signatures
    ) external returns (bool) {
        // Check nonce
        if (usedNonces[verificationId]) revert NonceAlreadyUsed();
        usedNonces[verificationId] = true;
        
        // Calculate required signature count
        uint256 signatureCount = signatures.length / SIGNATURE_LENGTH;
        if (signatureCount < REQUIRED_SIGNATURES) {
            revert InvalidSignatureCount();
        }
        
        // Track signers to prevent duplicates
        address[] memory signers = new address[](signatureCount);
        
        // Create the message hash that was signed
        bytes32 ethSignedHash = requestHash.toEthSignedMessageHash();
        
        uint256 validSignatures = 0;
        
        for (uint256 i = 0; i < signatureCount; i++) {
            // Extract signature
            bytes memory sig = signatures[i * SIGNATURE_LENGTH:(i + 1) * SIGNATURE_LENGTH];
            
            // Recover signer
            address signer = ECDSA.recover(ethSignedHash, sig);
            
            // Check if valid verifier
            if (!isVerifier[signer]) {
                continue;  // Skip invalid signers
            }
            
            // Check for duplicates
            bool isDuplicate = false;
            for (uint256 j = 0; j < validSignatures; j++) {
                if (signers[j] == signer) {
                    isDuplicate = true;
                    break;
                }
            }
            
            if (!isDuplicate) {
                signers[validSignatures] = signer;
                validSignatures++;
            }
        }
        
        bool consensusAchieved = validSignatures >= REQUIRED_SIGNATURES;
        
        // Store verification record
        address[] memory finalSigners = new address[](validSignatures);
        for (uint256 i = 0; i < validSignatures; i++) {
            finalSigners[i] = signers[i];
        }
        
        verificationRecords[verificationId] = VerificationRecord({
            requestHash: requestHash,
            timestamp: block.timestamp,
            signatureCount: validSignatures,
            isValid: consensusAchieved,
            signers: finalSigners
        });
        
        emit ConsensusVerified(
            verificationId,
            requestHash,
            validSignatures,
            consensusAchieved
        );
        
        return consensusAchieved;
    }
    
    /**
     * @notice Check if verification exists and is valid (view only)
     * @param verificationId Verification ID to check
     * @return valid Whether the verification is valid
     * @return signatureCount Number of valid signatures
     */
    function checkVerification(bytes32 verificationId) 
        external 
        view 
        returns (bool valid, uint256 signatureCount) 
    {
        VerificationRecord storage record = verificationRecords[verificationId];
        return (record.isValid, record.signatureCount);
    }

    // === Admin Functions ===
    
    /**
     * @notice Replace a verifier
     * @param index Index of verifier to replace
     * @param newVerifier New verifier address
     */
    function replaceVerifier(uint256 index, address newVerifier) external onlyOwner {
        require(index < TOTAL_VERIFIERS, "Invalid index");
        require(!isVerifier[newVerifier], "Already a verifier");
        
        address oldVerifier = verifiers[index];
        
        isVerifier[oldVerifier] = false;
        emit VerifierRemoved(oldVerifier);
        
        verifiers[index] = newVerifier;
        isVerifier[newVerifier] = true;
        emit VerifierRegistered(newVerifier, index);
    }

    // === View Functions ===
    
    function getVerifiers() external view returns (address[11] memory) {
        return verifiers;
    }
    
    function getVerificationRecord(bytes32 verificationId) 
        external 
        view 
        returns (VerificationRecord memory) 
    {
        return verificationRecords[verificationId];
    }
}
