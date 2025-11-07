// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RewardsPool
 * @dev Smart contract for distributing rewards to users on the Echo platform
 */
contract RewardsPool is Ownable {
    IERC20 public rewardToken;
    
    // Events
    event RewardDistributed(address indexed recipient, uint256 amount);
    event TokensDeposited(address indexed depositor, uint256 amount);
    
    /**
     * @dev Constructor to set the reward token
     * @param _rewardToken The ERC20 token used for rewards
     */
    constructor(address _rewardToken) {
        rewardToken = IERC20(_rewardToken);
    }
    
    /**
     * @dev Function to deposit tokens into the contract
     * @param amount The amount of tokens to deposit
     */
    function deposit(uint256 amount) external {
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit TokensDeposited(msg.sender, amount);
    }
    
    /**
     * @dev Fallback function to receive ETH (if needed)
     */
    receive() external payable {}
    
    /**
     * @dev Function to distribute rewards to a recipient
     * @param recipient The address to receive the reward
     * @param amount The amount of tokens to distribute
     */
    function distributeReward(address recipient, uint256 amount) external onlyOwner {
        require(rewardToken.balanceOf(address(this)) >= amount, "Insufficient balance");
        require(rewardToken.transfer(recipient, amount), "Transfer failed");
        emit RewardDistributed(recipient, amount);
    }
    
    /**
     * @dev Function to withdraw tokens from the contract (only owner)
     * @param amount The amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(rewardToken.transfer(owner(), amount), "Transfer failed");
    }
}