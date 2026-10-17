/**
 * Specialized job-oriented test detail — renders the SPECIALIZED_TESTS
 * entry with duration/accuracy/speed requirements and a start button
 * that routes to /dashboard/test?pack=slug.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSpecializedTest, SPECIALIZED_TESTS } from "@/lib/curriculum/specialized-tests";

interface TestPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SPECIALIZED_TESTS.map((t) => ({ slug: t.id }));
}

export default async function SpecializedTestPage({ params }: TestPageProps) {
  const { slug } = await params;
  const test = getSpecializedTest(slug);
  if (!test) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">{test.titleBn}</h1>
        <p className="text-sm text-muted-foreground">{test.titleEn}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>পরীক্ষার বিবরণ</CardTitle>
          <CardDescription>{test.descriptionBn}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">লক্ষ্য গতি: {test.targetWpm} WPM</Badge>
            <Badge variant="secondary">সর্বনিম্ন নির্ভুলতা: {test.minAccuracy}%</Badge>
            <Badge variant="secondary">সময়: {test.durationMinutes} মিনিট</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">নমুনা অনুচ্ছেদ:</p>
            {test.passages.map((p, i) => (
              <p key={i} className="text-sm p-3 rounded bg-muted">
                {p}
              </p>
            ))}
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/dashboard/test?pack=${encodeURIComponent(test.id)}`}>
              পরীক্ষা শুরু করুন
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
