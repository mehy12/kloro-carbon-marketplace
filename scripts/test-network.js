import hardhat from "hardhat";
const hre = hardhat;
async function main() {
    console.log("\n🔍 Testing network connection...\n");

    try {
        // Test network connection
        const network = await hre.ethers.provider.getNetwork();
        console.log("✅ Connected to network:");
        console.log("   Chain ID:", network.chainId.toString());
        console.log("   Name:", network.name);

        // Get signer
        const [deployer] = await hre.ethers.getSigners();
        console.log("\n✅ Deployer address:", deployer.address);

        // Check balance
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("✅ Balance:", hre.ethers.formatEther(balance), "POL");

        // Get current gas price
        const feeData = await hre.ethers.provider.getFeeData();
        console.log("\n✅ Network fee data:");
        console.log("   Gas Price:", feeData.gasPrice ? hre.ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "N/A");

        console.log("\n✅ All checks passed! Network is ready for deployment.\n");

    } catch (error) {
        console.error("\n❌ Network test failed:");
        console.error(error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
