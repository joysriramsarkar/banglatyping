import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা টাইপিং প্র্যাকটিস — ধাপে ধাপে টাইপিং শিখুন',
  description:
    'হোম রো থেকে যুক্তাক্ষর পর্যন্ত — ধাপে ধাপে বাংলা টাইপিং শিখুন। ১৩ স্তরের পূর্ণাঙ্গ কোর্স। Avro ও Bijoy উভয় লেআউটে অনুশীলন করুন।',
  alternates: {
    canonical: `${siteUrl}/bangla-typing-practice`,
  },
  openGraph: {
    title: 'বাংলা টাইপিং প্র্যাকটিস — ধাপে ধাপে টাইপিং শিখুন',
    description: '১৩ স্তরের পূর্ণাঙ্গ বাংলা টাইপিং কোর্স। হোম রো থেকে যুক্তাক্ষর পর্যন্ত।',
    url: `${siteUrl}/bangla-typing-practice`,
    type: 'website',
  },
};

const stages = [
  {
    badge: '🚀',
    name: 'পরিচিতি',
    desc: 'হাতের অবস্থান, কীবোর্ড লেআউট পরিচিতি',
    link: '/learn/home-row',
  },
  {
    badge: '⌨️',
    name: 'হোম রো',
    desc: 'া স ড ফ গ ্ জ ক ল — বেসিক অক্ষর',
    link: '/learn/home-row',
  },
  {
    badge: '🔼',
    name: 'টপ রো ও বটম রো',
    desc: 'ট থ ড ধ ন ব ভ ম — বিস্তারিত অক্ষর',
    link: '/learn',
  },
  {
    badge: '📝',
    name: 'কার',
    desc: 'আ-কার ই-কার উ-কার ও-কার সহ সব কার',
    link: '/learn/kar',
  },
  {
    badge: '🔗',
    name: 'হসন্ত ও ফলা',
    desc: 'হসন্ত (্), য-ফলা, র-ফলা, ব-ফলা',
    link: '/learn/hasanta',
  },
  {
    badge: '✨',
    name: 'যুক্তাক্ষর',
    desc: 'ক্ষ জ্ঞ শ্র ত্র — জটিল অক্ষর',
    link: '/learn/juktakkhor',
  },
  {
    badge: '📖',
    name: 'শব্দ ও বাক্য',
    desc: 'সাধারণ বাংলা শব্দ ও বাক্য অনুশীলন',
    link: '/learn/words',
  },
  {
    badge: '🏆',
    name: 'গতি ও পরীক্ষা',
    desc: 'স্পিড বৃদ্ধি ও চাকরির পরীক্ষার প্রস্তুতি',
    link: '/bangla-typing-course',
  },
];

export default function BanglaTypingPracticePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Hero */}
      <section className="px-4 py-16 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-indigo-300 mb-6">
          <Link href="/" className="hover:text-white transition-colors">হোম</Link>
          <span className="mx-2">›</span>
          <span className="text-white">বাংলা টাইপিং প্র্যাকটিস</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          বাংলা টাইপিং প্র্যাকটিস
        </h1>
        <p className="text-xl text-indigo-200 mb-3">ধাপে ধাপে শিখুন, দ্রুত আয়ত্ত করুন</p>
        <p className="text-indigo-300 max-w-2xl mx-auto mb-8">
          হোম রো থেকে শুরু করে যুক্তাক্ষর পর্যন্ত — ১৩ স্তরের পূর্ণাঙ্গ কোর্স।
          প্রতিটি পাঠ সম্পন্ন করে পরবর্তী স্তরে যান।
        </p>
        <Link
          href="/dashboard/lessons"
          className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-indigo-500/30 hover:scale-105"
        >
          কোর্স শুরু করুন →
        </Link>
      </section>

      {/* What is practice */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-4 text-indigo-200">বাংলা টাইপিং কীভাবে শিখবেন?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            বাংলা টাইপিং শেখার সঠিক পথ হলো — ধাপে ধাপে। প্রথমে হাতের সঠিক অবস্থান শিখুন,
            তারপর হোম রো-র অক্ষরগুলো আয়ত্ত করুন। এরপর টপ রো, বটম রো, কার, হসন্ত এবং
            সবশেষে যুক্তাক্ষর শিখুন।
          </p>
          <p className="text-slate-300 leading-relaxed">
            সবচেয়ে গুরুত্বপূর্ণ নিয়ম: <strong className="text-white">স্ক্রিনের দিকে তাকিয়ে টাইপ করুন, কীবোর্ডের দিকে নয়।</strong>
            শুরুতে ধীরে ধীরে সঠিকভাবে টাইপ করুন। গতি এমনিই বাড়বে।
          </p>
        </div>
      </section>

      {/* Course Stages */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">কোর্সের ধাপগুলো</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {stages.map((s, i) => (
            <Link
              key={i}
              href={s.link}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors flex items-start gap-4"
            >
              <span className="text-3xl">{s.badge}</span>
              <div>
                <div className="font-semibold mb-1">
                  {i + 1}. {s.name}
                </div>
                <div className="text-slate-400 text-sm">{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Practice Tips */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">বাংলা টাইপিং দ্রুত শেখার ১০টি টিপস</h2>
          <ol className="space-y-3 text-slate-300">
            {[
              'প্রতিদিন অন্তত ১৫–২০ মিনিট অনুশীলন করুন',
              'হোম রো সম্পূর্ণ আয়ত্ত না হওয়া পর্যন্ত পরের ধাপে যাবেন না',
              'স্ক্রিনের দিকে তাকান, কীবোর্ডের দিকে নয়',
              'শুরুতে ধীরে সঠিকভাবে — গতি পরে আসবে',
              'একটি নির্দিষ্ট লেআউট বেছে নিন (Avro বা Bijoy) এবং সেটিতেই অনুশীলন করুন',
              'ভুল হলে Backspace ব্যবহার করুন, অনুমানে এগিয়ে যাবেন না',
              'প্রতি সেশনের পর আপনার ভুলের pattern দেখুন',
              'যুক্তাক্ষর আলাদাভাবে অনুশীলন করুন',
              'সপ্তাহে একবার স্পিড টেস্ট দিয়ে অগ্রগতি মাপুন',
              'ধৈর্য রাখুন — সাধারণত ৩০–৬০ ঘণ্টা অনুশীলনে ভালো গতি আসে',
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Internal Links */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">বিশেষ পাঠগুলো</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/learn/home-row" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="text-2xl mb-2">🏠</div>
            <div className="font-semibold mb-1">হোম রো</div>
            <div className="text-slate-400 text-sm">টাইপিং-এর ভিত্তি</div>
          </Link>
          <Link href="/learn/kar" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="text-2xl mb-2">ি</div>
            <div className="font-semibold mb-1">কার অনুশীলন</div>
            <div className="text-slate-400 text-sm">সব কার একসাথে</div>
          </Link>
          <Link href="/learn/juktakkhor" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="text-2xl mb-2">ক্ষ</div>
            <div className="font-semibold mb-1">যুক্তাক্ষর</div>
            <div className="text-slate-400 text-sm">জটিল অক্ষর শিখুন</div>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">আজই শুরু করুন</h2>
        <p className="text-slate-300 mb-8">
          Level 0 থেকে শুরু করুন। প্রতিটি পাঠ সম্পন্ন করলে পরের পাঠ unlock হবে।
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/dashboard/lessons"
            className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105"
          >
            কোর্স শুরু করুন →
          </Link>
          <Link
            href="/bangla-typing-test"
            className="inline-block bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all"
          >
            টেস্ট দিন
          </Link>
        </div>
      </section>
    </main>
  );
}
