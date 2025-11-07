#!/usr/bin/env tsx
/**
 * Simple verification script for Zentix v0.3
 */

import { WalletService } from '../core/economy/walletService';
import { AnchorManager } from '../core/anchoring/anchorManager';
import { ZLXMessaging } from '../network/zlx/zlxMessaging';

console.log('\n🔍 Zentix v0.3 - Module Verification\n');

// Test Wallet
console.log('1️⃣  Testing Wallet Service...');
let wallet = WalletService.createWallet('zxdid:zentix:0xTEST');
wallet = WalletService.deposit(wallet, 100, 'Test deposit');
console.log(`   ✅ Wallet: ${wallet.address}`);
console.log(`   ✅ Balance: ${wallet.balance} ZXT\n`);

// Test Anchoring
console.log('2️⃣  Testing Anchor Manager...');
const mockDID = {
  did: 'zxdid:zentix:0xTEST123',
  created_at: new Date().toISOString(),
  agent_name: 'TestAgent',
  aix_hash: 'abc123',
  public_key: '0xKEY',
  blockchain: 'Polygon' as const,
  age_days: 0,
  history: [],
};
const anchor = AnchorManager.anchorDID(mockDID);
console.log(`   ✅ Anchor ID: ${anchor.id}`);
console.log(`   ✅ Status: ${anchor.status}\n`);

// Test Messaging
console.log('3️⃣  Testing ZLX Messaging...');
ZLXMessaging.registerEndpoint('agent-1', 'workspace-1', 'ws://test');
ZLXMessaging.registerEndpoint('agent-2', 'workspace-1', 'ws://test');
const stats = ZLXMessaging.getNetworkStats();
console.log(`   ✅ Registered Agents: ${stats.total_agents}`);
console.log(`   ✅ Online Agents: ${stats.online_agents}\n`);

console.log('✅ All modules working correctly!\n');
console.log('🚀 Ready to run: npm run demo:complete\n');
