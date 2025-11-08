/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */

/**
 * Zentix Sentinel Multi-Agent System (ZSMAS) Living Asset Service
 * Manages iNFTs that represent AI-managed assets
 */

import { AgentLogger, LogLevel } from '../../utils/agentLogger';
import { WalletService, ZentixWallet } from '../../economy/walletService';
import type { ZSMASVault } from './types';

/**
 * Living Asset Service Class
 */
export class LivingAssetService {
  private static instance: LivingAssetService;
  private ipfsGateway: string = 'https://ipfs.io/ipfs/';

  private constructor() {
    AgentLogger.log(LogLevel.INFO, 'LivingAssetService', 'initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): LivingAssetService {
    if (!LivingAssetService.instance) {
      LivingAssetService.instance = new LivingAssetService();
    }
    return LivingAssetService.instance;
  }

  /**
   * Create a Living Asset iNFT for a user's ZSMAS vault
   */
  async createLivingAsset(
    userDid: string,
    vault: ZSMASVault,
    wallet: ZentixWallet
  ): Promise<{
    success: boolean;
    tokenId?: string;
    transactionHash?: string;
    error?: string;
  }> {
    return AgentLogger.measurePerformance(
      'LivingAssetService',
      'create_living_asset',
      async () => {
        AgentLogger.log(LogLevel.INFO, 'LivingAssetService', 'creating_living_asset', { 
          userDid,
          vaultId: vault.id
        });

        try {
          // Generate metadata for the living asset
          const metadata = await this.generateLivingAssetMetadata(vault);
          
          // Upload metadata to IPFS
          const ipfsUri = await this.uploadToIPFS(metadata);
          
          // In a real implementation, this would interact with the LivingAssetNFT contract
          // For this demo, we'll simulate the contract interaction
          const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
          
          AgentLogger.log(LogLevel.SUCCESS, 'LivingAssetService', 'living_asset_created', { 
            tokenId,
            userDid,
            transactionHash
          });
          
          return {
            success: true,
            tokenId,
            transactionHash
          };
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'LivingAssetService', 'creation_failed', { 
            userDid,
            error: error instanceof Error ? error.message : String(error)
          });
          
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    );
  }

  /**
   * Update a Living Asset iNFT with new vault data
   */
  async updateLivingAsset(
    tokenId: string,
    vault: ZSMASVault
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    return AgentLogger.measurePerformance(
      'LivingAssetService',
      'update_living_asset',
      async () => {
        AgentLogger.log(LogLevel.INFO, 'LivingAssetService', 'updating_living_asset', { 
          tokenId,
          vaultId: vault.id
        });

        try {
          // Generate updated metadata
          const metadata = await this.generateLivingAssetMetadata(vault);
          
          // Upload updated metadata to IPFS
          const ipfsUri = await this.uploadToIPFS(metadata);
          
          // In a real implementation, this would interact with the LivingAssetNFT contract
          // For this demo, we'll simulate the contract interaction
          const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
          
          AgentLogger.log(LogLevel.SUCCESS, 'LivingAssetService', 'living_asset_updated', { 
            tokenId,
            transactionHash
          });
          
          return {
            success: true,
            transactionHash
          };
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'LivingAssetService', 'update_failed', { 
            tokenId,
            error: error instanceof Error ? error.message : String(error)
          });
          
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    );
  }

  /**
   * Generate metadata for a Living Asset
   */
  private async generateLivingAssetMetadata(vault: ZSMASVault): Promise<any> {
    // Calculate performance metrics
    const performance = await this.calculatePerformanceMetrics(vault);
    
    // Get latest asset allocation
    const allocation = vault.asset_allocation;
    
    // Create metadata object
    const metadata = {
      name: `Zentix Living Asset - ${vault.user_did.substring(0, 10)}...`,
      description: `AI-managed DeFi portfolio with dynamic performance`,
      image: `${this.ipfsGateway}QmZ4tDuvesekSs1wz3ChSqN8HEqRhYlMxD4H6XuuDZ6X39`, // Placeholder IPFS image
      attributes: [
        {
          trait_type: "Total Value",
          value: vault.total_value,
          display_type: "number"
        },
        {
          trait_type: "Risk Level",
          value: vault.risk_level,
          display_type: "number"
        },
        {
          trait_type: "30-Day Performance",
          value: performance.thirtyDayReturn,
          display_type: "boost_percentage"
        },
        {
          trait_type: "Strategy",
          value: performance.strategyName || "Dynamic Allocation"
        },
        {
          trait_type: "Assets",
          value: Object.keys(allocation).join(", ")
        },
        {
          trait_type: "Last Updated",
          value: vault.updated_at,
          display_type: "date"
        }
      ],
      // Dynamic properties that update with the vault
      current_allocation: allocation,
      risk_score: vault.risk_level,
      thirty_day_performance: performance.thirtyDayReturn,
      total_value: vault.total_value,
      strategy_name: performance.strategyName || "Dynamic Allocation",
      last_updated: vault.updated_at
    };
    
    return metadata;
  }

  /**
   * Calculate performance metrics for a vault
   */
  private async calculatePerformanceMetrics(vault: ZSMASVault): Promise<{
    thirtyDayReturn: number;
    strategyName?: string;
  }> {
    // Calculate 30-day return from performance history
    if (vault.performance_history.length === 0) {
      return {
        thirtyDayReturn: 0
      };
    }
    
    // Get performance records from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPerformance = vault.performance_history.filter(
      record => new Date(record.timestamp) > thirtyDaysAgo
    );
    
    if (recentPerformance.length === 0) {
      return {
        thirtyDayReturn: 0
      };
    }
    
    // Calculate total return over the period
    const startValue = recentPerformance[0].value;
    const endValue = recentPerformance[recentPerformance.length - 1].value;
    const thirtyDayReturn = ((endValue - startValue) / startValue) * 100;
    
    // Get strategy name from the latest performance record
    const latestRecord = recentPerformance[recentPerformance.length - 1];
    const strategyName = latestRecord.strategy_id ? 
      `Strategy-${latestRecord.strategy_id.substring(0, 8)}` : undefined;
    
    return {
      thirtyDayReturn,
      strategyName
    };
  }

  /**
   * Upload metadata to IPFS (simulated)
   */
  private async uploadToIPFS(metadata: any): Promise<string> {
    // In a real implementation, this would upload to IPFS
    // For this demo, we'll return a mock IPFS URI
    const cid = `Qm${Math.random().toString(36).substr(2, 44)}`;
    const uri = `${this.ipfsGateway}${cid}`;
    
    AgentLogger.log(LogLevel.DEBUG, 'LivingAssetService', 'metadata_uploaded_to_ipfs', { 
      cid,
      uri
    });
    
    return uri;
  }

  /**
   * Get Living Asset data
   */
  async getLivingAsset(tokenId: string): Promise<any> {
    // In a real implementation, this would fetch from the contract and IPFS
    // For this demo, we'll return mock data
    return {
      tokenId,
      name: "Zentix Living Asset",
      description: "AI-managed DeFi portfolio",
      value: 10000,
      risk: 65,
      performance: 12.5
    };
  }

  /**
   * Transfer Living Asset to new owner
   */
  async transferLivingAsset(
    tokenId: string,
    from: string,
    to: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    return AgentLogger.measurePerformance(
      'LivingAssetService',
      'transfer_living_asset',
      async () => {
        AgentLogger.log(LogLevel.INFO, 'LivingAssetService', 'transferring_living_asset', { 
          tokenId,
          from,
          to
        });

        try {
          // In a real implementation, this would interact with the LivingAssetNFT contract
          // For this demo, we'll simulate the contract interaction
          const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
          
          AgentLogger.log(LogLevel.SUCCESS, 'LivingAssetService', 'living_asset_transferred', { 
            tokenId,
            from,
            to,
            transactionHash
          });
          
          return {
            success: true,
            transactionHash
          };
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'LivingAssetService', 'transfer_failed', { 
            tokenId,
            from,
            to,
            error: error instanceof Error ? error.message : String(error)
          });
          
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    );
  }
}