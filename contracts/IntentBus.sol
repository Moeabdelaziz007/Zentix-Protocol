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
import "./AIZRegistry.sol";

/**
 * @title IntentBus
 * @dev Intent-based communication bus for Autonomous AI Zones
 * Allows AIZs to post intents and other AIZs to solve them
 */
contract IntentBus is Ownable {
    struct Intent {
        bytes32 id;                    // Unique identifier for the intent
        bytes32 sourceAIZ;             // AIZ ID of the intent creator
        bytes data;                    // Intent data
        uint256 timestamp;             // When the intent was created
        uint256 expiry;                // When the intent expires
        uint256 reward;                // Reward for solving the intent (in wei)
        address rewardToken;           // Token address for reward (address(0) for ETH)
    }
    
    struct Solution {
        bytes32 intentId;              // ID of the intent being solved
        bytes32 solverAIZ;             // AIZ ID of the solver
        bytes solutionData;            // Solution data
        uint256 timestamp;             // When the solution was submitted
    }
    
    // Mapping of intent ID to intent
    mapping(bytes32 => Intent) public intents;
    
    // Mapping of intent ID to solution
    mapping(bytes32 => Solution) public solutions;
    
    // Reference to AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Events
    event IntentPosted(
        bytes32 indexed intentId,
        bytes32 indexed sourceAIZ,
        bytes data,
        uint256 reward,
        uint256 expiry
    );
    
    event IntentSolved(
        bytes32 indexed intentId,
        bytes32 indexed solverAIZ,
        bytes solutionData
    );
    
    event IntentExpired(bytes32 indexed intentId);
    
    constructor(address _aizRegistry) {
        aizRegistry = AIZRegistry(_aizRegistry);
    }
    
    /**
     * @dev Post a new intent
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
    ) external returns (bytes32) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
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
            rewardToken: rewardToken
        });
        
        emit IntentPosted(intentId, aizId, data, reward, expiry);
        
        return intentId;
    }
    
    /**
     * @dev Solve an intent
     * @param intentId ID of the intent to solve
     * @param solutionData Solution data
     */
    function solveIntent(
        bytes32 intentId,
        bytes calldata solutionData
    ) external {
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
        
        // TODO: Transfer reward to solver
        // This would require implementing reward distribution logic
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
     * @dev Check if an intent has been solved
     * @param intentId ID of the intent
     * @return bool Whether the intent has been solved
     */
    function isSolved(bytes32 intentId) external view returns (bool) {
        return solutions[intentId].timestamp > 0;
    }
}