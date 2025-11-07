import { ReportStatus, ReportSeverity, NetworkHealthStatus, GuardianRole } from '../types/enums';

export const mockDashboardData = {
  governance: {
    totalViolations: 3,
    totalAudits: 127,
    activeGuardians: 4,
    averageCompliance: 98.5
  },
  reports: {
    total: 45,
    pending: 8,
    approved: 32,
    rejected: 5
  },
  guardians: {
    total: 4,
    active: 4
  },
  networkHealth: {
    averageCompliance: 98.5,
    status: NetworkHealthStatus.HEALTHY as const
  }
};

export const mockGuardians = [
  {
    did: 'zxdid:zentix:0x8AFCE1B0921A9E91A2B3C4D5E6F7G8H9',
    name: 'Guardian Alpha',
    role: GuardianRole.GUARDIAN as const,
    created: '2025-01-15T10:30:00Z'
  },
  {
    did: 'zxdid:zentix:0x1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
    name: 'Guardian Beta',
    role: GuardianRole.GUARDIAN as const,
    created: '2025-01-16T14:20:00Z'
  },
  {
    did: 'zxdid:zentix:0x9Q8R7S6T5U4V3W2X1Y0Z9A8B7C6D5E4',
    name: 'Monitor Gamma',
    role: GuardianRole.MONITOR as const,
    created: '2025-01-17T09:15:00Z'
  },
  {
    did: 'zxdid:zentix:0xF3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U',
    name: 'Agent Delta',
    role: GuardianRole.AGENT as const,
    created: '2025-01-18T16:45:00Z'
  }
];

export const mockReports = [
  {
    id: 'report-001',
    agentDID: 'zxdid:zentix:0x1A2B3C4D5E6F7G8H9I0J',
    guardianDID: 'zxdid:zentix:0x8AFCE1B0921A9E91A2B3C4D5E6F7G8H9',
    status: ReportStatus.PENDING as const,
    severity: ReportSeverity.HIGH as const,
    description: 'Suspicious transaction pattern detected',
    timestamp: '2025-01-20T10:30:00Z',
    votes: { approve: 2, reject: 0 }
  },
  {
    id: 'report-002',
    agentDID: 'zxdid:zentix:0x2B3C4D5E6F7G8H9I0J1K',
    guardianDID: 'zxdid:zentix:0x1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
    status: ReportStatus.APPROVED as const,
    severity: ReportSeverity.MEDIUM as const,
    description: 'Policy violation in data handling',
    timestamp: '2025-01-19T14:20:00Z',
    votes: { approve: 3, reject: 1 }
  },
  {
    id: 'report-003',
    agentDID: 'zxdid:zentix:0x3C4D5E6F7G8H9I0J1K2L',
    guardianDID: 'zxdid:zentix:0x9Q8R7S6T5U4V3W2X1Y0Z9A8B7C6D5E4',
    status: ReportStatus.REJECTED as const,
    severity: ReportSeverity.LOW as const,
    description: 'False positive - no violation found',
    timestamp: '2025-01-18T09:15:00Z',
    votes: { approve: 1, reject: 3 }
  },
  {
    id: 'report-004',
    agentDID: 'zxdid:zentix:0x4D5E6F7G8H9I0J1K2L3M',
    guardianDID: 'zxdid:zentix:0xF3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U',
    status: ReportStatus.PENDING as const,
    severity: ReportSeverity.CRITICAL as const,
    description: 'Unauthorized access attempt',
    timestamp: '2025-01-20T16:45:00Z',
    votes: { approve: 1, reject: 0 }
  }
];

export const mockRelayerData = {
  balance: '2.4567',
  operational: true,
  stats: {
    maxGasPrice: '100 gwei',
    maxGasLimit: 500000,
    totalTransactions: 1234
  }
};

export const mockTransactionHistory = [
  {
    id: 'tx-001',
    from: '0x1234567890abcdef1234567890abcdef12345678',
    to: '0xabcdef1234567890abcdef1234567890abcdef12',
    hash: '0xabc123def456789012345678901234567890abcdef123456789012345678901234',
    status: 'success' as const,
    timestamp: '2025-01-20T10:30:00Z',
    gasUsed: 21000
  },
  {
    id: 'tx-002',
    from: '0x2345678901abcdef2345678901abcdef23456789',
    to: '0xbcdef12345678901bcdef12345678901bcdef123',
    hash: '0xdef456789012345678901234567890abcdef123456789012345678901234567890',
    status: 'success' as const,
    timestamp: '2025-01-20T09:15:00Z',
    gasUsed: 45000
  },
  {
    id: 'tx-003',
    from: '0x3456789012abcdef3456789012abcdef34567890',
    to: '0xcdef123456789012cdef123456789012cdef1234',
    hash: '0x123456789012345678901234567890abcdef123456789012345678901234567890',
    status: 'failed' as const,
    timestamp: '2025-01-20T08:00:00Z',
    gasUsed: 0
  }
];

export const mockComplianceData = {
  did: 'zxdid:zentix:0x1A2B3C4D5E6F7G8H9I0J',
  complianceScore: 95.5,
  violations: 2,
  recentViolations: [
    {
      id: 'violation-001',
      type: 'policy_breach',
      description: 'Exceeded rate limit',
      timestamp: '2025-01-19T10:30:00Z',
      severity: ReportSeverity.LOW as const
    },
    {
      id: 'violation-002',
      type: 'unauthorized_action',
      description: 'Attempted restricted operation',
      timestamp: '2025-01-18T14:20:00Z',
      severity: ReportSeverity.MEDIUM as const
    }
  ]
};

export const mockAuditData = {
  did: 'zxdid:zentix:0x1A2B3C4D5E6F7G8H9I0J',
  totalEvents: 156,
  complianceScore: 95.5,
  violations: 2,
  auditTrail: [
    {
      timestamp: '2025-01-20T10:30:00Z',
      event: 'transaction',
      result: 'success' as const,
      details: 'Token transfer completed'
    },
    {
      timestamp: '2025-01-19T14:20:00Z',
      event: 'policy_check',
      result: 'violation' as const,
      details: 'Rate limit exceeded'
    },
    {
      timestamp: '2025-01-18T09:15:00Z',
      event: 'authentication',
      result: 'success' as const,
      details: 'DID verified'
    }
  ]
};