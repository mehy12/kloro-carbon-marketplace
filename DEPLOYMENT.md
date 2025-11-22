# 🚀 Quick Deployment Guide

## Prerequisites Checklist

- [ ] Wallet created with private key
- [ ] Testnet tokens obtained (free from faucet)
- [ ] Private key added to `.env` file
- [ ] Network selected (Base Sepolia recommended)

## Step 1: Get Testnet Tokens (Free)

### Option A: Base Sepolia (Recommended)
1. Visit: https://www.alchemy.com/faucets/base-sepolia
2. Enter your wallet address
3. Receive free testnet ETH

### Option B: Polygon Amoy
1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Enter your wallet address
4. Receive free testnet MATIC

## Step 2: Configure Environment

Add to your `.env` file:

```env
# Your wallet private key (64 hex characters, no 0x prefix)
PRIVATE_KEY="your_private_key_here"

# Optional: Network-specific keys
BASE_SEPOLIA_PRIVATE_KEY="your_private_key_here"
AMOY_PRIVATE_KEY="your_private_key_here"
```

## Step 3: Deploy Contract

### Deploy to Base Sepolia (Recommended)
```bash
npx hardhat run scripts/deploy-ledger.js --network baseSepolia
```

### Deploy to Polygon Amoy
```bash
npx hardhat run scripts/deploy-ledger.js --network amoy
```

### Deploy to Polygon Mumbai (Legacy)
```bash
npx hardhat run scripts/deploy-ledger.js --network mumbai
```

## Step 4: Update .env with Contract Address

After deployment, add the contract address shown in the output:

```env
CONTRACT_ADDRESS="0x_your_deployed_contract_address"
RPC_URL="https://sepolia.base.org"  # or your network's RPC
```

## Step 5: Test Integration

```bash
node scripts/check-blockchain.js
```

## Troubleshooting

### "Insufficient funds"
- Get more testnet tokens from the faucet
- Wait a few minutes for tokens to arrive

### "Invalid private key"
- Ensure it's 64 hex characters
- Remove "0x" prefix if present
- No quotes or spaces

### "Network error"
- Check internet connection
- Try again in a few minutes
- Verify RPC URL is correct

## What Happens After Deployment?

✅ Every purchase transaction will be recorded on-chain  
✅ Users get blockchain explorer links for verification  
✅ Immutable proof of carbon credit transfers  
✅ Transparent transaction history  

## Security Reminders

⚠️ Never commit `.env` to git  
⚠️ Use a dedicated wallet for deployment  
⚠️ Keep your private key secure  
⚠️ For production, use hardware wallet or key management service  

## Need Help?

- Check the full guide: `implementation_plan.md`
- Review deployment script: `scripts/deploy-ledger.js`
- Test blockchain connection: `scripts/check-blockchain.js`
