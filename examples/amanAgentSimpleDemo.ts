/**
 * AmanAgent (Wasta-Bot) Simple Demo
 * 
 * This script demonstrates how the AmanAgent can automate government services
 * for users in the Middle East without actually launching a browser.
 */

import { AmanAgent } from '../core/agents/civicGuild/amanAgent';
import { AgentLogger, LogLevel } from '../core/utils/agentLogger';

// Mock the puppeteer functionality to avoid launching a real browser
// This is just for demonstration purposes
const originalInitialize = AmanAgent.prototype.initialize;
AmanAgent.prototype.initialize = async function() {
  // Don't actually launch the browser, just log that we would
  AgentLogger.log(LogLevel.INFO, 'AmanAgent', 'Browser initialization skipped for demo purposes');
  this['initialized'] = true;
  return Promise.resolve();
};

async function runAmanAgentSimpleDemo(): Promise<void> {
  AgentLogger.log(LogLevel.INFO, 'AmanAgentSimpleDemo', 'Starting AmanAgent (Wasta-Bot) Simple Demo');

  try {
    // Get instance of AmanAgent
    const amanAgent = AmanAgent.getInstance();

    // Initialize the agent (mocked)
    await amanAgent.initialize();
    AgentLogger.log(LogLevel.SUCCESS, 'AmanAgentSimpleDemo', 'AmanAgent initialized (mocked)');

    // Store user credentials for a government platform
    await amanAgent.storeCredentials('user_123', {
      platform: 'icp',
      username: 'user@example.com',
      password: 'securePassword123'
    });

    AgentLogger.log(LogLevel.INFO, 'AmanAgentSimpleDemo', 'Stored user credentials for ICP platform');

    // Create a service task for passport renewal
    const passportTask = await amanAgent.createServiceTask('icp-passport', 'user_123', {
      passportType: 'renewal',
      fullName: 'Ahmed Mohamed',
      nationality: 'Emirati',
      currentPassportNumber: 'P12345678',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      placeOfBirth: 'Dubai',
      fatherName: 'Mohamed Ali',
      motherName: 'Fatima Hassan'
    });

    AgentLogger.log(LogLevel.INFO, 'AmanAgentSimpleDemo', 'Created passport renewal task', { taskId: passportTask.id });

    // Process the service task (mocked result)
    const processedTask = await amanAgent.processServiceTask(passportTask.id);
    
    if (processedTask.result?.success) {
      AgentLogger.log(LogLevel.SUCCESS, 'AmanAgentSimpleDemo', 'Passport renewal task completed successfully', {
        referenceNumber: processedTask.result.referenceNumber,
        nextSteps: processedTask.result.nextSteps
      });
    } else {
      AgentLogger.log(LogLevel.ERROR, 'AmanAgentSimpleDemo', 'Passport renewal task failed', {
        errorMessage: processedTask.result?.message
      });
    }

    // Get user's service statuses
    const serviceStatuses = await amanAgent.getUserServiceStatuses('user_123');
    AgentLogger.log(LogLevel.INFO, 'AmanAgentSimpleDemo', 'Retrieved user service statuses', { count: serviceStatuses.length });

    // Check if any services are expiring soon
    const expiringServices = serviceStatuses.filter(status => status.status === 'expiring-soon');
    if (expiringServices.length > 0) {
      AgentLogger.log(LogLevel.WARN, 'AmanAgentSimpleDemo', 'Found expiring services', { count: expiringServices.length });
      
      // Send notification to user
      await amanAgent.sendNotification('user_123', 
        'You have services expiring soon. Please renew them to avoid any disruptions.');
    }

    // Demonstrate supported services
    const supportedServices = amanAgent.getSupportedServices();
    AgentLogger.log(LogLevel.INFO, 'AmanAgentSimpleDemo', 'Supported government services', { 
      count: supportedServices.length,
      services: supportedServices.map(s => s.name)
    });

    AgentLogger.log(LogLevel.SUCCESS, 'AmanAgentSimpleDemo', 'AmanAgent (Wasta-Bot) Simple Demo completed successfully');
  } catch (error) {
    AgentLogger.log(LogLevel.ERROR, 'AmanAgentSimpleDemo', 'AmanAgent Demo failed', {}, error as Error);
    throw error;
  }
}

// Run the demo if this module is the main entry point
if (typeof require !== 'undefined' && require.main === module) {
  runAmanAgentSimpleDemo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

// Export the function for use in other modules
export { runAmanAgentSimpleDemo };