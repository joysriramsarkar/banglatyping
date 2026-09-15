"use client";

import { useState } from "react";
import TypingPractice from "@/components/typing-practice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Timer,
  CheckCircle,
  Home,
  ShieldAlert,
  Sparkles,
  Zap,
  Layers,
  Edit3,
} from "lucide-react";
import { cn, toBengaliNumber } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

// Themed Bengali paragraphs categorized for comprehensive testing
const THEMED_PASSAGES = [
  {
    category: "অফিস ও সরকারি পরীক্ষা (Strict Exam)",
    title: "ডিজিটাল বাংলাদেশ ও আধুনিক প্রশাসন",
    text: "ডিজিটাল বাংলাদেশ বিনির্মাণে বাংলা ভাষার সঠিক ব্যবহার ও ডিজিটাইজেশন একটি তাৎপর্যপূর্ণ পদক্ষেপ। বর্তমান যুগে প্রতিটি সরকারি ও বেসরকারি প্রতিষ্ঠানে দক্ষ বাংলা টাইপিস্টদের চাহিদা উত্তরোত্তর বৃদ্ধি পাচ্ছে। যারা নির্ভুল ও দ্রুত গতিতে টাইপ করতে পারেন, তারা দাপ্তরিক কাজে দ্রুত ফলাফল অর্জন করেন।",
  },
  {
    category: "সাহিত্য ও সংস্কৃতি",
    title: "রবীন্দ্রনাথ ও বাংলা সাহিত্য",
    text: "আমাদের ভাষা আমাদের গর্ব। হাজার বছরের ঐতিহ্য ধারণ করে বাংলা আজ বিশ্বমঞ্চে সমাদৃত। রবীন্দ্রনাথ ঠাকুর তাঁর অসামান্য রচনার মাধ্যমে বাংলা ভাষাকে আন্তর্জাতিক পরিমণ্ডলে পৌঁছে দিয়েছেন। নিয়মিত সাহিত্য পাঠ মানুষের মনের দিগন্ত উন্মোচিত করে।",
  },
  {
    category: "বিজ্ঞান ও প্রযুক্তি",
    title: "কৃত্রিম বুদ্ধিমত্তা ও ভবিষ্যৎ প্রযুক্তি",
    text: "বর্তমান পৃথিবী তথ্যপ্রযুক্তির ওপর গভীরভাবে নির্ভরশীল। ইন্টারনেটের মাধ্যমে মুহূর্তেই বিশ্বের এক প্রান্ত থেকে অন্য প্রান্তে তথ্য আদান-প্রদান করা সম্ভব হচ্ছে। বাংলা ভাষায় প্রযুক্তির প্রসার আমাদের ভাষাকে আধুনিক যুগে টিকে থাকার নতুন শক্তি জোগায়।",
  },
  {
    category: "প্রকৃতি ও পরিবেশ",
    title: "বাংলার ঋতুবৈচিত্র্য ও প্রকৃতি",
    text: "ষড়ঋতুর দেশ বাংলাদেশ। প্রতিটি ঋতু তার নিজস্ব রূপ ও সৌন্দর্যে প্রকৃতিকে সাজিয়ে তোলে। বর্ষায় কদম ফুলের সুবাস আর শরতের কাশফুলের দোলা মানুষের মনকে আনন্দে ভরিয়ে দেয়। পরিবেশের ভারসাম্য রক্ষায় প্রকৃতির যত্ন নেওয়া আমাদের সকলের দায়িত্ব।",
  },
];

const TIME_OPTIONS = [
  { seconds: 15, label: "১৫ সেকেন্ড", val: 0.25 },
  { seconds: 30, label: "৩০ সেকেন্ড", val: 0.5 },
  { seconds: 60, label: "১ মিনিট", val: 1 },
  { seconds: 120, label: "২ মিনিট", val: 2 },
  { seconds: 300, label: "৫ মিনিট", val: 5 },
];

const LENGTH_OPTIONS = [
  { chars: 50, label: "৫০ অক্ষর" },
  { chars: 100, label: "১০০ অক্ষর" },
  { chars: 250, label: "২৫০ অক্ষর" },
  { chars: 500, label: "৫০০ অক্ষর" },
];

export default function TestPage() {
  const router = useRouter();

  const [activeMode, setActiveMode] = useState<"timed" | "length" | "exam" | "custom">("timed");
  const [selectedTime, setSelectedTime] = useState<number>(1); // In minutes
  const [selectedLength, setSelectedLength] = useState<number>(100);
  const [selectedParagraph, setSelectedParagraph] = useState<string>(THEMED_PASSAGES[0].text);
  const [customText, setCustomText] = useState<string>("");
  const [isStrictExam, setIsStrictExam] = useState<boolean>(false);
  const [testStarted, setTestStarted] = useState(false);

  // Compute text according to length if in length mode
  const getPreparedText = () => {
    if (activeMode === "custom") {
      return customText.trim() || THEMED_PASSAGES[0].text;
    }
    if (activeMode === "length") {
      // Crop paragraph to target grapheme length
      const fullText = selectedParagraph;
      const graphemes = Array.from(new Intl.Segmenter("bn", { granularity: "grapheme" }).segment(fullText)).map(
        (s) => s.segment
      );
      if (graphemes.length >= selectedLength) {
        return graphemes.slice(0, selectedLength).join("");
      }
      // Repeat text if shorter
      let repeated = fullText;
      while (repeated.length < selectedLength * 2) {
        repeated += " " + fullText;
      }
      return repeated.slice(0, selectedLength * 3);
    }
    return selectedParagraph;
  };

  const startTest = (strict: boolean = false) => {
    setIsStrictExam(strict || activeMode === "exam");
    setTestStarted(true);
  };

  const restartTest = () => {
    setTestStarted(false);
  };

  if (testStarted) {
    const textToType = getPreparedText();
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {isStrictExam ? (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> কঠোর নিয়োগ পরীক্ষা মোড (Strict Exam Mode)
              </>
            ) : (
              <>
                <Timer className="h-3.5 w-3.5" /> স্ট্যান্ডার্ড টাইপিং টেস্ট
              </>
            )}
          </div>
          <h1 className="text-3xl font-extrabold font-headline">টাইপিং টেস্ট চলমান</h1>
          <p className="text-muted-foreground text-sm">
            {activeMode === "timed" && `${toBengaliNumber(selectedTime * 60)} সেকেন্ডের পরীক্ষা`}
            {activeMode === "length" && `${toBengaliNumber(selectedLength)} অক্ষরের পরীক্ষা`}
            {activeMode === "exam" && "কঠোর সরকারি/দাপ্তরিক নিয়োগ পরীক্ষা"}
            {activeMode === "custom" && "কাস্টম অনুচ্ছেদ পরীক্ষা"}
          </p>
        </div>

        <TypingPractice
          textToType={textToType}
          timeLimit={activeMode === "timed" || activeMode === "exam" ? selectedTime : undefined}
          onRestart={restartTest}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" /> মাল্টি-মোড বাংলা টেস্ট ইঞ্জিন
        </div>
        <h1 className="text-4xl font-extrabold font-headline">টাইপিং গতি ও দক্ষতা মূল্যায়ন টেস্ট</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
          বিভিন্ন সময়কাল, অক্ষরের দৈর্ঘ্য, কিংবা কঠোর সরকারি নিয়োগ পরীক্ষা সিমুলেশনের মাধ্যমে নিজের প্রকৃত বাংলা টাইপিং গতি (GPM/WPM) ও নির্ভুলতা যাচাই করুন।
        </p>
      </div>

      {/* Main Mode Configuration Card */}
      <Card className="border shadow-md">
        <CardHeader className="pb-4">
          <Tabs
            value={activeMode}
            onValueChange={(val: any) => {
              setActiveMode(val);
              if (val === "exam") setSelectedTime(2);
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5">
              <TabsTrigger value="timed" className="gap-1.5 py-2.5">
                <Timer className="h-4 w-4" /> সময়ভিত্তিক টেস্ট
              </TabsTrigger>
              <TabsTrigger value="length" className="gap-1.5 py-2.5">
                <Layers className="h-4 w-4" /> অক্ষর সংখ্যা টেস্ট
              </TabsTrigger>
              <TabsTrigger value="exam" className="gap-1.5 py-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-500" /> কঠোর নিয়োগ পরীক্ষা
              </TabsTrigger>
              <TabsTrigger value="custom" className="gap-1.5 py-2.5">
                <Edit3 className="h-4 w-4" /> কাস্টম টেক্সট
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* TAB 1: TIMED TEST */}
          {activeMode === "timed" && (
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-foreground block">
                ১. পরীক্ষার সময়সীমা নির্বাচন করুন
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t.seconds}
                    type="button"
                    onClick={() => setSelectedTime(t.val)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center",
                      selectedTime === t.val
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30 font-bold shadow-xs"
                        : "border-border hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <span className="text-lg font-bold">{toBengaliNumber(t.seconds)}</span>
                    <span className="text-xs text-muted-foreground">
                      {t.seconds < 60 ? "সেকেন্ড" : "মিনিট"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LENGTH TEST */}
          {activeMode === "length" && (
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-foreground block">
                ১. অক্ষরের দৈর্ঘ্য নির্বাচন করুন
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LENGTH_OPTIONS.map((len) => (
                  <button
                    key={len.chars}
                    type="button"
                    onClick={() => setSelectedLength(len.chars)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center",
                      selectedLength === len.chars
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30 font-bold shadow-xs"
                        : "border-border hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <span className="text-xl font-bold">{toBengaliNumber(len.chars)}</span>
                    <span className="text-xs text-muted-foreground">বাংলা বর্ণ</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STRICT EXAM MODE */}
          {activeMode === "exam" && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span>কঠোর সরকারি/দাপ্তরিক নিয়োগ পরীক্ষা মোড</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                এই মোডে কোনো কীবোর্ড ইঙ্গিত বা ভার্চুয়াল কীবোর্ড থাকবে না। ভুল হলে ব্যাকস্পেসের মাধ্যমে সংশোধন করতে হবে। সময়সীমা ২ মিনিট। ৯৫% নির্ভুলতা ও ৪০+ WPM অর্জন করলে অফিসিয়াল ভেরিফায়েড সার্টিফিকেট প্রদান করা হবে।
              </p>
            </div>
          )}

          {/* TAB 4: CUSTOM TEXT */}
          {activeMode === "custom" && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground block">
                আপনার পছন্দের বাংলা অনুচ্ছেদ পেস্ট বা টাইপ করুন
              </Label>
              <Textarea
                placeholder="এখানে আপনার বাংলা লেখা লিখুন..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={5}
                className="font-headline text-base"
              />
            </div>
          )}

          {/* PASSAGE SELECTOR (For timed, length, exam modes) */}
          {activeMode !== "custom" && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground block">
                {activeMode === "exam" ? "নিয়োগ পরীক্ষার অনুচ্ছেদ" : "অনুচ্ছেদ নির্বাচন করুন"}
              </Label>
              <ScrollArea className="h-56 w-full rounded-xl border p-2 bg-muted/20">
                <div className="space-y-2.5 p-1">
                  {THEMED_PASSAGES.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedParagraph(p.text)}
                      className={cn(
                        "p-3.5 rounded-lg border transition-all cursor-pointer relative",
                        selectedParagraph === p.text
                          ? "border-primary bg-background ring-2 ring-primary/20 shadow-xs"
                          : "border-transparent bg-background/60 hover:bg-background"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                            {p.category}
                          </span>
                          <h4 className="font-semibold text-sm text-foreground mt-1">{p.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.text}</p>
                        </div>
                        {selectedParagraph === p.text && (
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => startTest(activeMode === "exam")}
              size="lg"
              className="w-full sm:w-2/3 bg-primary text-primary-foreground font-bold text-base gap-2"
              disabled={activeMode === "custom" && !customText.trim()}
            >
              <Zap className="h-5 w-5" />
              {activeMode === "exam" ? "নিয়োগ পরীক্ষা শুরু করুন" : "টেস্ট শুরু করুন"}
            </Button>

            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="lg"
              className="w-full sm:w-1/3 gap-2"
            >
              <Home className="h-4 w-4" /> হোমে ফিরুন
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
