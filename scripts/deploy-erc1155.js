const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CarbonCredit1155 to Base Sepolia...");

  let [first] = await ethers.getSigners();
  let deployer = first;
  if (!deployer && process.env.PRIVATE_KEY) {
    const { ethers: E } = require("hardhat");
    deployer = new E.Wallet(process.env.PRIVATE_KEY, E.provider);
  }
  if (!deployer) throw new Error("No signer available. Set PRIVATE_KEY in .env when using localhost/Ganache.");
  console.log("Deployer:", await deployer.getAddress());

  const baseURI = process.env.ERC1155_BASE_URI || "https://example.com/metadata/{id}.json";

  const Factory = await ethers.getContractFactory("CarbonCredit1155");
  const contract = await Factory.deploy(baseURI);
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log("✅ Deployed CarbonCredit1155:", addr);
  console.log("🔗 Explorer:", `https://sepolia.basescan.org/address/${addr}`);

  console.log("\nNext steps:");
  console.log(`1) Set in .env: ERC1155_CONTRACT_ADDRESS="${addr}"`);
  console.log("2) (Optional) Grant roles to backend signer if different from deployer:");
  console.log("   - ADMIN_ROLE, MINTER_ROLE, BURNER_ROLE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
