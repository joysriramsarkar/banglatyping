"use client";

/**
 * FeatureGate — renders children only when the current tier unlocks
 * the requested premium feature; otherwise shows an upgrade prompt.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  canAccessFeature,
  PREMIUM_FEATURES,
  type PlanTier,
  type PremiumFeature,
} from "@/lib/billing/feature-gate";

interface FeatureGateProps {
  feature: PremiumFeature;
  tier: PlanTier;
  fallbackMessage?: string;
  children: ReactNode;
}

export function FeatureGate({ feature, tier, fallbackMessage, children }: FeatureGateProps) {
  if (canAccessFeature(tier, feature)) {
    return <>{children}</>;
  }
  const entry = PREMIUM_FEATURES[feature];
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <Lock className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-semibold">
          {entry?.titleBn ?? feature} — প্রো ফিচার
        </p>
        <p className="text-xs text-muted-foreground max-w-sm">
          {fallbackMessage ?? "এই ফিচারটি ব্যবহার করতে আপনার প্ল্যান আপগ্রেড করুন।"}
        </p>
        <Button asChild size="sm">
          <Link href="/pricing">আপগ্রেড করুন</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default FeatureGate;
