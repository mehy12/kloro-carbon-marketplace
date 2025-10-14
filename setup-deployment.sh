#!/bin/bash

echo "🚀 Kloro Blockchain Deployment Setup"
echo "==================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

echo "⚠️  IMPORTANT: You need to provide:"
echo "1. RPC URL (get free one from https://alchemy.com)"
echo "2. Your wallet's private key (keep it secret!)"
echo "3. Make sure you have MATIC tokens from https://faucet.polygon.technology/"
echo ""

# Function to safely add to .env
add_to_env() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env; then
        # Update existing
        sed -i '' "s|^${key}=.*|${key}=\"${value}\"|" .env
    else
        # Add new
        echo "${key}=\"${value}\"" >> .env
    fi
}

echo "🔗 Let's set up your RPC URL:"
echo "   Option 1: Get free Alchemy URL: https://alchemy.com"
echo "   Option 2: Use public RPC (may be slower)"
echo ""
read -p "Enter your RPC URL (or press Enter for public RPC): " rpc_url

if [ -z "$rpc_url" ]; then
    rpc_url="https://polygon-testnet.public.blastapi.io"
    echo "   Using public RPC: $rpc_url"
fi

add_to_env "RPC_URL" "$rpc_url"

echo ""
echo "🔑 Private Key Setup:"
echo "   ⚠️  NEVER share your private key with anyone!"
echo "   📱 You can find it in MetaMask: Settings > Security & Privacy > Reveal Private Key"
echo ""
read -s -p "Enter your wallet's private key (without 0x): " private_key
echo ""

if [ -z "$private_key" ]; then
    echo "❌ Private key is required for deployment"
    exit 1
fi

add_to_env "PRIVATE_KEY" "$private_key"

echo ""
echo "✅ Configuration saved to .env"
echo ""
echo "🧪 Testing connection..."

# Test the connection
npm run ts-node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('$rpc_url');
provider.getNetwork().then(network => {
    console.log('✅ Connected to:', network.name, 'Chain ID:', network.chainId);
}).catch(error => {
    console.log('❌ Connection failed:', error.message);
});
" 2>/dev/null || echo "⚠️  Connection test skipped (run deployment to verify)"

echo ""
echo "🚀 Ready to deploy! Run:"
echo "   npx hardhat run scripts/deploy.js --network mumbai"
echo ""
echo "📋 After deployment, the script will show you the contract address"
echo "   Add it to your .env file as CONTRACT_ADDRESS"