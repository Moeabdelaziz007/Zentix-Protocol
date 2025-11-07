// deploy.js
import { ethers } from "hardhat";

async function main() {
  // Get the contract factory
  const RewardsPool = await ethers.getContractFactory("RewardsPool");
  
  // For testing purposes, we'll use a mock ERC20 token
  // In a real deployment, you would use the actual token address
  const mockTokenAddress = "0x0000000000000000000000000000000000000000"; // Replace with actual token address
  
  console.log("Deploying RewardsPool with mock token address:", mockTokenAddress);
  
  // Deploy the contract
  const rewardsPool = await RewardsPool.deploy(mockTokenAddress);
  
  await rewardsPool.deployed();
  
  console.log("RewardsPool deployed to:", rewardsPool.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });