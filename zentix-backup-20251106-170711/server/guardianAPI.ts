#!/usr/bin/env tsx
/**
 * Guardian API Server
 * REST API for governance monitoring and statistics
 * 
 * Run: npm run guardian:api
 */

import express from 'express';
import cors from 'cors';
import { PolicyEngine } from '../core/security/policyEngine';
import { GuardianAgent } from '../core/security/guardianAgent';

const app = express();
const PORT = process.env.GUARDIAN_API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const governanceStats = {
  totalViolations: 0,
  totalAudits: 0,
  activeGuardians: 4,
  averageCompliance: 100,
};

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'zentix-guardian-api',
    version: '0.6.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get governance statistics
 */
app.get('/api/governance/stats', (req, res) => {
  res.json({
    success: true,
    data: governanceStats,
  });
});

/**
 * Get compliance score for agent
 */
app.get('/api/compliance/:did', (req, res) => {
  try {
    const { did } = req.params;
    const score = PolicyEngine.getComplianceScore(did);
    const violations = PolicyEngine.getViolationHistory(did);

    res.json({
      success: true,
      data: {
        did,
        complianceScore: score,
        violations: violations.length,
        recentViolations: violations.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Report agent activity for monitoring
 */
app.post('/api/guardians/monitor', async (req, res) => {
  try {
    const { agentDID, action, metadata } = req.body;

    if (!agentDID || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentDID, action',
      });
    }

    // Enforce policy
    const violation = await PolicyEngine.enforce(agentDID, action, metadata || {});

    if (violation) {
      governanceStats.totalViolations++;
      
      res.json({
        success: true,
        violation: true,
        data: violation,
      });
    } else {
      res.json({
        success: true,
        violation: false,
        message: 'Action compliant with policies',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get all guardians
 */
app.get('/api/guardians', (req, res) => {
  const guardians = GuardianAgent.getAllGuardians();

  res.json({
    success: true,
    data: {
      total: guardians.length,
      guardians: guardians.map((g) => ({
        did: g.did.did,
        name: g.aix.name,
        role: (g as any).role || 'guardian',
        created: g.did.created_at,
      })),
    },
  });
});

/**
 * Get guardian reports
 */
app.get('/api/guardians/reports', (req, res) => {
  const reports = GuardianAgent.getAllReports();
  const { status, severity } = req.query;

  let filtered = reports;

  if (status) {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (severity) {
    filtered = filtered.filter((r) => r.severity === severity);
  }

  res.json({
    success: true,
    data: {
      total: filtered.length,
      reports: filtered.slice(0, 20), // Limit to 20
    },
  });
});

/**
 * Vote on guardian report (decentralized review)
 */
app.post('/api/guardians/reports/:reportId/vote', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { guardianDID, approve } = req.body;

    if (!guardianDID || approve === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: guardianDID, approve',
      });
    }

    // Create mock guardian for vote
    const mockGuardian = { did: { did: guardianDID } } as any;
    const result = await GuardianAgent.reviewReport(reportId, mockGuardian, approve);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Export compliance audit
 */
app.get('/api/compliance/audit/export', (req, res) => {
  try {
    const { did } = req.query;

    if (!did || typeof did !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: did',
      });
    }

    const audit = PolicyEngine.exportAudit(did);

    res.json({
      success: true,
      data: audit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Dashboard statistics
 */
app.get('/api/dashboard', (req, res) => {
  const allReports = GuardianAgent.getAllReports();
  const pendingReports = allReports.filter((r) => r.status === 'pending');
  const approvedReports = allReports.filter((r) => r.status === 'approved');
  const rejectedReports = allReports.filter((r) => r.status === 'rejected');

  res.json({
    success: true,
    data: {
      governance: governanceStats,
      reports: {
        total: allReports.length,
        pending: pendingReports.length,
        approved: approvedReports.length,
        rejected: rejectedReports.length,
      },
      guardians: {
        total: governanceStats.activeGuardians,
        active: governanceStats.activeGuardians,
      },
      networkHealth: {
        averageCompliance: governanceStats.averageCompliance,
        status: governanceStats.averageCompliance >= 70 ? 'healthy' : 'warning',
      },
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🛡️  Zentix Guardian API Server');
  console.log('═'.repeat(40));
  console.log(`\n📡 Server running on http://localhost:${PORT}`);
  console.log('\nEndpoints:');
  console.log('  GET  /health                           - Health check');
  console.log('  GET  /api/governance/stats             - Governance statistics');
  console.log('  GET  /api/compliance/:did              - Agent compliance score');
  console.log('  POST /api/guardians/monitor            - Monitor agent activity');
  console.log('  GET  /api/guardians                    - List all guardians');
  console.log('  GET  /api/guardians/reports            - Get guardian reports');
  console.log('  POST /api/guardians/reports/:id/vote   - Vote on report');
  console.log('  GET  /api/compliance/audit/export      - Export compliance audit');
  console.log('  GET  /api/dashboard                    - Dashboard data');
  console.log('\n💡 Guardian system ready for monitoring!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Guardian API...');
  process.exit(0);
});
