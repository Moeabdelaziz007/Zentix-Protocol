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
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AIZRegistry.sol";
import "./ConsciousDecisionLogger.sol";

/**
 * @title AIZOrchestrator
 * @dev Base orchestrator contract for Autonomous AI Zones (AIZs)
 * Manages the core functionality of an AIZ including capability checking and decision logging
 */
contract AIZOrchestrator is Ownable, ReentrancyGuard {
    bytes32 public aizId;                           // Unique identifier for this AIZ
    AIZRegistry public aizRegistry;                 // Reference to the AIZ registry
    ConsciousDecisionLogger public decisionLogger;  // Reference to the decision logger
    string public aizName;                          // Human-readable name of the AIZ
    string public aizDescription;                   // Description of the AIZ's purpose
    
    // Events
    event AIZInitialized(
        bytes32 indexed aizId,
        string name,
        address aizRegistry,
        address decisionLogger
    );
    
    event CapabilityChecked(
        bytes32 indexed aizId,
        string capability,
        bool hasCapability
    );
    
    event AIZActionExecuted(
        bytes32 indexed aizId,
        string action,
        address executor
    );

    /**
     * @dev Constructor to initialize the AIZ orchestrator
     * @param _aizId Unique identifier for this AIZ
     * @param _aizRegistry Address of the AIZ registry contract
     * @param _decisionLogger Address of the decision logger contract
     * @param _aizName Human-readable name of the AIZ
     * @param _aizDescription Description of the AIZ's purpose
     */
    constructor(
        bytes32 _aizId,
        address _aizRegistry,
        address _decisionLogger,
        string memory _aizName,
        string memory _aizDescription
    ) {
        require(_aizId != bytes32(0), "AIZ ID cannot be zero");
        require(_aizRegistry != address(0), "AIZ registry address cannot be zero");
        require(_decisionLogger != address(0), "Decision logger address cannot be zero");
        require(bytes(_aizName).length > 0, "AIZ name cannot be empty");
        
        aizId = _aizId;
        aizRegistry = AIZRegistry(_aizRegistry);
        decisionLogger = ConsciousDecisionLogger(_decisionLogger);
        aizName = _aizName;
        aizDescription = _aizDescription;
        
        emit AIZInitialized(_aizId, _aizName, _aizRegistry, _decisionLogger);
    }
    
    /**
     * @dev Check if this AIZ has a specific capability
     * @param capability Name of the capability to check
     * @return Whether the AIZ has the capability
     */
    function hasCapability(string memory capability) public view returns (bool) {
        bool capabilityStatus = aizRegistry.hasCapability(aizId, capability);
        emit CapabilityChecked(aizId, capability, capabilityStatus);
        return capabilityStatus;
    }
    
    /**
     * @dev Get the limit for a specific capability of this AIZ
     * @param capability Name of the capability
     * @return Limit for the capability
     */
    function getCapabilityLimit(string memory capability) public view returns (uint256) {
        return aizRegistry.getCapabilityLimit(aizId, capability);
    }
    
    /**
     * @dev Require that this AIZ has a specific capability
     * @param capability Name of the capability required
     */
    function requireCapability(string memory capability) internal view {
        require(hasCapability(capability), "AIZ does not have required capability");
    }
    
    /**
     * @dev Log a conscious decision made by this AIZ
     * @param project The project name
     * @param collaborators Array of collaborator agent IDs
     * @param skillsJson JSON string of skills mapping
     * @param rolesJson JSON string of roles mapping
     * @param consciousnessState JSON string of consciousness state
     * @param dnaExpression DNA expression of the AIZ
     * @return Decision ID
     */
    function logConsciousDecision(
        string memory project,
        string[] memory collaborators,
        string memory skillsJson,
        string memory rolesJson,
        string memory consciousnessState,
        string memory dnaExpression
    ) internal returns (uint256) {
        return decisionLogger.logConsciousDecision(
            string(abi.encodePacked("AIZ-", aizName)),
            project,
            collaborators,
            skillsJson,
            rolesJson,
            consciousnessState,
            dnaExpression
        );
    }
    
    /**
     * @dev Execute an action after verifying capabilities
     * @param capability Required capability to execute the action
     * @param action Name of the action being executed
     */
    function executeActionWithCapability(
        string memory capability,
        string memory action
    ) internal {
        requireCapability(capability);
        emit AIZActionExecuted(aizId, action, msg.sender);
    }
    
    /**
     * @dev Get AIZ information
     * @return AIZ information
     */
    function getAIZInfo() external view returns (
        bytes32,
        string memory,
        string memory,
        address,
        bool
    ) {
        AIZRegistry.AIZInfo memory info = aizRegistry.getAIZ(aizId);
        return (
            info.aizId,
            info.name,
            info.description,
            info.orchestrator,
            info.isActive
        );
    }
    
    /**
     * @dev Get total capabilities granted to this AIZ
     * @return Count of capabilities
     */
    function getTotalCapabilities() external view returns (uint256) {
        AIZRegistry.AIZInfo memory info = aizRegistry.getAIZ(aizId);
        return info.capabilities.length;
    }
}