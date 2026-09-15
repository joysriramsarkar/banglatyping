"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, Check } from "lucide-react";

export type DifficultyRating = "too-hard" | "good" | "too-easy";

interface DifficultyFeedbackProps {
  onFeedback: (rating: DifficultyRating) => void;
  className?: string;
}

export default function DifficultyFeedback({ onFeedback, className }: DifficultyFeedbackProps) {
  const [selected, setSelected] = useState<DifficultyRating | null>(null);

  const handleSelect = (rating: DifficultyRating) => {
    setSelected(rating);
    onFeedback(rating);
  };

  if (selected) {
    return (
      <div className={`text-center py-2 px-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-center justify-center gap-2 ${className || ""}`}>
        <Check className="h-4 w-4 text-green-500" />
        <span>মতামতের জন্য ধন্যবাদ! পরবর্তীতে অনুশীলন এর সাথে সামঞ্জস্যপূর্ণ হবে।</span>
      </div>
    );
  }

  return (
    <Card className={`border shadow-xs bg-card/60 backdrop-blur ${className || ""}`}>
      <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground text-center sm:text-left">
          এই অনুশীলনের কাঠিন্য মাত্রা কেমন লেগেছে?
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 hover:border-red-400 hover:text-red-500"
            onClick={() => handleSelect("too-hard")}
          >
            <Frown className="h-3.5 w-3.5 text-red-500" /> খুব কঠিন
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 hover:border-blue-400 hover:text-blue-500"
            onClick={() => handleSelect("good")}
          >
            <Meh className="h-3.5 w-3.5 text-blue-500" /> ঠিক আছে
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 hover:border-green-400 hover:text-green-500"
            onClick={() => handleSelect("too-easy")}
          >
            <Smile className="h-3.5 w-3.5 text-green-500" /> খুব সহজ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
