"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Target,
  BookCheck,
  Award,
  ArrowRight,
  Timer,
  Gamepad2,
  BrainCircuit,
  AlertTriangle,
  Calendar,
  Keyboard,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import type { UserTypingStats, WeakCharacterView } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { generateDailyPlan, type DailyTrainingPlan } from "@/lib/learning/recommender";
import { toBengaliNumber } from "@/lib/utils";
import KeyboardHeatmap from "@/components/analytics/KeyboardHeatmap";
import GraphemeMasteryGrid from "@/components/analytics/GraphemeMasteryGrid";
import TypingRhythmChart from "@/components/analytics/TypingRhythmChart";

const StatCard = ({
  icon: Icon,
  title,
  value,
  unit,
  highlight,
  loading,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  unit: string;
  highlight?: boolean;
  loading?: boolean;
}) => (
  <Card className={highlight ? "border-primary/50 bg-primary/5 shadow-xs" : "border shadow-xs"}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
    </CardHeader>
    <CardContent>
      {loading ? (
        <>
          <Skeleton className="mb-1 h-7 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </>
      ) : (
        <>
          <div className={`text-2xl font-extrabold ${highlight ? "text-primary" : "text-foreground"}`}>
            {toBengaliNumber(value)}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{unit}</p>
        </>
      )}
    </CardContent>
  </Card>
);

const quickActions = [
  { href: "/dashboard/lessons", icon: BookCheck, label: "পাঠক্রম (Levels 0–12)", description: "ধাপে ধাপে মাস্টার হন" },
  { href: "/dashboard/layouts", icon: Keyboard, label: "কীবোর্ড লেআউটসমূহ", description: "বাংলাওয়ার্ড, ক্ষিপ্র ও অন্যান্য" },
  { href: "/dashboard/test", icon: Timer, label: "টাইপিং টেস্ট ও পরীক্ষা", description: "গতি ও সনদ মূল্যায়ন" },
  { href: "/dashboard/practice/mistakes", icon: AlertTriangle, label: "ভুল সংশোধন হাব", description: "দুর্বলতা দূর করুন" },
  { href: "/game", icon: Gamepad2, label: "টাইপিং গেম", description: "মজা করে অনুশীলন" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserTypingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [weakChars, setWeakChars] = useState<WeakCharacterView[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyTrainingPlan | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoadingStats(false);
        return;
      }
      setLoadingStats(true);
      try {
        const { data: tests, error } = await supabase
          .from("test_results")
          .select("wpm, accuracy, lesson_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        if (tests && tests.length > 0) {
          let totalWpm = 0,
            totalAccuracy = 0,
            highestWpm = 0;
          const lessonIds = new Set();
          for (const t of tests as any[]) {
            const wpm = t.wpm || 0;
            totalWpm += wpm;
            totalAccuracy += t.accuracy || 0;
            if (t.lesson_id) lessonIds.add(t.lesson_id);
            if (wpm > highestWpm) highestWpm = wpm;
          }
          setStats({
            averageWpm: Math.round(totalWpm / tests.length) || 0,
            averageAccuracy: Math.round(totalAccuracy / tests.length) || 0,
            lessonsCompleted: lessonIds.size || 0,
            testsTaken: tests.length || 0,
            highestWpm,
          });
        } else {
          setStats(null);
        }
      } catch {
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  // Fetch weak characters and generate daily recommendations
  useEffect(() => {
    const fetchWeak = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("user_weak_characters")
          .select("*")
          .eq("user_id", user.id)
          .lt("accuracy_rate", 95)
          .order("accuracy_rate", { ascending: true })
          .limit(20);

        if (!error && data) {
          const wcs = data as WeakCharacterView[];
          setWeakChars(wcs);
          const plan = generateDailyPlan(wcs);
          setDailyPlan(plan);
        }
      } catch {
        // Silent fallback
      }
    };
    fetchWeak();
  }, [user]);

  const welcomeName = user?.user_metadata?.display_name || "শিক্ষার্থী";

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-headline text-foreground">
            স্বাগতম, {welcomeName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            আপনার আজকের টাইপিং অগ্রগতি ও পারফরম্যান্স বিশ্লেষণ পর্যালোচনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="bg-primary text-primary-foreground font-bold shadow-xs">
            <Link href="/dashboard/lessons">
              পাঠক্রম চালিয়ে যান <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Zap}
          title="গড় গতি"
          value={`${toBengaliNumber(stats?.averageWpm || 0)} WPM`}
          unit="শব্দ প্রতি মিনিট"
          loading={loadingStats}
        />
        <StatCard
          icon={Target}
          title="গড় নির্ভুলতা"
          value={`${toBengaliNumber(stats?.averageAccuracy || 0)}%`}
          unit="সর্বশেষ টেস্টসমূহ"
          loading={loadingStats}
        />
        <StatCard
          icon={BookCheck}
          title="সম্পন্ন পাঠ"
          value={`${toBengaliNumber(stats?.lessonsCompleted || 0)}`}
          unit="পাঠ ও ড্রিল সম্পন্ন"
          loading={loadingStats}
        />
        <StatCard
          icon={Award}
          title="ব্যক্তিগত সেরা (PB)"
          value={`${toBengaliNumber(stats?.highestWpm || 0)} WPM`}
          unit={`মোট টেস্ট: ${toBengaliNumber(stats?.testsTaken || 0)}`}
          highlight
          loading={loadingStats}
        />
      </div>

      {/* Daily Training Plan & Practice Mistakes Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Training Plan Card (§43) */}
        <Card className="md:col-span-2 border shadow-sm bg-gradient-to-br from-primary/5 via-card to-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold font-headline">
                  আজকের প্রস্তাবিত প্রশিক্ষণ (Today&apos;s Training Plan)
                </CardTitle>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                ১০ মিনিট
              </Badge>
            </div>
            <CardDescription className="text-xs">
              আপনার সাম্প্রতিক পারফরম্যান্স ও ভুলের ওপর ভিত্তি করে তৈরি অ্যাডাপটিভ প্ল্যান।
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/40 border space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                আজকের ফোকাস দক্ষতা:
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                {dailyPlan && dailyPlan.focusSkills.length > 0 ? (
                  dailyPlan.focusSkills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-base px-3 py-1 font-bold font-headline">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <>
                    <Badge variant="secondary" className="text-base px-3 py-1 font-bold font-headline">ক্ষ</Badge>
                    <Badge variant="secondary" className="text-base px-3 py-1 font-bold font-headline">জ্ঞ</Badge>
                    <Badge variant="secondary" className="text-base px-3 py-1 font-bold font-headline">ৌ</Badge>
                  </>
                )}
                <span className="text-xs text-muted-foreground ml-2">
                  (হসন্ত ও কার রূপান্তর অনুশীলন)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground font-bold gap-2">
                <Link href="/dashboard/practice/mistakes">
                  <BrainCircuit className="h-4 w-4" /> প্রশিক্ষণ শুরু করুন
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/dashboard/test">টেস্ট দিন</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Launchers Card */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold font-headline">দ্রুত এক্সেস</CardTitle>
            <CardDescription className="text-xs">প্রধান ফিচারসমূহ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <action.icon className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Rhythm Velocity Chart */}
      <TypingRhythmChart />

      {/* Keyboard Heatmap Analyzer */}
      <KeyboardHeatmap weakChars={weakChars} />

      {/* Grapheme Mastery Grid */}
      <GraphemeMasteryGrid weakChars={weakChars} />
    </div>
  );
}
