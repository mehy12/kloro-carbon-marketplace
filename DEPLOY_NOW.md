# 🚀 Step 4: Deploy to Polygon Amoy

Great! Your tokens are on the way (usually arrives in 1-2 minutes).

## Update Your .env File

Open your `.env` file and **update** the `RPC_URL` line to:

```env
RPC_URL="https://rpc-amoy.polygon.technology"
```

Your `.env` should now have:
```env
PRIVATE_KEY="7d611933d257d05e34991ac2a7e29d0eeb835c1121c2afd8f1855af93fc70788"
RPC_URL="https://rpc-amoy.polygon.technology"
```

## Wait for Tokens (1-2 minutes)

While waiting, you can check if tokens arrived:

### Option 1: Check in MetaMask
1. Open MetaMask
2. Switch network to "Polygon Amoy"
3. You should see ~0.5 POL

### Option 2: Check on Explorer
Visit: https://amoy.polygonscan.com/address/YOUR_WALLET_ADDRESS

## Deploy the Contract!

Once you have tokens (wait 1-2 minutes), run:

```bash
npx hardhat run scripts/deploy-ledger.js --network amoy
```

This will:
1. ✅ Deploy your CarbonLedger smart contract
2. ✅ Show you the contract address
3. ✅ Provide a blockchain explorer link
4. ✅ Test the contract automatically

## What to Expect

You'll see output like:
```
🚀 Deploying CarbonLedger contract to amoy...
📍 Deploying from address: 0x...
💰 Account balance: 0.5 POL

📝 Deploying contract...

✅ CarbonLedger deployed successfully!
📍 Contract address: 0x1234567890abcdef...
🔗 View on explorer: https://amoy.polygonscan.com/address/0x...

🧪 Testing contract...
📊 Total transactions: 0
🌱 Total credits traded: 0
```

## After Deployment

Copy the contract address and add it to your `.env`:
```env
CONTRACT_ADDRESS="0x_your_deployed_contract_address"
```

## Ready?

1. ✅ Update RPC_URL in .env
2. ⏳ Wait 1-2 minutes for tokens
3. 🚀 Run the deployment command

Let me know when you're ready to deploy!
