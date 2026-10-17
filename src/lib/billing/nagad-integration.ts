/**
 * Nagad integration stub (sandbox).
 *
 * TODO:
 * - Replace sandbox URL with production endpoint after approval.
 * - Move secrets to server-only env (NAGAD_MERCHANT_ID / NAGAD_PRIVATE_KEY).
 * - Implement initialize → verify flow on the server.
 */

export const NAGAD_SANDBOX_BASE_URL = "https://sandbox.mynagad.com:10061/api/dfs";

export interface NagadPaymentRequest {
  amount: number;
  currency?: string;
  merchantInvoiceNumber: string;
}

export interface NagadPaymentResponse {
  paymentID: string;
  nagadURL: string;
  status: "initiated";
}

function readEnv(key: string): string {
  return process.env[key] ?? "";
}

export async function createNagadPayment(req: NagadPaymentRequest): Promise<NagadPaymentResponse> {
  const merchantId = readEnv("NAGAD_MERCHANT_ID");
  const privateKey = readEnv("NAGAD_PRIVATE_KEY");

  if (!merchantId || !privateKey) {
    throw new Error("Nagad env keys missing (NAGAD_MERCHANT_ID/NAGAD_PRIVATE_KEY)");
  }

  // TODO: implement real checkout against NAGAD_SANDBOX_BASE_URL.
  const paymentID = `SANDBOX-${req.merchantInvoiceNumber}`;
  const nagadURL = `${NAGAD_SANDBOX_BASE_URL}/check-out/initialize?paymentID=${encodeURIComponent(paymentID)}`;
  return { paymentID, nagadURL, status: "initiated" };
}

export default createNagadPayment;
