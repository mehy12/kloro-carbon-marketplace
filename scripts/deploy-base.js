import hardhat from "hardhat";
const hre = hardhat;

async function main() {
    console.log("\n🚀 Deploying CarbonLedger to Base Sepolia...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("From:", deployer.address);

    const Factory = await hre.ethers.getContractFactory("CarbonLedger");

    // Deploy without explicit gas settings to let provider estimate
    const contract = await Factory.deploy();

    console.log("⏳ Waiting for confirmation...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("\n✅ DEPLOYED SUCCESSFULLY!");
    console.log("📍 Contract Address:", address);
    console.log("🔗 Explorer:", `https://sepolia.basescan.org/address/${address}`);

    console.log("\n📋 Add to .env:");
    console.log(`CONTRACT_ADDRESS="${address}"`);
}

main().then(() => process.exit(0)).catch((e) => {
    console.error("\n❌ Deployment failed:", e.message);
    process.exit(1);
});
