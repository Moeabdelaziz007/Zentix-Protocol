const { HardhatUserConfig } = require('hardhat/config');
require('@nomiclabs/hardhat-ethers');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: process.env.RPC_MUMBAI || 'https://rpc.ankr.com/polygon_mumbai',
      accounts: process.env.PRIVATE_KEY_DEV ? [process.env.PRIVATE_KEY_DEV] : [],
      chainId: 80001,
    },
    polygon: {
      url: process.env.RPC_POLYGON || 'https://polygon-rpc.com',
      accounts: process.env.PRIVATE_KEY_PROD ? [process.env.PRIVATE_KEY_PROD] : [],
      chainId: 137,
    },
    baseSepolia: {
      url: 'https://sepolia.base.org',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test/contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
};

module.exports = config;