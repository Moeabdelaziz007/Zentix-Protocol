// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AIZOrchestrator.sol";
import "./AIZRegistry.sol";
import "./IntentBus.sol";
import "./CompetitorRegistry.sol";
import "./StrategicThreatDB.sol";

/**
 * @title FinancialDecoyAgent
 * @dev An AIZ that creates decoy transactions to deceive competing MEV bots and waste their resources
 */
contract FinancialDecoyAgent is AIZOrchestrator {
    struct DecoyTransaction {
        bytes32 id;
        address targetContract;
        bytes data;
        uint256 gasLimit;
        uint256 createdAt;
        bool executed;
        bool failedAsIntended;
    }
    
    struct DecoyCampaign {
        bytes32 id;
        string name;
        address[] targetCompetitors;
        uint256 budget;
        uint256 spent;
        uint256 createdAt;
        uint256 completedAt;
        bool isActive;
    }
    
    // Storage mappings
    mapping(bytes32 => DecoyTransaction) public decoyTransactions;
    mapping(bytes32 => DecoyCampaign) public decoyCampaigns;
    mapping(address => uint256) public competitorResourceWaste;
    
    uint256 public decoyTransactionCount;
    uint256 public decoyCampaignCount;
    address public competitorRegistryAddress;
    address public strategicThreatDBAddress;
    address public intentBusAddress;
    
    // Events
    event DecoyTransactionCreated(bytes32 indexed decoyId, address targetContract);
    event DecoyTransactionExecuted(bytes32 indexed decoyId, bool failedAsIntended);
    event DecoyCampaignCreated(bytes32 indexed campaignId, string name, uint256 budget);
    event DecoyCampaignCompleted(bytes32 indexed campaignId, uint256 totalWaste);
    event CompetitorResourceWasted(address indexed competitor, uint256 gasWasted, string strategy);
    
    constructor(
        bytes32 _aizId,
        address _aizRegistry,
        address _intentBus,
        address _competitorRegistry,
        address _strategicThreatDB,
        address _decisionLogger,
        string memory _aizName,
        string memory _aizDescription
    ) AIZOrchestrator(_aizId, _aizRegistry, _decisionLogger, _aizName, _aizDescription) {
        intentBusAddress = _intentBus;
        competitorRegistryAddress = _competitorRegistry;
        strategicThreatDBAddress = _strategicThreatDB;
    }
    
    /**
     * @dev Create a decoy transaction designed to fail
     * @param _targetContract The contract to call with the decoy
     * @param _data The call data that appears profitable but will fail
     * @param _gasLimit The gas limit for the transaction
     * @return bytes32 The ID of the created decoy transaction
     */
    function createDecoyTransaction(
        address _targetContract,
        bytes memory _data,
        uint256 _gasLimit
    ) external onlyAuthorized returns (bytes32) {
        decoyTransactionCount++;
        bytes32 decoyId = keccak256(abi.encodePacked(_targetContract, _data, block.timestamp, decoyTransactionCount));
        
        decoyTransactions[decoyId] = DecoyTransaction({
            id: decoyId,
            targetContract: _targetContract,
            data: _data,
            gasLimit: _gasLimit,
            createdAt: block.timestamp,
            executed: false,
            failedAsIntended: false
        });
        
        emit DecoyTransactionCreated(decoyId, _targetContract);
        
        return decoyId;
    }
    
    /**
     * @dev Execute a decoy transaction
     * @param _decoyId The ID of the decoy transaction to execute
     */
    function executeDecoyTransaction(bytes32 _decoyId) external onlyAuthorized {
        DecoyTransaction storage decoy = decoyTransactions[_decoyId];
        require(!decoy.executed, "Decoy transaction already executed");
        
        decoy.executed = true;
        
        // Attempt to execute the transaction
        // In a real implementation, this would be designed to fail in a specific way
        // that wastes gas for MEV bots trying to copy it
        try this.executeDecoyCall{gas: decoy.gasLimit}(decoy.targetContract, decoy.data) {
            // If it succeeds, it wasn't a good decoy
            decoy.failedAsIntended = false;
        } catch {
            // If it fails, that's what we wanted
            decoy.failedAsIntended = true;
        }
        
        emit DecoyTransactionExecuted(_decoyId, decoy.failedAsIntended);
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = string(abi.encodePacked("AIZ-", aizName));
        
        logConsciousDecision(
            "Decoy Transaction Executed",
            collaborators,
            string(abi.encodePacked('{"decoyId": "', vm.toString(_decoyId), '"}')),
            string(abi.encodePacked('{"failedAsIntended": "', decoy.failedAsIntended ? "true" : "false", '"}')),
            '{"consciousness": "strategic-deception"}',
            '{"state": "deception-execution"}'
        );
    }
    
    /**
     * @dev Internal function to execute a decoy call
     * @param _target The target contract
     * @param _data The call data
     */
    function executeDecoyCall(address _target, bytes memory _data) external {
        require(msg.sender == address(this), "Only self-call allowed");
        // This call is designed to fail in a way that wastes gas
        (bool success, ) = _target.call(_data);
        require(!success, "Decoy call should fail");
    }
    
    /**
     * @dev Create a decoy campaign targeting specific competitors
     * @param _name The name of the campaign
     * @param _targetCompetitors The addresses of competitor contracts to target
     * @param _budget The budget for the campaign
     * @return bytes32 The ID of the created campaign
     */
    function createDecoyCampaign(
        string memory _name,
        address[] memory _targetCompetitors,
        uint256 _budget
    ) external onlyAuthorized returns (bytes32) {
        decoyCampaignCount++;
        bytes32 campaignId = keccak256(abi.encodePacked(_name, block.timestamp, decoyCampaignCount));
        
        decoyCampaigns[campaignId] = DecoyCampaign({
            id: campaignId,
            name: _name,
            targetCompetitors: _targetCompetitors,
            budget: _budget,
            spent: 0,
            createdAt: block.timestamp,
            completedAt: 0,
            isActive: true
        });
        
        emit DecoyCampaignCreated(campaignId, _name, _budget);
        
        return campaignId;
    }
    
    /**
     * @dev Record resource waste for a competitor
     * @param _competitor The competitor address
     * @param _gasWasted The amount of gas wasted
     * @param _strategy The strategy used
     */
    function recordCompetitorResourceWaste(
        address _competitor,
        uint256 _gasWasted,
        string memory _strategy
    ) external onlyAuthorized {
        competitorResourceWaste[_competitor] += _gasWasted;
        
        emit CompetitorResourceWasted(_competitor, _gasWasted, _strategy);
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = string(abi.encodePacked("AIZ-", aizName));
        
        logConsciousDecision(
            "Competitor Resource Waste Recorded",
            collaborators,
            string(abi.encodePacked('{"competitor": "', vm.toString(_competitor), '"}')),
            string(abi.encodePacked('{"gasWasted": ', vm.toString(_gasWasted), '}')),
            string(abi.encodePacked('{"strategy": "', _strategy, '"}')),
            '{"state": "competitive-deception"}'
        );
    }
    
    /**
     * @dev Get decoy transaction information
     * @param _decoyId The ID of the decoy transaction
     * @return DecoyTransaction struct
     */
    function getDecoyTransaction(bytes32 _decoyId) external view returns (DecoyTransaction memory) {
        return decoyTransactions[_decoyId];
    }
    
    /**
     * @dev Get decoy campaign information
     * @param _campaignId The ID of the decoy campaign
     * @return DecoyCampaign struct
     */
    function getDecoyCampaign(bytes32 _campaignId) external view returns (DecoyCampaign memory) {
        return decoyCampaigns[_campaignId];
    }
    
    /**
     * @dev Get total resource waste for a competitor
     * @param _competitor The competitor address
     * @return uint256 Total gas wasted
     */
    function getTotalResourceWaste(address _competitor) external view returns (uint256) {
        return competitorResourceWaste[_competitor];
    }
}