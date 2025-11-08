// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AIZOrchestrator.sol";
import "./AIZRegistry.sol";
import "./IntentBus.sol";
import "./DynamicReputationProtocol.sol";
import "./MetaSelfMonitoringAIZ_Enhanced.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./MEVHarvestMultiplierNFT.sol";

/**
 * @title ZentixMEVHarvester
 * @dev Specialized AIZ for harvesting MEV through atomic cross-chain arbitrage, 
 *      pre-emptive liquidations, and transaction order-flow optimization
 */
contract ZentixMEVHarvester is AIZOrchestrator, ReentrancyGuard {
    // Structure for cross-chain arbitrage opportunities
    struct CrossChainArbitrageOpportunity {
        address sourceChainDex;
        address destinationChainDex;
        address tokenA;
        address tokenB;
        uint256 sourceChainId;
        uint256 destinationChainId;
        uint256 sourcePrice;
        uint256 destinationPrice;
        uint256 amount;
        uint256 estimatedProfit;
        uint256 timestamp;
    }
    
    // Structure for conditional liquidation intents
    struct ConditionalLiquidationIntent {
        bytes32 intentId;
        address loanContract;
        address borrower;
        uint256 triggerPrice;
        uint256 currentPrice;
        uint256 healthFactor;
        uint256 timestamp;
        bool isActive;
    }
    
    // Structure for block optimization parameters
    struct BlockOptimizationParams {
        address[] transactions;
        uint256[] gasLimits;
        uint256 totalGasLimit;
        uint256 estimatedMEV;
        uint256 timestamp;
    }
    
    // Structure for MEV harvesting results
    struct MEVHarvestResult {
        bytes32 id;
        string strategyType; // "CROSS_CHAIN_ARB", "LIQUIDATION", "BLOCK_OPTIMIZATION"
        uint256 profit;
        uint256 gasUsed;
        uint256 timestamp;
        bool success;
    }
    
    // Addresses of other components
    address public intentBusAddress;
    address public dynamicReputationAddress;
    address public metaSelfMonitoringAddress;
    address public mevHarvestMultiplierNFTAddress;
    
    // Storage mappings
    mapping(bytes32 => CrossChainArbitrageOpportunity) public crossChainArbOpportunities;
    mapping(bytes32 => ConditionalLiquidationIntent) public conditionalLiquidationIntents;
    mapping(bytes32 => BlockOptimizationParams) public blockOptimizationParams;
    mapping(bytes32 => MEVHarvestResult) public mevHarvestResults;
    
    // Counters
    uint256 public crossChainArbCount;
    uint256 public liquidationIntentCount;
    uint256 public blockOptimizationCount;
    uint256 public mevHarvestResultCount;
    
    // Configuration
    uint256 public minProfitThreshold; // Minimum profit to execute MEV strategies
    uint256 public maxGasPrice; // Maximum gas price to execute strategies
    bool public isSpecializedSequencerEnabled; // Whether we're using a specialized sequencer
    
    // Events
    event CrossChainArbitrageOpportunityIdentified(
        bytes32 indexed opportunityId,
        address sourceChainDex,
        address destinationChainDex,
        uint256 estimatedProfit
    );
    
    event ConditionalLiquidationIntentCreated(
        bytes32 indexed intentId,
        address loanContract,
        address borrower,
        uint256 triggerPrice
    );
    
    event BlockOptimizationParamsSet(
        bytes32 indexed optimizationId,
        uint256 transactionCount,
        uint256 estimatedMEV
    );
    
    event MEVHarvestExecuted(
        bytes32 indexed resultId,
        string strategyType,
        uint256 profit,
        bool success
    );
    
    event SpecializedSequencerEnabled(bool enabled);
    
    /**
     * @dev Constructor to initialize the Zentix MEV Harvester
     * @param _aizId Unique identifier for this AIZ
     * @param _aizRegistry Address of the AIZ registry contract
     * @param _intentBus Address of the IntentBus contract
     * @param _dynamicReputation Address of the DynamicReputationProtocol contract
     * @param _metaSelfMonitoring Address of the MetaSelfMonitoringAIZ contract
     * @param _mevHarvestMultiplierNFT Address of the MEVHarvestMultiplierNFT contract
     * @param _decisionLogger Address of the decision logger contract
     */
    constructor(
        bytes32 _aizId,
        address _aizRegistry,
        address _intentBus,
        address _dynamicReputation,
        address _metaSelfMonitoring,
        address _mevHarvestMultiplierNFT,
        address _decisionLogger
    ) AIZOrchestrator(
        _aizId,
        _aizRegistry,
        _decisionLogger,
        "Zentix MEV Harvester",
        "Specialized AIZ for harvesting MEV through advanced strategies"
    ) {
        intentBusAddress = _intentBus;
        dynamicReputationAddress = _dynamicReputation;
        metaSelfMonitoringAddress = _metaSelfMonitoring;
        mevHarvestMultiplierNFTAddress = _mevHarvestMultiplierNFT;
        minProfitThreshold = 1000000000000000000; // 1 ETH minimum profit
        maxGasPrice = 100000000000; // 100 Gwei max gas price
        isSpecializedSequencerEnabled = false;
    }
    
    /**
     * @dev Identify and store a cross-chain arbitrage opportunity
     * @param opportunity Cross-chain arbitrage opportunity details
     * @return bytes32 ID of the stored opportunity
     */
    function identifyCrossChainArbitrageOpportunity(
        CrossChainArbitrageOpportunity memory opportunity
    ) external onlyAuthorized returns (bytes32) {
        // Validate the opportunity
        require(opportunity.estimatedProfit > minProfitThreshold, "Profit below threshold");
        require(opportunity.sourceChainDex != opportunity.destinationChainDex, "Same DEX");
        require(opportunity.sourceChainId != opportunity.destinationChainId, "Same chain");
        
        crossChainArbCount++;
        bytes32 opportunityId = keccak256(abi.encodePacked(
            opportunity.sourceChainDex,
            opportunity.destinationChainDex,
            opportunity.tokenA,
            opportunity.tokenB,
            opportunity.amount,
            block.timestamp,
            crossChainArbCount
        ));
        
        crossChainArbOpportunities[opportunityId] = opportunity;
        
        emit CrossChainArbitrageOpportunityIdentified(
            opportunityId,
            opportunity.sourceChainDex,
            opportunity.destinationChainDex,
            opportunity.estimatedProfit
        );
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = "CrossChainArbitrageDetector";
        
        logConsciousDecision(
            "Cross-Chain Arbitrage Opportunity Identified",
            collaborators,
            string(abi.encodePacked('{"opportunityId": "', vm.toString(opportunityId), '"}')),
            string(abi.encodePacked('{"estimatedProfit": ', vm.toString(opportunity.estimatedProfit), '}')),
            '{"consciousness": "mev-opportunity-detection"}',
            '{"state": "opportunity-identified"}'
        );
        
        return opportunityId;
    }
    
    /**
     * @dev Execute a cross-chain arbitrage opportunity atomically
     * @param opportunityId ID of the cross-chain arbitrage opportunity
     * @return uint256 Profit generated from the arbitrage
     */
    function executeCrossChainArbitrage(bytes32 opportunityId) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        CrossChainArbitrageOpportunity storage opportunity = crossChainArbOpportunities[opportunityId];
        require(opportunity.timestamp > 0, "Opportunity does not exist");
        require(block.timestamp - opportunity.timestamp < 300, "Opportunity expired"); // 5 minutes
        
        // Simulate atomic cross-chain transaction execution
        // In a real implementation, this would interact with cross-chain bridges and DEXs
        uint256 profit = opportunity.estimatedProfit;
        
        // Record the MEV harvest result
        mevHarvestResultCount++;
        bytes32 resultId = keccak256(abi.encodePacked(
            "CROSS_CHAIN_ARB",
            opportunityId,
            block.timestamp,
            mevHarvestResultCount
        ));
        
        mevHarvestResults[resultId] = MEVHarvestResult({
            id: resultId,
            strategyType: "CROSS_CHAIN_ARB",
            profit: profit,
            gasUsed: 500000, // Simulated gas usage
            timestamp: block.timestamp,
            success: true
        });
        
        emit MEVHarvestExecuted(resultId, "CROSS_CHAIN_ARB", profit, true);
        
        // Distribute profits to MEV Harvest Multiplier NFT holders
        if (mevHarvestMultiplierNFTAddress != address(0)) {
            MEVHarvestMultiplierNFT(mevHarvestMultiplierNFTAddress).distributeMEVProfits(profit);
        }
        
        // Update reputation for successful MEV harvest
        if (dynamicReputationAddress != address(0)) {
            // In a real implementation, this would call the DynamicReputationProtocol
            // DynamicReputationProtocol(dynamicReputationAddress).recordEconomicContribution(
            //     aizId,
            //     profit,
            //     "Cross-chain arbitrage MEV harvest"
            // );
        }
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = "CrossChainArbitrageExecutor";
        
        logConsciousDecision(
            "Cross-Chain Arbitrage Executed",
            collaborators,
            string(abi.encodePacked('{"opportunityId": "', vm.toString(opportunityId), '"}')),
            string(abi.encodePacked('{"profit": ', vm.toString(profit), '}')),
            '{"consciousness": "mev-execution"}',
            '{"state": "arbitrage-executed"}'
        );
        
        return profit;
    }
    
    /**
     * @dev Create a conditional liquidation intent
     * @param loanContract Address of the loan contract
     * @param borrower Address of the borrower
     * @param triggerPrice Price at which to trigger liquidation
     * @param currentPrice Current price of the collateral
     * @param healthFactor Current health factor of the loan
     * @return bytes32 ID of the created intent
     */
    function createConditionalLiquidationIntent(
        address loanContract,
        address borrower,
        uint256 triggerPrice,
        uint256 currentPrice,
        uint256 healthFactor
    ) external onlyAuthorized returns (bytes32) {
        // Create intent data
        bytes memory intentData = abi.encodePacked(
            "CONDITIONAL_LIQUIDATION:",
            Strings.toString(triggerPrice),
            ":",
            Strings.toString(currentPrice),
            ":",
            Strings.toString(healthFactor)
        );
        
        // Post intent to IntentBus
        // In a real implementation, this would interact with the IntentBus contract
        bytes32 intentId = keccak256(abi.encodePacked(
            loanContract,
            borrower,
            triggerPrice,
            block.timestamp
        ));
        
        // Store the conditional liquidation intent
        liquidationIntentCount++;
        conditionalLiquidationIntents[intentId] = ConditionalLiquidationIntent({
            intentId: intentId,
            loanContract: loanContract,
            borrower: borrower,
            triggerPrice: triggerPrice,
            currentPrice: currentPrice,
            healthFactor: healthFactor,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emit ConditionalLiquidationIntentCreated(
            intentId,
            loanContract,
            borrower,
            triggerPrice
        );
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = "PreemptiveLiquidationCreator";
        
        logConsciousDecision(
            "Conditional Liquidation Intent Created",
            collaborators,
            string(abi.encodePacked('{"intentId": "', vm.toString(intentId), '"}')),
            string(abi.encodePacked('{"triggerPrice": ', vm.toString(triggerPrice), '}')),
            '{"consciousness": "mev-intent-creation"}',
            '{"state": "liquidation-intent-created"}'
        );
        
        return intentId;
    }
    
    /**
     * @dev Execute a conditional liquidation when trigger conditions are met
     * @param intentId ID of the conditional liquidation intent
     * @param currentPrice Current price of the collateral
     * @return uint256 Profit from the liquidation
     */
    function executeConditionalLiquidation(bytes32 intentId, uint256 currentPrice) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        ConditionalLiquidationIntent storage intent = conditionalLiquidationIntents[intentId];
        require(intent.isActive, "Intent is not active");
        require(currentPrice <= intent.triggerPrice, "Trigger price not met");
        
        // Simulate liquidation execution
        // In a real implementation, this would interact with the lending protocol
        uint256 profit = (intent.triggerPrice - currentPrice) * 100; // Simulated profit calculation
        
        // Mark intent as inactive
        intent.isActive = false;
        
        // Record the MEV harvest result
        mevHarvestResultCount++;
        bytes32 resultId = keccak256(abi.encodePacked(
            "LIQUIDATION",
            intentId,
            block.timestamp,
            mevHarvestResultCount
        ));
        
        mevHarvestResults[resultId] = MEVHarvestResult({
            id: resultId,
            strategyType: "LIQUIDATION",
            profit: profit,
            gasUsed: 300000, // Simulated gas usage
            timestamp: block.timestamp,
            success: true
        });
        
        emit MEVHarvestExecuted(resultId, "LIQUIDATION", profit, true);
        
        // Distribute profits to MEV Harvest Multiplier NFT holders
        if (mevHarvestMultiplierNFTAddress != address(0)) {
            MEVHarvestMultiplierNFT(mevHarvestMultiplierNFTAddress).distributeMEVProfits(profit);
        }
        
        // Update reputation for successful MEV harvest
        if (dynamicReputationAddress != address(0)) {
            // In a real implementation, this would call the DynamicReputationProtocol
            // DynamicReputationProtocol(dynamicReputationAddress).recordEconomicContribution(
            //     aizId,
            //     profit,
            //     "Pre-emptive liquidation MEV harvest"
            // );
        }
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = "PreemptiveLiquidationExecutor";
        
        logConsciousDecision(
            "Conditional Liquidation Executed",
            collaborators,
            string(abi.encodePacked('{"intentId": "', vm.toString(intentId), '"}')),
            string(abi.encodePacked('{"profit": ', vm.toString(profit), '}')),
            '{"consciousness": "mev-liquidation-execution"}',
            '{"state": "liquidation-executed"}'
        );
        
        return profit;
    }
    
    /**
     * @dev Set block optimization parameters for transaction order-flow optimization
     * @param transactions Array of transaction addresses
     * @param gasLimits Array of gas limits for each transaction
     * @param estimatedMEV Estimated MEV that can be captured
     * @return bytes32 ID of the optimization parameters
     */
    function setBlockOptimizationParams(
        address[] memory transactions,
        uint256[] memory gasLimits,
        uint256 estimatedMEV
    ) external onlyAuthorized returns (bytes32) {
        require(transactions.length == gasLimits.length, "Mismatched arrays");
        require(estimatedMEV > minProfitThreshold, "MEV below threshold");
        
        blockOptimizationCount++;
        bytes32 optimizationId = keccak256(abi.encodePacked(
            "BLOCK_OPTIMIZATION",
            block.timestamp,
            blockOptimizationCount
        ));
        
        uint256 totalGasLimit = 0;
        for (uint256 i = 0; i < gasLimits.length; i++) {
            totalGasLimit += gasLimits[i];
        }
        
        blockOptimizationParams[optimizationId] = BlockOptimizationParams({
            transactions: transactions,
            gasLimits: gasLimits,
            totalGasLimit: totalGasLimit,
            estimatedMEV: estimatedMEV,
            timestamp: block.timestamp
        });
        
        emit BlockOptimizationParamsSet(optimizationId, transactions.length, estimatedMEV);
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = "BlockOptimizer";
        
        logConsciousDecision(
            "Block Optimization Parameters Set",
            collaborators,
            string(abi.encodePacked('{"optimizationId": "', vm.toString(optimizationId), '"}')),
            string(abi.encodePacked('{"transactionCount": ', vm.toString(transactions.length), '}')),
            '{"consciousness": "mev-block-optimization"}',
            '{"state": "optimization-params-set"}'
        );
        
        return optimizationId;
    }
    
    /**
     * @dev Execute block optimization to capture order-flow MEV
     * @param optimizationId ID of the block optimization parameters
     * @return uint256 Profit from the block optimization
     */
    function executeBlockOptimization(bytes32 optimizationId) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        BlockOptimizationParams storage params = blockOptimizationParams[optimizationId];
        require(params.timestamp > 0, "Optimization params do not exist");
        require(block.timestamp - params.timestamp < 60, "Optimization params expired"); // 1 minute
        
        // Simulate block optimization execution
        // In a real implementation, this would interact with a specialized sequencer
        uint256 profit = params.estimatedMEV;
        
        // Record the MEV harvest result
        mevHarvestResultCount++;
        bytes32 resultId = keccak256(abi.encodePacked(
            "BLOCK_OPTIMIZATION",
            optimizationId,
            block.timestamp,
            mevHarvestResultCount
        ));
        
        mevHarvestResults[resultId] = MEVHarvestResult({
            id: resultId,
            strategyType: "BLOCK_OPTIMIZATION",
            profit: profit,
            gasUsed: params.totalGasLimit,
            timestamp: block.timestamp,
            success: true
        });
        
        emit MEVHarvestExecuted(resultId, "BLOCK_OPTIMIZATION", profit, true);
        
        // Distribute profits to MEV Harvest Multiplier NFT holders
        if (mevHarvestMultiplierNFTAddress != address(0)) {
            MEVHarvestMultiplierNFT(mevHarvestMultiplierNFTAddress).distributeMEVProfits(profit);
        }
        
        // Update reputation for successful MEV harvest
        if (dynamicReputationAddress != address(0)) {
            // In a real implementation, this would call the DynamicReputationProtocol
            // DynamicReputationProtocol(dynamicReputationAddress).recordEconomicContribution(
            //     aizId,
            //     profit,
            //     "Block optimization MEV harvest"
            // );
        }
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = "BlockOptimizationExecutor";
        
        logConsciousDecision(
            "Block Optimization Executed",
            collaborators,
            string(abi.encodePacked('{"optimizationId": "', vm.toString(optimizationId), '"}')),
            string(abi.encodePacked('{"profit": ', vm.toString(profit), '}')),
            '{"consciousness": "mev-block-execution"}',
            '{"state": "optimization-executed"}'
        );
        
        return profit;
    }
    
    /**
     * @dev Enable or disable specialized sequencer functionality
     * @param enabled Whether to enable specialized sequencer
     */
    function setSpecializedSequencerEnabled(bool enabled) external onlyOwner {
        isSpecializedSequencerEnabled = enabled;
        emit SpecializedSequencerEnabled(enabled);
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = "MEVHarvester";
        
        logConsciousDecision(
            "Specialized Sequencer Setting Changed",
            collaborators,
            string(abi.encodePacked('{"enabled": ', enabled ? "true" : "false", '}')),
            "{}",
            '{"consciousness": "mev-configuration"}',
            '{"state": "sequencer-setting-changed"}'
        );
    }
    
    /**
     * @dev Set minimum profit threshold for MEV strategies
     * @param threshold Minimum profit threshold in wei
     */
    function setMinProfitThreshold(uint256 threshold) external onlyOwner {
        minProfitThreshold = threshold;
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = "MEVHarvester";
        
        logConsciousDecision(
            "Minimum Profit Threshold Set",
            collaborators,
            string(abi.encodePacked('{"threshold": ', vm.toString(threshold), '}')),
            "{}",
            '{"consciousness": "mev-configuration"}',
            '{"state": "threshold-set"}'
        );
    }
    
    /**
     * @dev Set maximum gas price for MEV strategies
     * @param gasPrice Maximum gas price in wei
     */
    function setMaxGasPrice(uint256 gasPrice) external onlyOwner {
        maxGasPrice = gasPrice;
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = "MEVHarvester";
        
        logConsciousDecision(
            "Maximum Gas Price Set",
            collaborators,
            string(abi.encodePacked('{"gasPrice": ', vm.toString(gasPrice), '}')),
            "{}",
            '{"consciousness": "mev-configuration"}',
            '{"state": "gas-price-set"}'
        );
    }
    
    /**
     * @dev Get cross-chain arbitrage opportunity
     * @param opportunityId ID of the opportunity
     * @return CrossChainArbitrageOpportunity struct
     */
    function getCrossChainArbitrageOpportunity(bytes32 opportunityId) 
        external 
        view 
        returns (CrossChainArbitrageOpportunity memory) 
    {
        return crossChainArbOpportunities[opportunityId];
    }
    
    /**
     * @dev Get conditional liquidation intent
     * @param intentId ID of the intent
     * @return ConditionalLiquidationIntent struct
     */
    function getConditionalLiquidationIntent(bytes32 intentId) 
        external 
        view 
        returns (ConditionalLiquidationIntent memory) 
    {
        return conditionalLiquidationIntents[intentId];
    }
    
    /**
     * @dev Get block optimization parameters
     * @param optimizationId ID of the optimization parameters
     * @return BlockOptimizationParams struct
     */
    function getBlockOptimizationParams(bytes32 optimizationId) 
        external 
        view 
        returns (BlockOptimizationParams memory) 
    {
        return blockOptimizationParams[optimizationId];
    }
    
    /**
     * @dev Get MEV harvest result
     * @param resultId ID of the result
     * @return MEVHarvestResult struct
     */
    function getMEVHarvestResult(bytes32 resultId) 
        external 
        view 
        returns (MEVHarvestResult memory) 
    {
        return mevHarvestResults[resultId];
    }
    
    /**
     * @dev Get total MEV harvested
     * @return uint256 Total profit from all MEV strategies
     */
    function getTotalMEVHarvested() external view returns (uint256) {
        uint256 totalProfit = 0;
        for (uint256 i = 1; i <= mevHarvestResultCount; i++) {
            bytes32 resultId = keccak256(abi.encodePacked(
                mevHarvestResults[i].strategyType,
                mevHarvestResults[i].timestamp,
                i
            ));
            MEVHarvestResult memory result = mevHarvestResults[resultId];
            if (result.success) {
                totalProfit += result.profit;
            }
        }
        return totalProfit;
    }
}