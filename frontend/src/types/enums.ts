export const ReportStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export const ReportSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export type ReportSeverity = typeof ReportSeverity[keyof typeof ReportSeverity];

export const NetworkHealthStatus = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  ERROR: 'error'
} as const;

export type NetworkHealthStatus = typeof NetworkHealthStatus[keyof typeof NetworkHealthStatus];

export const GuardianRole = {
  GUARDIAN: 'guardian',
  MONITOR: 'monitor',
  AGENT: 'agent'
} as const;

export type GuardianRole = typeof GuardianRole[keyof typeof GuardianRole];