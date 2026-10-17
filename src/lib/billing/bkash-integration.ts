/**
 * bKash integration stub (sandbox).
 *
 * TODO:
 * - Replace sandbox URL with production endpoint after approval.
 * - Move secrets to server-only env (BKASH_APP_SECRET / BKASH_PASSWORD).
 * - Implement token grant → create → execute → query flow on the server.
 */

export const BKASH_SANDBOX_BASE_URL =
  'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout';

export interface BkashPaymentRequest {
  amount: number;
  currency?: string;
  intent?: 'sale' | 'authorization';
  merchantInvoiceNumber: string;
}

export interface BkashPaymentResponse {
  paymentID: string;
  bkashURL: string;
  status: 'initiated';
}

function readEnv(key: string): string {
  return process.env[key] ?? '';
}

export async function createBkashPayment(req: BkashPaymentRequest): Promise<BkashPaymentResponse> {
  const appKey = readEnv('BKASH_APP_KEY');
  const appSecret = readEnv('BKASH_APP_SECRET');
  const username = readEnv('BKASH_USERNAME');
  const password = readEnv('BKASH_PASSWORD');

  if (!appKey || !appSecret || !username || !password) {
    throw new Error('bKash env keys missing (BKASH_APP_KEY/APP_SECRET/USERNAME/PASSWORD)');
  }

  // TODO: implement real tokenized checkout against BKASH_SANDBOX_BASE_URL.
  const paymentID = `SANDBOX-${req.merchantInvoiceNumber}`;
  const bkashURL = `${BKASH_SANDBOX_BASE_URL}/payment?paymentID=${encodeURIComponent(paymentID)}`;
  return { paymentID, bkashURL, status: 'initiated' };
}

export default createBkashPayment;
