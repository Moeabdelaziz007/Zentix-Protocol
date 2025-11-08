# Superchain Developer Console Connection Guide

This guide explains how to connect to the Optimism Superchain Developer Console and utilize your daily testnet credits (0.05 ETH and 0.05 OP).

## Prerequisites

1. A wallet address (you provided: `0x5768A93D15D1756e91b7CaB7D6ab06740072Fe0E`)
2. Node.js installed on your system
3. This Zentix Protocol repository cloned locally

## Connecting to Superchain Developer Console

### 1. Set up Environment Variables

Create or update your `.env` file with your private key:

```bash
PRIVATE_KEY=your_private_key_here
```

**Important:** Never commit your private key to version control!

### 2. Run the Connection Script

```bash
npm run demo:superchain
```

This script will:
- Connect to OP Sepolia testnet
- Check your wallet balance
- Guide you to claim your daily testnet credits
- Register a test agent to verify functionality

### 3. Claim Your Daily Credits

1. Visit [Superchain Developer Console Faucet](https://console.optimism.io/faucet)
2. Connect your wallet (`0x5768A93D15D1756e91b7CaB7D6ab06740072Fe0E`)
3. Claim your daily 0.05 ETH and 0.05 OP testnet credits
4. Use these funds for testing on Superchain testnets

## Available Networks

### Testnets
- OP Sepolia (Chain ID: 11155420)
- Base Sepolia (Chain ID: 84532)

### Mainnets
- OP Mainnet (Chain ID: 10)
- Base (Chain ID: 8453)
- Zora (Chain ID: 7777777)
- Mode (Chain ID: 34443)

## Features Available

- Daily 0.05 ETH testnet credits
- Daily 0.05 OP testnet credits
- Access to testnet faucets
- Paymaster support for gasless transactions
- Safe smart wallet integrations
- Cross-chain messaging between OP chains

## Testing Cross-Chain Functionality

The Zentix Protocol includes built-in support for cross-chain messaging:

1. Register agents on multiple chains
2. Send decisions across chains
3. Verify cross-chain communication

## Next Steps

1. Deploy your contracts using Hardhat
2. Test cross-chain messaging between OP chains
3. Utilize paymaster for gasless transactions
4. Monitor transactions in the console dashboard

## Troubleshooting

If you encounter issues:

1. Ensure your private key is correctly set in `.env`
2. Check that you have sufficient testnet funds
3. Verify network connectivity to the RPC endpoints
4. Check the console for error messages

For additional help, visit:
- [Superchain Developer Console](https://console.optimism.io/)
- [Optimism Documentation](https://docs.optimism.io/)