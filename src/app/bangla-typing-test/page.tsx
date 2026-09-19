import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা টাইপিং টেস্ট — অনলাইনে গতি ও নির্ভুলতা পরীক্ষা',
  description:
    'বিনামূল্যে অনলাইনে বাংলা টাইপিং টেস্ট দিন। WPM, GPM ও Accuracy পরিমাপ করুন। Avro ও Bijoy উভয় লেআউটে। সময়: ১ মিনিট, ৩ মিনিট বা ৫ মিনিট।',
  alternates: {
    canonical: `${siteUrl}/bangla-typing-test`,
  },
  openGraph: {
    title: 'বাংলা টাইপিং টেস্ট — অনলাইনে গতি ও নির্ভুলতা পরীক্ষা',
    description:
      'WPM, GPM ও Accuracy পরিমাপ করুন। Avro ও Bijoy লেআউটে বাংলা টাইপিং স্পিড টেস্ট।',
    url: `${siteUrl}/bangla-typing-test`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'বাংলা টাইপিং টেস্ট',
  description: 'অনলাইনে বিনামূল্যে বাংলা টাইপিং স্পিড টেস্ট। WPM ও GPM পরিমাপ।',
  url: `${siteUrl}/bangla-typing-test`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'বাংলা টাইপিং টেস্ট',
        item: `${siteUrl}/bangla-typing-test`,
      },
    ],
  },
};

export default function BanglaTypingTestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        {/* Hero */}
        <section className="px-4 py-16 text-center max-w-4xl mx-auto">
          <nav className="text-sm text-blue-300 mb-6">
            <Link href="/" className="hover:text-white transition-colors">হোম</Link>
            <span className="mx-2">›</span>
            <span className="text-white">বাংলা টাইপিং টেস্ট</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            বাংলা টাইপিং টেস্ট
          </h1>
          <p className="text-xl text-blue-200 mb-3">অনলাইনে গতি ও নির্ভুলতা পরীক্ষা করুন</p>
          <p className="text-blue-300 max-w-2xl mx-auto mb-8">
            Avro ও Bijoy কীবোর্ড লেআউটে বাংলা টাইপিং স্পিড পরীক্ষা করুন। 
            WPM (Words Per Minute), GPM (Graphemes Per Minute) ও নির্ভুলতা (Accuracy) একসাথে দেখুন।
          </p>
          <Link
            href="/dashboard/test"
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105"
          >
            এখনই টেস্ট শুরু করুন →
          </Link>
        </section>

        {/* What is Bangla Typing Test */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-4 text-blue-200">বাংলা টাইপিং টেস্ট কী?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              বাংলা টাইপিং টেস্ট হলো একটি অনলাইন সরঞ্জাম যা দিয়ে আপনি পরিমাপ করতে পারবেন
              আপনি প্রতি মিনিটে কতটি বাংলা শব্দ বা অক্ষর টাইপ করতে পারেন এবং সেই টাইপিং কতটা নির্ভুল।
              এটি সরকারি চাকরির প্রস্তুতি, ব্যক্তিগত দক্ষতা উন্নয়ন এবং পেশাদার কাজে অপরিহার্য।
            </p>
            <p className="text-slate-300 leading-relaxed">
              আমাদের টেস্টে বাস্তব বাংলা শব্দ ও বাক্য ব্যবহার করা হয়। প্রতিটি টেস্টের পর 
              বিস্তারিত ফলাফল — কোন অক্ষরে ভুল, গড় গতি, সেরা গতি — সব দেখতে পাবেন।
            </p>
          </div>
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6 text-center">কী পরিমাপ করা হয়?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">WPM</div>
              <h3 className="font-semibold mb-2">Words Per Minute</h3>
              <p className="text-slate-400 text-sm">প্রতি মিনিটে কতটি শব্দ টাইপ করলেন তার পরিমাপ।</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">GPM</div>
              <h3 className="font-semibold mb-2">Graphemes Per Minute</h3>
              <p className="text-slate-400 text-sm">বাংলার জন্য বিশেষভাবে তৈরি — প্রতি মিনিটে সঠিক বাংলা অক্ষরের সংখ্যা।</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">%</div>
              <h3 className="font-semibold mb-2">Accuracy</h3>
              <p className="text-slate-400 text-sm">মোট টাইপের মধ্যে কতটি সঠিক ছিল তার শতকরা হার।</p>
            </div>
          </div>
        </section>

        {/* Avro vs Bijoy */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6">অভ্র বনাম বিজয় — কোন লেআউটে টেস্ট দেবেন?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-blue-300 mb-3">🔤 অভ্র (Avro)</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>✓ ফোনেটিক লেআউট — উচ্চারণ অনুযায়ী টাইপ</li>
                  <li>✓ নতুনদের জন্য তুলনামূলক সহজ</li>
                  <li>✓ ইন্টারনেটে বাংলা লেখার জন্য জনপ্রিয়</li>
                  <li>✓ Open source, বিনামূল্যে</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-300 mb-3">⌨️ বিজয় (Bijoy)</h3>
                <ul className="text-slate-300 space-y-2 text-sm">
                  <li>✓ অফিস ও সরকারি কাজে মানক</li>
                  <li>✓ সরকারি চাকরির টাইপিং পরীক্ষায় ব্যবহৃত</li>
                  <li>✓ Fixed layout — দ্রুত গতি অর্জন সম্ভব</li>
                  <li>✓ পেশাদার টাইপিস্টদের পছন্দ</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Test Duration */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6 text-center">টেস্টের সময়সীমা</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { time: '১ মিনিট', desc: 'দ্রুত পরীক্ষা', color: 'green' },
              { time: '৩ মিনিট', desc: 'স্ট্যান্ডার্ড', color: 'blue' },
              { time: '৫ মিনিট', desc: 'পেশাদার পরীক্ষা', color: 'purple' },
            ].map((t) => (
              <div
                key={t.time}
                className={`bg-${t.color}-500/10 border border-${t.color}-500/20 rounded-xl p-6 text-center`}
              >
                <div className="text-2xl font-bold mb-1">{t.time}</div>
                <div className="text-slate-400 text-sm">{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Content */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">সাধারণ প্রশ্ন</h2>
          <div className="space-y-4">
            {[
              {
                q: 'বাংলা টাইপিং টেস্টে ভালো স্কোর কত?',
                a: 'সাধারণভাবে ৩০+ WPM ও ৯০%+ accuracy ভালো বলে বিবেচিত। সরকারি চাকরির জন্য সংশ্লিষ্ট নিয়োগ বিজ্ঞপ্তি দেখে নিন।',
              },
              {
                q: 'GPM কেন WPM-এর চেয়ে গুরুত্বপূর্ণ?',
                a: 'বাংলায় একটি শব্দে অনেক জটিল অক্ষর থাকতে পারে। GPM বাংলার grapheme-ভিত্তিক স্কোরিং ব্যবহার করে, তাই এটি আরও নির্ভুল পরিমাপ দেয়।',
              },
              {
                q: 'টেস্টে কোন ধরনের বাংলা পাঠ্য ব্যবহার হয়?',
                a: 'সাধারণ বাংলা শব্দ, বাক্য এবং অনুচ্ছেদ — যুক্তাক্ষর ও কার সহ। এটি বাস্তব ব্যবহারের কাছাকাছি।',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold text-blue-200 mb-2">{item.q}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">আরও দেখুন</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/bangla-typing-practice" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold mb-1">বাংলা টাইপিং প্র্যাকটিস</div>
              <div className="text-slate-400 text-sm">ধাপে ধাপে টাইপিং শিখুন</div>
            </Link>
            <Link href="/avro-typing-test" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
              <div className="text-2xl mb-2">🔤</div>
              <div className="font-semibold mb-1">অভ্র টাইপিং টেস্ট</div>
              <div className="text-slate-400 text-sm">Avro লেআউটে পরীক্ষা</div>
            </Link>
            <Link href="/bijoy-typing-test" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
              <div className="text-2xl mb-2">⌨️</div>
              <div className="font-semibold mb-1">বিজয় টাইপিং টেস্ট</div>
              <div className="text-slate-400 text-sm">Bijoy লেআউটে পরীক্ষা</div>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">আজই আপনার টাইপিং গতি পরিমাপ করুন</h2>
          <p className="text-slate-300 mb-8">বিনামূল্যে, নিবন্ধন ছাড়াই শুরু করা যায়।</p>
          <Link
            href="/dashboard/test"
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105"
          >
            টাইপিং টেস্ট শুরু করুন →
          </Link>
        </section>
      </main>
    </>
  );
}
