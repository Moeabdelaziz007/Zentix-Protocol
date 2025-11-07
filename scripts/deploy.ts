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
