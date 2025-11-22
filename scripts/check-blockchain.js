import { ethers } from "ethers";
import("dotenv").config();

// Configuration
const config = {
  RPC_URL: process.env.RPC_URL || 'https://sepolia.base.org',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
};

// Contract ABI (simplified)
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
    console.log('\n🔍 Checking Blockchain Status...\n');

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
      console.log('⚠️  CONTRACT_ADDRESS not set in .env file.\n');
    }

    // Check specific transaction hash if provided
    const txHash = process.argv[2];
    if (txHash && txHash.startsWith('0x')) {
      await checkTransaction(provider, txHash);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function checkContract(provider) {
  try {
    console.log('🏗️  Contract Analysis:');
    console.log(`   Address: ${config.CONTRACT_ADDRESS}`);

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

    console.log(`\n🔗 View on Explorer: https://sepolia.basescan.org/address/${config.CONTRACT_ADDRESS}\n`);

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
    console.log(`   Status: ${tx.blockNumber ? 'Confirmed' : 'Pending'}`);

    if (tx.blockNumber) {
      const receipt = await provider.getTransactionReceipt(txHash);
      console.log(`   Status: ${receipt.status ? 'Success' : 'Failed'}`);
    }

    console.log(`\n🔗 View on Explorer: https://sepolia.basescan.org/tx/${txHash}\n`);

  } catch (error) {
    console.log(`❌ Transaction check failed: ${error.message}\n`);
  }
}

// Run
checkBlockchain();