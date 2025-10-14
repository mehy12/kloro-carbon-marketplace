# 🚀 Quick Blockchain Deployment Guide

## 📋 What You Need

1. **MetaMask wallet** with Polygon Mumbai testnet configured
2. **MATIC tokens** from the faucet: https://faucet.polygon.technology/
3. **RPC URL** (get free one from Alchemy: https://alchemy.com)

## ⚡ Option 1: Deploy with Remix (Easiest)

### Step 1: Open Remix
- Go to: https://remix.ethereum.org
- Create new file: `CarbonLedger.sol`
- Copy the entire contract from `contracts/CarbonLedger.sol`

### Step 2: Compile
- Go to "Solidity Compiler" tab
- Select Solidity version: 0.8.20
- Click "Compile CarbonLedger.sol"

### Step 3: Deploy
- Go to "Deploy & Run Transactions" tab
- Set Environment to "Injected Provider - MetaMask"
- Make sure MetaMask is connected to Polygon Mumbai
- Select "CarbonLedger" contract
- Click "Deploy"
- Confirm transaction in MetaMask
- **Save the contract address!**

## ⚡ Option 2: Deploy with Hardhat (Advanced)

### Step 1: Set up environment
Create `.env.local` file:
```env
RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY"
PRIVATE_KEY="your_wallet_private_key_without_0x"
```

### Step 2: Deploy
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

## 🔧 Step 3: Configure Kloro

After deployment, add to your `.env.local`:
```env
CONTRACT_ADDRESS="0xYourContractAddressHere"
RPC_URL="https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY"
PRIVATE_KEY="your_wallet_private_key"
```

## 🧪 Step 4: Test Integration

```bash
# Test blockchain connection
CONTRACT_ADDRESS="0xYourAddress" node scripts/check-blockchain.js

# Update database schema
npm run db:push

# Start the app
npm run dev
```

## ✅ Verification

After deployment:
1. **Check PolygonScan**: Verify your contract is live
2. **Test a purchase**: Make a purchase in the app
3. **Check certificate**: Download should show blockchain verification
4. **View transactions**: Dashboard should show blockchain badges

## 🎯 Expected Result

Once deployed and configured:
- ✅ All purchases will be recorded on blockchain
- ✅ Certificates will include blockchain verification
- ✅ Dashboards will show "Blockchain Verified" badges
- ✅ PolygonScan links will work for transaction verification

---

**Need help?** Check the full guide: `BLOCKCHAIN_SETUP.md`