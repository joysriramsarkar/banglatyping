import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'অভ্র টাইপিং টেস্ট — Avro বাংলা টাইপিং প্র্যাকটিস',
  description:
    'অভ্র ফোনেটিক কীবোর্ড লেআউটে বাংলা টাইপিং টেস্ট ও অনুশীলন করুন। WPM ও Accuracy পরিমাপ করুন। নতুনদের জন্য আদর্শ।',
  alternates: {
    canonical: `${siteUrl}/avro-typing-test`,
  },
};

const avroKeys = [
  { key: 'k', bangla: 'ক' }, { key: 'kh', bangla: 'খ' }, { key: 'g', bangla: 'গ' },
  { key: 'gh', bangla: 'ঘ' }, { key: 'c', bangla: 'চ' }, { key: 'ch', bangla: 'ছ' },
  { key: 'j', bangla: 'জ' }, { key: 't', bangla: 'ট' }, { key: 'd', bangla: 'ড' },
  { key: 'n', bangla: 'ন' }, { key: 'p', bangla: 'প' }, { key: 'b', bangla: 'ব' },
  { key: 'm', bangla: 'ম' }, { key: 'r', bangla: 'র' }, { key: 'l', bangla: 'ল' },
  { key: 's', bangla: 'স' }, { key: 'sh', bangla: 'শ' }, { key: 'h', bangla: 'হ' },
];

export default function AvroTypingTestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white">
      <section className="px-4 py-16 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-emerald-300 mb-6">
          <Link href="/" className="hover:text-white transition-colors">হোম</Link>
          <span className="mx-2">›</span>
          <span className="text-white">অভ্র টাইপিং টেস্ট</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">অভ্র টাইপিং টেস্ট</h1>
        <p className="text-xl text-emerald-200 mb-3">Avro ফোনেটিক লেআউটে বাংলা টাইপিং</p>
        <p className="text-emerald-300 max-w-2xl mx-auto mb-8">
          অভ্র ফোনেটিক কীবোর্ডে বাংলা টাইপিং টেস্ট দিন। উচ্চারণ অনুযায়ী টাইপ করুন — 
          নতুনদের জন্য সবচেয়ে সহজ পদ্ধতি।
        </p>
        <Link
          href="/dashboard/test"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
        >
          Avro টাইপিং টেস্ট শুরু করুন →
        </Link>
      </section>

      {/* What is Avro */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-4 text-emerald-200">অভ্র কীবোর্ড কী?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            অভ্র (Avro) হলো বাংলাদেশের সবচেয়ে জনপ্রিয় বাংলা লেখার সফটওয়্যার। ২০০৩ সালে 
            Mehdi Hasan Khan তৈরি করেন। এটি Open Source এবং সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়।
          </p>
          <p className="text-slate-300 leading-relaxed">
            অভ্র ফোনেটিক লেআউটে আপনি উচ্চারণ অনুযায়ী লেখেন। যেমন: <span className="text-emerald-300 font-mono">amar</span> লিখলে 
            <span className="text-emerald-300"> আমার</span> হয়। এই কারণে নতুনদের জন্য শেখা সহজ।
          </p>
        </div>
      </section>

      {/* Key Reference */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">অভ্র ফোনেটিকের কিছু সাধারণ কী</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {avroKeys.map((k) => (
            <div key={k.key} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <div className="font-mono text-emerald-300 text-sm mb-1">{k.key}</div>
              <div className="text-xl">{k.bangla}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs mt-4 text-center">* সম্পূর্ণ কী-ম্যাপ অভ্র-এর অফিশিয়াল সাইটে পাবেন।</p>
      </section>

      {/* Compare */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-4">অভ্র কার জন্য ভালো?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-emerald-300 mb-3">✓ অভ্র বেছে নিন যদি:</h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li>• একেবারে নতুন শিখছেন</li>
                <li>• ইন্টারনেটে বাংলা লেখার জন্য দরকার</li>
                <li>• Social media, মেসেজিং-এ বাংলা লিখতে চান</li>
                <li>• উচ্চারণ-ভিত্তিক পদ্ধতি পছন্দ করেন</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-orange-300 mb-3">⚠️ বিজয় বেছে নিন যদি:</h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li>• সরকারি অফিসে কাজ করেন</li>
                <li>• সরকারি চাকরির টাইপিং পরীক্ষা দেবেন</li>
                <li>• পেশাদার সাংবাদিকতা বা প্রিন্ট মিডিয়ায় কাজ করেন</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/bijoy-typing-test" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="font-semibold mb-1">বিজয় টাইপিং টেস্ট</div>
            <div className="text-slate-400 text-sm">Bijoy লেআউটে পরীক্ষা</div>
          </Link>
          <Link href="/bangla-typing-test" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="font-semibold mb-1">বাংলা টাইপিং টেস্ট</div>
            <div className="text-slate-400 text-sm">সাধারণ টাইপিং টেস্ট</div>
          </Link>
          <Link href="/bangla-typing-practice" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="font-semibold mb-1">টাইপিং প্র্যাকটিস</div>
            <div className="text-slate-400 text-sm">ধাপে ধাপে শিখুন</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
