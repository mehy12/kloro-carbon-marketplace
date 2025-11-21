import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();
// Normalize private keys: accept with or without 0x, validate 32-byte (64 hex)
const normalizePk = (pk) => {
  if (!pk) return undefined;
  const with0x = pk.startsWith("0x") ? pk : `0x${pk}`;
  return /^0x[0-9a-fA-F]{64}$/.test(with0x) ? with0x : undefined;
};

// Private keys for different networks
const PKS = {
  mumbai: normalizePk(process.env.MUMBAI_PRIVATE_KEY || process.env.PRIVATE_KEY),
  amoy: normalizePk(process.env.AMOY_PRIVATE_KEY || process.env.PRIVATE_KEY),
  baseSepolia: normalizePk(process.env.BASE_SEPOLIA_PRIVATE_KEY || process.env.PRIVATE_KEY),
  ganache: normalizePk(process.env.PRIVATE_KEY), // for local node
};

for (const [net, raw] of Object.entries({
  mumbai: process.env.MUMBAI_PRIVATE_KEY,
  amoy: process.env.AMOY_PRIVATE_KEY,
  baseSepolia: process.env.BASE_SEPOLIA_PRIVATE_KEY,
})) {
  if (raw && !PKS[net]) {
    console.warn(`[hardhat] Invalid ${net.toUpperCase()}_PRIVATE_KEY. Expected 0x + 64 hex chars.`);
  }
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // Hardhat in-process node
    hardhat: {
      chainId: 31337,
    },

    // Ganache / local
    ganache: {
      url: process.env.RPC_URL || "http://127.0.0.1:8545",
      accounts: PKS.ganache ? [PKS.ganache] : [],
      chainId: 31337, // ⚡ must match local node
    },

    // Mumbai testnet (legacy)
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: PKS.mumbai ? [PKS.mumbai] : [],
      chainId: 80001,
    },

    // Amoy testnet (Polygon's current testnet)
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: PKS.amoy ? [PKS.amoy] : [],
      chainId: 80002,
    },

    // Base Sepolia
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: PKS.baseSepolia ? [PKS.baseSepolia] : [],
      chainId: 84532,
    },
  },

  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};
