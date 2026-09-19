import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা টাইপিং কোর্স — বর্ণমালা থেকে যুক্তাক্ষর ও গতি',
  description:
    '১৩ স্তরের পূর্ণাঙ্গ বাংলা টাইপিং কোর্স। হোম রো, কার, হসন্ত, ফলা, যুক্তাক্ষর থেকে শুরু করে গতি বৃদ্ধি পর্যন্ত। বিনামূল্যে।',
  alternates: {
    canonical: `${siteUrl}/bangla-typing-course`,
  },
  openGraph: {
    title: 'বাংলা টাইপিং কোর্স — ১৩ স্তরের পূর্ণাঙ্গ কোর্স',
    description: 'হোম রো থেকে যুক্তাক্ষর পর্যন্ত — সম্পূর্ণ বাংলা টাইপিং কোর্স। বিনামূল্যে।',
    url: `${siteUrl}/bangla-typing-course`,
    type: 'website',
  },
};

const levels = [
  {
    level: 0,
    badge: '🚀',
    title: 'পরিচিতি ও কীবোর্ড প্রস্তুতি',
    desc: 'হাতের সঠিক অবস্থান, কীবোর্ড লেআউট পরিচিতি ও বেসিক নিয়ম',
    lessons: 1,
    href: '/dashboard/lessons',
  },
  {
    level: 1,
    badge: '⌨️',
    title: 'হোম রো — টাইপিং-এর ভিত্তি',
    desc: 'া স ড ফ গ ্ জ ক ল — ২৬টি lesson',
    lessons: 26,
    href: '/learn/home-row',
  },
  {
    level: 2,
    badge: 'ি',
    title: 'কার — স্বরবর্ণ চিহ্ন',
    desc: 'আ-কার, ই-কার, উ-কার, এ-কার, ও-কার সহ সব কার',
    lessons: 6,
    href: '/learn/kar',
  },
  {
    level: 3,
    badge: '্',
    title: 'হসন্ত ও ফলা',
    desc: 'হসন্ত (্), য-ফলা, র-ফলা, ব-ফলা',
    lessons: 5,
    href: '/learn/hasanta',
  },
  {
    level: 4,
    badge: 'ক্ষ',
    title: 'যুক্তাক্ষর',
    desc: 'বাংলার জটিল যুক্তাক্ষর — ক্ষ, জ্ঞ, শ্র, ত্র',
    lessons: 4,
    href: '/learn/juktakkhor',
  },
  {
    level: 5,
    badge: '✨',
    title: 'বিশেষ চিহ্ন ও সংখ্যা',
    desc: 'ৎ, ং, ঃ, ঁ, বাংলা সংখ্যা ও বিরামচিহ্ন',
    lessons: 3,
    href: '/learn/punctuation',
  },
  {
    level: 6,
    badge: '📝',
    title: 'সাধারণ শব্দ',
    desc: 'বাংলায় সবচেয়ে বেশি ব্যবহৃত শব্দের অনুশীলন',
    lessons: 2,
    href: '/learn/words',
  },
  {
    level: 7,
    badge: '💬',
    title: 'বাক্য অনুশীলন',
    desc: 'সম্পূর্ণ বাক্য টাইপ করার অনুশীলন',
    lessons: 2,
    href: '/dashboard/lessons',
  },
  {
    level: 8,
    badge: '📖',
    title: 'অনুচ্ছেদ',
    desc: 'দীর্ঘ অনুচ্ছেদ টাইপ করার অনুশীলন',
    lessons: 2,
    href: '/dashboard/lessons',
  },
  {
    level: 9,
    badge: '🚀',
    title: 'গতি বৃদ্ধি',
    desc: 'টাইপিং গতি বাড়ানোর বিশেষ অনুশীলন',
    lessons: 3,
    href: '/dashboard/lessons',
  },
  {
    level: 10,
    badge: '🏢',
    title: 'অফিস ও ব্যবসায়িক পাঠ্য',
    desc: 'দাপ্তরিক চিঠি, আবেদন ও অফিশিয়াল পাঠ্য',
    lessons: 2,
    href: '/dashboard/lessons',
  },
  {
    level: 11,
    badge: '📰',
    title: 'সাহিত্য ও সংবাদ',
    desc: 'বাংলা সাহিত্য ও সংবাদপত্রের পাঠ্য',
    lessons: 3,
    href: '/dashboard/lessons',
  },
  {
    level: 12,
    badge: '🎯',
    title: 'পরীক্ষা প্রস্তুতি',
    desc: 'চাকরির পরীক্ষার মানের typing test অনুশীলন',
    lessons: 2,
    href: '/dashboard/lessons',
  },
];

export default function BanglaTypingCoursePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white">
      {/* Hero */}
      <section className="px-4 py-16 text-center max-w-5xl mx-auto">
        <nav className="text-sm text-violet-300 mb-6">
          <Link href="/" className="hover:text-white transition-colors">হোম</Link>
          <span className="mx-2">›</span>
          <span className="text-white">বাংলা টাইপিং কোর্স</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা টাইপিং কোর্স</h1>
        <p className="text-xl text-violet-200 mb-3">বর্ণমালা থেকে যুক্তাক্ষর ও গতি</p>
        <p className="text-violet-300 max-w-2xl mx-auto mb-6">
          ১৩ স্তরের পূর্ণাঙ্গ, বিনামূল্যে বাংলা টাইপিং কোর্স। Level 0 থেকে শুরু করে 
          Level 12 পর্যন্ত ধাপে ধাপে এগিয়ে যান। মোট ৬১টি lesson ও ১৩০টি section।
        </p>
        <div className="flex gap-4 justify-center flex-wrap mb-6">
          <div className="bg-violet-500/20 rounded-lg px-4 py-2 text-sm">১৩টি স্তর</div>
          <div className="bg-violet-500/20 rounded-lg px-4 py-2 text-sm">৬১টি lesson</div>
          <div className="bg-violet-500/20 rounded-lg px-4 py-2 text-sm">১৩০টি section</div>
          <div className="bg-violet-500/20 rounded-lg px-4 py-2 text-sm">বিনামূল্যে</div>
        </div>
        <Link
          href="/dashboard/lessons"
          className="inline-block bg-violet-500 hover:bg-violet-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-violet-500/30 hover:scale-105"
        >
          কোর্স শুরু করুন →
        </Link>
      </section>

      {/* Course Levels */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">কোর্সের সব স্তর</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {levels.map((l) => (
            <Link
              key={l.level}
              href={l.href}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors flex items-start gap-4"
            >
              <span className="text-3xl">{l.badge}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-violet-400 text-xs font-mono">Level {l.level}</span>
                    <div className="font-semibold mt-0.5">{l.title}</div>
                  </div>
                  <span className="text-slate-500 text-xs shrink-0">{l.lessons} lesson</span>
                </div>
                <div className="text-slate-400 text-sm mt-1">{l.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why this course */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">এই কোর্স কেন বেছে নেবেন?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🎯', title: 'ধাপে ধাপে সংগঠিত', desc: 'প্রতিটি lesson-এ নির্দিষ্ট লক্ষ্য। পূর্ববর্তী lesson সম্পন্ন না হলে পরের lesson unlock হয় না।' },
              { icon: '🔄', title: 'Real-time feedback', desc: 'প্রতিটি keystroke-এ তাৎক্ষণিক সাড়া। ভুল হলে সঙ্গে সঙ্গে জানাবে।' },
              { icon: '📊', title: 'বিস্তারিত analytics', desc: 'কোন অক্ষরে বেশি ভুল, গড় গতি, সেরা গতি — সব ট্র্যাক হয়।' },
              { icon: '🆓', title: 'সম্পূর্ণ বিনামূল্যে', desc: 'কোনো registration ছাড়াই শুরু করা যায়। সব lesson বিনামূল্যে।' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <div className="font-semibold mb-1">{f.title}</div>
                  <div className="text-slate-400 text-sm">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topic Links */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">বিষয়ভিত্তিক পাঠ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'হোম রো', href: '/learn/home-row' },
            { label: 'কার', href: '/learn/kar' },
            { label: 'হসন্ত', href: '/learn/hasanta' },
            { label: 'ফলা', href: '/learn/phola' },
            { label: 'যুক্তাক্ষর', href: '/learn/juktakkhor' },
            { label: 'শব্দ', href: '/learn/words' },
            { label: 'বিরামচিহ্ন', href: '/learn/punctuation' },
            { label: 'সব lesson', href: '/learn' },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">আজই শুরু করুন</h2>
        <p className="text-slate-300 mb-8">Level 0 থেকে শুরু করুন। ধাপে ধাপে এগিয়ে যান।</p>
        <Link
          href="/dashboard/lessons"
          className="inline-block bg-violet-500 hover:bg-violet-400 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105"
        >
          কোর্স শুরু করুন →
        </Link>
      </section>
    </main>
  );
}
