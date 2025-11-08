// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AIZRegistry.sol";

/**
 * @title StrategicThreatDB
 * @dev Database for storing and managing strategic threat signatures from competitor analysis
 */
contract StrategicThreatDB is Ownable {
    struct ThreatSignature {
        bytes32 threatId;
        address sourceCompetitor;
        address targetContract;
        string threatType; // EXPLOIT_ATTEMPT, ARBITRAGE_OPPORTUNITY, PERFORMANCE_DEGRADATION, etc.
        bytes callPattern;
        uint256 potentialProfit;
        uint256 potentialLoss;
        uint256 detectedAt;
        bool isActive;
    }

    struct ThreatAlert {
        bytes32 alertId;
        bytes32 threatId;
        address targetAIZ;
        uint256 alertTimestamp;
        bool acknowledged;
        bool resolved;
    }

    mapping(bytes32 => ThreatSignature) public threatSignatures;
    mapping(bytes32 => ThreatAlert) public threatAlerts;
    mapping(address => bytes32[]) public competitorThreats;
    mapping(address => bytes32[]) public targetThreats;
    
    bytes32[] public threatIds;
    bytes32[] public alertIds;
    
    address public aizRegistryAddress;
    uint256 public threatCount;
    uint256 public alertCount;

    event ThreatSignatureRegistered(
        bytes32 indexed threatId,
        address indexed sourceCompetitor,
        address indexed targetContract,
        string threatType
    );
    
    event ThreatAlertCreated(
        bytes32 indexed alertId,
        bytes32 indexed threatId,
        address indexed targetAIZ
    );
    
    event ThreatAlertAcknowledged(bytes32 indexed alertId);
    event ThreatAlertResolved(bytes32 indexed alertId);
    event ThreatSignatureDeactivated(bytes32 indexed threatId);

    constructor(address _aizRegistryAddress) {
        aizRegistryAddress = _aizRegistryAddress;
    }

    /**
     * @dev Register a new threat signature
     * @param _sourceCompetitor The address of the competitor that generated the threat
     * @param _targetContract The address of the contract being targeted
     * @param _threatType The type of threat
     * @param _callPattern The call pattern that identifies the threat
     * @param _potentialProfit The potential profit from the threat
     * @param _potentialLoss The potential loss from the threat
     * @return bytes32 The ID of the registered threat
     */
    function registerThreatSignature(
        address _sourceCompetitor,
        address _targetContract,
        string memory _threatType,
        bytes memory _callPattern,
        uint256 _potentialProfit,
        uint256 _potentialLoss
    ) external onlyOwner returns (bytes32) {
        bytes32 threatId = keccak256(abi.encodePacked(
            _sourceCompetitor,
            _targetContract,
            _threatType,
            _callPattern,
            block.timestamp
        ));

        require(threatSignatures[threatId].detectedAt == 0, "Threat signature already exists");

        threatSignatures[threatId] = ThreatSignature({
            threatId: threatId,
            sourceCompetitor: _sourceCompetitor,
            targetContract: _targetContract,
            threatType: _threatType,
            callPattern: _callPattern,
            potentialProfit: _potentialProfit,
            potentialLoss: _potentialLoss,
            detectedAt: block.timestamp,
            isActive: true
        });

        competitorThreats[_sourceCompetitor].push(threatId);
        targetThreats[_targetContract].push(threatId);
        threatIds.push(threatId);
        threatCount++;

        emit ThreatSignatureRegistered(threatId, _sourceCompetitor, _targetContract, _threatType);

        return threatId;
    }

    /**
     * @dev Create a threat alert for a specific AIZ
     * @param _threatId The ID of the threat
     * @param _targetAIZ The AIZ being targeted
     * @return bytes32 The ID of the created alert
     */
    function createThreatAlert(
        bytes32 _threatId,
        address _targetAIZ
    ) external onlyOwner returns (bytes32) {
        require(threatSignatures[_threatId].isActive, "Threat signature not active");
        require(AIZRegistry(aizRegistryAddress).isAuthorizedAIZContract(block.chainid, _targetAIZ), 
            "Target is not a registered AIZ");

        bytes32 alertId = keccak256(abi.encodePacked(_threatId, _targetAIZ, block.timestamp));

        threatAlerts[alertId] = ThreatAlert({
            alertId: alertId,
            threatId: _threatId,
            targetAIZ: _targetAIZ,
            alertTimestamp: block.timestamp,
            acknowledged: false,
            resolved: false
        });

        alertIds.push(alertId);
        alertCount++;

        emit ThreatAlertCreated(alertId, _threatId, _targetAIZ);

        return alertId;
    }

    /**
     * @dev Acknowledge a threat alert
     * @param _alertId The ID of the alert to acknowledge
     */
    function acknowledgeThreatAlert(bytes32 _alertId) external onlyOwner {
        require(!threatAlerts[_alertId].acknowledged, "Alert already acknowledged");
        
        threatAlerts[_alertId].acknowledged = true;
        
        emit ThreatAlertAcknowledged(_alertId);
    }

    /**
     * @dev Mark a threat alert as resolved
     * @param _alertId The ID of the alert to resolve
     */
    function resolveThreatAlert(bytes32 _alertId) external onlyOwner {
        require(!threatAlerts[_alertId].resolved, "Alert already resolved");
        
        threatAlerts[_alertId].resolved = true;
        
        emit ThreatAlertResolved(_alertId);
    }

    /**
     * @dev Deactivate a threat signature
     * @param _threatId The ID of the threat to deactivate
     */
    function deactivateThreatSignature(bytes32 _threatId) external onlyOwner {
        require(threatSignatures[_threatId].isActive, "Threat signature not active");
        
        threatSignatures[_threatId].isActive = false;
        
        emit ThreatSignatureDeactivated(_threatId);
    }

    /**
     * @dev Get all threats from a specific competitor
     * @param _competitor The competitor address
     * @return Array of threat IDs
     */
    function getThreatsFromCompetitor(address _competitor) external view returns (bytes32[] memory) {
        return competitorThreats[_competitor];
    }

    /**
     * @dev Get all threats targeting a specific contract
     * @param _target The target contract address
     * @return Array of threat IDs
     */
    function getThreatsTargeting(address _target) external view returns (bytes32[] memory) {
        return targetThreats[_target];
    }

    /**
     * @dev Get threat signature by ID
     * @param _threatId The threat ID
     * @return ThreatSignature struct
     */
    function getThreatSignature(bytes32 _threatId) external view returns (ThreatSignature memory) {
        return threatSignatures[_threatId];
    }

    /**
     * @dev Get threat alert by ID
     * @param _alertId The alert ID
     * @return ThreatAlert struct
     */
    function getThreatAlert(bytes32 _alertId) external view returns (ThreatAlert memory) {
        return threatAlerts[_alertId];
    }

    /**
     * @dev Get all threat IDs
     * @return Array of threat IDs
     */
    function getAllThreatIds() external view returns (bytes32[] memory) {
        return threatIds;
    }

    /**
     * @dev Get all alert IDs
     * @return Array of alert IDs
     */
    function getAllAlertIds() external view returns (bytes32[] memory) {
        return alertIds;
    }
}