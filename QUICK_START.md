# ⚡ Quick Start Commands

## 🎯 Run Everything in Order

### 1️⃣ Install & Compile Contract
```bash
cd contract
npm install
npm run compile
npm run test  # Optional: verify tests pass
```

### 2️⃣ Start Local Blockchain (Terminal 1 - Keep Running!)
```bash
cd contract
npm run node
```
**Copy a private key** from the output to import into MetaMask!

### 3️⃣ Deploy Contract (Terminal 2)
```bash
cd contract
npm run deploy
```
**Copy the contract address!** You'll need it for the frontend.

### 4️⃣ Setup Frontend (Terminal 3)
```bash
cd client
npm install
```

### 5️⃣ Update Contract Address
Edit `client/src/config.ts` and paste the deployed contract address.

### 6️⃣ Start Frontend (Terminal 3)
```bash
cd client
npm run dev
```

### 7️⃣ Configure MetaMask
- Add Network: `http://127.0.0.1:8545`, Chain ID: `1337`
- Import account using private key from Terminal 1
- Switch to "Hardhat Local" network

### 8️⃣ Open Browser
Go to `http://localhost:5173` and click "Connect Wallet"!

---

## 📋 All Commands Reference

| Task | Command | Location |
|------|---------|----------|
| Compile | `npm run compile` | contract/ |
| Test | `npm run test` | contract/ |
| Start Node | `npm run node` | contract/ |
| Deploy | `npm run deploy` | contract/ |
| Dev Server | `npm run dev` | client/ |
| Build | `npm run build` | client/ |

---

## 🔑 Important Addresses

- **Hardhat Node**: `http://127.0.0.1:8545`
- **Frontend**: `http://localhost:5173`
- **Chain ID**: `1337`

---

**Need detailed instructions?** See `SETUP_GUIDE.md`!

