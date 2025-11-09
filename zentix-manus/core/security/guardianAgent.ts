import { Guardian, Report, AuditLog } from './types';

// Mock in-memory storage for demonstration
// The task specifies to "use existing Maps", so I'll define them here as if they were existing.
const guardianMap = new Map<string, Guardian>();
const reportMap = new Map<string, Report>();
const auditLogMap = new Map<string, AuditLog[]>();

// Add some mock data for testing
guardianMap.set('did:zentix:123', { did: 'did:zentix:123', name: 'Alice', status: 'active', complianceScore: 95 });
guardianMap.set('did:zentix:456', { did: 'did:zentix:456', name: 'Bob', status: 'inactive', complianceScore: 80 });
reportMap.set('rep:1', { reportId: 'rep:1', did: 'did:zentix:123', violationType: 'spam', timestamp: Date.now() });
reportMap.set('rep:2', { reportId: 'rep:2', did: 'did:zentix:456', violationType: 'fraud', timestamp: Date.now() });
auditLogMap.set('did:zentix:123', [{ did: 'did:zentix:123', timestamp: Date.now(), details: 'Initial audit' }]);


export class GuardianAgent {
  // Existing method (mocked)
  public getGuardian(did: string): Guardian | undefined {
    return guardianMap.get(did);
  }

  /**
   * Retrieves all registered guardians.
   * @returns An array of all Guardian objects. Returns an empty array if none exist.
   */
  public getAllGuardians(): Guardian[] {
    return Array.from(guardianMap.values());
  }

  /**
   * Retrieves all submitted reports.
   * @returns An array of all Report objects. Returns an empty array if none exist.
   */
  public getAllReports(): Report[] {
    return Array.from(reportMap.values());
  }

  /**
   * Exports the audit history for a specific DID.
   * @param did The Decentralized Identifier of the guardian.
   * @returns An array of AuditLog objects for the given DID. Returns an empty array if none exist.
   */
  public exportAudit(did: string): AuditLog[] {
    return auditLogMap.get(did) ?? [];
  }

  // Placeholder for internal structured logger
  private log(message: string, data: unknown = {}): void {
    // Internal structured logger implementation would go here
  }
}

export const guardianAgent = new GuardianAgent();
