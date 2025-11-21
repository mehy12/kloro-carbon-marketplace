#!/usr/bin/env node

import { ethers } from "ethers";

// Configuration
const config = {
  RPC_URL: process.env.RPC_URL || 'https://endpoints.omniatech.io/v1/matic/mumbai/public',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  // You'll need to add the ABI when contract is compiled
};

// Contract ABI (simplified - you'll need the full ABI after compilation)
const CONTRACT_ABI = [
  "function getTotalTransactions() public view returns (uint256)",
  "function getContractStats() public view returns (uint256 totalTx, uint256 totalCredits)",
  "function getTransaction(uint256 index) public view returns (tuple(address buyer, address seller, uint256 credits, uint256 timestamp, string projectId, string registry, string certificateUrl, uint256 priceUsd))",
  "function getBuyerTransactions(address buyer) public view returns (uint256[] memory)",
  "function getSellerTransactions(address seller) public view returns (uint256[] memory)",
  "event TransactionRecorded(uint256 indexed transactionIndex, address indexed buyer, address indexed seller, uint256 credits, string projectId, string registry, string certificateUrl, uint256 priceUsd, uint256 timestamp)"
];

async function checkBlockchain() {
  try {
    console.log('🔍 Checking Polygon Mumbai Blockchain Status...\n');

    // Connect to network
    const provider = new ethers.JsonRpcProvider(config.RPC_URL);

    // Check network connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to: ${network.name} (Chain ID: ${network.chainId})`);

    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    console.log(`📦 Latest Block: ${blockNumber}\n`);

    // If contract address is provided, check contract status
    if (config.CONTRACT_ADDRESS) {
      await checkContract(provider);
    } else {
      console.log('⚠️  CONTRACT_ADDRESS not set. Set it in your .env to check contract status.\n');
      console.log('📖 To check a specific contract:');
      console.log('   CONTRACT_ADDRESS=0x... node scripts/check-blockchain.js\n');
    }

    // Check specific transaction hash if provided
    const txHash = process.argv[2];
    if (txHash && txHash.startsWith('0x')) {
      await checkTransaction(provider, txHash);
    }

    console.log('🔗 Useful Links:');
    console.log('   • Mumbai PolygonScan: https://mumbai.polygonscan.com/');
    console.log('   • Mumbai Faucet: https://faucet.polygon.technology/');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function checkContract(provider) {
  try {
    console.log('🏗️  Contract Analysis:');
    console.log(`   Contract Address: ${config.CONTRACT_ADDRESS}`);

    // Check if contract exists
    const code = await provider.getCode(config.CONTRACT_ADDRESS);
    if (code === '0x') {
      console.log('❌ Contract not found or not deployed at this address\n');
      return;
    }

    console.log('✅ Contract found and deployed');

    // Create contract instance
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Get contract stats
    const stats = await contract.getContractStats();
    console.log(`📊 Total Transactions: ${stats.totalTx}`);
    console.log(`🌱 Total Credits Traded: ${stats.totalCredits}`);

    // Get recent transactions
    if (stats.totalTx > 0) {
      console.log('\n📋 Recent Transactions:');
      const recentCount = Math.min(5, Number(stats.totalTx));

      for (let i = Number(stats.totalTx) - recentCount; i < Number(stats.totalTx); i++) {
        try {
          const tx = await contract.getTransaction(i);
          console.log(`   [${i}] ${tx.credits} credits: ${tx.buyer.slice(0, 8)}... → ${tx.seller.slice(0, 8)}...`);
          console.log(`       Project: ${tx.projectId} | Registry: ${tx.registry}`);
          console.log(`       Time: ${new Date(Number(tx.timestamp) * 1000).toLocaleString()}`);
        } catch (e) {
          console.log(`   [${i}] Error reading transaction: ${e.message}`);
        }
      }
    }

    console.log(`\n🔗 View on PolygonScan: https://mumbai.polygonscan.com/address/${config.CONTRACT_ADDRESS}\n`);

  } catch (error) {
    console.log(`❌ Contract check failed: ${error.message}\n`);
  }
}

async function checkTransaction(provider, txHash) {
  try {
    console.log(`🔍 Checking Transaction: ${txHash}`);

    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.log('❌ Transaction not found\n');
      return;
    }

    console.log(`✅ Transaction found:`);
    console.log(`   Block: ${tx.blockNumber}`);
    console.log(`   From: ${tx.from}`);
    console.log(`   To: ${tx.to}`);
    console.log(`   Gas Used: ${tx.gasLimit}`);
    console.log(`   Status: ${tx.blockNumber ? 'Confirmed' : 'Pending'}`);

    // Get receipt for more details
    if (tx.blockNumber) {
      const receipt = await provider.getTransactionReceipt(txHash);
      console.log(`   Gas Used: ${receipt.gasUsed}/${tx.gasLimit}`);
      console.log(`   Status: ${receipt.status ? 'Success' : 'Failed'}`);
    }

    console.log(`\n🔗 View on PolygonScan: https://mumbai.polygonscan.com/tx/${txHash}\n`);

  } catch (error) {
    console.log(`❌ Transaction check failed: ${error.message}\n`);
  }
}

// Usage help
function showUsage() {
  console.log(`
🔍 Kloro Blockchain Checker

Usage:
  node scripts/check-blockchain.js                    # Check network status
  node scripts/check-blockchain.js 0x123...           # Check specific transaction
  CONTRACT_ADDRESS=0x123... node scripts/check-blockchain.js  # Check contract

Environment Variables:
  RPC_URL           - Polygon RPC endpoint (default: public Mumbai RPC)
  CONTRACT_ADDRESS  - Your deployed CarbonLedger contract address

Examples:
  # Basic network check
  node scripts/check-blockchain.js

  # Check with contract
  CONTRACT_ADDRESS=0xABCD... node scripts/check-blockchain.js

  # Check specific transaction
  node scripts/check-blockchain.js 0x1234567890abcdef...
`);
}

// Run if called directly
if (require.main === module) {
  if (process.argv[2] === '--help' || process.argv[2] === '-h') {
    showUsage();
  } else {
    checkBlockchain();
  }
}