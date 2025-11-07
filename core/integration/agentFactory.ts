/**
 * Zentix Agent Factory
 * Creates complete agents with DID, AIX, Wallet, and blockchain anchoring
 * 
 * @module agentFactory
 * @version 0.3.0
 */

import { DidAixIntegration, AgentWithDID } from '../identity/didAixIntegration';
import { WalletService, ZentixWallet } from '../economy/walletService';
import { AnchorManager, BlockchainNetwork } from '../anchoring/anchorManager';
import { ZLXMessaging } from '../../network/zlx/zlxMessaging';

/**
 * Complete Zentix Agent with all layers
 */
export interface CompleteAgent {
  aix_did: AgentWithDID;
  wallet: ZentixWallet;
  anchors: {
    did_anchor_id: string;
    wallet_anchor_id: string;
  };
  network: {
    registered: boolean;
    workspace_id: string;
  };
}

/**
 * Agent creation options
 */
export interface AgentCreationOptions {
  name: string;
  archetype: 'analyst' | 'creative' | 'helper' | 'guardian' | 'explorer';
  tone: string;
  values: string[];
  skills: Array<{ name: string; description: string }>;
  workspace_id: string;
  blockchain?: BlockchainNetwork;
  initial_balance?: number;
}

/**
 * Factory for creating complete Zentix agents
 */
export class AgentFactory {
  /**
   * Create a complete agent with all layers integrated
   * 
   * @param options - Agent creation options
   * @returns Complete agent with DID, AIX, Wallet, and anchoring
   */
  static createCompleteAgent(options: AgentCreationOptions): CompleteAgent {
    const {
      name,
      archetype,
      tone,
      values,
      skills,
      workspace_id,
      blockchain = 'Polygon',
      initial_balance = 0,
    } = options;

    // Step 1: Create AIX + DID
    const aixDid = DidAixIntegration.createAgentWithDID({
      id: crypto.randomUUID(),
      name,
      meta: {
        created: new Date().toISOString(),
        author: 'Zentix Protocol',
        description: `Complete digital being: ${name}`,
        tags: ['zentix', 'v0.3', archetype],
      },
      persona: {
        archetype,
        tone,
        values,
      },
      skills,
    });

    // Step 2: Create Wallet linked to DID
    let wallet = WalletService.createWallet(aixDid.did.did);

    // Add initial balance if specified
    if (initial_balance > 0) {
      wallet = WalletService.deposit(
        wallet,
        initial_balance,
        'Initial balance from creation'
      );
    }

    // Step 3: Anchor DID to blockchain
    const didAnchor = AnchorManager.anchorDID(aixDid.did, blockchain);

    // Step 4: Anchor Wallet to blockchain
    const walletAnchor = AnchorManager.anchorWallet(wallet, blockchain);

    // Step 5: Register agent in ZLX network
    ZLXMessaging.registerEndpoint(
      aixDid.did.did,
      workspace_id,
      `ws://zentix.network/agent/${aixDid.did.did}`
    );

    // Step 6: Record creation as event
    const updatedAixDid = DidAixIntegration.recordAgentEvent(
      aixDid,
      'learning',
      {
        event: 'agent_created',
        wallet_address: wallet.address,
        blockchain,
        workspace: workspace_id,
      }
    );

    return {
      aix_did: updatedAixDid,
      wallet,
      anchors: {
        did_anchor_id: didAnchor.id,
        wallet_anchor_id: walletAnchor.id,
      },
      network: {
        registered: true,
        workspace_id,
      },
    };
  }

  /**
   * Get complete agent profile
   * 
   * @param agent - Complete agent
   * @returns Comprehensive agent profile
   */
  static getAgentProfile(agent: CompleteAgent) {
    const identityCard = DidAixIntegration.getIdentityCard(agent.aix_did);
    const walletSummary = WalletService.getSummary(agent.wallet);
    const didAnchor = AnchorManager.getAnchor(agent.anchors.did_anchor_id);
    const walletAnchor = AnchorManager.getAnchor(agent.anchors.wallet_anchor_id);

    return {
      // Identity
      name: identityCard.agent_name,
      did: identityCard.did,
      fingerprint: identityCard.fingerprint,
      age_days: identityCard.age_days,

      // Persona
      persona: identityCard.persona,
      skills: agent.aix_did.aix.skills,

      // Economy
      wallet: {
        address: walletSummary.address,
        balance: walletSummary.balance,
        total_transactions: walletSummary.total_transactions,
      },

      // Blockchain
      anchoring: {
        did_status: didAnchor?.status,
        did_blockchain: didAnchor?.blockchain,
        did_tx: didAnchor?.transaction_hash,
        wallet_status: walletAnchor?.status,
        wallet_blockchain: walletAnchor?.blockchain,
      },

      // Network
      network: {
        workspace: agent.network.workspace_id,
        online: ZLXMessaging.isOnline(agent.aix_did.did.did),
      },

      // State
      feelings: identityCard.current_feelings,
      total_events: identityCard.total_events,
    };
  }

  /**
   * Reward an agent for task completion
   * 
   * @param agent - Complete agent
   * @param amount - Reward amount
   * @param reason - Reason for reward
   * @returns Updated agent
   */
  static rewardAgent(
    agent: CompleteAgent,
    amount: number,
    reason: string
  ): CompleteAgent {
    const updated = { ...agent };

    // Add reward to wallet
    updated.wallet = WalletService.reward(updated.wallet, amount, reason);

    // Record event in DID history
    updated.aix_did = DidAixIntegration.recordAgentEvent(
      updated.aix_did,
      'success',
      {
        type: 'reward',
        amount,
        reason,
        wallet_balance: updated.wallet.balance,
      }
    );

    return updated;
  }

  /**
   * Enable agent to perform a paid task
   * 
   * @param agent - Complete agent
   * @param cost - Task cost
   * @param taskDescription - Task description
   * @returns Updated agent
   */
  static performPaidTask(
    agent: CompleteAgent,
    cost: number,
    taskDescription: string
  ): CompleteAgent {
    const updated = { ...agent };

    // Spend from wallet
    updated.wallet = WalletService.spend(updated.wallet, cost, taskDescription);

    // Record event
    updated.aix_did = DidAixIntegration.recordAgentEvent(
      updated.aix_did,
      'interaction',
      {
        type: 'paid_task',
        cost,
        description: taskDescription,
      }
    );

    return updated;
  }

  /**
   * Transfer funds between agents
   * 
   * @param from - Sender agent
   * @param to - Receiver agent
   * @param amount - Transfer amount
   * @param description - Transfer description
   * @returns Tuple of [updated sender, updated receiver]
   */
  static transferBetweenAgents(
    from: CompleteAgent,
    to: CompleteAgent,
    amount: number,
    description?: string
  ): [CompleteAgent, CompleteAgent] {
    const [senderWallet, receiverWallet] = WalletService.transfer(
      from.wallet,
      to.wallet,
      amount,
      description
    );

    const updatedSender = { ...from, wallet: senderWallet };
    const updatedReceiver = { ...to, wallet: receiverWallet };

    // Record in both agents' history
    updatedSender.aix_did = DidAixIntegration.recordAgentEvent(
      updatedSender.aix_did,
      'interaction',
      {
        type: 'transfer_sent',
        amount,
        to: to.aix_did.did.did,
      }
    );

    updatedReceiver.aix_did = DidAixIntegration.recordAgentEvent(
      updatedReceiver.aix_did,
      'interaction',
      {
        type: 'transfer_received',
        amount,
        from: from.aix_did.did.did,
      }
    );

    return [updatedSender, updatedReceiver];
  }
}
