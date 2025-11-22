# ✅ How to Verify Blockchain Transactions

## ⚠️ Important Fix First!

It looks like you added your **Wallet Address** to the `.env` file instead of the **Contract Address**.

**Please fix your `.env` file:**

Change this:
```env
CONTRACT_ADDRESS="0xc230..." (Your Wallet Address)
```

To this (The Actual Contract Address):
```env
CONTRACT_ADDRESS="0x4c068515086275984FD2C90746d7D12877A3Ce29"
```

---

## 3 Ways to Check Transactions

### Method 1: Run the Check Script (Easiest)

We created a script that checks the blockchain for you:

```bash
node scripts/check-blockchain.js
```

**What it shows:**
- Connection status
- Total transactions count
- List of recent purchases
- Links to block explorer

### Method 2: Use the Block Explorer

1. **Visit:** [https://sepolia.basescan.org/address/0x4c068515086275984FD2C90746d7D12877A3Ce29](https://sepolia.basescan.org/address/0x4c068515086275984FD2C90746d7D12877A3Ce29)
2. Click on **"Transactions"** tab
3. You will see a list of all interactions with your contract
4. Click on any transaction hash (Txn Hash) to see details

### Method 3: Verify in Your App

1. Go to your Marketplace App
2. Buy a Carbon Credit
3. Wait for the "Success" message
4. Click the **"View on Blockchain"** link in the success modal
5. Or check your **Dashboard > Transactions** tab

## Try It Now!

1. Fix your `.env` file first!
2. Run `node scripts/check-blockchain.js` to confirm connection.
3. Go buy a credit in your app!
