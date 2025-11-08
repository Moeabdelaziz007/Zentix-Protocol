import { ZentixAgent } from '../core/agents/zentixAgent';

async function runZentixAgentDemo() {
  console.log('🚀 Initializing ZentixAgent with Governance Protocol...');
  
  // Create and initialize the Zentix agent
  const agent = new ZentixAgent();
  
  try {
    await agent.initialize();
    console.log('✅ ZentixAgent successfully initialized');
    
    // Display agent personality and protocol info
    console.log('\n📋 Agent Information:');
    console.log(`  Personality: ${agent.getAgentPersonality()}`);
    const protocolInfo = agent.getProtocolInfo();
    if (protocolInfo) {
      console.log(`  Protocol: ${protocolInfo.title} v${protocolInfo.version}`);
    }
    
    // Display AIX DNA information
    console.log('\n🧬 AIX DNA Integration:');
    const agentDNA = agent.getAgentDNA();
    console.log(`  App Name: ${agentDNA.meta.app_name}`);
    console.log(`  Version: ${agentDNA.meta.version}`);
    console.log(`  Main Agent: ${agentDNA.main_agent.id}`);
    console.log(`  Persona: ${agentDNA.main_agent.persona.tone}`);
    console.log(`  Skills: ${agentDNA.main_agent.skills.join(', ')}`);
    console.log(`  Sub Agents: ${agentDNA.sub_agents.length} configured`);
    
    // Demonstrate specialized security functions
    console.log('\n🔍 Demonstrating Specialized Security Functions:');
    
    // Security risk analysis
    console.log('\n1. Security Risk Analysis:');
    const riskResult = await agent.analyzeSecurityRisk({
      system: "core-infrastructure",
      threats: ["DDoS", "SQL-injection", "privilege-escalation"],
      assets: ["user-data", "financial-records", "api-keys"]
    });
    console.log('   Result:', JSON.stringify(riskResult, null, 2));
    
    // Policy compliance checking
    console.log('\n2. Policy Compliance Check:');
    const policyResult = await agent.checkPolicyCompliance({
      policy: "data-protection-regulation",
      scope: "all-systems",
      requirements: ["encryption-at-rest", "access-logging", "audit-trails"]
    });
    console.log('   Result:', JSON.stringify(policyResult, null, 2));
    
    console.log('\n✅ ZentixAgent demo completed successfully!');
    console.log('\n🛡️ Key Features Demonstrated:');
    console.log('   • Governance Protocol Compliance');
    console.log('   • Security-First Decision Making');
    console.log('   • Analytical Processing Framework');
    console.log('   • Policy Compliance Verification');
    console.log('   • Structured Output Formatting');
    console.log('   • AIX DNA Integration');
    
  } catch (error) {
    console.error('❌ Error during ZentixAgent demo:', error);
  }
}

// Run the demo
runZentixAgentDemo();

// Export for use in other modules
export { runZentixAgentDemo, ZentixAgent };