// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./AIZRegistry.sol";
import "./ConsciousDecisionLogger.sol";
import "./IntentBus.sol";
import "./DynamicReputationProtocol.sol";
import "./MetaSelfMonitoringAIZ.sol";

/**
 * @title EnhancedAIZOrchestrator
 * @dev Enhanced base orchestrator contract for Autonomous AI Zones (AIZs)
 * Integrates all core AIZ protocol components for seamless interoperability
 */
contract EnhancedAIZOrchestrator is Ownable, ReentrancyGuard {
    bytes32 public aizId;                           // Unique identifier for this AIZ
    AIZRegistry public aizRegistry;                 // Reference to the AIZ registry
    ConsciousDecisionLogger public decisionLogger;  // Reference to the decision logger
    IntentBus public intentBus;                     // Reference to the intent bus
    DynamicReputationProtocol public reputationProtocol; // Reference to the reputation protocol
    MetaSelfMonitoringAIZ public selfMonitoring;    // Reference to the self-monitoring AIZ
    
    string public aizName;                          // Human-readable name of the AIZ
    string public aizDescription;                   // Description of the AIZ's purpose
    uint256 public chainId;                         // Chain ID where this AIZ operates
    
    // Performance tracking
    uint256 public totalOperations;
    uint256 public successfulOperations;
    uint256 public failedOperations;
    uint256 public totalGasUsed;
    
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
        address executor,
        uint256 gasUsed
    );
    
    event PerformanceMetricsUpdated(
        uint256 totalOperations,
        uint256 successRate,
        uint256 avgGasUsed
    );

    /**
     * @dev Constructor to initialize the enhanced AIZ orchestrator
     * @param _aizId Unique identifier for this AIZ
     * @param _aizRegistry Address of the AIZ registry contract
     * @param _decisionLogger Address of the decision logger contract
     * @param _intentBus Address of the intent bus contract
     * @param _reputationProtocol Address of the reputation protocol contract
     * @param _selfMonitoring Address of the self-monitoring AIZ contract
     * @param _aizName Human-readable name of the AIZ
     * @param _aizDescription Description of the AIZ's purpose
     */
    constructor(
        bytes32 _aizId,
        address _aizRegistry,
        address _decisionLogger,
        address _intentBus,
        address _reputationProtocol,
        address _selfMonitoring,
        string memory _aizName,
        string memory _aizDescription
    ) {
        require(_aizId != bytes32(0), "AIZ ID cannot be zero");
        require(_aizRegistry != address(0), "AIZ registry address cannot be zero");
        require(_decisionLogger != address(0), "Decision logger address cannot be zero");
        require(_aizName != "", "AIZ name cannot be empty");
        
        aizId = _aizId;
        aizRegistry = AIZRegistry(_aizRegistry);
        decisionLogger = ConsciousDecisionLogger(_decisionLogger);
        intentBus = IntentBus(_intentBus);
        reputationProtocol = DynamicReputationProtocol(_reputationProtocol);
        selfMonitoring = MetaSelfMonitoringAIZ(_selfMonitoring);
        aizName = _aizName;
        aizDescription = _aizDescription;
        chainId = block.chainid;
        
        emit AIZInitialized(_aizId, _aizName, _aizRegistry, _decisionLogger);
    }
    
    /**
     * @dev Check if this AIZ has a specific capability
     * @param capability Name of the capability to check
     * @return Whether the AIZ has the capability
     */
    function hasCapability(string memory capability) public view returns (bool) {
        bytes4 functionSelector = getFunctionSelector(capability);
        bool capabilityStatus = aizRegistry.checkCapability(aizId, functionSelector);
        emit CapabilityChecked(aizId, capability, capabilityStatus);
        return capabilityStatus;
    }
    
    /**
     * @dev Get the limit for a specific capability of this AIZ
     * @param capability Name of the capability
     * @return Limit for the capability
     */
    function getCapabilityLimit(string memory capability) public view returns (uint256) {
        // For now, we're not implementing limits, but this could be extended
        return type(uint256).max;
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
     * @dev Execute an action after verifying capabilities and tracking performance
     * @param capability Required capability to execute the action
     * @param action Name of the action being executed
     */
    function executeActionWithCapability(
        string memory capability,
        string memory action
    ) internal {
        requireCapability(capability);
        
        // Track performance metrics
        totalOperations++;
        
        uint256 gasStart = gasleft();
        emit AIZActionExecuted(aizId, action, msg.sender, 0);
        uint256 gasUsed = gasStart - gasleft();
        
        totalGasUsed += gasUsed;
        
        // Update self-monitoring metrics
        selfMonitoring.updatePerformanceMetrics(
            1, // operationsCount
            1, // successCount
            0, // failedCount
            gasUsed, // avgResponseTimeMs
            0 // memoryUsageMb (not tracked on-chain)
        );
        
        // Update performance metrics event
        emit PerformanceMetricsUpdated(
            totalOperations,
            (successfulOperations * 100) / totalOperations,
            totalGasUsed / totalOperations
        );
    }
    
    /**
     * @dev Record a successful operation
     */
    function recordSuccess() internal {
        successfulOperations++;
        
        // Update reputation for successful operation
        if (address(reputationProtocol) != address(0)) {
            // This would require implementing a method in DynamicReputationProtocol
            // reputationProtocol.updateReputation(aizId, 1, "Successful operation", bytes32(0));
        }
    }
    
    /**
     * @dev Record a failed operation
     * @param reason Reason for the failure
     */
    function recordFailure(string memory reason) internal {
        failedOperations++;
        
        // Update reputation for failed operation
        if (address(reputationProtocol) != address(0)) {
            // This would require implementing a method in DynamicReputationProtocol
            // reputationProtocol.updateReputation(aizId, -1, reason, bytes32(0));
        }
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
    
    /**
     * @dev Get performance metrics
     * @return Performance metrics
     */
    function getPerformanceMetrics() external view returns (
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        return (
            totalOperations,
            successfulOperations,
            failedOperations,
            totalOperations > 0 ? (totalGasUsed / totalOperations) : 0
        );
    }
    
    /**
     * @dev Get function selector for a capability string
     * @param capability Capability string
     * @return Function selector
     */
    function getFunctionSelector(string memory capability) internal pure returns (bytes4) {
        return bytes4(keccak256(bytes(capability)));
    }
    
    /**
     * @dev Post an intent to the IntentBus
     * @param data Intent data
     * @param expiry Expiry timestamp
     * @param reward Reward for solving the intent
     * @param rewardToken Token address for reward
     * @return Intent ID
     */
    function postIntent(
        bytes memory data,
        uint256 expiry,
        uint256 reward,
        address rewardToken
    ) internal returns (bytes32) {
        return intentBus.postIntent(data, expiry, reward, rewardToken);
    }
    
    /**
     * @dev Solve an intent on the IntentBus
     * @param intentId ID of the intent to solve
     * @param solutionData Solution data
     */
    function solveIntent(
        bytes32 intentId,
        bytes memory solutionData
    ) internal {
        intentBus.solveIntent(intentId, solutionData);
    }
}