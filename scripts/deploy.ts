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

  console.log('\n🚀 Deploying Zentix Protocol contracts...');
  console.log('Deployer address:', deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(await deployer.getBalance()), 'MATIC\n');

  // Deploy ZXT Token
  console.log('📝 Deploying ZXT Token...');
  const ZXTToken = await ethers.getContractFactory('ZXTToken');
  const initialSupply = ethers.utils.parseUnits('1000000', 18); // 1 million ZXT
  const zxtToken = await ZXTToken.deploy(initialSupply);
  await zxtToken.deployed();

  console.log('✅ ZXT Token deployed to:', zxtToken.address);
  console.log('   Initial supply:', ethers.utils.formatUnits(initialSupply, 18), 'ZXT\n');

  // Deploy Zentix Registry
  console.log('📝 Deploying Zentix Registry...');
  const ZentixRegistry = await ethers.getContractFactory('ZentixRegistry');
  const registry = await ZentixRegistry.deploy();
  await registry.deployed();

  console.log('✅ Zentix Registry deployed to:', registry.address);
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Deployment Summary:\n');
  console.log('  ZXT Token:       ', zxtToken.address);
  console.log('  Zentix Registry: ', registry.address);
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Add these to your .env file:');
  console.log(`ZXT_TOKEN_ADDRESS_MUMBAI=${zxtToken.address}`);
  console.log(`ANCHOR_REGISTRY_ADDRESS_MUMBAI=${registry.address}`);
  console.log('\n✅ Deployment complete!\n');

  // Verify on Polygonscan (if on testnet/mainnet)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log('⏳ Waiting for block confirmations...');
    await zxtToken.deployTransaction.wait(6);
    await registry.deployTransaction.wait(6);
    console.log('✅ Contracts confirmed on blockchain\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
