import { HeliosTalentAgent } from '../../core/agents/marketingGuild/heliosTalentAgent';
import { AgentLogger, LogLevel } from '../../core/utils/agentLogger';

/**
 * Quick Demo for Helios Talent Hunter Agent
 * 
 * This script demonstrates the core functionality of the Helios Talent Agent
 * for automated talent scouting on the Mercor platform.
 */

async function runTalentAgentDemo(): Promise<void> {
  AgentLogger.log(LogLevel.INFO, 'TalentAgentDemo', 'Starting Helios Talent Agent Demo');
  
  // Create instance of the talent agent
  const talentAgent = HeliosTalentAgent.getInstance();
  
  try {
    // Initialize the browser
    await talentAgent.initialize();
    
    // Define job requirements
    const jobRequirements = {
      role: "Senior React Developer",
      skills: ["React.js", "TypeScript", "Next.js", "GraphQL"],
      experience: "5+ years",
      timezone: "EST",
      additionalCriteria: ["Frontend architecture", "Performance optimization"]
    };
    
    AgentLogger.log(LogLevel.INFO, 'TalentAgentDemo', 'Defined job requirements', jobRequirements);
    
    // Enhance job requirements with AI (simulated)
    const enhancedRequirements = await talentAgent.defineJobRequirements(jobRequirements);
    
    // In a real implementation, we would login to Mercor here:
    // await talentAgent.login('your-email@example.com', 'your-password');
    
    // For demo purposes, we'll simulate the search results
    AgentLogger.log(LogLevel.INFO, 'TalentAgentDemo', 'Simulating talent search...');
    
    // Simulated talent profiles
    const mockProfiles = [
      {
        id: "profile_1",
        name: "Alex Johnson",
        role: "Senior Frontend Developer",
        skills: ["React.js", "TypeScript", "Next.js", "GraphQL", "Redux", "Webpack"],
        experience: "7 years",
        location: "New York, NY",
        timezone: "EST",
        profileUrl: "https://work.mercor.com/profile/alex-johnson",
        status: "pending" as const
      },
      {
        id: "profile_2",
        name: "Sam Chen",
        role: "Frontend Engineer",
        skills: ["React.js", "JavaScript", "CSS", "HTML", "Node.js"],
        experience: "4 years",
        location: "San Francisco, CA",
        timezone: "PST",
        profileUrl: "https://work.mercor.com/profile/sam-chen",
        status: "pending" as const
      },
      {
        id: "profile_3",
        name: "Maria Garcia",
        role: "Full Stack Developer",
        skills: ["React.js", "TypeScript", "Next.js", "GraphQL", "Node.js", "PostgreSQL"],
        experience: "6 years",
        location: "Austin, TX",
        timezone: "CST",
        profileUrl: "https://work.mercor.com/profile/maria-garcia",
        status: "pending" as const
      }
    ];
    
    AgentLogger.log(LogLevel.SUCCESS, 'TalentAgentDemo', 'Simulated talent search completed', { profileCount: mockProfiles.length });
    
    // Evaluate candidates using AI (simulated)
    AgentLogger.log(LogLevel.INFO, 'TalentAgentDemo', 'Evaluating candidates...');
    const evaluations = await talentAgent.evaluateCandidates(mockProfiles, enhancedRequirements);
    
    // Generate talent report
    AgentLogger.log(LogLevel.INFO, 'TalentAgentDemo', 'Generating talent report...');
    const report = await talentAgent.generateTalentReport(evaluations);
    
    // Log the report
    AgentLogger.log(LogLevel.SUCCESS, 'TalentAgentDemo', 'Talent Report Generated', { report });
    
    // Display top candidates
    AgentLogger.log(LogLevel.INFO, 'TalentAgentDemo', 'Top Candidates:');
    evaluations.slice(0, 3).forEach((evaluation, index) => {
      AgentLogger.log(LogLevel.INFO, 'TalentAgentDemo', `#${index + 1}: ${evaluation.profile.name} (Score: ${evaluation.fitScore.toFixed(1)})`);
    });
    
    AgentLogger.log(LogLevel.SUCCESS, 'TalentAgentDemo', 'Helios Talent Agent Demo completed successfully');
  } catch (error) {
    AgentLogger.log(LogLevel.ERROR, 'TalentAgentDemo', 'Demo failed', {}, error as Error);
    throw error;
  } finally {
    // Cleanup resources
    await talentAgent.close();
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTalentAgentDemo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

export { runTalentAgentDemo };