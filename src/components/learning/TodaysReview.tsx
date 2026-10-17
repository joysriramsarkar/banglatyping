"use client";

/**
 * TodaysReview — "আজকের ৮ মিনিট" home widget.
 *
 * Three cards: weak review (পুরনো দুর্বল), new material (নতুন), mixed
 * paragraph (মিশ্র অনুচ্ছেদ). Guest-safe: when no weakChars prop is given,
 * weak characters are derived client-side from guest localStorage sessions.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeakCharacterView } from '@/lib/types';
import type { SRSCard } from '@/lib/learning/srs-engine';
import { getDueReviews, loadLocalSrsStates } from '@/lib/learning/skill-sync';
import { getGuestSessions } from '@/lib/guest-storage';
import { getActiveKeyboardLayout } from '@/lib/keyboard-layouts';
import { getLayoutBest } from '@/lib/learning/layout-best';
import { toBengaliNumber } from '@/lib/utils';

export interface TodaysReviewProps {
  weakChars?: WeakCharacterView[];
  /** Due SRS cards (ids double as skill ids); loaded from local mirror when omitted. */
  dueReviews?: SRSCard[];
  layout?: string;
}

interface GuestWeak {
  character: string;
  count: number;
}

function deriveGuestWeakChars(): GuestWeak[] {
  try {
    const sessions = getGuestSessions();
    const counts = new Map<string, number>();
    for (const s of sessions) {
      for (const e of s.erredCharacters ?? []) {
        counts.set(e.char, (counts.get(e.char) ?? 0) + e.count);
      }
    }
    return [...counts.entries()]
      .map(([character, count]) => ({ character, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  } catch {
    return [];
  }
}

function ReviewCard({
  emoji,
  title,
  desc,
  href,
  cta,
  chips,
}: {
  emoji: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  chips: string[];
}) {
  return (
    <Card className="border shadow-sm flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">
          <span aria-hidden="true" className="mr-2">{emoji}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <Badge key={c} variant="secondary" className="font-bold">{c}</Badge>
            ))}
          </div>
        )}
        <div className="mt-auto pt-1">
          <Button asChild size="sm" className="w-full font-bold">
            <Link href={href}>{cta}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TodaysReview({ weakChars, dueReviews, layout }: TodaysReviewProps) {
  const [guestWeak, setGuestWeak] = useState<GuestWeak[]>([]);
  const [due, setDue] = useState<SRSCard[]>(dueReviews ?? []);
  const [activeLayout, setActiveLayout] = useState(layout ?? 'banglaword');

  useEffect(() => {
    if (!weakChars || weakChars.length === 0) {
      setGuestWeak(deriveGuestWeakChars());
    }
    if (!dueReviews) {
      try {
        setDue(getDueReviews([...loadLocalSrsStates().values()]));
      } catch {
        // ignore — empty due list renders the "new material" fallback
      }
    }
    if (!layout) {
      try {
        setActiveLayout(getActiveKeyboardLayout());
      } catch {
        // ignore — default layout stands
      }
    }
  }, [weakChars, dueReviews, layout]);

  const weakChips: string[] =
    weakChars && weakChars.length > 0
      ? weakChars.slice(0, 5).map((w) => w.character)
      : guestWeak.map((g) => g.character);

  const dueChips = due.slice(0, 5).map((d) => d.id.replace(/^(char|kar|conjunct|special)-/, ''));
  const reviewChips = dueChips.length > 0 ? dueChips : weakChips;

  const best = getLayoutBest(activeLayout);
  const layoutNote = best
    ? `${activeLayout}: সেরা ${toBengaliNumber(best.bestWpm)} WPM · ${toBengaliNumber(best.bestAccuracy)}%`
    : `${activeLayout} লেআউটে এখনো সেরা স্কোর নেই`;

  return (
    <section aria-label="আজকের ৮ মিনিট" className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-extrabold font-headline">আজকের ৮ মিনিট</h2>
        <span className="text-xs text-muted-foreground">{layoutNote}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <ReviewCard
          emoji="🔁"
          title="পুরনো দুর্বল"
          desc={
            reviewChips.length > 0
              ? `রিভিউ বাকি ${toBengaliNumber(reviewChips.length)}টি অক্ষর — SRS শিডিউল অনুযায়ী আজই ঝালিয়ে নিন।`
              : 'কোনো বকেয়া রিভিউ নেই। দুর্বল অক্ষর জমলেই এখানে দেখা যাবে।'
          }
          href="/dashboard/practice/mistakes"
          cta="রিভিউ শুরু করুন"
          chips={reviewChips}
        />
        <ReviewCard
          emoji="✨"
          title="নতুন"
          desc="আজকের নতুন দক্ষতা — ছোট ধাপে নতুন অক্ষর শিখুন, ৩ মিনিটেই শেষ।"
          href="/learn/home-row"
          cta="নতুন পাঠ শুরু"
          chips={[]}
        />
        <ReviewCard
          emoji="📝"
          title="মিশ্র অনুচ্ছেদ"
          desc="পুরনো + নতুন মিলিয়ে বাস্তব অনুচ্ছেদ — গতি ও নির্ভুলতা একসাথে যাচাই।"
          href="/dashboard/test"
          cta="অনুচ্ছেদ টাইপ করুন"
          chips={[]}
        />
      </div>
    </section>
  );
}
