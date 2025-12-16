import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DEFAULT_RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const ABI_PATH = process.env.CONTRACT_ABI_PATH || 
  join(__dirname, "../../../contract/artifacts/contracts/SupplyChain.sol/SupplyChain.json");

if (!CONTRACT_ADDRESS) {
  throw new Error("CONTRACT_ADDRESS must be set in .env");
}

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY must be set in .env");
}
