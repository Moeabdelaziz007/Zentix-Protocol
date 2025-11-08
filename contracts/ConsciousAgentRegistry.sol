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
 * @title ConsciousAgentRegistry
 * @dev Registry for conscious AI agents across the Superchain
 * Provides discovery and verification of authorized agents
 */
contract ConsciousAgentRegistry is Ownable {
    struct AgentInfo {
        string agentId;
        string name;
        string description;
        string[] capabilities;
        uint256[] chainIds;
        address[] contractAddresses;
        uint256 registrationTimestamp;
        bool isActive;
    }
    
    // Mapping of agent IDs to agent info
    mapping(string => AgentInfo) public agents;
    
    // Mapping of chain IDs to contract addresses to agent IDs
    mapping(uint256 => mapping(address => string)) public contractToAgent;
    
    // List of all agent IDs
    string[] public agentIds;
    
    // Events
    event AgentRegistered(
        string indexed agentId,
        string name,
        uint256[] chainIds,
        address[] contractAddresses
    );
    
    event AgentUpdated(
        string indexed agentId,
        string name
    );
    
    event AgentDeactivated(string indexed agentId);
    event AgentReactivated(string indexed agentId);

    /**
     * @dev Register a new conscious agent
     * @param agentId Unique identifier for the agent
     * @param name Human-readable name of the agent
     * @param description Description of the agent's purpose
     * @param capabilities Array of agent capabilities
     * @param chainIds Array of chain IDs where the agent operates
     * @param contractAddresses Array of contract addresses (must match chainIds length)
     */
    function registerAgent(
        string calldata agentId,
        string calldata name,
        string calldata description,
        string[] calldata capabilities,
        uint256[] calldata chainIds,
        address[] calldata contractAddresses
    ) external onlyOwner {
        require(bytes(agentId).length > 0, "Agent ID cannot be empty");
        require(bytes(name).length > 0, "Agent name cannot be empty");
        require(chainIds.length == contractAddresses.length, "Chain IDs and addresses length mismatch");
        require(bytes(agents[agentId].agentId).length == 0, "Agent already registered");
        
        // Create copies of arrays
        string[] memory capabilitiesCopy = new string[](capabilities.length);
        for (uint i = 0; i < capabilities.length; i++) {
            capabilitiesCopy[i] = capabilities[i];
        }
        
        uint256[] memory chainIdsCopy = new uint256[](chainIds.length);
        for (uint i = 0; i < chainIds.length; i++) {
            chainIdsCopy[i] = chainIds[i];
        }
        
        address[] memory contractAddressesCopy = new address[](contractAddresses.length);
        for (uint i = 0; i < contractAddresses.length; i++) {
            contractAddressesCopy[i] = contractAddresses[i];
        }
        
        // Store agent info
        agents[agentId] = AgentInfo({
            agentId: agentId,
            name: name,
            description: description,
            capabilities: capabilitiesCopy,
            chainIds: chainIdsCopy,
            contractAddresses: contractAddressesCopy,
            registrationTimestamp: block.timestamp,
            isActive: true
        });
        
        // Map contract addresses to agent ID
        for (uint i = 0; i < chainIds.length; i++) {
            contractToAgent[chainIds[i]][contractAddresses[i]] = agentId;
        }
        
        agentIds.push(agentId);
        
        emit AgentRegistered(agentId, name, chainIds, contractAddresses);
    }
    
    /**
     * @dev Update an existing agent's information
     * @param agentId Unique identifier for the agent
     * @param name Human-readable name of the agent
     * @param description Description of the agent's purpose
     * @param capabilities Array of agent capabilities
     */
    function updateAgent(
        string calldata agentId,
        string calldata name,
        string calldata description,
        string[] calldata capabilities
    ) external onlyOwner {
        require(bytes(agents[agentId].agentId).length > 0, "Agent not registered");
        
        AgentInfo storage agent = agents[agentId];
        agent.name = name;
        agent.description = description;
        
        // Update capabilities
        delete agent.capabilities;
        for (uint i = 0; i < capabilities.length; i++) {
            agent.capabilities.push(capabilities[i]);
        }
        
        emit AgentUpdated(agentId, name);
    }
    
    /**
     * @dev Add a new chain deployment for an existing agent
     * @param agentId Unique identifier for the agent
     * @param chainId Chain ID where the agent operates
     * @param contractAddress Contract address on that chain
     */
    function addAgentChain(
        string calldata agentId,
        uint256 chainId,
        address contractAddress
    ) external onlyOwner {
        require(bytes(agents[agentId].agentId).length > 0, "Agent not registered");
        
        AgentInfo storage agent = agents[agentId];
        agent.chainIds.push(chainId);
        agent.contractAddresses.push(contractAddress);
        
        // Map contract address to agent ID
        contractToAgent[chainId][contractAddress] = agentId;
    }
    
    /**
     * @dev Deactivate an agent
     * @param agentId Unique identifier for the agent
     */
    function deactivateAgent(string calldata agentId) external onlyOwner {
        require(bytes(agents[agentId].agentId).length > 0, "Agent not registered");
        agents[agentId].isActive = false;
        emit AgentDeactivated(agentId);
    }
    
    /**
     * @dev Reactivate an agent
     * @param agentId Unique identifier for the agent
     */
    function reactivateAgent(string calldata agentId) external onlyOwner {
        require(bytes(agents[agentId].agentId).length > 0, "Agent not registered");
        agents[agentId].isActive = true;
        emit AgentReactivated(agentId);
    }
    
    /**
     * @dev Get agent information by ID
     * @param agentId Unique identifier for the agent
     * @return Agent information
     */
    function getAgent(string calldata agentId) external view returns (AgentInfo memory) {
        return agents[agentId];
    }
    
    /**
     * @dev Get agent ID by chain ID and contract address
     * @param chainId Chain ID
     * @param contractAddress Contract address
     * @return Agent ID
     */
    function getAgentByContract(uint256 chainId, address contractAddress) external view returns (string memory) {
        return contractToAgent[chainId][contractAddress];
    }
    
    /**
     * @dev Check if an agent is active
     * @param agentId Unique identifier for the agent
     * @return Whether the agent is active
     */
    function isAgentActive(string calldata agentId) external view returns (bool) {
        return agents[agentId].isActive;
    }
    
    /**
     * @dev Get total number of registered agents
     * @return Count of agents
     */
    function getTotalAgents() external view returns (uint256) {
        return agentIds.length;
    }
    
    /**
     * @dev Get agent IDs in a range
     * @param start Start index
     * @param count Number of IDs to retrieve
     * @return Array of agent IDs
     */
    function getAgentIds(uint256 start, uint256 count) external view returns (string[] memory) {
        require(start < agentIds.length, "Start index out of bounds");
        uint256 end = start + count;
        if (end > agentIds.length) {
            end = agentIds.length;
        }
        
        string[] memory result = new string[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = agentIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Check if a contract is authorized to represent an agent
     * @param chainId Chain ID
     * @param contractAddress Contract address
     * @return Whether the contract is authorized
     */
    function isAuthorizedAgentContract(uint256 chainId, address contractAddress) external view returns (bool) {
        string memory agentId = contractToAgent[chainId][contractAddress];
        if (bytes(agentId).length == 0) {
            return false;
        }
        return agents[agentId].isActive;
    }
}