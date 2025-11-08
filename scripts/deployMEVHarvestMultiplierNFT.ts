import { ethers, run } from "hardhat";
import { 
  MEVHarvestMultiplierNFT__factory,
  ZentixMEVHarvester__factory
} from "../typechain-types";

async function main() {
  console.log("🚀 Deploying MEV Harvest Multiplier NFT...");
  console.log("========================================\n");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString(), "wei\n");

  // Deploy MEVHarvestMultiplierNFT
  console.log("1️⃣ Deploying MEVHarvestMultiplierNFT...");
  
  // For this deployment, we'll need the MEV Harvester address
  // In a real deployment, you would use the actual deployed address
  // For now, we'll use a placeholder that will be updated after deployment
  const mevHarvesterAddress = ethers.ZeroAddress; // Placeholder
  const treasuryAddress = deployer.address; // Using deployer as treasury for demo
  
  const mevHarvestMultiplierNFTFactory = new MEVHarvestMultiplierNFT__factory(deployer);
  const mevHarvestMultiplierNFT = await mevHarvestMultiplierNFTFactory.deploy(
    mevHarvesterAddress,
    treasuryAddress
  );
  await mevHarvestMultiplierNFT.waitForDeployment();
  const mevHarvestMultiplierNFTAddress = await mevHarvestMultiplierNFT.getAddress();
  console.log("   ✅ MEVHarvestMultiplierNFT deployed to:", mevHarvestMultiplierNFTAddress);

  // Summary
  console.log("\n🎉 MEV Harvest Multiplier NFT Deployment Complete!");
  console.log("================================================");
  console.log("Deployed Contracts:");
  console.log("   MEVHarvestMultiplierNFT:", mevHarvestMultiplierNFTAddress);
  console.log("   Treasury Address:", treasuryAddress);
  console.log("\n📋 Next Steps:");
  console.log("   1. Update MEV Harvester contract with this NFT address");
  console.log("   2. Create bond issuance for community sale");
  console.log("   3. Configure off-chain metadata service for dynamic visuals");
  console.log("   4. Begin distributing MEV profits to bond holders");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});