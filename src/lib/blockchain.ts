import { ethers } from "ethers";
import CONTRACT_ABI from "../contracts/CarbonLedgerABI.json";

// Types for blockchain transaction
export interface BlockchainTransactionParams {
  buyer: string;
  seller: string;
  credits: number;
  projectId: string;
  registry: string;
  certificateUrl: string;
  priceUsd: number; // Price in USD cents to avoid decimals
}

export interface BlockchainConfig {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
}

interface ErrorWithMessage {
  message?: string;
}

interface ErrorWithCode {
  code?: string;
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as ErrorWithMessage).message ?? "Unknown error";
  }
  return "Unknown error";
}

function extractErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as ErrorWithCode).code;
  }
  return undefined;
}

class BlockchainService {
  private provider!: ethers.JsonRpcProvider;
  private wallet!: ethers.Wallet;
  private contract!: ethers.Contract;
  private isInitialized = false;

  constructor() {
    // Initialize will be called when first used
  }

  private initialize() {
    if (this.isInitialized) return;

    const config = this.getConfig();

    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.contract = new ethers.Contract(
      config.contractAddress,
      CONTRACT_ABI,
      this.wallet
    );

    this.isInitialized = true;
  }

  private getConfig(): BlockchainConfig {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      throw new Error(
        "Missing blockchain environment variables. Required: RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS"
      );
    }

    return { rpcUrl, privateKey, contractAddress };
  }

  /**
   * Record a carbon credit transaction on the blockchain
   */
  async recordTransaction(
    params: BlockchainTransactionParams
  ): Promise<string> {
    try {
      this.initialize();

      const {
        buyer,
        seller,
        credits,
        projectId,
        registry,
        certificateUrl,
        priceUsd,
      } = params;

      console.log("🔗 Recording transaction on blockchain...", {
        buyer: buyer.slice(0, 8) + "...",
        seller: seller.slice(0, 8) + "...",
        credits,
        projectId,
        registry,
      });

      // Call the smart contract function
      const tx = await this.contract.recordTransaction(
        buyer,
        seller,
        credits,
        projectId,
        registry,
        certificateUrl,
        priceUsd
      );

      console.log(
        "⏳ Transaction submitted, waiting for confirmation...",
        tx.hash
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log("✅ Transaction confirmed on blockchain:", tx.hash);
        return tx.hash;
      } else {
        throw new Error("Transaction failed on blockchain");
      }
    } catch (error: unknown) {
      console.error("❌ Blockchain transaction failed:", error);

      const code = extractErrorCode(error);
      const message = extractErrorMessage(error);

      if (code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient MATIC balance for gas fees");
      } else if (code === "NETWORK_ERROR") {
        throw new Error("Network connection failed. Please try again.");
      } else if (message.includes("revert")) {
        throw new Error("Smart contract rejected the transaction");
      }

      throw new Error(`Blockchain transaction failed: ${message}`);
    }
  }

  /**
   * Get a specific transaction from the blockchain
   */
  async getTransaction(index: number): Promise<{
    buyer: string;
    seller: string;
    credits: number;
    timestamp: number;
    projectId: string;
    registry: string;
    certificateUrl: string;
    priceUsd: number;
  }> {
    try {
      this.initialize();

      const tx = await this.contract.getTransaction(index);
      return {
        buyer: tx.buyer,
        seller: tx.seller,
        credits: Number(tx.credits),
        timestamp: Number(tx.timestamp),
        projectId: tx.projectId,
        registry: tx.registry,
        certificateUrl: tx.certificateUrl,
        priceUsd: Number(tx.priceUsd),
      };
    } catch (error: unknown) {
      console.error("❌ Failed to get transaction:", error);
      const message = extractErrorMessage(error);
      throw new Error(`Failed to retrieve transaction: ${message}`);
    }
  }

  /**
   * Get total transactions and credits from the blockchain
   */
  async getContractStats(): Promise<{
    totalTransactions: number;
    totalCredits: number;
  }> {
    try {
      this.initialize();

      const stats = await this.contract.getContractStats();
      return {
        totalTransactions: Number(stats.totalTx),
        totalCredits: Number(stats.totalCredits),
      };
    } catch (error: unknown) {
      console.error("❌ Failed to get contract stats:", error);
      const message = extractErrorMessage(error);
      throw new Error(`Failed to get contract statistics: ${message}`);
    }
  }

  /**
   * Get all transaction indices for a buyer
   */
  async getBuyerTransactions(buyerAddress: string): Promise<number[]> {
    try {
      this.initialize();

      const indices: Array<number | bigint> =
        await this.contract.getBuyerTransactions(buyerAddress);
      return indices.map((index) => Number(index));
    } catch (error: unknown) {
      console.error("❌ Failed to get buyer transactions:", error);
      const message = extractErrorMessage(error);
      throw new Error(`Failed to get buyer transactions: ${message}`);
    }
  }

  /**
   * Get all transaction indices for a seller
   */
  async getSellerTransactions(sellerAddress: string): Promise<number[]> {
    try {
      this.initialize();

      const indices: Array<number | bigint> =
        await this.contract.getSellerTransactions(sellerAddress);
      return indices.map((index) => Number(index));
    } catch (error: unknown) {
      console.error("❌ Failed to get seller transactions:", error);
      const message = extractErrorMessage(error);
      throw new Error(`Failed to get seller transactions: ${message}`);
    }
  }

  /**
   * Check if the blockchain service is properly configured
   */
  isConfigured(): boolean {
    try {
      this.getConfig();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the Polygon testnet explorer URL for a transaction hash
   */
  getExplorerUrl(txHash: string): string {
    return `https://mumbai.polygonscan.com/tx/${txHash}`;
  }

  /**
   * Get the Polygon testnet explorer URL for the contract
   */
  getContractExplorerUrl(): string {
    const config = this.getConfig();
    return `https://mumbai.polygonscan.com/address/${config.contractAddress}`;
  }
}

// Export a singleton instance
export const blockchainService = new BlockchainService();

/**
 * Convenience function to record a blockchain transaction
 */
export async function recordBlockchainTransaction(
  params: BlockchainTransactionParams
): Promise<string> {
  return blockchainService.recordTransaction(params);
}

/**
 * Check if blockchain integration is available
 */
export function isBlockchainEnabled(): boolean {
  return blockchainService.isConfigured();
}

/**
 * Get blockchain explorer URL for a transaction
 */
export function getBlockchainExplorerUrl(txHash: string): string {
  return blockchainService.getExplorerUrl(txHash);
}

// Default wallet addresses for development (these should be overridden in production)
export const DEFAULT_ADDRESSES = {
  // Demo: dead address default so tx is verifiable on-chain without a real wallet
  BUYER_WALLET: "0x000000000000000000000000000000000000dEaD",
  SELLER_WALLET: "0x000000000000000000000000000000000000dEaD",
} as const;

export const DEAD_ADDRESS =
  "0x000000000000000000000000000000000000dEaD" as const;
