import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা শব্দ টাইপিং — সাধারণ বাংলা শব্দ অনুশীলন',
  description:
    'বাংলায় সবচেয়ে বেশি ব্যবহৃত শব্দগুলো টাইপ করার অনুশীলন করুন। দৈনন্দিন কথোপকথন, অফিস ও শিক্ষামূলক শব্দ।',
  alternates: { canonical: `${siteUrl}/learn/words` },
};

const wordCategories = [
  {
    category: 'দৈনন্দিন শব্দ',
    words: ['আমি', 'তুমি', 'সে', 'আমরা', 'আপনি', 'ভালো', 'খারাপ', 'হ্যাঁ', 'না', 'ধন্যবাদ'],
  },
  {
    category: 'পারিবারিক শব্দ',
    words: ['মা', 'বাবা', 'ভাই', 'বোন', 'পরিবার', 'সংসার', 'বাড়ি', 'ঘর', 'আত্মীয়'],
  },
  {
    category: 'অফিস ও কাজ',
    words: ['কাজ', 'অফিস', 'চাকরি', 'বেতন', 'প্রতিষ্ঠান', 'কর্মকর্তা', 'আবেদন', 'নিয়োগ'],
  },
  {
    category: 'শিক্ষামূলক শব্দ',
    words: ['শিক্ষা', 'বিদ্যালয়', 'বিশ্ববিদ্যালয়', 'পরীক্ষা', 'ফলাফল', 'সার্টিফিকেট'],
  },
];

export default function WordsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-lime-950 to-slate-900 text-white">
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <nav className="text-sm text-lime-300 mb-6">
          <Link href="/" className="hover:text-white">হোম</Link>
          <span className="mx-2">›</span>
          <Link href="/learn" className="hover:text-white">শেখার পাঠ</Link>
          <span className="mx-2">›</span>
          <span className="text-white">শব্দ অনুশীলন</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা শব্দ টাইপিং</h1>
        <p className="text-lime-200 text-xl mb-4">সাধারণ বাংলা শব্দ অনুশীলন</p>
        <p className="text-slate-300 max-w-2xl leading-relaxed mb-8">
          অক্ষর শেখার পরে পুরো শব্দ টাইপ করার অনুশীলন দরকার। বাংলায় সবচেয়ে বেশি ব্যবহৃত 
          শব্দগুলো আয়ত্ত করলে দৈনন্দিন কাজ সহজ হয়ে যায়।
        </p>
        <Link href="/dashboard/lessons" className="inline-block bg-lime-500 hover:bg-lime-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105">
          শব্দ অনুশীলন শুরু করুন →
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">শ্রেণিভিত্তিক শব্দ</h2>
        <div className="space-y-6">
          {wordCategories.map((cat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold text-lime-300 mb-4">{cat.category}</h3>
              <div className="flex gap-3 flex-wrap">
                {cat.words.map((word) => (
                  <span key={word} className="bg-lime-500/10 border border-lime-500/20 rounded-lg px-3 py-2 text-lg font-bold">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex gap-4 justify-between">
          <Link href="/learn/juktakkhor" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
            <div className="text-slate-400 text-sm mb-1">← আগের বিষয়</div>
            <div className="font-semibold">যুক্তাক্ষর</div>
          </Link>
          <Link href="/learn/punctuation" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 flex-1 text-center transition-colors">
            <div className="text-slate-400 text-sm mb-1">পরের বিষয় →</div>
            <div className="font-semibold">বিরামচিহ্ন</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
