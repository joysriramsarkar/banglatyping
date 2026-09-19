import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা হসন্ত টাইপিং — হসন্ত (্) দিয়ে যুক্তাক্ষর লেখার নিয়ম',
  description:
    'বাংলা হসন্ত (্) টাইপ করার নিয়ম শিখুন। হসন্ত ছাড়া যুক্তাক্ষর লেখা সম্ভব নয়। Avro ও Bijoy উভয় লেআউটে শিখুন।',
  alternates: { canonical: `${siteUrl}/learn/hasanta` },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'বাংলা হসন্ত টাইপিং',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'শেখার পাঠ', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'হসন্ত', item: `${siteUrl}/learn/hasanta` },
    ],
  },
};

const examples = [
  { conjunct: 'ক্', base: 'ক + ্', example: 'ক্ষমা, ক্লাস' },
  { conjunct: 'দ্', base: 'দ + ্', example: 'বিদ্যালয়, সদ্য' },
  { conjunct: 'ত্', base: 'ত + ্', example: 'সত্য, উত্তর' },
  { conjunct: 'স্', base: 'স + ্', example: 'স্থান, মস্তিষ্ক' },
  { conjunct: 'ম্', base: 'ম + ্', example: 'সম্মান, আম্মু' },
  { conjunct: 'ন্', base: 'ন + ্', example: 'মন্ত্রী, জন্ম' },
];

export default function HasantaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white">
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <nav className="text-sm text-amber-300 mb-6">
            <Link href="/" className="hover:text-white">হোম</Link>
            <span className="mx-2">›</span>
            <Link href="/learn" className="hover:text-white">শেখার পাঠ</Link>
            <span className="mx-2">›</span>
            <span className="text-white">হসন্ত</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা হসন্ত টাইপিং</h1>
          <p className="text-amber-200 text-xl mb-4">হসন্ত (্) — যুক্তাক্ষরের রহস্য</p>
          <p className="text-slate-300 max-w-2xl leading-relaxed mb-8">
            হসন্ত (্) বাংলার সবচেয়ে গুরুত্বপূর্ণ চিহ্ন। এটি দুটি ব্যঞ্জনবর্ণকে জুড়ে দিয়ে 
            যুক্তাক্ষর তৈরি করে। Bijoy-এ হসন্ত লেখা হয় G কী দিয়ে।
          </p>
          <Link href="/dashboard/lessons" className="inline-block bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105">
            হসন্ত অনুশীলন শুরু করুন →
          </Link>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-4 text-amber-200">হসন্ত কীভাবে কাজ করে?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              বাংলায় ক + হসন্ত + ষ = ক্ষ। অর্থাৎ হসন্ত দুটি ব্যঞ্জনবর্ণের মাঝে থেকে তাদের জুড়ে দেয়।
            </p>
            <div className="bg-amber-500/10 rounded-xl p-4 text-center mb-4">
              <span className="text-4xl font-bold">ক + ্ + ষ = ক্ষ</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Bijoy-এ হসন্ত: </span><span className="font-mono text-orange-300">G কী</span></div>
              <div><span className="text-slate-400">Avro-তে হসন্ত: </span><span className="font-mono text-emerald-300">্ বা hasanta</span></div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">হসন্ত দিয়ে তৈরি অক্ষর — উদাহরণ</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {examples.map((e, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-amber-300 mb-2">{e.conjunct}</div>
                <div className="text-slate-400 text-sm mb-2 font-mono">{e.base}</div>
                <div className="text-slate-300 text-xs">{e.example}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex gap-4 justify-between">
            <Link href="/learn/kar" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
              <div className="text-slate-400 text-sm mb-1">← আগের বিষয়</div>
              <div className="font-semibold">কার</div>
            </Link>
            <Link href="/learn/phola" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
              <div className="text-slate-400 text-sm mb-1">পরের বিষয় →</div>
              <div className="font-semibold">ফলা</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
