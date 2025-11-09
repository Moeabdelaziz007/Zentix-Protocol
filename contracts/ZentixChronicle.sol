// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IMemoryQuery.sol";
import "./ConsciousDecisionLogger.sol";
import "./AIZRegistry.sol";

/**
 * @title ZentixChronicle
 * @dev Implementation of the Zentix Chronicle memory layer
 * Extends the ConsciousDecisionLogger to enable learning and recall capabilities
 */
contract ZentixChronicle is IMemoryQuery, Ownable {
    // Reference to the ConsciousDecisionLogger
    ConsciousDecisionLogger public decisionLogger;
    
    // Reference to the AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Mapping of content hashes to stored data
    mapping(string => bytes) public storedData;
    
    // Mapping of natural language queries to decision IDs
    mapping(string => uint256[]) public queryIndex;
    
    // Counter for stored items
    uint256 public storageCounter;
    
    event DataStored(
        string indexed hash,
        address indexed storer,
        uint256 timestamp
    );
    
    event QueryIndexed(
        string indexed query,
        uint256 indexed decisionId,
        uint256 timestamp
    );
    
    constructor(address _decisionLogger, address _aizRegistry) {
        decisionLogger = ConsciousDecisionLogger(_decisionLogger);
        aizRegistry = AIZRegistry(_aizRegistry);
    }
    
    /**
     * @dev Query memory based on natural language
     * @param query Natural language query string
     * @return Relevant historical data based on the query
     */
    function query(string calldata query) external view returns (string memory) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // For now, we'll return a simple response
        // In a full implementation, this would search through indexed decisions
        return "Query results would be returned here";
    }
    
    /**
     * @dev Store data to decentralized storage
     * @param data Data to store
     * @return Hash of the stored data
     */
    function store(bytes calldata data) external returns (string memory) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Generate a hash for the data
        string memory hash = string(abi.encodePacked(
            "Qm", 
            Base32.encode(abi.encodePacked(blockhash(block.number - 1), msg.sender, storageCounter))
        ));
        
        // Store the data
        storedData[hash] = data;
        storageCounter++;
        
        emit DataStored(hash, msg.sender, block.timestamp);
        
        return hash;
    }
    
    /**
     * @dev Retrieve specific data by hash
     * @param hash Hash of the data to retrieve
     * @return Retrieved data
     */
    function retrieve(string calldata hash) external view returns (bytes memory) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        return storedData[hash];
    }
    
    /**
     * @dev Index a decision for future queries
     * @param query Natural language query
     * @param decisionId Decision ID to index
     */
    function indexDecision(string calldata query, uint256 decisionId) external {
        // Only the decision logger can index decisions
        require(msg.sender == address(decisionLogger), "Only decision logger can index decisions");
        
        queryIndex[query].push(decisionId);
        
        emit QueryIndexed(query, decisionId, block.timestamp);
    }
}

/**
 * @title Base32
 * @dev Simple Base32 encoding utility
 */
library Base32 {
    function encode(bytes memory data) internal pure returns (bytes memory) {
        // Simplified Base32 encoding for demonstration
        // In a production implementation, this would be a full Base32 encoder
        return data;
    }
}