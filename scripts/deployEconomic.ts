/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */

import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('\n🚀 Deploying Zentix Economic Contracts...');
  console.log('Deployer:', deployer.address);
  console.log('Balance:', ethers.utils.formatEther(await deployer.getBalance()), 'MATIC\n');

  // Get ZXT Token address (should be deployed first)
  const zxtAddress = process.env.ZXT_TOKEN_ADDRESS_MUMBAI;
  
  if (!zxtAddress) {
    console.error('❌ ZXT_TOKEN_ADDRESS_MUMBAI not set in .env');
    console.log('   Please deploy ZXT token first: npm run deploy:mumbai\n');
    return;
  }

  console.log('Using ZXT Token:', zxtAddress);
  console.log('\n' + '='.repeat(60) + '\n');

  // Deploy TaskEscrow
  console.log('📝 Deploying TaskEscrow...');
  const TaskEscrow = await ethers.getContractFactory('TaskEscrow');
  const escrow = await TaskEscrow.deploy(zxtAddress);
  await escrow.deployed();
  
  console.log('✅ TaskEscrow deployed to:', escrow.address);

  // Deploy ReferralReward
  console.log('\n📝 Deploying ReferralReward...');
  const ReferralReward = await ethers.getContractFactory('ReferralReward');
  const referral = await ReferralReward.deploy(zxtAddress);
  await referral.deployed();
  
  console.log('✅ ReferralReward deployed to:', referral.address);

  // Fund the contracts with initial ZXT tokens
  console.log('\n💰 Funding contracts with initial ZXT...');
  const ZXTToken = await ethers.getContractAt('ZXTToken', zxtAddress);
  
  // Fund ReferralReward with 100,000 ZXT for rewards
  const fundAmount = ethers.utils.parseUnits('100000', 18);
  const tx1 = await ZXTToken.transfer(referral.address, fundAmount);
  await tx1.wait();
  console.log('✅ Funded ReferralReward with', ethers.utils.formatUnits(fundAmount, 18), 'ZXT');

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Deployment Summary:\n');
  console.log('  ZXT Token:       ', zxtAddress);
  console.log('  TaskEscrow:      ', escrow.address);
  console.log('  ReferralReward:  ', referral.address);
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Add these to your .env file:\n');
  console.log(`TASK_ESCROW_ADDRESS_MUMBAI=${escrow.address}`);
  console.log(`REFERRAL_REWARD_ADDRESS_MUMBAI=${referral.address}`);
  console.log('\n✅ Economic contracts deployed successfully!\n');

  // Display reward settings
  console.log('🎁 Current Reward Settings:\n');
  const referralReward = await referral.referralReward();
  const taskReward = await referral.taskCompletionReward();
  const firstAgentBonus = await referral.firstAgentBonus();
  const faucetAmount = await referral.faucetAmount();
  
  console.log('  Referral Reward:      ', ethers.utils.formatUnits(referralReward, 18), 'ZXT');
  console.log('  Task Completion:      ', ethers.utils.formatUnits(taskReward, 18), 'ZXT');
  console.log('  First Agent Bonus:    ', ethers.utils.formatUnits(firstAgentBonus, 18), 'ZXT');
  console.log('  Faucet Amount:        ', ethers.utils.formatUnits(faucetAmount, 18), 'ZXT');
  console.log('  Faucet Cooldown:      ', '24 hours');
  console.log('\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
