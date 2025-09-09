import express from "express";
import { getRandomData,streamData } from "../controllers/controller.js";
const router = express.Router();

router.get("/welcome", (req, res) => {
  res.status(200).json({
    message: "welcome to home",
  });
});

router.get("/random-data", getRandomData);
router.get("/stream", streamData);

export default router;
