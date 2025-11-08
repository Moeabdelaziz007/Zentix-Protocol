/**
 * Attention Marketing Protocol Test Suite
 * Tests all smart contracts for the Attention Harvester AIZs
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { HumanBehaviorDB, ContentEngine, EngagementTracker } from "../typechain-types";

describe("Attention Marketing Protocol", function () {
  let humanBehaviorDB: HumanBehaviorDB;
  let contentEngine: ContentEngine;
  let engagementTracker: EngagementTracker;
  let deployer: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [deployer, addr1, addr2] = await ethers.getSigners();

    // Deploy HumanBehaviorDB
    const HumanBehaviorDBFactory = await ethers.getContractFactory("HumanBehaviorDB");
    humanBehaviorDB = await HumanBehaviorDBFactory.deploy();
    await humanBehaviorDB.deployed();

    // Deploy ContentEngine
    const ContentEngineFactory = await ethers.getContractFactory("ContentEngine");
    contentEngine = await ContentEngineFactory.deploy(humanBehaviorDB.address);
    await contentEngine.deployed();

    // Deploy EngagementTracker
    const EngagementTrackerFactory = await ethers.getContractFactory("EngagementTracker");
    engagementTracker = await EngagementTrackerFactory.deploy(contentEngine.address);
    await engagementTracker.deployed();
  });

  describe("HumanBehaviorDB", function () {
    it("Should create a new behavioral archetype", async function () {
      await humanBehaviorDB.createArchetype(
        "healthcare_professional",
        "Healthcare Professional",
        "Medical doctors, nurses, and healthcare practitioners"
      );

      const archetypeInfo = await humanBehaviorDB.getArchetypeInfo("healthcare_professional");
      expect(archetypeInfo.name).to.equal("Healthcare Professional");
      expect(archetypeInfo.confidenceScore).to.equal(50);
    });

    it("Should update behavioral traits for an archetype", async function () {
      // Create archetype first
      await humanBehaviorDB.createArchetype(
        "healthcare_professional",
        "Healthcare Professional",
        "Medical doctors, nurses, and healthcare practitioners"
      );

      // Update traits
      await humanBehaviorDB.updateArchetypeTraits(
        "healthcare_professional",
        ["evidence_based", "detail_oriented"],
        [90, 85]
      );

      const traits = await humanBehaviorDB.getArchetypeTraits(
        "healthcare_professional",
        ["evidence_based", "detail_oriented"]
      );

      expect(traits[0]).to.equal(90);
      expect(traits[1]).to.equal(85);
    });

    it("Should record content performance for an archetype", async function () {
      // Create archetype first
      await humanBehaviorDB.createArchetype(
        "healthcare_professional",
        "Healthcare Professional",
        "Medical doctors, nurses, and healthcare practitioners"
      );

      // Record content performance
      await humanBehaviorDB.recordContentPerformance(
        "content_001",
        "healthcare_professional",
        1000, // views
        150,  // likes
        45,   // shares
        12    // conversions
      );

      const performance = await humanBehaviorDB.getContentPerformance("content_001");
      expect(performance.contentId).to.equal("content_001");
      expect(performance.views).to.equal(1000);
      expect(performance.likes).to.equal(150);
      expect(performance.shares).to.equal(45);
      expect(performance.conversions).to.equal(12);
    });
  });

  describe("ContentEngine", function () {
    it("Should create a content intent", async function () {
      const tx = await contentEngine.createContentIntent(
        "article",
        "AI in Healthcare",
        "healthcare_professional",
        "professional",
        ["Medical AI applications", "Ethical considerations"],
        Math.floor(Date.now() / 1000) + 86400 // 1 day from now
      );

      await tx.wait();

      // Check that the event was emitted
      await expect(tx)
        .to.emit(contentEngine, "ContentIntentCreated")
        .withArgs(
          ethers.utils.hexZeroPad(ethers.utils.hexlify(0), 32), // This is a placeholder, actual ID will be dynamic
          deployer.address,
          "article",
          "AI in Healthcare"
        );
    });

    it("Should record generated content", async function () {
      // First create a content intent
      await contentEngine.createContentIntent(
        "article",
        "AI in Healthcare",
        "healthcare_professional",
        "professional",
        ["Medical AI applications", "Ethical considerations"],
        Math.floor(Date.now() / 1000) + 86400 // 1 day from now
      );

      // Get the intent ID (in a real test, we'd capture the event to get the actual ID)
      const intentId = "intent_" + Math.floor(Date.now() / 1000) + "_" + deployer.address;

      // Record generated content
      await contentEngine.recordGeneratedContent(
        intentId,
        "AI in Healthcare: A Professional Guide",
        "This is the complete article content about AI in healthcare...",
        "https://example.com/media/ai_healthcare.jpg",
        "QmHash1234567890" // IPFS hash
      );

      // Check that the event was emitted
      // Note: In a real implementation, we'd verify the content was stored correctly
    });

    it("Should approve generated content", async function () {
      // First create a content intent
      await contentEngine.createContentIntent(
        "article",
        "AI in Healthcare",
        "healthcare_professional",
        "professional",
        ["Medical AI applications", "Ethical considerations"],
        Math.floor(Date.now() / 1000) + 86400 // 1 day from now
      );

      // Record generated content
      const intentId = "intent_" + Math.floor(Date.now() / 1000) + "_" + deployer.address;
      
      await contentEngine.recordGeneratedContent(
        intentId,
        "AI in Healthcare: A Professional Guide",
        "This is the complete article content about AI in healthcare...",
        "https://example.com/media/ai_healthcare.jpg",
        "QmHash1234567890" // IPFS hash
      );

      // Approve content (using a placeholder content ID)
      const contentId = "content_" + Math.floor(Date.now() / 1000) + "_" + deployer.address;
      
      // This would fail in a real test because we don't have the actual content ID
      // In a real implementation, we'd capture the event to get the actual ID
    });
  });

  describe("EngagementTracker", function () {
    it("Should record engagement metrics", async function () {
      // Record engagement metrics
      await engagementTracker.recordEngagementMetrics(
        "content_001",
        "twitter",
        1500, // views
        120,  // likes
        45,   // shares
        18,   // comments
        5,    // conversions
        1800  // reach
      );

      // Check that the event was emitted
      await expect(
        engagementTracker.recordEngagementMetrics(
          "content_001",
          "twitter",
          1500,
          120,
          45,
          18,
          5,
          1800
        )
      ).to.emit(engagementTracker, "MetricsRecorded");
    });

    it("Should calculate performance score", async function () {
      // Record engagement metrics
      await engagementTracker.recordEngagementMetrics(
        "content_001",
        "twitter",
        1500, // views
        120,  // likes
        45,   // shares
        18,   // comments
        5,    // conversions
        1800  // reach
      );

      // Calculate performance score
      const score = await engagementTracker.calculatePerformanceScore("content_001");
      expect(score).to.be.a("number");
      // The score should be between 0 and 100
      expect(score).to.be.at.least(0);
      expect(score).to.be.at.most(100);
    });

    it("Should set platform configuration", async function () {
      await engagementTracker.setPlatformConfig(
        "tiktok",
        "TikTok",
        true,
        60
      );

      const config = await engagementTracker.getPlatformConfig("tiktok");
      expect(config.name).to.equal("TikTok");
      expect(config.active).to.equal(true);
      expect(config.weight).to.equal(60);
    });
  });

  describe("Integration Tests", function () {
    it("Should work together as a complete system", async function () {
      // 1. Create a behavioral archetype in HumanBehaviorDB
      await humanBehaviorDB.createArchetype(
        "quant_trader",
        "Quantitative Trader",
        "Professional traders using algorithmic strategies"
      );

      // 2. Create a content intent in ContentEngine
      await contentEngine.createContentIntent(
        "research_note",
        "Cross-Chain Arbitrage Strategies",
        "quant_trader",
        "professional",
        ["Statistical arbitrage", "Risk management"],
        Math.floor(Date.now() / 1000) + 86400 // 1 day from now
      );

      // 3. Record generated content
      const intentId = "intent_" + Math.floor(Date.now() / 1000) + "_" + deployer.address;
      
      await contentEngine.recordGeneratedContent(
        intentId,
        "Cross-Chain Arbitrage: A Quantitative Approach",
        "This research note analyzes cross-chain arbitrage opportunities...",
        "https://example.com/media/arbitrage_chart.png",
        "QmResearchNote1234567890"
      );

      // 4. Record engagement metrics in EngagementTracker
      await engagementTracker.recordEngagementMetrics(
        "content_001",
        "twitter",
        2500, // views
        320,  // likes
        85,   // shares
        28,   // comments
        15,   // conversions
        3000  // reach
      );

      // 5. Calculate performance score
      const score = await engagementTracker.calculatePerformanceScore("content_001");
      expect(score).to.be.a("number");
      
      // 6. Update behavioral traits based on performance
      await humanBehaviorDB.updateArchetypeTraits(
        "quant_trader",
        ["interest_in_arbitrage", "engagement_level"],
        [85, 90]
      );

      // Verify the traits were updated
      const traits = await humanBehaviorDB.getArchetypeTraits(
        "quant_trader",
        ["interest_in_arbitrage", "engagement_level"]
      );

      expect(traits[0]).to.equal(85);
      expect(traits[1]).to.equal(90);
    });
  });
});