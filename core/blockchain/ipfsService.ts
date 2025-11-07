/**
 * IPFS Service - Decentralized Storage for Zentix
 * Stores agent DIDs, wallets, and event history on IPFS
 * 
 * @module ipfsService
 * @version 0.4.0
 */

import * as dotenv from 'dotenv';

dotenv.config();

/**
 * IPFS upload result
 */
export interface IPFSUploadResult {
  success: boolean;
  cid?: string;
  error?: string;
  timestamp: string;
  size?: number;
}

/**
 * IPFS Service using Pinata
 */
export class IPFSService {
  private static pinataApiKey = process.env.PINATA_API_KEY;
  private static pinataSecretKey = process.env.PINATA_SECRET_KEY;
  private static pinataBaseUrl = 'https://api.pinata.cloud';

  /**
   * Upload JSON data to IPFS via Pinata
   * 
   * @param data - JSON data to upload
   * @param name - Optional name for the pin
   * @returns Upload result with CID
   */
  static async uploadJSON(data: any, name?: string): Promise<IPFSUploadResult> {
    try {
      // Check if Pinata credentials are configured
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        console.warn('⚠️  Pinata credentials not configured, using mock IPFS');
        return this.mockIPFSUpload(data, name);
      }

      const body = JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: name || 'zentix-data',
          keyvalues: {
            protocol: 'zentix',
            version: '0.4.0',
          },
        },
      });

      const response = await fetch(`${this.pinataBaseUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`);
      }

      const result = await response.json() as { IpfsHash: string; PinSize: number };

      return {
        success: true,
        cid: result.IpfsHash,
        timestamp: new Date().toISOString(),
        size: result.PinSize,
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
   * Mock IPFS upload for development/testing
   * 
   * @private
   * @param data - Data to mock upload
   * @param name - Optional name
   * @returns Mock result
   */
  private static mockIPFSUpload(data: any, name?: string): IPFSUploadResult {
    const mockCID = this.generateMockCID(JSON.stringify(data));
    
    console.log(`📦 Mock IPFS Upload: ${name || 'unnamed'}`);
    console.log(`   CID: ${mockCID}`);
    
    return {
      success: true,
      cid: mockCID,
      timestamp: new Date().toISOString(),
      size: JSON.stringify(data).length,
    };
  }

  /**
   * Generate a mock IPFS CID for testing
   * 
   * @private
   * @param data - Data to hash
   * @returns Mock CID
   */
  private static generateMockCID(data: string): string {
    const hash = this.simpleHash(data);
    return `Qm${hash.substring(0, 44).toUpperCase()}`;
  }

  /**
   * Simple hash function for mock CID generation
   * 
   * @private
   * @param str - String to hash
   * @returns Hash string
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).padEnd(44, '0');
  }

  /**
   * Retrieve data from IPFS
   * 
   * @param cid - IPFS content identifier
   * @returns Retrieved data
   */
  static async retrieve(cid: string): Promise<any> {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      
      if (!response.ok) {
        throw new Error(`Failed to retrieve from IPFS: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`IPFS retrieval error: ${error}`);
    }
  }

  /**
   * Get IPFS gateway URL for a CID
   * 
   * @param cid - IPFS content identifier
   * @returns Gateway URL
   */
  static getGatewayUrl(cid: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  /**
   * Check if IPFS service is properly configured
   * 
   * @returns true if configured
   */
  static isConfigured(): boolean {
    return !!(this.pinataApiKey && this.pinataSecretKey);
  }
}
