/**
 * Blockchain Service - On-chain Anchoring for Zentix
 * Integrates with ZXT Token and Zentix Registry contracts
 * 
 * @module blockchainService
 * @version 0.4.0
 */

import { ZentixDID } from '../identity/didService';
import { ZentixWallet } from '../economy/walletService';
import { IPFSService } from './ipfsService';
import { AnchorManager } from '../anchoring/anchorManager';

/**
 * Blockchain anchor result
 */
export interface BlockchainAnchorResult {
  success: boolean;
  ipfsCid?: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  timestamp: string;
}

/**
 * Contract addresses for different networks
 */
export interface ContractAddresses {
  zxtToken: string;
  zentixRegistry: string;
}

/**
 * Blockchain Service for on-chain operations
 */
export class BlockchainService {
  private static contracts: Record<string, ContractAddresses> = {
    mumbai: {
      zxtToken: process.env.ZXT_TOKEN_ADDRESS_MUMBAI || '',
      zentixRegistry: process.env.ANCHOR_REGISTRY_ADDRESS_MUMBAI || '',
    },
    polygon: {
      zxtToken: process.env.ZXT_TOKEN_ADDRESS_POLYGON || '',
      zentixRegistry: process.env.ANCHOR_REGISTRY_ADDRESS_POLYGON || '',
    },
  };

  /**
   * Anchor DID to blockchain via IPFS + on-chain registry
   * 
   * @param did - Zentix DID object
   * @param network - Blockchain network (mumbai/polygon)
   * @returns Anchor result
   */
  static async anchorDIDToBlockchain(
    did: ZentixDID,
    network: 'mumbai' | 'polygon' = 'mumbai'
  ): Promise<BlockchainAnchorResult> {
    try {
      // Step 1: Upload DID to IPFS
      console.log('📤 Uploading DID to IPFS...');
      const ipfsResult = await IPFSService.uploadJSON(did, `zentix-did-${did.did}`);

      if (!ipfsResult.success || !ipfsResult.cid) {
        throw new Error(ipfsResult.error || 'IPFS upload failed');
      }

      console.log(`✅ DID uploaded to IPFS: ${ipfsResult.cid}`);

      // Step 2: Anchor CID to blockchain (simulated for now)
      console.log('⚓ Anchoring to blockchain...');
      const blockchainResult = await this.simulateBlockchainAnchor(
        did.did,
        ipfsResult.cid,
        'did',
        network
      );

      // Step 3: Update local anchor manager
      const anchor = AnchorManager.anchorDID(did, network === 'mumbai' ? 'Polygon' : 'Polygon');
      
      return {
        success: true,
        ipfsCid: ipfsResult.cid,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Anchor wallet to blockchain
   * 
   * @param wallet - Zentix wallet object
   * @param network - Blockchain network
   * @returns Anchor result
   */
  static async anchorWalletToBlockchain(
    wallet: ZentixWallet,
    network: 'mumbai' | 'polygon' = 'mumbai'
  ): Promise<BlockchainAnchorResult> {
    try {
      // Upload wallet data to IPFS
      const ipfsResult = await IPFSService.uploadJSON(
        wallet,
        `zentix-wallet-${wallet.address}`
      );

      if (!ipfsResult.success || !ipfsResult.cid) {
        throw new Error(ipfsResult.error || 'IPFS upload failed');
      }

      // Anchor to blockchain
      const blockchainResult = await this.simulateBlockchainAnchor(
        wallet.agent_did || 'unknown',
        ipfsResult.cid,
        'wallet',
        network
      );

      return {
        success: true,
        ipfsCid: ipfsResult.cid,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Simulate blockchain transaction (mock for development)
   * In production, replace with actual ethers.js contract calls
   * 
   * @private
   * @param did - Agent DID
   * @param ipfsCid - IPFS content identifier
   * @param anchorType - Type of anchor
   * @param network - Network name
   * @returns Mock transaction result
   */
  private static async simulateBlockchainAnchor(
    did: string,
    ipfsCid: string,
    anchorType: string,
    network: string
  ): Promise<{ transactionHash: string; blockNumber: number }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const txHash = `0x${this.generateHash(did + ipfsCid + Date.now())}`;
    const blockNumber = Math.floor(Math.random() * 1000000) + 30000000;

    console.log(`✅ Anchored to ${network}:`);
    console.log(`   TX: ${txHash}`);
    console.log(`   Block: ${blockNumber}`);

    return {
      transactionHash: txHash,
      blockNumber,
    };
  }

  /**
   * Generate mock transaction hash
   * 
   * @private
   * @param data - Data to hash
   * @returns Hex hash
   */
  private static generateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * Get contract addresses for a network
   * 
   * @param network - Network name
   * @returns Contract addresses
   */
  static getContracts(network: 'mumbai' | 'polygon'): ContractAddresses {
    return this.contracts[network];
  }

  /**
   * Check if blockchain service is configured
   * 
   * @param network - Network to check
   * @returns true if configured
   */
  static isConfigured(network: 'mumbai' | 'polygon'): boolean {
    const contracts = this.contracts[network];
    return !!(contracts.zxtToken && contracts.zentixRegistry);
  }

  /**
   * Get blockchain explorer URL for transaction
   * 
   * @param txHash - Transaction hash
   * @param network - Network name
   * @returns Explorer URL
   */
  static getExplorerUrl(txHash: string, network: 'mumbai' | 'polygon'): string {
    if (network === 'mumbai') {
      return `https://mumbai.polygonscan.com/tx/${txHash}`;
    }
    return `https://polygonscan.com/tx/${txHash}`;
  }
}
