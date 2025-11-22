# Step 2: Add Private Key to .env File

Great! Your wallet is empty, so it's perfect for testnet deployment.

## Instructions

1. Open your `.env` file in the project root
2. Add these lines at the end:

```env
# Blockchain deployment configuration
PRIVATE_KEY="7d611933d257d05e34991ac2a7e29d0eeb835c1121c2afd8f1855af93fc70788"
RPC_URL="https://sepolia.base.org"
```

3. Save the file

## What This Does

- `PRIVATE_KEY`: Your wallet's private key (for signing transactions)
- `RPC_URL`: The Base Sepolia testnet endpoint

## Next Step

After adding these to your `.env` file, we'll:
1. Get your wallet address
2. Get free testnet tokens
3. Deploy the contract!

**Let me know when you've added these lines to your .env file!**
