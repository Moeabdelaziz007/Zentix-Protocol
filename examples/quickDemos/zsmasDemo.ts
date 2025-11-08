#!/usr/bin/env tsx
/**
 * Quick Demo: Zentix Sentinel Multi-Agent System (ZSMAS)
 * Demonstrates the complete ZSMAS workflow
 */

import { ZSMASOrchestrator } from '../../src/core/agents/zsmas';
import { WalletService } from '../../src/core/economy/walletService';
import { AgentLogger } from '../../src/core/utils/agentLogger';

async function main() {
  console.log('\n🤖 Zentix Sentinel Multi-Agent System (ZSMAS) - Quick Demo\n');
  console.log('='.repeat(65));

  // Create ZSMAS orchestrator
  const zsmas = new ZSMASOrchestrator();
  
  // Create a test user
  const userDid = 'zxdid:zentix:demo-user-' + Date.now();
  console.log(`👤 Demo User: ${userDid}\n`);

  try {
    // Create vault for user
    console.log('🔒 Creating ZSMAS Vault...');
    const vault = await zsmas.createVault(userDid);
    console.log(`   Vault ID: ${vault.id}`);
    console.log(`   Vault Address: ${vault.vault_address}\n`);

    // Create user wallet
    console.log('💰 Creating User Wallet...');
    const wallet = WalletService.createWallet(userDid);
    const fundedWallet = WalletService.deposit(wallet, 10000, 'Demo funding');
    console.log(`   Wallet Address: ${fundedWallet.address}`);
    console.log(`   Balance: ${fundedWallet.balance} ZXT\n`);

    // Create user intent
    console.log('🎯 Creating User Intent...');
    const intent = {
      id: `intent_${Date.now()}`,
      user_did: userDid,
      goal: 'maximize yield with medium risk',
      risk_tolerance: 60,
      time_horizon: 'medium' as const,
      assets: ['WETH', 'USDC', 'DAI'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    console.log(`   Goal: ${intent.goal}`);
    console.log(`   Risk Tolerance: ${intent.risk_tolerance}/100`);
    console.log(`   Time Horizon: ${intent.time_horizon}\n`);

    // Process intent through ZSMAS
    console.log('⚡ Processing Intent through ZSMAS...');
    const startTime = Date.now();
    
    const result = await zsmas.processUserIntent(intent, fundedWallet);
    
    const endTime = Date.now();
    console.log(`   Processing Time: ${endTime - startTime}ms\n`);

    if (result.success) {
      console.log('✅ ZSMAS Processing Successful!');
      console.log(`   Strategy ID: ${result.strategy?.id}`);
      console.log(`   Expected Return: ${result.strategy?.expected_return.toFixed(2)}%`);
      console.log(`   Risk Score: ${result.strategy?.risk_score.toFixed(1)}/100`);
      console.log(`   Steps in Execution Plan: ${result.executionPlan?.steps.length}`);
      console.log(`   Transaction Hash: ${result.transactionHash}\n`);

      // Show strategy allocation
      if (result.strategy) {
        console.log('📊 Proposed Asset Allocation:');
        for (const [asset, allocation] of Object.entries(result.strategy.proposed_allocation)) {
          console.log(`   ${asset}: ${allocation}%`);
        }
        console.log('');
      }

      // Show risk assessment
      if (result.riskAssessment) {
        console.log('⚖️  Risk Assessment:');
        console.log(`   Overall Risk Score: ${result.riskAssessment.overall_risk_score.toFixed(1)}/100`);
        console.log(`   Scenarios Tested: ${result.riskAssessment.scenarios_tested}`);
        console.log(`   Failed Scenarios: ${result.riskAssessment.failed_scenarios}`);
        console.log(`   VaR: ${result.riskAssessment.risk_metrics.value_at_risk.toFixed(2)}%`);
        console.log(`   Max Drawdown: ${result.riskAssessment.risk_metrics.max_drawdown.toFixed(2)}%`);
        console.log(`   Sharpe Ratio: ${result.riskAssessment.risk_metrics.sharpe_ratio.toFixed(2)}\n`);
      }

      // Show audit report
      if (result.auditReport) {
        console.log('📋 Audit Report:');
        console.log(`   Compliance Check: ${result.auditReport.compliance_check ? '✅ Pass' : '❌ Fail'}`);
        console.log(`   Regulatory Compliance: ${result.auditReport.regulatory_compliance ? '✅ Pass' : '❌ Fail'}`);
        console.log(`   Approved: ${result.auditReport.approved ? '✅ Yes' : '❌ No'}`);
        if (result.auditReport.protocol_rules_violations.length > 0) {
          console.log(`   Violations: ${result.auditReport.protocol_rules_violations.length}`);
        }
        console.log('');
      }

      // Show vault performance
      console.log('📈 Vault Performance:');
      const performance = await zsmas.getVaultPerformanceSummary(userDid);
      if (performance) {
        console.log(`   Total Value: ${performance.total_value.toFixed(2)} ZXT`);
        console.log(`   Annualized Return: ${performance.annualized_return.toFixed(2)}%`);
        console.log(`   Volatility: ${performance.volatility.toFixed(2)}%`);
        console.log(`   Sharpe Ratio: ${performance.sharpe_ratio.toFixed(2)}\n`);
      }
    } else {
      console.log('❌ ZSMAS Processing Failed:');
      console.log(`   Error: ${result.error}\n`);
      
      if (result.strategy) {
        console.log('📝 Strategy Details:');
        console.log(`   Strategy ID: ${result.strategy.id}`);
        console.log(`   Expected Return: ${result.strategy.expected_return.toFixed(2)}%`);
        console.log(`   Risk Score: ${result.strategy.risk_score.toFixed(1)}/100\n`);
      }
      
      if (result.riskAssessment?.veto) {
        console.log('🛡️  Risk Agent Veto:');
        console.log(`   Reason: ${result.riskAssessment.veto_reason}\n`);
      }
      
      if (result.auditReport && !result.auditReport.approved) {
        console.log('📋 Audit Failures:');
        result.auditReport.protocol_rules_violations.forEach((violation, index) => {
          console.log(`   ${index + 1}. ${violation}`);
        });
        console.log('');
      }
    }

    // Show system status
    console.log('📊 System Status:');
    const status = await zsmas.getSystemStatus();
    console.log(`   Active: ${status.active ? '✅ Yes' : '❌ No'}`);
    console.log(`   Vaults: ${status.vaultsCount}`);
    console.log('   Agents:');
    status.agents.forEach(agent => {
      console.log(`     • ${agent.name}: ${agent.active ? '✅ Active' : '❌ Inactive'}`);
    });
    console.log('');

    // Show performance stats
    const stats = AgentLogger.getStats();
    console.log('⚡ Performance Stats:');
    console.log(`   Total Operations: ${stats.total_operations}`);
    console.log(`   Average Duration: ${stats.avg_duration_ms.toFixed(1)}ms`);
    if (stats.recent_errors.length > 0) {
      console.log(`   Recent Errors: ${stats.recent_errors.length}`);
    }

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }

  console.log('='.repeat(65));
  console.log('✨ ZSMAS Demo Completed!\n');
}

main().catch(console.error);