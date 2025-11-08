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
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IL2ToL2CrossDomainMessenger} from "@eth-optimism/contracts-bedrock/src/L2/interfaces/IL2ToL2CrossDomainMessenger.sol";
import "./ConsciousDecisionLogger.sol";
import "./ConsciousAgentRegistry.sol";

/**
 * @title CrossChainArbitrageAgent
 * @dev Cross-chain arbitrage agent that detects price differences and executes trades across Superchain
 * Uses flash loans and cross-chain messaging to maximize profits
 */
contract CrossChainArbitrageAgent is Ownable {
    struct ArbitrageOpportunity {
        uint256 id;
        address tokenA;
        address tokenB;
        uint256 chainIdA;
        uint256 chainIdB;
        address dexA;
        address dexB;
        uint256 priceA;
        uint256 priceB;
        uint256 amount;
        uint256 estimatedProfit;
        uint256 timestamp;
        bool executed;
    }

    struct CrossChainExecution {
        uint256 opportunityId;
        uint256 sourceChainId;
        uint256 destinationChainId;
        address sourceContract;
        address destinationContract;
        uint256 amount;
        address token;
        uint256 timestamp;
    }

    // Reference to the L2ToL2CrossDomainMessenger
    IL2ToL2CrossDomainMessenger public crossDomainMessenger;
    
    // Reference to ConsciousDecisionLogger
    ConsciousDecisionLogger public decisionLogger;
    
    // Reference to ConsciousAgentRegistry
    ConsciousAgentRegistry public agentRegistry;
    
    // Mapping of opportunity IDs to opportunities
    mapping(uint256 => ArbitrageOpportunity) public opportunities;
    
    // Mapping of execution IDs to cross-chain executions
    mapping(uint256 => CrossChainExecution) public executions;
    
    // Counter for IDs
    uint256 public opportunityCounter;
    uint256 public executionCounter;
    
    // Authorized executors
    mapping(address => bool) public authorizedExecutors;
    
    // Treasury address for collecting profits
    address public treasury;
    
    // Flash loan fee (0.03% = 3 basis points)
    uint256 public constant FLASH_LOAN_FEE_BPS = 3;
    
    // Events
    event ArbitrageOpportunityDetected(
        uint256 indexed opportunityId,
        address tokenA,
        address tokenB,
        uint256 chainIdA,
        uint256 chainIdB,
        uint256 priceA,
        uint256 priceB,
        uint256 estimatedProfit
    );
    
    event CrossChainExecutionInitiated(
        uint256 indexed executionId,
        uint256 indexed opportunityId,
        uint256 sourceChainId,
        uint256 destinationChainId,
        uint256 amount
    );
    
    event CrossChainExecutionReceived(
        uint256 indexed executionId,
        uint256 indexed opportunityId,
        uint256 sourceChainId,
        uint256 destinationChainId
    );
    
    event ArbitrageExecuted(
        uint256 indexed opportunityId,
        uint256 profit,
        address token,
        uint256 chainId
    );
    
    event ProfitCollected(
        uint256 amount,
        address token,
        address to
    );

    /**
     * @dev Constructor to initialize the contract
     * @param _crossDomainMessenger Address of the L2ToL2CrossDomainMessenger
     * @param _decisionLogger Address of the ConsciousDecisionLogger
     * @param _agentRegistry Address of the ConsciousAgentRegistry
     * @param _treasury Treasury address for collecting profits
     */
    constructor(
        address _crossDomainMessenger,
        address _decisionLogger,
        address _agentRegistry,
        address _treasury
    ) {
        crossDomainMessenger = IL2ToL2CrossDomainMessenger(_crossDomainMessenger);
        decisionLogger = ConsciousDecisionLogger(_decisionLogger);
        agentRegistry = ConsciousAgentRegistry(_agentRegistry);
        treasury = _treasury;
        opportunityCounter = 0;
        executionCounter = 0;
    }

    /**
     * @dev Detect arbitrage opportunity across chains
     * @param tokenA Token A address
     * @param tokenB Token B address
     * @param chainIdA Chain ID for token A
     * @param chainIdB Chain ID for token B
     * @param dexA DEX address on chain A
     * @param dexB DEX address on chain B
     * @param priceA Price of token on chain A
     * @param priceB Price of token on chain B
     * @param amount Trade amount
     */
    function detectArbitrageOpportunity(
        address tokenA,
        address tokenB,
        uint256 chainIdA,
        uint256 chainIdB,
        address dexA,
        address dexB,
        uint256 priceA,
        uint256 priceB,
        uint256 amount
    ) external onlyOwner {
        // Calculate price difference
        uint256 priceDiff = priceA > priceB ? priceA - priceB : priceB - priceA;
        uint256 priceDiffPercent = (priceDiff * 10000) / ((priceA + priceB) / 2); // Basis points
        
        // Calculate estimated profit (excluding flash loan fee)
        uint256 fee = (amount * FLASH_LOAN_FEE_BPS) / 10000;
        uint256 estimatedProfit = (amount * priceDiffPercent) / 10000 - fee;
        
        // Only create opportunity if profit is positive
        if (estimatedProfit > 0) {
            opportunityCounter++;
            uint256 opportunityId = opportunityCounter;
            
            opportunities[opportunityId] = ArbitrageOpportunity({
                id: opportunityId,
                tokenA: tokenA,
                tokenB: tokenB,
                chainIdA: chainIdA,
                chainIdB: chainIdB,
                dexA: dexA,
                dexB: dexB,
                priceA: priceA,
                priceB: priceB,
                amount: amount,
                estimatedProfit: estimatedProfit,
                timestamp: block.timestamp,
                executed: false
            });
            
            emit ArbitrageOpportunityDetected(
                opportunityId,
                tokenA,
                tokenB,
                chainIdA,
                chainIdB,
                priceA,
                priceB,
                estimatedProfit
            );
            
            // Log the decision
            string[] memory collaborators = new string[](0);
            decisionLogger.logConsciousDecision(
                "arbitrage-agent",
                "Cross-chain arbitrage opportunity detected",
                collaborators,
                '{"skill": "arbitrage_detection"}',
                '{"role": "profit_optimizer"}',
                '{"state": "opportunity_detected", "profit": estimatedProfit}',
                "arbitrage_opportunity"
            );
        }
    }

    /**
     * @dev Initiate cross-chain execution
     * @param opportunityId ID of the arbitrage opportunity
     * @param destinationChainId Destination chain ID
     * @param destinationContract Address of contract on destination chain
     */
    function initiateCrossChainExecution(
        uint256 opportunityId,
        uint256 destinationChainId,
        address destinationContract
    ) external {
        require(opportunityId > 0 && opportunityId <= opportunityCounter, "Invalid opportunity ID");
        ArbitrageOpportunity storage opportunity = opportunities[opportunityId];
        require(!opportunity.executed, "Opportunity already executed");
        
        // Verify sender is authorized
        require(authorizedExecutors[msg.sender] || msg.sender == owner(), "Unauthorized executor");
        
        executionCounter++;
        uint256 executionId = executionCounter;
        
        executions[executionId] = CrossChainExecution({
            opportunityId: opportunityId,
            sourceChainId: block.chainid,
            destinationChainId: destinationChainId,
            sourceContract: address(this),
            destinationContract: destinationContract,
            amount: opportunity.amount,
            token: opportunity.tokenA,
            timestamp: block.timestamp
        });
        
        // Prepare calldata for the destination contract
        bytes memory message = abi.encodeWithSelector(
            this.executeCrossChainArbitrage.selector,
            opportunityId,
            opportunity.tokenA,
            opportunity.tokenB,
            opportunity.dexA,
            opportunity.dexB,
            opportunity.priceA,
            opportunity.priceB,
            opportunity.amount
        );
        
        // Send the message via the cross-domain messenger
        uint256 nonce = crossDomainMessenger.sendMessage(
            destinationChainId,
            destinationContract,
            message,
            1000000 // Gas limit
        );
        
        emit CrossChainExecutionInitiated(
            executionId,
            opportunityId,
            block.chainid,
            destinationChainId,
            opportunity.amount
        );
    }

    /**
     * @dev Execute cross-chain arbitrage (called via cross-chain message)
     * @param opportunityId ID of the arbitrage opportunity
     * @param tokenA Token A address
     * @param tokenB Token B address
     * @param dexA DEX address on source chain
     * @param dexB DEX address on destination chain
     * @param priceA Price of token on source chain
     * @param priceB Price of token on destination chain
     * @param amount Trade amount
     */
    function executeCrossChainArbitrage(
        uint256 opportunityId,
        address tokenA,
        address tokenB,
        address dexA,
        address dexB,
        uint256 priceA,
        uint256 priceB,
        uint256 amount
    ) external {
        // Verify the sender is authorized
        require(
            agentRegistry.isAuthorizedAgentContract(
                crossDomainMessenger.xDomainMessageSenderChain(),
                crossDomainMessenger.xDomainMessageSender()
            ),
            "Unauthorized cross-chain sender"
        );
        
        // Get source information
        uint256 sourceChainId = crossDomainMessenger.xDomainMessageSenderChain();
        address sourceContract = crossDomainMessenger.xDomainMessageSender();
        
        executionCounter++;
        uint256 executionId = executionCounter;
        
        executions[executionId] = CrossChainExecution({
            opportunityId: opportunityId,
            sourceChainId: sourceChainId,
            destinationChainId: block.chainid,
            sourceContract: sourceContract,
            destinationContract: address(this),
            amount: amount,
            token: tokenA,
            timestamp: block.timestamp
        });
        
        emit CrossChainExecutionReceived(
            executionId,
            opportunityId,
            sourceChainId,
            block.chainid
        );
        
        // Execute the arbitrage (simplified for this example)
        // In a real implementation, this would involve:
        // 1. Taking a flash loan
        // 2. Buying token on source chain DEX
        // 3. Bridging tokens to destination chain
        // 4. Selling token on destination chain DEX
        // 5. Repaying flash loan
        // 6. Sending profit to treasury
        
        uint256 profit = (amount * (priceB > priceA ? priceB - priceA : 0)) / priceA;
        if (profit > 0) {
            // Simulate profit collection
            emit ArbitrageExecuted(
                opportunityId,
                profit,
                tokenA,
                block.chainid
            );
            
            // Mark opportunity as executed
            if (sourceChainId == block.chainid) {
                opportunities[opportunityId].executed = true;
            }
        }
    }

    /**
     * @dev Authorize an executor
     * @param executor Address of the executor
     */
    function authorizeExecutor(address executor) external onlyOwner {
        authorizedExecutors[executor] = true;
    }

    /**
     * @dev Revoke executor authorization
     * @param executor Address of the executor
     */
    function revokeExecutorAuthorization(address executor) external onlyOwner {
        authorizedExecutors[executor] = false;
    }

    /**
     * @dev Set treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    /**
     * @dev Collect profit to treasury
     * @param token Token address
     * @param amount Amount to collect
     */
    function collectProfit(address token, uint256 amount) external onlyOwner {
        require(treasury != address(0), "Treasury not set");
        IERC20(token).transfer(treasury, amount);
        emit ProfitCollected(amount, token, treasury);
    }

    /**
     * @dev Get opportunity details
     * @param opportunityId ID of the opportunity
     * @return Arbitrage opportunity
     */
    function getOpportunity(uint256 opportunityId) external view returns (ArbitrageOpportunity memory) {
        return opportunities[opportunityId];
    }

    /**
     * @dev Get execution details
     * @param executionId ID of the execution
     * @return Cross-chain execution
     */
    function getExecution(uint256 executionId) external view returns (CrossChainExecution memory) {
        return executions[executionId];
    }
}