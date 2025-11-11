// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AIZRegistry.sol";
import "./IConsciousDecisionLogger.sol";

/**
 * @title SocialGraphRegistry
 * @dev Registry for agent collaboration and skill sharing
 * Part of the Agent's Social Graph application
 */
contract SocialGraphRegistry is Ownable {
    // Reference to the AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Reference to the Conscious Decision Logger
    IConsciousDecisionLogger public decisionLogger;
    
    // Agent profile structure
    struct AgentProfile {
        string agentId;
        string name;
        string[] skills;
        uint256 trustScore;
        address owner;
        bool registered;
    }
    
    // Mapping of agent IDs to profiles
    mapping(string => AgentProfile) public agentProfiles;
    
    // Mapping of skills to agent IDs
    mapping(string => string[]) public skillIndex;
    
    // Collaboration relationships
    mapping(string => mapping(string => bool)) public collaborations;
    
    // Trust scores based on interactions
    mapping(string => mapping(string => uint256)) public trustScores;
    
    event AgentRegistered(
        string indexed agentId,
        string name,
        address indexed owner,
        uint256 timestamp
    );
    
    event SkillAdded(
        string indexed agentId,
        string skill,
        uint256 timestamp
    );
    
    event CollaborationEstablished(
        string indexed agent1,
        string indexed agent2,
        uint256 timestamp
    );
    
    event TrustScoreUpdated(
        string indexed agentId,
        string indexed evaluator,
        uint256 score,
        uint256 timestamp
    );
    
    constructor(address _aizRegistry, address _decisionLogger) {
        aizRegistry = AIZRegistry(_aizRegistry);
        decisionLogger = IConsciousDecisionLogger(_decisionLogger);
    }
    
    /**
     * @dev Register an agent profile
     * @param agentId ID of the agent
     * @param name Name of the agent
     * @param skills Initial skills of the agent
     */
    function registerAgent(
        string calldata agentId,
        string calldata name,
        string[] calldata skills
    ) external {
        // Verify that the agent is not already registered
        require(!agentProfiles[agentId].registered, "Agent already registered");
        
        // Create agent profile
        AgentProfile storage profile = agentProfiles[agentId];
        profile.agentId = agentId;
        profile.name = name;
        profile.trustScore = 500; // Default trust score
        profile.owner = msg.sender;
        profile.registered = true;
        
        // Add skills
        for (uint256 i = 0; i < skills.length; i++) {
            profile.skills.push(skills[i]);
            skillIndex[skills[i]].push(agentId);
            
            emit SkillAdded(agentId, skills[i], block.timestamp);
        }
        
        // Log the decision
        string[] memory collaborators = new string[](0);
        decisionLogger.logConsciousDecision(
            agentId,
            "Social Graph Registration",
            collaborators,
            "{}", // skillsJson
            "{}", // rolesJson
            string(abi.encodePacked('{"state":"registered","name":"', name, '"}')), // consciousnessState
            "agent_dna" // dnaExpression
        );
        
        emit AgentRegistered(agentId, name, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Add a skill to an agent
     * @param agentId ID of the agent
     * @param skill Skill to add
     */
    function addSkill(string calldata agentId, string calldata skill) external {
        AgentProfile storage profile = agentProfiles[agentId];
        
        // Verify that the caller is the agent owner
        require(profile.owner == msg.sender, "Only agent owner can add skills");
        require(profile.registered, "Agent not registered");
        
        // Add skill
        profile.skills.push(skill);
        skillIndex[skill].push(agentId);
        
        // Log the decision
        string[] memory collaborators = new string[](0);
        decisionLogger.logConsciousDecision(
            agentId,
            "Skill Addition",
            collaborators,
            "{}", // skillsJson
            "{}", // rolesJson
            string(abi.encodePacked('{"state":"skill_added","skill":"', skill, '"}')), // consciousnessState
            "agent_dna" // dnaExpression
        );
        
        emit SkillAdded(agentId, skill, block.timestamp);
    }
    
    /**
     * @dev Establish a collaboration between two agents
     * @param agent1 First agent ID
     * @param agent2 Second agent ID
     */
    function establishCollaboration(string calldata agent1, string calldata agent2) external {
        // Verify that both agents are registered
        require(agentProfiles[agent1].registered, "Agent 1 not registered");
        require(agentProfiles[agent2].registered, "Agent 2 not registered");
        
        // Establish collaboration
        collaborations[agent1][agent2] = true;
        collaborations[agent2][agent1] = true;
        
        // Log the decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = agent2;
        decisionLogger.logConsciousDecision(
            agent1,
            "Collaboration Established",
            collaborators,
            "{}", // skillsJson
            "{}", // rolesJson
            string(abi.encodePacked('{"state":"collaboration_established","partner":"', agent2, '"}')), // consciousnessState
            "agent_dna" // dnaExpression
        );
        
        emit CollaborationEstablished(agent1, agent2, block.timestamp);
    }
    
    /**
     * @dev Update trust score between agents
     * @param agentId ID of the agent being evaluated
     * @param evaluator ID of the evaluating agent
     * @param score Trust score (0-1000)
     */
    function updateTrustScore(string calldata agentId, string calldata evaluator, uint256 score) external {
        // Verify that both agents are registered
        require(agentProfiles[agentId].registered, "Agent not registered");
        require(agentProfiles[evaluator].registered, "Evaluator not registered");
        
        // Cap score at 1000
        if (score > 1000) {
            score = 1000;
        }
        
        // Update trust score
        trustScores[agentId][evaluator] = score;
        
        // Update overall trust score (simplified average)
        AgentProfile storage profile = agentProfiles[agentId];
        profile.trustScore = (profile.trustScore + score) / 2;
        
        // Log the decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = evaluator;
        decisionLogger.logConsciousDecision(
            agentId,
            "Trust Score Update",
            collaborators,
            "{}", // skillsJson
            "{}", // rolesJson
            string(abi.encodePacked('{"state":"trust_updated","evaluator":"', evaluator, '","score":', Strings.toString(score), '}')), // consciousnessState
            "agent_dna" // dnaExpression
        );
        
        emit TrustScoreUpdated(agentId, evaluator, score, block.timestamp);
    }
    
    /**
     * @dev Get agents with a specific skill
     * @param skill Skill to search for
     * @return Array of agent IDs with the skill
     */
    function getAgentsWithSkill(string calldata skill) external view returns (string[] memory) {
        return skillIndex[skill];
    }
    
    /**
     * @dev Get agent profile
     * @param agentId ID of the agent
     * @return Agent profile
     */
    function getAgentProfile(string calldata agentId) external view returns (AgentProfile memory) {
        return agentProfiles[agentId];
    }
}

/**
 * @title Strings
 * @dev String utility functions
 */
library Strings {
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}