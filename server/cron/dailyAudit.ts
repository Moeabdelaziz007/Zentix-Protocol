import { supabaseClient } from '../../core/db/supabaseClient';
import { PolicyEngine } from '../../core/security/policyEngine';
import { Agent, AuditResult, Violation } from '../../core/types';

// Internal structured logger (mocked)
function log(message: string, data: unknown = {}): void {
  // In a real application, this would use a proper logger
  // console.log(JSON.stringify({ level: 'error', message, ...data }));
}

/**
 * Runs the daily compliance audit for all agents.
 * @returns The AuditResult object.
 */
async function dailyAudit(): Promise<AuditResult> {
  const date = new Date().toISOString();
  let totalAgents = 0;
  let violationsCount = 0;
  let criticalIssuesCount = 0;
  let totalComplianceScore = 0;
  const recommendations: string[] = [];

  try {
    // 1. Fetch all agents from Supabase
    const agents = await supabaseClient.readAll<"agents">('agents');
    if (!agents) {
      log('Failed to fetch agents from Supabase. Assuming 0 agents.', {});
      return {
        date,
        totalAgents: 0,
        violations: 0,
        criticalIssues: 0,
        avgComplianceScore: 0,
        recommendations: ['Failed to fetch agents from Supabase. Check database connection.'],
      };
    }
    totalAgents = agents.length;

    // 2. Run compliance check for each agent
    const auditPromises = agents.map(async (agent) => {
      // Mock compliance check and score calculation
      const isCompliant = PolicyEngine.checkCompliance(agent.did);
      // Mock score calculation: 95 if compliant, 70 if not
      const complianceScore = isCompliant ? 95 : 70;
      totalComplianceScore += complianceScore;

      // Mock violation detection: if not compliant, 50% chance of a high-severity violation
      const hasViolation = !isCompliant && Math.random() > 0.5;
      if (hasViolation) {
        violationsCount++;
        const violation: Omit<Violation, 'id'> = {
          agent_did: agent.did,
          type: 'Mock Policy Violation',
          severity: 'high',
          timestamp: date,
        };
        await supabaseClient.create('violations', violation);
        recommendations.push(`Agent ${agent.did} has a high-severity violation.`);

        if (violation.severity === 'critical') {
          criticalIssuesCount++;
        }
      }

      // Update agent's compliance score and last audit date
      await supabaseClient.update('agents', agent.id, {
        compliance_score: complianceScore,
        last_audit_date: date,
      });
    });

    await Promise.all(auditPromises);

    // 3. Calculate average compliance score
    const avgComplianceScore = totalAgents > 0 ? totalComplianceScore / totalAgents : 0;

    // 4. Prepare result
    const result: AuditResult = {
      date,
      totalAgents,
      violations: violationsCount,
      criticalIssues: criticalIssuesCount,
      avgComplianceScore: parseFloat(avgComplianceScore.toFixed(2)),
      recommendations: recommendations.length > 0 ? recommendations : ['System is fully compliant. No recommendations needed.'],
    };

    // 5. Save audit result to Supabase
    const auditRecord = await supabaseClient.create('audits', {
      date: result.date,
      total_agents: result.totalAgents,
      violations_count: result.violations,
      critical_issues_count: result.criticalIssues,
      avg_compliance_score: result.avgComplianceScore,
      recommendations: result.recommendations,
      raw_result: JSON.stringify(result),
    });

    if (!auditRecord) {
      log('Failed to save audit record to Supabase.', { result });
    }

    return result;

  } catch (error) {
    log('Critical error during daily audit', { error: (error as Error).message });
    // Return a failure result
    return {
      date,
      totalAgents,
      violations: 0,
      criticalIssues: 0,
      avgComplianceScore: 0,
      recommendations: [`CRITICAL FAILURE: ${(error as Error).message}`],
    };
  }
}

// Execute the cron job and print the result as typed JSON
dailyAudit().then(result => {
  // Cron jobs return typed JSON
  console.log(JSON.stringify(result, null, 2));
}).catch(error => {
  log('Uncaught exception in dailyAudit cron', { error: (error as Error).message });
  // Ensure a JSON output even on uncaught error
  console.error(JSON.stringify({
    date: new Date().toISOString(),
    totalAgents: 0,
    violations: 0,
    criticalIssues: 0,
    avgComplianceScore: 0,
    recommendations: [`FATAL ERROR: ${(error as Error).message}`],
  }, null, 2));
  process.exit(1);
});
