// POST /api/billing/bkash/callback — verify a sandbox payment callback.
import { NextRequest, NextResponse } from "next/server";

/**
 * Stub signature check.
 * TODO: verify the callback signature against BKASH_APP_SECRET (or the
 * provider webhook secret), look up the invoice, and upsert the
 * `subscriptions` row (tier/status/current_period_end) via service role.
 */
function verifyCallbackSignature(payload: Record<string, unknown>): boolean {
  const signature = typeof payload.signature === "string" ? payload.signature : "";
  if (!signature) return false;
  // TODO: HMAC-compare signature with the provider secret.
  return true;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 422 });
  }

  if (!verifyCallbackSignature(body)) {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 403 });
  }

  const paymentID = typeof body.paymentID === "string" ? body.paymentID : "";
  const status = typeof body.status === "string" ? body.status : "unknown";

  // TODO: persist verified payment + activate subscription in `subscriptions`.
  return NextResponse.json({ success: true, data: { paymentID, status, verified: status === "success" } });
}
