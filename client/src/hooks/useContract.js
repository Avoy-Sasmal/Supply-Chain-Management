import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../config";

// Minimal ABI for SupplyChain contract
export const CONTRACT_ABI = [
  "function createProduct(string _name, string _description) public returns (uint256)",
  "function transferProduct(uint256 _productId, address _to) public",
  "function updateProduct(uint256 _productId, string _name, string _description) public",
  "function getProduct(uint256 _productId) public view returns (uint256 id, string name, string description, address manufacturer, address currentOwner, uint256 timestamp)",
  "function getProductCount() public view returns (uint256)",
  "function getAllProductIds() public view returns (uint256[])",
  "event ProductCreated(uint256 indexed productId, string name, address manufacturer)",
  "event ProductTransferred(uint256 indexed productId, address from, address to)",
  "event ProductUpdated(uint256 indexed productId, string name, string description)",
];

export const useContract = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize provider if MetaMask is present
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const nextProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(nextProvider);
    } else {
      setError("Please install MetaMask to use this application");
    }
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) throw new Error("MetaMask is not installed");

      const nextProvider = new ethers.BrowserProvider(window.ethereum);
      await nextProvider.send("eth_requestAccounts", []);

      const nextSigner = await nextProvider.getSigner();
      const address = await nextSigner.getAddress();

      const nextContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        nextSigner
      );

      setProvider(nextProvider);
      setSigner(nextSigner);
      setContract(nextContract);
      setAccount(address);
      setIsConnected(true);
    } catch (err) {
      setError(err?.message || "Failed to connect wallet");
      console.error("connectWallet error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (name, description) => {
    if (!contract) throw new Error("Contract not connected");
    try {
      setLoading(true);
      setError(null);
      const tx = await contract.createProduct(name, description);
      await tx.wait();
      return tx.hash;
    } catch (err) {
      const msg = err?.reason || err?.message || "Failed to create product";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const transferProduct = async (productId, toAddress) => {
    if (!contract) throw new Error("Contract not connected");
    try {
      setLoading(true);
      setError(null);
      const tx = await contract.transferProduct(productId, toAddress);
      await tx.wait();
      return tx.hash;
    } catch (err) {
      const msg = err?.reason || err?.message || "Failed to transfer product";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId, name, description) => {
    if (!contract) throw new Error("Contract not connected");
    try {
      setLoading(true);
      setError(null);
      const tx = await contract.updateProduct(productId, name, description);
      await tx.wait();
      return tx.hash;
    } catch (err) {
      const msg = err?.reason || err?.message || "Failed to update product";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (productId) => {
    if (!contract) throw new Error("Contract not connected");
    try {
      const product = await contract.getProduct(productId);
      return {
        id: Number(product.id),
        name: product.name,
        description: product.description,
        manufacturer: product.manufacturer,
        currentOwner: product.currentOwner,
        timestamp: Number(product.timestamp),
      };
    } catch (err) {
      const msg = err?.reason || err?.message || "Failed to get product";
      setError(msg);
      throw new Error(msg);
    }
  };

  const getAllProducts = async () => {
    if (!contract) throw new Error("Contract not connected");
    try {
      const productIds = await contract.getAllProductIds();
      const products = await Promise.all(
        productIds.map((id) => getProduct(Number(id)))
      );
      return products;
    } catch (err) {
      const msg = err?.reason || err?.message || "Failed to get products";
      setError(msg);
      throw new Error(msg);
    }
  };

  const getProductCount = async () => {
    if (!contract) throw new Error("Contract not connected");
    try {
      const count = await contract.getProductCount();
      return Number(count);
    } catch (err) {
      const msg = err?.reason || err?.message || "Failed to get product count";
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    loading,
    error,
    connectWallet,
    createProduct,
    transferProduct,
    updateProduct,
    getProduct,
    getAllProducts,
    getProductCount,
  };
};

// For TypeScript-less environment
export const isMetaMaskAvailable = () =>
  typeof window !== "undefined" && !!window.ethereum;

// Extend window for MetaMask
if (typeof window !== "undefined") {
  window.ethereum = window.ethereum;
}

