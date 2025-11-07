import { randomBytes } from 'crypto';

/**
 * Zentix Wallet Service - Economic Layer for AI Agents
 * Manages digital wallets, transactions, and rewards
 * 
 * @module walletService
 * @version 0.3.0
 */

/**
 * Transaction types in the Zentix economy
 */
export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'reward' | 'transfer';
  amount: number;
  currency: 'ZXT' | 'USD' | 'ETH';
  description?: string;
  timestamp: string;
  from?: string;
  to?: string;
  metadata?: Record<string, any>;
}

/**
 * Digital wallet for Zentix agents
 * Format: ztw:0x<32-char-hex>
 */
export interface ZentixWallet {
  address: string;
  balance: number;
  currency: 'ZXT';
  created_at: string;
  transactions: Transaction[];
  agent_did?: string; // Link to agent's DID
}

/**
 * Wallet service for managing agent economy
 */
export class WalletService {
  /**
   * Create a new wallet for an agent
   * 
   * @param agentDID - Optional DID to link wallet to agent
   * @returns New ZentixWallet object
   * 
   * @example
   * ```ts
   * const wallet = WalletService.createWallet('zxdid:zentix:0x...');
   * console.log(wallet.address); // ztw:0x8AFCE1B0...
   * ```
   */
  static createWallet(agentDID?: string): ZentixWallet {
    const address = `ztw:0x${randomBytes(16).toString('hex').toUpperCase()}`;
    return {
      address,
      balance: 0,
      currency: 'ZXT',
      created_at: new Date().toISOString(),
      transactions: [],
      agent_did: agentDID,
    };
  }

  /**
   * Deposit funds into wallet
   * 
   * @param wallet - The wallet to deposit into
   * @param amount - Amount to deposit
   * @param description - Transaction description
   * @returns Updated wallet
   */
  static deposit(
    wallet: ZentixWallet,
    amount: number,
    description = 'Deposit'
  ): ZentixWallet {
    if (amount <= 0) throw new Error('Amount must be positive');

    const updated = { ...wallet };
    updated.balance += amount;
    updated.transactions.push({
      id: randomBytes(8).toString('hex'),
      type: 'income',
      amount,
      currency: 'ZXT',
      description,
      timestamp: new Date().toISOString(),
      to: wallet.address,
    });
    return updated;
  }

  /**
   * Spend funds from wallet
   * 
   * @param wallet - The wallet to spend from
   * @param amount - Amount to spend
   * @param description - Transaction description
   * @returns Updated wallet
   */
  static spend(
    wallet: ZentixWallet,
    amount: number,
    description = 'Expense'
  ): ZentixWallet {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (wallet.balance < amount) throw new Error('Insufficient funds');

    const updated = { ...wallet };
    updated.balance -= amount;
    updated.transactions.push({
      id: randomBytes(8).toString('hex'),
      type: 'expense',
      amount,
      currency: 'ZXT',
      description,
      timestamp: new Date().toISOString(),
      from: wallet.address,
    });
    return updated;
  }

  /**
   * Transfer funds between wallets
   * 
   * @param from - Sender wallet
   * @param to - Receiver wallet
   * @param amount - Amount to transfer
   * @param description - Transaction description
   * @returns Tuple of [updated sender, updated receiver]
   */
  static transfer(
    from: ZentixWallet,
    to: ZentixWallet,
    amount: number,
    description?: string
  ): [ZentixWallet, ZentixWallet] {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (from.balance < amount) throw new Error('Insufficient balance');

    const txId = randomBytes(8).toString('hex');
    const timestamp = new Date().toISOString();

    const sender = { ...from };
    sender.balance -= amount;
    sender.transactions.push({
      id: txId,
      type: 'transfer',
      amount,
      currency: 'ZXT',
      description: description || `Transfer to ${to.address}`,
      timestamp,
      from: from.address,
      to: to.address,
    });

    const receiver = { ...to };
    receiver.balance += amount;
    receiver.transactions.push({
      id: txId,
      type: 'transfer',
      amount,
      currency: 'ZXT',
      description: description || `Received from ${from.address}`,
      timestamp,
      from: from.address,
      to: to.address,
    });

    return [sender, receiver];
  }

  /**
   * Award reward to wallet (e.g., task completion, referral)
   * 
   * @param wallet - The wallet to reward
   * @param amount - Reward amount
   * @param reason - Reason for reward
   * @param metadata - Additional reward data
   * @returns Updated wallet
   */
  static reward(
    wallet: ZentixWallet,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): ZentixWallet {
    if (amount <= 0) throw new Error('Reward amount must be positive');

    const updated = { ...wallet };
    updated.balance += amount;
    updated.transactions.push({
      id: randomBytes(8).toString('hex'),
      type: 'reward',
      amount,
      currency: 'ZXT',
      description: reason,
      timestamp: new Date().toISOString(),
      to: wallet.address,
      metadata,
    });
    return updated;
  }

  /**
   * Get wallet summary
   * 
   * @param wallet - The wallet to summarize
   * @returns Wallet summary object
   */
  static getSummary(wallet: ZentixWallet) {
    const totalIncome = wallet.transactions
      .filter((tx) => tx.type === 'income' || tx.type === 'reward')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = wallet.transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalRewards = wallet.transactions
      .filter((tx) => tx.type === 'reward')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      address: wallet.address,
      balance: wallet.balance,
      total_transactions: wallet.transactions.length,
      total_income: totalIncome,
      total_expense: totalExpense,
      total_rewards: totalRewards,
      created_at: wallet.created_at,
      agent_did: wallet.agent_did,
    };
  }

  /**
   * Get transaction history
   * 
   * @param wallet - The wallet
   * @param limit - Maximum number of transactions (default: 10)
   * @returns Recent transactions
   */
  static getRecentTransactions(
    wallet: ZentixWallet,
    limit = 10
  ): Transaction[] {
    return wallet.transactions.slice(-limit).reverse();
  }

  /**
   * Validate wallet address format
   * 
   * @param address - Wallet address to validate
   * @returns true if valid
   */
  static isValidAddress(address: string): boolean {
    return /^ztw:0x[A-F0-9]{32}$/.test(address);
  }

  /**
   * Export wallet as JSON
   * 
   * @param wallet - The wallet to export
   * @returns JSON string
   */
  static export(wallet: ZentixWallet): string {
    return JSON.stringify(wallet, null, 2);
  }

  /**
   * Import wallet from JSON
   * 
   * @param jsonStr - JSON string
   * @returns Wallet object
   */
  static import(jsonStr: string): ZentixWallet {
    return JSON.parse(jsonStr) as ZentixWallet;
  }
}
