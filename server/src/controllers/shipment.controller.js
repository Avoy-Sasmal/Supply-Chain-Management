import { validateBatchPayload } from "../utils/jsonValidator.js";
import { hashJson } from "../services/hash.service.js";
import { createShipment, recordProof, getShipment, getProofs } from "../services/blockchain.service.js";
import { getDB } from "../config/database.js";

export async function uploadBatch(req, res) {
  try {
    const validationError = validateBatchPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { shipmentId, data, metadata } = req.body;

    // Ensure shipment exists; if not, create it
    let existing;
    try {
      existing = await getShipment(shipmentId);
    } catch (error) {
      // Shipment doesn't exist, create it
      existing = { exists: false };
    }

    if (!existing.exists) {
      await createShipment(shipmentId, metadata || "");
    }

    // Hash the JSON data
    const { hashHex, normalized } = hashJson(data);

    // Save to MongoDB
    const db = getDB();
    const batchesCollection = db.collection("batches");
    
    const batchDoc = {
      shipmentId,
      hash: hashHex,
      data: normalized,
      metadata: metadata || "",
      createdAt: new Date(),
    };

    const insertResult = await batchesCollection.insertOne(batchDoc);

    // Record on-chain proof
    const receipt = await recordProof(shipmentId, hashHex);

    return res.json({
      shipmentId,
      hash: hashHex,
      txHash: receipt.txHash,
      blockNumber: receipt.blockNumber,
      batchId: insertResult.insertedId,
      message: "Proof recorded on-chain and data stored in MongoDB",
    });
  } catch (err) {
    console.error("uploadBatch error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}

export async function getShipmentById(req, res) {
  try {
    const { id } = req.params;
    const shipment = await getShipment(id);
    return res.json({ shipment });
  } catch (err) {
    console.error("getShipment error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}

export async function getProofsByShipment(req, res) {
  try {
    const { shipmentId } = req.params;
    const proofs = await getProofs(shipmentId);

    // Get off-chain data from MongoDB
    const db = getDB();
    const batchesCollection = db.collection("batches");
    const batches = await batchesCollection
      .find({ shipmentId: Number(shipmentId) })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({
      shipmentId,
      proofs,
      offchainBatches: batches.map((b) => ({
        batchId: b._id,
        hash: b.hash,
        metadata: b.metadata,
        createdAt: b.createdAt,
      })),
    });
  } catch (err) {
    console.error("getProofs error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
