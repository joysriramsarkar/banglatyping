// POST /api/billing/bkash/create — initiate a sandbox payment (bKash/Nagad).
import { NextRequest, NextResponse } from "next/server";
import { createBkashPayment } from "@/lib/billing/bkash-integration";
import { createNagadPayment } from "@/lib/billing/nagad-integration";
import { authenticate } from "@/lib/api-auth";

const PLAN_PRICES: Record<string, number> = {
  pro: 199,
  institution: 4999,
};

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  let body: { plan?: unknown; provider?: unknown };
  try {
    body = (await request.json()) as { plan?: unknown; provider?: unknown };
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 422 });
  }

  const plan = typeof body.plan === "string" ? body.plan : "";
  const provider = typeof body.provider === "string" ? body.provider : "bkash";
  const amount = PLAN_PRICES[plan];
  if (!amount) {
    return NextResponse.json({ success: false, error: "Unknown plan" }, { status: 422 });
  }

  const merchantInvoiceNumber = `${auth.user.id.slice(0, 8)}-${plan}-${Date.now()}`;

  try {
    if (provider === "nagad") {
      const payment = await createNagadPayment({ amount, currency: "BDT", merchantInvoiceNumber });
      return NextResponse.json({ success: true, data: { ...payment, provider, plan, amount } });
    }
    const payment = await createBkashPayment({
      amount,
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber,
    });
    return NextResponse.json({ success: true, data: { ...payment, provider: "bkash", plan, amount } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment initiation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
