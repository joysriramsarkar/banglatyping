"use client";

/**
 * DrillManager — lists the signed-in admin's custom drills.
 * Unauthenticated callers see an empty state (API returns 401).
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DrillSummary {
  id: string;
  name?: string | null;
  characters: string;
  usage_count: number;
}

export function DrillManager() {
  const [drills, setDrills] = useState<DrillSummary[]>([]);
  const [status, setStatus] = useState<string>("লোড হচ্ছে…");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/custom-drills");
        if (res.status === 401) {
          if (!cancelled) {
            setDrills([]);
            setStatus("লগইন করলে ড্রিল দেখা যাবে।");
          }
          return;
        }
        const json = (await res.json()) as { success: boolean; data?: DrillSummary[] };
        if (!cancelled) {
          setDrills(json.success && Array.isArray(json.data) ? json.data : []);
          setStatus(json.success ? "" : "ড্রিল লোড করা যায়নি।");
        }
      } catch {
        if (!cancelled) {
          setDrills([]);
          setStatus("ড্রিল লোড করা যায়নি।");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>কাস্টম ড্রিল ব্যবস্থাপনা</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
        {drills.length === 0 && !status && (
          <p className="text-sm text-muted-foreground">কোনো ড্রিল নেই।</p>
        )}
        {drills.map((d) => (
          <div key={d.id} className="p-2 rounded border text-sm flex justify-between gap-2">
            <span className="font-semibold">{d.name ?? d.characters}</span>
            <span className="text-muted-foreground">ব্যবহার: {d.usage_count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default DrillManager;
