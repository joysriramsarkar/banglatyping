"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Target, BookCheck, Award, ArrowRight, Timer, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import type { UserTypingStats } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const toBengaliNumber = (num: number | string) => {
  if (typeof num === 'undefined' || num === null) return '০';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const StatCard = ({ icon: Icon, title, value, unit, loading }: {
  icon: React.ElementType; title: string; value: string; unit: string; loading?: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
        <>
          <Skeleton className="mb-1 h-7 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">{toBengaliNumber(value)}</div>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </>
      )}
    </CardContent>
  </Card>
);

const quickActions = [
  { href: '/dashboard/lessons', icon: BookCheck, label: 'পাঠ শুরু করুন', description: 'ধাপে ধাপে শিখুন' },
  { href: '/dashboard/test', icon: Timer, label: 'টাইপিং টেস্ট', description: 'গতি পরীক্ষা করুন' },
  { href: '/game', icon: Gamepad2, label: 'টাইপিং গেম', description: 'মজা করে অনুশীলন' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserTypingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) { setLoadingStats(false); return; }
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
          let totalWpm = 0, totalAccuracy = 0, highestWpm = 0;
          const lessonIds = new Set();
          for (const t of tests as any[]) {
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
            highestWpm,
          });
        } else {
          setStats(null);
        }
      } catch (e) {
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  const welcomeMessage = user?.user_metadata?.display_name
    ? `স্বাগতম, ${user.user_metadata.display_name}!`
    : 'স্বাগতম!';

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold">{welcomeMessage}</h1>
        <p className="text-muted-foreground">আপনার টাইপিং যাত্রা চালিয়ে যান।</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Zap} title="গড় গতি" value={`${stats?.averageWpm || 0} WPM`} unit="শব্দ প্রতি মিনিট" loading={loadingStats} />
        <StatCard icon={Target} title="গড় নির্ভুলতা" value={`${stats?.averageAccuracy || 0}%`} unit="সর্বশেষ টেস্ট অনুযায়ী" loading={loadingStats} />
        <StatCard icon={BookCheck} title="পাঠ সম্পন্ন" value={`${stats?.lessonsCompleted || 0}`} unit="অনুশীলন ও টেস্ট মিলিয়ে" loading={loadingStats} />
        <StatCard icon={Award} title="সেরা স্কোর" value={`${stats?.highestWpm || 0} WPM`} unit={`মোট টেস্ট: ${toBengaliNumber(stats?.testsTaken || 0)}`} loading={loadingStats} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">দ্রুত শুরু করুন</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full cursor-pointer transition-all hover:border-primary hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{action.label}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Continue lesson CTA */}
      {!loadingStats && !stats && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <BookCheck className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-semibold">এখনো কোনো অনুশীলন করা হয়নি</p>
              <p className="text-sm text-muted-foreground">প্রথম পাঠ শুরু করে আপনার যাত্রা শুরু করুন।</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/lessons">পাঠক্রম দেখুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
