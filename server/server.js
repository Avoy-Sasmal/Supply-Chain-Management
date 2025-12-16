import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/database.js";
import authRoutes from "./src/routes/auth.routes.js";
import shipmentRoutes from "./src/routes/shipment.routes.js";
import productRoutes from "./src/routes/product.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/products", productRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "supply-chain-backend" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
