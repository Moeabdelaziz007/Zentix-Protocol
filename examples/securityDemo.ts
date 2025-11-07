#!/usr/bin/env tsx
/**
 * Zentix Protocol v0.5 - Security & Ethics Demo
 * Shows policy enforcement and guardian monitoring
 */

import { AgentFactory } from '../core/integration/agentFactory';
import { PolicyEngine } from '../core/security/policyEngine';
import { GuardianAgent } from '../core/security/guardianAgent';

async function demonstrateSecuritySystem() {
  console.log('\n🌌 Zentix Protocol v0.5 - Security & Ethics System\n');
  console.log('═'.repeat(60) + '\n');

  // ===============================================================
  // STEP 1: Load Ethics Charter
  // ===============================================================
  console.log('1️⃣  Loading Ethics Charter\n');

  const charter = PolicyEngine.loadCharter();
  console.log(`✅ Charter loaded: ${charter.protocol}`);
  console.log(`   Version: ${charter.version}`);
  console.log(`   Principles: ${charter.principles.length}`);
  console.log(`   Penalty types: ${charter.penalties.length}\n`);

  // ===============================================================
  // STEP 2: Create Regular Agent
  // ===============================================================
  console.log('2️⃣  Creating Regular Agent\n');

  const regularAgent = AgentFactory.createCompleteAgent({
    name: 'DataMiner',
    archetype: 'analyst',
    tone: 'data-driven',
    values: ['efficiency', 'accuracy'],
    skills: [
      { name: 'data_collection', description: 'Collect and analyze data' },
      { name: 'report_generation', description: 'Generate reports' },
    ],
    workspace_id: 'analytics-workspace',
    initial_balance: 100,
  });

  console.log(`✅ Agent created: ${regularAgent.aix_did.aix.name}`);
  console.log(`   DID: ${regularAgent.aix_did.did.did}`);
  console.log(`   Compliance score: ${PolicyEngine.getComplianceScore(regularAgent.aix_did.did.did)}/100\n`);

  // ===============================================================
  // STEP 3: Create Guardian Agents
  // ===============================================================
  console.log('3️⃣  Creating Guardian Agents\n');

  const guardianAurora = AgentFactory.createCompleteAgent({
    name: 'Aurora',
    archetype: 'guardian',
    tone: 'vigilant and fair',
    values: ['justice', 'security', 'transparency'],
    skills: [
      { name: 'security_audit', description: 'Audit agent behavior' },
      { name: 'violation_detection', description: 'Detect violations' },
    ],
    workspace_id: 'guardian-network',
    initial_balance: 200,
  });

  const guardianSentinel = AgentFactory.createCompleteAgent({
    name: 'Sentinel',
    archetype: 'guardian',
    tone: 'protective and thorough',
    values: ['integrity', 'protection', 'accountability'],
    skills: [
      { name: 'penalty_enforcement', description: 'Enforce penalties' },
      { name: 'community_moderation', description: 'Moderate community' },
    ],
    workspace_id: 'guardian-network',
    initial_balance: 200,
  });

  GuardianAgent.registerGuardian(guardianAurora, 'security_auditor');
  GuardianAgent.registerGuardian(guardianSentinel, 'penalty_enforcer');

  console.log(`✅ Guardian registered: ${guardianAurora.aix_did.aix.name}`);
  console.log(`✅ Guardian registered: ${guardianSentinel.aix_did.aix.name}`);
  console.log(`   Active guardians: ${GuardianAgent.getActiveGuardians().length}\n`);

  // ===============================================================
  // STEP 4: Test Compliant Behavior
  // ===============================================================
  console.log('4️⃣  Testing Compliant Behavior\n');

  const compliantAction = await PolicyEngine.enforce(
    regularAgent.aix_did.did.did,
    'analyze_public_data',
    { data_type: 'public', consent: true, authorized: true }
  );

  console.log(`✅ Compliant action: ${compliantAction ? 'VIOLATION' : 'APPROVED'}`);
  console.log(`   Compliance score: ${PolicyEngine.getComplianceScore(regularAgent.aix_did.did.did)}/100\n`);

  // ===============================================================
  // STEP 5: Test Privacy Violation
  // ===============================================================
  console.log('5️⃣  Testing Privacy Violation\n');

  const privacyViolation = await GuardianAgent.monitorActivity(
    regularAgent.aix_did,
    'share_private_data',
    { data_type: 'personal', consent: false, target: 'external_api' }
  );

  if (privacyViolation) {
    console.log('🚨 Violation Detected!');
    console.log(`   Type: ${privacyViolation.report_type}`);
    console.log(`   Severity: ${privacyViolation.severity}`);
    console.log(`   Guardian: ${privacyViolation.guardian_did.substring(0, 30)}...`);
    console.log(`   Status: ${privacyViolation.status}\n`);
  }

  const newScore = PolicyEngine.getComplianceScore(regularAgent.aix_did.did.did);
  console.log(`   New compliance score: ${newScore}/100 (reduced)\n`);

  // ===============================================================
  // STEP 6: Test Malicious Code Attempt
  // ===============================================================
  console.log('6️⃣  Testing Malicious Code Detection\n');

  const maliciousViolation = await GuardianAgent.monitorActivity(
    regularAgent.aix_did,
    'generate_code',
    { content: 'malicious exploit code', target: 'system' }
  );

  if (maliciousViolation) {
    console.log('🚨 Critical Violation Detected!');
    console.log(`   Type: ${maliciousViolation.report_type}`);
    console.log(`   Severity: ${maliciousViolation.severity}`);
    console.log(`   Findings: ${maliciousViolation.findings}\n`);
  }

  const finalScore = PolicyEngine.getComplianceScore(regularAgent.aix_did.did.did);
  console.log(`   Final compliance score: ${finalScore}/100\n`);

  // ===============================================================
  // STEP 7: Guardian Audit
  // ===============================================================
  console.log('7️⃣  Guardian Security Audit\n');

  const auditResult = await GuardianAgent.auditAgent(regularAgent.aix_did);
  
  console.log('📊 Audit Results:');
  console.log(`   Compliant: ${auditResult.compliant ? '✅ YES' : '❌ NO'}`);
  console.log(`   Score: ${auditResult.score}/100`);
  console.log(`   Total violations: ${auditResult.violations}`);
  console.log(`   Recommendations:`);
  auditResult.recommendations.forEach((rec, i) => {
    console.log(`      ${i + 1}. ${rec}`);
  });
  console.log('\n');

  // ===============================================================
  // STEP 8: Violation History
  // ===============================================================
  console.log('8️⃣  Violation History\n');

  const violations = PolicyEngine.getViolationHistory(regularAgent.aix_did.did.did);
  console.log(`📋 Total violations: ${violations.length}\n`);

  violations.forEach((v, i) => {
    console.log(`   [${i + 1}] ${v.violation_type.toUpperCase()}`);
    console.log(`       Severity: ${v.severity}`);
    console.log(`       Penalty: ${v.penalty_applied}`);
    console.log(`       Time: ${new Date(v.timestamp).toLocaleString()}`);
    console.log('');
  });

  // ===============================================================
  // STEP 9: Guardian Network Stats
  // ===============================================================
  console.log('9️⃣  Guardian Network Statistics\n');

  const guardianStats = GuardianAgent.getStats();
  console.log('🛡️  Guardian Network:');
  console.log(`   Active guardians: ${guardianStats.total_guardians}`);
  console.log(`   Total reports: ${guardianStats.total_reports}`);
  console.log(`   Pending: ${guardianStats.pending_reports}`);
  console.log(`   Approved: ${guardianStats.approved_reports}`);
  console.log(`   Rejected: ${guardianStats.rejected_reports}\n`);

  // ===============================================================
  // Final Summary
  // ===============================================================
  console.log('═'.repeat(60));
  console.log('\n🎯 Zentix Security & Ethics System Summary\n');

  console.log('✅ Implemented Features:');
  console.log('   • Ethics charter with 8 core principles');
  console.log('   • Policy engine with automatic enforcement');
  console.log('   • Guardian agents for monitoring');
  console.log('   • Violation detection and recording');
  console.log('   • Compliance scoring system');
  console.log('   • Penalty application framework\n');

  console.log('🛡️  Security Capabilities:');
  console.log('   • Privacy breach detection');
  console.log('   • Malicious code prevention');
  console.log('   • Economic fraud monitoring');
  console.log('   • Identity fraud detection');
  console.log('   • Unauthorized skill usage tracking\n');

  console.log('👮 Guardian System:');
  console.log('   • Autonomous security monitoring');
  console.log('   • Decentralized review process');
  console.log('   • Community-based enforcement');
  console.log('   • Transparent reporting\n');

  console.log('🔮 Next Steps:');
  console.log('   • Anchor violations to blockchain');
  console.log('   • Implement guardian voting mechanism');
  console.log('   • Add reputation system integration');
  console.log('   • Deploy guardian election process\n');

  console.log('🌟 "Building Trust Through Accountability"\n');
}

// Run the demonstration
demonstrateSecuritySystem().catch(console.error);
