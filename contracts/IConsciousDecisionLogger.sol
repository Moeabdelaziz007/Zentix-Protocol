// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IConsciousDecisionLogger
 * @dev Interface for logging conscious AI agent decisions
 * Part of the AIZ Framework for Proof of Consciousness
 */
interface IConsciousDecisionLogger {
    struct ConsciousDecision {
        string agentId;
        string project;
        string[] collaborators;
        string skillsJson;
        string rolesJson;
        string consciousnessState;
        string dnaExpression;
        uint256 timestamp;
        address executor;
        uint256 sourceChainId;
        address sourceContract;
    }

    event ConsciousDecisionLogged(
        uint256 indexed decisionId,
        string agentId,
        string project,
        uint256 timestamp,
        address indexed executor
    );

    event ConsciousDecisionExecuted(
        uint256 indexed decisionId,
        string agentId,
        string project,
        uint256 timestamp,
        address indexed executor
    );
    
    event CrossChainDecisionInitiated(
        uint256 indexed decisionId,
        uint256 indexed destinationChainId,
        address indexed destinationContract,
        uint256 nonce
    );
    
    event CrossChainDecisionReceived(
        uint256 indexed decisionId,
        uint256 indexed sourceChainId,
        address indexed sourceContract
    );

    /**
     * @dev Log a conscious decision made by an AI agent
     * @param agentId The ID of the agent making the decision
     * @param project The project name
     * @param collaborators Array of collaborator agent IDs
     * @param skillsJson JSON string of skills mapping
     * @param rolesJson JSON string of roles mapping
     * @param consciousnessState JSON string of consciousness state
     * @param dnaExpression DNA expression of the agent
     */
    function logConsciousDecision(
        string calldata agentId,
        string calldata project,
        string[] calldata collaborators,
        string calldata skillsJson,
        string calldata rolesJson,
        string calldata consciousnessState,
        string calldata dnaExpression
    ) external returns (uint256);
    
    /**
     * @dev Log a conscious decision received from another chain
     * @param agentId The ID of the agent making the decision
     * @param project The project name
     * @param collaborators Array of collaborator agent IDs
     * @param skillsJson JSON string of skills mapping
     * @param rolesJson JSON string of roles mapping
     * @param consciousnessState JSON string of consciousness state
     * @param dnaExpression DNA expression of the agent
     */
    function logCrossChainDecision(
        string calldata agentId,
        string calldata project,
        string[] calldata collaborators,
        string calldata skillsJson,
        string calldata rolesJson,
        string calldata consciousnessState,
        string calldata dnaExpression
    ) external;
    
    /**
     * @dev Send a conscious decision to another chain
     * @param destinationChainId Chain ID of the destination
     * @param destinationContract Address of the contract on the destination chain
     * @param decisionId ID of the decision to send
     */
    function sendDecisionToChain(
        uint256 destinationChainId,
        address destinationContract,
        uint256 decisionId
    ) external;
    
    /**
     * @dev Mark a conscious decision as executed
     * @param decisionId The ID of the decision to mark as executed
     */
    function executeDecision(uint256 decisionId) external;
    
    /**
     * @dev Get a conscious decision by ID
     * @param decisionId The ID of the decision to retrieve
     * @return The conscious decision
     */
    function getDecision(uint256 decisionId) external view returns (ConsciousDecision memory);
    
    /**
     * @dev Get total number of decisions logged
     * @return Count of decisions
     */
    function getTotalDecisions() external view returns (uint256);
    
    /**
     * @dev Get decision IDs in a range
     * @param start Start index
     * @param count Number of IDs to retrieve
     * @return Array of decision IDs
     */
    function getDecisionIds(uint256 start, uint256 count) external view returns (uint256[] memory);
}