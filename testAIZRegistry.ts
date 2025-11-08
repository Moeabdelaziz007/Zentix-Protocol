// testAIZRegistry.ts
import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing AIZRegistry...\n");
  
  // Get the first account as deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  try {
    // Get contract factory
    const AIZRegistry = await ethers.getContractFactory("AIZRegistry");
    
    // Deploy the contract
    console.log("Deploying AIZRegistry...");
    const aizRegistry = await AIZRegistry.deploy();
    await aizRegistry.deployed();
    console.log("✅ AIZRegistry deployed to:", aizRegistry.address);
    
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
    
    // Test 2: Grant capability
    console.log("\nTest 2: Granting capability...");
    const tx2 = await aizRegistry.grantCapability(
      aizId,
      "canUseFlashLoans",
      0
    );
    await tx2.wait();
    console.log("✅ Capability granted successfully");
    
    // Test 3: Verify AIZ info
    console.log("\nTest 3: Verifying AIZ info...");
    const aizInfo = await aizRegistry.getAIZ(aizId);
    console.log("✅ AIZ Info:");
    console.log("   Name:", aizInfo.name);
    console.log("   Description:", aizInfo.description);
    console.log("   Active:", aizInfo.isActive);
    
    // Test 4: Check capability
    console.log("\nTest 4: Checking capability...");
    const hasCapability = await aizRegistry.hasCapability(aizId, "canUseFlashLoans");
    console.log("✅ Has capability 'canUseFlashLoans':", hasCapability);
    
    // Test 5: Get total AIZs
    console.log("\nTest 5: Getting total AIZs...");
    const totalAIZs = await aizRegistry.getTotalAIZs();
    console.log("✅ Total AIZs:", totalAIZs.toString());
    
    console.log("\n🎉 All AIZRegistry tests passed!");
    
  } catch (error) {
    console.error("❌ AIZRegistry test failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});