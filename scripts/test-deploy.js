import hardhat from "hardhat";
const hre = hardhat;

async function main() {
    console.log("\n🚀 Deploying TestDeploy (minimal contract)...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("From:", deployer.address);

    const Factory = await hre.ethers.getContractFactory("TestDeploy");
    console.log("Deploying...\n");

    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("✅ Deployed to:", address);
    console.log("\nIf this works, the full CarbonLedger should work too!\n");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
