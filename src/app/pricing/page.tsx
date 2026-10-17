"use client";

/**
 * Pricing page — Free ৳০ / Pro ৳১৯৯ / Institution ৳৪৯৯৯.
 * Pay buttons hit the sandbox create route (no real credentials).
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface Plan {
  id: string;
  nameBn: string;
  price: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    nameBn: "ফ্রি",
    price: "৳০",
    features: ["সম্পূর্ণ পাঠক্রম (Levels 0–12)", "টাইপিং টেস্ট", "সার্টিফিকেট PDF"],
  },
  {
    id: "pro",
    nameBn: "প্রো",
    price: "৳১৯৯/মাস",
    highlight: true,
    features: ["উন্নত বিশ্লেষণ", "এআই ফিডব্যাক", "SRS রিভিশন সিস্টেম", "প্রিমিয়াম সার্টিফিকেট", "মাল্টিপ্লেয়ার রেস"],
  },
  {
    id: "institution",
    nameBn: "প্রতিষ্ঠান",
    price: "৳৪৯৯৯/মাস",
    features: ["প্রো-এর সবকিছু", "শিক্ষক ড্যাশবোর্ড", "এআই কোচ", "বাল্ক রিপোর্ট"],
  },
];

export default function PricingPage() {
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function startPayment(planId: string, provider: "bkash" | "nagad") {
    if (planId === "free") return;
    setPending(`${planId}-${provider}`);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/bkash/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, provider }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: { bkashURL?: string; nagadURL?: string };
        error?: string;
      };
      if (!json.success) {
        setMessage(json.error ?? "পেমেন্ট শুরু করা যায়নি");
        return;
      }
      const url = json.data?.bkashURL ?? json.data?.nagadURL;
      setMessage(url ? `স্যান্ডবক্স পেমেন্ট তৈরি হয়েছে। ${url}` : "স্যান্ডবক্স পেমেন্ট তৈরি হয়েছে।");
    } catch {
      setMessage("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন।");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold">মূল্য পরিকল্পনা</h1>
        <p className="text-sm text-muted-foreground">স্যান্ডবক্স মোড — কোনো আসল টাকা কাটা হবে না।</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={plan.highlight ? "border-primary shadow-md" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.nameBn}</CardTitle>
                {plan.highlight && <Badge>জনপ্রিয়</Badge>}
              </div>
              <CardDescription className="text-2xl font-extrabold text-foreground">
                {plan.price}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              {plan.id !== "free" && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={pending !== null}
                    onClick={() => startPayment(plan.id, "bkash")}
                  >
                    {pending === `${plan.id}-bkash` ? "অপেক্ষা…" : "বিকাশে কিনুন"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={pending !== null}
                    onClick={() => startPayment(plan.id, "nagad")}
                  >
                    {pending === `${plan.id}-nagad` ? "অপেক্ষা…" : "নগদে কিনুন"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {message && <p className="text-center text-sm text-muted-foreground break-all">{message}</p>}
    </div>
  );
}
