// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AIZRegistry.sol";
import "./IIntentBus.sol";
import "./IConsciousDecisionLogger.sol";

/**
 * @title AgentFoundry
 * @dev Factory contract for creating new AI agents
 * Part of the Zentix Agent Foundry application
 */
contract AgentFoundry is Ownable {
    // Reference to the AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Reference to the Intent Bus
    IIntentBus public intentBus;
    
    // Reference to the Conscious Decision Logger
    IConsciousDecisionLogger public decisionLogger;
    
    // Counter for created agents
    uint256 public agentCounter;
    
    // Mapping of agent IDs to creator addresses
    mapping(bytes32 => address) public agentCreators;
    
    // Mapping of creator addresses to their agent counts
    mapping(address => uint256) public creatorAgentCounts;
    
    event AgentCreated(
        bytes32 indexed agentId,
        address indexed creator,
        string name,
        uint256 timestamp
    );
    
    event AgentConfigurationUpdated(
        bytes32 indexed agentId,
        address indexed updater,
        string configuration,
        uint256 timestamp
    );
    
    constructor(address _aizRegistry, address _intentBus, address _decisionLogger) {
        aizRegistry = AIZRegistry(_aizRegistry);
        intentBus = IIntentBus(_intentBus);
        decisionLogger = IConsciousDecisionLogger(_decisionLogger);
    }
    
    /**
     * @dev Create a new AI agent
     * @param name Name of the agent
     * @param capabilities Array of function selectors this agent can handle
     * @param initialConfiguration Initial configuration data
     * @return bytes32 ID of the created agent
     */
    function createAgent(
        string calldata name,
        bytes4[] calldata capabilities,
        string calldata initialConfiguration
    ) external returns (bytes32) {
        // Generate agent ID
        agentCounter++;
        bytes32 agentId = keccak256(abi.encodePacked(msg.sender, name, agentCounter));
        
        // Register agent in AIZ Registry (simplified)
        // In a full implementation, this would deploy a new agent contract
        agentCreators[agentId] = msg.sender;
        creatorAgentCounts[msg.sender]++;
        
        // Log the decision
        string[] memory collaborators = new string[](0);
        decisionLogger.logConsciousDecision(
            string(abi.encodePacked(agentId)),
            "Agent Creation",
            collaborators,
            "{}", // skillsJson
            "{}", // rolesJson
            string(abi.encodePacked('{"state":"created","name":"', name, '"}')), // consciousnessState
            "agent_dna" // dnaExpression
        );
        
        emit AgentCreated(agentId, msg.sender, name, block.timestamp);
        
        return agentId;
    }
    
    /**
     * @dev Update agent configuration
     * @param agentId ID of the agent to configure
     * @param configuration New configuration data
     */
    function configureAgent(
        bytes32 agentId,
        string calldata configuration
    ) external {
        // Verify that the caller is the agent creator
        require(agentCreators[agentId] == msg.sender, "Only agent creator can configure agent");
        
        // Log the decision
        string[] memory collaborators = new string[](0);
        decisionLogger.logConsciousDecision(
            string(abi.encodePacked(agentId)),
            "Agent Configuration",
            collaborators,
            "{}", // skillsJson
            "{}", // rolesJson
            string(abi.encodePacked('{"state":"configured","config":"', configuration, '"}')), // consciousnessState
            "agent_dna" // dnaExpression
        );
        
        emit AgentConfigurationUpdated(agentId, msg.sender, configuration, block.timestamp);
    }
    
    /**
     * @dev Get the number of agents created by an address
     * @param creator Address of the creator
     * @return Number of agents created
     */
    function getAgentCountByCreator(address creator) external view returns (uint256) {
        return creatorAgentCounts[creator];
    }
}