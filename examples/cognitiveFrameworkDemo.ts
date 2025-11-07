/**
 * Zentix Cognitive Framework Demo
 * Demonstrates the AIx format and Quantum Topology skill integration
 * 
 * @module cognitiveFrameworkDemo
 * @version 1.0.0
 */

import { AIXManifestParser } from '../core/aix/aixManifestParser';
import { QuantumTopologySkill } from '../core/skills/core/quantumTopologySkill';
import { AffiliateDealEvaluationSkill } from '../core/skills/glamify/affiliateDealEvaluationSkill';
import { ScribeAgent } from '../core/agents/auxiliary/scribeAgent';
import { ScoutAgent } from '../core/agents/auxiliary/scoutAgent';
import { AgentLogger, LogLevel } from '../core/utils/agentLogger';
import * as fs from 'fs';
import * as path from 'path';

async function runCognitiveFrameworkDemo() {
  console.log('🚀 Zentix Cognitive Framework Demo');
  console.log('==================================\n');
  
  try {
    // 1. Create a sample team.aix.yaml file
    console.log('1. Creating sample team.aix.yaml file');
    console.log('-------------------------------------');
    
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
      ]
    };
    
    // Write the sample manifest to a file
    const manifestPath = path.join(__dirname, 'glamify-ai.aix.yaml');
    fs.writeFileSync(manifestPath, JSON.stringify(sampleManifest, null, 2));
    console.log('✅ Sample team.aix.yaml created\n');
    
    // 2. Parse the AIX manifest
    console.log('2. Parsing AIX manifest');
    console.log('----------------------');
    
    const teamConfig = await AIXManifestParser.parseManifest(manifestPath);
    console.log(`✅ Parsed manifest for app: ${teamConfig.appName}`);
    console.log(`📋 Team has ${teamConfig.team.length} members\n`);
    
    // 3. Demonstrate Quantum Topology Skill
    console.log('3. Demonstrating Quantum Topology Skill');
    console.log('---------------------------------------');
    
    const taskDescription = "Recommend the top 3 lipsticks for a user with an 'Oily' skin type and a 'Glam' style preference.";
    const context = {
      userProfile: {
        skinType: "Oily",
        stylePreference: "Glam",
        budget: "mid"
      }
    };
    const persona = teamConfig.persona;
    
    const quantumResult = await QuantumTopologySkill.execute(taskDescription, context, persona);
    console.log('✅ Quantum Topology Skill executed successfully\n');
    
    // 4. Demonstrate Affiliate Deal Evaluation Skill
    console.log('4. Demonstrating Affiliate Deal Evaluation Skill');
    console.log('-----------------------------------------------');
    
    const dealData = {
      productName: "Fenty Beauty Pro Filt'r Soft Matte Longwear Foundation",
      commissionRate: 0.08,
      productPrice: 38,
      retailer: "Sephora",
      category: "beauty"
    };
    
    const evaluationResult = await AffiliateDealEvaluationSkill.evaluateDeal(dealData);
    console.log(`✅ Deal evaluation completed. Score: ${evaluationResult.score}/100\n`);
    
    // 5. Demonstrate Scribe Agent
    console.log('5. Demonstrating Scribe Agent');
    console.log('----------------------------');
    
    const scribeAgent = ScribeAgent.getInstance();
    await scribeAgent.initialize();
    
    const logResult = await scribeAgent.logInformation(
      "Found a 9.2/10 match for 'Senior React Developer' on Mercor. Candidate 'Jane Developer' has strong experience with Next.js and GraphQL, which are key success indicators for this role.",
      { 
        agent: "HeliosTalentAgent",
        task: "candidate_matching",
        score: 9.2
      },
      {
        jobRole: "Senior React Developer",
        platform: "Mercor"
      }
    );
    
    console.log(`✅ Scribe Agent logged information: ${logResult}\n`);
    
    // 6. Demonstrate Scout Agent
    console.log('6. Demonstrating Scout Agent');
    console.log('---------------------------');
    
    const scoutAgent = ScoutAgent.getInstance();
    await scoutAgent.initialize();
    
    const productContext = {
      category: "lipstick",
      price: 25,
      brand: "Fenty Beauty"
    };
    
    const opportunities = await scoutAgent.huntAffiliateOpportunities(productContext);
    console.log(`✅ Scout Agent found ${opportunities.length} opportunities\n`);
    
    // Clean up the sample manifest file
    fs.unlinkSync(manifestPath);
    
    console.log('🎉 Zentix Cognitive Framework Demo completed successfully!');
    
  } catch (error) {
    AgentLogger.log(LogLevel.ERROR, 'CognitiveFrameworkDemo', 'Demo failed', {}, error as Error);
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runCognitiveFrameworkDemo();