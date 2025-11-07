#!/usr/bin/env tsx
/**
 * Task Orchestration Demo
 * Workflow automation with Temporal/Prefect patterns
 */

import { TaskOrchestrator, CronScheduler } from '../../core/orchestration/taskOrchestrator';
import { AgentLogger } from '../../core/utils/agentLogger';

async function main() {
  console.log('\n🎯 TASK ORCHESTRATION DEMO\n');
  console.log('═'.repeat(60));

  // ============================================
  // 1. Register Tasks
  // ============================================
  console.log('\n1️⃣  Registering Tasks\n');

  TaskOrchestrator.registerTask({
    id: 'fetch-crypto-prices',
    name: 'Fetch Crypto Prices',
    type: 'scheduled',
    schedule: '*/5 * * * *', // Every 5 minutes
    handler: async () => {
      const { CoinGeckoAPI } = await import('../../core/apis/freeApisIntegration');
      const prices = await CoinGeckoAPI.getCryptoPrices(['bitcoin', 'ethereum']);
      console.log(`   ✅ Fetched ${prices.length} crypto prices`);
    },
    retries: 3,
    timeout_ms: 10000,
  });

  TaskOrchestrator.registerTask({
    id: 'analyze-market-sentiment',
    name: 'Analyze Market Sentiment',
    type: 'agent',
    handler: async () => {
      const { NewsAPI } = await import('../../core/apis/freeApisIntegration');
      const news = await NewsAPI.getHeadlines('crypto', 10);
      const sentiments = news.map(n => n.sentiment);
      const positive = sentiments.filter(s => s === 'positive').length;
      console.log(`   ✅ Analyzed ${news.length} articles, ${positive} positive`);
    },
    retries: 2,
    timeout_ms: 15000,
  });

  TaskOrchestrator.registerTask({
    id: 'distribute-rewards',
    name: 'Distribute Referral Rewards',
    type: 'cron',
    schedule: '0 0 * * *', // Daily at midnight
    handler: async () => {
      // Simulate reward distribution
      console.log('   ✅ Distributed rewards to 25 users');
    },
    retries: 5,
    timeout_ms: 30000,
  });

  console.log('   📋 Registered 3 tasks successfully\n');

  // ============================================
  // 2. Create Workflow
  // ============================================
  console.log('\n2️⃣  Creating Workflow\n');

  TaskOrchestrator.registerWorkflow({
    id: 'daily-market-analysis',
    name: 'Daily Market Analysis Workflow',
    tasks: [
      { id: 'fetch-crypto-prices' } as any,
      { id: 'analyze-market-sentiment' } as any,
    ],
    parallel: false, // Sequential execution
    on_failure: 'continue',
  });

  console.log('   📊 Workflow created: Daily Market Analysis\n');

  // ============================================
  // 3. Execute Tasks
  // ============================================
  console.log('\n3️⃣  Executing Tasks\n');

  const result1 = await TaskOrchestrator.executeTask('fetch-crypto-prices');
  console.log(`   Task 1: ${result1.status} in ${result1.duration_ms}ms`);

  const result2 = await TaskOrchestrator.executeTask('analyze-market-sentiment');
  console.log(`   Task 2: ${result2.status} in ${result2.duration_ms}ms\n`);

  // ============================================
  // 4. Execute Workflow
  // ============================================
  console.log('\n4️⃣  Executing Workflow\n');

  const workflowResults = await TaskOrchestrator.executeWorkflow('daily-market-analysis');
  console.log(`   ✅ Workflow completed: ${workflowResults.length} tasks\n`);

  workflowResults.forEach((result, i) => {
    console.log(`   ${i + 1}. ${result.task_id}: ${result.status} (${result.duration_ms}ms)`);
  });

  // ============================================
  // 5. Statistics
  // ============================================
  console.log('\n\n5️⃣  Orchestration Statistics\n');

  const stats = TaskOrchestrator.getStats();
  console.log(`   📊 Total Tasks: ${stats.total_tasks}`);
  console.log(`   📊 Total Workflows: ${stats.total_workflows}`);
  console.log(`   📊 Total Executions: ${stats.total_executions}`);
  console.log(`   📊 Success Rate: ${stats.success_rate.toFixed(1)}%`);
  console.log(`   📊 Avg Duration: ${stats.avg_duration_ms.toFixed(2)}ms\n`);

  // ============================================
  // 6. Generate GitHub Actions YAML
  // ============================================
  console.log('\n6️⃣  GitHub Actions Integration\n');

  const workflow = {
    id: 'daily-market-analysis',
    name: 'Daily Market Analysis Workflow',
    tasks: [
      { id: 'fetch-crypto-prices', name: 'Fetch Crypto Prices', timeout_ms: 10000 } as any,
      { id: 'analyze-market-sentiment', name: 'Analyze Sentiment', timeout_ms: 15000 } as any,
    ],
  };

  const githubYAML = TaskOrchestrator.generateGitHubActionsYAML(workflow);
  console.log('   📄 GitHub Actions Workflow:');
  console.log('   ─'.repeat(50));
  console.log(githubYAML.split('\n').map(line => '   ' + line).join('\n'));
  console.log('   ─'.repeat(50));

  // ============================================
  // 7. Prefect Export
  // ============================================
  console.log('\n\n7️⃣  Prefect Cloud Export\n');

  const prefectConfig = TaskOrchestrator.exportToPrefect(workflow);
  console.log('   📄 Prefect Configuration:');
  console.log(JSON.stringify(prefectConfig, null, 2).split('\n').map(line => '   ' + line).join('\n'));

  console.log('\n\n═'.repeat(60));
  console.log('✅ Task Orchestration Demo Complete!\n');
  console.log('💡 Integration Options:');
  console.log('   • GitHub Actions: Free for public repos');
  console.log('   • Prefect Cloud: Free tier available');
  console.log('   • Temporal.io: Community edition free');
  console.log('   • Built-in cron scheduler included\n');
}

main().catch(error => {
  console.error('\n❌ Demo failed:', error.message);
  process.exit(1);
});
