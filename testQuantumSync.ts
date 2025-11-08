// testQuantumSync.ts
import { ZentixAgent } from './core/agents/zentixAgent';
import { quantumSynchronizer } from './src/core/quantumSynchronizer';

async function runQuantumSyncDemo() {
  console.log('🚀 Initializing Quantum Synchronizer Demo...');
  
  // Create ZentixAgent instances
  console.log('\n🔧 Creating Zentix Agents...');
  const agent1 = new ZentixAgent();
  const agent2 = new ZentixAgent();
  
  await agent1.initialize();
  await agent2.initialize();
  
  console.log('✅ Agents initialized');
  
  // Listen for quantum sync events
  quantumSynchronizer.on('decision-broadcast', (message) => {
    console.log(`📡 Decision broadcast detected: ${message.from} -> ${message.to}`);
  });
  
  quantumSynchronizer.on('context-sync', (message) => {
    console.log(`🔄 Context sync detected: ${message.from} -> ${message.to}`);
  });
  
  quantumSynchronizer.on('message-sent', (message) => {
    console.log(`✉️ Direct message sent: ${message.from} -> ${message.to}`);
  });
  
  // Test agent communication
  console.log('\n💬 Testing Agent Communication...');
  
  // Agent 1 performs a security analysis
  console.log('\n1. Agent 1 performing security risk analysis...');
  const riskResult = await agent1.analyzeSecurityRisk({
    system: "core-infrastructure",
    threats: ["DDoS", "SQL-injection"],
    assets: ["user-data", "api-keys"]
  });
  console.log('   Security analysis completed with confidence:', riskResult.confidence);
  
  // Agent 2 checks policy compliance
  console.log('\n2. Agent 2 checking policy compliance...');
  const policyResult = await agent2.checkPolicyCompliance({
    policy: "data-protection-regulation",
    scope: "all-systems",
    requirements: ["encryption-at-rest", "access-logging"]
  });
  console.log('   Policy compliance check completed with confidence:', policyResult.confidence);
  
  // Direct message between agents
  console.log('\n3. Sending direct message between agents...');
  quantumSynchronizer.sendMessage(
    agent1.getAgentDNA().main_agent.id,
    agent2.getAgentDNA().main_agent.id,
    {
      type: "collaboration-request",
      task: "joint-security-assessment",
      priority: "high"
    }
  );
  
  console.log('\n📋 Registered Agents:');
  console.log('   ', quantumSynchronizer.getRegisteredAgents());
  
  console.log('\n✅ Quantum Synchronizer Demo completed successfully!');
  console.log('\n🔗 Key Features Demonstrated:');
  console.log('   • Agent Registration');
  console.log('   • Decision Broadcasting');
  console.log('   • Context Synchronization');
  console.log('   • Direct Messaging');
  console.log('   • Event Listening');
}

// Run the demo
runQuantumSyncDemo().catch(console.error);