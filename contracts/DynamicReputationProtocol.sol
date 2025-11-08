// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AIZOrchestrator.sol";
import "./AIZRegistry.sol";
import "./ConsciousDecisionLogger.sol";

/**
 * @title DynamicReputationProtocol
 * @dev A protocol that extends across the organization to evaluate and manage reputation of AIZs
 * based on their performance, reliability, and economic contributions.
 */
contract DynamicReputationProtocol is AIZOrchestrator {
    // Structure to hold reputation data for an AIZ
    struct AIZReputation {
        bytes32 aizId;
        uint256 score; // 0-1000 scale
        uint256 lastUpdated;
        uint256 totalInteractions;
        uint256 successfulInteractions;
        uint256 economicContributions;
        uint256 collaborationScore; // Score for collaboration (0-1000)
        mapping(bytes32 => uint256) categoryScores; // Scores by category
    }

    // Structure for reputation events
    struct ReputationEvent {
        bytes32 aizId;
        string eventType; // SUCCESS, FAILURE, ECONOMIC_CONTRIBUTION, STAKE_PLACEMENT, STAKE_LOSS, COLLABORATION
        int256 scoreChange; // Can be positive or negative
        string reason;
        uint256 timestamp;
    }

    // Structure for staking on reputation
    struct ReputationStake {
        bytes32 aizId;
        address staker;
        uint256 amount;
        uint256 timestamp;
        bool isActive;
    }

    // Structure for collaboration records
    struct CollaborationRecord {
        bytes32 collaborationId;
        bytes32[] participantAIZs;
        string taskDescription;
        uint256 completionScore; // 0-100
        uint256 timestamp;
        bool completed;
    }

    // Storage mappings
    mapping(bytes32 => AIZReputation) public aizReputations;
    mapping(uint256 => ReputationEvent) public reputationEvents;
    mapping(uint256 => ReputationStake) public reputationStakes;
    mapping(bytes32 => CollaborationRecord) public collaborationRecords;
    
    uint256 public reputationEventCount;
    uint256 public reputationStakeCount;
    uint256 public collaborationRecordCount;
    address public decisionLoggerAddress;

    // Events
    event ReputationUpdated(bytes32 indexed aizId, uint256 newScore, int256 scoreChange, string reason);
    event ReputationStakePlaced(bytes32 indexed aizId, address indexed staker, uint256 amount);
    event ReputationStakeLost(bytes32 indexed aizId, address indexed staker, uint256 amount, string reason);
    event ReputationStakeReleased(bytes32 indexed aizId, address indexed staker, uint256 amount);
    event CollaborationCompleted(bytes32 indexed collaborationId, uint256 completionScore);
    event CollaborationScoreUpdated(bytes32 indexed aizId, uint256 newCollaborationScore);

    constructor(
        bytes32 _aizId,
        address _aizRegistry,
        address _decisionLogger,
        string memory _aizName,
        string memory _aizDescription
    ) AIZOrchestrator(_aizId, _aizRegistry, _decisionLogger, _aizName, _aizDescription) {
        decisionLoggerAddress = _decisionLogger;
    }

    /**
     * @dev Update reputation score for an AIZ
     * @param _aizId The ID of the AIZ
     * @param _scoreChange The change in score (can be positive or negative)
     * @param _reason The reason for the score change
     * @param _category The category of the score change (optional)
     */
    function updateReputation(
        bytes32 _aizId,
        int256 _scoreChange,
        string memory _reason,
        bytes32 _category
    ) external onlyAuthorized {
        AIZReputation storage reputation = aizReputations[_aizId];
        
        // Initialize if not exists
        if (reputation.lastUpdated == 0) {
            reputation.aizId = _aizId;
            reputation.score = 500; // Default starting score
        }
        
        // Update score
        if (_scoreChange > 0) {
            reputation.score = Math.min(1000, reputation.score + uint256(_scoreChange));
        } else {
            reputation.score = Math.max(0, reputation.score - uint256(-_scoreChange));
        }
        
        reputation.lastUpdated = block.timestamp;
        reputation.totalInteractions += 1;
        
        if (_scoreChange > 0) {
            reputation.successfulInteractions += 1;
        }
        
        // Update category score if provided
        if (_category != bytes32(0)) {
            if (_scoreChange > 0) {
                reputation.categoryScores[_category] = Math.min(
                    1000, 
                    reputation.categoryScores[_category] + uint256(_scoreChange)
                );
            } else {
                reputation.categoryScores[_category] = Math.max(
                    0, 
                    reputation.categoryScores[_category] - uint256(-_scoreChange)
                );
            }
        }
        
        // Record event
        reputationEventCount++;
        reputationEvents[reputationEventCount] = ReputationEvent({
            aizId: _aizId,
            eventType: _scoreChange > 0 ? "SUCCESS" : "FAILURE",
            scoreChange: _scoreChange,
            reason: _reason,
            timestamp: block.timestamp
        });
        
        emit ReputationUpdated(_aizId, reputation.score, _scoreChange, _reason);
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = string(abi.encodePacked("AIZ-", _aizName));
        
        logConsciousDecision(
            "Reputation Updated",
            collaborators,
            string(abi.encodePacked('{"aizId": "', vm.toString(_aizId), '"}')),
            string(abi.encodePacked('{"scoreChange": ', vm.toString(_scoreChange), ', "newScore": ', vm.toString(reputation.score), '}')),
            '{"consciousness": "trust-evaluation"}',
            '{"state": "reputation-dynamics"}'
        );
    }

    /**
     * @dev Record economic contribution to an AIZ's reputation
     * @param _aizId The ID of the AIZ
     * @param _amount The economic contribution amount
     * @param _reason The reason for the contribution
     */
    function recordEconomicContribution(
        bytes32 _aizId,
        uint256 _amount,
        string memory _reason
    ) external onlyAuthorized {
        AIZReputation storage reputation = aizReputations[_aizId];
        
        // Initialize if not exists
        if (reputation.lastUpdated == 0) {
            reputation.aizId = _aizId;
            reputation.score = 500; // Default starting score
        }
        
        // Update economic contributions
        reputation.economicContributions += _amount;
        
        // Calculate reputation boost based on contribution (1 point per 10 units)
        uint256 reputationBoost = _amount / 10;
        if (reputationBoost > 0) {
            reputation.score = Math.min(1000, reputation.score + reputationBoost);
            
            // Record event
            reputationEventCount++;
            reputationEvents[reputationEventCount] = ReputationEvent({
                aizId: _aizId,
                eventType: "ECONOMIC_CONTRIBUTION",
                scoreChange: int256(reputationBoost),
                reason: _reason,
                timestamp: block.timestamp
            });
            
            emit ReputationUpdated(_aizId, reputation.score, int256(reputationBoost), _reason);
        }
        
        reputation.lastUpdated = block.timestamp;
    }

    /**
     * @dev Place a stake on an AIZ's reputation
     * @param _aizId The ID of the AIZ
     * @param _amount The amount to stake
     */
    function placeReputationStake(bytes32 _aizId, uint256 _amount) external {
        require(_amount > 0, "Stake amount must be greater than 0");
        
        // Record stake
        reputationStakeCount++;
        reputationStakes[reputationStakeCount] = ReputationStake({
            aizId: _aizId,
            staker: msg.sender,
            amount: _amount,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emit ReputationStakePlaced(_aizId, msg.sender, _amount);
        
        // Boost reputation slightly for staking
        updateReputation(_aizId, 5, "Reputation stake placed", bytes32(0));
    }

    /**
     * @dev Penalize an AIZ and slash stakes
     * @param _aizId The ID of the AIZ
     * @param _reason The reason for the penalty
     */
    function penalizeAIZ(bytes32 _aizId, string memory _reason) external onlyAuthorized {
        // Apply reputation penalty
        updateReputation(_aizId, -50, _reason, bytes32(0));
        
        // Slash active stakes
        for (uint256 i = 1; i <= reputationStakeCount; i++) {
            if (reputationStakes[i].aizId == _aizId && 
                reputationStakes[i].isActive &&
                reputationStakes[i].timestamp > block.timestamp - 30 days) { // Only recent stakes
                
                reputationStakes[i].isActive = false;
                
                emit ReputationStakeLost(
                    _aizId, 
                    reputationStakes[i].staker, 
                    reputationStakes[i].amount, 
                    _reason
                );
            }
        }
    }

    /**
     * @dev Release a reputation stake
     * @param _stakeId The ID of the stake to release
     */
    function releaseStake(uint256 _stakeId) external {
        ReputationStake storage stake = reputationStakes[_stakeId];
        require(stake.staker == msg.sender, "Only staker can release stake");
        require(stake.isActive, "Stake is not active");
        require(stake.timestamp < block.timestamp - 7 days, "Stake must be held for at least 7 days");
        
        stake.isActive = false;
        
        emit ReputationStakeReleased(stake.aizId, msg.sender, stake.amount);
    }

    /**
     * @dev Record a collaboration completion
     * @param _participantAIZs Array of AIZ IDs that participated
     * @param _taskDescription Description of the collaborative task
     * @param _completionScore Score for the collaboration (0-100)
     */
    function recordCollaboration(
        bytes32[] memory _participantAIZs,
        string memory _taskDescription,
        uint256 _completionScore
    ) external onlyAuthorized {
        collaborationRecordCount++;
        bytes32 collaborationId = keccak256(abi.encodePacked("collaboration", collaborationRecordCount, block.timestamp));
        
        collaborationRecords[collaborationId] = CollaborationRecord({
            collaborationId: collaborationId,
            participantAIZs: _participantAIZs,
            taskDescription: _taskDescription,
            completionScore: _completionScore,
            timestamp: block.timestamp,
            completed: true
        });
        
        emit CollaborationCompleted(collaborationId, _completionScore);
        
        // Update collaboration scores for all participants
        for (uint256 i = 0; i < _participantAIZs.length; i++) {
            AIZReputation storage reputation = aizReputations[_participantAIZs[i]];
            
            // Initialize if not exists
            if (reputation.lastUpdated == 0) {
                reputation.aizId = _participantAIZs[i];
                reputation.score = 500; // Default starting score
            }
            
            // Update collaboration score based on completion score
            uint256 collaborationBoost = _completionScore; // 1 point per completion score point
            reputation.collaborationScore = Math.min(1000, reputation.collaborationScore + collaborationBoost);
            
            emit CollaborationScoreUpdated(_participantAIZs[i], reputation.collaborationScore);
            
            // Also boost overall reputation
            updateReputation(_participantAIZs[i], int256(collaborationBoost / 10), "Successful collaboration", bytes32(0));
        }
    }

    /**
     * @dev Get reputation data for an AIZ
     * @param _aizId The ID of the AIZ
     * @return AIZReputation struct
     */
    function getAIZReputation(bytes32 _aizId) external view returns (AIZReputation memory) {
        return aizReputations[_aizId];
    }

    /**
     * @dev Get reputation event
     * @param _eventId The ID of the event
     * @return ReputationEvent struct
     */
    function getReputationEvent(uint256 _eventId) external view returns (ReputationEvent memory) {
        return reputationEvents[_eventId];
    }

    /**
     * @dev Get reputation stake
     * @param _stakeId The ID of the stake
     * @return ReputationStake struct
     */
    function getReputationStake(uint256 _stakeId) external view returns (ReputationStake memory) {
        return reputationStakes[_stakeId];
    }

    /**
     * @dev Get collaboration record
     * @param _collaborationId The ID of the collaboration
     * @return CollaborationRecord struct
     */
    function getCollaborationRecord(bytes32 _collaborationId) external view returns (CollaborationRecord memory) {
        return collaborationRecords[_collaborationId];
    }

    /**
     * @dev Get success rate for an AIZ
     * @param _aizId The ID of the AIZ
     * @return Success rate as a percentage (0-100)
     */
    function getSuccessRate(bytes32 _aizId) external view returns (uint256) {
        AIZReputation storage reputation = aizReputations[_aizId];
        if (reputation.totalInteractions == 0) {
            return 0;
        }
        return (reputation.successfulInteractions * 100) / reputation.totalInteractions;
    }

    /**
     * @dev Get collaboration score for an AIZ
     * @param _aizId The ID of the AIZ
     * @return Collaboration score (0-1000)
     */
    function getCollaborationScore(bytes32 _aizId) external view returns (uint256) {
        return aizReputations[_aizId].collaborationScore;
    }
}