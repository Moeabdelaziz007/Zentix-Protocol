/**
 * Central Government Policy Integration
 * Google Policy Analyzer API integration for security and compliance
 * 
 * @module centralGovernmentPolicyIntegration
 * @version 1.0.0
 */

import { GooglePolicyAnalyzerAPI } from '../apis/googlePolicyAnalyzerAPI';
import { AgentLogger } from '../utils/agentLogger';

/**
 * Central Government Policy Integration
 * Enables security analysis and compliance monitoring using Google Policy Analyzer
 */
export class CentralGovernmentPolicyIntegration {
  /**
   * Analyze who has access to specific resources
   * @param userId - ZentixOS user ID
   * @param project - Google Cloud project ID
   * @param resourceQuery - Query about resource access (e.g., "who has access to storage bucket")
   */
  static async analyzeResourceAccess(
    userId: string,
    project: string,
    resourceQuery: string
  ): Promise<Array<{
    principal: string;
    role: string;
    resource: string;
    accessType: string;
    lastAccessTime?: string;
  }>> {
    return AgentLogger.measurePerformance(
      'CentralGovernmentPolicyIntegration',
      'analyzeResourceAccess',
      async () => {
        try {
          // Analyze IAM policy for the resource query
          const analysis = await GooglePolicyAnalyzerAPI.analyzeIamPolicy(userId, project, resourceQuery);
          
          // Transform the results to our format
          return analysis.activity.map(activity => ({
            principal: activity.principal,
            role: activity.role,
            resource: activity.resource,
            accessType: activity.activity,
            lastAccessTime: activity.activityTime
          }));
        } catch (error) {
          console.error('Error analyzing resource access:', error);
          throw error;
        }
      },
      { userId, project, resourceQuery }
    );
  }

  /**
   * Check for risky permissions in the project
   * @param userId - ZentixOS user ID
   * @param project - Google Cloud project ID
   */
  static async checkRiskyPermissions(
    userId: string,
    project: string
  ): Promise<Array<{
    principal: string;
    role: string;
    riskyPermission: string;
    resource: string;
    riskLevel: 'high' | 'medium' | 'low';
    recommendation: string;
  }>> {
    return AgentLogger.measurePerformance(
      'CentralGovernmentPolicyIntegration',
      'checkRiskyPermissions',
      async () => {
        try {
          // Check for risky permissions
          const riskyPermissions = await GooglePolicyAnalyzerAPI.checkRiskyPermissions(userId, project);
          
          // Transform and enhance the results
          return riskyPermissions.map(permission => {
            // Determine risk level based on permission type
            let riskLevel: 'high' | 'medium' | 'low' = 'medium';
            let recommendation = 'Review and restrict permissions as needed';
            
            if (permission.riskyPermission === '*' || permission.riskyPermission.includes('delete') || permission.riskyPermission.includes('admin')) {
              riskLevel = 'high';
              recommendation = 'Immediately restrict permissions - this is a critical security risk';
            } else if (permission.riskyPermission.includes('write') || permission.riskyPermission.includes('update')) {
              riskLevel = 'medium';
              recommendation = 'Consider restricting write permissions to principle of least privilege';
            }
            
            return {
              principal: permission.principal,
              role: permission.role,
              riskyPermission: permission.riskyPermission,
              resource: permission.resource,
              riskLevel,
              recommendation
            };
          });
        } catch (error) {
          console.error('Error checking risky permissions:', error);
          throw error;
        }
      },
      { userId, project }
    );
  }

  /**
   * Get last access information for sensitive resources
   * @param userId - ZentixOS user ID
   * @param project - Google Cloud project ID
   * @param resourceName - Full resource name
   */
  static async getLastAccessForResource(
    userId: string,
    project: string,
    resourceName: string
  ): Promise<Array<{
    principal: string;
    role: string;
    lastAccessTime: string;
    accessCount: number;
    daysSinceLastAccess: number;
  }>> {
    return AgentLogger.measurePerformance(
      'CentralGovernmentPolicyIntegration',
      'getLastAccessForResource',
      async () => {
        try {
          // Get last access information
          const accessInfo = await GooglePolicyAnalyzerAPI.getLastAccess(userId, project, resourceName);
          
          // Enhance with days since last access
          return accessInfo.map(info => {
            const lastAccessDate = new Date(info.lastAccessTime);
            const daysSinceLastAccess = Math.floor((Date.now() - lastAccessDate.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              ...info,
              daysSinceLastAccess
            };
          });
        } catch (error) {
          console.error('Error getting last access for resource:', error);
          throw error;
        }
      },
      { userId, project, resourceName }
    );
  }

  /**
   * Analyze policy changes over time
   * @param userId - ZentixOS user ID
   * @param project - Google Cloud project ID
   * @param days - Number of days to analyze (default: 30)
   */
  static async analyzePolicyChanges(
    userId: string,
    project: string,
    days: number = 30
  ): Promise<Array<{
    changeType: string;
    principal: string;
    role: string;
    resource: string;
    timestamp: string;
    changer: string;
    riskAssessment: string;
  }>> {
    return AgentLogger.measurePerformance(
      'CentralGovernmentPolicyIntegration',
      'analyzePolicyChanges',
      async () => {
        try {
          // Analyze policy changes
          const changes = await GooglePolicyAnalyzerAPI.analyzePolicyChanges(userId, project, days);
          
          // Enhance with risk assessment
          return changes.map(change => {
            let riskAssessment = 'Low risk';
            
            if (change.changeType.includes('ADD') && (change.role.includes('admin') || change.role.includes('owner'))) {
              riskAssessment = 'High risk - Admin permissions granted';
            } else if (change.changeType.includes('REMOVE')) {
              riskAssessment = 'Medium risk - Permissions removed';
            }
            
            return {
              ...change,
              riskAssessment
            };
          });
        } catch (error) {
          console.error('Error analyzing policy changes:', error);
          throw error;
        }
      },
      { userId, project, days }
    );
  }

  /**
   * Generate security audit report
   * @param userId - ZentixOS user ID
   * @param project - Google Cloud project ID
   */
  static async generateSecurityAuditReport(
    userId: string,
    project: string
  ): Promise<{
    timestamp: string;
    project: string;
    summary: {
      totalPrincipals: number;
      highRiskPermissions: number;
      unusedPermissions: number;
      recentPolicyChanges: number;
    };
    findings: Array<{
      category: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      recommendation: string;
    }>;
  }> {
    return AgentLogger.measurePerformance(
      'CentralGovernmentPolicyIntegration',
      'generateSecurityAuditReport',
      async () => {
        try {
          // Gather various security insights
          const riskyPermissions = await this.checkRiskyPermissions(userId, project);
          const policyChanges = await this.analyzePolicyChanges(userId, project, 30);
          
          // Generate findings
          const findings = [];
          
          // Add risky permissions findings
          riskyPermissions.forEach(permission => {
            findings.push({
              category: 'Risky Permissions',
              description: `${permission.principal} has ${permission.riskLevel} risk permission ${permission.riskyPermission} on ${permission.resource}`,
              severity: permission.riskLevel,
              recommendation: permission.recommendation
            });
          });
          
          // Add policy change findings
          const highRiskChanges = policyChanges.filter(change => change.riskAssessment.includes('High'));
          if (highRiskChanges.length > 0) {
            findings.push({
              category: 'Policy Changes',
              description: `Found ${highRiskChanges.length} high-risk policy changes in the last 30 days`,
              severity: 'high',
              recommendation: 'Review all recent policy changes and revoke unnecessary permissions'
            });
          }
          
          // Generate summary
          const summary = {
            totalPrincipals: new Set(riskyPermissions.map(p => p.principal)).size,
            highRiskPermissions: riskyPermissions.filter(p => p.riskLevel === 'high').length,
            unusedPermissions: 0, // Would require additional analysis in a real implementation
            recentPolicyChanges: policyChanges.length
          };
          
          return {
            timestamp: new Date().toISOString(),
            project,
            summary,
            findings
          };
        } catch (error) {
          console.error('Error generating security audit report:', error);
          throw error;
        }
      },
      { userId, project }
    );
  }
}