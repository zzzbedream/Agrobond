// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract AgroRiskOracle is AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Replay attack protection (security fix #2, #8)
    mapping(bytes => bool) public usedSignatures;
    mapping(address => uint256) public nonces;
    
    // Oracle health check (security enhancement C)
    uint256 public lastUpdate;
    uint256 public constant ORACLE_TIMEOUT = 1 hours;
    
    bool public paused;

    event RiskVerified(address indexed user, uint256 riskScore, string docId, uint256 nonce);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event OraclePaused(address indexed by);
    event OracleUnpaused(address indexed by);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SIGNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        lastUpdate = block.timestamp;
    }

    /// @notice Verifies an AI-generated risk assessment signature
    /// @param user Address of the user requesting bond minting
    /// @param riskScore AI-calculated risk score (0-100)
    /// @param docId Unique invoice document identifier
    /// @param signature ECDSA signature from authorized signer
    /// @return bool True if signature is valid and from authorized signer
    function verifyRisk(
        address user,
        uint256 riskScore,
        string memory docId,
        bytes memory signature
    ) external returns (bool) {
        require(!paused, "Oracle paused");
        require(!usedSignatures[signature], "Signature already used");
        
        // Get current nonce for this user
        uint256 currentNonce = nonces[user];
        
        // Reconstruct hash with anti-replay protections (security fix #2, #8)
        bytes32 hash = keccak256(
            abi.encodePacked(
                user,
                riskScore,
                docId,
                currentNonce,      // Prevents nonce reuse
                block.chainid,     // Prevents cross-chain replay
                address(this)      // Prevents cross-contract replay
            )
        );
        
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(hash);

        // Recover signer from signature
        address signer = ECDSA.recover(ethSignedHash, signature);

        // Verify signer has authorization
        require(hasRole(SIGNER_ROLE, signer), "Invalid AI signature");

        // Mark signature as used and increment nonce
        usedSignatures[signature] = true;
        nonces[user]++;
        
        // Update oracle health timestamp
        lastUpdate = block.timestamp;
        
        emit RiskVerified(user, riskScore, docId, currentNonce);
        
        return true;
    }
    
    /// @notice Gets the current nonce for a user (for frontend signature generation)
    /// @param user User address
    /// @return uint256 Current nonce
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
    
    /// @notice Checks if oracle is healthy (recent activity)
    /// @return bool True if oracle has been active within timeout period
    function isHealthy() external view returns (bool) {
        return block.timestamp - lastUpdate < ORACLE_TIMEOUT;
    }
    
    /// @notice Adds a new authorized signer
    /// @param newSigner Address of new signer
    function addSigner(address newSigner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(SIGNER_ROLE, newSigner);
        emit SignerAdded(newSigner);
    }
    
    /// @notice Removes an authorized signer
    /// @param signer Address of signer to remove
    function removeSigner(address signer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(SIGNER_ROLE, signer);
        emit SignerRemoved(signer);
    }
    
    /// @notice Emergency pause function
    function pause() external onlyRole(PAUSER_ROLE) {
        paused = true;
        emit OraclePaused(msg.sender);
    }
    
    /// @notice Unpause oracle
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = false;
        emit OracleUnpaused(msg.sender);
    }
}
