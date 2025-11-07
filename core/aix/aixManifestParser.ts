/**
 * AIX Manifest Parser
 * Parses team.aix.yaml files to configure agent teams
 * 
 * @module aixManifestParser
 * @version 1.0.0
 */

import { AIXTeam, parseAIXTeam } from './aixSchema';
import { AgentLogger, LogLevel } from '../utils/agentLogger';
import fs from 'fs';
import yaml from 'js-yaml';

/**
 * AIX Manifest Parser
 * Responsible for parsing team.aix.yaml files and configuring agent teams
 */
export class AIXManifestParser {
  /**
   * Parse an AIX manifest file
   * 
   * @param manifestPath - Path to the team.aix.yaml file
   * @returns Parsed AIX team configuration
   */
  static async parseManifest(manifestPath: string): Promise<AIXTeam> {
    try {
      AgentLogger.log(LogLevel.INFO, 'AIXManifestParser', 'Parsing AIX manifest', { manifestPath });
      
      // Read the YAML file
      const yamlContent = fs.readFileSync(manifestPath, 'utf8');
      
      // Parse YAML content
      const rawData = yaml.load(yamlContent);
      
      // Validate and parse using Zod schema
      const teamConfig = parseAIXTeam(rawData);
      
      AgentLogger.log(LogLevel.SUCCESS, 'AIXManifestParser', 'AIX manifest parsed successfully', { 
        appName: teamConfig.appName,
        agentCount: teamConfig.team.length 
      });
      
      return teamConfig;
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'AIXManifestParser', 'Failed to parse AIX manifest', { manifestPath }, error as Error);
      throw error;
    }
  }
  
  /**
   * Validate an AIX manifest file
   * 
   * @param manifestPath - Path to the team.aix.yaml file
   * @returns Whether the manifest is valid
   */
  static async validateManifest(manifestPath: string): Promise<boolean> {
    try {
      await this.parseManifest(manifestPath);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get agent configuration by role from manifest
   * 
   * @param manifest - Parsed AIX team configuration
   * @param role - Role to search for
   * @returns Agent configuration or null if not found
   */
  static getAgentByRole(manifest: AIXTeam, role: string): AIXTeam['team'][0] | null {
    const agent = manifest.team.find(agent => agent.role === role);
    return agent || null;
  }
}