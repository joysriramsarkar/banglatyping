import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা ফলা টাইপিং — য-ফলা, র-ফলা, ব-ফলা শেখার গাইড',
  description:
    'বাংলা ফলা টাইপিং শিখুন। য-ফলা (্য), র-ফলা (্র), ব-ফলা (্ব), ম-ফলা (্ম) — Avro ও Bijoy উভয় লেআউটে।',
  alternates: { canonical: `${siteUrl}/learn/phola` },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'বাংলা ফলা টাইপিং',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'শেখার পাঠ', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'ফলা', item: `${siteUrl}/learn/phola` },
    ],
  },
};

const pholas = [
  {
    name: 'য-ফলা',
    symbol: '্য',
    formation: 'হসন্ত + য',
    avro: 'y (after consonant)',
    bijoy: 'G+z',
    examples: ['শ্যাম', 'ব্যবহার', 'অভ্যাস', 'স্বাধীন্যতা'],
    desc: 'সবচেয়ে বেশি ব্যবহৃত ফলা',
  },
  {
    name: 'র-ফলা',
    symbol: '্র',
    formation: 'হসন্ত + র',
    avro: 'r (after consonant)',
    bijoy: 'G+v',
    examples: ['প্রকৃতি', 'ক্রিকেট', 'গ্রাম', 'ত্রাণ'],
    desc: 'ক্রিয়া ও বিশেষ্যে বহুল ব্যবহৃত',
  },
  {
    name: 'ব-ফলা',
    symbol: '্ব',
    formation: 'হসন্ত + ব',
    avro: 'b (after consonant)',
    bijoy: 'G+c',
    examples: ['দ্বীপ', 'বিশ্বাস', 'স্বামী', 'স্বপ্ন'],
    desc: 'বিশেষ্য ও বিশেষণে ব্যবহৃত',
  },
  {
    name: 'ম-ফলা',
    symbol: '্ম',
    formation: 'হসন্ত + ম',
    avro: 'm (after consonant)',
    bijoy: 'G+m',
    examples: ['আত্মা', 'রহস্য', 'পদ্মা', 'ব্রহ্ম'],
    desc: 'কম ব্যবহৃত কিন্তু গুরুত্বপূর্ণ',
  },
];

export default function PholaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <nav className="text-sm text-purple-300 mb-6">
            <Link href="/" className="hover:text-white">হোম</Link>
            <span className="mx-2">›</span>
            <Link href="/learn" className="hover:text-white">শেখার পাঠ</Link>
            <span className="mx-2">›</span>
            <span className="text-white">ফলা</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা ফলা টাইপিং</h1>
          <p className="text-purple-200 text-xl mb-4">য-ফলা, র-ফলা, ব-ফলা ও ম-ফলা</p>
          <p className="text-slate-300 max-w-2xl leading-relaxed mb-8">
            ফলা হলো হসন্তের পরে আসা বিশেষ ব্যঞ্জনবর্ণের রূপ — য, র, ব, ম। এগুলো ব্যঞ্জনবর্ণের 
            নিচে বা পাশে ছোট আকারে যুক্ত হয়। বাংলার অনেক শব্দে এই ফলাগুলো আসে।
          </p>
          <Link href="/dashboard/lessons" className="inline-block bg-purple-500 hover:bg-purple-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105">
            ফলা অনুশীলন শুরু করুন →
          </Link>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">চারটি প্রধান ফলা</h2>
          <div className="space-y-6">
            {pholas.map((p, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-6">
                  <div className="text-6xl font-bold text-purple-300 shrink-0">{p.symbol}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <span className="text-purple-400 text-sm">{p.desc}</span>
                    </div>
                    <div className="text-slate-400 text-sm mb-3">গঠন: {p.formation}</div>
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div><span className="text-slate-500">Avro: </span><span className="font-mono text-emerald-300">{p.avro}</span></div>
                      <div><span className="text-slate-500">Bijoy: </span><span className="font-mono text-orange-300">{p.bijoy}</span></div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {p.examples.map((ex) => (
                        <span key={ex} className="bg-purple-500/20 rounded px-2 py-1 text-sm">{ex}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex gap-4 justify-between">
            <Link href="/learn/hasanta" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
              <div className="text-slate-400 text-sm mb-1">← আগের বিষয়</div>
              <div className="font-semibold">হসন্ত</div>
            </Link>
            <Link href="/learn/juktakkhor" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
              <div className="text-slate-400 text-sm mb-1">পরের বিষয় →</div>
              <div className="font-semibold">যুক্তাক্ষর</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
