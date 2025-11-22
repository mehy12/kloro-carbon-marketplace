import hardhat from "hardhat";
const hre = hardhat;

async function main() {
    console.log("\n🚀 Starting deployment...\n");

    try {
        // Get signer
        const [deployer] = await hre.ethers.getSigners();
        console.log("Deploying from:", deployer.address);

        // Get balance
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("Balance:", hre.ethers.formatEther(balance), "POL\n");

        // Get factory
        console.log("Getting contract factory...");
        const Factory = await hre.ethers.getContractFactory("CarbonLedger");

        // Deploy
        console.log("Deploying contract...\n");
        const contract = await Factory.deploy();

        console.log("Waiting for deployment...\n");
        await contract.waitForDeployment();

        const address = await contract.getAddress();

        console.log("\n" + "=".repeat(60));
        console.log("✅ DEPLOYED!");
        console.log("=".repeat(60));
        console.log("\nContract Address:", address);
        console.log("\nExplorer:");
        console.log(`https://amoy.polygonscan.com/address/${address}`);
        console.log("\n" + "=".repeat(60));
        console.log("\nAdd to .env:");
        console.log(`CONTRACT_ADDRESS="${address}"`);
        console.log("=".repeat(60) + "\n");

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        console.error("\nStack:", error.stack);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
