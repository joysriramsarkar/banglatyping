import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getCurriculumLessonById,
  getAllCurriculumLessons,
} from '@/lib/curriculum/curriculum-data';
import { LessonSEOContent } from '@/components/seo/LessonSEOContent';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

/**
 * generateStaticParams — Pre-generate all 61 curriculum lesson paths at build time.
 * This makes /lesson/[lessonId] a static page for maximum SEO performance.
 */
export function generateStaticParams() {
  const lessons = getAllCurriculumLessons();
  return lessons.map((lesson) => ({ lessonId: lesson.id }));
}

/**
 * generateMetadata — Unique title, description, and canonical for each lesson.
 * This is critical for indexing 61 distinct pages instead of one generic page.
 */
export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getCurriculumLessonById(lessonId);

  if (!lesson) {
    return {
      title: 'পাঠ পাওয়া যায়নি — বাংলা টাইপিং মাস্টার',
    };
  }

  const title = `${lesson.title} — বাংলা টাইপিং | Level ${lesson.level}`;
  const description =
    lesson.description.length > 150
      ? lesson.description.slice(0, 147) + '...'
      : lesson.description;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/lesson/${lesson.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/lesson/${lesson.id}`,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * LessonPage — Server component for individual lesson SEO pages.
 * Shows: lesson content (SEO), then a CTA to the actual practice application.
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const lesson = getCurriculumLessonById(lessonId);

  if (!lesson) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* SEO Content — visible to both users and Google */}
        <LessonSEOContent lesson={lesson} siteUrl={siteUrl} />

        {/* Divider */}
        <div className="border-t border-white/10 my-10" />

        {/* CTA — এখনই অনুশীলন করুন */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">এই পাঠ অনুশীলন করতে চান?</h2>
          <p className="text-slate-300 mb-6">
            ইন্টারঅ্যাক্টিভ টাইপিং অনুশীলন, real-time feedback এবং accuracy tracking সহ।
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={`/dashboard/practice/${lesson.id}`}
              className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105"
            >
              এখনই অনুশীলন করুন →
            </Link>
            <Link
              href="/dashboard/lessons"
              className="inline-block bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all"
            >
              সব lesson দেখুন
            </Link>
          </div>
        </div>

        {/* Related Pages */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">আরও দেখুন</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/bangla-typing-test"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors"
            >
              <div className="text-sm text-slate-400 mb-1">🏆</div>
              <div className="font-semibold text-sm">বাংলা টাইপিং টেস্ট</div>
              <div className="text-slate-500 text-xs mt-1">গতি পরিমাপ করুন</div>
            </Link>
            <Link
              href="/bangla-typing-course"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors"
            >
              <div className="text-sm text-slate-400 mb-1">📚</div>
              <div className="font-semibold text-sm">পূর্ণাঙ্গ কোর্স</div>
              <div className="text-slate-500 text-xs mt-1">১৩ স্তরের কোর্স</div>
            </Link>
            <Link
              href="/learn"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors"
            >
              <div className="text-sm text-slate-400 mb-1">📖</div>
              <div className="font-semibold text-sm">সব পাঠ</div>
              <div className="text-slate-500 text-xs mt-1">বিষয় অনুযায়ী</div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
