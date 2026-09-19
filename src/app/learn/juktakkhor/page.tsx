import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা যুক্তাক্ষর টাইপিং — ক্ষ জ্ঞ শ্র ত্র কীভাবে টাইপ করবেন',
  description:
    'বাংলা যুক্তাক্ষর টাইপিং শিখুন। ক্ষ, জ্ঞ, শ্র, ত্র, ন্ত, ম্ব — Avro ও Bijoy উভয় লেআউটে কীভাবে লিখবেন তার সম্পূর্ণ গাইড।',
  alternates: { canonical: `${siteUrl}/learn/juktakkhor` },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'বাংলা যুক্তাক্ষর টাইপিং',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'শেখার পাঠ', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'যুক্তাক্ষর', item: `${siteUrl}/learn/juktakkhor` },
    ],
  },
};

const commonConjuncts = [
  { conjunct: 'ক্ষ', formation: 'ক + ্ + ষ', avro: 'ksh', bijoy: 'k+G+Z', examples: ['ক্ষমা', 'ক্ষতি', 'দক্ষ'] },
  { conjunct: 'জ্ঞ', formation: 'জ + ্ + ঞ', avro: 'gg / jj', bijoy: 'j+G+i', examples: ['জ্ঞান', 'বিজ্ঞান', 'আজ্ঞা'] },
  { conjunct: 'শ্র', formation: 'শ + ্ + র', avro: 'shr', bijoy: 'i+G+v', examples: ['শ্রম', 'শ্রেণি', 'বিশ্রাম'] },
  { conjunct: 'ত্র', formation: 'ত + ্ + র', avro: 'tr', bijoy: 'k+G+v (bijoy)', examples: ['ত্রাণ', 'মিত্র', 'পাত্র'] },
  { conjunct: 'ন্ত', formation: 'ন + ্ + ত', avro: 'nt', bijoy: 'h+G+k', examples: ['অন্ত', 'মন্ত্রী', 'সন্তান'] },
  { conjunct: 'ম্ব', formation: 'ম + ্ + ব', avro: 'mb', bijoy: 'm+G+c', examples: ['অম্বু', 'লম্বা', 'স্তম্ভ'] },
  { conjunct: 'ন্দ', formation: 'ন + ্ + দ', avro: 'nd', bijoy: 'h+G+w', examples: ['আনন্দ', 'বন্দর', 'সুন্দর'] },
  { conjunct: 'ক্ত', formation: 'ক + ্ + ত', avro: 'kt', bijoy: 'k+G+k', examples: ['রক্ত', 'শক্তি', 'ভক্ত'] },
  { conjunct: 'ষ্ট', formation: 'ষ + ্ + ট', avro: 'sht', bijoy: 'Z+G+T', examples: ['কষ্ট', 'স্পষ্ট', 'নষ্ট'] },
  { conjunct: 'স্ত', formation: 'স + ্ + ত', avro: 'st', bijoy: 'c+G+k', examples: ['স্থান', 'বস্তু', 'মস্তিষ্ক'] },
  { conjunct: 'ল্ল', formation: 'ল + ্ + ল', avro: 'll', bijoy: 'l+G+l', examples: ['আল্লাহ', 'উল্লাস', 'গল্প'] },
  { conjunct: 'ক্ক', formation: 'ক + ্ + ক', avro: 'kk', bijoy: 'k+G+k', examples: ['মক্কা', 'ধক্কা', 'ঢক্কা'] },
];

export default function JuktakkhorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-fuchsia-950 to-slate-900 text-white">
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <nav className="text-sm text-fuchsia-300 mb-6">
            <Link href="/" className="hover:text-white">হোম</Link>
            <span className="mx-2">›</span>
            <Link href="/learn" className="hover:text-white">শেখার পাঠ</Link>
            <span className="mx-2">›</span>
            <span className="text-white">যুক্তাক্ষর</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা যুক্তাক্ষর টাইপিং</h1>
          <p className="text-fuchsia-200 text-xl mb-4">ক্ষ জ্ঞ শ্র ত্র — কীভাবে টাইপ করবেন?</p>
          <p className="text-slate-300 max-w-2xl leading-relaxed mb-8">
            যুক্তাক্ষর হলো দুই বা ততোধিক ব্যঞ্জনবর্ণের সংযোগ। হসন্ত (্) দিয়ে এগুলো তৈরি হয়।
            বাংলায় প্রায় ৩০০+ যুক্তাক্ষর আছে, তবে সাধারণ ব্যবহারে ৩০–৫০টি যথেষ্ট।
          </p>
          <Link href="/dashboard/lessons" className="inline-block bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105">
            যুক্তাক্ষর অনুশীলন শুরু করুন →
          </Link>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-200">যুক্তাক্ষর কীভাবে টাইপ করবেন?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              যেকোনো যুক্তাক্ষর টাইপ করার নিয়ম একটাই:
            </p>
            <div className="bg-fuchsia-500/10 rounded-xl p-6 text-center text-xl mb-4">
              <span className="text-fuchsia-300">প্রথম অক্ষর</span>
              <span className="text-white mx-3">+</span>
              <span className="text-amber-300">হসন্ত (্)</span>
              <span className="text-white mx-3">+</span>
              <span className="text-blue-300">দ্বিতীয় অক্ষর</span>
            </div>
            <p className="text-slate-400 text-sm text-center">উদাহরণ: ক + ্ + ষ = ক্ষ</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-6">সাধারণ যুক্তাক্ষর — Avro ও Bijoy কী</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {commonConjuncts.map((c, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-fuchsia-300 shrink-0">{c.conjunct}</span>
                  <div className="text-slate-400 text-sm font-mono">{c.formation}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div><span className="text-slate-500">Avro: </span><span className="font-mono text-emerald-300">{c.avro}</span></div>
                  <div><span className="text-slate-500">Bijoy: </span><span className="font-mono text-orange-300">{c.bijoy}</span></div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {c.examples.map((ex) => (
                    <span key={ex} className="bg-white/10 rounded px-2 py-0.5 text-xs">{ex}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-4">যুক্তাক্ষর শেখার কৌশল</h2>
            <ul className="text-slate-300 space-y-3">
              <li className="flex gap-3"><span className="text-fuchsia-400">১.</span> প্রথমে হসন্ত আয়ত্ত করুন। তারপর যুক্তাক্ষর শিখুন।</li>
              <li className="flex gap-3"><span className="text-fuchsia-400">২.</span> ক্ষ, জ্ঞ, শ্র — এই তিনটি দিয়ে শুরু করুন। এগুলো সবচেয়ে বেশি ব্যবহৃত।</li>
              <li className="flex gap-3"><span className="text-fuchsia-400">৩.</span> প্রতিটি যুক্তাক্ষর আলাদাভাবে অনুশীলন করুন।</li>
              <li className="flex gap-3"><span className="text-fuchsia-400">৪.</span> যুক্তাক্ষর সম্বলিত শব্দ দিয়ে অনুশীলন করুন — বিশুদ্ধ pattern নয়।</li>
              <li className="flex gap-3"><span className="text-fuchsia-400">৫.</span> ধীরে ধীরে সঠিকভাবে — তারপর গতি বাড়ান।</li>
            </ul>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex gap-4 justify-between">
            <Link href="/learn/phola" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
              <div className="text-slate-400 text-sm mb-1">← আগের বিষয়</div>
              <div className="font-semibold">ফলা</div>
            </Link>
            <Link href="/learn/words" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
              <div className="text-slate-400 text-sm mb-1">পরের বিষয় →</div>
              <div className="font-semibold">শব্দ অনুশীলন</div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
