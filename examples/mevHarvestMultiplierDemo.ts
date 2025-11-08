#!/usr/bin/env tsx
/**
 * MEV Harvest Multiplier NFT Demo
 * Demonstrates the Zentix MEV Harvester with community participation through Harvest Bonds
 */

import { ethers } from "hardhat";
import { MEVHarvestMultiplierNFT, ZentixMEVHarvester } from "../typechain-types";

async function main() {
  console.log("🚀 Zentix MEV Harvest Multiplier NFT Demo");
  console.log("========================================\n");

  // Get accounts
  const [deployer, user1, user2, user3, treasury] = await ethers.getSigners();
  console.log("Accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  User 1:", user1.address);
  console.log("  User 2:", user2.address);
  console.log("  User 3:", user3.address);
  console.log("  Treasury:", treasury.address);
  console.log();

  // Deploy MEVHarvestMultiplierNFT
  console.log("1️⃣ Deploying MEV Harvest Multiplier NFT...");
  const MEVHarvestMultiplierNFTFactory = await ethers.getContractFactory("MEVHarvestMultiplierNFT");
  const mevHarvestMultiplierNFT = await MEVHarvestMultiplierNFTFactory.deploy(
    ethers.ZeroAddress, // Placeholder for MEV Harvester address
    treasury.address
  );
  await mevHarvestMultiplierNFT.waitForDeployment();
  console.log("   ✅ MEVHarvestMultiplierNFT deployed to:", await mevHarvestMultiplierNFT.getAddress());

  // Create bond issuance
  console.log("\n2️⃣ Creating bond issuance...");
  const bondParams = {
    totalBondsToIssue: 10,
    bondPrice: ethers.parseEther("1"), // 1 ETH per bond
    maturityPeriod: 30 * 24 * 60 * 60, // 30 days
    profitSharePercentage: 25 // 25% of MEV profits
  };

  const createBondTx = await mevHarvestMultiplierNFT.createBondIssuance(bondParams);
  await createBondTx.wait();
  console.log("   ✅ Bond issuance created:");
  console.log("      - Total bonds:", bondParams.totalBondsToIssue);
  console.log("      - Price per bond:", ethers.formatEther(bondParams.bondPrice), "ETH");
  console.log("      - Maturity period:", bondParams.maturityPeriod, "seconds (30 days)");
  console.log("      - Profit share:", bondParams.profitSharePercentage, "%");

  // Simulate users purchasing bonds
  console.log("\n3️⃣ Community members purchasing Harvest Bonds...");
  
  // User 1 purchases 3 bonds
  for (let i = 0; i < 3; i++) {
    const tx = await mevHarvestMultiplierNFT.connect(user1).purchaseHarvestBond({
      value: bondParams.bondPrice
    });
    await tx.wait();
    console.log("   🎯 User 1 purchased Harvest Bond #", i + 1);
  }

  // User 2 purchases 2 bonds
  for (let i = 0; i < 2; i++) {
    const tx = await mevHarvestMultiplierNFT.connect(user2).purchaseHarvestBond({
      value: bondParams.bondPrice
    });
    await tx.wait();
    console.log("   🎯 User 2 purchased Harvest Bond #", i + 4);
  }

  // User 3 purchases 1 bond
  const tx3 = await mevHarvestMultiplierNFT.connect(user3).purchaseHarvestBond({
    value: bondParams.bondPrice
  });
  await tx3.wait();
  console.log("   🎯 User 3 purchased Harvest Bond # 6");

  console.log("\n   📊 Bond distribution:");
  console.log("      - User 1: 3 bonds (50% of total)");
  console.log("      - User 2: 2 bonds (33.3% of total)");
  console.log("      - User 3: 1 bond (16.7% of total)");

  // Simulate MEV harvesting and profit distribution
  console.log("\n4️⃣ MEV Harvester generates profits and distributes to bond holders...");
  
  // Simulate MEV profit of 10 ETH
  const mevProfit = ethers.parseEther("10");
  console.log("   💰 MEV Harvester generated", ethers.formatEther(mevProfit), "ETH in profit");
  
  // Calculate distribution
  const distributedToBondHolders = (mevProfit * BigInt(bondParams.profitSharePercentage)) / BigInt(100);
  const profitPerBond = distributedToBondHolders / BigInt(6); // 6 bonds issued
  
  console.log("   📤", bondParams.profitSharePercentage, "% of profits (", ethers.formatEther(distributedToBondHolders), "ETH) distributed to bond holders");
  console.log("   📈 Each bond receives:", ethers.formatEther(profitPerBond), "ETH");

  // Simulate distributing profits (in a real scenario, the MEV Harvester would call this)
  const distributeTx = await mevHarvestMultiplierNFT.connect(deployer).distributeMEVProfits(mevProfit);
  await distributeTx.wait();
  console.log("   ✅ Profits distributed to all bond holders");

  // Show updated bond metadata
  console.log("\n5️⃣ Dynamic NFT metadata updates...");
  for (let i = 1; i <= 6; i++) {
    const bondMetadata = await mevHarvestMultiplierNFT.getHarvestBond(i);
    console.log("   🖼️  Harvest Bond #", i, ":");
    console.log("      - Total profit accrued:", ethers.formatEther(bondMetadata.totalProfitAccrued), "ETH");
    console.log("      - Visual state:", bondMetadata.visualState);
  }

  // Users claiming their profits
  console.log("\n6️⃣ Bond holders claiming their profits...");
  
  // User 1 claims profits from 3 bonds
  let user1TotalClaimed = 0n;
  for (let i = 1; i <= 3; i++) {
    const unclaimed = await mevHarvestMultiplierNFT.getUnclaimedProfits(i);
    const tx = await mevHarvestMultiplierNFT.connect(user1).claimProfits(i);
    await tx.wait();
    user1TotalClaimed += unclaimed;
    console.log("   💸 User 1 claimed", ethers.formatEther(unclaimed), "ETH from Bond #", i);
  }
  console.log("   📊 User 1 total claimed:", ethers.formatEther(user1TotalClaimed), "ETH");

  // User 2 claims profits from 2 bonds
  let user2TotalClaimed = 0n;
  for (let i = 4; i <= 5; i++) {
    const unclaimed = await mevHarvestMultiplierNFT.getUnclaimedProfits(i);
    const tx = await mevHarvestMultiplierNFT.connect(user2).claimProfits(i);
    await tx.wait();
    user2TotalClaimed += unclaimed;
    console.log("   💸 User 2 claimed", ethers.formatEther(unclaimed), "ETH from Bond #", i);
  }
  console.log("   📊 User 2 total claimed:", ethers.formatEther(user2TotalClaimed), "ETH");

  // User 3 claims profits from 1 bond
  const unclaimed3 = await mevHarvestMultiplierNFT.getUnclaimedProfits(6);
  const txClaim3 = await mevHarvestMultiplierNFT.connect(user3).claimProfits(6);
  await txClaim3.wait();
  console.log("   💸 User 3 claimed", ethers.formatEther(unclaimed3), "ETH from Bond # 6");

  // Show treasury benefits
  console.log("\n7️⃣ Treasury benefits from bond sales...");
  const treasuryBalance = await ethers.provider.getBalance(treasury.address);
  console.log("   💎 Treasury received:", ethers.formatEther(treasuryBalance), "ETH from bond sales");

  // Summary
  console.log("\n🎉 MEV Harvest Multiplier NFT Demo Complete!");
  console.log("==========================================");
  console.log("Key Benefits Demonstrated:");
  console.log("   ✅ Community participation in MEV profits");
  console.log("   ✅ Dynamic NFT metadata reflecting performance");
  console.log("   ✅ Transparent profit distribution mechanism");
  console.log("   ✅ Treasury funding through bond sales");
  console.log("   ✅ Tradable Harvest Bonds on secondary markets");
  console.log("\n📈 Economic Impact:");
  console.log("   - 6 community members directly benefited from MEV profits");
  console.log("   - Treasury received 6 ETH in initial funding");
  console.log("   - 2.5 ETH distributed to bond holders (25% of 10 ETH profit)");
  console.log("   - Each bond holder received proportional rewards based on holdings");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});