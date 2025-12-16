import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  transferProduct,
  updateProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/create", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/:id/transfer", transferProduct);
router.put("/:id", updateProduct);

export default router;

