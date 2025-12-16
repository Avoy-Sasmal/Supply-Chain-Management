import { readFileSync } from "fs";
import { ethers } from "ethers";
import { DEFAULT_RPC, CONTRACT_ADDRESS, PRIVATE_KEY, ABI_PATH } from "../config/blockchain.config.js";

function loadAbi() {
  const artifact = JSON.parse(readFileSync(ABI_PATH, "utf8"));
  return artifact.abi;
}

function getProvider() {
  return new ethers.JsonRpcProvider(DEFAULT_RPC);
}

function getWallet(provider) {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set in .env");
  }
  return new ethers.Wallet(PRIVATE_KEY, provider);
}

function getContractInstance(providerOrSigner) {
  const abi = loadAbi();
  return new ethers.Contract(CONTRACT_ADDRESS, abi, providerOrSigner);
}

// Role checking functions
export async function getUserRole(address) {
  const provider = getProvider();
  const contract = getContractInstance(provider);
  try {
    const role = await contract.getUserRole(address);
    return role;
  } catch (error) {
    console.error("Error getting user role:", error);
    return "NONE";
  }
}

export async function getUserRoles(address) {
  const provider = getProvider();
  const contract = getContractInstance(provider);
  try {
    const roles = await contract.getUserRoles(address);
    return roles;
  } catch (error) {
    console.error("Error getting user roles:", error);
    return [];
  }
}

// Grant role (admin only)
export async function grantRole(role, address) {
  const provider = getProvider();
  const wallet = getWallet(provider);
  const contract = getContractInstance(wallet);
  
  const tx = await contract.grantRoleTo(role, address);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

// Shipment functions
export async function createShipment(shipmentId, metadata) {
  const provider = getProvider();
  const wallet = getWallet(provider);
  const contract = getContractInstance(wallet);
  const tx = await contract.createShipment(shipmentId, metadata);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export async function recordProof(shipmentId, hashHex) {
  const provider = getProvider();
  const wallet = getWallet(provider);
  const contract = getContractInstance(wallet);

  const tx = await contract.recordProof(shipmentId, hashHex);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export async function getShipment(shipmentId) {
  const provider = getProvider();
  const contract = getContractInstance(provider);
  return contract.getShipment(shipmentId);
}

export async function getProofs(shipmentId) {
  const provider = getProvider();
  const contract = getContractInstance(provider);
  return contract.getProofs(shipmentId);
}

// Product functions
export async function createProduct(name, description) {
  const provider = getProvider();
  const wallet = getWallet(provider);
  const contract = getContractInstance(wallet);
  const tx = await contract.createProduct(name, description);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber, productId: receipt.logs[0]?.args[0] };
}

export async function getProduct(productId) {
  const provider = getProvider();
  const contract = getContractInstance(provider);
  return contract.getProduct(productId);
}

export async function getAllProducts() {
  const provider = getProvider();
  const contract = getContractInstance(provider);
  const productIds = await contract.getAllProductIds();
  const products = [];
  for (const id of productIds) {
    try {
      const product = await contract.getProduct(id);
      products.push({
        id: Number(product.id),
        name: product.name,
        description: product.description,
        manufacturer: product.manufacturer,
        currentOwner: product.currentOwner,
        timestamp: Number(product.timestamp)
      });
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
    }
  }
  return products;
}

export async function transferProduct(productId, toAddress) {
  const provider = getProvider();
  const wallet = getWallet(provider);
  const contract = getContractInstance(wallet);
  const tx = await contract.transferProduct(productId, toAddress);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export async function updateProduct(productId, name, description) {
  const provider = getProvider();
  const wallet = getWallet(provider);
  const contract = getContractInstance(wallet);
  const tx = await contract.updateProduct(productId, name, description);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

export { getProvider };
