import { Guardian, Report, AuditLog } from '../types';

// Mock in-memory storage for demonstration
const guardianMap = new Map<string, Guardian>();
const reportMap = new Map<string, Report>();
const auditLogMap = new Map<string, AuditLog[]>();

// Add some mock data for testing
guardianMap.set('did:zentix:123', { id: '1', did: 'did:zentix:123', name: 'Alice', points: 100, status: 'active', complianceScore: 95 });
guardianMap.set('did:zentix:456', { id: '2', did: 'did:zentix:456', name: 'Bob', points: 80, status: 'inactive', complianceScore: 80 });
reportMap.set('rep:1', { reportId: 'rep:1', did: 'did:zentix:123', violationType: 'spam', timestamp: Date.now() });
reportMap.set('rep:2', { reportId: 'rep:2', did: 'did:zentix:456', violationType: 'fraud', timestamp: Date.now() });
auditLogMap.set('did:zentix:123', [{ did: 'did:zentix:123', timestamp: Date.now(), details: 'Initial audit' }]);

export class PolicyEngine {
  // Existing method (mocked)
  public static checkCompliance(did: string): boolean {
    const guardian = guardianMap.get(did);
    return guardian ? (guardian.complianceScore ?? 0) >= 90 : false;
  }

  /**
   * Retrieves all registered guardians.
   * @returns An array of all Guardian objects. Returns an empty array if none exist.
   */
  public static getAllGuardians(): Guardian[] {
    return Array.from(guardianMap.values());
  }

  /**
   * Retrieves all submitted reports.
   * @returns An array of all Report objects. Returns an empty array if none exist.
   */
  public static getAllReports(): Report[] {
    return Array.from(reportMap.values());
  }

  /**
   * Exports the audit history for a specific DID.
   * @param did The Decentralized Identifier of the guardian.
   * @returns An array of AuditLog objects for the given DID. Returns an empty array if none exist.
   */
  public static exportAudit(did: string): AuditLog[] {
    return auditLogMap.get(did) ?? [];
  }

  // Placeholder for internal structured logger
  private static log(message: string, data: unknown = {}): void {
    // Internal structured logger implementation would go here
  }
}
