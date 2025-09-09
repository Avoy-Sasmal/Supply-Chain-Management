import express from "express";

import homeRoute from "./routes/router.js"
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//routes
app.use("/api/v1",homeRoute)


app.listen(port, (req, res) => {
  console.log(`surver is running in http://localhost:${port}`);
});
