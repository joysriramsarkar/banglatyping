import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা কার টাইপিং — আ-কার থেকে ঔ-কার শেখার গাইড',
  description:
    'বাংলার সব কার (vowel signs) টাইপ করা শিখুন। আ-কার (া), ই-কার (ি), উ-কার (ু), এ-কার (ে), ও-কার (ো) সহ সম্পূর্ণ গাইড।',
  alternates: { canonical: `${siteUrl}/learn/kar` },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'বাংলা কার টাইপিং',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'শেখার পাঠ', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'কার', item: `${siteUrl}/learn/kar` },
    ],
  },
};

const kars = [
  { name: 'আ-কার', symbol: 'া', avro: 'a', bijoy: 'f', example: 'কাজ, বাড়ি, আলো', desc: 'সবচেয়ে বেশি ব্যবহৃত কার' },
  { name: 'ই-কার', symbol: 'ি', avro: 'i', bijoy: 'l', example: 'নিজে, বিড়াল, খিদে', desc: 'ছোট ই-কার' },
  { name: 'ঈ-কার', symbol: 'ী', avro: 'I / ee', bijoy: 'L (shift)', example: 'নীল, পানীয়, দীর্ঘ', desc: 'বড় ই-কার' },
  { name: 'উ-কার', symbol: 'ু', avro: 'u', bijoy: 's+shift', example: 'ভুল, কুল, মুখ', desc: 'ছোট উ-কার' },
  { name: 'ঊ-কার', symbol: 'ূ', avro: 'U / oo', bijoy: 'S (shift)', example: 'দূর, পূর্ণ, ভূমি', desc: 'বড় উ-কার' },
  { name: 'ঋ-কার', symbol: 'ৃ', avro: 'rri', bijoy: 'special', example: 'কৃষক, তৃণ, বৃষ্টি', desc: 'ঋ-কার' },
  { name: 'এ-কার', symbol: 'ে', avro: 'e', bijoy: 'e', example: 'মেয়ে, ছেলে, দেশ', desc: 'এ-কার (e)' },
  { name: 'ঐ-কার', symbol: 'ৈ', avro: 'oi', bijoy: 'E (shift)', example: 'পৈতৃক, বৈশাখ', desc: 'ঐ-কার' },
  { name: 'ও-কার', symbol: 'ো', avro: 'o', bijoy: 'o+f', example: 'বোন, ফোন, রোজ', desc: 'ও-কার' },
  { name: 'ঔ-কার', symbol: 'ৌ', avro: 'ou', bijoy: 'O+F', example: 'ঔষধ, নৌকা', desc: 'ঔ-কার' },
];

export default function KarPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white">
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <nav className="text-sm text-rose-300 mb-6">
            <Link href="/" className="hover:text-white">হোম</Link>
            <span className="mx-2">›</span>
            <Link href="/learn" className="hover:text-white">শেখার পাঠ</Link>
            <span className="mx-2">›</span>
            <span className="text-white">কার</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা কার টাইপিং</h1>
          <p className="text-rose-200 text-xl mb-4">আ-কার থেকে ঔ-কার — সম্পূর্ণ গাইড</p>
          <p className="text-slate-300 max-w-2xl leading-relaxed mb-8">
            বাংলায় স্বরবর্ণ চিহ্নকে &quot;কার&quot; বলা হয়। আ-কার (া), ই-কার (ি), উ-কার (ু) — 
            এই কার-গুলো ছাড়া বাংলা লেখা অসম্পূর্ণ। প্রতিটি কারের আলাদা কী আছে।
          </p>
          <Link
            href="/dashboard/lessons"
            className="inline-block bg-rose-500 hover:bg-rose-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105"
          >
            কার অনুশীলন শুরু করুন →
          </Link>
        </section>

        {/* Kar Table */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">সব কার — বিস্তারিত</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {kars.map((k, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-5xl font-bold text-rose-300">{k.symbol}</span>
                  <div>
                    <div className="font-bold text-lg">{k.name}</div>
                    <div className="text-slate-400 text-sm">{k.desc}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-slate-500">Avro: </span>
                    <span className="font-mono text-emerald-300">{k.avro}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Bijoy: </span>
                    <span className="font-mono text-orange-300">{k.bijoy}</span>
                  </div>
                </div>
                <div className="text-slate-400 text-xs">উদাহরণ: {k.example}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-4">কার শেখার টিপস</h2>
            <ul className="text-slate-300 space-y-3">
              <li className="flex gap-3"><span className="text-rose-400">১.</span> আ-কার (া) দিয়ে শুরু করুন — এটি সবচেয়ে বেশি ব্যবহৃত।</li>
              <li className="flex gap-3"><span className="text-rose-400">২.</span> ছোট ও বড় ই-কার (ি/ী) আলাদাভাবে অনুশীলন করুন।</li>
              <li className="flex gap-3"><span className="text-rose-400">৩.</span> প্রতিটি কারকে ব্যঞ্জনবর্ণের সাথে মিলিয়ে অনুশীলন করুন।</li>
              <li className="flex gap-3"><span className="text-rose-400">৪.</span> ঋ-কার (ৃ) সবচেয়ে কম ব্যবহৃত — এটি শেষে শিখুন।</li>
            </ul>
          </div>
        </section>

        {/* Navigation */}
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex gap-4 justify-between">
            <Link href="/learn/home-row" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
              <div className="text-slate-400 text-sm mb-1">← আগের বিষয়</div>
              <div className="font-semibold">হোম রো</div>
            </Link>
            <Link href="/learn/hasanta" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
              <div className="text-slate-400 text-sm mb-1">পরের বিষয় →</div>
              <div className="font-semibold">হসন্ত</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
