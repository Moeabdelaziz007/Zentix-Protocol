/**
 * AmanAgent (Wasta-Bot) Basic Test
 * 
 * Simple test to verify the AmanAgent can be instantiated and used.
 */

import { AmanAgent } from '../core/agents/civicGuild/amanAgent';
import { AgentLogger, LogLevel } from '../core/utils/agentLogger';

async function runAmanAgentTest(): Promise<void> {
  console.log('Starting AmanAgent test...');
  
  try {
    // Get instance of AmanAgent
    const amanAgent = AmanAgent.getInstance();
    console.log('✓ AmanAgent instance created');
    
    // Test storing credentials
    const result = await amanAgent.storeCredentials('user_123', {
      platform: 'icp',
      username: 'user@example.com',
      password: 'securePassword123'
    });
    console.log('✓ Credentials stored:', result);
    
    // Test creating a service task
    const task = await amanAgent.createServiceTask('icp-passport', 'user_123', {
      passportType: 'renewal',
      fullName: 'Ahmed Mohamed'
    });
    console.log('✓ Service task created:', task.id);
    
    // Test getting supported services
    const services = amanAgent.getSupportedServices();
    console.log('✓ Supported services retrieved:', services.length);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
runAmanAgentTest();