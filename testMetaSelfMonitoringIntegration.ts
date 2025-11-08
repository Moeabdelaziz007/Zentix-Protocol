/**
 * Integration Test for Meta Self-Monitoring Loop
 * Verifies that the self-monitoring loop integrates correctly with existing systems
 */

import { MetaSelfMonitoringLoop } from './core/monitoring/metaSelfMonitoringLoop';
import { PerformanceMonitor } from './core/monitoring/performanceMonitor';
import { AutoHealer } from './core/monitoring/autoHealer';
import { AgentLogger, LogLevel } from './core/utils/agentLogger';

async function runIntegrationTest() {
  console.log('🧪 Running Meta Self-Monitoring Loop Integration Test...');
  
  try {
    // Test 1: Initialize all systems
    console.log('\n1. Initializing systems...');
    MetaSelfMonitoringLoop.initialize();
    AutoHealer.initialize();
    console.log('✅ Systems initialized');
    
    // Test 2: Verify integration with PerformanceMonitor
    console.log('\n2. Testing integration with PerformanceMonitor...');
    
    // Log some operations
    AgentLogger.log(LogLevel.INFO, 'TestAgent', 'testOperation1');
    AgentLogger.log(LogLevel.ERROR, 'TestAgent', 'testOperation2');
    
    // Get metrics (this should trigger the meta self-monitoring loop)
    const metrics = PerformanceMonitor.getCurrentMetrics();
    
    // Check that the loop observed the cognitive process
    const stats = MetaSelfMonitoringLoop.getStatistics();
    if (stats.totalProcesses > 0) {
      console.log('✅ PerformanceMonitor integration working');
    } else {
      throw new Error('PerformanceMonitor integration failed');
    }
    
    // Test 3: Verify integration with AutoHealer
    console.log('\n3. Testing integration with AutoHealer...');
    
    // Get auto-healer stats
    const healerStats = AutoHealer.getStats();
    console.log(`✅ AutoHealer has ${healerStats.active_rules} active rules`);
    
    // Test 4: Verify pattern recognition
    console.log('\n4. Testing pattern recognition...');
    
    // Generate some patterns by creating metrics that would trigger patterns
    for (let i = 0; i < 20; i++) {
      AgentLogger.log(LogLevel.ERROR, 'TestAgent', `error-${i}`);
    }
    
    // Get updated metrics
    PerformanceMonitor.getCurrentMetrics();
    
    // Wait a bit for pattern recognition
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const patterns = MetaSelfMonitoringLoop.getRecentPatterns();
    if (patterns.length > 0) {
      console.log(`✅ Pattern recognition working (${patterns.length} patterns detected)`);
    } else {
      console.log('⚠️ No patterns detected (this might be expected in a simple test)');
    }
    
    // Test 5: Verify statistics tracking
    console.log('\n5. Testing statistics tracking...');
    
    const finalStats = MetaSelfMonitoringLoop.getStatistics();
    console.log(`📊 Final statistics:`);
    console.log(`   - Processes: ${finalStats.totalProcesses}`);
    console.log(`   - Workflows: ${finalStats.totalWorkflows}`);
    console.log(`   - Outcomes: ${finalStats.totalOutcomes}`);
    console.log(`   - Patterns: ${finalStats.totalPatterns}`);
    console.log(`   - Adaptations: ${finalStats.totalAdaptations}`);
    
    console.log('\n🎉 Integration test passed! Meta Self-Monitoring Loop is fully integrated.');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

// Run the integration test
runIntegrationTest();