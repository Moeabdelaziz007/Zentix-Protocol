import { ethers, TransactionRequest } from 'ethers';
import * as dotenv from 'dotenv';

// Load environment variables from the root .env file
dotenv.config({ path: '../../.env' });

const RPC_MUMBAI = process.env.RPC_MUMBAI;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;

if (!RPC_MUMBAI || !RELAYER_PRIVATE_KEY) {
  // This is a critical error, so we throw it to stop the process if env is missing
  throw new Error("Missing RPC_MUMBAI or RELAYER_PRIVATE_KEY in environment variables.");
}

export class RelayerService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_MUMBAI);
    this.wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY!, this.provider);
  }

  /**
   * Retrieves the next nonce for the relayer's address.
   * @returns The next transaction count (nonce).
   */
  public async getNonce(): Promise<number> {
    try {
      // 'pending' ensures we get the latest nonce, including pending transactions
      const nonce = await this.provider.getTransactionCount(this.wallet.address, 'pending');
      this.log('Nonce retrieved successfully', { nonce, address: this.wallet.address });
      return nonce;
    } catch (error) {
      this.log('Error retrieving nonce', { error: (error as Error).message });
      throw new Error(`Failed to get nonce: ${(error as Error).message}`);
    }
  }

  /**
   * Relays a transaction to the Mumbai testnet.
   * @param tx The transaction request object.
   * @returns The transaction hash.
   */
  public async relayTransaction(tx: TransactionRequest): Promise<string> {
    try {
      // 1. Estimate Gas
      const gasLimit = await this.provider.estimateGas({
        ...tx,
        from: this.wallet.address,
      });
      this.log('Gas estimated successfully', { gasLimit: gasLimit.toString() });

      // 2. Get Nonce
      const nonce = await this.getNonce();

      // 3. Prepare the full transaction object
      const fullTx: TransactionRequest = {
        ...tx,
        from: this.wallet.address,
        nonce: nonce,
        gasLimit: gasLimit,
        // Ethers v6 handles gas price/fee data automatically (EIP-1559)
      };

      // 4. Sign and Send Transaction
      const txResponse = await this.wallet.sendTransaction(fullTx);

      this.log('Transaction relayed successfully', { hash: txResponse.hash });
      return txResponse.hash;
    } catch (error) {
      this.log('Error relaying transaction', { error: (error as Error).message, tx });
      throw new Error(`Failed to relay transaction: ${(error as Error).message}`);
    }
  }

  // Placeholder for internal structured logger
  private log(message: string, data: unknown = {}): void {
    // Internal structured logger implementation would go here
  }
}

export const relayerService = new RelayerService();
