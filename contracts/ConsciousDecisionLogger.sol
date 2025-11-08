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
import {IL2ToL2CrossDomainMessenger} from "@eth-optimism/contracts-bedrock/src/L2/interfaces/IL2ToL2CrossDomainMessenger.sol";
import "./AIZRegistry.sol";

/**
 * @title ConsciousDecisionLogger
 * @dev Smart contract for logging conscious AI agent decisions on-chain with cross-chain messaging capabilities
 * Records decisions made by conscious agents as immutable evidence of their awareness
 */
contract ConsciousDecisionLogger is Ownable {
    // Reference to the L2ToL2CrossDomainMessenger
    IL2ToL2CrossDomainMessenger public crossDomainMessenger;
    
    // Reference to the AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Mapping of authorized agent contracts on other chains
    mapping(address => bool) public authorizedSenders;
    
    struct ConsciousDecision {
        string agentId;
        string project;
        string[] collaborators;
        string skillsJson; // JSON string representation of skills mapping
        string rolesJson;  // JSON string representation of roles mapping
        string consciousnessState;
        string dnaExpression;
        uint256 timestamp;
        address executor;
        // Cross-chain fields
        uint256 sourceChainId;
        address sourceContract;
    }

    // Mapping of decision IDs to decisions
    mapping(uint256 => ConsciousDecision) public decisions;
    
    // Counter for decision IDs
    uint256 public decisionCounter;
    
    // All decision IDs
    uint256[] public decisionIds;

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
    
    // Cross-chain events
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
     * @dev Constructor to initialize the contract with cross-domain messenger and AIZ registry
     * @param _crossDomainMessenger Address of the L2ToL2CrossDomainMessenger
     * @param _aizRegistry Address of the AIZRegistry
     */
    constructor(address _crossDomainMessenger, address _aizRegistry) {
        crossDomainMessenger = IL2ToL2CrossDomainMessenger(_crossDomainMessenger);
        aizRegistry = AIZRegistry(_aizRegistry);
    }

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
    ) external returns (uint256) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        decisionCounter++;
        uint256 decisionId = decisionCounter;
        
        // Create a copy of the collaborators array
        string[] memory collabCopy = new string[](collaborators.length);
        for (uint i = 0; i < collaborators.length; i++) {
            collabCopy[i] = collaborators[i];
        }
        
        decisions[decisionId] = ConsciousDecision({
            agentId: agentId,
            project: project,
            collaborators: collabCopy,
            skillsJson: skillsJson,
            rolesJson: rolesJson,
            consciousnessState: consciousnessState,
            dnaExpression: dnaExpression,
            timestamp: block.timestamp,
            executor: msg.sender,
            sourceChainId: 0, // Local decision
            sourceContract: address(0) // Local decision
        });
        
        decisionIds.push(decisionId);
        
        emit ConsciousDecisionLogged(
            decisionId,
            agentId,
            project,
            block.timestamp,
            msg.sender
        );
        
        return decisionId;
    }
    
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
    ) external {
        // Verify the sender is authorized
        require(authorizedSenders[msg.sender], "Unauthorized cross-chain sender");
        
        // Get source information from the messenger
        uint256 sourceChainId = crossDomainMessenger.xDomainMessageSenderChain();
        address sourceContract = crossDomainMessenger.xDomainMessageSender();
        
        decisionCounter++;
        uint256 decisionId = decisionCounter;
        
        // Create a copy of the collaborators array
        string[] memory collabCopy = new string[](collaborators.length);
        for (uint i = 0; i < collaborators.length; i++) {
            collabCopy[i] = collaborators[i];
        }
        
        decisions[decisionId] = ConsciousDecision({
            agentId: agentId,
            project: project,
            collaborators: collabCopy,
            skillsJson: skillsJson,
            rolesJson: rolesJson,
            consciousnessState: consciousnessState,
            dnaExpression: dnaExpression,
            timestamp: block.timestamp,
            executor: msg.sender,
            sourceChainId: sourceChainId,
            sourceContract: sourceContract
        });
        
        decisionIds.push(decisionId);
        
        emit ConsciousDecisionLogged(
            decisionId,
            agentId,
            project,
            block.timestamp,
            msg.sender
        );
        
        emit CrossChainDecisionReceived(
            decisionId,
            sourceChainId,
            sourceContract
        );
    }
    
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
    ) external {
        require(decisionId > 0 && decisionId <= decisionCounter, "Invalid decision ID");
        ConsciousDecision storage decision = decisions[decisionId];
        require(decision.timestamp > 0, "Decision does not exist");
        
        // Prepare calldata for the destination contract
        bytes memory message = abi.encodeWithSelector(
            this.logCrossChainDecision.selector,
            decision.agentId,
            decision.project,
            decision.collaborators,
            decision.skillsJson,
            decision.rolesJson,
            decision.consciousnessState,
            decision.dnaExpression
        );
        
        // Send the message via the cross-domain messenger
        uint256 nonce = crossDomainMessenger.sendMessage(
            destinationChainId,
            destinationContract,
            message,
            1000000 // Gas limit
        );
        
        emit CrossChainDecisionInitiated(
            decisionId,
            destinationChainId,
            destinationContract,
            nonce
        );
    }
    
    /**
     * @dev Authorize a sender contract on another chain
     * @param sender Address of the sender contract
     */
    function authorizeSender(address sender) external onlyOwner {
        authorizedSenders[sender] = true;
    }
    
    /**
     * @dev Revoke authorization from a sender contract
     * @param sender Address of the sender contract
     */
    function revokeSenderAuthorization(address sender) external onlyOwner {
        authorizedSenders[sender] = false;
    }
    
    /**
     * @dev Mark a conscious decision as executed
     * @param decisionId The ID of the decision to mark as executed
     */
    function executeDecision(uint256 decisionId) external {
        require(decisionId > 0 && decisionId <= decisionCounter, "Invalid decision ID");
        ConsciousDecision storage decision = decisions[decisionId];
        require(decision.timestamp > 0, "Decision does not exist");
        
        emit ConsciousDecisionExecuted(
            decisionId,
            decision.agentId,
            decision.project,
            decision.timestamp,
            msg.sender
        );
    }
    
    /**
     * @dev Get a conscious decision by ID
     * @param decisionId The ID of the decision to retrieve
     * @return The conscious decision
     */
    function getDecision(uint256 decisionId) external view returns (ConsciousDecision memory) {
        return decisions[decisionId];
    }
    
    /**
     * @dev Get total number of decisions logged
     * @return Count of decisions
     */
    function getTotalDecisions() external view returns (uint256) {
        return decisionIds.length;
    }
    
    /**
     * @dev Get decision IDs in a range
     * @param start Start index
     * @param count Number of IDs to retrieve
     * @return Array of decision IDs
     */
    function getDecisionIds(uint256 start, uint256 count) external view returns (uint256[] memory) {
        require(start < decisionIds.length, "Start index out of bounds");
        uint256 end = start + count;
        if (end > decisionIds.length) {
            end = decisionIds.length;
        }
        
        uint256[] memory result = new uint256[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = decisionIds[i];
        }
        
        return result;
    }
}