import { AetherOrchestrator } from './aetherOrchestrator';
import { YouTubeAgent } from './youtubeAgent';
import { TelegramAgent } from './telegramAgent';
import { MusicAgent } from './musicAgent';
import { initializeAetherDatabase } from './aetherSchema';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

/**
 * Aether Network Demo
 * 
 * This file demonstrates how the Aether Content & Revenue Network components work together
 * to create an automated content generation and distribution system.
 */

async function runAetherDemo(): Promise<void> {
  AgentLogger.log(LogLevel.INFO, 'AetherDemo', 'Starting Aether Network Demo');
  
  try {
    // Initialize the Aether database
    await initializeAetherDatabase();
    AgentLogger.log(LogLevel.SUCCESS, 'AetherDemo', 'Aether database initialized');
    
    // Get instances of all agents
    const orchestrator = AetherOrchestrator.getInstance();
    const youtubeAgent = YouTubeAgent.getInstance();
    const telegramAgent = TelegramAgent.getInstance();
    const musicAgent = MusicAgent.getInstance();
    
    // Initialize all components
    await orchestrator.initialize();
    await youtubeAgent.initialize();
    await telegramAgent.initialize();
    await musicAgent.initialize();
    
    AgentLogger.log(LogLevel.SUCCESS, 'AetherDemo', 'All Aether agents initialized');
    
    // Analyze trends to determine what content to create
    const trends = await orchestrator.analyzeTrends();
    AgentLogger.log(LogLevel.INFO, 'AetherDemo', 'Analyzed trends', { trendCount: trends.length });
    
    // Delegate tasks based on trends
    for (const trend of trends.slice(0, 2)) { // Process first 2 trends for demo
      await orchestrator.delegateTask(trend.topic, trend.style);
    }
    
    // Process pending tasks
    await orchestrator.processPendingTasks();
    
    // Demonstrate music agent capabilities
    AgentLogger.log(LogLevel.INFO, 'AetherDemo', 'Demonstrating music agent capabilities');
    
    // Generate background music for YouTube videos
    const backgroundMusic = await musicAgent.generateMusic('lo-fi', 180, 'study-beats');
    
    // Provide music for a specific video
    await musicAgent.provideMusicForVideo('video_123', 'electronic');
    
    // Create an album
    const albumTracks = await musicAgent.createAlbum('ambient', 5, 'Study Focus');
    
    // Distribute music to streaming platforms
    await musicAgent.distributeMusic('track_456.mp3', 'Focus Track', 'A calming study track');
    
    // Demonstrate Telegram agent capabilities
    AgentLogger.log(LogLevel.INFO, 'AetherDemo', 'Demonstrating Telegram agent capabilities');
    
    // Start the Telegram bot (in a real implementation)
    // telegramAgent.startBot();
    
    // Announce a new video
    await telegramAgent.announceNewVideo(
      'Top 5 AI Tools for Developers', 
      'https://youtube.com/watch?v=abc123', 
      '@aether_channel'
    );
    
    // Run a poll
    await telegramAgent.runPoll(
      '@aether_group', 
      'What type of content would you like to see next?', 
      ['AI Tutorials', 'Music Production', 'Web3 Explained', 'Productivity Tips']
    );
    
    // Share behind-the-scenes content
    await telegramAgent.shareBehindTheScenes(
      'Here\'s a sneak peek of our video editing process!',
      'https://example.com/image.jpg',
      '@aether_group'
    );
    
    // Get network analytics
    const analytics = await orchestrator.getNetworkAnalytics();
    AgentLogger.log(LogLevel.INFO, 'AetherDemo', 'Network analytics', analytics);
    
    AgentLogger.log(LogLevel.SUCCESS, 'AetherDemo', 'Aether Network Demo completed successfully');
    
  } catch (error) {
    AgentLogger.log(LogLevel.ERROR, 'AetherDemo', 'Aether Network Demo failed', {}, error as Error);
    throw error;
  }
}

// Export the function for use in other modules
export { runAetherDemo };

// Run the demo if this module is the main entry point
// Note: In ES modules, we check if this module is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  runAetherDemo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}