'use client';

/**
 * Teacher dashboard — institution-gated class overview.
 * Tier comes from the optional prop, falling back to localStorage
 * ("bt-tier", default "free").
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { canAccessFeature, type PlanTier } from '@/lib/billing/feature-gate';

interface StudentRow {
  userId: string;
  displayName: string;
  avgWpm: number;
  avgAccuracy: number;
  sessions: number;
}

interface TeacherDashboardProps {
  tier?: PlanTier;
}

// Kept for reference; Next 15 page components accept only params/searchParams,
// so the page reads tier from localStorage instead of props.

const TIER_STORAGE_KEY = 'bt-tier';

function readStoredTier(): PlanTier {
  if (typeof window === 'undefined') return 'free';
  const raw = window.localStorage.getItem(TIER_STORAGE_KEY);
  return raw === 'pro' || raw === 'institution' ? raw : 'free';
}

export default function TeacherDashboardPage() {
  const [activeTier, setActiveTier] = useState<PlanTier>('free');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [status, setStatus] = useState<string>('লোড হচ্ছে…');

  useEffect(() => {
    setActiveTier(readStoredTier());
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/user-progress?limit=100');
        const json = (await res.json()) as {
          success: boolean;
          data?: Array<{ user_id?: string; wpm?: number; accuracy?: number }>;
        };
        if (!cancelled) {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const byUser = new Map<string, { wpm: number; acc: number; n: number }>();
            for (const row of json.data) {
              if (!row.user_id) continue;
              const prev = byUser.get(row.user_id) ?? { wpm: 0, acc: 0, n: 0 };
              prev.wpm += row.wpm ?? 0;
              prev.acc += row.accuracy ?? 0;
              prev.n += 1;
              byUser.set(row.user_id, prev);
            }
            setStudents(
              [...byUser.entries()].map(([userId, v]) => ({
                userId,
                displayName: `শিক্ষার্থী ${userId.slice(0, 6)}`,
                avgWpm: Math.round(v.wpm / Math.max(v.n, 1)),
                avgAccuracy: Math.round(v.acc / Math.max(v.n, 1)),
                sessions: v.n,
              })),
            );
            setStatus('');
          } else {
            setStudents([]);
            setStatus('এখনো কোনো শিক্ষার্থীর অগ্রগতি নেই।');
          }
        }
      } catch {
        if (!cancelled) {
          setStudents([]);
          setStatus('অগ্রগতি API পাওয়া যায়নি — খালি অবস্থা দেখানো হচ্ছে।');
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!canAccessFeature(activeTier, 'teacher-dashboard')) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card className="border-dashed">
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-xl font-bold">শিক্ষক ড্যাশবোর্ড — প্রতিষ্ঠান প্ল্যান</p>
            <p className="text-sm text-muted-foreground">
              শ্রেণির অগ্রগতি দেখতে প্রতিষ্ঠান প্ল্যানে আপগ্রেড করুন।
            </p>
            <Button asChild>
              <Link href="/pricing">আপগ্রেড করুন</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function downloadCsv() {
    const header = 'user_id,display_name,avg_wpm,avg_accuracy,sessions';
    const lines = students.map((s) =>
      [s.userId, s.displayName, String(s.avgWpm), String(s.avgAccuracy), String(s.sessions)].join(
        ',',
      ),
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">শিক্ষক ড্যাশবোর্ড</h1>
          <p className="text-sm text-muted-foreground">শ্রেণির অগ্রগতি ও বাল্ক রিপোর্ট।</p>
        </div>
        <Button variant="outline" onClick={downloadCsv} disabled={students.length === 0}>
          CSV রিপোর্ট ডাউনলোড
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>শিক্ষার্থী তালিকা</CardTitle>
          <CardDescription>{students.length} জন শিক্ষার্থী</CardDescription>
        </CardHeader>
        <CardContent>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
          {students.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>গড় WPM</TableHead>
                  <TableHead>গড় নির্ভুলতা</TableHead>
                  <TableHead>সেশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.userId}>
                    <TableCell>{s.displayName}</TableCell>
                    <TableCell>{s.avgWpm}</TableCell>
                    <TableCell>{s.avgAccuracy}%</TableCell>
                    <TableCell>{s.sessions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
