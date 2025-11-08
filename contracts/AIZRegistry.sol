/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AIZRegistry
 * @dev Registry for Autonomous AI Zones (AIZs) across the Superchain
 * Provides discovery, verification, capability-based access control, and centralized management for AIZs
 */
contract AIZRegistry is Ownable {
    struct AIZInfo {
        bytes32 aizId;                    // Unique identifier for the AIZ
        string name;                      // Human-readable name of the AIZ
        string description;               // Description of the AIZ's purpose
        address orchestrator;             // Address of the AIZ orchestrator contract
        uint256[] chainIds;               // Chain IDs where the AIZ operates
        address[] contractAddresses;      // Contract addresses on each chain
        uint256 registrationTimestamp;    // When the AIZ was registered
        bool isActive;                    // Whether the AIZ is active
    }
    
    // Mapping of AIZ IDs to AIZ info
    mapping(bytes32 => AIZInfo) public aizs;
    
    // Mapping of chain IDs to contract addresses to AIZ IDs
    mapping(uint256 => mapping(address => bytes32)) public contractToAIZ;
    
    // Mapping of AIZ IDs to capabilities (function selectors)
    mapping(bytes32 => mapping(bytes4 => bool)) public aizCapabilities;
    
    // Mapping of AIZ IDs to authorized operators
    mapping(bytes32 => mapping(address => bool)) public aizOperators;
    
    // List of all AIZ IDs
    bytes32[] public aizIds;
    
    // Events
    event AIZRegistered(
        bytes32 indexed aizId,
        string name,
        address indexed orchestrator,
        uint256[] chainIds,
        address[] contractAddresses,
        uint256 timestamp
    );
    
    event AIZUpdated(
        bytes32 indexed aizId,
        string name,
        address orchestrator,
        uint256 timestamp
    );
    
    event AIZDeactivated(bytes32 indexed aizId, uint256 timestamp);
    event AIZReactivated(bytes32 indexed aizId, uint256 timestamp);
    
    event CapabilityUpdated(
        bytes32 indexed aizId, 
        bytes4 indexed capability, 
        bool hasAccess,
        uint256 timestamp
    );
    
    event OperatorAdded(
        bytes32 indexed aizId, 
        address indexed operator,
        uint256 timestamp
    );
    
    event OperatorRemoved(
        bytes32 indexed aizId, 
        address indexed operator,
        uint256 timestamp
    );

    /**
     * @dev Register a new AIZ
     * @param aizId Unique identifier for the AIZ
     * @param name Human-readable name of the AIZ
     * @param description Description of the AIZ's purpose
     * @param orchestrator Address of the AIZ orchestrator contract
     * @param chainIds Array of chain IDs where the AIZ operates
     * @param contractAddresses Array of contract addresses (must match chainIds length)
     */
    function registerAIZ(
        bytes32 aizId,
        string calldata name,
        string calldata description,
        address orchestrator,
        uint256[] calldata chainIds,
        address[] calldata contractAddresses
    ) external onlyOwner {
        require(aizId != bytes32(0), "AIZ ID cannot be zero");
        require(bytes(name).length > 0, "AIZ name cannot be empty");
        require(orchestrator != address(0), "Orchestrator address cannot be zero");
        require(chainIds.length == contractAddresses.length, "Chain IDs and addresses length mismatch");
        require(aizs[aizId].registrationTimestamp == 0, "AIZ already registered");
        
        // Create copies of arrays
        uint256[] memory chainIdsCopy = new uint256[](chainIds.length);
        for (uint i = 0; i < chainIds.length; i++) {
            chainIdsCopy[i] = chainIds[i];
        }
        
        address[] memory contractAddressesCopy = new address[](contractAddresses.length);
        for (uint i = 0; i < contractAddresses.length; i++) {
            contractAddressesCopy[i] = contractAddresses[i];
        }
        
        // Store AIZ info
        aizs[aizId] = AIZInfo({
            aizId: aizId,
            name: name,
            description: description,
            orchestrator: orchestrator,
            chainIds: chainIdsCopy,
            contractAddresses: contractAddressesCopy,
            registrationTimestamp: block.timestamp,
            isActive: true
        });
        
        // Map contract addresses to AIZ ID
        for (uint i = 0; i < chainIds.length; i++) {
            contractToAIZ[chainIds[i]][contractAddresses[i]] = aizId;
        }
        
        // Add the owner as an initial operator
        aizOperators[aizId][msg.sender] = true;
        
        aizIds.push(aizId);
        
        emit AIZRegistered(aizId, name, orchestrator, chainIds, contractAddresses, block.timestamp);
    }
    
    /**
     * @dev Update an existing AIZ's information
     * @param aizId Unique identifier for the AIZ
     * @param name Human-readable name of the AIZ
     * @param description Description of the AIZ's purpose
     * @param orchestrator Address of the AIZ orchestrator contract
     */
    function updateAIZ(
        bytes32 aizId,
        string calldata name,
        string calldata description,
        address orchestrator
    ) external {
        require(isAIZOperator(aizId, msg.sender), "Only AIZ operators can update");
        require(aizs[aizId].registrationTimestamp > 0, "AIZ not registered");
        
        AIZInfo storage aiz = aizs[aizId];
        aiz.name = name;
        aiz.description = description;
        aiz.orchestrator = orchestrator;
        
        emit AIZUpdated(aizId, name, orchestrator, block.timestamp);
    }
    
    /**
     * @dev Add a new chain deployment for an existing AIZ
     * @param aizId Unique identifier for the AIZ
     * @param chainId Chain ID where the AIZ operates
     * @param contractAddress Contract address on that chain
     */
    function addAIZChain(
        bytes32 aizId,
        uint256 chainId,
        address contractAddress
    ) external {
        require(isAIZOperator(aizId, msg.sender), "Only AIZ operators can add chains");
        require(aizs[aizId].registrationTimestamp > 0, "AIZ not registered");
        
        AIZInfo storage aiz = aizs[aizId];
        aiz.chainIds.push(chainId);
        aiz.contractAddresses.push(contractAddress);
        
        // Map contract address to AIZ ID
        contractToAIZ[chainId][contractAddress] = aizId;
    }
    
    /**
     * @dev Set a capability for an AIZ
     * @param aizId Unique identifier for the AIZ
     * @param capability Function selector for the capability
     * @param hasAccess Whether the AIZ has access to this capability
     */
    function setCapability(
        bytes32 aizId, 
        bytes4 capability, 
        bool hasAccess
    ) external onlyOwner {
        require(aizs[aizId].registrationTimestamp > 0, "AIZ not registered");
        
        aizCapabilities[aizId][capability] = hasAccess;
        
        emit CapabilityUpdated(aizId, capability, hasAccess, block.timestamp);
    }
    
    /**
     * @dev Check if an AIZ has a specific capability
     * @param aizId Unique identifier for the AIZ
     * @param capability Function selector for the capability
     * @return bool Whether the AIZ has access to this capability
     */
    function checkCapability(bytes32 aizId, bytes4 capability) external view returns (bool) {
        return aizCapabilities[aizId][capability];
    }
    
    /**
     * @dev Add an operator for an AIZ
     * @param aizId Unique identifier for the AIZ
     * @param operator Address of the operator
     */
    function addOperator(bytes32 aizId, address operator) external {
        require(isAIZOperator(aizId, msg.sender), "Only AIZ operators can add operators");
        require(operator != address(0), "Operator address cannot be zero");
        
        aizOperators[aizId][operator] = true;
        
        emit OperatorAdded(aizId, operator, block.timestamp);
    }
    
    /**
     * @dev Remove an operator for an AIZ
     * @param aizId Unique identifier for the AIZ
     * @param operator Address of the operator
     */
    function removeOperator(bytes32 aizId, address operator) external {
        require(isAIZOperator(aizId, msg.sender), "Only AIZ operators can remove operators");
        
        aizOperators[aizId][operator] = false;
        
        emit OperatorRemoved(aizId, operator, block.timestamp);
    }
    
    /**
     * @dev Check if an address is an operator for an AIZ
     * @param aizId Unique identifier for the AIZ
     * @param operator Address to check
     * @return bool Whether the address is an operator for the AIZ
     */
    function isAIZOperator(bytes32 aizId, address operator) public view returns (bool) {
        return aizOperators[aizId][operator] || aizs[aizId].orchestrator == operator;
    }
    
    /**
     * @dev Deactivate an AIZ
     * @param aizId Unique identifier for the AIZ
     */
    function deactivateAIZ(bytes32 aizId) external {
        require(isAIZOperator(aizId, msg.sender), "Only AIZ operators can deactivate");
        require(aizs[aizId].registrationTimestamp > 0, "AIZ not registered");
        
        aizs[aizId].isActive = false;
        emit AIZDeactivated(aizId, block.timestamp);
    }
    
    /**
     * @dev Reactivate an AIZ
     * @param aizId Unique identifier for the AIZ
     */
    function reactivateAIZ(bytes32 aizId) external {
        require(isAIZOperator(aizId, msg.sender), "Only AIZ operators can reactivate");
        require(aizs[aizId].registrationTimestamp > 0, "AIZ not registered");
        
        aizs[aizId].isActive = true;
        emit AIZReactivated(aizId, block.timestamp);
    }
    
    /**
     * @dev Get AIZ information by ID
     * @param aizId Unique identifier for the AIZ
     * @return AIZ information
     */
    function getAIZ(bytes32 aizId) external view returns (AIZInfo memory) {
        return aizs[aizId];
    }
    
    /**
     * @dev Get AIZ ID by chain ID and contract address
     * @param chainId Chain ID
     * @param contractAddress Contract address
     * @return AIZ ID
     */
    function getAIZByContract(uint256 chainId, address contractAddress) external view returns (bytes32) {
        return contractToAIZ[chainId][contractAddress];
    }
    
    /**
     * @dev Check if an AIZ is active
     * @param aizId Unique identifier for the AIZ
     * @return Whether the AIZ is active
     */
    function isAIZActive(bytes32 aizId) external view returns (bool) {
        return aizs[aizId].isActive;
    }
    
    /**
     * @dev Get total number of registered AIZs
     * @return Count of AIZs
     */
    function getTotalAIZs() external view returns (uint256) {
        return aizIds.length;
    }
    
    /**
     * @dev Get AIZ IDs in a range
     * @param start Start index
     * @param count Number of IDs to retrieve
     * @return Array of AIZ IDs
     */
    function getAIZIds(uint256 start, uint256 count) external view returns (bytes32[] memory) {
        require(start < aizIds.length, "Start index out of bounds");
        uint256 end = start + count;
        if (end > aizIds.length) {
            end = aizIds.length;
        }
        
        bytes32[] memory result = new bytes32[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = aizIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Check if a contract is authorized to represent an AIZ
     * @param chainId Chain ID
     * @param contractAddress Contract address
     * @return Whether the contract is authorized
     */
    function isAuthorizedAIZContract(uint256 chainId, address contractAddress) external view returns (bool) {
        bytes32 aizId = contractToAIZ[chainId][contractAddress];
        if (aizId == bytes32(0)) {
            return false;
        }
        return aizs[aizId].isActive;
    }
}