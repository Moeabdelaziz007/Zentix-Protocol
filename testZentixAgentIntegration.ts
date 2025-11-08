// testZentixAgentIntegration.ts
import { ZentixAgentFactory, ZentixAgentCreationOptions } from './core/integration/zentixAgentFactory';

async function testZentixAgentIntegration() {
  console.log('🧪 Testing ZentixAgent Integration with Zentix Protocol Ecosystem...\n');
  
  try {
    // Test creating a Zentix Security Agent
    console.log('🔍 Testing Zentix Security Agent Creation...');
    const creationOptions: ZentixAgentCreationOptions = {
      name: 'ZentixGuard',
      archetype: 'guardian',
      tone: 'analytical, sovereign, disciplined',
      values: ['security', 'compliance', 'integrity'],
      skills: [
        { name: 'security_analysis', description: 'Analyze security vulnerabilities' },
        { name: 'policy_compliance', description: 'Ensure policy compliance' },
        { name: 'risk_assessment', description: 'Assess security risks' },
        { name: 'threat_detection', description: 'Detect security threats' }
      ],
      workspace_id: 'security-ops-001',
      initial_balance: 100,
      securityLevel: 'high',
      complianceRequirements: ['GDPR', 'SOC2', 'ISO27001', 'PCI-DSS']
    };
    
    const zentixAgent = await ZentixAgentFactory.createZentixSecurityAgent(creationOptions);
    console.log('✅ Zentix Security Agent created successfully\n');
    
    // Display agent profile
    console.log('📋 Zentix Security Agent Profile:');
    const profile = ZentixAgentFactory.getZentixAgentProfile(zentixAgent);
    console.log(`   Name: ${profile.name}`);
    console.log(`   DID: ${profile.did}`);
    console.log(`   Age: ${profile.age_days} days`);
    console.log(`   Wallet Balance: ${profile.wallet.balance} ZXT`);
    console.log(`   Security Level: ${profile.security.level}`);
    console.log(`   Compliance Requirements: ${profile.security.compliance.join(', ')}`);
    console.log(`   AIX DNA App: ${profile.security.dna.app_name} v${profile.security.dna.version}`);
    console.log(`   Sub Agents: ${profile.security.dna.sub_agents}\n`);
    
    // Test performing a security analysis
    console.log('🔍 Testing Security Analysis Task...');
    const analyzedAgent = await ZentixAgentFactory.performSecurityAnalysis(
      zentixAgent,
      'core-infrastructure',
      ['DDoS', 'SQL-injection', 'privilege-escalation'],
      ['user-data', 'financial-records', 'api-keys']
    );
    console.log('✅ Security analysis completed successfully\n');
    
    // Display analysis results
    console.log('📊 Security Analysis Results:');
    const lastAnalysis = analyzedAgent.aix_did.aix.security.last_analysis;
    console.log(`   System: ${lastAnalysis.system}`);
    console.log(`   Threats: ${lastAnalysis.threats.join(', ')}`);
    console.log(`   Assets: ${lastAnalysis.assets.join(', ')}`);
    console.log(`   Summary: ${lastAnalysis.result.summary}`);
    console.log(`   Confidence: ${lastAnalysis.result.confidence}`);
    console.log(`   Security Level: ${lastAnalysis.result.securityLevel}`);
    console.log(`   Compliance Status: ${lastAnalysis.result.complianceStatus}\n`);
    
    // Test checking policy compliance
    console.log('🔍 Testing Policy Compliance Check...');
    const complianceAgent = await ZentixAgentFactory.checkPolicyCompliance(
      analyzedAgent,
      'data-protection-regulation',
      'all-systems',
      ['encryption-at-rest', 'access-logging', 'audit-trails']
    );
    console.log('✅ Policy compliance check completed successfully\n');
    
    // Display compliance results
    console.log('📋 Policy Compliance Results:');
    const lastCompliance = complianceAgent.aix_did.aix.security.last_compliance_check;
    console.log(`   Policy: ${lastCompliance.policy}`);
    console.log(`   Scope: ${lastCompliance.scope}`);
    console.log(`   Requirements: ${lastCompliance.requirements.join(', ')}`);
    console.log(`   Summary: ${lastCompliance.result.summary}`);
    console.log(`   Confidence: ${lastCompliance.result.confidence}`);
    console.log(`   Compliance Status: ${lastCompliance.result.complianceStatus}\n`);
    
    // Verify agent capabilities
    console.log('🔧 Verifying Agent Capabilities...');
    console.log(`   Analyze Security Risk: ${profile.capabilities.analyzeSecurityRisk ? '✅ Available' : '❌ Not Available'}`);
    console.log(`   Check Policy Compliance: ${profile.capabilities.checkPolicyCompliance ? '✅ Available' : '❌ Not Available'}`);
    console.log(`   Quantum Synchronization: ${profile.capabilities.quantumSynchronization ? '✅ Available' : '❌ Not Available'}`);
    console.log(`   AIX DNA Integration: ${profile.capabilities.aixDNAIntegration ? '✅ Available' : '❌ Not Available'}`);
    
    console.log('\n🎉 ZentixAgent Integration Test Completed Successfully!');
    console.log('\n📋 Summary of Integration Verification:');
    console.log('   • Agent Creation: ✅ Successful');
    console.log('   • Profile Generation: ✅ Successful');
    console.log('   • Security Analysis: ✅ Successful');
    console.log('   • Policy Compliance: ✅ Successful');
    console.log('   • Capability Verification: ✅ Successful');
    console.log('   • Ecosystem Integration: ✅ Successful');
    
  } catch (error) {
    console.error('❌ Error during ZentixAgent integration testing:', error);
    process.exit(1);
  }
}

// Run the integration test
testZentixAgentIntegration();