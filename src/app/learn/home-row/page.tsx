import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCurriculumLessons } from '@/lib/curriculum/curriculum-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা টাইপিং হোম রো — া স ড ফ গ ্ জ ক ল অনুশীলন',
  description:
    'বাংলা টাইপিং হোম রো শেখার সম্পূর্ণ গাইড। কোন আঙুলে কোন কী, কীভাবে টাইপ করবেন এবং ৭টি ধাপে হোম রো আয়ত্ত করুন।',
  alternates: { canonical: `${siteUrl}/learn/home-row` },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'বাংলা টাইপিং হোম রো',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'শেখার পাঠ', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'হোম রো', item: `${siteUrl}/learn/home-row` },
    ],
  },
};

const fingerMap = [
  { finger: 'বাম কনিষ্ঠ', keys: ['অ', 'ড', 'ব'], position: 'A কী' },
  { finger: 'বাম অনামিকা', keys: ['স', 'শ', 'থ'], position: 'S কী' },
  { finger: 'বাম মধ্যমা', keys: ['ড', 'ড়', 'ঢ'], position: 'D কী' },
  { finger: 'বাম তর্জনী', keys: ['া', 'ফ', 'ঘ', 'গ'], position: 'F কী' },
  { finger: 'ডান তর্জনী', keys: ['হ', 'ণ', 'ত', 'থ'], position: 'J কী' },
  { finger: 'ডান মধ্যমা', keys: ['ত', 'ক', 'জ'], position: 'K কী' },
  { finger: 'ডান অনামিকা', keys: ['ি', 'ল', 'ন'], position: 'L কী' },
  { finger: 'ডান কনিষ্ঠ', keys: ['ন', 'ড়', 'ঢ়'], position: '; কী' },
];

export default function HomeRowPage() {
  const allLessons = getAllCurriculumLessons();
  const homeRowLessons = allLessons.filter(
    (l) => l.level === 1 && l.id.startsWith('lesson-1-')
  ).slice(0, 7);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        {/* Hero */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <nav className="text-sm text-blue-300 mb-6">
            <Link href="/" className="hover:text-white transition-colors">হোম</Link>
            <span className="mx-2">›</span>
            <Link href="/learn" className="hover:text-white transition-colors">শেখার পাঠ</Link>
            <span className="mx-2">›</span>
            <span className="text-white">হোম রো</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা টাইপিং হোম রো শেখা</h1>
          <p className="text-blue-200 text-xl mb-4">
            টাইপিং-এর সবচেয়ে গুরুত্বপূর্ণ ধাপ — হোম রো
          </p>
          <p className="text-slate-300 leading-relaxed max-w-2xl mb-8">
            হোম রো হলো কীবোর্ডের মাঝের সারি — A, S, D, F, J, K, L, ; কী-গুলো। 
            এই সারিতেই দুই হাতের আঙুল স্থির থাকে এবং এখান থেকেই প্রতিটি টাইপ শুরু হয়।
            হোম রো না জানলে দ্রুত টাইপ করা অসম্ভব।
          </p>
          <Link
            href="/dashboard/practice/lesson-1-1"
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105"
          >
            হোম রো অনুশীলন শুরু করুন →
          </Link>
        </section>

        {/* What is Home Row */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-4 text-blue-200">হোম রো কী?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              কীবোর্ডের তিনটি সারির মধ্যে মাঝেরটি হলো হোম রো। টাইপিং শুরুর আগে এই সারিতে
              হাত রাখা হয় — বাম হাতের আঙুল A, S, D, F এবং ডান হাতের আঙুল J, K, L, ; কী-তে।
            </p>
            <p className="text-slate-300 leading-relaxed">
              বিজয় কীবোর্ডে এই হোম রো কী-গুলোতে আছে: 
              <span className="text-blue-300 font-bold"> া (F), স (S), ড (D), অ (A), হ (J), ত (K), ি (L), ন (;)</span>।
              এগুলো বাংলার সবচেয়ে বেশি ব্যবহৃত অক্ষর।
            </p>
          </div>
        </section>

        {/* Finger Guide */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">কোন আঙুলে কোন কী?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {fingerMap.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                <div className="text-blue-400 font-mono text-sm shrink-0 mt-1">{f.position}</div>
                <div>
                  <div className="font-semibold text-sm mb-1">{f.finger}</div>
                  <div className="flex gap-2 flex-wrap">
                    {f.keys.map((k) => (
                      <span key={k} className="bg-blue-500/20 rounded px-2 py-0.5 text-sm font-bold">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Home Row Lessons */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">হোম রো-র পাঠগুলো</h2>
          <div className="space-y-3">
            {homeRowLessons.length > 0 ? homeRowLessons.map((lesson, i) => (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-blue-400 text-xs font-mono mr-2">HR-0{i + 1}</span>
                  <span className="font-semibold">{lesson.title}</span>
                  {lesson.subtitle && (
                    <span className="text-slate-400 text-sm ml-2">{lesson.subtitle}</span>
                  )}
                </div>
                <span className="text-slate-500 text-sm">{lesson.estimatedMinutes} মিনিট →</span>
              </Link>
            )) : (
              <div className="space-y-3">
                {['HR-01: হোম রো বেসিক', 'HR-02: া ও স অনুশীলন', 'HR-03: ড ফ সংযোজন', 'HR-04: গ ্ জ ক', 'HR-05: ল ও র সংযোজন', 'HR-06: মিশ্র অনুশীলন', 'HR-07: হোম রো মাস্টারি'].map((title) => (
                  <Link
                    key={title}
                    href="/dashboard/lessons"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold">{title}</span>
                    <span className="text-slate-500 text-sm">শুরু করুন →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6">হোম রো শেখার সাধারণ ভুল</h2>
            <div className="space-y-4">
              {[
                { mistake: 'কীবোর্ডের দিকে তাকিয়ে টাইপ করা', fix: 'সবসময় স্ক্রিনের দিকে তাকান। শুরুতে ধীরে হলেও চোখ উপরে রাখুন।' },
                { mistake: 'ভুল আঙুল দিয়ে কী চাপা', fix: 'প্রতিটি কী-র জন্য নির্দিষ্ট আঙুল মেনে চলুন। শুরুতে ধীরে করুন।' },
                { mistake: 'টাইপের পর হাত সরিয়ে ফেলা', fix: 'প্রতিটি কী চাপার পর আঙুল আবার হোম রো-তে ফিরে আসবে।' },
                { mistake: 'একসাথে অনেক কিছু শেখার চেষ্টা', fix: 'প্রতিদিন একটি বা দুটি কী আয়ত্ত করুন। তাড়াহুড়ো করবেন না।' },
              ].map((m, i) => (
                <div key={i} className="border border-white/10 rounded-xl p-4">
                  <div className="text-red-400 text-sm font-semibold mb-1">❌ {m.mistake}</div>
                  <div className="text-green-400 text-sm">✓ {m.fix}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Next Topic */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-4">হোম রো-এর পরে কী শিখবেন?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/learn/kar" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
              <div className="text-2xl mb-2">ি</div>
              <div className="font-semibold mb-1">কার শিখুন</div>
              <div className="text-slate-400 text-sm">পরবর্তী ধাপ</div>
            </Link>
            <Link href="/learn/hasanta" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
              <div className="text-2xl mb-2">্</div>
              <div className="font-semibold mb-1">হসন্ত শিখুন</div>
              <div className="text-slate-400 text-sm">যুক্তাক্ষরের ভিত্তি</div>
            </Link>
            <Link href="/bangla-typing-test" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-semibold mb-1">টাইপিং টেস্ট দিন</div>
              <div className="text-slate-400 text-sm">গতি পরিমাপ করুন</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
