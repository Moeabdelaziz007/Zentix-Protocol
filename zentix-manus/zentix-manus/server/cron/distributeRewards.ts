import { supabaseClient } from '../../core/db/supabaseClient';
import { relayerService } from '../../core/relayer/relayerService';
import { Guardian, RewardDistribution, Transaction } from '../../core/types';
import { ethers } from 'ethers';

// Mock ZXT Contract Address and ABI
const ZXT_CONTRACT_ADDRESS = '0xMockZXTContractAddress000000000000000000000000';
const ZXT_MOCK_ABI = [
  "function distributeRewards(address[] calldata recipients, uint256[] calldata amounts) external"
];

// Internal structured logger (mocked)
function log(message: string, data: unknown = {}): void {
  // In a real application, this would use a proper logger
  // console.log(JSON.stringify({ level: 'error', message, ...data }));
}

/**
 * Calculates points, converts to ZXT rewards, and distributes them via the relayer.
 * @returns The RewardDistribution object.
 */
async function distributeRewards(): Promise<RewardDistribution> {
  const week = Math.ceil(Date.now() / (1000 * 60 * 60 * 24 * 7)); // Mock week number
  let totalRewards = 0;
  let guardiansRewarded = 0;
  const topPerformers: Array<{ did: string; rewards: number }> = [];

  try {
    // 1. Fetch all guardians from Supabase
    const guardians = await supabaseClient.readAll<"guardians">('guardians');
    if (!guardians) {
      throw new Error("Failed to fetch guardians from Supabase.");
    }

    // 2. Calculate points and rewards (Mock logic)
    const rewardsMap = new Map<string, number>();
    guardians.forEach((guardian: Guardian) => {
      // Mock: 1 point = 10 ZXT
      const rewardAmount = guardian.points * 10;
      if (rewardAmount > 0) {
        rewardsMap.set(guardian.did, rewardAmount);
        totalRewards += rewardAmount;
        guardiansRewarded++;
        if (rewardAmount > 500) { // Mock top performer threshold
          topPerformers.push({ did: guardian.did, rewards: rewardAmount });
        }
      }
    });

    if (guardiansRewarded === 0) {
      return { week, totalRewards: 0, guardiansRewarded: 0, topPerformers: [] };
    }

    // 3. Prepare transaction data for mock contract call
    const recipients = Array.from(rewardsMap.keys());
    // Convert ZXT amount to BigInt (wei) for the contract call
    const amounts = Array.from(rewardsMap.values()).map(amount => ethers.parseUnits(amount.toString(), 18));

    // Mock contract interface
    const mockContract = new ethers.Interface(ZXT_MOCK_ABI);
    const data = mockContract.encodeFunctionData("distributeRewards", [recipients, amounts]);

    const txRequest = {
      to: ZXT_CONTRACT_ADDRESS,
      data: data,
      value: BigInt(0),
    };

    // 4. Relay transaction
    const txHash = await relayerService.relayTransaction(txRequest);

    // 5. Save reward records and transaction
    const savePromises = recipients.map(async (did) => {
      const rewardAmount = rewardsMap.get(did)!;

      // Save Reward record
      const rewardRecord = await supabaseClient.create('rewards', {
        guardian_did: did,
        amount: rewardAmount,
        week: week,
        transaction_hash: txHash,
      });

      if (!rewardRecord) {
        log('Failed to save reward record for guardian', { did });
      }
    });

    // Save Transaction record
    const transactionRecord = await supabaseClient.create('transactions', {
      hash: txHash,
      from_address: relayerService['wallet'].address, // Accessing private property for mock
      to_address: ZXT_CONTRACT_ADDRESS,
      value: '0',
      timestamp: new Date().toISOString(),
    });

    if (!transactionRecord) {
      log('Failed to save transaction record', { txHash });
    }

    await Promise.all(savePromises);

    // 6. Prepare result
    const result: RewardDistribution = {
      week,
      totalRewards,
      guardiansRewarded,
      topPerformers: topPerformers.sort((a, b) => b.rewards - a.rewards),
    };

    return result;

  } catch (error) {
    log('Critical error during reward distribution', { error: (error as Error).message });
    // Return a failure result
    return {
      week,
      totalRewards: 0,
      guardiansRewarded: 0,
      topPerformers: [],
    };
  }
}

// Execute the cron job and print the result as typed JSON
distributeRewards().then(result => {
  // Cron jobs return typed JSON
  console.log(JSON.stringify(result, null, 2));
}).catch(error => {
  log('Uncaught exception in distributeRewards cron', { error: (error as Error).message });
  // Ensure a JSON output even on uncaught error
  console.error(JSON.stringify({
    week: Math.ceil(Date.now() / (1000 * 60 * 60 * 24 * 7)),
    totalRewards: 0,
    guardiansRewarded: 0,
    topPerformers: [],
  }, null, 2));
  process.exit(1);
});
