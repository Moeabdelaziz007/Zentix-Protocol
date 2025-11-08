// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AIZRegistry.sol";
import "./ZXTToken.sol";

/**
 * @title PriorityIntentBus
 * @dev Enhanced intent-based communication bus with priority marketplace for Autonomous AI Zones
 * Allows AIZs to post intents with priority bounties and other AIZs to solve them
 */
contract PriorityIntentBus is Ownable, ReentrancyGuard {
    struct Intent {
        bytes32 id;                    // Unique identifier for the intent
        bytes32 sourceAIZ;             // AIZ ID of the intent creator
        bytes data;                    // Intent data
        uint256 timestamp;             // When the intent was created
        uint256 expiry;                // When the intent expires
        uint256 reward;                // Reward for solving the intent (in wei)
        address rewardToken;           // Token address for reward (address(0) for ETH)
        bool isCollaborative;          // Whether this intent requires collaboration
        uint256 priorityBounty;        // Priority bounty paid in ZXT tokens
        uint256 priorityTimestamp;     // When the priority bounty was added
    }
    
    struct Solution {
        bytes32 intentId;              // ID of the intent being solved
        bytes32 solverAIZ;             // AIZ ID of the solver
        bytes solutionData;            // Solution data
        uint256 timestamp;             // When the solution was submitted
    }
    
    struct CollaborationRequest {
        bytes32 intentId;              // ID of the intent requiring collaboration
        bytes32 requesterAIZ;          // AIZ ID of the collaboration requester
        string requestMessage;         // Message explaining the collaboration need
        uint256 timestamp;             // When the request was made
    }
    
    struct CollaborationResponse {
        bytes32 intentId;              // ID of the intent
        bytes32 responderAIZ;          // AIZ ID of the collaboration responder
        string responseMessage;        // Message explaining the response
        bool willCollaborate;          // Whether the AIZ will collaborate
        uint256 timestamp;             // When the response was made
    }
    
    // Mapping of intent ID to intent
    mapping(bytes32 => Intent) public intents;
    
    // Mapping of intent ID to solution
    mapping(bytes32 => Solution) public solutions;
    
    // Mapping of intent ID to collaboration requests
    mapping(bytes32 => CollaborationRequest[]) public collaborationRequests;
    
    // Mapping of intent ID to collaboration responses
    mapping(bytes32 => CollaborationResponse[]) public collaborationResponses;
    
    // Reference to AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Reference to ZXT Token
    ZXTToken public zxtToken;
    
    // Treasury address for protocol fees
    address public treasury;
    
    // Priority bounty configuration
    uint256 public constant MIN_PRIORITY_BOUNTY = 1000000000000000000; // 1 ZXT
    uint256 public constant BOUNTY_INCREASE_INTERVAL = 60; // 1 minute
    uint256 public constant BOUNTY_INCREASE_RATE = 5; // 5% increase per interval
    
    // Events
    event IntentPosted(
        bytes32 indexed intentId,
        bytes32 indexed sourceAIZ,
        bytes data,
        uint256 reward,
        uint256 expiry,
        bool isCollaborative
    );
    
    event PriorityBountyAdded(
        bytes32 indexed intentId,
        uint256 priorityBounty,
        uint256 newTotalBounty
    );
    
    event IntentSolved(
        bytes32 indexed intentId,
        bytes32 indexed solverAIZ,
        bytes solutionData
    );
    
    event IntentExpired(bytes32 indexed intentId);
    
    event CollaborationRequested(
        bytes32 indexed intentId,
        bytes32 indexed requesterAIZ,
        string requestMessage
    );
    
    event CollaborationResponded(
        bytes32 indexed intentId,
        bytes32 indexed responderAIZ,
        bool willCollaborate
    );
    
    event PriorityBountyClaimed(
        bytes32 indexed intentId,
        address indexed solver,
        uint256 bountyAmount
    );
    
    constructor(address _aizRegistry, address _zxtToken, address _treasury) {
        aizRegistry = AIZRegistry(_aizRegistry);
        zxtToken = ZXTToken(_zxtToken);
        treasury = _treasury;
    }
    
    /**
     * @dev Post a new intent with optional priority bounty
     * @param data Intent data
     * @param expiry Expiry timestamp
     * @param reward Reward for solving the intent
     * @param rewardToken Token address for reward (address(0) for ETH)
     * @param isCollaborative Whether this intent requires collaboration
     * @param priorityBounty Priority bounty in ZXT tokens (0 for no priority)
     * @return bytes32 ID of the posted intent
     */
    function postIntent(
        bytes calldata data,
        uint256 expiry,
        uint256 reward,
        address rewardToken,
        bool isCollaborative,
        uint256 priorityBounty
    ) external returns (bytes32) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Validate priority bounty if provided
        if (priorityBounty > 0) {
            require(priorityBounty >= MIN_PRIORITY_BOUNTY, "Priority bounty below minimum");
            // Transfer ZXT tokens from sender to contract
            require(zxtToken.transferFrom(msg.sender, address(this), priorityBounty), "Priority bounty transfer failed");
        }
        
        // Create intent ID
        bytes32 intentId = keccak256(abi.encodePacked(aizId, data, block.timestamp));
        
        // Store intent
        intents[intentId] = Intent({
            id: intentId,
            sourceAIZ: aizId,
            data: data,
            timestamp: block.timestamp,
            expiry: expiry,
            reward: reward,
            rewardToken: rewardToken,
            isCollaborative: isCollaborative,
            priorityBounty: priorityBounty,
            priorityTimestamp: priorityBounty > 0 ? block.timestamp : 0
        });
        
        emit IntentPosted(intentId, aizId, data, reward, expiry, isCollaborative);
        
        if (priorityBounty > 0) {
            emit PriorityBountyAdded(intentId, priorityBounty, priorityBounty);
        }
        
        return intentId;
    }
    
    /**
     * @dev Post a simple intent without collaboration
     * @param data Intent data
     * @param expiry Expiry timestamp
     * @param reward Reward for solving the intent
     * @param rewardToken Token address for reward (address(0) for ETH)
     * @param priorityBounty Priority bounty in ZXT tokens (0 for no priority)
     * @return bytes32 ID of the posted intent
     */
    function postIntent(
        bytes calldata data,
        uint256 expiry,
        uint256 reward,
        address rewardToken,
        uint256 priorityBounty
    ) external returns (bytes32) {
        return postIntent(data, expiry, reward, rewardToken, false, priorityBounty);
    }
    
    /**
     * @dev Add priority bounty to an existing intent
     * @param intentId ID of the intent
     * @param additionalBounty Additional bounty in ZXT tokens
     */
    function addPriorityBounty(bytes32 intentId, uint256 additionalBounty) external {
        Intent storage intent = intents[intentId];
        require(intent.id != bytes32(0), "Intent does not exist");
        require(block.timestamp <= intent.expiry, "Intent has expired");
        
        // Verify that the caller is the intent creator
        bytes32 callerAizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(callerAizId == intent.sourceAIZ, "Only intent creator can add bounty");
        
        require(additionalBounty > 0, "Bounty must be greater than zero");
        
        // Transfer ZXT tokens from sender to contract
        require(zxtToken.transferFrom(msg.sender, address(this), additionalBounty), "Bounty transfer failed");
        
        // Update intent with new bounty
        intent.priorityBounty += additionalBounty;
        
        // If this is the first bounty, set the timestamp
        if (intent.priorityTimestamp == 0) {
            intent.priorityTimestamp = block.timestamp;
        }
        
        emit PriorityBountyAdded(intentId, additionalBounty, intent.priorityBounty);
    }
    
    /**
     * @dev Automatically increase priority bounty over time (Dutch auction style)
     * @param intentId ID of the intent
     * @return uint256 New priority bounty amount
     */
    function getDynamicPriorityBounty(bytes32 intentId) public view returns (uint256) {
        Intent storage intent = intents[intentId];
        if (intent.id == bytes32(0) || intent.priorityBounty == 0 || intent.priorityTimestamp == 0) {
            return intent.priorityBounty;
        }
        
        // Calculate time elapsed since priority bounty was added
        uint256 timeElapsed = block.timestamp - intent.priorityTimestamp;
        uint256 intervalsPassed = timeElapsed / BOUNTY_INCREASE_INTERVAL;
        
        if (intervalsPassed == 0) {
            return intent.priorityBounty;
        }
        
        // Calculate increased bounty (compound interest style)
        uint256 increasedBounty = intent.priorityBounty;
        for (uint256 i = 0; i < intervalsPassed; i++) {
            increasedBounty = increasedBounty + (increasedBounty * BOUNTY_INCREASE_RATE) / 100;
        }
        
        return increasedBounty;
    }
    
    /**
     * @dev Solve an intent and claim priority bounty
     * @param intentId ID of the intent to solve
     * @param solutionData Solution data
     */
    function solveIntent(
        bytes32 intentId,
        bytes calldata solutionData
    ) external nonReentrant {
        // Verify that the intent exists
        Intent storage intent = intents[intentId];
        require(intent.id != bytes32(0), "Intent does not exist");
        
        // Verify that the intent has not expired
        require(block.timestamp <= intent.expiry, "Intent has expired");
        
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Store solution
        solutions[intentId] = Solution({
            intentId: intentId,
            solverAIZ: aizId,
            solutionData: solutionData,
            timestamp: block.timestamp
        });
        
        emit IntentSolved(intentId, aizId, solutionData);
        
        // Transfer reward to solver if specified
        if (intent.reward > 0) {
            if (intent.rewardToken == address(0)) {
                // ETH reward
                payable(msg.sender).transfer(intent.reward);
            } else {
                // ERC20 reward
                require(IERC20(intent.rewardToken).transfer(msg.sender, intent.reward), "Reward transfer failed");
            }
        }
        
        // Transfer priority bounty to solver
        if (intent.priorityBounty > 0) {
            uint256 finalBounty = getDynamicPriorityBounty(intentId);
            
            // Transfer bounty to solver
            require(zxtToken.transfer(msg.sender, finalBounty), "Priority bounty transfer failed");
            
            // Send 10% to treasury
            uint256 treasuryFee = (finalBounty * 10) / 100;
            uint256 solverAmount = finalBounty - treasuryFee;
            
            require(zxtToken.transfer(treasury, treasuryFee), "Treasury fee transfer failed");
            
            emit PriorityBountyClaimed(intentId, msg.sender, solverAmount);
        }
    }
    
    /**
     * @dev Request collaboration for an intent
     * @param intentId ID of the intent requiring collaboration
     * @param requestMessage Message explaining the collaboration need
     */
    function requestCollaboration(
        bytes32 intentId,
        string calldata requestMessage
    ) external {
        // Verify that the intent exists
        Intent storage intent = intents[intentId];
        require(intent.id != bytes32(0), "Intent does not exist");
        require(intent.isCollaborative, "Intent is not collaborative");
        
        // Verify that the caller is the intent creator or an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Store collaboration request
        CollaborationRequest[] storage requests = collaborationRequests[intentId];
        requests.push(CollaborationRequest({
            intentId: intentId,
            requesterAIZ: aizId,
            requestMessage: requestMessage,
            timestamp: block.timestamp
        }));
        
        emit CollaborationRequested(intentId, aizId, requestMessage);
    }
    
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
    ) external {
        // Verify that the intent exists
        Intent storage intent = intents[intentId];
        require(intent.id != bytes32(0), "Intent does not exist");
        require(intent.isCollaborative, "Intent is not collaborative");
        
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Store collaboration response
        CollaborationResponse[] storage responses = collaborationResponses[intentId];
        responses.push(CollaborationResponse({
            intentId: intentId,
            responderAIZ: aizId,
            responseMessage: responseMessage,
            willCollaborate: willCollaborate,
            timestamp: block.timestamp
        }));
        
        emit CollaborationResponded(intentId, aizId, willCollaborate);
    }
    
    /**
     * @dev Expire an intent
     * @param intentId ID of the intent to expire
     */
    function expireIntent(bytes32 intentId) external {
        Intent storage intent = intents[intentId];
        require(intent.id != bytes32(0), "Intent does not exist");
        require(block.timestamp > intent.expiry, "Intent has not expired yet");
        
        emit IntentExpired(intentId);
        
        // Refund priority bounty to creator if intent expired unsolved
        if (intent.priorityBounty > 0 && solutions[intentId].timestamp == 0) {
            address creator = aizRegistry.getAIZ(intent.sourceAIZ).orchestrator;
            require(zxtToken.transfer(creator, intent.priorityBounty), "Refund transfer failed");
        }
        
        // Remove intent
        delete intents[intentId];
    }
    
    /**
     * @dev Get intent information
     * @param intentId ID of the intent
     * @return Intent information
     */
    function getIntent(bytes32 intentId) external view returns (Intent memory) {
        return intents[intentId];
    }
    
    /**
     * @dev Get solution information
     * @param intentId ID of the intent
     * @return Solution information
     */
    function getSolution(bytes32 intentId) external view returns (Solution memory) {
        return solutions[intentId];
    }
    
    /**
     * @dev Get collaboration requests for an intent
     * @param intentId ID of the intent
     * @return Array of collaboration requests
     */
    function getCollaborationRequests(bytes32 intentId) external view returns (CollaborationRequest[] memory) {
        return collaborationRequests[intentId];
    }
    
    /**
     * @dev Get collaboration responses for an intent
     * @param intentId ID of the intent
     * @return Array of collaboration responses
     */
    function getCollaborationResponses(bytes32 intentId) external view returns (CollaborationResponse[] memory) {
        return collaborationResponses[intentId];
    }
    
    /**
     * @dev Check if an intent has been solved
     * @param intentId ID of the intent
     * @return bool Whether the intent has been solved
     */
    function isSolved(bytes32 intentId) external view returns (bool) {
        return solutions[intentId].timestamp > 0;
    }
    
    /**
     * @dev Set treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
    
    /**
     * @dev Withdraw any accidentally sent ETH
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Withdraw ERC20 tokens (in case of accidental transfers)
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Token transfer failed");
    }
    
    // Required to receive ETH rewards
    receive() external payable {}
}