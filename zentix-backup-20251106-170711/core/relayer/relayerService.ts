/**
 * Gasless Transaction Relayer
 * Allows users to interact with contracts without paying gas fees
 * 
 * @module relayerService
 * @version 0.6.0
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Relay request from user
 */
export interface RelayRequest {
  from: string;
  to: string;
  data: string;
  signature: string;
  nonce: number;
}

/**
 * Relay result
 */
export interface RelayResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: string;
}

/**
 * Gasless Transaction Relayer Service
 * Sponsors gas fees for users
 */
export class RelayerService {
  private provider: ethers.providers.JsonRpcProvider;
  private relayerWallet: ethers.Wallet;
  private nonces: Map<string, number> = new Map();
  private readonly MAX_GAS_PRICE = ethers.utils.parseUnits('100', 'gwei');
  private readonly MAX_GAS_LIMIT = 500000;

  constructor() {
    const rpcUrl = process.env.RPC_MUMBAI || 'https://rpc.ankr.com/polygon_mumbai';
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const privateKey = process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY_DEV;
    if (!privateKey) {
      throw new Error('Relayer private key not configured');
    }

    this.relayerWallet = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Relay a transaction on behalf of user
   * 
   * @param request - Relay request with signature
   * @returns Relay result
   */
  async relayTransaction(request: RelayRequest): Promise<RelayResult> {
    try {
      // Verify signature
      const isValid = await this.verifySignature(request);
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid signature',
        };
      }

      // Check nonce
      if (!this.verifyNonce(request.from, request.nonce)) {
        return {
          success: false,
          error: 'Invalid nonce',
        };
      }

      // Check gas price
      const gasPrice = await this.provider.getGasPrice();
      if (gasPrice.gt(this.MAX_GAS_PRICE)) {
        return {
          success: false,
          error: 'Gas price too high',
        };
      }

      // Send transaction
      const tx = await this.relayerWallet.sendTransaction({
        to: request.to,
        data: request.data,
        gasLimit: this.MAX_GAS_LIMIT,
        gasPrice,
      });

      console.log(`🚀 Relaying transaction: ${tx.hash}`);
      console.log(`   From: ${request.from}`);
      console.log(`   To: ${request.to}`);
      console.log(`   Gas: Sponsored by relayer`);

      // Wait for confirmation
      const receipt = await tx.wait();

      // Increment nonce
      this.incrementNonce(request.from);

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Verify user's signature
   * 
   * @private
   * @param request - Relay request
   * @returns true if valid
   */
  private async verifySignature(request: RelayRequest): Promise<boolean> {
    try {
      // Reconstruct message
      const message = ethers.utils.solidityKeccak256(
        ['address', 'address', 'bytes', 'uint256'],
        [request.from, request.to, request.data, request.nonce]
      );

      const messageHash = ethers.utils.arrayify(message);
      const recoveredAddress = ethers.utils.verifyMessage(
        messageHash,
        request.signature
      );

      return recoveredAddress.toLowerCase() === request.from.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Verify nonce is valid
   * 
   * @private
   * @param from - User address
   * @param nonce - Nonce value
   * @returns true if valid
   */
  private verifyNonce(from: string, nonce: number): boolean {
    const currentNonce = this.nonces.get(from) || 0;
    return nonce === currentNonce;
  }

  /**
   * Increment user's nonce
   * 
   * @private
   * @param from - User address
   */
  private incrementNonce(from: string): void {
    const currentNonce = this.nonces.get(from) || 0;
    this.nonces.set(from, currentNonce + 1);
  }

  /**
   * Get user's current nonce
   * 
   * @param address - User address
   * @returns Current nonce
   */
  getNonce(address: string): number {
    return this.nonces.get(address) || 0;
  }

  /**
   * Get relayer balance
   * 
   * @returns Balance in MATIC
   */
  async getBalance(): Promise<string> {
    const balance = await this.relayerWallet.getBalance();
    return ethers.utils.formatEther(balance);
  }

  /**
   * Check if relayer has enough balance
   * 
   * @param minBalance - Minimum balance required in MATIC
   * @returns true if sufficient
   */
  async hasSufficientBalance(minBalance: string = '0.1'): Promise<boolean> {
    const balance = await this.relayerWallet.getBalance();
    const minBalanceWei = ethers.utils.parseEther(minBalance);
    return balance.gte(minBalanceWei);
  }

  /**
   * Sign a message for gasless transaction
   * This is called by the client to create a signature
   * 
   * @param userWallet - User's wallet
   * @param to - Target contract
   * @param data - Transaction data
   * @param nonce - User's nonce
   * @returns Signature
   */
  static async signRelayRequest(
    userWallet: ethers.Wallet,
    to: string,
    data: string,
    nonce: number
  ): Promise<string> {
    const message = ethers.utils.solidityKeccak256(
      ['address', 'address', 'bytes', 'uint256'],
      [userWallet.address, to, data, nonce]
    );

    const messageHash = ethers.utils.arrayify(message);
    return await userWallet.signMessage(messageHash);
  }
}

/**
 * Helper function to create relay request
 */
export async function createRelayRequest(
  userWallet: ethers.Wallet,
  contractAddress: string,
  functionData: string,
  nonce: number
): Promise<RelayRequest> {
  const signature = await RelayerService.signRelayRequest(
    userWallet,
    contractAddress,
    functionData,
    nonce
  );

  return {
    from: userWallet.address,
    to: contractAddress,
    data: functionData,
    signature,
    nonce,
  };
}
