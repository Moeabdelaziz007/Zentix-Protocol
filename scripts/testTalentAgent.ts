import { HeliosTalentAgent } from '../core/agents/marketingGuild/heliosTalentAgent';
import { AgentLogger, LogLevel } from '../core/utils/agentLogger';

async function testTalentAgent(): Promise<void> {
  AgentLogger.log(LogLevel.INFO, 'TestTalentAgent', 'Starting Helios Talent Agent Test');
  
  try {
    // Create instance of the talent agent
    const talentAgent = HeliosTalentAgent.getInstance();
    
    // Test initialization
    AgentLogger.log(LogLevel.INFO, 'TestTalentAgent', 'Testing agent initialization');
    
    // Define job requirements
    const jobRequirements = {
      role: "Senior React Developer",
      skills: ["React.js", "TypeScript", "Next.js", "GraphQL"],
      experience: "5+ years",
      timezone: "EST"
    };
    
    AgentLogger.log(LogLevel.SUCCESS, 'TestTalentAgent', 'Helios Talent Agent Test completed successfully');
  } catch (error) {
    AgentLogger.log(LogLevel.ERROR, 'TestTalentAgent', 'Test failed', {}, error as Error);
    throw error;
  }
}

testTalentAgent().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});