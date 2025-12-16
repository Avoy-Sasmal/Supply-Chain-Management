/**
 * Validate batch upload payload
 */
export function validateBatchPayload(body) {
  if (!body.shipmentId && body.shipmentId !== 0) {
    return "shipmentId is required";
  }
  if (!body.data || typeof body.data !== "object") {
    return "data must be a valid JSON object";
  }
  return null;
}
