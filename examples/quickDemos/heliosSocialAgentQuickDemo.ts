/**
 * Quick Demo for Helios Social Agent
 * Part of the Marketing Guild
 * 
 * This demo showcases the core capabilities of the Helios Social Agent
 * including campaign creation, post generation, and audience analysis.
 */

import { HeliosSocialAgent } from '../../core/agents/marketingGuild/heliosSocialAgent';

async function runHeliosDemo() {
  console.log('🚀 Starting Helios Social Agent Quick Demo');
  console.log('==========================================\n');

  try {
    // Get the singleton instance of the Helios Social Agent
    const heliosAgent = HeliosSocialAgent.getInstance();
    
    console.log('✅ Helios Social Agent initialized successfully\n');
    
    // Show supported platforms
    const platforms = heliosAgent.getPlatforms();
    console.log('📱 Supported Social Platforms:');
    platforms.forEach(platform => {
      console.log(`   • ${platform.name} (${platform.id}) - ${platform.icon}`);
    });
    console.log('');
    
    // Create a sample campaign
    console.log('📋 Creating a sample social media campaign...');
    const campaign = await heliosAgent.createCampaign({
      name: 'Zentix Protocol Launch',
      objective: 'awareness',
      platforms: ['twitter', 'linkedin'],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      budget: 1000
    });
    
    console.log(`✅ Campaign created: ${campaign.name} (ID: ${campaign.id})\n`);
    
    // Generate sample posts
    console.log('📝 Generating sample social media posts...');
    const topics = ['Zentix Protocol', 'AI Agents', 'Blockchain Innovation'];
    const posts = await heliosAgent.generatePosts(campaign.id, topics, 3);
    
    console.log(`✅ Generated ${posts.length} posts:\n`);
    posts.forEach((post, index) => {
      console.log(`   Post ${index + 1}:`);
      console.log(`     Platform: ${post.platform}`);
      console.log(`     Content: ${post.content.substring(0, 100)}...`);
      console.log(`     Hashtags: ${post.hashtags.join(', ')}\n`);
    });
    
    // Schedule posts
    console.log('⏰ Scheduling posts for optimal timing...');
    const scheduledPosts = await heliosAgent.schedulePosts(posts);
    console.log(`✅ Scheduled ${scheduledPosts.length} posts\n`);
    
    // Analyze audience
    console.log('👥 Analyzing audience insights for Twitter...');
    const audienceInsights = await heliosAgent.analyzeAudience('twitter');
    console.log('✅ Audience analysis complete:');
    console.log(`   Age demographics: ${JSON.stringify(audienceInsights.demographics.age)}`);
    console.log(`   Top interests: ${audienceInsights.interests.slice(0, 3).join(', ')}\n`);
    
    // Monitor engagement
    console.log('🔍 Monitoring social engagement...');
    const engagement = await heliosAgent.monitorEngagement();
    console.log(`✅ Found ${engagement.mentions.length} mentions, ${engagement.comments.length} comments, and ${engagement.messages.length} messages\n`);
    
    // Track campaign performance
    console.log('📊 Tracking campaign performance...');
    const performance = await heliosAgent.trackCampaignPerformance(campaign.id);
    console.log('✅ Campaign performance metrics:');
    console.log(`   Reach: ${performance.reach}`);
    console.log(`   Engagement: ${performance.engagement}`);
    console.log(`   ROI: ${performance.roi}\n`);
    
    console.log('🎉 Helios Social Agent Quick Demo completed successfully!');
    console.log('   The agent demonstrated:');
    console.log('   • Campaign creation and management');
    console.log('   • Automated post generation');
    console.log('   • Optimal scheduling');
    console.log('   • Audience analysis');
    console.log('   • Engagement monitoring');
    console.log('   • Performance tracking');
    
  } catch (error) {
    console.error('❌ Error in Helios Social Agent demo:', error);
    process.exit(1);
  }
}

// Run the demo
runHeliosDemo().catch(console.error);