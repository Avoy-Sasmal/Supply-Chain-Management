# 🚀 Step-by-Step Setup Guide

Follow these steps **in order** to get your Supply Chain Management project running!

## Prerequisites Check ✅

Before starting, make sure you have:
- ✅ Node.js installed (check with `node --version`)
- ✅ npm installed (check with `npm --version`)
- ✅ MetaMask browser extension installed

---

## Step 1: Install Contract Dependencies

Open terminal in the **contract** folder:

```bash
cd contract
npm install
```

Wait for installation to complete. ✅

---

## Step 2: Compile the Smart Contract

Still in the **contract** folder:

```bash
npm run compile
```

You should see: `Compiled 2 Solidity files successfully` ✅

---

## Step 3: Run Tests (Optional but Recommended)

```bash
npm run test
```

You should see: `25 passing` ✅

This confirms your contract works correctly!

---

## Step 4: Start Hardhat Local Node

**IMPORTANT:** Open a **NEW terminal window** (keep this one running!)

In the **contract** folder:

```bash
npm run node
```

You'll see:
- A list of 20 accounts with addresses and private keys
- The node running on `http://127.0.0.1:8545`
- **Keep this terminal open!** Don't close it.

---

## Step 5: Configure MetaMask

### 5.1 Add Hardhat Network to MetaMask

1. Open MetaMask extension
2. Click network dropdown (top left, usually shows "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Fill in these details:
   ```
   Network Name: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   Chain ID: 1337
   Currency Symbol: ETH
   ```
5. Click "Save"

### 5.2 Import Test Account

1. Go back to the terminal where Hardhat node is running
2. Copy one of the **private keys** (the long hex string starting with `0x`)
3. In MetaMask:
   - Click account icon (top right)
   - Click "Import Account"
   - Paste the private key
   - Click "Import"
4. Switch to "Hardhat Local" network in MetaMask

You should now see 10000 ETH in your account! 🎉

---

## Step 6: Deploy the Contract

**Open a NEW terminal** (keep Hardhat node running in the other one!)

In the **contract** folder:

```bash
npm run deploy
```

**IMPORTANT:** Copy the contract address that appears!

Example output:
```
SupplyChain deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Copy this address to use in your frontend:
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## Step 7: Install Frontend Dependencies

**Open a NEW terminal** (or use the same one from Step 6)

Navigate to **client** folder:

```bash
cd client
npm install
```

Wait for installation. ✅

---

## Step 8: Update Contract Address in Frontend

1. Open `client/src/config.ts` in your code editor
2. Replace the `CONTRACT_ADDRESS` with the address from Step 6:

```typescript
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your address here
```

Save the file! 💾

---

## Step 9: Start the Frontend

Still in the **client** folder:

```bash
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser! 🌐

---

## Step 10: Connect and Test!

1. **Open the app** in your browser (`http://localhost:5173`)
2. **Make sure MetaMask is connected** to "Hardhat Local" network
3. Click **"Connect Wallet"** button
4. Approve the connection in MetaMask
5. You should see your wallet address in the header! ✅

### Test the Features:

1. **Create a Product:**
   - Click "+ Create Product"
   - Enter name: "Test Product"
   - Enter description: "This is a test"
   - Click "Create Product"
   - Approve transaction in MetaMask
   - Wait for confirmation ✅

2. **View Products:**
   - Your product should appear in the grid below
   - You can see all details: ID, name, description, owner, etc.

3. **Transfer Product:**
   - Click "Transfer Product"
   - Enter Product ID: `1`
   - Enter another address (from Hardhat node accounts)
   - Click "Transfer Product"
   - Approve transaction ✅

4. **Update Product:**
   - Find a product you own
   - Click "✏️ Update" button
   - Change name/description
   - Click "Update Product"
   - Approve transaction ✅

---

## 🎉 Success!

If everything works, congratulations! You have:
- ✅ A working smart contract
- ✅ A beautiful React frontend
- ✅ Full integration with MetaMask
- ✅ Local blockchain running

---

## 🔧 Troubleshooting

### Problem: "MetaMask is not installed"
**Solution:** Install MetaMask from [metamask.io](https://metamask.io)

### Problem: "Contract not connected"
**Solution:** 
- Check Hardhat node is running
- Verify contract address in `client/src/config.ts`
- Make sure you're on "Hardhat Local" network

### Problem: "Transaction failed"
**Solution:**
- Make sure you have ETH (you should have 10000 ETH)
- Check you're on the correct network
- Verify contract address is correct

### Problem: "Cannot connect to network"
**Solution:**
- Make sure Hardhat node is running (`npm run node`)
- Check RPC URL in MetaMask: `http://127.0.0.1:8545`

### Problem: Frontend shows "No products"
**Solution:**
- Create a product first!
- Click "🔄 Refresh" button
- Check browser console for errors

---

## 📝 Quick Reference

### Terminal 1 (Keep Running):
```bash
cd contract
npm run node
```

### Terminal 2 (Deploy):
```bash
cd contract
npm run deploy
```

### Terminal 3 (Frontend):
```bash
cd client
npm run dev
```

---

## 🎓 Next Steps

Once everything is working:
1. Explore the code in `contract/contracts/SupplyChain.sol`
2. Check out `client/src/hooks/useContract.ts` for contract interaction
3. Customize the UI in `client/src/App.tsx`
4. Add more features to the contract
5. Deploy to a testnet (Sepolia/Goerli)

---

**Need Help?** Check the main `README.md` for more details!

Happy Coding! 🚀

