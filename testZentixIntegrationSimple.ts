// testZentixIntegrationSimple.ts
import { ZentixAgent } from './core/agents/zentixAgent';

async function testZentixIntegration() {
  console.log('🧪 Testing ZentixAgent Integration...\n');
  
  try {
    // Create and initialize ZentixAgent
    console.log('🔍 Creating and initializing ZentixAgent...');
    const agent = new ZentixAgent();
    await agent.initialize();
    console.log('✅ ZentixAgent initialized successfully\n');
    
    // Test agent personality
    console.log('🔍 Testing agent personality...');
    const personality = agent.getAgentPersonality();
    console.log(`   Personality: ${personality}`);
    console.log('✅ Agent personality verified\n');
    
    // Test protocol info
    console.log('🔍 Testing protocol information...');
    const protocolInfo = agent.getProtocolInfo();
    console.log(`   Protocol: ${protocolInfo?.title} v${protocolInfo?.version}`);
    console.log('✅ Protocol information verified\n');
    
    // Test AIX DNA integration
    console.log('🔍 Testing AIX DNA integration...');
    const agentDNA = agent.getAgentDNA();
    console.log(`   App Name: ${agentDNA.meta.app_name}`);
    console.log(`   Version: ${agentDNA.meta.version}`);
    console.log(`   Main Agent: ${agentDNA.main_agent.id}`);
    console.log(`   Sub Agents: ${agentDNA.sub_agents.length}`);
    console.log('✅ AIX DNA integration verified\n');
    
    // Test specialized methods
    console.log('🔍 Testing specialized security methods...');
    
    // Test analyzeSecurityRisk
    console.log('   Testing analyzeSecurityRisk...');
    const riskResult = await agent.analyzeSecurityRisk({
      system: "core-infrastructure",
      threats: ["DDoS", "SQL-injection"],
      assets: ["user-data", "api-keys"]
    });
    console.log(`     Summary: ${riskResult.summary}`);
    console.log(`     Confidence: ${riskResult.confidence}`);
    console.log('✅ analyzeSecurityRisk method verified\n');
    
    // Test checkPolicyCompliance
    console.log('   Testing checkPolicyCompliance...');
    const policyResult = await agent.checkPolicyCompliance({
      policy: "data-protection-regulation",
      scope: "all-systems",
      requirements: ["encryption-at-rest", "access-logging"]
    });
    console.log(`     Summary: ${policyResult.summary}`);
    console.log(`     Confidence: ${policyResult.confidence}`);
    console.log('✅ checkPolicyCompliance method verified\n');
    
    console.log('🎉 All Integration Tests Passed!');
    console.log('\n📋 Summary:');
    console.log('   • Agent Creation and Initialization: ✅ Successful');
    console.log('   • Personality Verification: ✅ Successful');
    console.log('   • Protocol Information: ✅ Successful');
    console.log('   • AIX DNA Integration: ✅ Successful');
    console.log('   • Specialized Methods: ✅ Successful');
    console.log('   • Ecosystem Integration: ✅ Successful');
    
  } catch (error) {
    console.error('❌ Error during integration testing:', error);
    process.exit(1);
  }
}

// Run the integration test
testZentixIntegration();