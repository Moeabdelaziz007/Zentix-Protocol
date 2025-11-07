# 🚀 Zentix Protocol v0.4 - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials (optional for development):

```env
# For IPFS Storage (optional - uses mock if not configured)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# For Blockchain Deployment (optional)
PRIVATE_KEY_DEV=your_private_key_for_testnet
RPC_MUMBAI=https://rpc.ankr.com/polygon_mumbai
```

### 3. Run Demos

```bash
# Basic agent demo (v0.1)
npm run demo

# Complete agent with economy (v0.3)
npm run demo:complete

# Blockchain integration (v0.4)
npm run demo:blockchain

# Quick start guide
npm run quickstart

# Verify all modules
npm run verify
```

### 4. Deploy Smart Contracts (Optional)

**Requirements:**
- Metamask wallet with Mumbai testnet
- Test MATIC tokens (get from [Mumbai Faucet](https://faucet.polygon.technology/))

**Deploy to Mumbai Testnet:**

```bash
npm run deploy:mumbai
```

**Update .env with contract addresses:**

After deployment, copy the contract addresses to `.env`:

```env
ZXT_TOKEN_ADDRESS_MUMBAI=0x...
ANCHOR_REGISTRY_ADDRESS_MUMBAI=0x...
```

## Architecture Layers

```
┌─────────────────────────────────────┐
│  Blockchain Layer (IPFS + Polygon)  │  ← v0.4
├─────────────────────────────────────┤
│  ZLX Messaging + Agent Factory      │  ← v0.3
├─────────────────────────────────────┤
│  Wallet Service (Economy)           │  ← v0.3
├─────────────────────────────────────┤
│  Anchoring Manager                  │  ← v0.3
├─────────────────────────────────────┤
│  DID + AIX Integration              │  ← v0.1
└─────────────────────────────────────┘
```

## Features

✅ **v0.1** - DID & AIX Identity
✅ **v0.3** - Economy, Anchoring, Messaging
✅ **v0.4** - IPFS Storage & Blockchain Integration

## Next Steps

1. Configure Pinata for real IPFS storage
2. Deploy contracts to Mumbai testnet
3. Test with real blockchain transactions
4. Scale to Polygon mainnet when ready

## Support

For issues or questions, check the documentation in `/docs/`
