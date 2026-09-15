"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WeakCharacterView } from "@/lib/types";
import { toBengaliNumber } from "@/lib/utils";

interface GraphemeGroup {
  category: string;
  items: string[];
}

const GRAPHEME_GROUPS: GraphemeGroup[] = [
  {
    category: "স্বরবর্ণ (Vowels)",
    items: ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ"],
  },
  {
    category: "কার (Vowel Signs)",
    items: ["া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ"],
  },
  {
    category: "মৌলিক ব্যঞ্জনবর্ণ (Consonants)",
    items: [
      "ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ",
      "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন",
      "প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ",
      "স", "হ", "ড়", "ঢ়", "য়", "ৎ"
    ],
  },
  {
    category: "যুক্তাক্ষর ও বিশেষ চিহ্ন (Conjuncts & Signs)",
    items: [
      "ক্ষ", "জ্ঞ", "ত্র", "শ্র", "হ্ম", "ক্ত", "ন্ত", "ন্দ", "ন্ধ",
      "স্থ", "স্ত", "ম্প", "ম্ব", "চ্ছ", "জ্জ", "ষ্ট", "ষ্ঠ", "ঁ", "ং", "ঃ", "্"
    ],
  },
];

interface GraphemeMasteryGridProps {
  weakChars?: WeakCharacterView[];
  className?: string;
}

export default function GraphemeMasteryGrid({ weakChars = [], className }: GraphemeMasteryGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  const displayedGroups = useMemo(() => {
    if (activeCategory === "all") return GRAPHEME_GROUPS;
    return GRAPHEME_GROUPS.filter((g) => g.category.includes(activeCategory));
  }, [activeCategory]);

  return (
    <Card className={`border shadow-sm ${className || ""}`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold font-headline">
              বাংলা বর্ণ ও যুক্তাক্ষর দক্ষতা গ্রিড (Grapheme Mastery)
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              বাংলা স্বরবর্ণ, ব্যঞ্জনবর্ণ, কার ও যুক্তাক্ষরসমূহের পারফরম্যান্স ও দক্ষতা স্তর পর্যালোচনা করুন।
            </CardDescription>
          </div>

          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">সব</TabsTrigger>
              <TabsTrigger value="স্বরবর্ণ" className="text-xs">স্বরবর্ণ</TabsTrigger>
              <TabsTrigger value="কার" className="text-xs">কার</TabsTrigger>
              <TabsTrigger value="ব্যঞ্জনবর্ণ" className="text-xs">ব্যঞ্জনবর্ণ</TabsTrigger>
              <TabsTrigger value="যুক্তাক্ষর" className="text-xs">যুক্তাক্ষর</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {displayedGroups.map((group) => (
          <div key={group.category} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
              {group.category}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
              {group.items.map((char) => {
                const stat = charStatsMap.get(char);
                const hasData = !!stat;
                const accuracy = stat?.accuracy ?? 100;
                const isMastered = hasData && accuracy >= 97;
                const isProficient = hasData && accuracy >= 85 && accuracy < 97;
                const isNeedsReview = hasData && accuracy < 85;

                return (
                  <div
                    key={char}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-between text-center ${
                      isNeedsReview
                        ? "border-red-500/40 bg-red-500/5"
                        : isMastered
                        ? "border-green-500/40 bg-green-500/5"
                        : isProficient
                        ? "border-blue-500/40 bg-blue-500/5"
                        : "border-border bg-card hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-2xl font-bold font-headline text-foreground my-1">
                      {char}
                    </span>

                    <div className="w-full pt-1">
                      {hasData ? (
                        <div className="space-y-1">
                          <span
                            className={`text-[11px] font-bold block ${
                              isNeedsReview
                                ? "text-red-600 dark:text-red-400"
                                : isMastered
                                ? "text-green-600 dark:text-green-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {toBengaliNumber(accuracy)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {isMastered ? "মাস্টার্ড" : isProficient ? "দক্ষ" : "রিভিউ দরকার"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground block">
                          নতুন
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
