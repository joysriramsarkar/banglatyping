"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  RefreshCw,
  Zap,
  Target,
  XCircle,
  Timer as TimerIcon,
  Home,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { TypingStats, Lesson, ExtendedTypingStats } from "@/lib/types";
import { useEffect, useRef, useMemo } from "react";
import Certificate from "./certificate";
import WhyWasIWrong, { MistakeDetail } from "./typing/WhyWasIWrong";
import DifficultyFeedback from "./typing/DifficultyFeedback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { lessons } from "@/lib/lessons";
import { getNextCurriculumLesson } from "@/lib/curriculum/curriculum-data";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const toBengaliNumber = (num: number | string) => {
  if (typeof num === "undefined" || num === null) return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const StatItem = ({
  icon: Icon,
  label,
  value,
  unit,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}) => (
  <div
    className={`flex items-center justify-between py-2 border-b ${
      highlight ? "bg-primary/5 rounded px-2 -mx-2" : ""
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`h-5 w-5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
    <span className={`font-semibold text-lg ${highlight ? "text-primary" : ""}`}>
      {toBengaliNumber(value)} {unit}
    </span>
  </div>
);

function consistencyColor(score: number): string {
  if (score >= 85) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  return "text-red-500";
}

export default function TestResults({
  stats,
  onRestart,
  lessonId,
  isDrill = false,
  customDrill: _customDrill,
  accuracyGoal = 95,
}: {
  stats: TypingStats | ExtendedTypingStats;
  onRestart: () => void;
  lessonId?: string;
  isDrill?: boolean;
  customDrill?: () => void;
  accuracyGoal?: number;
}) {
  const { wpm, accuracy, errors, timeElapsed, erredCharacters = [] } = stats;

  // Extended stats
  const extStats = "gpm" in stats ? (stats as ExtendedTypingStats) : null;
  const gpm = extStats?.gpm;
  const cpm = extStats?.cpm;
  const grossWpm = extStats?.grossWpm;
  const consistency = extStats?.consistency;
  const correctedErrors = extStats?.correctedErrors;
  const uncorrectedErrors = extStats?.uncorrectedErrors ?? errors;
  const longestStreak = extStats?.longestStreak;

  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const hasSavedResult = useRef(false);

  const isSpeedPassed = wpm >= 25;
  const isAccuracyPassed = accuracy >= accuracyGoal;
  const passedDrill = isDrill && isSpeedPassed && isAccuracyPassed;
  const canGetCertificate = !isDrill && wpm >= 40 && accuracy >= 95;

  const drillSummaryDescription = useMemo(() => {
    if (!isDrill) {
      return "আপনার বাংলা টাইপিং টেস্টের বিস্তারিত পারফরম্যান্স সারাংশ।";
    }
    if (passedDrill) {
      return `অভিনন্দন! গতি ${toBengaliNumber(wpm)} WPM (লক্ষ্য: ২৫ WPM) এবং নির্ভুলতা ${toBengaliNumber(accuracy)}% (লক্ষ্য: ${toBengaliNumber(accuracyGoal)}%) অর্জিত হয়েছে।`;
    }
    if (!isSpeedPassed && !isAccuracyPassed) {
      return `গতি এবং নির্ভুলতা উভয় লক্ষ্য অপূর্ণ রয়েছে — গতি: ${toBengaliNumber(wpm)} WPM (প্রয়োজন: ২৫ WPM), নির্ভুলতা: ${toBengaliNumber(accuracy)}% (প্রয়োজন: ${toBengaliNumber(accuracyGoal)}%)।`;
    }
    if (!isSpeedPassed) {
      return `গতির লক্ষ্য অপূর্ণ থাকায় ব্যর্থ হয়েছে — আপনার গতি ছিল ${toBengaliNumber(wpm)} WPM (প্রয়োজন: সর্বনিম্ন ২৫ WPM)। নির্ভুলতা ছিল ${toBengaliNumber(accuracy)}% (সফল)।`;
    }
    return `নির্ভুলতার লক্ষ্য অপূর্ণ থাকায় ব্যর্থ হয়েছে — আপনার নির্ভুলতা ছিল ${toBengaliNumber(accuracy)}% (প্রয়োজন: সর্বনিম্ন ${toBengaliNumber(accuracyGoal)}%)। গতি ছিল ${toBengaliNumber(wpm)} WPM (সফল)।`;
  }, [isDrill, passedDrill, isSpeedPassed, isAccuracyPassed, wpm, accuracy, accuracyGoal]);

  let nextLesson: { id: string; title?: string } | null = null;
  if (lessonId) {
    const currentLessonIndex = lessons.findIndex((l) => l.id === lessonId);
    if (currentLessonIndex !== -1 && currentLessonIndex < lessons.length - 1) {
      nextLesson = lessons[currentLessonIndex + 1];
    } else {
      const curr = getNextCurriculumLesson(lessonId);
      if (curr) nextLesson = curr;
    }
  }

  const showNextLessonButton = passedDrill && nextLesson;

  // Handle Enter key for next lesson or restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (showNextLessonButton && nextLesson) {
          router.push(`/dashboard/practice/${nextLesson.id}`);
        } else if (onRestart) {
          onRestart();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showNextLessonButton, nextLesson, onRestart, router]);

  // Format erred characters for WhyWasIWrong
  const mistakeDetails: MistakeDetail[] = useMemo(() => {
    return (erredCharacters || []).map((err) => ({
      expected: err.char,
      actual: "",
      count: err.count,
    }));
  }, [erredCharacters]);

  useEffect(() => {
    const saveResults = async () => {
      if (user && !hasSavedResult.current) {
        hasSavedResult.current = true;
        try {
          const response = await apiFetch("/api/user-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              lessonId: lessonId || "typing-test",
              wpm,
              accuracy,
              errors,
              timeElapsed,
              erredCharacters,
            }),
          });

          if (!response.ok) throw new Error("Failed to save");
          toast({ title: "সাফল্য!", description: "আপনার ফলাফল সংরক্ষণ করা হয়েছে।" });
        } catch (error) {
          console.error("Error saving results: ", error);
          toast({ variant: "destructive", title: "ত্রুটি", description: "ফলাফল সংরক্ষণ করা যায়নি।" });
          hasSavedResult.current = false;
        }
      }
    };

    if (stats.timeElapsed > 0) {
      saveResults();
    }
  }, [user, stats, lessonId, toast, accuracy, erredCharacters, errors, timeElapsed, wpm]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (actionButtonRef.current) {
          actionButtonRef.current.click();
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="border shadow-lg">
        <CardHeader className="text-center pb-4">
          <Award className="mx-auto h-14 w-14 text-yellow-500" />
          <CardTitle className="text-3xl font-bold font-headline">
            {isDrill ? (passedDrill ? "অনুশীলন সফল!" : "অনুশীলন ব্যর্থ") : "টেস্ট ফলাফল ও মূল্যায়ন"}
          </CardTitle>
          <CardDescription className="text-sm font-medium mt-1">
            {drillSummaryDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-8 pt-2">
          <div className="space-y-6">
            {/* Primary metrics — GPM is the Bengali-primary metric */}
            <div className={`grid gap-4 text-center ${gpm !== undefined ? "grid-cols-3" : "grid-cols-2"}`}>
              {gpm !== undefined && (
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-xs">
                  <p className="text-xs text-muted-foreground font-medium">গতি (GPM)</p>
                  <p className="text-4xl font-extrabold text-primary">{toBengaliNumber(gpm)}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">বর্ণ/মিনিট</p>
                </div>
              )}
              <div className="p-4 bg-secondary rounded-xl shadow-xs">
                <p className="text-xs text-muted-foreground font-medium">গতি (WPM)</p>
                <p className="text-4xl font-extrabold text-primary">{toBengaliNumber(wpm)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">শব্দ/মিনিট</p>
              </div>
              <div className="p-4 bg-secondary rounded-xl shadow-xs">
                <p className="text-xs text-muted-foreground font-medium">নির্ভুলতা</p>
                <p className="text-4xl font-extrabold text-primary">{toBengaliNumber(accuracy)}%</p>
                <p className="text-[11px] text-muted-foreground mt-1">নির্ভুলতার হার</p>
              </div>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-2 text-base">
              {grossWpm !== undefined && grossWpm !== wpm && (
                <StatItem icon={Zap} label="গ্রস গতি (Gross WPM)" value={grossWpm} unit="শব্দ/মিনিট" />
              )}
              {cpm !== undefined && <StatItem icon={Activity} label="অক্ষর প্রতি মিনিট (CPM)" value={cpm} />}
              {consistency !== undefined && (
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-3">
                    <TrendingUp className={`h-5 w-5 ${consistencyColor(consistency)}`} />
                    <span className="text-muted-foreground">স্থিরতা (Consistency)</span>
                  </div>
                  <span className={`font-semibold text-lg ${consistencyColor(consistency)}`}>
                    {toBengaliNumber(consistency)}/১০০
                  </span>
                </div>
              )}
              <StatItem
                icon={Target}
                label="সঠিক অক্ষর"
                value={
                  cpm !== undefined
                    ? Math.max(0, Math.round(cpm * (Math.max(timeElapsed, 1) / 60)) - uncorrectedErrors)
                    : Math.max(
                        0,
                        Math.round((grossWpm ?? wpm) * 5 * (Math.max(timeElapsed, 1) / 60) * (accuracy / 100))
                      )
                }
              />
              {correctedErrors !== undefined && (
                <StatItem icon={CheckCircle} label="সংশোধিত ভুল" value={correctedErrors} />
              )}
              <StatItem icon={XCircle} label="অসংশোধিত ভুল" value={uncorrectedErrors} />
              <StatItem icon={TimerIcon} label="সময়কাল" value={timeElapsed} unit="সেকেন্ড" />
              {longestStreak !== undefined && longestStreak > 0 && (
                <StatItem icon={Zap} label="দীর্ঘতম ধারা (Streak)" value={longestStreak} unit="অক্ষর" />
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              {canGetCertificate && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold gap-2">
                      <Award className="h-4 w-4" /> অফিসিয়াল সার্টিফিকেট দেখুন ও ডাউনলোড করুন
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0">
                    <DialogHeader className="sr-only">
                      <DialogTitle>সাফল্যের সনদপত্র</DialogTitle>
                    </DialogHeader>
                    <Certificate
                      name={user?.user_metadata?.display_name || "ব্যবহারকারী"}
                      wpm={wpm}
                      accuracy={accuracy}
                    />
                  </DialogContent>
                </Dialog>
              )}

              {/* Practice My Mistakes Flagship button */}
              {erredCharacters.length > 0 && (
                <Button
                  onClick={() => router.push("/dashboard/practice/mistakes")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold gap-2 shadow-sm"
                >
                  <AlertTriangle className="h-4 w-4" /> ভুলগুলো শুধরে নিন
                </Button>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {showNextLessonButton ? (
                  <Button
                    ref={actionButtonRef}
                    onClick={() => router.push(`/dashboard/practice/${nextLesson?.id}`)}
                    className="w-full"
                  >
                    পরবর্তী পাঠ ({nextLesson?.title ? nextLesson.title.split(':')[0] : 'পরের ধাপ'})
                    <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-primary-foreground/20 rounded">
                      Enter ↵
                    </kbd>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button ref={actionButtonRef} onClick={onRestart} variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> পুনরায় টেস্ট দিন
                  </Button>
                )}
                <Button onClick={() => router.push("/dashboard/lessons")} variant="secondary" className="w-full">
                  <Home className="mr-2 h-4 w-4" /> পাঠক্রমে ফিরে যান
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Erred Characters & Feedback */}
          <div className="space-y-6">
            {erredCharacters && erredCharacters.length > 0 ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">ভুলপ্রবণ অক্ষর চার্ট</CardTitle>
                  <CardDescription className="text-xs">
                    যে অক্ষরগুলোতে আপনি সবচেয়ে বেশি ভুল করেছেন।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={erredCharacters}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="char" />
                      <YAxis
                        allowDecimals={false}
                        tickFormatter={(val: number) => toBengaliNumber(val)}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))" }}
                        formatter={(value: number) => [`${toBengaliNumber(value)}টি`, "ভুলের সংখ্যা"]}
                        labelFormatter={(label) => `অক্ষর: ${label}`}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" name="ভুলের সংখ্যা" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
                <h4 className="font-bold text-foreground">কোনো ভুল হয়নি!</h4>
                <p className="text-xs text-muted-foreground">
                  আপনার ১০০% নির্ভুল টাইপিং দক্ষতা সত্যিই প্রশংসনীয়।
                </p>
              </div>
            )}

            {/* Micro-survey difficulty feedback */}
            <DifficultyFeedback onFeedback={(rating) => console.log("Feedback rating:", rating)} />
          </div>
        </CardContent>
      </Card>

      {/* Why Was I Wrong Diagnostic Section */}
      {mistakeDetails.length > 0 && (
        <WhyWasIWrong
          mistakes={mistakeDetails}
          onStartMicroDrill={() => router.push("/dashboard/practice/mistakes")}
        />
      )}
    </div>
  );
}
