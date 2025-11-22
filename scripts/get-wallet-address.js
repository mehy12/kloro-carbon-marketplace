import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();

    console.log("\n" + "=".repeat(70));
    console.log("📍 YOUR WALLET ADDRESS (Copy this!)");
    console.log("=".repeat(70));
    console.log("\n" + address + "\n");
    console.log("=".repeat(70));
    console.log("\n💰 STEP 3: Get Free Testnet Tokens");
    console.log("=".repeat(70));
    console.log("\n🔗 Visit: https://www.alchemy.com/faucets/base-sepolia");
    console.log("\n📋 Instructions:");
    console.log("   1. Click the link above (or copy/paste in browser)");
    console.log("   2. Paste your wallet address: " + address);
    console.log("   3. Complete any verification (captcha, login, etc.)");
    console.log("   4. Click 'Send Me ETH' or similar button");
    console.log("   5. Wait 1-2 minutes for tokens to arrive");
    console.log("\n💡 You'll receive ~0.1 testnet ETH (free, worthless tokens)");
    console.log("\n" + "=".repeat(70));
    console.log("\n✅ After you get the tokens, let me know and we'll deploy!");
    console.log("\n" + "=".repeat(70) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
