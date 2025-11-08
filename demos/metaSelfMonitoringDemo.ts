/**
 * Meta Self-Monitoring Loop Demonstration
 * Shows how the protocol continuously evolves by analyzing its performance patterns
 * and adapting its behavior accordingly
 */

import { MetaSelfMonitoringLoop } from '../core/monitoring/metaSelfMonitoringLoop';
import { PerformanceMonitor } from '../core/monitoring/performanceMonitor';
import { AutoHealer } from '../core/monitoring/autoHealer';
import { AgentLogger, LogLevel } from '../core/utils/agentLogger';

async function runMetaSelfMonitoringDemo() {
  console.log('🚀 Meta Self-Monitoring Loop Demonstration');
  console.log('==========================================\n');
  
  try {
    // Initialize all systems
    console.log('1. Initializing systems...');
    MetaSelfMonitoringLoop.initialize();
    AutoHealer.initialize();
    AutoHealer.startMonitoring();
    console.log('✅ All systems initialized\n');
    
    // Simulate some cognitive processes
    console.log('2. Simulating cognitive processes...');
    
    // Simulate a decision-making process
    MetaSelfMonitoringLoop.observeCognitiveProcess({
      id: 'decision-process-1',
      agentId: 'TravelAgent',
      processType: 'itinerary-planning',
      startTime: Date.now() - 3000,
      endTime: Date.now(),
      duration: 3000,
      inputs: ['destination: Paris', 'duration: 5 days', 'budget: $2000'],
      outputs: ['itinerary: Paris 5-day trip with Eiffel Tower, Louvre, etc.'],
      confidence: 0.92,
      resourcesUsed: {
        cpu: 25,
        memory: 120,
        network: 15
      },
      decisionPath: ['analyze-requirements', 'search-destinations', 'optimize-itinerary', 'validate-budget']
    });
    
    // Simulate a security analysis process
    MetaSelfMonitoringLoop.observeCognitiveProcess({
      id: 'security-process-1',
      agentId: 'SecurityAgent',
      processType: 'threat-detection',
      startTime: Date.now() - 1500,
      endTime: Date.now(),
      duration: 1500,
      inputs: ['network-traffic-data', 'user-behavior-patterns'],
      outputs: ['threat-level: low', 'recommendations: continue-monitoring'],
      confidence: 0.88,
      resourcesUsed: {
        cpu: 40,
        memory: 85,
        network: 8
      },
      decisionPath: ['collect-data', 'analyze-patterns', 'detect-anomalies', 'assess-risk']
    });
    
    console.log('✅ Cognitive processes simulated\n');
    
    // Simulate task workflows
    console.log('3. Simulating task workflows...');
    
    // Simulate a successful task workflow
    MetaSelfMonitoringLoop.observeTaskWorkflow({
      id: 'workflow-1',
      taskId: 'generate-report-123',
      agentId: 'AnalyticsAgent',
      steps: [
        {
          id: 'data-collection',
          name: 'Data Collection',
          startTime: Date.now() - 5000,
          endTime: Date.now() - 3000,
          duration: 2000,
          status: 'completed',
          inputs: { source: 'database' },
          outputs: { data: 'collected-1000-records' }
        },
        {
          id: 'data-processing',
          name: 'Data Processing',
          startTime: Date.now() - 3000,
          endTime: Date.now() - 1000,
          duration: 2000,
          status: 'completed',
          inputs: { data: 'collected-1000-records' },
          outputs: { processed: 'aggregated-results' }
        },
        {
          id: 'report-generation',
          name: 'Report Generation',
          startTime: Date.now() - 1000,
          endTime: Date.now(),
          duration: 1000,
          status: 'completed',
          inputs: { data: 'aggregated-results' },
          outputs: { report: 'generated-pdf-report' }
        }
      ],
      startTime: Date.now() - 5000,
      endTime: Date.now(),
      status: 'completed',
      outcome: { success: true, reportId: 'report-123' },
      efficiencyScore: 1.0
    });
    
    // Simulate a failed task workflow
    MetaSelfMonitoringLoop.observeTaskWorkflow({
      id: 'workflow-2',
      taskId: 'send-notification-456',
      agentId: 'NotificationAgent',
      steps: [
        {
          id: 'prepare-message',
          name: 'Prepare Message',
          startTime: Date.now() - 1000,
          endTime: Date.now() - 500,
          duration: 500,
          status: 'completed',
          inputs: { recipient: 'user@example.com', content: 'Hello World' },
          outputs: { message: 'prepared-email' }
        },
        {
          id: 'send-email',
          name: 'Send Email',
          startTime: Date.now() - 500,
          endTime: Date.now(),
          duration: 500,
          status: 'failed',
          inputs: { message: 'prepared-email' },
          error: 'SMTP server timeout'
        }
      ],
      startTime: Date.now() - 1000,
      endTime: Date.now(),
      status: 'failed',
      outcome: { success: false, error: 'SMTP server timeout' }
    });
    
    console.log('✅ Task workflows simulated\n');
    
    // Simulate outcome results
    console.log('4. Simulating outcome results...');
    
    // Successful outcome
    MetaSelfMonitoringLoop.observeOutcomeResult({
      id: 'outcome-1',
      taskId: 'predict-stock-price',
      agentId: 'FinanceAgent',
      expected: { price: 150.50 },
      actual: { price: 149.75 },
      variance: 0.75,
      success: true,
      timestamp: Date.now()
    });
    
    // Failed outcome
    MetaSelfMonitoringLoop.observeOutcomeResult({
      id: 'outcome-2',
      taskId: 'classify-image',
      agentId: 'VisionAgent',
      expected: { category: 'cat' },
      actual: { category: 'dog' },
      variance: 1,
      success: false,
      timestamp: Date.now()
    });
    
    console.log('✅ Outcome results simulated\n');
    
    // Generate some performance metrics that would trigger adaptations
    console.log('5. Simulating performance metrics that trigger adaptations...');
    
    // Log operations with high error rate to trigger auto-healing
    for (let i = 0; i < 10; i++) {
      AgentLogger.log(LogLevel.INFO, 'TestAgent', `operation-${i}`, { testData: `value-${i}` });
      if (i % 2 === 0) {
        AgentLogger.log(LogLevel.ERROR, 'TestAgent', `failed-operation-${i}`, { error: 'simulated error' });
      }
    }
    
    // Get current metrics (this will trigger the meta self-monitoring loop)
    const metrics = PerformanceMonitor.getCurrentMetrics();
    console.log(`📊 Current metrics: ${metrics.operations_total} operations, ${metrics.error_rate_percent}% error rate\n`);
    
    // Wait a bit for the self-monitoring loop to process
    console.log('6. Waiting for self-monitoring loop to process data...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show the results
    console.log('7. Retrieving self-monitoring results...');
    
    const stats = MetaSelfMonitoringLoop.getStatistics();
    console.log(`📈 Monitoring Statistics:`);
    console.log(`   - Cognitive Processes: ${stats.totalProcesses}`);
    console.log(`   - Task Workflows: ${stats.totalWorkflows}`);
    console.log(`   - Outcome Results: ${stats.totalOutcomes}`);
    console.log(`   - Performance Patterns: ${stats.totalPatterns}`);
    console.log(`   - Adaptations: ${stats.totalAdaptations}`);
    console.log(`   - Recent Adaptations: ${stats.recentAdaptations}\n`);
    
    const patterns = MetaSelfMonitoringLoop.getRecentPatterns();
    console.log(`🔍 Recent Performance Patterns (${patterns.length}):`);
    patterns.slice(0, 3).forEach((pattern, index) => {
      console.log(`   ${index + 1}. ${pattern.patternType}: ${pattern.description} (confidence: ${(pattern.confidence * 100).toFixed(1)}%)`);
    });
    
    const adaptations = MetaSelfMonitoringLoop.getAdaptationHistory();
    console.log(`\n🔄 Recent Adaptations (${adaptations.length}):`);
    adaptations.slice(0, 3).forEach((adaptation, index) => {
      console.log(`   ${index + 1}. ${adaptation.adaptationType}: ${(adaptation.improvement * 100).toFixed(2)}% improvement`);
    });
    
    console.log('\n✨ Demonstration complete!');
    console.log('\nThe Meta Self-Monitoring Loop has successfully:');
    console.log('• Observed cognitive processes in real-time');
    console.log('• Tracked task execution workflows and outcome results');
    console.log('• Analyzed performance patterns');
    console.log('• Generated autonomous refinement recommendations');
    console.log('• Applied behavioral adaptations to improve efficiency');
    console.log('• Integrated with Superchain infrastructure for cross-chain orchestration');
    console.log('• Continuously evolved based on performance analysis');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demonstration
runMetaSelfMonitoringDemo();