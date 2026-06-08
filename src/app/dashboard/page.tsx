
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Target, BookCheck, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import type { UserTypingStats, TestSummary } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const toBengaliNumber = (num: number | string) => {
    if (typeof num === 'undefined' || num === null) return '০';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const StatCard = ({ icon: Icon, title, value, unit, loading }: { icon: React.ElementType, title: string, value: string, unit: string, loading?: boolean }) => {
    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-7 w-1/2 mb-1" />
                    <Skeleton className="h-3 w-full" />
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{toBengaliNumber(value)}</div>
            <p className="text-xs text-muted-foreground">{unit}</p>
            </CardContent>
        </Card>
    )
};

const lessonsByLevel = [
  { level: "শিক্ষানবিশ", lessons: ["হোম রো বেসিক", "টপ রো অনুশীলন", "বটম রো ড্রিল"] },
  { level: "মধ্যম", lessons: ["শব্দ অনুশীলন ১", "সাধারণ বাক্য", "যতিচিহ্ন সহ টাইপিং"] },
  { level: "উন্নত", lessons: ["অনুচ্ছেদ অনুশীলন", "জটিল বাক্য", "দ্রুত গতির ড্রিল"] }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserTypingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [lastTest, setLastTest] = useState<TestSummary | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        setLoadingStats(true);
        try {
          const { data: tests, error } = await supabase
            .from('test_results')
            .select('wpm, accuracy, lesson_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;

          if (tests && tests.length > 0) {
            setLastTest(tests[0] as any);

            let totalWpm = 0;
            let totalAccuracy = 0;
            let highestWpm = 0;
            const lessonIds = new Set();

            for (let i = 0; i < tests.length; i++) {
              const t: any = tests[i];
              const wpm = t.wpm || 0;
              totalWpm += wpm;
              totalAccuracy += (t.accuracy || 0);
              if (t.lesson_id) lessonIds.add(t.lesson_id);
              if (wpm > highestWpm) highestWpm = wpm;
            }

            setStats({
              averageWpm: Math.round(totalWpm / tests.length) || 0,
              averageAccuracy: Math.round(totalAccuracy / tests.length) || 0,
              lessonsCompleted: lessonIds.size || 0,
              testsTaken: tests.length || 0,
              highestWpm: highestWpm,
            });
          } else {
            setStats(null);
          }
        } catch (error: unknown) {
          console.error("Error fetching stats:", error instanceof Error ? error.message : error);
          setStats(null);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
        setStats(null);
      }
    };
    fetchStats();
  }, [user]);

  const welcomeMessage = user?.user_metadata?.display_name ? `স্বাগতম, ${user.user_metadata.display_name}!` : 'স্বাগতম!';
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{welcomeMessage}</h1>
        <p className="text-muted-foreground">আপনার টাইপিং যাত্রা চালিয়ে যান।</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Zap} title="গড় গতি" value={stats?.averageWpm?.toString() || '0'} unit="শব্দ প্রতি মিনিট" loading={loadingStats} />
        <StatCard icon={Target} title="গড় নির্ভুলতা" value={`${stats?.averageAccuracy || 0}%`} unit="সর্বশেষ টেস্ট অনুযায়ী" loading={loadingStats} />
        <StatCard icon={BookCheck} title="পাঠ সম্পন্ন" value={stats?.lessonsCompleted?.toString() || '0'} unit="অনুশীলন ও টেস্ট মিলিয়ে" loading={loadingStats} />
        <StatCard icon={Award} title="টেস্ট দিয়েছেন" value={stats?.testsTaken?.toString() || '0'} unit={`সেরা স্কোর: ${stats?.highestWpm || 0} WPM`} loading={loadingStats} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>পরবর্তী পাঠ</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="p-6 bg-secondary rounded-lg text-center">
              <p className="text-lg font-semibold">হোম রো বেসিক</p>
              <p className="text-sm text-muted-foreground">শিক্ষানবিশ স্তরের পাঠ</p>
              <Button asChild>
                <Link href="/dashboard/lessons/home-row">অনুশীলন শুরু করুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>সব পাঠ</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <Accordion type="single" collapsible className="w-full">
              {lessonsByLevel.map(levelData => (
                <AccordionItem value={levelData.level} key={levelData.level}>
                  <AccordionTrigger>{levelData.level}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-4">
                      {levelData.lessons.map(lesson => (
                        <li key={lesson} className="text-sm text-muted-foreground hover:text-foreground">
                           <Link href={`/dashboard/practice/${lesson.replace(/\s+/g, '-').toLowerCase()}`}>{lesson}</Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
