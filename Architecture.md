# Architecture Documentation
## Blockchain-Based Supply Chain / Cold Chain Management System

---

## Table of Contents
1. [High-Level Design (HLD)](#high-level-design-hld)
2. [Low-Level Design (LLD)](#low-level-design-lld)
3. [System Flow](#system-flow)
4. [Technology Stack](#technology-stack)

---

## High-Level Design (HLD)

### 1. System Overview

The system is a **Blockchain-based Supply Chain Management** platform that ensures:
- **Transparency**: All transactions are recorded on blockchain
- **Security**: Role-based access control enforced on-chain
- **Data Integrity**: Cryptographic hashes stored on-chain, full data off-chain
- **Immutability**: Once recorded, data cannot be tampered with

### 2. Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  (React + Vite + Tailwind CSS + Ethers.js)              │
│  - User Interface                                        │
│  - MetaMask Integration                                 │
│  - Role-based UI Components                             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│                   Backend Layer                          │
│  (Node.js + Express + MongoDB)                          │
│  - REST API Endpoints                                   │
│  - Business Logic                                       │
│  - Data Validation                                      │
│  - Hash Generation (SHA-256)                             │
│  - MongoDB Storage (Off-chain data)                     │
└────────────────────┬────────────────────────────────────┘
                     │ Ethers.js
┌────────────────────▼────────────────────────────────────┐
│              Blockchain Layer                            │
│  (Ethereum + Solidity + Hardhat)                        │
│  - Smart Contract (SupplyChain.sol)                     │
│  - Role-Based Access Control                            │
│  - Hash Storage (bytes32)                                │
│  - Events & Immutability                                │
└─────────────────────────────────────────────────────────┘
```

### 3. User Roles & Authentication Flow

#### 3.1 Authentication Process

```
Step 1: User Opens Frontend
   ↓
Step 2: Clicks "Connect Wallet"
   ↓
Step 3: MetaMask Popup Appears
   ↓
Step 4: User Approves Connection
   ↓
Step 5: Frontend Gets User Address
   ↓
Step 6: Frontend Calls Backend API: POST /api/auth/check-role
   ↓
Step 7: Backend Queries Smart Contract: getUserRole(address)
   ↓
Step 8: Backend Stores User Info in MongoDB
   ↓
Step 9: Frontend Receives Role Information
   ↓
Step 10: UI Updates Based on Role
```

#### 3.2 Role Assignment

**Initial Setup (Admin):**
1. Admin connects wallet (has ADMIN_ROLE by default as deployer)
2. Admin navigates to Admin Panel
3. Admin enters user address and selects role
4. Admin calls: `POST /api/auth/assign-role` with `{ role: "MANUFACTURER", address: "0x..." }`
5. Backend calls smart contract: `grantRoleTo(roleHash, address)`
6. Transaction is mined on blockchain
7. User now has the assigned role

**Role Types:**
- **ADMIN**: Can grant/revoke roles, full system access
- **MANUFACTURER**: Can create products, create shipments, update products
- **TRANSPORTER**: Can upload batch data, record proofs, transfer products
- **RETAILER**: Can confirm delivery, view shipments
- **AUDITOR**: Read-only access for verification

### 4. Data Flow: On-Chain vs Off-Chain

#### 4.1 On-Chain Data (Blockchain)
- **Shipment Metadata**: ID, manufacturer address, status, metadata string
- **Proof Hashes**: SHA-256 hash of JSON batch data (bytes32)
- **Product Information**: ID, name, description, manufacturer, owner, timestamp
- **Role Assignments**: Who has which role (AccessControl)
- **Events**: ShipmentCreated, ProofRecorded, DeliveryConfirmed, ProductCreated, etc.

#### 4.2 Off-Chain Data (MongoDB)
- **Full JSON Batch Data**: Complete sensor/temperature data
- **User Profiles**: Address, roles, last checked timestamp
- **Product Cache**: Fast access to product details (synced with blockchain)
- **Batch Metadata**: Additional information about uploaded batches

#### 4.3 Why This Separation?

1. **Cost Efficiency**: Storing full JSON on-chain is expensive (gas fees)
2. **Privacy**: Sensitive data can remain off-chain
3. **Scalability**: Large datasets don't bloat blockchain
4. **Integrity**: Hash on-chain proves data hasn't been tampered with

### 5. System Components

#### 5.1 Frontend Components
- **Navbar**: Shows user address, role badge, navigation
- **Home**: Landing page with role-based dashboard
- **Profile**: User profile showing roles and permissions
- **Products**: List all products (role-based create/edit)
- **Shipments**: View and manage shipments
- **Admin Panel**: Role management (admin only)

#### 5.2 Backend Services
- **Auth Service**: Role checking, role assignment
- **Blockchain Service**: Contract interaction via Ethers.js
- **Hash Service**: SHA-256 hash generation
- **Product Controller**: Product CRUD operations
- **Shipment Controller**: Batch upload, proof recording

#### 5.3 Smart Contract Functions
- **Role Management**: `grantRoleTo()`, `revokeRoleFrom()`, `getUserRole()`
- **Products**: `createProduct()`, `updateProduct()`, `transferProduct()`, `getProduct()`
- **Shipments**: `createShipment()`, `recordProof()`, `confirmDelivery()`, `getShipment()`

---

## Low-Level Design (LLD)

### 1. Frontend Architecture

#### 1.1 Component Structure
```
src/
├── components/
│   ├── Navbar.jsx          # Navigation with role display
│   ├── Home.jsx             # Landing page
│   └── Footer.jsx           # Footer component
├── pages/
│   ├── Profile.jsx          # User profile page
│   ├── Products.jsx         # Products listing
│   └── Admin.jsx            # Admin panel (admin only)
├── hooks/
│   └── useContract.js       # Contract interaction hook
├── config.js                 # Configuration (contract address, backend URL)
└── App.jsx                   # Main app component with routing
```

#### 1.2 useContract Hook
```javascript
// Main hook for blockchain interaction
const {
  account,           // User wallet address
  isConnected,       // Connection status
  userRole,          // Primary role (string)
  userRoles,         // All roles (array)
  connectWallet,     // Connect MetaMask
  checkUserRole,     // Check role from backend
  createProduct,     // Create product (manufacturer only)
  getAllProducts,    // Fetch all products
  transferProduct,   // Transfer product
  updateProduct      // Update product (manufacturer only)
} = useContract();
```

#### 1.3 Authentication Flow (Frontend)
1. User clicks "Connect Wallet"
2. `connectWallet()` is called
3. MetaMask popup appears
4. User approves connection
5. Frontend gets `account` address
6. Frontend calls `checkUserRole(account)`
7. Backend returns role information
8. UI updates to show role-specific features

### 2. Backend Architecture

#### 2.1 File Structure
```
server/
├── server.js                    # Express app entry point
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── blockchain.config.js # Contract config
│   ├── routes/
│   │   ├── auth.routes.js       # Authentication routes
│   │   ├── product.routes.js    # Product routes
│   │   └── shipment.routes.js   # Shipment routes
│   ├── controllers/
│   │   ├── auth.controller.js   # Auth logic
│   │   ├── product.controller.js # Product logic
│   │   └── shipment.controller.js # Shipment logic
│   ├── services/
│   │   ├── blockchain.service.js # Contract interaction
│   │   └── hash.service.js      # Hash generation
│   └── utils/
│       └── jsonValidator.js     # Data validation
└── package.json                 # ES modules enabled
```

#### 2.2 API Endpoints

**Authentication:**
- `POST /api/auth/check-role` - Check user role
  - Body: `{ address: "0x..." }`
  - Response: `{ address, role, roles: [] }`

- `POST /api/auth/assign-role` - Assign role (admin only)
  - Body: `{ role: "MANUFACTURER", address: "0x..." }`
  - Response: `{ success, txHash, blockNumber }`

- `GET /api/auth/profile/:address` - Get user profile
  - Response: `{ address, role, roles, profile }`

**Products:**
- `POST /api/products/create` - Create product (manufacturer only)
  - Body: `{ name: "...", description: "..." }`
  - Response: `{ success, productId, txHash }`

- `GET /api/products` - Get all products
  - Response: `{ products: [...] }`

- `GET /api/products/:id` - Get product by ID
  - Response: `{ id, name, description, ... }`

- `POST /api/products/:id/transfer` - Transfer product
  - Body: `{ toAddress: "0x..." }`

- `PUT /api/products/:id` - Update product (manufacturer only)
  - Body: `{ name: "...", description: "..." }`

**Shipments:**
- `POST /api/shipments/upload-batch` - Upload batch data (transporter)
  - Body: `{ shipmentId: 1, data: {...}, metadata: "..." }`
  - Response: `{ hash, txHash, blockNumber, batchId }`

- `GET /api/shipments/:id` - Get shipment details
  - Response: `{ shipment: {...} }`

- `GET /api/shipments/:shipmentId/proofs` - Get proofs for shipment
  - Response: `{ proofs: [...], offchainBatches: [...] }`

#### 2.3 MongoDB Collections

**users:**
```javascript
{
  _id: ObjectId,
  address: "0x...",        // Lowercase address
  role: "MANUFACTURER",    // Primary role
  roles: ["MANUFACTURER"], // All roles
  lastChecked: Date,
  createdAt: Date
}
```

**batches:**
```javascript
{
  _id: ObjectId,
  shipmentId: Number,
  hash: "0x...",           // SHA-256 hash
  data: "{...}",           // Full JSON string
  metadata: "...",
  createdAt: Date
}
```

**products:**
```javascript
{
  _id: ObjectId,
  productId: Number,       // On-chain product ID
  name: "...",
  description: "...",
  manufacturer: "0x...",
  currentOwner: "0x...",
  timestamp: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Smart Contract Architecture

#### 3.1 Contract Structure
```solidity
contract SupplyChain is AccessControl {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Product Struct
    struct Product {
        uint256 id;
        string name;
        string description;
        address manufacturer;
        address currentOwner;
        uint256 timestamp;
        bool exists;
    }

    // Shipment Struct
    struct Shipment {
        uint256 id;
        address manufacturer;
        string metadata;
        ShipmentStatus status;
        bool exists;
    }

    // Proof Struct
    struct Proof {
        bytes32 hash;      // SHA-256 hash of JSON
        uint256 timestamp;
        address uploader;
    }
}
```

#### 3.2 Function Access Control

| Function | Role Required | Description |
|----------|--------------|-------------|
| `createProduct()` | MANUFACTURER | Create new product |
| `updateProduct()` | MANUFACTURER | Update product info |
| `transferProduct()` | MANUFACTURER or TRANSPORTER | Transfer ownership |
| `createShipment()` | MANUFACTURER | Create shipment |
| `recordProof()` | TRANSPORTER | Record hash proof |
| `confirmDelivery()` | RETAILER | Confirm delivery |
| `grantRoleTo()` | ADMIN | Assign role |
| `revokeRoleFrom()` | ADMIN | Remove role |

### 4. Data Integrity Verification

#### 4.1 How It Works

1. **Upload Process:**
   ```
   User uploads JSON → Backend hashes (SHA-256) → 
   Store JSON in MongoDB → Call recordProof(hash) on-chain
   ```

2. **Verification Process:**
   ```
   User requests verification → Backend fetches JSON from MongoDB →
   Recompute hash → Compare with on-chain hash → Return match/mismatch
   ```

3. **Why It's Secure:**
   - Hash is stored on immutable blockchain
   - If JSON is tampered, hash won't match
   - Anyone can verify without trusting backend

### 5. Consensus Mechanism

#### 5.1 Ethereum Proof of Stake (PoS)

**Important:** The system uses **Ethereum's consensus mechanism**, not a custom one.

- **Validators**: Ethereum validators (32 ETH staked) validate and create blocks
- **Finality**: Transactions are finalized after consensus
- **Local Development**: Hardhat simulates blockchain locally (no real consensus)

**Key Points:**
- Backend and smart contract **do NOT control consensus**
- Consensus is handled by Ethereum network
- Hardhat local node is for development only
- Production would use Sepolia testnet or Ethereum mainnet

### 6. Transaction Flow Examples

#### 6.1 Manufacturer Creates Product

```
Frontend (Manufacturer wallet)
  ↓
POST /api/products/create
  ↓
Backend validates role (checks contract)
  ↓
Backend calls contract.createProduct(name, description)
  ↓
Transaction sent to blockchain
  ↓
Transaction mined
  ↓
Backend stores in MongoDB
  ↓
Frontend receives success response
```

#### 6.2 Transporter Uploads Batch

```
Frontend (Transporter wallet)
  ↓
POST /api/shipments/upload-batch
Body: { shipmentId: 1, data: {...} }
  ↓
Backend validates JSON
  ↓
Backend generates SHA-256 hash
  ↓
Backend stores JSON in MongoDB
  ↓
Backend calls contract.recordProof(shipmentId, hash)
  ↓
Transaction mined
  ↓
Backend returns { hash, txHash, batchId }
```

#### 6.3 Retailer Confirms Delivery

```
Frontend (Retailer wallet)
  ↓
User clicks "Confirm Delivery"
  ↓
Frontend calls contract.confirmDelivery(shipmentId)
  ↓
MetaMask popup for transaction
  ↓
User approves transaction
  ↓
Transaction mined
  ↓
Event DeliveryConfirmed emitted
  ↓
Frontend updates UI
```

### 7. Security Considerations

1. **Role Enforcement**: All role checks happen on-chain, cannot be bypassed
2. **Hash Integrity**: SHA-256 ensures data hasn't been tampered
3. **Private Keys**: Never exposed, MetaMask handles signing
4. **Backend Signer**: Uses PRIVATE_KEY from .env (server-side only)
5. **Input Validation**: Both frontend and backend validate inputs
6. **Access Control**: Smart contract modifiers enforce permissions

### 8. Deployment Architecture

#### 8.1 Local Development
- **Blockchain**: Hardhat local node (http://127.0.0.1:8545)
- **Backend**: Node.js on localhost:4000
- **Frontend**: Vite dev server on localhost:5173
- **Database**: MongoDB (local or cloud URL)

#### 8.2 Production (Future)
- **Blockchain**: Sepolia testnet or Ethereum mainnet
- **Backend**: Deploy to Heroku/Railway/AWS
- **Frontend**: Deploy to Vercel/Netlify
- **Database**: MongoDB Atlas (cloud)

---

## System Flow

### Complete User Journey: Manufacturer

1. **Connect Wallet**
   - Opens frontend → Clicks "Connect Wallet" → MetaMask popup → Approves

2. **Role Check**
   - Frontend calls `/api/auth/check-role` → Backend queries contract → Returns "MANUFACTURER"

3. **Create Product**
   - Navigates to Products → Clicks "Create Product" → Fills form → Submits
   - Backend validates role → Calls contract → Transaction mined → Product created

4. **View Products**
   - Products page shows all products → Can edit own products

### Complete User Journey: Transporter

1. **Connect Wallet**
   - Same as above

2. **Role Check**
   - Returns "TRANSPORTER"

3. **Upload Batch Data**
   - Navigates to Shipments → Upload Batch → Selects JSON file → Submits
   - Backend hashes JSON → Stores in MongoDB → Records hash on-chain → Returns proof

### Complete User Journey: Retailer

1. **Connect Wallet**
   - Same as above

2. **Role Check**
   - Returns "RETAILER"

3. **Confirm Delivery**
   - Views shipments → Selects shipment → Clicks "Confirm Delivery" → Approves transaction
   - Contract updates status to "Delivered" → Event emitted

### Complete User Journey: Admin

1. **Connect Wallet**
   - Same as above

2. **Role Check**
   - Returns "ADMIN"

3. **Assign Role**
   - Navigates to Admin Panel → Enters user address → Selects role → Submits
   - Backend calls `grantRoleTo()` → Transaction mined → Role assigned

---

## Technology Stack

### Frontend
- **React 19**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Ethers.js v6**: Blockchain interaction
- **React Router**: Navigation

### Backend
- **Node.js**: Runtime
- **Express.js**: Web framework
- **MongoDB**: Database (off-chain storage)
- **Ethers.js v6**: Contract interaction
- **Crypto (Node.js)**: SHA-256 hashing

### Blockchain
- **Solidity 0.8.28**: Smart contract language
- **Hardhat**: Development framework
- **OpenZeppelin**: AccessControl library
- **Ethereum**: Blockchain network

---

## Conclusion

This architecture ensures:
- ✅ **Security**: Role-based access enforced on-chain
- ✅ **Transparency**: All transactions visible on blockchain
- ✅ **Integrity**: Cryptographic hashes prove data authenticity
- ✅ **Scalability**: Off-chain storage for large datasets
- ✅ **User-Friendly**: Clean UI with role-based features

The system is designed to be **beginner-friendly** while maintaining **industry standards** for blockchain applications.

