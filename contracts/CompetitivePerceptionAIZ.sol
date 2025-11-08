// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AIZOrchestrator.sol";
import "./AIZRegistry.sol";
import "./IntentBus.sol";

/**
 * @title CompetitivePerceptionAIZ
 * @dev An AIZ that monitors external competitors and environment to detect threats and opportunities
 */
contract CompetitivePerceptionAIZ is AIZOrchestrator {
    // Structure to hold competitor data
    struct CompetitorData {
        address contractAddress;
        string name;
        uint256 lastAnalyzed;
        uint256 transactionCount;
        uint256 successRate;
        mapping(bytes4 => uint256) methodUsage; // Track usage of different methods
    }

    // Structure to hold alpha analysis data
    struct AlphaData {
        bytes32 strategyId;
        string description;
        uint256 profitability;
        uint256 decayRate;
        uint256 lastUpdated;
    }

    // Structure for strategic alerts
    struct StrategicAlert {
        uint256 id;
        string alertType; // STRATEGY_OPPORTUNITY, ALPHA_DECAY_WARNING, etc.
        string description;
        address source;
        uint256 timestamp;
        bool processed;
    }

    // Storage mappings
    mapping(address => CompetitorData) public competitors;
    mapping(bytes32 => AlphaData) public alphaAnalysis;
    mapping(uint256 => StrategicAlert) public strategicAlerts;
    
    uint256 public competitorCount;
    uint256 public alertCount;
    address public intentBusAddress;

    // Events
    event CompetitorAdded(address indexed competitorAddress, string name);
    event CompetitorAnalyzed(address indexed competitorAddress);
    event AlphaAnalysisUpdated(bytes32 indexed strategyId, uint256 profitability, uint256 decayRate);
    event StrategicAlertCreated(uint256 indexed alertId, string alertType, string description);
    event StrategicAlertProcessed(uint256 indexed alertId);

    constructor(address _aizRegistry, address _intentBus) AIZOrchestrator(_aizRegistry) {
        intentBusAddress = _intentBus;
    }

    /**
     * @dev Add a new competitor to monitor
     * @param _contractAddress The address of the competitor's contract
     * @param _name The name of the competitor
     */
    function addCompetitor(address _contractAddress, string memory _name) external onlyAuthorized {
        competitorCount++;
        CompetitorData storage competitor = competitors[_contractAddress];
        competitor.contractAddress = _contractAddress;
        competitor.name = _name;
        competitor.lastAnalyzed = block.timestamp;
        
        emit CompetitorAdded(_contractAddress, _name);
    }

    /**
     * @dev Analyze a competitor's on-chain activity
     * @param _contractAddress The address of the competitor's contract
     */
    function analyzeCompetitor(address _contractAddress) external onlyAuthorized {
        CompetitorData storage competitor = competitors[_contractAddress];
        require(competitor.contractAddress != address(0), "Competitor not registered");
        
        // In a real implementation, this would analyze actual blockchain data
        // For now, we'll simulate the analysis
        competitor.transactionCount += 10; // Simulate finding 10 new transactions
        competitor.successRate = 95; // Simulate 95% success rate
        competitor.lastAnalyzed = block.timestamp;
        
        emit CompetitorAnalyzed(_contractAddress);
    }

    /**
     * @dev Update alpha analysis for a strategy
     * @param _strategyId The ID of the strategy
     * @param _description Description of the strategy
     * @param _profitability Current profitability score (0-100)
     * @param _decayRate Current decay rate (0-100)
     */
    function updateAlphaAnalysis(
        bytes32 _strategyId,
        string memory _description,
        uint256 _profitability,
        uint256 _decayRate
    ) external onlyAuthorized {
        AlphaData storage alpha = alphaAnalysis[_strategyId];
        alpha.strategyId = _strategyId;
        alpha.description = _description;
        alpha.profitability = _profitability;
        alpha.decayRate = _decayRate;
        alpha.lastUpdated = block.timestamp;
        
        emit AlphaAnalysisUpdated(_strategyId, _profitability, _decayRate);
    }

    /**
     * @dev Create a strategic alert
     * @param _alertType Type of alert (STRATEGY_OPPORTUNITY, ALPHA_DECAY_WARNING, etc.)
     * @param _description Description of the alert
     * @param _source Source of the alert
     */
    function createStrategicAlert(
        string memory _alertType,
        string memory _description,
        address _source
    ) external onlyAuthorized {
        alertCount++;
        StrategicAlert storage alert = strategicAlerts[alertCount];
        alert.id = alertCount;
        alert.alertType = _alertType;
        alert.description = _description;
        alert.source = _source;
        alert.timestamp = block.timestamp;
        alert.processed = false;
        
        emit StrategicAlertCreated(alertCount, _alertType, _description);
        
        // Send alert via IntentBus
        _sendAlertToIntentBus(alert);
    }

    /**
     * @dev Mark an alert as processed
     * @param _alertId The ID of the alert to mark as processed
     */
    function processAlert(uint256 _alertId) external onlyAuthorized {
        StrategicAlert storage alert = strategicAlerts[_alertId];
        require(alert.id != 0, "Alert does not exist");
        require(!alert.processed, "Alert already processed");
        
        alert.processed = true;
        
        emit StrategicAlertProcessed(_alertId);
    }

    /**
     * @dev Send alert to IntentBus for distribution
     * @param _alert The alert to send
     */
    function _sendAlertToIntentBus(StrategicAlert memory _alert) internal {
        // In a real implementation, this would interact with the IntentBus contract
        // For now, we'll just log that it would happen
        // IntentBus(intentBusAddress).publishIntent(...);
    }

    /**
     * @dev Get competitor data
     * @param _contractAddress The address of the competitor
     * @return CompetitorData struct
     */
    function getCompetitor(address _contractAddress) external view returns (CompetitorData memory) {
        return competitors[_contractAddress];
    }

    /**
     * @dev Get alpha analysis data
     * @param _strategyId The ID of the strategy
     * @return AlphaData struct
     */
    function getAlphaAnalysis(bytes32 _strategyId) external view returns (AlphaData memory) {
        return alphaAnalysis[_strategyId];
    }

    /**
     * @dev Get strategic alert
     * @param _alertId The ID of the alert
     * @return StrategicAlert struct
     */
    function getStrategicAlert(uint256 _alertId) external view returns (StrategicAlert memory) {
        return strategicAlerts[_alertId];
    }
}