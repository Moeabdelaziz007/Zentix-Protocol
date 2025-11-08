/**
 * Health-Aware AIZ Test Suite
 * Tests all agents in the Health-Aware Attention Harvester AIZ team
 */

import { expect } from "chai";
import { HealthAwareAIZ } from "./core/agents/marketingGuild/HealthAwareAIZ";
import { HealthAwarePlannerAgent } from "./core/agents/marketingGuild/HealthAwarePlannerAgent";
import { HealthAwareRiskAgent } from "./core/agents/marketingGuild/HealthAwareRiskAgent";
import { HealthAwareExecutionAgent } from "./core/agents/marketingGuild/HealthAwareExecutionAgent";

describe("Health-Aware AIZ", function () {
  let healthAwareAIZ: HealthAwareAIZ;
  let plannerAgent: HealthAwarePlannerAgent;
  let riskAgent: HealthAwareRiskAgent;
  let executionAgent: HealthAwareExecutionAgent;

  beforeEach(function () {
    healthAwareAIZ = HealthAwareAIZ.getInstance();
    plannerAgent = HealthAwarePlannerAgent.getInstance();
    riskAgent = HealthAwareRiskAgent.getInstance();
    executionAgent = HealthAwareExecutionAgent.getInstance();
  });

  describe("HealthAwarePlannerAgent", function () {
    it("Should research content opportunities", async function () {
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
    });

    it("Should create a content plan", async function () {
      const plan = await plannerAgent.createContentPlan(30);
      expect(plan).to.have.property("period");
      expect(plan).to.have.property("contentItems");
      expect(plan.contentItems).to.be.an("array");
      expect(plan.contentItems.length).to.be.greaterThan(0);
    });
  });

  describe("HealthAwareRiskAgent", function () {
    it("Should assess content risks", async function () {
      const content = `
        This medical advice is for informational purposes only.
        Always consult with your healthcare provider before making any medical decisions.
        Some content about new treatments and research findings.
      `;
      
      const assessment = await riskAgent.assessContentRisks("content_001", content);
      expect(assessment).to.have.property("id");
      expect(assessment).to.have.property("contentId");
      expect(assessment).to.have.property("risks");
      expect(assessment).to.have.property("overallRiskLevel");
      expect(assessment).to.have.property("recommendations");
    });

    it("Should identify high-risk content", async function () {
      const riskyContent = `
        You should take this medication to cure your disease.
        This treatment has been proven to work 100% of the time.
        Doctor recommends this specific approach.
      `;
      
      const assessment = await riskAgent.assessContentRisks("content_002", riskyContent);
      expect(assessment.overallRiskLevel).to.be.oneOf(["medium", "high"]);
      expect(assessment.risks.length).to.be.greaterThan(0);
    });

    it("Should approve low-risk content", async function () {
      const safeContent = `
        # Healthcare Insights: General Wellness Tips
        
        Here are some evidence-based wellness tips:
        
        1. Stay hydrated
        2. Get regular exercise
        3. Maintain a balanced diet
        
        *Disclaimer: This content is for informational purposes only.*
      `;
      
      const assessment = await riskAgent.assessContentRisks("content_003", safeContent);
      const isApproved = await riskAgent.approveContent("content_003");
      expect(isApproved).to.be.true;
    });
  });

  describe("HealthAwareExecutionAgent", function () {
    it("Should create healthcare content", async function () {
      const contentData = {
        title: "Understanding Telemedicine Benefits",
        body: "Telemedicine has revolutionized healthcare access...",
        format: "article" as const,
        targetPlatform: "medium" as const,
        targetArchetype: "health_savvy_patient" as const,
        hashtags: ["#telemedicine", "#healthcare"]
      };
      
      const content = await executionAgent.createContent(contentData);
      expect(content).to.have.property("id");
      expect(content.title).to.equal("Understanding Telemedicine Benefits");
      expect(content.format).to.equal("article");
      expect(content.status).to.equal("draft");
    });

    it("Should schedule content", async function () {
      // First create content
      const contentData = {
        title: "Chronic Disease Management Strategies",
        body: "Effective management of chronic conditions...",
        format: "infographic" as const,
        targetPlatform: "linkedin" as const,
        targetArchetype: "healthcare_professional" as const,
        hashtags: ["#chronicdisease", "#healthcare"]
      };
      
      const content = await executionAgent.createContent(contentData);
      
      // Then schedule it
      const scheduledTime = await executionAgent.scheduleContent(content.id);
      expect(scheduledTime).to.be.instanceOf(Date);
      
      // Verify content status was updated
      const updatedContent = executionAgent.getContent(content.id);
      expect(updatedContent?.status).to.equal("scheduled");
    });

    it("Should optimize content for healthcare audience", async function () {
      // First create content
      const contentData = {
        title: "Mental Health Awareness in the Workplace",
        body: "Mental health is crucial for overall well-being...",
        format: "social_post" as const,
        targetPlatform: "twitter" as const,
        targetArchetype: "general_public" as const,
        hashtags: ["#mentalhealth", "#wellness"]
      };
      
      const content = await executionAgent.createContent(contentData);
      
      // Then optimize it
      const optimizedContent = await executionAgent.optimizeContent(content.id);
      expect(optimizedContent.body).to.contain("disclaimer", "Optimized content should include healthcare disclaimer");
    });
  });

  describe("HealthAwareAIZ Integration", function () {
    it("Should initialize a campaign", async function () {
      const campaignData = {
        name: "Healthcare Awareness Month",
        objective: "education" as const,
        targetAudience: "healthcare_professionals" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        budget: 10000
      };
      
      const campaign = await healthAwareAIZ.initializeCampaign(campaignData);
      expect(campaign).to.have.property("id");
      expect(campaign.name).to.equal("Healthcare Awareness Month");
      expect(campaign.status).to.equal("planning");
    });

    it("Should execute the healthcare workflow", async function () {
      // Initialize a campaign first
      const campaignData = {
        name: "Patient Education Initiative",
        objective: "education" as const,
        targetAudience: "patients" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        budget: 5000
      };
      
      const campaign = await healthAwareAIZ.initializeCampaign(campaignData);
      
      // Execute the workflow
      const workflowResult = await healthAwareAIZ.executeHealthcareWorkflow(campaign.id);
      expect(workflowResult).to.have.property("campaign");
      expect(workflowResult).to.have.property("contentPlan");
      expect(workflowResult).to.have.property("executedContent");
      expect(workflowResult).to.have.property("performance");
      
      // Verify campaign status was updated
      const updatedCampaigns = healthAwareAIZ.getActiveCampaigns();
      expect(updatedCampaigns.length).to.be.greaterThan(0);
    });

    it("Should monitor campaign performance", async function () {
      // Initialize and execute a campaign
      const campaignData = {
        name: "Medical Research Highlights",
        objective: "awareness" as const,
        targetAudience: "healthcare_professionals" as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        budget: 2500
      };
      
      const campaign = await healthAwareAIZ.initializeCampaign(campaignData);
      await healthAwareAIZ.executeHealthcareWorkflow(campaign.id);
      
      // Monitor performance
      const performance = await healthAwareAIZ.monitorCampaignPerformance(campaign.id);
      expect(performance).to.have.property("reach");
      expect(performance).to.have.property("engagement");
      expect(performance).to.have.property("conversions");
      expect(performance).to.have.property("roi");
    });
  });
});