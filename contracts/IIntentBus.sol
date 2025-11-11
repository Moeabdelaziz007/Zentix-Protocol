// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IIntentBus
 * @dev Unified interface for the Intent-based communication bus
 * Extends the existing IntentBus functionality with AIZ Framework compliance
 */
interface IIntentBus {
    /**
     * @dev Post a new intent
     * @param data Intent data
     * @param expiry Expiry timestamp
     * @param reward Reward for solving the intent
     * @param rewardToken Token address for reward (address(0) for ETH)
     * @param isCollaborative Whether this intent requires collaboration
     * @return bytes32 ID of the posted intent
     */
    function postIntent(
        bytes calldata data,
        uint256 expiry,
        uint256 reward,
        address rewardToken,
        bool isCollaborative
    ) external returns (bytes32);
    
    /**
     * @dev Post a simple intent without collaboration
     * @param data Intent data
     * @param expiry Expiry timestamp
     * @param reward Reward for solving the intent
     * @param rewardToken Token address for reward (address(0) for ETH)
     * @return bytes32 ID of the posted intent
     */
    function postIntent(
        bytes calldata data,
        uint256 expiry,
        uint256 reward,
        address rewardToken
    ) external returns (bytes32);
    
    /**
     * @dev Solve an intent
     * @param intentId ID of the intent to solve
     * @param solutionData Solution data
     */
    function solveIntent(
        bytes32 intentId,
        bytes calldata solutionData
    ) external;
    
    /**
     * @dev Request collaboration for an intent
     * @param intentId ID of the intent requiring collaboration
     * @param requestMessage Message explaining the collaboration need
     */
    function requestCollaboration(
        bytes32 intentId,
        string calldata requestMessage
    ) external;
    
    /**
     * @dev Respond to a collaboration request
     * @param intentId ID of the intent
     * @param willCollaborate Whether the AIZ will collaborate
     * @param responseMessage Message explaining the response
     */
    function respondToCollaboration(
        bytes32 intentId,
        bool willCollaborate,
        string calldata responseMessage
    ) external;
    
    /**
     * @dev Expire an intent
     * @param intentId ID of the intent to expire
     */
    function expireIntent(bytes32 intentId) external;
    
    /**
     * @dev Get intent information
     * @param intentId ID of the intent
     * @return Intent information
     */
    function getIntent(bytes32 intentId) external view returns (IntentBus.Intent memory);
    
    /**
     * @dev Get solution information
     * @param intentId ID of the intent
     * @return Solution information
     */
    function getSolution(bytes32 intentId) external view returns (IntentBus.Solution memory);
    
    /**
     * @dev Get collaboration requests for an intent
     * @param intentId ID of the intent
     * @return Array of collaboration requests
     */
    function getCollaborationRequests(bytes32 intentId) external view returns (IntentBus.CollaborationRequest[] memory);
    
    /**
     * @dev Get collaboration responses for an intent
     * @param intentId ID of the intent
     * @return Array of collaboration responses
     */
    function getCollaborationResponses(bytes32 intentId) external view returns (IntentBus.CollaborationResponse[] memory);
    
    /**
     * @dev Check if an intent has been solved
     * @param intentId ID of the intent
     * @return bool Whether the intent has been solved
     */
    function isSolved(bytes32 intentId) external view returns (bool);
}