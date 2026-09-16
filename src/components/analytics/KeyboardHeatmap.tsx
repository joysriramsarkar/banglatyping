"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getKeyboardLayoutConfig,
  type KeyboardLayoutKey,
} from "@/lib/keyboard-layouts";
import type { WeakCharacterView } from "@/lib/types";
import { toBengaliNumber } from "@/lib/utils";

interface KeyboardHeatmapProps {
  weakChars?: WeakCharacterView[];
  className?: string;
}

export default function KeyboardHeatmap({ weakChars = [], className }: KeyboardHeatmapProps) {
  const [selectedLayout, setSelectedLayout] = useState<KeyboardLayoutKey>("banglaword");
  const layout = getKeyboardLayoutConfig(selectedLayout);

  // Map each Bengali character to its stats
  const charStatsMap = useMemo(() => {
    const map = new Map<string, { accuracy: number; errors: number; total: number }>();
    for (const wc of weakChars) {
      map.set(wc.character, {
        accuracy: wc.accuracy_rate,
        errors: wc.error_count,
        total: wc.total_attempts,
      });
    }
    return map;
  }, [weakChars]);

  const getKeyColor = (bnChar: string, bnShift?: string) => {
    const primary = charStatsMap.get(bnChar);
    const shift = bnShift ? charStatsMap.get(bnShift) : undefined;

    const stat = primary || shift;
    if (!stat) {
      return "bg-secondary/70 border-border text-foreground";
    }

    if (stat.accuracy < 70) {
      return "bg-red-500/80 border-red-600 text-white font-bold shadow-xs";
    }
    if (stat.accuracy < 85) {
      return "bg-amber-500/80 border-amber-600 text-white font-bold";
    }
    if (stat.accuracy < 95) {
      return "bg-emerald-500/80 border-emerald-600 text-white font-bold";
    }
    return "bg-green-600/90 border-green-700 text-white font-bold";
  };

  const renderKey = (keyData: any) => {
    const isSpecial = keyData.special === "shift" || keyData.key === " ";
    const keyColor = isSpecial ? "bg-muted text-muted-foreground" : getKeyColor(keyData.bn, keyData.bnShift);

    const stat = charStatsMap.get(keyData.bn) || (keyData.bnShift ? charStatsMap.get(keyData.bnShift) : undefined);

    return (
      <div
        key={keyData.keyCode}
        title={
          stat
            ? `${keyData.bn}: নির্ভুলতা ${toBengaliNumber(stat.accuracy)}%, ভুল ${toBengaliNumber(stat.errors)} বার`
            : `${keyData.bn} (এখনও প্র্যাকটিস ডাটা নেই)`
        }
        className={`h-12 ${keyData.width || "flex-1"} min-w-[32px] rounded-lg border flex flex-col items-center justify-center p-1 transition-all select-none hover:scale-105 ${keyColor}`}
      >
        <span className="text-xs opacity-60 font-mono leading-none">{keyData.key}</span>
        <span className="text-sm font-bold font-headline leading-none mt-0.5">
          {keyData.bnShift ? `${keyData.bnShift} ${keyData.bn}` : keyData.bn}
        </span>
      </div>
    );
  };

  return (
    <Card className={`border shadow-sm ${className || ""}`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold font-headline">
              কীবোর্ড হিটম্যাপ ও নির্ভুলতা বিশ্লেষণ (Heatmap)
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              কোন কোন কীতে আপনার হাত সবচেয়ে দ্রুত ও নির্ভুল, আর কোথায় বেশি ভুল হয় তা দেখুন।
            </CardDescription>
          </div>

          <Tabs
            value={selectedLayout}
            onValueChange={(v) => setSelectedLayout(v as KeyboardLayoutKey)}
          >
            <TabsList className="h-9 flex-wrap">
              <TabsTrigger value="banglaword" className="text-xs">BanglaWord</TabsTrigger>
              <TabsTrigger value="khipro" className="text-xs font-semibold">ক্ষিপ্র (Khipro)</TabsTrigger>
              <TabsTrigger value="probhat" className="text-xs">প্রভাত</TabsTrigger>
              <TabsTrigger value="bijoy" className="text-xs">বিজয়</TabsTrigger>
              <TabsTrigger value="avro" className="text-xs">অভ্র</TabsTrigger>
              <TabsTrigger value="unijoy" className="text-xs">ইউনিজয়</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visual Keyboard Rows */}
        <div className="p-4 bg-muted/20 border rounded-2xl space-y-2 overflow-x-auto max-w-full">
          {/* Top Row */}
          <div className="flex gap-1.5 min-w-[500px]">{layout.top.map(renderKey)}</div>

          {/* Home Row */}
          <div className="flex gap-1.5 pl-3 min-w-[500px]">{layout.home.map(renderKey)}</div>

          {/* Bottom Row */}
          <div className="flex gap-1.5 min-w-[500px]">{layout.bottom.map(renderKey)}</div>

          {/* Space Row */}
          <div className="flex justify-center pt-1 min-w-[500px]">
            <div className="w-64 h-10 rounded-lg bg-secondary/70 border border-border flex items-center justify-center text-xs text-muted-foreground font-mono">
              Spacebar (স্পেসবার)
            </div>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-green-600 border border-green-700 inline-block" />
            <span>৯৫%+ (মাস্টার্ড)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600 inline-block" />
            <span>৮৫-৯৪% (দক্ষ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-600 inline-block" />
            <span>৭০-৮৪% (প্র্যাকটিস প্রয়োজন)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-red-500 border border-red-600 inline-block" />
            <span>&lt;৭০% (দুর্বল / ঘন ঘন ভুল)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-secondary/80 border border-border inline-block" />
            <span>প্র্যাকটিস বাকি</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
