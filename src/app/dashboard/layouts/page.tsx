"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Keyboard, 
  Check, 
  Sparkles, 
  Info, 
  Zap, 
  RotateCcw, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { 
  KeyboardLayoutKey, 
  getKeyboardLayoutOptions, 
  getActiveKeyboardLayout, 
  setActiveKeyboardLayout,
  getKeyboardLayoutConfig,
  KeyboardLayoutOption
} from "@/lib/keyboard-layouts";
import { SimplifiedKeyboard } from "@/components/common/VirtualKeyboard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function LayoutsPage() {
  const [activeLayout, setActiveLayoutState] = useState<KeyboardLayoutKey>("banglaword");
  const [inspectLayout, setInspectLayout] = useState<KeyboardLayoutKey>("banglaword");
  const [showShift, setShowShift] = useState<boolean>(false);
  const [sandboxText, setSandboxText] = useState<string>("");
  const { toast } = useToast();

  const layoutOptions = getKeyboardLayoutOptions();

  useEffect(() => {
    const current = getActiveKeyboardLayout();
    setActiveLayoutState(current);
    setInspectLayout(current);
  }, []);

  const handleSelectLayout = (layoutKey: KeyboardLayoutKey) => {
    setActiveLayoutState(layoutKey);
    setInspectLayout(layoutKey);
    setActiveKeyboardLayout(layoutKey);
    toast({
      title: "কীবোর্ড লেআউট সক্রিয় করা হয়েছে",
      description: `এখন থেকে পুরো সিস্টেমে ${layoutOptions.find(o => o.value === layoutKey)?.label || layoutKey} সক্রিয় থাকবে।`,
    });
  };

  const inspectedConfig = getKeyboardLayoutConfig(inspectLayout);
  const activeOption = layoutOptions.find(o => o.value === activeLayout);

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Keyboard className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">কীবোর্ড লেআউটসমূহ (Keyboard Layouts)</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            আপনার পছন্দের বাংলা কীবোর্ড বিন্যাস বেছে নিন এবং লাইভ কীবোর্ডে প্রতিটি অক্ষর ও আঙুলের অবস্থান পর্যবেক্ষণ করুন।
          </p>
        </div>

        {/* Current Active Layout Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/50 border shadow-xs self-start md:self-auto">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <div className="text-left">
            <span className="text-[11px] font-medium text-muted-foreground block">বর্তমান সক্রিয় লেআউট:</span>
            <span className="text-sm font-bold text-foreground">
              {activeOption?.label || "লিপিঘর বাংলাওয়ার্ড"}
            </span>
          </div>
          {activeOption?.badge && (
            <Badge className="bg-primary/15 text-primary border-primary/20 text-xs font-semibold">
              {activeOption.badge}
            </Badge>
          )}
        </div>
      </div>

      {/* Layout Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-headline flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            উপলব্ধ কীবোর্ড লেআউটসমূহ ({layoutOptions.length}টি)
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            ক্লিক করে তাৎক্ষণিক পরিবর্তন করুন
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layoutOptions.map((option) => {
            const isCurrentActive = activeLayout === option.value;
            const isInspected = inspectLayout === option.value;

            return (
              <Card
                key={option.value}
                onClick={() => {
                  setInspectLayout(option.value);
                  handleSelectLayout(option.value);
                }}
                className={cn(
                  "relative cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                  isCurrentActive
                    ? "border-primary bg-primary/5 ring-4 ring-primary/15"
                    : isInspected
                    ? "border-primary/50 bg-secondary/30"
                    : "border-border hover:border-primary/30 bg-card"
                )}
              >
                <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold font-headline flex items-center gap-2">
                        {option.label}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5 font-medium text-muted-foreground">
                        {option.subtitle}
                      </CardDescription>
                    </div>

                    {isCurrentActive ? (
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      option.badge && (
                        <Badge variant="outline" className="text-[10px] shrink-0 font-medium">
                          {option.badge}
                        </Badge>
                      )
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-4 sm:px-5 pb-4 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className={cn(
                      "font-semibold",
                      isCurrentActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {isCurrentActive ? "সক্রিয় লেআউট" : "ক্লিক করে সক্রিয় করুন"}
                    </span>
                    <Button
                      size="sm"
                      variant={isCurrentActive ? "default" : "outline"}
                      className="h-7 text-xs px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectLayout(option.value);
                        handleSelectLayout(option.value);
                      }}
                    >
                      {isCurrentActive ? "নির্বাচিত ✓" : "বেছে নিন"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Interactive Visual Keyboard Preview Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg sm:text-xl font-bold font-headline">
                  লাইভ কীবোর্ড প্রিভিউ: {inspectedConfig.label}
                </CardTitle>
                {activeLayout === inspectLayout && (
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30 text-[11px]">
                    বর্তমানে সক্রিয়
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                নির্বাচিত লেআউটের অক্ষর বিন্যাস ও প্রতিটি কী চাপার আঙ্গুলের নির্দেশিকা নিচে দেখুন।
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={showShift ? "default" : "outline"}
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={() => setShowShift(!showShift)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{showShift ? "Shift ভিউ সক্রিয়" : "Shift ভিউ দেখুন"}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* Virtual Keyboard Component */}
          <div className="p-3 sm:p-5 rounded-2xl bg-secondary/30 border flex flex-col items-center justify-center overflow-x-auto">
            <div className="min-w-[650px] w-full max-w-4xl flex justify-center py-2">
              <SimplifiedKeyboard 
                layout={inspectLayout}
                needsShift={showShift}
              />
            </div>
          </div>

          {/* Special Instruction / Mechanics Card based on Layout */}
          {inspectLayout === "khipro" && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Zap className="h-4 w-4" />
                <span>ক্ষিপ্র (Khipro) জিরো-শিফট কম্পোজিশন নির্দেশিকা (m17n স্পেসিফিকেশন)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-background/80 border space-y-1">
                  <span className="font-bold text-foreground block">১. মহাপ্রাণ বর্ণ (Aspiration): h</span>
                  <p className="text-muted-foreground">
                    k+h = <b>খ</b>, g+h = <b>ঘ</b>, c+h = <b>ছ</b>, j+h = <b>ঝ</b>, t+h = <b>থ</b>, d+h = <b>ধ</b>, p+h = <b>ফ</b>, s+h = <b>শ</b>
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/80 border space-y-1">
                  <span className="font-bold text-foreground block">২. মূর্ধন্য ও বিকল্প বর্ণ: f</span>
                  <p className="text-muted-foreground">
                    t+f = <b>ট</b>, t+f+f = <b>ঠ</b>, d+f = <b>ড</b>, d+f+f = <b>ঢ</b>, n+f = <b>ণ</b>, s+f = <b>ষ</b>, r+f = <b>ড়</b>, k+f = <b>ক্ষ</b>
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/80 border space-y-1">
                  <span className="font-bold text-foreground block">৩. স্বরবর্ণ ও ডাইগ্রাফ চেইনিং</span>
                  <p className="text-muted-foreground">
                    o = <b>অ</b>, a = <b>আ/া</b>, i+i = <b>ঈ/ী</b>, u+u = <b>ঊ/ূ</b>, w = <b>ও/ো</b>, w+i = <b>ঐ/ৈ</b>, w+u = <b>ঔ/ৌ</b>, q = <b>ঋ/ৃ</b>
                  </p>
                </div>
              </div>
            </div>
          )}

          {inspectLayout === "banglaword" && (
            <div className="p-4 rounded-xl bg-secondary/40 border space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                <Info className="h-4 w-4 text-primary" />
                <span>লিপিঘর বাংলাওয়ার্ড লেআউট বৈশিষ্ট্য</span>
              </div>
              <p>
                ধ্বনিভিত্তিক স্বাভাবিক টাইপিং — যেমন: k চাপলে ক, Shift+k চাপলে খ। স্বরবর্ণের ক্ষেত্রে একা টাইপ করলে পূর্ণ স্বরবর্ণ (Shift+a = অ, a = আ) এবং ব্যঞ্জনবর্ণের পর টাইপ করলে কার-চিহ্ন তৈরি হয়।
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Interactive Typing Sandbox */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg font-bold font-headline flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            পরীক্ষামূলক টাইপিং বক্স (Typing Sandbox)
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            নির্বাচিত লেআউটে সরাসরি বাংলা টাইপ করে দেখুন এবং টাইপিং অনুভূতি যাচাই করুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              placeholder="এখানে সরাসরি টাইপ করে পরীক্ষা করুন (যেমন: আমার সোনার বাংলা...)"
              className="font-hind text-base sm:text-lg h-12"
            />
            {sandboxText && (
              <Button 
                variant="outline" 
                onClick={() => setSandboxText("")}
                className="shrink-0 h-12 text-xs"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                মুছে ফেলুন
              </Button>
            )}
          </div>
          {sandboxText && (
            <div className="p-3 rounded-xl bg-muted/30 border flex items-center justify-between text-xs text-muted-foreground">
              <span>অক্ষর সংখ্যা: <b className="text-foreground font-mono">{sandboxText.length}</b></span>
              <span>শব্দ সংখ্যা: <b className="text-foreground font-mono">{sandboxText.trim().split(/\s+/).filter(Boolean).length}</b></span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
