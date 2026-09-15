"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { GraduationCap, Check } from "lucide-react";
import {
  getStoredUserMode,
  saveStoredUserMode,
  USER_MODE_CONFIGS,
  type UserMode,
} from "@/lib/user-mode";

export default function UserModeSelector() {
  const [currentMode, setCurrentMode] = useState<UserMode>("beginner");

  useEffect(() => {
    setCurrentMode(getStoredUserMode());
  }, []);

  const handleSelectMode = (mode: UserMode) => {
    setCurrentMode(mode);
    saveStoredUserMode(mode);
  };

  const activeConfig = USER_MODE_CONFIGS[currentMode];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-semibold">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">{activeConfig.label}</span>
          <span className="sm:hidden">{currentMode === "beginner" ? "সহজ" : currentMode === "intermediate" ? "মধ্যম" : "উন্নত"}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          লার্নার মোড নির্বাচন
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(["beginner", "intermediate", "advanced"] as UserMode[]).map((mode) => {
          const cfg = USER_MODE_CONFIGS[mode];
          const isSelected = currentMode === mode;

          return (
            <DropdownMenuItem
              key={mode}
              onClick={() => handleSelectMode(mode)}
              className={`p-2.5 rounded-lg cursor-pointer flex flex-col items-start gap-1 my-1 transition-all ${
                isSelected ? "bg-primary/10 border-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {cfg.label}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {cfg.description}
              </p>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
