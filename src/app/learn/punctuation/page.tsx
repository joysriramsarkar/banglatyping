import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা বিরামচিহ্ন টাইপিং — দাঁড়ি, প্রশ্নবোধক ও বিশেষ চিহ্ন',
  description:
    'বাংলা বিরামচিহ্ন টাইপ করার নিয়ম শিখুন। দাঁড়ি (।), বিসর্গ (ঃ), অনুস্বার (ং), চন্দ্রবিন্দু (ঁ), খণ্ড-ত (ৎ) — সম্পূর্ণ গাইড।',
  alternates: { canonical: `${siteUrl}/learn/punctuation` },
};

const punctuations = [
  { symbol: '।', name: 'দাঁড়ি', avro: '|', bijoy: 'shift+G', usage: 'বাক্য শেষে ব্যবহৃত হয়', example: 'আমি বাংলায় কথা বলি।' },
  { symbol: 'ঃ', name: 'বিসর্গ', avro: 'H', bijoy: 'shift+F', usage: 'বিশেষ শব্দে ব্যবহৃত', example: 'দুঃখ, সুঃস্থ, নমঃ' },
  { symbol: 'ং', name: 'অনুস্বার', avro: 'N / ng', bijoy: 'shift+Q', usage: 'অনুনাসিক স্বর', example: 'বাংলা, রং, সংখ্যা' },
  { symbol: 'ঁ', name: 'চন্দ্রবিন্দু', avro: 'N (before vowel)', bijoy: 'shift+A', usage: 'অনুনাসিক উচ্চারণ', example: 'চাঁদ, হাঁস, গাঁ' },
  { symbol: 'ৎ', name: 'খণ্ড-ত', avro: 't (special)', bijoy: 'shift+T', usage: 'শব্দের শেষে আসে', example: 'উৎস, বৎসর, আৎকে' },
  { symbol: '?', name: 'প্রশ্নবোধক', avro: '?', bijoy: '?', usage: 'প্রশ্নবাচক বাক্যে', example: 'তুমি কেমন আছ?' },
  { symbol: '!', name: 'বিস্ময়বোধক', avro: '!', bijoy: '!', usage: 'বিস্ময় বা আবেগ', example: 'বাহ! কী সুন্দর!' },
  { symbol: ',', name: 'কমা', avro: ',', bijoy: ',', usage: 'বাক্যের মধ্যে বিরতি', example: 'সে গান, কবিতা লেখে।' },
];

export default function PunctuationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white">
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <nav className="text-sm text-sky-300 mb-6">
          <Link href="/" className="hover:text-white">হোম</Link>
          <span className="mx-2">›</span>
          <Link href="/learn" className="hover:text-white">শেখার পাঠ</Link>
          <span className="mx-2">›</span>
          <span className="text-white">বিরামচিহ্ন</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা বিরামচিহ্ন টাইপিং</h1>
        <p className="text-sky-200 text-xl mb-4">দাঁড়ি, বিসর্গ, অনুস্বার ও বিশেষ চিহ্ন</p>
        <p className="text-slate-300 max-w-2xl leading-relaxed mb-8">
          বিরামচিহ্ন ছাড়া বাংলা লেখা অসম্পূর্ণ। দাঁড়ি (।) থেকে শুরু করে খণ্ড-ত (ৎ) — 
          সব বিশেষ চিহ্ন টাইপ করার নিয়ম এখানে আছে।
        </p>
        <Link href="/dashboard/lessons" className="inline-block bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105">
          বিরামচিহ্ন অনুশীলন শুরু করুন →
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">সব বিরামচিহ্ন ও বিশেষ চিহ্ন</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {punctuations.map((p, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-5xl font-bold text-sky-300 min-w-[48px] text-center">{p.symbol}</span>
                <div>
                  <div className="font-bold text-lg">{p.name}</div>
                  <div className="text-slate-400 text-sm">{p.usage}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div><span className="text-slate-500">Avro: </span><span className="font-mono text-emerald-300">{p.avro}</span></div>
                <div><span className="text-slate-500">Bijoy: </span><span className="font-mono text-orange-300">{p.bijoy}</span></div>
              </div>
              <div className="text-slate-400 text-xs italic">{p.example}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex gap-4 justify-between">
          <Link href="/learn/words" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
            <div className="text-slate-400 text-sm mb-1">← আগের বিষয়</div>
            <div className="font-semibold">শব্দ অনুশীলন</div>
          </Link>
          <Link href="/bangla-typing-test" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
            <div className="text-slate-400 text-sm mb-1">পরীক্ষা দিন →</div>
            <div className="font-semibold">টাইপিং টেস্ট</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
