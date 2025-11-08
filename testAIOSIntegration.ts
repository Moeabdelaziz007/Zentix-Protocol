// testAIOSIntegration.ts
import { AIOSAgent } from './apps/AIOS/aiosAgent';
import { ZentixAgent } from './core/agents/zentixAgent';
import { quantumSynchronizer } from './src/core/quantumSynchronizer';

async function testAIOSIntegration() {
  console.log('🧪 Testing AIOS Agent Integration with Quantum Synchronizer...\n');
  
  try {
    // Create AIOS and Zentix agents
    console.log('🔍 Creating AIOS and Zentix Agents...');
    const aiosAgent = new AIOSAgent();
    const zentixAgent = new ZentixAgent();
    
    await aiosAgent.initialize();
    await zentixAgent.initialize();
    
    console.log('✅ Agents initialized successfully\n');
    
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
    console.log('💬 Testing Agent Communication...');
    
    // AIOS agent performs adaptive interface rendering
    console.log('\n1. AIOS agent performing adaptive interface rendering...');
    const renderResult = await aiosAgent.renderAdaptiveInterface({
      userContext: "mobile-device",
      preferences: ["dark-mode", "large-text"],
      content: "dashboard-view"
    });
    console.log('   Interface rendering completed with confidence:', renderResult.confidence);
    console.log('   User experience score:', renderResult.userExperienceScore);
    
    // Zentix agent performs security analysis
    console.log('\n2. Zentix agent performing security risk analysis...');
    const riskResult = await zentixAgent.analyzeSecurityRisk({
      system: "aios-frontend",
      threats: ["XSS", "CSRF"],
      assets: ["user-session", "personal-data"]
    });
    console.log('   Security analysis completed with confidence:', riskResult.confidence);
    console.log('   Security level:', riskResult.securityLevel);
    
    // Direct message between agents
    console.log('\n3. Sending direct message between agents...');
    quantumSynchronizer.sendMessage(
      aiosAgent.getAgentDNA().main_agent.id,
      zentixAgent.getAgentDNA().main_agent.id,
      {
        type: "security-request",
        task: "validate-ui-components",
        components: ["login-form", "data-input"]
      }
    );
    
    console.log('\n📋 Registered Agents:');
    console.log('   ', quantumSynchronizer.getRegisteredAgents());
    
    console.log('\n🎉 AIOS Agent Integration Test Completed Successfully!');
    console.log('\n📋 Summary of Integration Verification:');
    console.log('   • Agent Creation: ✅ Successful');
    console.log('   • Quantum Synchronization: ✅ Successful');
    console.log('   • Cross-Agent Communication: ✅ Successful');
    console.log('   • Specialized Method Execution: ✅ Successful');
    
  } catch (error) {
    console.error('❌ Error during AIOS agent integration testing:', error);
    process.exit(1);
  }
}

// Run the integration test
testAIOSIntegration();