import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা টাইপিং শেখার সব পাঠ — Learn Hub',
  description:
    'হোম রো, কার, হসন্ত, ফলা, যুক্তাক্ষর — সব বিষয়ের বাংলা টাইপিং পাঠ এক জায়গায়।',
  alternates: { canonical: `${siteUrl}/learn` },
};

const topics = [
  {
    href: '/learn/home-row',
    badge: '🏠',
    title: 'হোম রো (Home Row)',
    subtitle: 'টাইপিং-এর ভিত্তি',
    desc: 'া স ড ফ গ ্ জ ক ল — সবচেয়ে গুরুত্বপূর্ণ কী-গুলো শিখুন। হোম রো আয়ত্ত না হলে বাকি কিছু ঠিকমতো শেখা কঠিন।',
    keys: ['া', 'স', 'ড', 'ফ', 'গ', 'হ', 'জ', 'ক', 'ল'],
  },
  {
    href: '/learn/kar',
    badge: 'ি',
    title: 'কার (Vowel Signs)',
    subtitle: 'স্বরবর্ণ চিহ্ন',
    desc: 'আ-কার, ই-কার, ঈ-কার, উ-কার, ঊ-কার, ঋ-কার, এ-কার, ঐ-কার, ও-কার, ঔ-কার — সব কার।',
    keys: ['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ'],
  },
  {
    href: '/learn/hasanta',
    badge: '্',
    title: 'হসন্ত (Hasanta)',
    subtitle: 'হসন্ত ও ফলা',
    desc: 'বাংলার সবচেয়ে গুরুত্বপূর্ণ চিহ্ন — হসন্ত (্)। এটি ছাড়া যুক্তাক্ষর লেখা সম্ভব নয়।',
    keys: ['্'],
  },
  {
    href: '/learn/phola',
    badge: 'র্',
    title: 'ফলা (Phola)',
    subtitle: 'য-ফলা, র-ফলা, ব-ফলা',
    desc: 'য-ফলা (্য), র-ফলা (্র), ব-ফলা (্ব), ম-ফলা (্ম) — বাংলার বিশেষ ফলাগুলো।',
    keys: ['্য', '্র', '্ব', '্ম'],
  },
  {
    href: '/learn/juktakkhor',
    badge: 'ক্ষ',
    title: 'যুক্তাক্ষর (Conjunct)',
    subtitle: 'জটিল অক্ষর সমূহ',
    desc: 'বাংলার সবচেয়ে কঠিন অংশ — ক্ষ, জ্ঞ, শ্র, ত্র, ন্ত, ম্ব এবং আরও অনেক যুক্তাক্ষর।',
    keys: ['ক্ষ', 'জ্ঞ', 'শ্র', 'ত্র', 'ন্ত', 'ম্ব'],
  },
  {
    href: '/learn/words',
    badge: '📝',
    title: 'সাধারণ শব্দ',
    subtitle: 'বাংলার সচরাচর ব্যবহৃত শব্দ',
    desc: 'বাংলায় সবচেয়ে বেশি ব্যবহৃত শব্দগুলো টাইপ করার অনুশীলন — আমি, তুমি, বাংলা, ভালো।',
    keys: ['আমি', 'তুমি', 'বাংলা', 'ভালো'],
  },
  {
    href: '/learn/punctuation',
    badge: '।',
    title: 'বিরামচিহ্ন',
    subtitle: 'দাঁড়ি, প্রশ্নবোধক ও বিশেষ চিহ্ন',
    desc: 'দাঁড়ি (।), বিসর্গ (ঃ), অনুস্বার (ং), চন্দ্রবিন্দু (ঁ) ও অন্যান্য বিরামচিহ্ন।',
    keys: ['।', 'ঃ', 'ং', 'ঁ', 'ৎ'],
  },
];

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white">
      <section className="px-4 py-16 text-center max-w-5xl mx-auto">
        <nav className="text-sm text-teal-300 mb-6">
          <Link href="/" className="hover:text-white transition-colors">হোম</Link>
          <span className="mx-2">›</span>
          <span className="text-white">বাংলা টাইপিং শেখা</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">বাংলা টাইপিং শেখার পাঠ</h1>
        <p className="text-xl text-teal-200 mb-3">বিষয় অনুযায়ী সব পাঠ</p>
        <p className="text-teal-300 max-w-2xl mx-auto mb-8">
          হোম রো থেকে যুক্তাক্ষর পর্যন্ত — প্রতিটি বিষয়ের জন্য আলাদা পাঠ।
          যে বিষয়ে দুর্বল, সেখান থেকে শুরু করুন।
        </p>
        <Link
          href="/bangla-typing-course"
          className="inline-block bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:scale-105"
        >
          পূর্ণাঙ্গ কোর্স দেখুন →
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {topics.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{t.badge}</span>
                <div className="flex-1">
                  <h2 className="font-bold text-lg group-hover:text-teal-300 transition-colors">{t.title}</h2>
                  <p className="text-teal-400 text-sm mb-2">{t.subtitle}</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{t.desc}</p>
                  <div className="flex gap-2 flex-wrap">
                    {t.keys.slice(0, 6).map((k) => (
                      <span key={k} className="bg-white/10 rounded px-2 py-1 text-sm font-mono">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">সম্পূর্ণ কোর্সে যোগ দিন</h2>
        <p className="text-slate-300 mb-6">Level 0 থেকে শুরু করুন, Level 12 পর্যন্ত যান।</p>
        <Link
          href="/dashboard/lessons"
          className="inline-block bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105"
        >
          সব lesson দেখুন →
        </Link>
      </section>
    </main>
  );
}
