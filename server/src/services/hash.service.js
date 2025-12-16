import { createHash } from "crypto";

/**
 * Hash JSON data using SHA-256
 * Normalizes JSON to ensure consistent hashing
 */
export function hashJson(data) {
  // Normalize JSON: stringify with sorted keys
  const normalized = JSON.stringify(data, Object.keys(data).sort());
  const hash = createHash("sha256");
  hash.update(normalized);
  const hashHex = "0x" + hash.digest("hex");
  return { hashHex, normalized };
}
