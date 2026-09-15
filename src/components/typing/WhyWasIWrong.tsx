"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import { getErrorExplanation, classifyGraphemeError } from "@/lib/typing/error-classifier";
import type { ErrorType } from "@/lib/types";
import { toBengaliNumber } from "@/lib/utils";

export interface MistakeDetail {
  expected: string;
  actual: string;
  errorType?: ErrorType | null;
  count?: number;
}

interface WhyWasIWrongProps {
  mistakes: MistakeDetail[];
  onStartMicroDrill?: (chars: string[]) => void;
  className?: string;
}

export default function WhyWasIWrong({ mistakes, onStartMicroDrill, className }: WhyWasIWrongProps) {
  const [selectedMistake, setSelectedMistake] = useState<MistakeDetail | null>(
    mistakes.length > 0 ? mistakes[0] : null
  );

  if (mistakes.length === 0) return null;

  const current = selectedMistake || mistakes[0];
  const classifiedType = current.errorType || classifyGraphemeError(current.expected, current.actual) || 'wrong-key';
  const explanation = getErrorExplanation(classifiedType);

  return (
    <Card className={`border shadow-sm bg-card overflow-hidden ${className || ""}`}>
      <CardHeader className="bg-amber-500/10 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-base font-bold font-headline text-amber-900 dark:text-amber-100">
              ভুল কেন হলো? (ত্রুটি বিশ্লেষণ)
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300">
            {toBengaliNumber(mistakes.length)}টি ত্রুটি শনাক্ত
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          ভুল চিহ্নিত করে সমাধান জানুন এবং তাত্ক্ষণিক মাইক্রো-ড্রিলের মাধ্যমে শুধরে নিন।
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Horizontal scroll list of error badges */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {mistakes.map((m, idx) => {
            const isSelected = selectedMistake?.expected === m.expected && selectedMistake?.actual === m.actual;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedMistake(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs scale-105"
                    : "bg-secondary/60 hover:bg-secondary border-border text-foreground"
                }`}
              >
                <span className="text-red-500 line-through text-xs font-mono">{m.actual || "␣"}</span>
                <ArrowRight className="h-3 w-3 opacity-60" />
                <span className="text-green-600 dark:text-green-400 font-bold">{m.expected}</span>
                {m.count && m.count > 1 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-black/10 dark:bg-white/10 rounded-full text-[10px]">
                    ×{toBengaliNumber(m.count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Deep dive detail for current selected mistake */}
        <div className="p-4 rounded-xl bg-secondary/30 border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="text-center p-2.5 rounded-lg bg-background border shadow-xs min-w-[50px]">
                <span className="text-xs text-muted-foreground block">প্রত্যাশিত</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {current.expected}
                </span>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-background border shadow-xs min-w-[50px]">
                <span className="text-xs text-muted-foreground block">টাইপ করেছেন</span>
                <span className="text-2xl font-bold text-red-500">
                  {current.actual || "বাদ গেছে"}
                </span>
              </div>
            </div>

            <Badge variant="secondary" className="self-start sm:self-center font-mono text-xs">
              ধরন: {classifiedType}
            </Badge>
          </div>

          <div className="text-sm font-medium text-foreground bg-background/80 p-3 rounded-lg border">
            <p className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{explanation}</span>
            </p>
          </div>

          {/* Action button: Practice these mistakes */}
          {onStartMicroDrill && (
            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                onClick={() => onStartMicroDrill([current.expected])}
                className="bg-primary text-primary-foreground gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" /> &quot;{current.expected}&quot; এখনই শুধরে নিন
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
