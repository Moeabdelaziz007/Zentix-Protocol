// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IZentixOracle
 * @dev Interface for the Zentix Oracle Network (ZON)
 * Provides AI agents with external world perception capabilities
 */
interface IZentixOracle {
    /**
     * @dev Fetch data from web URLs
     * @param url URL to fetch data from
     * @return Retrieved data
     */
    function fetch(string calldata url) external returns (string memory);
    
    /**
     * @dev Get state information from other blockchains
     * @param chain Chain identifier
     * @param query Query for specific state information
     * @return State information
     */
    function state(string calldata chain, string calldata query) external returns (string memory);
    
    /**
     * @dev Get price feeds optimized for AI decision making
     * @param asset Asset identifier
     * @return Price information
     */
    function price(string calldata asset) external returns (uint256);
}