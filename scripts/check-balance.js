import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    const balance = await ethers.provider.getBalance(address);

    console.log("\n" + "=".repeat(60));
    console.log("Wallet Address:", address);
    console.log("Balance:", ethers.formatEther(balance), "POL");
    console.log("=".repeat(60) + "\n");

    if (balance === 0n) {
        console.log("❌ No balance! Get more tokens from:");
        console.log("   https://faucet.polygon.technology/\n");
    } else if (balance < ethers.parseEther("0.01")) {
        console.log("⚠️  Low balance! You might need more tokens.");
        console.log("   Get more from: https://faucet.polygon.technology/\n");
    } else {
        console.log("✅ Balance looks good for deployment!\n");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error.message);
        process.exit(1);
    });
