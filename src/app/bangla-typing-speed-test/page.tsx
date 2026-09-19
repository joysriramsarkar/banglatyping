import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা টাইপিং স্পিড টেস্ট — WPM, GPM ও Accuracy পরিমাপ',
  description:
    'অনলাইনে বাংলা টাইপিং স্পিড পরিমাপ করুন। Words Per Minute (WPM), Graphemes Per Minute (GPM) ও নির্ভুলতা (Accuracy) — বিস্তারিত ফলাফল পান।',
  alternates: {
    canonical: `${siteUrl}/bangla-typing-speed-test`,
  },
};

export default function BanglaTypingSpeedTestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 text-white">
      <section className="px-4 py-16 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-cyan-300 mb-6">
          <Link href="/" className="hover:text-white transition-colors">হোম</Link>
          <span className="mx-2">›</span>
          <span className="text-white">বাংলা টাইপিং স্পিড টেস্ট</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা টাইপিং স্পিড টেস্ট</h1>
        <p className="text-xl text-cyan-200 mb-3">WPM, GPM ও Accuracy পরিমাপ করুন</p>
        <p className="text-cyan-300 max-w-2xl mx-auto mb-8">
          বাংলা লেখার গতি পরিমাপের জন্য সবচেয়ে নির্ভুল পদ্ধতি। আপনার টাইপিং দ্রুততা ও নির্ভুলতা 
          একসাথে জানুন এবং অগ্রগতি ট্র্যাক করুন।
        </p>
        <Link
          href="/dashboard/test"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
        >
          স্পিড টেস্ট শুরু করুন →
        </Link>
      </section>

      {/* WPM vs GPM Explanation */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">WPM বনাম GPM — পার্থক্য কী?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-blue-300 mb-3">WPM (Words Per Minute)</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              প্রতি মিনিটে কতটি শব্দ টাইপ করলেন তার পরিমাপ। সাধারণত ৫টি character = ১টি শব্দ।
            </p>
            <p className="text-slate-400 text-sm">
              ⚠️ ইংরেজির জন্য তৈরি — বাংলার জন্য সবসময় সঠিক নয়।
            </p>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">GPM (Graphemes Per Minute)</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              বাংলার জন্য বিশেষভাবে তৈরি। প্রতি মিনিটে সঠিক বাংলা grapheme (অক্ষর-একক) সংখ্যা।
              যুক্তাক্ষর ও কার-কে সঠিকভাবে গণনা করে।
            </p>
            <p className="text-slate-400 text-sm">
              ✓ বাংলা টাইপিং-এর জন্য আরও নির্ভুল পরিমাপ।
            </p>
          </div>
        </div>
      </section>

      {/* Speed Levels */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">বাংলা টাইপিং স্পিডের স্তর</h2>
          <div className="space-y-3">
            {[
              { range: '০–১৫ WPM', level: 'শিক্ষানবিশ', color: 'text-red-400', desc: 'শেখা শুরু করুন' },
              { range: '১৫–৩০ WPM', level: 'মধ্যবর্তী', color: 'text-orange-400', desc: 'অনুশীলন চালিয়ে যান' },
              { range: '৩০–৪৫ WPM', level: 'দক্ষ', color: 'text-yellow-400', desc: 'দৈনন্দিন কাজে ভালো' },
              { range: '৪৫–৬০ WPM', level: 'পেশাদার', color: 'text-green-400', desc: 'অফিস কাজে উপযুক্ত' },
              { range: '৬০+ WPM', level: 'বিশেষজ্ঞ', color: 'text-cyan-400', desc: 'পেশাদার টাইপিস্ট' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                <span className="text-slate-300 w-28 shrink-0">{s.range}</span>
                <span className={`font-semibold ${s.color} w-24`}>{s.level}</span>
                <span className="text-slate-400 text-sm">{s.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-4">* সরকারি চাকরির জন্য সংশ্লিষ্ট নিয়োগ বিজ্ঞপ্তির নির্দিষ্ট মানদণ্ড দেখুন।</p>
        </div>
      </section>

      {/* Related */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">আরও দেখুন</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/bangla-typing-test" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="font-semibold mb-1">বাংলা টাইপিং টেস্ট</div>
            <div className="text-slate-400 text-sm">সাধারণ টাইপিং পরীক্ষা</div>
          </Link>
          <Link href="/bangla-typing-practice" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="font-semibold mb-1">টাইপিং প্র্যাকটিস</div>
            <div className="text-slate-400 text-sm">ধাপে ধাপে শিখুন</div>
          </Link>
          <Link href="/bangla-typing-course" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="font-semibold mb-1">বাংলা টাইপিং কোর্স</div>
            <div className="text-slate-400 text-sm">পূর্ণাঙ্গ কোর্স</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
