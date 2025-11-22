import hardhat from "hardhat";
const hre = hardhat;

async function main() {
    console.log("\n🔍 Testing Base Sepolia Connection...\n");

    try {
        // Test network connection
        const network = await hre.ethers.provider.getNetwork();
        console.log("✅ Connected to network:");
        console.log("   Chain ID:", network.chainId.toString());
        console.log("   Name:", network.name);

        if (network.chainId.toString() !== "84532") {
            console.log("\n⚠️ WARNING: You are NOT connected to Base Sepolia (Chain ID 84532)");
            console.log("   You are connected to Chain ID:", network.chainId.toString());
        } else {
            console.log("\n✅ Confirmed: Connected to Base Sepolia");
        }

        // Get signer
        const [deployer] = await hre.ethers.getSigners();
        console.log("\n✅ Deployer address:", deployer.address);

        // Check balance
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("✅ Balance:", hre.ethers.formatEther(balance), "ETH");

        if (balance === 0n) {
            console.log("\n❌ Error: Balance is 0 ETH. Please get tokens from faucet.");
        } else {
            console.log("\n✅ Balance is positive. Ready to deploy!");
        }

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
