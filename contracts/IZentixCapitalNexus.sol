// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IZentixCapitalNexus
 * @dev Interface for the Zentix Capital Nexus
 * Enables agent financing and value creation through a protocol-level treasury
 */
interface IZentixCapitalNexus {
    /**
     * @dev Request capital for specific tasks
     * @param amount Amount to borrow
     * @param purpose Purpose of the loan
     * @return Loan ID
     */
    function borrow(uint256 amount, string calldata purpose) external returns (uint256);
    
    /**
     * @dev Repay borrowed capital plus interest
     * @param loanId ID of the loan to repay
     */
    function repay(uint256 loanId) external;
    
    /**
     * @dev Get agent's creditworthiness score
     * @param agent Address of the agent
     * @return Credit score
     */
    function getCreditScore(address agent) external view returns (uint256);
    
    /**
     * @dev Deposit MEV or other rewards to treasury
     * @param amount Amount to deposit
     */
    function depositRewards(uint256 amount) external;
}