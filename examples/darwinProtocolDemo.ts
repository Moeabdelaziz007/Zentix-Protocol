/**
 * Darwin Protocol Demo
 * Demonstrates the self-evolving agent teams with the Darwin Protocol
 * 
 * @module darwinProtocolDemo
 * @version 1.0.0
 */

import { DarwinProtocol } from '../core/evolution/darwinProtocol';
import { MutationEngine } from '../core/evolution/mutationEngine';
import * as fs from 'fs';
import * as path from 'path';

async function runDarwinProtocolDemo() {
  console.log('🚀 Darwin Protocol Demo');
  console.log('======================\n');
  
  try {
    // 1. Create a sample team.aix.yaml file
    console.log('1. Creating sample team.aix.json file');
    console.log('------------------------------------');
    
    const sampleManifest = {
      version: "1.0",
      appName: "Glamify AI",
      mission: "To be a personalized AI beauty curator that earns revenue through affiliate marketing.",
      team: [
        {
          agentId: "CuratorAgent",
          role: "Main Agent",
          description: "Manages the core user experience and product recommendations."
        },
        {
          agentId: "ScribeAgent_Glamify",
          role: "Memory",
          description: "Logs user preferences, product performance, and learned style trends."
        },
        {
          agentId: "ScoutAgent_Glamify",
          role: "Money Hunter",
          description: "Proactively finds new affiliate deals, promo codes, and trending products."
        }
      ],
      persona: "A trendy, knowledgeable, and trustworthy beauty advisor.",
      rules: [
        "Always prioritize user's stated preferences and budget.",
        "Only recommend products from pre-approved, reputable affiliate partners.",
        "Never hard-sell; always advise and recommend.",
        "All outputs must pass the 'Quantum Topology' skill check before being shown to the user."
      ],
      tools: [
        "WebScraper (Puppeteer)",
        "AffiliateLinkGenerator",
        "OpenAI_API (for tagging and recommendations)",
        "Pinecone_VectorDB (for the ScribeAgent's memory)"
      ],
      workflows: [
        "playbook_new_user_onboarding.yaml",
        "playbook_visual_search.yaml",
        "playbook_affiliate_opportunity_hunt.yaml"
      ],
      skills: [
        {
          skillId: "QuantumTopology",
          description: "Core reasoning and simulation skill for all major decisions.",
          path: "/skills/core/quantum_topology.skill.ts"
        },
        {
          skillId: "PersonalizedRecommendation",
          description: "Skill for matching products to a user's Beauty Profile.",
          path: "/skills/glamify/recommendation.skill.ts"
        },
        {
          skillId: "AffiliateDealEvaluation",
          description: "Skill for the ScoutAgent to evaluate the profitability of a deal.",
          path: "/skills/glamify/deal_evaluation.skill.ts"
        }
      ],
      evolution: {
        generation: 0,
        fitness_metric: "AffiliateRevenue - ApiCosts",
        last_fitness_score: 1000.00,
        mutation_history: []
      }
    };
    
    // Write the sample manifest to a file
    const manifestPath = path.join(__dirname, 'glamify-ai.aix.json');
    fs.writeFileSync(manifestPath, JSON.stringify(sampleManifest, null, 2));
    console.log('✅ Sample team.aix.json created\n');
    
    // 2. Initialize the Darwin Protocol
    console.log('2. Initializing Darwin Protocol');
    console.log('------------------------------');
    
    const darwinProtocol = DarwinProtocol.getInstance();
    await darwinProtocol.initialize();
    console.log('✅ Darwin Protocol initialized\n');
    
    // 3. Demonstrate the enhanced Mutation Engine
    console.log('3. Demonstrating enhanced Mutation Engine');
    console.log('----------------------------------------');
    
    const mutationEngine = MutationEngine.getInstance();
    const mutations = mutationEngine.generateMutations(sampleManifest, 5);
    
    console.log(`✅ Generated ${mutations.length} sophisticated mutations:`);
    mutations.forEach((mutation, index) => {
      console.log(`  ${index + 1}. ${mutation.type}: ${mutation.description}`);
    });
    console.log();
    
    // 4. Apply one mutation to show how it works
    console.log('4. Applying a mutation to demonstrate the process');
    console.log('----------------------------------------------');
    
    const mutatedTeam = mutationEngine.applyMutation(sampleManifest, mutations[0]);
    console.log(`✅ Applied mutation: ${mutations[0].type}`);
    console.log(`📝 Description: ${mutations[0].description}`);
    console.log(`🔄 Generation: ${mutatedTeam.evolution?.generation}`);
    console.log();
    
    // 5. Run an evolution experiment with A/B testing
    console.log('5. Running evolution experiment with A/B testing');
    console.log('---------------------------------------------');
    
    const experimentResults = await darwinProtocol.runEvolutionExperiment(
      manifestPath,
      3, // 3 variants
      1  // 1 hour experiment (for demo)
    );
    
    console.log(`✅ Experiment completed with ${experimentResults.variants.length} variants`);
    
    // 6. Show experiment results
    console.log('6. Experiment results');
    console.log('--------------------');
    
    experimentResults.variants.forEach((variant, index) => {
      console.log(`  Variant ${variant.id} (${variant.trafficSplit}% traffic): Fitness Score = ${variant.fitnessScore?.toFixed(2)}`);
    });
    
    if (experimentResults.winner) {
      console.log(`\n🏆 Winner: Variant ${experimentResults.winner.id} with score ${experimentResults.winner.fitnessScore?.toFixed(2)}`);
      
      // 7. Promote the winner
      console.log('7. Promoting winner');
      console.log('------------------');
      
      const newManifestPath = await darwinProtocol.promoteWinner(manifestPath, experimentResults.winner);
      console.log(`✅ Winner promoted to: ${newManifestPath}`);
    } else {
      console.log('\n⚠️ No significant winner found in this experiment');
    }
    
    // 8. Demonstrate traffic routing
    console.log('8. Demonstrating traffic routing');
    console.log('------------------------------');
    
    const requestRouter = darwinProtocol.getRequestRouter();
    const userIds = ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'];
    
    userIds.forEach(userId => {
      const variantId = requestRouter.routeRequest(userId, experimentResults.experimentId);
      console.log(`  User ${userId} -> Variant ${variantId}`);
    });
    console.log();
    
    // 9. Demonstrate analytics tracking
    console.log('9. Demonstrating analytics tracking');
    console.log('---------------------------------');
    
    const analyticsService = darwinProtocol.getAnalyticsService();
    
    // Simulate tracking some metrics
    analyticsService.trackMetric(experimentResults.experimentId, 'A', 'api_cost', 5.25);
    analyticsService.trackMetric(experimentResults.experimentId, 'A', 'affiliate_revenue', 50.75);
    analyticsService.trackMetric(experimentResults.experimentId, 'B', 'api_cost', 4.80);
    analyticsService.trackMetric(experimentResults.experimentId, 'B', 'affiliate_revenue', 55.30);
    
    // Calculate fitness scores
    const fitnessA = analyticsService.calculateFitnessScore(experimentResults.experimentId, 'A', 'AffiliateRevenue - ApiCosts');
    const fitnessB = analyticsService.calculateFitnessScore(experimentResults.experimentId, 'B', 'AffiliateRevenue - ApiCosts');
    
    console.log(`  Variant A fitness score: ${fitnessA.toFixed(2)}`);
    console.log(`  Variant B fitness score: ${fitnessB.toFixed(2)}`);
    console.log();
    
    // 10. Show experiment history
    console.log('10. Experiment history');
    console.log('---------------------');
    
    const history = darwinProtocol.getExperimentHistory();
    console.log(`📊 Total experiments run: ${history.size}`);
    
    // Clean up the sample manifest file
    fs.unlinkSync(manifestPath);
    
    console.log('\n🎉 Darwin Protocol Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runDarwinProtocolDemo();