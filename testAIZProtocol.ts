// testAIZProtocol.ts
import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing AIZ Protocol...\n");
  
  // Get the first account as deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  try {
    // Deploy AIZRegistry
    console.log("Deploying AIZRegistry...");
    const AIZRegistry = await ethers.getContractFactory("AIZRegistry");
    const aizRegistry = await AIZRegistry.deploy();
    await aizRegistry.deployed();
    console.log("✅ AIZRegistry deployed to:", aizRegistry.address);
    
    // Deploy ConsciousDecisionLogger
    console.log("\nDeploying ConsciousDecisionLogger...");
    const dummyMessengerAddress = deployer.address;
    const ConsciousDecisionLogger = await ethers.getContractFactory("ConsciousDecisionLogger");
    const decisionLogger = await ConsciousDecisionLogger.deploy(dummyMessengerAddress, aizRegistry.address);
    await decisionLogger.deployed();
    console.log("✅ ConsciousDecisionLogger deployed to:", decisionLogger.address);
    
    // Deploy IntentBus
    console.log("\nDeploying IntentBus...");
    const IntentBus = await ethers.getContractFactory("IntentBus");
    const intentBus = await IntentBus.deploy(aizRegistry.address);
    await intentBus.deployed();
    console.log("✅ IntentBus deployed to:", intentBus.address);
    
    // Deploy ToolRegistry
    console.log("\nDeploying ToolRegistry...");
    const ToolRegistry = await ethers.getContractFactory("ToolRegistry");
    const toolRegistry = await ToolRegistry.deploy(aizRegistry.address);
    await toolRegistry.deployed();
    console.log("✅ ToolRegistry deployed to:", toolRegistry.address);
    
    // Deploy DataStreamRegistry
    console.log("\nDeploying DataStreamRegistry...");
    const DataStreamRegistry = await ethers.getContractFactory("DataStreamRegistry");
    const dataStreamRegistry = await DataStreamRegistry.deploy(aizRegistry.address);
    await dataStreamRegistry.deployed();
    console.log("✅ DataStreamRegistry deployed to:", dataStreamRegistry.address);
    
    // Test 1: Register an AIZ
    console.log("\nTest 1: Registering AIZ...");
    const aizId = ethers.utils.formatBytes32String("TEST-AIZ");
    const tx1 = await aizRegistry.registerAIZ(
      aizId,
      "Test AIZ",
      "A test AIZ for verification",
      deployer.address,
      [10], // OP Mainnet
      [deployer.address]
    );
    await tx1.wait();
    console.log("✅ AIZ registered successfully");
    
    // Test 2: Set capability for AIZ
    console.log("\nTest 2: Setting capability for AIZ...");
    const capability = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("canUseFlashLoans()")).substring(0, 10);
    const tx2 = await aizRegistry.setCapability(aizId, capability, true);
    await tx2.wait();
    console.log("✅ Capability set successfully");
    
    // Test 3: Check capability
    console.log("\nTest 3: Checking capability...");
    const hasCapability = await aizRegistry.checkCapability(aizId, capability);
    console.log("✅ Capability check result:", hasCapability);
    
    // Test 4: Add operator
    console.log("\nTest 4: Adding operator...");
    const [operator] = await ethers.getSigners();
    const tx3 = await aizRegistry.addOperator(aizId, operator.address);
    await tx3.wait();
    console.log("✅ Operator added successfully");
    
    // Test 5: Check if address is operator
    console.log("\nTest 5: Checking if address is operator...");
    const isOperator = await aizRegistry.isAIZOperator(aizId, operator.address);
    console.log("✅ Operator check result:", isOperator);
    
    // Test 6: Post intent
    console.log("\nTest 6: Posting intent...");
    const intentData = ethers.utils.toUtf8Bytes("Test intent data");
    const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const intentId = await intentBus.postIntent(intentData, expiry, 0, ethers.constants.AddressZero);
    console.log("✅ Intent posted successfully with ID:", intentId);
    
    // Test 7: Register tool
    console.log("\nTest 7: Registering tool...");
    const toolId = await toolRegistry.registerTool(
      "Test Tool",
      "A test tool for verification",
      deployer.address,
      0, // No fee
      ethers.constants.AddressZero
    );
    console.log("✅ Tool registered successfully with ID:", toolId);
    
    // Test 8: Register data stream
    console.log("\nTest 8: Registering data stream...");
    const streamId = await dataStreamRegistry.registerStream(
      "Test Stream",
      "A test data stream for verification",
      0, // No fee
      ethers.constants.AddressZero,
      3600 // 1 hour period
    );
    console.log("✅ Data stream registered successfully with ID:", streamId);
    
    console.log("\n🎉 All AIZ Protocol tests passed!");
    
  } catch (error: any) {
    console.log("❌ AIZ Protocol test failed:");
    console.log(error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});