/**
 * Zentix Relayer Server - Express API
 * Provides gasless transactions for users
 * 
 * Run: tsx server/relayerServer.ts
 */

import express from 'express';
import cors from 'cors';
import { RelayerService, type RelayRequest } from '../core/relayer/relayerService';

const app = express();
const PORT = process.env.RELAYER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize relayer
let relayer: RelayerService;

try {
  relayer = new RelayerService();
  console.log('✅ Relayer initialized');
} catch (error) {
  console.error('❌ Failed to initialize relayer:', error);
  process.exit(1);
}

/**
 * Health check
 */
app.get('/health', async (req, res) => {
  try {
    const balance = await relayer.getBalance();
    const hasSufficient = await relayer.hasSufficientBalance('0.1');

    res.json({
      status: 'healthy',
      balance: `${balance} MATIC`,
      operational: hasSufficient,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get nonce for user
 */
app.get('/nonce/:address', (req, res) => {
  try {
    const { address } = req.params;
    const nonce = relayer.getNonce(address);

    res.json({ address, nonce });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Relay transaction
 */
app.post('/relay', async (req, res) => {
  try {
    const request: RelayRequest = req.body;

    // Validate request
    if (!request.from || !request.to || !request.data || !request.signature) {
      return res.status(400).json({
        error: 'Missing required fields: from, to, data, signature, nonce',
      });
    }

    console.log(`\n📨 Relay request received from ${request.from}`);

    // Check relayer balance
    const hasSufficient = await relayer.hasSufficientBalance('0.01');
    if (!hasSufficient) {
      return res.status(503).json({
        error: 'Relayer has insufficient balance',
      });
    }

    // Relay transaction
    const result = await relayer.relayTransaction(request);

    if (result.success) {
      console.log(`✅ Transaction relayed: ${result.transactionHash}\n`);
      res.json(result);
    } else {
      console.log(`❌ Relay failed: ${result.error}\n`);
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Relay error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Get relayer stats
 */
app.get('/stats', async (req, res) => {
  try {
    const balance = await relayer.getBalance();

    res.json({
      balance: `${balance} MATIC`,
      operational: parseFloat(balance) > 0.1,
      maxGasPrice: '100 gwei',
      maxGasLimit: 500000,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Zentix Gasless Relayer Server');
  console.log('═'.repeat(40));
  console.log(`\n📡 Server running on http://localhost:${PORT}`);
  console.log('\nEndpoints:');
  console.log(`  GET  /health              - Health check`);
  console.log(`  GET  /nonce/:address      - Get user nonce`);
  console.log(`  POST /relay               - Relay transaction`);
  console.log(`  GET  /stats               - Relayer statistics`);
  console.log('\n💡 Users can now interact with contracts without gas!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down relayer server...');
  process.exit(0);
});
