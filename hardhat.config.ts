import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
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
  },
  paths: {
    sources: './contracts',
    tests: './test/contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
