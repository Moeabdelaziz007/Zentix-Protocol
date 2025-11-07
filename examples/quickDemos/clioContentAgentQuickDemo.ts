/**
 * Quick Demo for Clio Content Agent
 * Part of the Marketing Guild
 * 
 * This demo showcases the core capabilities of the Clio Content Agent
 * including content research, outline creation, and draft generation.
 */

import { ClioContentAgent } from '../../core/agents/marketingGuild/clioContentAgent';

async function runClioDemo() {
  console.log('🚀 Starting Clio Content Agent Quick Demo');
  console.log('========================================\n');

  try {
    // Get the singleton instance of the Clio Content Agent
    const clioAgent = ClioContentAgent.getInstance();
    
    console.log('✅ Clio Content Agent initialized successfully\n');
    
    // Show available templates
    console.log('📋 Available Content Templates:');
    const templates = clioAgent.getTemplates();
    templates.forEach(template => {
      console.log(`   • ${template.name} (${template.type}) - ${template.tone} tone`);
    });
    console.log('');
    
    // Generate content
    console.log('✍️ Generating content: "AI-Powered Content Creation"');
    const contentRequest = {
      topic: 'AI-Powered Content Creation',
      format: 'blog' as const,
      tone: 'professional' as const,
      length: 'long' as const,
      targetAudience: 'Content Creators',
      keyPoints: [
        'Automated content generation saves time',
        'AI ensures consistency in brand voice',
        'Personalization at scale becomes possible'
      ],
      callToAction: 'Start using AI tools in your content workflow today!'
    };
    
    const generatedContent = await clioAgent.generateContent(contentRequest);
    
    console.log('✅ Content generated successfully:');
    console.log(`   Title: ${generatedContent.title}`);
    console.log(`   Word Count: ${generatedContent.metadata.wordCount}`);
    console.log(`   Reading Time: ${generatedContent.metadata.estimatedReadingTime} minutes`);
    console.log('');
    
    // Personalize content
    console.log('👤 Personalizing content for developers...');
    const personalizedContent = await clioAgent.personalizeContent(generatedContent.body, 'developers');
    
    console.log('✅ Content personalized successfully');
    console.log('');
    
    // A/B test content
    console.log('🧪 Running A/B test on content variations...');
    const variations = [
      generatedContent.body,
      personalizedContent
    ];
    
    const testResults = await clioAgent.abTestContent(variations);
    
    console.log('✅ A/B test completed:');
    console.log(`   Winning variation: ${testResults.winner.substring(0, 50)}...`);
    console.log(`   Engagement Rate: ${(testResults.metrics.engagementRate * 100).toFixed(1)}%`);
    console.log(`   Conversion Rate: ${(testResults.metrics.conversionRate * 100).toFixed(1)}%`);
    console.log('');
    
    // Schedule content
    console.log('📅 Scheduling content for publication...');
    const scheduleResult = await clioAgent.scheduleContent(
      generatedContent, 
      'blog', 
      new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
    );
    
    console.log('✅ Content scheduled successfully:');
    console.log(`   Scheduled: ${scheduleResult.scheduled}`);
    console.log(`   Post ID: ${scheduleResult.postId}`);
    
    console.log('\n🎉 Clio Content Agent demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in Clio Content Agent demo:', error);
  }
}

// Run the demo
runClioDemo();