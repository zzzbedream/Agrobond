// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./AgroRiskOracle.sol";

contract AgroBond is ERC1155, Ownable, Pausable {
    AgroRiskOracle public oracle;
    
    uint256 public constant SENIOR_ID = 1;
    uint256 public constant JUNIOR_ID = 2;
    
    // Configurable parameters (security fix #4)
    uint256 public minRiskScore = 60;
    uint256 public constant MAX_INVOICE_AMOUNT = 10_000_000; // 10M cap
    
    // Constants for bond splitting (security fix #11)
    uint256 public constant SENIOR_PERCENTAGE = 80;
    uint256 public constant PERCENTAGE_BASE = 100;
    
    // Events (security fix #10)
    event BondMinted(
        address indexed user, 
        uint256 invoiceAmount, 
        uint256 seniorAmount, 
        uint256 juniorAmount, 
        string docId,
        uint256 riskScore
    );
    event MinRiskScoreUpdated(uint256 newMinScore);

    constructor(address _oracleAddress) 
        ERC1155("https://api.agrobond.xyz/metadata/{id}.json") 
        Ownable(msg.sender) 
    {
        oracle = AgroRiskOracle(_oracleAddress);
    }

    /// @notice Mints senior and junior bonds for an approved invoice
    /// @param invoiceAmount Total invoice value in smallest token units
    /// @param riskScore AI-generated risk score (0-100)
    /// @param docId Unique invoice document identifier
    /// @param signature Cryptographic signature from authorized oracle
    /// @dev Requires oracle validation and minimum risk score threshold
    function mintBond(
        uint256 invoiceAmount,
        uint256 riskScore,
        string memory docId,
        bytes memory signature
    ) external whenNotPaused {
        // Input validation (security fix #4)
        require(invoiceAmount > 0, "Amount must be positive");
        require(invoiceAmount <= MAX_INVOICE_AMOUNT, "Amount exceeds maximum");
        require(riskScore <= 100, "Invalid risk score");
        require(bytes(docId).length > 0, "DocId required");
        require(bytes(docId).length <= 100, "DocId too long");
        
        // Oracle verification with chainId protection (security fix #2)
        require(
            oracle.verifyRisk(msg.sender, riskScore, docId, signature), 
            "Oracle validation failed"
        );
        
        // Risk score threshold check
        require(riskScore >= minRiskScore, "Risk score too low");

        // Bond splitting with precision fix (security fix #5)
        uint256 seniorAmount = (invoiceAmount * SENIOR_PERCENTAGE) / PERCENTAGE_BASE;
        uint256 juniorAmount = invoiceAmount - seniorAmount; // Captures remainder

        // Mint tokens
        _mint(msg.sender, SENIOR_ID, seniorAmount, "");
        _mint(msg.sender, JUNIOR_ID, juniorAmount, "");
        
        emit BondMinted(msg.sender, invoiceAmount, seniorAmount, juniorAmount, docId, riskScore);
    }
    
    /// @notice Updates the minimum required risk score for minting
    /// @param newMinScore New minimum risk score (0-100)
    function setMinRiskScore(uint256 newMinScore) external onlyOwner {
        require(newMinScore <= 100, "Invalid score");
        minRiskScore = newMinScore;
        emit MinRiskScoreUpdated(newMinScore);
    }
    
    /// @notice Pauses all bond minting operations
    function pause() external onlyOwner {
        _pause();
    }
    
    /// @notice Resumes bond minting operations
    function unpause() external onlyOwner {
        _unpause();
    }
}
