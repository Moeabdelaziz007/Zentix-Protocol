#!/usr/bin/env tsx
/**
 * Autonomous System Demo
 * Self-healing agents with automated monitoring and alerting
 */

import { Watchdog } from '../core/automation/watchdog';
import { AlertManager } from '../core/automation/alerting';
import { TaskOrchestrator } from '../core/orchestration/taskOrchestrator';
import { PerformanceMonitor } from '../core/monitoring/performanceMonitor';
import { AgentLogger } from '../core/utils/agentLogger';

async function main() {
  console.log('\n🤖 AUTONOMOUS SYSTEM INITIALIZATION\n');
  console.log('═'.repeat(70));

  // ============================================
  // 1. Register Alert Rules
  // ============================================
  console.log('\n1️⃣  Registering Alert Rules\n');

  AlertManager.registerDefaultRules();

  // Custom alert: High arbitrage profit
  AlertManager.registerRule({
    id: 'arbitrage-profit',
    name: 'Arbitrage Opportunity Detected',
    condition: () => {
      // Check if arbitrage opportunity exists
      return false; // Placeholder
    },
    severity: 'info',
    message: 'Profitable arbitrage opportunity detected',
    cooldown_minutes: 15,
    channels: ['console', 'webhook'],
  });

  console.log('   ✅ Registered 4 alert rules\n');

  // ============================================
  // 2. Register Agents with Watchdog
  // ============================================
  console.log('\n2️⃣  Registering Agents for Monitoring\n');

  Watchdog.registerAgent({
    id: 'quantum-agent',
    name: 'QuantumProbabilityReferralAgent',
    command: 'npm run quick:quantum',
    max_restarts: 5,
  });

  Watchdog.registerAgent({
    id: 'referral-agent',
    name: 'ReferralAgent',
    command: 'npm run quick:referral',
    max_restarts: 5,
  });

  Watchdog.registerAgent({
    id: 'arbitrage-agent',
    name: 'ArbitrageAgent',
    command: 'npm run quick:arbitrage',
    max_restarts: 5,
  });

  console.log('   ✅ Registered 3 agents with Watchdog\n');

  // ============================================
  // 3. Register Scheduled Tasks
  // ============================================
  console.log('\n3️⃣  Registering Scheduled Tasks\n');

  TaskOrchestrator.registerTask({
    id: 'fetch-market-data',
    name: 'Fetch Market Data',
    type: 'scheduled',
    schedule: '*/30 * * * *', // Every 30 minutes
    handler: async () => {
      const { CoinGeckoAPI } = await import('../core/apis/freeApisIntegration');
      const prices = await CoinGeckoAPI.getCryptoPrices(['bitcoin', 'ethereum', 'matic-network']);
      console.log(`   💹 Fetched prices for ${prices.length} cryptocurrencies`);
    },
    retries: 3,
    timeout_ms: 30000,
  });

  TaskOrchestrator.registerTask({
    id: 'health-check',
    name: 'System Health Check',
    type: 'scheduled',
    schedule: '0 */6 * * *', // Every 6 hours
    handler: async () => {
      const metrics = PerformanceMonitor.getCurrentMetrics();
      console.log(`   🏥 Health check: ${metrics.operations_total} operations, ${metrics.error_rate_percent.toFixed(2)}% error rate`);
    },
    retries: 2,
    timeout_ms: 10000,
  });

  console.log('   ✅ Registered 2 scheduled tasks\n');

  // ============================================
  // 4. Start Monitoring Systems
  // ============================================
  console.log('\n4️⃣  Starting Autonomous Systems\n');

  // Start watchdog
  Watchdog.startMonitoring();
  console.log('   ✅ Watchdog monitoring started');

  // Start alert manager
  AlertManager.startMonitoring(60000); // Check every minute
  console.log('   ✅ Alert manager monitoring started');

  console.log('');

  // ============================================
  // 5. Simulate Operations
  // ============================================
  console.log('\n5️⃣  Running Test Operations\n');

  // Execute a task
  await TaskOrchestrator.executeTask('fetch-market-data');

  // Get current metrics
  const metrics = PerformanceMonitor.getCurrentMetrics();
  console.log(`\n   📊 Current Metrics:`);
  console.log(`      Operations: ${metrics.operations_total}`);
  console.log(`      Avg Response: ${metrics.avg_response_time_ms.toFixed(2)}ms`);
  console.log(`      Error Rate: ${metrics.error_rate_percent.toFixed(2)}%`);
  console.log(`      Memory: ${metrics.memory_usage_mb.toFixed(2)}MB`);

  // ============================================
  // 6. Display Status
  // ============================================
  console.log('\n\n6️⃣  System Status\n');

  const watchdogStatus = Watchdog.getStatus();
  console.log(`   🐕 Watchdog: ${watchdogStatus.monitoring ? 'Active' : 'Inactive'}`);
  console.log(`      Monitoring ${watchdogStatus.agents.length} agents`);

  const alertStats = AlertManager.getStats();
  console.log(`\n   🚨 Alert Manager: ${alertStats.monitoring ? 'Active' : 'Inactive'}`);
  console.log(`      Active Rules: ${alertStats.active_rules}`);
  console.log(`      Total Alerts: ${alertStats.total_alerts}`);

  const taskStats = TaskOrchestrator.getStats();
  console.log(`\n   ⚙️  Task Orchestrator:`);
  console.log(`      Tasks: ${taskStats.total_tasks}`);
  console.log(`      Workflows: ${taskStats.total_workflows}`);
  console.log(`      Success Rate: ${taskStats.success_rate.toFixed(1)}%`);

  // ============================================
  // 7. Summary
  // ============================================
  console.log('\n\n═'.repeat(70));
  console.log('✅ AUTONOMOUS SYSTEM RUNNING\n');

  console.log('🤖 Active Components:');
  console.log('   • Watchdog monitoring 3 agents');
  console.log('   • Alert Manager with 4 rules');
  console.log('   • Task Orchestrator with 2 scheduled tasks');
  console.log('   • Performance Monitor tracking all operations\n');

  console.log('📋 Scheduled Activities:');
  console.log('   • Market data fetching every 30 minutes');
  console.log('   • Health checks every 6 hours');
  console.log('   • Continuous performance monitoring');
  console.log('   • Automatic agent restart on failure\n');

  console.log('💡 The system is now self-managing!');
  console.log('   Agents will restart automatically if they fail.');
  console.log('   Alerts trigger when thresholds are exceeded.');
  console.log('   Tasks run on schedule without manual intervention.\n');

  console.log('═'.repeat(70));
  console.log('\n🎉 Zentix Protocol is now a true autonomous agent system!\n');

  // Keep alive for demonstration
  console.log('Press Ctrl+C to stop...\n');
}

main().catch((error) => {
  console.error('\n❌ Autonomous system failed:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down autonomous system...');
  Watchdog.stopMonitoring();
  AlertManager.stopMonitoring();
  console.log('✅ Stopped all monitoring systems\n');
  process.exit(0);
});
