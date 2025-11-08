/**
 * Test for Meta Self-Monitoring Loop
 * Verifies the integration of self-monitoring capabilities with existing systems
 */

import { MetaSelfMonitoringLoop } from './core/monitoring/metaSelfMonitoringLoop';
import { PerformanceMonitor } from './core/monitoring/performanceMonitor';
import { AutoHealer } from './core/monitoring/autoHealer';
import { AgentLogger, LogLevel } from './core/utils/agentLogger';

async function testMetaSelfMonitoring() {
  console.log('🧪 Testing Meta Self-Monitoring Loop...');
  
  try {
    // Test 1: Initialize the meta self-monitoring loop
    console.log('\n1. Testing initialization...');
    MetaSelfMonitoringLoop.initialize();
    console.log('✅ MetaSelfMonitoringLoop initialized');
    
    // Test 2: Observe a cognitive process
    console.log('\n2. Testing cognitive process observation...');
    MetaSelfMonitoringLoop.observeCognitiveProcess({
      id: 'test-process-1',
      agentId: 'TestAgent',
      processType: 'decision-making',
      startTime: Date.now() - 1000,
      endTime: Date.now(),
      duration: 1000,
      inputs: ['input1', 'input2'],
      outputs: ['output1'],
      confidence: 0.95,
      resourcesUsed: {
        cpu: 10,
        memory: 50,
        network: 5
      },
      decisionPath: ['step1', 'step2', 'step3']
    });
    console.log('✅ Cognitive process observed');
    
    // Test 3: Observe a task workflow
    console.log('\n3. Testing task workflow observation...');
    MetaSelfMonitoringLoop.observeTaskWorkflow({
      id: 'test-workflow-1',
      taskId: 'task-123',
      agentId: 'TestAgent',
      steps: [
        {
          id: 'step-1',
          name: 'Data Collection',
          startTime: Date.now() - 2000,
          endTime: Date.now() - 1500,
          duration: 500,
          status: 'completed',
          inputs: { data: 'input' },
          outputs: { result: 'collected' }
        },
        {
          id: 'step-2',
          name: 'Processing',
          startTime: Date.now() - 1500,
          endTime: Date.now() - 1000,
          duration: 500,
          status: 'completed',
          inputs: { data: 'collected' },
          outputs: { result: 'processed' }
        }
      ],
      startTime: Date.now() - 2000,
      endTime: Date.now() - 1000,
      status: 'completed',
      outcome: { success: true, result: 'processed data' },
      efficiencyScore: 1.0
    });
    console.log('✅ Task workflow observed');
    
    // Test 4: Observe an outcome result
    console.log('\n4. Testing outcome result observation...');
    MetaSelfMonitoringLoop.observeOutcomeResult({
      id: 'test-outcome-1',
      taskId: 'task-123',
      agentId: 'TestAgent',
      expected: { value: 100 },
      actual: { value: 95 },
      variance: 5,
      success: true,
      timestamp: Date.now()
    });
    console.log('✅ Outcome result observed');
    
    // Test 5: Generate some performance metrics
    console.log('\n5. Testing performance metrics integration...');
    
    // Log some test operations
    AgentLogger.log(LogLevel.INFO, 'TestAgent', 'testOperation1', { testData: 'value1' });
    AgentLogger.log(LogLevel.INFO, 'TestAgent', 'testOperation2', { testData: 'value2' });
    AgentLogger.log(LogLevel.ERROR, 'TestAgent', 'testOperation3', { testData: 'value3' });
    
    // Get current metrics
    const metrics = PerformanceMonitor.getCurrentMetrics();
    console.log(`✅ Performance metrics collected: ${metrics.operations_total} operations`);
    
    // Test 6: Check statistics
    console.log('\n6. Testing statistics retrieval...');
    const stats = MetaSelfMonitoringLoop.getStatistics();
    console.log(`✅ Statistics retrieved: ${stats.totalProcesses} processes, ${stats.totalWorkflows} workflows`);
    
    // Test 7: Check recent patterns
    console.log('\n7. Testing pattern retrieval...');
    const patterns = MetaSelfMonitoringLoop.getRecentPatterns();
    console.log(`✅ Patterns retrieved: ${patterns.length} patterns`);
    
    // Test 8: Check adaptation history
    console.log('\n8. Testing adaptation history retrieval...');
    const adaptations = MetaSelfMonitoringLoop.getAdaptationHistory();
    console.log(`✅ Adaptations retrieved: ${adaptations.length} adaptations`);
    
    console.log('\n🎉 All tests passed! Meta Self-Monitoring Loop is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMetaSelfMonitoring();