import { getUserRole, getUserRoles, grantRole } from "../services/blockchain.service.js";
import { getDB } from "../config/database.js";

// Role constants matching contract
const ROLE_HASHES = {
  ADMIN: "0x" + "0".repeat(64), // Will be computed properly in contract
  MANUFACTURER: "0x" + "0".repeat(64),
  TRANSPORTER: "0x" + "0".repeat(64),
  RETAILER: "0x" + "0".repeat(64),
  AUDITOR: "0x" + "0".repeat(64),
};

// Check user role
export async function checkRole(req, res) {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const role = await getUserRole(address);
    const roles = await getUserRoles(address);

    // Store/update user in MongoDB
    const db = getDB();
    const usersCollection = db.collection("users");
    
    await usersCollection.updateOne(
      { address: address.toLowerCase() },
      {
        $set: {
          address: address.toLowerCase(),
          role,
          roles,
          lastChecked: new Date(),
        },
      },
      { upsert: true }
    );

    return res.json({
      address,
      role,
      roles,
    });
  } catch (error) {
    console.error("checkRole error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

// Assign role (admin only - this should be called by admin wallet)
export async function assignRole(req, res) {
  try {
    const { role, address } = req.body;
    if (!role || !address) {
      return res.status(400).json({ error: "Role and address are required" });
    }

    // Convert role name to bytes32 hash (simplified - contract handles this)
    const roleHash = await getRoleHash(role);
    
    const result = await grantRole(roleHash, address);

    // Update MongoDB
    const db = getDB();
    const usersCollection = db.collection("users");
    
    await usersCollection.updateOne(
      { address: address.toLowerCase() },
      {
        $set: {
          address: address.toLowerCase(),
          role,
          lastUpdated: new Date(),
        },
        $addToSet: { roles: role },
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      role,
      address,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
    });
  } catch (error) {
    console.error("assignRole error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

// Get user profile
export async function getUserProfile(req, res) {
  try {
    const { address } = req.params;
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    // Get from blockchain
    const role = await getUserRole(address);
    const roles = await getUserRoles(address);

    // Get from MongoDB
    const db = getDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ address: address.toLowerCase() });

    return res.json({
      address,
      role,
      roles,
      profile: user || null,
    });
  } catch (error) {
    console.error("getUserProfile error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

// Helper to get role hash (simplified - in production, compute keccak256)
async function getRoleHash(roleName) {
  // Contract uses keccak256("ROLE_NAME")
  // For now, return a placeholder - contract will handle the actual hash
  const roleMap = {
    ADMIN: "0x0000000000000000000000000000000000000000000000000000000000000000",
    MANUFACTURER: "0x" + "1".repeat(64),
    TRANSPORTER: "0x" + "2".repeat(64),
    RETAILER: "0x" + "3".repeat(64),
    AUDITOR: "0x" + "4".repeat(64),
  };
  return roleMap[roleName.toUpperCase()] || roleMap.MANUFACTURER;
}

