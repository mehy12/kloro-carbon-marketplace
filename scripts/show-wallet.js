import { ethers } from "ethers";

const privateKey = "7d611933d257d05e34991ac2a7e29d0eeb835c1121c2afd8f1855af93fc70788";
const wallet = new ethers.Wallet(privateKey);

console.log("\n" + "=".repeat(70));
console.log("Your Wallet Address:");
console.log("=".repeat(70));
console.log("\n" + wallet.address + "\n");
console.log("=".repeat(70));
console.log("\nCheck for deployed contracts at:");
console.log(`https://amoy.polygonscan.com/address/${wallet.address}`);
console.log("\nLook for 'Contract Creation' transactions");
console.log("=".repeat(70) + "\n");
