import express from "express";
import { checkRole, assignRole, getUserProfile } from "../controllers/auth.controller.js";

const router = express.Router();

// Check user role
router.post("/check-role", checkRole);

// Assign role (admin only)
router.post("/assign-role", assignRole);

// Get user profile with roles
router.get("/profile/:address", getUserProfile);

export default router;

