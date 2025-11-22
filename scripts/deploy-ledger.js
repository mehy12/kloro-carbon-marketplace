import { ethers } from "hardhat";
import fs from "fs";

async function main() {
    const network = process.env.HARDHAT_NETWORK || "amoy";

    console.log(`\n🚀 Deploying CarbonLedger to ${network}...\n`);

    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log("📍 Address:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "POL\n");

    console.log("\n" + "=".repeat(70));
    console.log("✅ SUCCESS! Contract Deployed!");
    console.log("=".repeat(70));
    console.log("\n📍 CONTRACT ADDRESS:\n");
    console.log("   " + contractAddress + "\n");
    console.log("=".repeat(70));

    // Save to file
    const deploymentInfo = `CONTRACT_ADDRESS="${contractAddress}"
RPC_URL="https://rpc-amoy.polygon.technology"

# Deployed: ${new Date().toISOString()}
# Network: Polygon Amoy
# Explorer: https://amoy.polygonscan.com/address/${contractAddress}`;

    fs.writeFileSync("deployment-info.txt", deploymentInfo);
    console.log("\n💾 Saved to: deployment-info.txt");

    console.log("\n🔗 Explorer:");
    console.log(`   https://amoy.polygonscan.com/address/${contractAddress}`);

    // Test
    console.log("\n🧪 Testing...");
    const stats = await carbonLedger.getContractStats();
    console.log("   Transactions:", stats.totalTx.toString());
    console.log("   Credits:", stats.totalCredits.toString());

    console.log("\n" + "=".repeat(70));
    console.log("📋 ADD TO YOUR .env FILE:");
    console.log("=".repeat(70));
    console.log(`\nCONTRACT_ADDRESS="${contractAddress}"\n`);
    console.log("=".repeat(70) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error.message);
        console.error("\nFull error:", error);
        process.exit(1);
    });
