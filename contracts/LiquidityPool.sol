// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LiquidityPool is ERC1155Holder, Ownable, ReentrancyGuard {
    IERC20 public cashToken;   // MockMETH
    IERC1155 public bondToken; // AgroBond

    uint256 public constant SENIOR_ID = 1;
    uint256 public constant DISCOUNT_RATE = 5; // 5% discount for instant liquidity
    
    // Circuit breakers (security enhancement A)
    uint256 public maxSellPerTransaction = 1_000_000;
    uint256 public maxDailySells = 10_000_000;
    mapping(uint256 => uint256) public dailySellVolume;

    event BondSold(address indexed seller, uint256 amount, uint256 payout);
    event LiquidityWithdrawn(address indexed owner, uint256 amount);
    event MaxSellPerTransactionUpdated(uint256 newMax);
    event MaxDailySellsUpdated(uint256 newMax);

    constructor(address _cashToken, address _bondToken) Ownable(msg.sender) {
        cashToken = IERC20(_cashToken);
        bondToken = IERC1155(_bondToken);
    }

    /// @notice Sells senior bonds for instant cash liquidity
    /// @param amount Amount of senior bonds to sell
    /// @dev Protected against reentrancy attacks
    function sellSeniorBond(uint256 amount) external nonReentrant {
        // Input validation
        require(amount > 0, "Amount must be positive");
        require(amount <= maxSellPerTransaction, "Exceeds per-transaction limit");
        
        // Circuit breaker - daily volume check (security enhancement A)
        uint256 today = block.timestamp / 1 days;
        require(
            dailySellVolume[today] + amount <= maxDailySells, 
            "Daily sell limit exceeded"
        );
        
        // Calculate payout (95% of face value)
        uint256 payout = (amount * (100 - DISCOUNT_RATE)) / 100;

        // Verify pool has sufficient liquidity
        require(
            cashToken.balanceOf(address(this)) >= payout, 
            "Pool: Insufficient liquidity"
        );

        // Verify user has sufficient bonds
        require(
            bondToken.balanceOf(msg.sender, SENIOR_ID) >= amount, 
            "User: Insufficient bonds"
        );

        // CRITICAL: Transfer bonds FIRST (Checks-Effects-Interactions pattern)
        // User must have called setApprovalForAll beforehand
        bondToken.safeTransferFrom(msg.sender, address(this), SENIOR_ID, amount, "");
        
        // Transfer cash - with return value check (security fix #3)
        bool success = cashToken.transfer(msg.sender, payout);
        require(success, "Cash transfer failed");
        
        // Update daily volume
        dailySellVolume[today] += amount;

        emit BondSold(msg.sender, amount, payout);
    }

    /// @notice Allows owner to withdraw liquidity (with proper checks)
    /// @dev Can only be called by owner
    function withdrawLiquidity(uint256 amount) external onlyOwner {
        uint256 balance = cashToken.balanceOf(address(this));
        require(amount <= balance, "Insufficient pool balance");
        
        // Security fix #3: Check return value
        bool success = cashToken.transfer(msg.sender, amount);
        require(success, "Transfer failed");
        
        emit LiquidityWithdrawn(msg.sender, amount);
    }
    
    /// @notice Emergency withdraw all liquidity
    /// @dev Use with caution - drains entire pool
    function emergencyWithdrawAll() external onlyOwner {
        uint256 balance = cashToken.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        
        bool success = cashToken.transfer(msg.sender, balance);
        require(success, "Transfer failed");
        
        emit LiquidityWithdrawn(msg.sender, balance);
    }
    
    /// @notice Updates maximum sell amount per transaction
    /// @param newMax New maximum amount
    function setMaxSellPerTransaction(uint256 newMax) external onlyOwner {
        require(newMax > 0, "Must be positive");
        maxSellPerTransaction = newMax;
        emit MaxSellPerTransactionUpdated(newMax);
    }
    
    /// @notice Updates maximum daily sell volume
    /// @param newMax New daily maximum
    function setMaxDailySells(uint256 newMax) external onlyOwner {
        require(newMax > 0, "Must be positive");
        maxDailySells = newMax;
        emit MaxDailySellsUpdated(newMax);
    }
    
    /// @notice Gets current pool liquidity
    /// @return uint256 Available cash balance
    function getPoolLiquidity() external view returns (uint256) {
        return cashToken.balanceOf(address(this));
    }
    
    /// @notice Gets remaining sell capacity for today
    /// @return uint256 Remaining capacity
    function getRemainingDailyCapacity() external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        uint256 used = dailySellVolume[today];
        if (used >= maxDailySells) return 0;
        return maxDailySells - used;
    }
}
