# 🔄 Switch to Base Sepolia

You have ETH, so we need to deploy to **Base Sepolia**!

## Update Your .env File

Open your `.env` file and change `RPC_URL` back to:

```env
RPC_URL="https://sepolia.base.org"
```

## Deploy to Base Sepolia

Run this command:

```bash
npx hardhat run scripts/deploy-ledger.js --network baseSepolia
```

## Why This Will Work
- You have ETH on Base Sepolia
- The contract works exactly the same
- Gas fees are paid in ETH

## Ready?

1. Update `.env`
2. Run the deployment command above!
