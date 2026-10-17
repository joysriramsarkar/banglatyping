/**
 * SSLCommerz integration stub (sandbox).
 *
 * TODO:
 * - Replace sandbox URL with production endpoint after approval.
 * - Move secrets to server-only env (SSLCOMMERZ_STORE_ID / SSLCOMMERZ_STORE_PASSWORD).
 * - Implement init → IPN validation (verify signature + tran_id) on the server.
 */

export const SSLCOMMERZ_SANDBOX_BASE_URL = "https://sandbox.sslcommerz.com";

export interface SslcommerzPaymentRequest {
  amount: number;
  currency?: string;
  merchantInvoiceNumber: string;
}

export interface SslcommerzPaymentResponse {
  paymentID: string;
  gatewayURL: string;
  status: "initiated";
}

function readEnv(key: string): string {
  return process.env[key] ?? "";
}

export async function createSslcommerzPayment(
  req: SslcommerzPaymentRequest
): Promise<SslcommerzPaymentResponse> {
  const storeId = readEnv("SSLCOMMERZ_STORE_ID");
  const storePassword = readEnv("SSLCOMMERZ_STORE_PASSWORD");

  if (!storeId || !storePassword) {
    throw new Error("SSLCommerz env keys missing (SSLCOMMERZ_STORE_ID/SSLCOMMERZ_STORE_PASSWORD)");
  }

  // TODO: implement real init call against SSLCOMMERZ_SANDBOX_BASE_URL.
  const paymentID = `SANDBOX-${req.merchantInvoiceNumber}`;
  const gatewayURL = `${SSLCOMMERZ_SANDBOX_BASE_URL}/gwprocess/v4/gw.php?tran_id=${encodeURIComponent(
    paymentID
  )}`;
  return { paymentID, gatewayURL, status: "initiated" };
}

export default createSslcommerzPayment;
