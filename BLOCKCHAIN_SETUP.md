# 🔗 Blockchain Integration Setup Guide

This guide will help you deploy and configure the blockchain integration layer for Kloro's carbon credit marketplace.

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- A Polygon Mumbai testnet wallet with MATIC tokens
- An Alchemy or other RPC provider account (recommended)
- Basic understanding of smart contracts and blockchain

## 🚀 Quick Setup

### 1. **Get Polygon Mumbai Testnet MATIC**

You need MATIC tokens for gas fees on Polygon Mumbai testnet:
- Visit: https://faucet.polygon.technology/
- Connect your wallet and request testnet MATIC
- Wait for confirmation (usually 1-2 minutes)

### 2. **Get RPC URL (Recommended: Alchemy)**

For reliable blockchain access:
- Sign up at: https://alchemy.com
- Create a new app for "Polygon Mumbai"
- Copy the HTTP URL (looks like: `https://polygon-mumbai.g.alchemy.com/v2/API_KEY`)

**Alternative free RPC URLs:**
```
https://rpc-mumbai.maticvigil.com/
https://polygon-testnet.public.blastapi.io
https://endpoints.omniatech.io/v1/matic/mumbai/public
```

### 3. **Deploy Smart Contract**

#### Option A: Using Remix (Recommended for beginners)
1. Go to https://remix.ethereum.org
2. Create a new file: `CarbonLedger.sol`
3. Copy the contract from `contracts/CarbonLedger.sol`
4. Compile with Solidity 0.8.20
5. Connect MetaMask to Polygon Mumbai
6. Deploy the contract
7. Save the deployed contract address

#### Option B: Using Hardhat (Advanced)
```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init

# Deploy script
npx hardhat run scripts/deploy.js --network mumbai
```

### 4. **Configure Environment Variables**

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Blockchain Configuration
RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY"
PRIVATE_KEY="your_wallet_private_key_without_0x"
CONTRACT_ADDRESS="0xYourDeployedContractAddress"

# Wallet addresses for transactions
BUYER_WALLET="0xYourBuyerWalletAddress"
SELLER_WALLET="0xYourSellerWalletAddress"
```

**⚠️ Security Note:** Never commit your private keys to version control!

### 5. **Update Database Schema**

Apply the blockchain fields to your database:
```bash
npm run db:push
```

### 6. **Test the Integration**

⚠️ **Important**: Public RPC endpoints may have rate limits. For best results:
1. Use Alchemy or Infura for RPC URL
2. Or test with a deployed contract

Run the blockchain checker script:
```bash
# With Alchemy RPC URL set in environment
RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY" node scripts/check-blockchain.js
```

Expected output:
```
✅ Connected to: matic (Chain ID: 80001)
📦 Latest Block: 45234567
⚠️  CONTRACT_ADDRESS not set. Set it in your .env to check contract status.
```

With contract configured:
```bash
CONTRACT_ADDRESS=0xYourAddress node scripts/check-blockchain.js
```

Expected output:
```
✅ Connected to: matic (Chain ID: 80001)
📦 Latest Block: 45234567
🏗️ Contract Analysis:
   Contract Address: 0xYourAddress
✅ Contract found and deployed
📊 Total Transactions: 0
🌱 Total Credits Traded: 0
```

## 🔧 Advanced Configuration

### Custom Network Configuration

For production or custom networks, update the blockchain service:

```typescript
// src/lib/blockchain.ts
const config = {
  rpcUrl: process.env.RPC_URL || "https://polygon-rpc.com/",
  privateKey: process.env.PRIVATE_KEY,
  contractAddress: process.env.CONTRACT_ADDRESS,
};
```

### Gas Optimization

Adjust gas settings for your network:

```typescript
// In blockchain service
const tx = await contract.recordTransaction(...args, {
  gasLimit: 300000,
  gasPrice: ethers.parseUnits('30', 'gwei')
});
```

### Multi-Network Support

Configure different networks:

```typescript
const networks = {
  mumbai: {
    rpc: "https://rpc-mumbai.maticvigil.com/",
    chainId: 80001,
    explorer: "https://mumbai.polygonscan.com/"
  },
  polygon: {
    rpc: "https://polygon-rpc.com/",
    chainId: 137,
    explorer: "https://polygonscan.com/"
  }
};
```

## 📊 Testing Your Setup

### 1. **Test Network Connection**
```bash
node scripts/check-blockchain.js
```

### 2. **Test Contract Interaction**
```bash
# Set your contract address
export CONTRACT_ADDRESS="0xYourContractAddress"
node scripts/check-blockchain.js
```

### 3. **Test Transaction Recording**
- Make a purchase through the UI
- Check the transaction has `blockchainTxHash` in database
- Verify on PolygonScan using the hash

### 4. **Test Certificate Generation**
- Download a certificate
- Verify it includes blockchain information
- Check the PolygonScan link works

## 🐛 Troubleshooting

### Common Issues

**Issue:** "Insufficient MATIC balance for gas fees"
**Solution:** Get more MATIC from the faucet or check wallet balance

**Issue:** "Network connection failed"
**Solution:** Try alternative RPC URLs or check internet connection

**Issue:** "Contract not found"
**Solution:** Verify contract address and network (should be Mumbai testnet)

**Issue:** "Transaction failed"
**Solution:** Check gas fees, contract permissions, and wallet balance

### Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
DEBUG=true
```

### RPC Provider Issues

If Alchemy fails, try these alternatives:
```env
# Public RPCs (may be slower)
RPC_URL="https://rpc-mumbai.maticvigil.com/"
RPC_URL="https://polygon-testnet.public.blastapi.io"
```

## 🚀 Production Deployment

### Security Checklist

- [ ] Use environment variables for all sensitive data
- [ ] Never commit private keys to version control
- [ ] Use a dedicated wallet for the application
- [ ] Set up monitoring for blockchain transactions
- [ ] Test with small amounts first
- [ ] Implement transaction retry logic
- [ ] Set up alerts for failed transactions

### Mainnet Migration

To migrate to Polygon Mainnet:

1. Update RPC URL to Polygon mainnet
2. Deploy contract to Polygon mainnet
3. Update `CONTRACT_ADDRESS`
4. Get real MATIC tokens
5. Update explorer URLs to polygonscan.com

```env
# Polygon Mainnet
RPC_URL="https://polygon-rpc.com/"
CONTRACT_ADDRESS="0xYourMainnetContractAddress"
```

## 📚 Resources

- **Polygon Docs**: https://docs.polygon.technology/
- **PolygonScan Mumbai**: https://mumbai.polygonscan.com/
- **Faucet**: https://faucet.polygon.technology/
- **Alchemy**: https://alchemy.com/
- **Ethers.js Docs**: https://docs.ethers.org/

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Run the blockchain checker script for diagnostics
3. Check PolygonScan for transaction details
4. Review the console logs for error messages

## 🎯 Next Steps

Once blockchain integration is working:

1. Test the full purchase flow
2. Verify certificates include blockchain data
3. Monitor transaction gas costs
4. Set up monitoring and alerts
5. Consider implementing transaction retry logic
6. Plan for mainnet deployment