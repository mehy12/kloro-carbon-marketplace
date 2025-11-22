# 🔌 Fix Wallet Connection Error

The error `Connection interrupted while trying to subscribe` happens because the app is missing a valid **WalletConnect Project ID**.

The default "demo" ID is often rate-limited or blocked.

## 🛠️ How to Fix It (Free & Fast)

1.  **Go to WalletConnect Cloud:**
    [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)

2.  **Sign Up / Sign In** (It's free).

3.  **Create a New Project:**
    - Name: `Kloro Marketplace` (or anything you like)
    - Type: `App`

4.  **Copy the Project ID:**
    - It will be a string like `a1b2c3d4...`

5.  **Update Your `.env` File:**
    Add this line to your `.env` file:

    ```env
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_copied_project_id_here"
    ```

6.  **Restart Your App:**
    Stop the server (Ctrl+C) and run `npm run dev` again.

## Why is this needed?
This ID allows your app to communicate with the WalletConnect relay servers, which are used by RainbowKit and most mobile wallets (like MetaMask Mobile) to connect to your dApp.
