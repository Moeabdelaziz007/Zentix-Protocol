// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IZentixOracle.sol";
import "./AIZRegistry.sol";

/**
 * @title ZentixOracleNetwork
 * @dev Implementation of the Zentix Oracle Network (ZON)
 * Provides AI agents with external world perception capabilities
 */
contract ZentixOracleNetwork is IZentixOracle, Ownable {
    // Reference to the AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Oracle data storage (simplified for this implementation)
    mapping(string => string) public webData;
    mapping(string => mapping(string => string)) public chainState;
    mapping(string => uint256) public assetPrices;
    
    // Authorized oracle operators
    mapping(address => bool) public authorizedOracles;
    
    event OracleDataUpdated(
        string indexed dataType,
        string indexed identifier,
        string data,
        uint256 timestamp
    );
    
    event OracleAuthorized(
        address indexed oracle,
        uint256 timestamp
    );
    
    event OracleRevoked(
        address indexed oracle,
        uint256 timestamp
    );
    
    constructor(address _aizRegistry) {
        aizRegistry = AIZRegistry(_aizRegistry);
    }
    
    /**
     * @dev Fetch data from web URLs
     * @param url URL to fetch data from
     * @return Retrieved data
     */
    function fetch(string calldata url) external returns (string memory) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // In a real implementation, this would fetch data from the web
        // For this implementation, we return stored data or a default response
        string memory data = webData[url];
        if (bytes(data).length == 0) {
            return "Web data would be fetched here";
        }
        return data;
    }
    
    /**
     * @dev Get state information from other blockchains
     * @param chain Chain identifier
     * @param query Query for specific state information
     * @return State information
     */
    function state(string calldata chain, string calldata query) external returns (string memory) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Return stored chain state or default response
        string memory data = chainState[chain][query];
        if (bytes(data).length == 0) {
            return "Chain state data would be returned here";
        }
        return data;
    }
    
    /**
     * @dev Get price feeds optimized for AI decision making
     * @param asset Asset identifier
     * @return Price information
     */
    function price(string calldata asset) external returns (uint256) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Return stored price or default value
        uint256 priceValue = assetPrices[asset];
        if (priceValue == 0) {
            return 1000000; // Default price in wei
        }
        return priceValue;
    }
    
    /**
     * @dev Update web data (only authorized oracles)
     * @param url URL identifier
     * @param data Data to store
     */
    function updateWebData(string calldata url, string calldata data) external {
        require(authorizedOracles[msg.sender], "Unauthorized oracle");
        
        webData[url] = data;
        
        emit OracleDataUpdated("web", url, data, block.timestamp);
    }
    
    /**
     * @dev Update chain state data (only authorized oracles)
     * @param chain Chain identifier
     * @param query Query identifier
     * @param data Data to store
     */
    function updateChainState(string calldata chain, string calldata query, string calldata data) external {
        require(authorizedOracles[msg.sender], "Unauthorized oracle");
        
        chainState[chain][query] = data;
        
        emit OracleDataUpdated("chain", string(abi.encodePacked(chain, ":", query)), data, block.timestamp);
    }
    
    /**
     * @dev Update asset price (only authorized oracles)
     * @param asset Asset identifier
     * @param price Price value
     */
    function updateAssetPrice(string calldata asset, uint256 price) external {
        require(authorizedOracles[msg.sender], "Unauthorized oracle");
        
        assetPrices[asset] = price;
        
        emit OracleDataUpdated("price", asset, string(abi.encodePacked(price)), block.timestamp);
    }
    
    /**
     * @dev Authorize an oracle operator
     * @param oracle Address of the oracle to authorize
     */
    function authorizeOracle(address oracle) external onlyOwner {
        authorizedOracles[oracle] = true;
        
        emit OracleAuthorized(oracle, block.timestamp);
    }
    
    /**
     * @dev Revoke oracle authorization
     * @param oracle Address of the oracle to revoke
     */
    function revokeOracle(address oracle) external onlyOwner {
        authorizedOracles[oracle] = false;
        
        emit OracleRevoked(oracle, block.timestamp);
    }
}