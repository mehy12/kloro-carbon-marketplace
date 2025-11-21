import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying CarbonLedger contract to Polygon Mumbai...");

  // Get the contract factory
  const CarbonLedger = await ethers.getContractFactory("CarbonLedger");

  // Deploy the contract
  const carbonLedger = await CarbonLedger.deploy();

  // Wait for deployment to complete
  await carbonLedger.waitForDeployment();

  const contractAddress = await carbonLedger.getAddress();

  console.log("✅ CarbonLedger deployed to:", contractAddress);
  console.log("🔗 View on PolygonScan:", `https://mumbai.polygonscan.com/address/${contractAddress}`);

  // Test the contract
  console.log("\n🧪 Testing contract...");
  const stats = await carbonLedger.getContractStats();
  console.log("📊 Total transactions:", stats.totalTx.toString());
  console.log("🌱 Total credits traded:", stats.totalCredits.toString());

  console.log("\n📋 Next steps:");
  console.log("1. Add this to your .env file:");
  console.log(`   CONTRACT_ADDRESS="${contractAddress}"`);
  console.log("2. Test the integration:");
  console.log(`   CONTRACT_ADDRESS="${contractAddress}" node scripts/check-blockchain.js`);
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });