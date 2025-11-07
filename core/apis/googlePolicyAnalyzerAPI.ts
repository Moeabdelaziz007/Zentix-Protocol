/**
 * Google Policy Analyzer API Integration
 * Analyze IAM policies for security and compliance in ZentixOS
 * 
 * @module googlePolicyAnalyzerAPI
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger } from '../utils/agentLogger';
import { getOAuthConnection, storeOAuthConnection } from './appletService';

// Load environment variables
dotenv.config();

/**
 * Google Policy Analyzer API Integration
 * Enables analysis of IAM policies for security and compliance
 */
export class GooglePolicyAnalyzerAPI {
  private static readonly BASE_URL = 'https://policyanalyzer.googleapis.com/v1';
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/cloud-platform'
  ];

  /**
   * Analyze IAM policy access patterns
   * @param userId - ZentixOS user ID
   * @param project - Google Cloud project ID
   * @param query - Query to analyze (e.g., "who has what access")
   */
  static async analyzeIamPolicy(
    userId: string,
    project: string,
    query: string
  ): Promise<{
    activity: Array<{
      activity: string;
      activityTime: string;
      resource: string;
      resourceType: string;
      principal: string;
      role: string;
    }>;
    analysisQuery: any;
  }> {
    return AgentLogger.measurePerformance(
      'GooglePolicyAnalyzerAPI',
      'analyzeIamPolicy',
      async () => {
        try {
          // Get OAuth connection for this user
          const oauthConnection = await getOAuthConnection(userId, 'google-policy-analyzer');
          if (!oauthConnection) {
            throw new Error('No Google OAuth connection found for user');
          }

          // Prepare request parameters
          const params: Record<string, string> = {
            'analysisQuery.accessSelector.role': query.includes('role') ? query.split('role')[1].trim() : '',
            'analysisQuery.accessSelector.permission': query.includes('permission') ? query.split('permission')[1].trim() : '',
            'analysisQuery.resourceSelector.fullResourceName': `//cloudresourcemanager.googleapis.com/projects/${project}`
          };

          // Remove empty parameters
          Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
          });

          // Make API request
          const response = await axios.get(`${this.BASE_URL}/projects/${project}/locations/global/activityTypes/gcpResourcePolicyChange/activities:query`, {
            params,
            headers: {
              'Authorization': `Bearer ${oauthConnection.accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.data) {
            throw new Error('Invalid response from Google Policy Analyzer API');
          }

          return {
            activity: response.data.activities || [],
            analysisQuery: response.data.analysisQuery || {}
          };
        } catch (error: any) {
          console.error('Google Policy Analyzer API error:', error.response?.data || error.message);
          throw new Error(`Google Policy Analyzer API error: ${error.message}`);
        }
      },
      { userId, project, query }
    );
  }

  /**
   * Get last access information for a resource
   * @param userId - ZentixOS user ID
   * @param project - Google Cloud project ID
   * @param fullResourceName - Full resource name (e.g., "//storage.googleapis.com/my-bucket")
   */
  static async getLastAccess(
    userId: string,
    project: string,
    fullResourceName: string
  ): Promise<Array<{
    principal: string;
    role: string;
    lastAccessTime: string;
    accessCount: number;
  }>> {
    return AgentLogger.measurePerformance(
      'GooglePolicyAnalyzerAPI',
      'getLastAccess',
      async () => {
        try {
          // Get OAuth connection for this user
          const oauthConnection = await getOAuthConnection(userId, 'google-policy-analyzer');
          if (!oauthConnection) {
            throw new Error('No Google OAuth connection found for user');
          }

          // Make API request
          const response = await axios.get(`${this.BASE_URL}/projects/${project}/locations/global/activityTypes/gcpResourceLastAccess/activities:query`, {
            params: {
              'analysisQuery.resourceSelector.fullResourceName': fullResourceName
            },
            headers: {
              'Authorization': `Bearer ${oauthConnection.accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.data) {
            throw new Error('Invalid response from Google Policy Analyzer API');
          }

          // Transform the response to our expected format
          return response.data.activities?.map((activity: any) => ({
            principal: activity.principal || '',
            role: activity.role || '',
            lastAccessTime: activity.activityTime || '',
            accessCount: activity.accessCount || 0
          })) || [];
        } catch (error: any) {
          console.error('Google Policy Analyzer API last access error:', error.response?.data || error.message);
          throw new Error(`Google Policy Analyzer API last access error: ${error.message}`);
        }
      },
      { userId, project, fullResourceName }
    );
  }

  /**
   * Check for risky permissions in IAM policies
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
    justification: string;
  }>> {
    return AgentLogger.measurePerformance(
      'GooglePolicyAnalyzerAPI',
      'checkRiskyPermissions',
      async () => {
        try {
          // Get OAuth connection for this user
          const oauthConnection = await getOAuthConnection(userId, 'google-policy-analyzer');
          if (!oauthConnection) {
            throw new Error('No Google OAuth connection found for user');
          }

          // This is a mock implementation since the actual API doesn't have a direct
          // "risky permissions" endpoint. In a real implementation, we would analyze
          // the results of policy analysis for known risky patterns.
          
          // For now, we'll return mock data to demonstrate the concept
          return [
            {
              principal: 'user:johndoe@example.com',
              role: 'roles/editor',
              riskyPermission: 'storage.buckets.delete',
              resource: '//storage.googleapis.com/my-sensitive-bucket',
              justification: 'User has delete permissions on sensitive storage bucket'
            },
            {
              principal: 'serviceAccount:my-app@appspot.gserviceaccount.com',
              role: 'roles/owner',
              riskyPermission: '*',
              resource: '//cloudresourcemanager.googleapis.com/projects/my-project',
              justification: 'Service account has owner access to entire project'
            }
          ];
        } catch (error: any) {
          console.error('Google Policy Analyzer API risky permissions error:', error.response?.data || error.message);
          throw new Error(`Google Policy Analyzer API risky permissions error: ${error.message}`);
        }
      },
      { userId, project }
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
  }>> {
    return AgentLogger.measurePerformance(
      'GooglePolicyAnalyzerAPI',
      'analyzePolicyChanges',
      async () => {
        try {
          // Get OAuth connection for this user
          const oauthConnection = await getOAuthConnection(userId, 'google-policy-analyzer');
          if (!oauthConnection) {
            throw new Error('No Google OAuth connection found for user');
          }

          // Calculate the start time
          const startTime = new Date();
          startTime.setDate(startTime.getDate() - days);
          
          // Make API request
          const response = await axios.get(`${this.BASE_URL}/projects/${project}/locations/global/activityTypes/gcpResourcePolicyChange/activities:query`, {
            params: {
              'analysisQuery.interval.startTime': startTime.toISOString()
            },
            headers: {
              'Authorization': `Bearer ${oauthConnection.accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.data) {
            throw new Error('Invalid response from Google Policy Analyzer API');
          }

          // Transform the response to our expected format
          return response.data.activities?.map((activity: any) => ({
            changeType: activity.activity || '',
            principal: activity.principal || '',
            role: activity.role || '',
            resource: activity.resource || '',
            timestamp: activity.activityTime || '',
            changer: activity.changer || ''
          })) || [];
        } catch (error: any) {
          console.error('Google Policy Analyzer API policy changes error:', error.response?.data || error.message);
          throw new Error(`Google Policy Analyzer API policy changes error: ${error.message}`);
        }
      },
      { userId, project, days }
    );
  }

  /**
   * Mock function to simulate OAuth flow completion for Google Policy Analyzer API
   * @param userId - ZentixOS user ID
   * @param authCode - Authorization code from OAuth flow
   */
  static async completeOAuthFlow(
    userId: string,
    authCode: string
  ): Promise<{ success: boolean; message: string }> {
    // In a real implementation, this would exchange the auth code for access tokens
    // and store the connection information
    
    // For demo purposes, we'll just simulate a successful OAuth flow
    const accessToken = `mock_google_policy_analyzer_access_token_${userId}_${Date.now()}`;
    const refreshToken = `mock_google_policy_analyzer_refresh_token_${userId}_${Date.now()}`;
    
    await storeOAuthConnection(userId, 'google-policy-analyzer', accessToken, refreshToken);
    
    return {
      success: true,
      message: 'Successfully connected to Google Policy Analyzer API'
    };
  }
}