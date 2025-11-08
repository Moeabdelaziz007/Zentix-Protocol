#!/usr/bin/env tsx
/**
 * Test Script for Meta Self-Monitoring AIZ
 * Tests the self-monitoring capabilities of the MetaSelfMonitoringAIZ contract
 */

import { ethers } from 'ethers';
import { AIZRegistry__factory } from './typechain-types/factories/AIZRegistry__factory';
import { ConsciousDecisionLogger__factory } from './typechain-types/factories/ConsciousDecisionLogger__factory';
import { MetaSelfMonitoringAIZ__factory } from './typechain-types/factories/MetaSelfMonitoringAIZ__factory';

async function main() {
  console.log('\n🧪 TESTING META SELF-MONITORING AIZ\n');
  console.log('='.repeat(50));

  try {
    // Get the test wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

    console.log(`\n📍 Test Wallet Address: ${wallet.address}\n`);

    // Deploy the contracts for testing
    console.log('1️⃣  Deploying Contracts for Testing...');
    
    // Deploy AIZ Registry
    const aizRegistryFactory = new AIZRegistry__factory(wallet);
    const aizRegistry = await aizRegistryFactory.deploy();
    await aizRegistry.waitForDeployment();
    const aizRegistryAddress = await aizRegistry.getAddress();
    console.log(`   ✅ AIZ Registry deployed at: ${aizRegistryAddress}`);

    // Deploy Conscious Decision Logger
    const decisionLoggerFactory = new ConsciousDecisionLogger__factory(wallet);
    const decisionLogger = await decisionLoggerFactory.deploy();
    await decisionLogger.waitForDeployment();
    const decisionLoggerAddress = await decisionLogger.getAddress();
    console.log(`   ✅ Decision Logger deployed at: ${decisionLoggerAddress}`);

    // Deploy Meta Self-Monitoring AIZ
    const aizId = ethers.encodeBytes32String('TEST-META-AIZ');
    const aizName = 'TestMetaSelfMonitoringAIZ';
    const aizDescription = 'Test AIZ for self-monitoring capabilities';
    
    const metaSelfMonitoringAIZFactory = new MetaSelfMonitoringAIZ__factory(wallet);
    const metaSelfMonitoringAIZ = await metaSelfMonitoringAIZFactory.deploy(
      aizId,
      aizRegistryAddress,
      decisionLoggerAddress,
      aizName,
      aizDescription
    );
    
    await metaSelfMonitoringAIZ.waitForDeployment();
    const metaSelfMonitoringAIZAddress = await metaSelfMonitoringAIZ.getAddress();
    console.log(`   ✅ Meta Self-Monitoring AIZ deployed at: ${metaSelfMonitoringAIZAddress}\n`);

    // Register the AIZ
    console.log('2️⃣  Registering AIZ...');
    const registerTx = await aizRegistry.registerAIZ(
      aizId,
      aizName,
      aizDescription,
      metaSelfMonitoringAIZAddress,
      [31337], // Local test network
      [metaSelfMonitoringAIZAddress]
    );
    await registerTx.wait();
    console.log(`   ✅ AIZ registered\n`);

    // Grant capabilities
    console.log('3️⃣  Granting Test Capabilities...');
    const testCapabilities = [
      'canUpdateMetrics',
      'canAnalyzePerformance',
      'canGenerateReports',
      'canImplementOptimizations',
      'canApplyOptimizations'
    ];
    
    for (const capability of testCapabilities) {
      const capabilitySelector = ethers.id(capability).substring(0, 10);
      const grantTx = await aizRegistry.grantCapability(aizId, capabilitySelector);
      await grantTx.wait();
      console.log(`   ✅ Granted capability: ${capability}`);
    }
    
    console.log('');

    // Test 1: Update Performance Metrics
    console.log('4️⃣  Testing Performance Metrics Update...');
    const updateMetricsTx = await metaSelfMonitoringAIZ.updatePerformanceMetrics(
      100, // operationsCount
      95,  // successCount
      5,   // failedCount
      150, // avgResponseTimeMs
      300  // memoryUsageMb
    );
    await updateMetricsTx.wait();
    console.log(`   ✅ Performance metrics updated\n`);

    // Test 2: Analyze Performance
    console.log('5️⃣  Testing Performance Analysis...');
    const analyzeTx = await metaSelfMonitoringAIZ.analyzePerformance();
    await analyzeTx.wait();
    console.log(`   ✅ Performance analysis completed\n`);

    // Test 3: Generate Monitoring Report
    console.log('6️⃣  Testing Monitoring Report Generation...');
    const reportId = await metaSelfMonitoringAIZ.generateMonitoringReport();
    console.log(`   ✅ Monitoring report generated with ID: ${reportId}\n`);

    // Test 4: Get Latest Report
    console.log('7️⃣  Testing Latest Report Retrieval...');
    const latestReport = await metaSelfMonitoringAIZ.getLatestReport();
    console.log(`   📊 Latest Report:`);
    console.log(`      Timestamp: ${new Date(Number(latestReport.timestamp) * 1000).toISOString()}`);
    console.log(`      Efficiency Score: ${latestReport.efficiencyScore}`);
    console.log(`      Health Status: ${latestReport.healthStatus}`);
    console.log(`      Total Suggestions: ${latestReport.totalSuggestions}`);
    console.log(`      Implemented Suggestions: ${latestReport.implementedSuggestions}\n`);

    // Test 5: Get Optimization Suggestions
    console.log('8️⃣  Testing Optimization Suggestions Retrieval...');
    const suggestions = await metaSelfMonitoringAIZ.getOptimizationSuggestions(1, 5);
    console.log(`   💡 Found ${suggestions.length} optimization suggestions:`);
    
    for (let i = 0; i < suggestions.length; i++) {
      const suggestion = suggestions[i];
      if (suggestion.id > 0) { // Check if suggestion exists
        console.log(`      ${i + 1}. ${suggestion.title} (${suggestion.category})`);
        console.log(`         Confidence: ${suggestion.confidence}%`);
        console.log(`         Estimated Savings: ${suggestion.estimatedSavings}`);
      }
    }
    
    console.log('');

    // Test 6: Implement an Optimization
    if (suggestions.length > 0 && suggestions[0].id > 0) {
      console.log('9️⃣  Testing Optimization Implementation...');
      const implementTx = await metaSelfMonitoringAIZ.implementOptimization(1);
      await implementTx.wait();
      console.log(`   ✅ Optimization suggestion #1 implemented\n`);
    }

    // Test 7: Apply Self-Optimization
    console.log('🔟  Testing Self-Optimization Application...');
    const optimizeTx = await metaSelfMonitoringAIZ.applySelfOptimization(
      'performance-tuning',
      25 // 25% improvement
    );
    await optimizeTx.wait();
    console.log(`   ✅ Self-optimization applied\n`);

    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!\n');
    console.log('📋 Test Summary:');
    console.log('   ✅ Performance metrics update');
    console.log('   ✅ Performance analysis');
    console.log('   ✅ Monitoring report generation');
    console.log('   ✅ Report retrieval');
    console.log('   ✅ Optimization suggestions retrieval');
    console.log('   ✅ Optimization implementation');
    console.log('   ✅ Self-optimization application');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error in test script:', error);
    process.exit(1);
  });