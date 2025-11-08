/**
 * Quant-Finance AIZ Test Suite
 * Tests all agents in the Quant-Finance Attention Harvester AIZ team
 */

import { expect } from "chai";
import { QuantFinanceAIZ } from "./core/agents/marketingGuild/QuantFinanceAIZ";
import { QuantFinancePlannerAgent } from "./core/agents/marketingGuild/QuantFinancePlannerAgent";
import { QuantFinanceRiskAgent } from "./core/agents/marketingGuild/QuantFinanceRiskAgent";
import { QuantFinanceExecutionAgent } from "./core/agents/marketingGuild/QuantFinanceExecutionAgent";

describe("Quant-Finance AIZ", function () {
  let quantFinanceAIZ: QuantFinanceAIZ;
  let plannerAgent: QuantFinancePlannerAgent;
  let riskAgent: QuantFinanceRiskAgent;
  let executionAgent: QuantFinanceExecutionAgent;

  beforeEach(function () {
    quantFinanceAIZ = QuantFinanceAIZ.getInstance();
    plannerAgent = QuantFinancePlannerAgent.getInstance();
    riskAgent = QuantFinanceRiskAgent.getInstance();
    executionAgent = QuantFinanceExecutionAgent.getInstance();
  });

  describe("QuantFinancePlannerAgent", function () {
    it("Should research quant finance content opportunities", async function () {
      const ideas = await plannerAgent.researchContentOpportunities();
      expect(ideas).to.be.an("array");
      expect(ideas.length).to.be.greaterThan(0);
      
      // Check that ideas have the expected structure
      const firstIdea = ideas[0];
      expect(firstIdea).to.have.property("id");
      expect(firstIdea).to.have.property("topic");
      expect(firstIdea).to.have.property("format");
      expect(firstIdea).to.have.property("targetArchetype");
      expect(firstIdea).to.have.property("priority");
      expect(firstIdea).to.have.property("expectedAlpha");
    });

    it("Should create a quant finance content plan", async function () {
      const plan = await plannerAgent.createContentPlan(14);
      expect(plan).to.have.property("period");
      expect(plan).to.have.property("contentItems");
      expect(plan.contentItems).to.be.an("array");
      expect(plan.contentItems.length).to.be.greaterThan(0);
    });
  });

  describe("QuantFinanceRiskAgent", function () {
    it("Should assess quant finance content risks", async function () {
      const content = `
        This quantitative analysis is for educational purposes only.
        Past performance does not guarantee future results.
        Analysis of cross-chain arbitrage opportunities.
      `;
      
      const assessment = await riskAgent.assessContentRisks("content_001", content, ["DefiLlama", "CoinGecko"]);
      expect(assessment).to.have.property("id");
      expect(assessment).to.have.property("contentId");
      expect(assessment).to.have.property("risks");
      expect(assessment).to.have.property("overallRiskLevel");
      expect(assessment).to.have.property("recommendations");
    });

    it("Should identify high-risk quant content", async function () {
      const riskyContent = `
        This strategy will guarantee 50% returns.
        Risk-free investment opportunity.
        Buy now before price goes up.
      `;
      
      const assessment = await riskAgent.assessContentRisks("content_002", riskyContent, []);
      expect(assessment.overallRiskLevel).to.be.oneOf(["medium", "high"]);
      expect(assessment.risks.length).to.be.greaterThan(0);
    });

    it("Should approve low-risk quant content", async function () {
      const safeContent = `
        # Quant Insights: Cross-Chain Arbitrage Analysis
        
        Analysis of recent arbitrage opportunities across chains:
        
        1. Statistical analysis of price differentials
        2. Risk-adjusted return calculations
        3. Transaction cost considerations
        
        *Disclaimer: This research is for educational purposes only.*
      `;
      
      const assessment = await riskAgent.assessContentRisks("content_003", safeContent, ["Chainlink", "DefiPulse"]);
      const isApproved = await riskAgent.approveContent("content_003");
      expect(isApproved).to.be.true;
    });
  });

  describe("QuantFinanceExecutionAgent", function () {
    it("Should create quant finance content", async function () {
      const contentData = {
        title: "DeFi Yield Farming Strategy Analysis",
        body: "Analysis of optimal yield farming strategies in DeFi protocols...",
        format: "analysis_report" as const,
        targetPlatform: "substack" as const,
        targetArchetype: "yield_farmer" as const,
        hashtags: ["#defi", "#yieldfarming"],
        dataVisualizations: ["https://charts.example.com/yield1.png"]
      };
      
      const content = await executionAgent.createContent(contentData);
      expect(content).to.have.property("id");
      expect(content.title).to.equal("DeFi Yield Farming Strategy Analysis");
      expect(content.format).to.equal("analysis_report");
      expect(content.status).to.equal("draft");
    });

    it("Should schedule quant content", async function () {
      // First create content
      const contentData = {
        title: "Market Microstructure Analysis",
        body: "Detailed analysis of market microstructure patterns...",
        format: "research_note" as const,
        targetPlatform: "twitter" as const,
        targetArchetype: "quant_trader" as const,
        hashtags: ["#quant", "#trading"]
      };
      
      const content = await executionAgent.createContent(contentData);
      
      // Then schedule it
      const scheduledTime = await executionAgent.scheduleContent(content.id);
      expect(scheduledTime).to.be.instanceOf(Date);
      
      // Verify content status was updated
      const updatedContent = executionAgent.getContent(content.id);
      expect(updatedContent?.status).to.equal("scheduled");
    });

    it("Should optimize content for quant audience", async function () {
      // First create content
      const contentData = {
        title: "Flash Loan Attack Vectors",
        body: "Analysis of recent flash loan attack patterns...",
        format: "tweet_thread" as const,
        targetPlatform: "twitter" as const,
        targetArchetype: "defi_developer" as const,
        hashtags: ["#defi", "#security"]
      };
      
      const content = await executionAgent.createContent(contentData);
      
      // Then optimize it
      const optimizedContent = await executionAgent.optimizeContent(content.id);
      expect(optimizedContent.body).to.contain("$", "Optimized quant content should include cashtags");
    });
  });

  describe("QuantFinanceAIZ Integration", function () {
    it("Should initialize a quant campaign", async function () {
      const campaignData = {
        name: "Quant Alpha Sharing Initiative",
        objective: "alpha_sharing" as const,
        targetAudience: "quant_traders" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        budget: 20000
      };
      
      const campaign = await quantFinanceAIZ.initializeCampaign(campaignData);
      expect(campaign).to.have.property("id");
      expect(campaign.name).to.equal("Quant Alpha Sharing Initiative");
      expect(campaign.status).to.equal("planning");
    });

    it("Should execute the quant finance workflow", async function () {
      // Initialize a campaign first
      const campaignData = {
        name: "DeFi Research Publication",
        objective: "education" as const,
        targetAudience: "defi_developers" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        budget: 15000
      };
      
      const campaign = await quantFinanceAIZ.initializeCampaign(campaignData);
      
      // Execute the workflow
      const workflowResult = await quantFinanceAIZ.executeQuantWorkflow(campaign.id);
      expect(workflowResult).to.have.property("campaign");
      expect(workflowResult).to.have.property("contentPlan");
      expect(workflowResult).to.have.property("executedContent");
      expect(workflowResult).to.have.property("performance");
      
      // Verify campaign status was updated
      const updatedCampaigns = quantFinanceAIZ.getActiveCampaigns();
      expect(updatedCampaigns.length).to.be.greaterThan(0);
    });

    it("Should monitor quant campaign performance", async function () {
      // Initialize and execute a campaign
      const campaignData = {
        name: "Trading Strategy Backtesting",
        objective: "alpha_sharing" as const,
        targetAudience: "quant_traders" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        budget: 10000
      };
      
      const campaign = await quantFinanceAIZ.initializeCampaign(campaignData);
      await quantFinanceAIZ.executeQuantWorkflow(campaign.id);
      
      // Monitor performance
      const performance = await quantFinanceAIZ.monitorCampaignPerformance(campaign.id);
      expect(performance).to.have.property("reach");
      expect(performance).to.have.property("engagement");
      expect(performance).to.have.property("alphaClaims");
      expect(performance).to.have.property("roi");
    });
  });
});