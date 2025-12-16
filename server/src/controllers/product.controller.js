import {
  createProduct as createProductOnChain,
  getAllProducts as getAllProductsOnChain,
  getProduct as getProductOnChain,
  transferProduct as transferProductOnChain,
  updateProduct as updateProductOnChain,
} from "../services/blockchain.service.js";
import { getDB } from "../config/database.js";

export async function createProduct(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required" });
    }

    const result = await createProductOnChain(name, description);

    // Store in MongoDB for faster queries
    const db = getDB();
    const productsCollection = db.collection("products");
    
    // Get product details from chain
    const productIds = await getAllProductsOnChain();
    const latestProduct = productIds[productIds.length - 1];
    const productData = await getProductOnChain(latestProduct.id);

    await productsCollection.insertOne({
      productId: Number(productData.id),
      name: productData.name,
      description: productData.description,
      manufacturer: productData.manufacturer,
      currentOwner: productData.currentOwner,
      timestamp: Number(productData.timestamp),
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      productId: Number(productData.id),
      txHash: result.txHash,
      blockNumber: result.blockNumber,
    });
  } catch (error) {
    console.error("createProduct error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function getAllProducts(req, res) {
  try {
    const products = await getAllProductsOnChain();
    return res.json({ products });
  } catch (error) {
    console.error("getAllProducts error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await getProductOnChain(id);
    return res.json({
      id: Number(product.id),
      name: product.name,
      description: product.description,
      manufacturer: product.manufacturer,
      currentOwner: product.currentOwner,
      timestamp: Number(product.timestamp),
    });
  } catch (error) {
    console.error("getProductById error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function transferProduct(req, res) {
  try {
    const { id } = req.params;
    const { toAddress } = req.body;
    if (!toAddress) {
      return res.status(400).json({ error: "toAddress is required" });
    }

    const result = await transferProductOnChain(id, toAddress);

    // Update MongoDB
    const db = getDB();
    const productsCollection = db.collection("products");
    const product = await getProductOnChain(id);
    
    await productsCollection.updateOne(
      { productId: Number(id) },
      {
        $set: {
          currentOwner: product.currentOwner,
          updatedAt: new Date(),
        },
      }
    );

    return res.json({
      success: true,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
    });
  } catch (error) {
    console.error("transferProduct error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required" });
    }

    const result = await updateProductOnChain(id, name, description);

    // Update MongoDB
    const db = getDB();
    const productsCollection = db.collection("products");
    
    await productsCollection.updateOne(
      { productId: Number(id) },
      {
        $set: {
          name,
          description,
          updatedAt: new Date(),
        },
      }
    );

    return res.json({
      success: true,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
    });
  } catch (error) {
    console.error("updateProduct error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

