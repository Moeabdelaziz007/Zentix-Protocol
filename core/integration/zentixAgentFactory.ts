/**
 * Zentix Security Agent Factory
 * Creates complete ZentixAgent instances with DID, AIX, Wallet, and blockchain anchoring
 * 
 * @module zentixAgentFactory
 * @version 0.3.0
 */

import { AgentFactory, AgentCreationOptions, CompleteAgent } from './agentFactory';
import { ZentixAgent } from '../../core/agents/zentixAgent';

/**
 * Zentix Security Agent with all layers
 */
export interface ZentixSecurityAgent extends CompleteAgent {
  agent: ZentixAgent;
}

/**
 * Zentix Security Agent creation options
 */
export interface ZentixAgentCreationOptions extends Omit<AgentCreationOptions, 'archetype' | 'tone' | 'values' | 'skills'> {
  archetype?: 'analyst' | 'creative' | 'helper' | 'guardian' | 'explorer';
  tone?: string;
  values?: string[];
  skills?: Array<{ name: string; description: string }>;
  securityLevel?: 'high' | 'medium' | 'low';
  complianceRequirements?: string[];
}

/**
 * Factory for creating complete Zentix Security agents
 */
export class ZentixAgentFactory {
  /**
   * Create a complete Zentix Security agent with all layers integrated
   * 
   * @param options - Zentix agent creation options
   * @returns Complete Zentix Security agent with DID, AIX, Wallet, anchoring, and ZentixAgent instance
   */
  static async createZentixSecurityAgent(options: ZentixAgentCreationOptions): Promise<ZentixSecurityAgent> {
    const {
      name,
      archetype = 'guardian',
      tone = 'analytical, sovereign, disciplined',
      values = ['security', 'compliance', 'integrity'],
      skills = [
        { name: 'security_analysis', description: 'Analyze security vulnerabilities' },
        { name: 'policy_compliance', description: 'Ensure policy compliance' },
        { name: 'risk_assessment', description: 'Assess security risks' },
        { name: 'threat_detection', description: 'Detect security threats' }
      ],
      workspace_id,
      blockchain,
      initial_balance,
      securityLevel = 'high',
      complianceRequirements = ['GDPR', 'SOC2', 'ISO27001']
    } = options;

    // Create the base complete agent using the main factory
    const baseAgent = AgentFactory.createCompleteAgent({
      name,
      archetype,
      tone,
      values,
      skills,
      workspace_id,
      blockchain,
      initial_balance
    });

    // Create the ZentixAgent instance
    const zentixAgent = new ZentixAgent();
    
    // Initialize the agent with the governance protocol
    await zentixAgent.initialize();
    
    // Add security-specific metadata to the agent's AIX
    const updatedAixDid = {
      ...baseAgent.aix_did,
      aix: {
        ...baseAgent.aix_did.aix,
        security: {
          level: securityLevel,
          compliance: complianceRequirements,
          last_scan: new Date().toISOString()
        }
      }
    };

    return {
      ...baseAgent,
      aix_did: updatedAixDid,
      agent: zentixAgent
    };
  }

  /**
   * Get complete Zentix Security agent profile
   * 
   * @param agent - Complete Zentix Security agent
   * @returns Comprehensive agent profile with security information
   */
  static getZentixAgentProfile(agent: ZentixSecurityAgent) {
    const baseProfile = AgentFactory.getAgentProfile(agent);
    const agentDNA = agent.agent.getAgentDNA();
    
    return {
      ...baseProfile,
      // Security-specific information
      security: {
        level: agent.aix_did.aix.security?.level || 'medium',
        compliance: agent.aix_did.aix.security?.compliance || [],
        last_scan: agent.aix_did.aix.security?.last_scan,
        dna: {
          app_name: agentDNA.meta.app_name,
          version: agentDNA.meta.version,
          main_agent: agentDNA.main_agent.id,
          sub_agents: agentDNA.sub_agents.length
        }
      },
      // Agent capabilities
      capabilities: {
        analyzeSecurityRisk: true,
        checkPolicyCompliance: true,
        quantumSynchronization: true,
        aixDNAIntegration: true
      }
    };
  }

  /**
   * Perform a security analysis task
   * 
   * @param agent - Zentix Security agent
   * @param system - System to analyze
   * @param threats - Threats to consider
   * @param assets - Assets to protect
   * @returns Updated agent with analysis results
   */
  static async performSecurityAnalysis(
    agent: ZentixSecurityAgent,
    system: string,
    threats: string[],
    assets: string[]
  ): Promise<ZentixSecurityAgent> {
    const updatedAgent = { ...agent };
    
    try {
      // Perform the security analysis using the ZentixAgent
      const result = await agent.agent.analyzeSecurityRisk({
        system,
        threats,
        assets
      });
      
      // Record the analysis in the agent's history
      updatedAgent.aix_did = {
        ...updatedAgent.aix_did,
        aix: {
          ...updatedAgent.aix_did.aix,
          security: {
            ...updatedAgent.aix_did.aix.security,
            last_analysis: {
              system,
              threats,
              assets,
              result: {
                summary: result.summary,
                confidence: result.confidence,
                securityLevel: result.securityLevel,
                complianceStatus: result.complianceStatus
              },
              timestamp: new Date().toISOString()
            }
          }
        }
      };
      
      // Record event in DID history
      updatedAgent.aix_did = {
        ...updatedAgent.aix_did,
        did: {
          ...updatedAgent.aix_did.did,
          history: [
            ...updatedAgent.aix_did.did.history,
            {
              event: 'security_analysis_completed',
              timestamp: new Date().toISOString(),
              details: {
                system,
                confidence: result.confidence,
                security_level: result.securityLevel
              }
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error performing security analysis:', error);
      throw error;
    }
    
    return updatedAgent;
  }

  /**
   * Check policy compliance
   * 
   * @param agent - Zentix Security agent
   * @param policy - Policy to check
   * @param scope - Scope of check
   * @param requirements - Requirements to verify
   * @returns Updated agent with compliance results
   */
  static async checkPolicyCompliance(
    agent: ZentixSecurityAgent,
    policy: string,
    scope: string,
    requirements: string[]
  ): Promise<ZentixSecurityAgent> {
    const updatedAgent = { ...agent };
    
    try {
      // Check policy compliance using the ZentixAgent
      const result = await agent.agent.checkPolicyCompliance({
        policy,
        scope,
        requirements
      });
      
      // Record the compliance check in the agent's history
      updatedAgent.aix_did = {
        ...updatedAgent.aix_did,
        aix: {
          ...updatedAgent.aix_did.aix,
          security: {
            ...updatedAgent.aix_did.aix.security,
            last_compliance_check: {
              policy,
              scope,
              requirements,
              result: {
                summary: result.summary,
                confidence: result.confidence,
                complianceStatus: result.complianceStatus
              },
              timestamp: new Date().toISOString()
            }
          }
        }
      };
      
      // Record event in DID history
      updatedAgent.aix_did = {
        ...updatedAgent.aix_did,
        did: {
          ...updatedAgent.aix_did.did,
          history: [
            ...updatedAgent.aix_did.did.history,
            {
              event: 'policy_compliance_check_completed',
              timestamp: new Date().toISOString(),
              details: {
                policy,
                confidence: result.confidence,
                compliance_status: result.complianceStatus
              }
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error checking policy compliance:', error);
      throw error;
    }
    
    return updatedAgent;
  }
}