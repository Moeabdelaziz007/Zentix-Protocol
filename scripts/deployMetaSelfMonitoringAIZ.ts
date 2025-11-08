#!/usr/bin/env tsx
/**
 * Deployment Script for Meta Self-Monitoring AIZ
 * Deploys the MetaSelfMonitoringAIZ contract to the Superchain
 */

import { ethers } from 'ethers';
import { AIZRegistry__factory } from '../typechain-types/factories/AIZRegistry__factory';
import { ConsciousDecisionLogger__factory } from '../typechain-types/factories/ConsciousDecisionLogger__factory';
import { MetaSelfMonitoringAIZ__factory } from '../typechain-types/factories/MetaSelfMonitoringAIZ__factory';

async function main() {
  console.log('\n🚀 DEPLOYING META SELF-MONITORING AIZ\n');
  console.log('='.repeat(50));

  try {
    // Get the deployer wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

    console.log(`\n📍 Deployer Address: ${wallet.address}\n`);

    // Deploy the AIZ Registry if not already deployed
    console.log('1️⃣  Deploying AIZ Registry...');
    const aizRegistryFactory = new AIZRegistry__factory(wallet);
    const aizRegistry = await aizRegistryFactory.deploy();
    await aizRegistry.waitForDeployment();
    const aizRegistryAddress = await aizRegistry.getAddress();
    console.log(`   ✅ AIZ Registry deployed at: ${aizRegistryAddress}\n`);

    // Deploy the Conscious Decision Logger if not already deployed
    console.log('2️⃣  Deploying Conscious Decision Logger...');
    const decisionLoggerFactory = new ConsciousDecisionLogger__factory(wallet);
    const decisionLogger = await decisionLoggerFactory.deploy();
    await decisionLogger.waitForDeployment();
    const decisionLoggerAddress = await decisionLogger.getAddress();
    console.log(`   ✅ Decision Logger deployed at: ${decisionLoggerAddress}\n`);

    // Deploy the Meta Self-Monitoring AIZ
    console.log('3️⃣  Deploying Meta Self-Monitoring AIZ...');
    
    // AIZ parameters
    const aizId = ethers.encodeBytes32String('META-MONITORING-AIZ');
    const aizName = 'MetaSelfMonitoringAIZ';
    const aizDescription = 'Autonomous AI Zone with self-monitoring capabilities that observe cognitive processes, task execution workflows, and outcome results to autonomously refine decision-making algorithms';
    
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

    // Register the AIZ with the registry
    console.log('4️⃣  Registering AIZ with Registry...');
    const tx = await aizRegistry.registerAIZ(
      aizId,
      aizName,
      aizDescription,
      metaSelfMonitoringAIZAddress,
      [10], // OP Mainnet chain ID (example)
      [metaSelfMonitoringAIZAddress] // Contract address on that chain
    );
    
    await tx.wait();
    console.log(`   ✅ AIZ registered with ID: ${ethers.decodeBytes32String(aizId)}\n`);

    // Grant capabilities to the AIZ
    console.log('5️⃣  Granting Capabilities to AIZ...');
    
    // Capabilities needed for self-monitoring
    const capabilities = [
      'canUpdateMetrics',
      'canAnalyzePerformance',
      'canGenerateReports',
      'canImplementOptimizations',
      'canApplyOptimizations'
    ];
    
    for (const capability of capabilities) {
      const capabilitySelector = ethers.id(capability).substring(0, 10);
      const grantTx = await aizRegistry.grantCapability(aizId, capabilitySelector);
      await grantTx.wait();
      console.log(`   ✅ Granted capability: ${capability}`);
    }
    
    console.log('\n6️⃣  Deployment Summary:');
    console.log(`   🏛️  AIZ Registry: ${aizRegistryAddress}`);
    console.log(`   📝 Decision Logger: ${decisionLoggerAddress}`);
    console.log(`   🤖 Meta Self-Monitoring AIZ: ${metaSelfMonitoringAIZAddress}`);
    console.log(`   🆔 AIZ ID: ${ethers.decodeBytes32String(aizId)}`);
    console.log(`   📛 AIZ Name: ${aizName}`);
    
    console.log('\n🎉 META SELF-MONITORING AIZ DEPLOYMENT COMPLETE!\n');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error in deployment script:', error);
    process.exit(1);
  });