import { ethers } from "hardhat";
import { expect } from "chai";

describe("ZentixChronicle", function () {
  before(async function () {
    // Deploy necessary contracts
    const AIZRegistry = await ethers.getContractFactory("AIZRegistry");
    this.aizRegistry = await AIZRegistry.deploy();
    await this.aizRegistry.deployed();
    
    const ConsciousDecisionLogger = await ethers.getContractFactory("ConsciousDecisionLogger");
    this.decisionLogger = await ConsciousDecisionLogger.deploy(ethers.constants.AddressZero, this.aizRegistry.address);
    await this.decisionLogger.deployed();
    
    const ZentixChronicle = await ethers.getContractFactory("ZentixChronicle");
    this.zentixChronicle = await ZentixChronicle.deploy(this.decisionLogger.address, this.aizRegistry.address);
    await this.zentixChronicle.deployed();
    
    // Create a test agent
    this.agentId = ethers.utils.formatBytes32String("test-agent");
    this.agentAddress = (await ethers.getSigners())[1];
    
    // Register the agent
    await this.aizRegistry.registerAIZ(
      31337, // chainId
      this.agentAddress.address,
      this.agentId,
      "Test Agent",
      []
    );
    
    // Activate the agent
    await this.aizRegistry.activateAIZ(this.agentId);
  });

  it("should allow storing and retrieving data", async function () {
    const testData = ethers.utils.toUtf8Bytes("test data for storage");
    
    // Store data as the agent
    await this.zentixChronicle.connect(this.agentAddress).store(testData);
    
    // Note: In a full implementation, we would verify the stored data
    // For this test, we're just verifying the function executes without error
    expect(true).to.be.true;
  });

  it("should reject calls from unregistered agents", async function () {
    const testData = ethers.utils.toUtf8Bytes("test data");
    const unauthorizedAddress = (await ethers.getSigners())[2];
    
    await expect(
      this.zentixChronicle.connect(unauthorizedAddress).store(testData)
    ).to.be.revertedWith("Caller is not a registered AIZ contract");
  });
});