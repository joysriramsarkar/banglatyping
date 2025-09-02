"use client";

import { cn } from "@/lib/utils";
import React from "react";

const Key = ({
  char,
  className,
  isActive = false,
}: {
  char: string;
  className?: string;
  isActive?: boolean;
}) => (
  <div
    className={cn(
      "flex items-center justify-center h-12 rounded-md border bg-card text-card-foreground shadow-sm transition-all",
      isActive ? "bg-primary text-primary-foreground scale-110" : "bg-background",
      className
    )}
  >
    {char}
  </div>
);

const keyboardLayout = [
  ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ"],
  ["ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব"],
  ["ভ", "ম", "য", "র", "ল", "শ", "ষ", "স", "হ", "ড়", "ঢ়", "য়"],
  [" ", "ৎ", "ং", "ঃ", "ঁ"],
  ["া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ"]
];

// This is a simplified representation. A real implementation would need complex mapping.
const charToKeyMap: { [key: string]: string } = {
  "া": "া", "ি": "ি", "ী": "ী", "ু": "ু", "ূ": "ূ", "ৃ": "ৃ", "ে": "ে", "ৈ": "ৈ", "ো": "ো", "ৌ": "ৌ",
};

export function VirtualKeyboard({ nextChar }: { nextChar: string | null }) {
  const activeKey = nextChar ? (charToKeyMap[nextChar.normalize("NFC")] || nextChar.normalize("NFC")) : null;

  return (
    <div className="p-4 bg-secondary/50 rounded-lg">
      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((char, charIndex) => (
              <Key key={charIndex} char={char} isActive={activeKey === char} className={char === " " ? "w-48" : "w-12"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
