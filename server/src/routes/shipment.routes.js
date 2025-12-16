import express from "express";
import { uploadBatch, getShipmentById, getProofsByShipment } from "../controllers/shipment.controller.js";

const router = express.Router();

router.post("/upload-batch", uploadBatch);
router.get("/:id", getShipmentById);
router.get("/:shipmentId/proofs", getProofsByShipment);

export default router;
