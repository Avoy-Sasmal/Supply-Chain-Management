import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, BACKEND_URL } from "../config.js";

// Contract ABI - simplified version
const CONTRACT_ABI = [
  "function createProduct(string memory _name, string memory _description) public returns (uint256)",
  "function transferProduct(uint256 _productId, address _to) public",
  "function updateProduct(uint256 _productId, string memory _name, string memory _description) public",
  "function getProduct(uint256 _productId) public view returns (uint256 id, string memory name, string memory description, address manufacturer, address currentOwner, uint256 timestamp)",
  "function getProductCount() public view returns (uint256)",
  "function getAllProductIds() public view returns (uint256[])",
  "function getUserRole(address user) public view returns (string memory)",
  "function getUserRoles(address user) public view returns (string[] memory)",
  "event ProductCreated(uint256 indexed productId, string name, address manufacturer)",
];

export const useContract = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    } else {
      setError("Please install MetaMask to use this application");
    }
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(address);
      setIsConnected(true);

      // Check role from backend
      await checkUserRole(address);
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
      console.error("Error connecting wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async (address) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/check-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      setUserRole(data.role);
      setUserRoles(data.roles || []);
      return data;
    } catch (err) {
      console.error("Error checking role:", err);
    }
  };

  const createProduct = async (name, description) => {
    if (!contract) throw new Error("Contract not connected");

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BACKEND_URL}/api/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMsg = err.message || "Failed to create product";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getAllProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products`);
      const data = await response.json();
      return data.products || [];
    } catch (err) {
      console.error("Error fetching products:", err);
      return [];
    }
  };

  const transferProduct = async (productId, toAddress) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to transfer product");
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId, name, description) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
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
    userRole,
    userRoles,
    connectWallet,
    checkUserRole,
    createProduct,
    getAllProducts,
    transferProduct,
    updateProduct,
  };
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

