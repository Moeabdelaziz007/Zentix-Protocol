// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IMemoryQuery
 * @dev Interface for the Zentix Chronicle memory layer
 * Enables agents to store and retrieve historical decision data
 */
interface IMemoryQuery {
    /**
     * @dev Query memory based on natural language
     * @param query Natural language query string
     * @return Relevant historical data based on the query
     */
    function query(string calldata query) external view returns (string memory);
    
    /**
     * @dev Store data to decentralized storage
     * @param data Data to store
     * @return Hash of the stored data
     */
    function store(bytes calldata data) external returns (string memory);
    
    /**
     * @dev Retrieve specific data by hash
     * @param hash Hash of the data to retrieve
     * @return Retrieved data
     */
    function retrieve(string calldata hash) external view returns (bytes memory);
}