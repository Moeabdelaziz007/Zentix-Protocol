/**
 * Zentix Blockchain Layer - Exports
 * IPFS storage and on-chain anchoring services
 * 
 * @module core/blockchain
 * @version 0.4.0
 */

export { IPFSService, type IPFSUploadResult } from './ipfsService';
export {
  BlockchainService,
  type BlockchainAnchorResult,
  type ContractAddresses,
} from './blockchainService';
