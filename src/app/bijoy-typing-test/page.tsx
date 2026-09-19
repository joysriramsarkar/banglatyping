import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বিজয় টাইপিং টেস্ট — Bijoy বাংলা টাইপিং প্র্যাকটিস',
  description:
    'বিজয় কীবোর্ড লেআউটে বাংলা টাইপিং টেস্ট ও অনুশীলন করুন। সরকারি চাকরি ও অফিসের কাজের জন্য উপযুক্ত। WPM ও Accuracy পরিমাপ করুন।',
  alternates: {
    canonical: `${siteUrl}/bijoy-typing-test`,
  },
};

const bijoyHomeRow = [
  { key: 'f', bangla: 'া' },
  { key: 'd', bangla: 'ড' },
  { key: 's', bangla: 'স' },
  { key: 'a', bangla: 'অ' },
  { key: 'j', bangla: 'হ' },
  { key: 'k', bangla: 'ত' },
  { key: 'l', bangla: 'ি' },
  { key: ';', bangla: 'ন' },
];

export default function BijoyTypingTestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 text-white">
      <section className="px-4 py-16 text-center max-w-4xl mx-auto">
        <nav className="text-sm text-orange-300 mb-6">
          <Link href="/" className="hover:text-white transition-colors">হোম</Link>
          <span className="mx-2">›</span>
          <span className="text-white">বিজয় টাইপিং টেস্ট</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">বিজয় টাইপিং টেস্ট</h1>
        <p className="text-xl text-orange-200 mb-3">Bijoy লেআউটে বাংলা টাইপিং পরীক্ষা ও অনুশীলন</p>
        <p className="text-orange-300 max-w-2xl mx-auto mb-8">
          বিজয় কীবোর্ড লেআউটে আপনার বাংলা টাইপিং গতি ও নির্ভুলতা পরীক্ষা করুন। 
          সরকারি চাকরি, অফিস ও পত্রিকার কাজের জন্য সবচেয়ে ব্যবহৃত লেআউট।
        </p>
        <Link
          href="/dashboard/test"
          className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-orange-500/30 hover:scale-105"
        >
          Bijoy টাইপিং টেস্ট শুরু করুন →
        </Link>
      </section>

      {/* What is Bijoy */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-4 text-orange-200">বিজয় কীবোর্ড কী?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            বিজয় (Bijoy) হলো বাংলাদেশের প্রথম ও সবচেয়ে পুরনো বাংলা কীবোর্ড লেআউট সিস্টেম।
            Mustafizur Rahman তৈরি করেন। দীর্ঘদিন ধরে সরকারি দপ্তর, পত্রিকা অফিস ও 
            প্রকাশনা শিল্পে মানক হিসেবে ব্যবহৃত হয়ে আসছে।
          </p>
          <p className="text-slate-300 leading-relaxed">
            বিজয়ে প্রতিটি কী-তে একটি নির্দিষ্ট বাংলা অক্ষর বরাদ্দ আছে। শিখতে সময় লাগলেও
            একবার আয়ত্ত করলে অনেক দ্রুত টাইপ করা সম্ভব।
          </p>
        </div>
      </section>

      {/* Home Row */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">বিজয়ের হোম রো কী-গুলো</h2>
        <div className="flex gap-3 flex-wrap">
          {bijoyHomeRow.map((k) => (
            <div key={k.key} className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center min-w-[72px]">
              <div className="font-mono text-orange-300 text-lg font-bold mb-1 uppercase">{k.key}</div>
              <div className="text-2xl">{k.bangla}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs mt-4">* বিজয় Classic লেআউট অনুযায়ী।</p>
      </section>

      {/* When to use Bijoy */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">বিজয় কখন শিখবেন?</h2>
          <ul className="text-slate-300 space-y-3">
            {[
              'সরকারি অফিস বা দপ্তরে কাজ করতে চাইলে',
              'সংবাদমাধ্যম বা প্রকাশনা সংস্থায় কাজ করতে চাইলে',
              'পেশাদার DTP (Desktop Publishing) কাজ করতে চাইলে',
              'চাকরির পরীক্ষায় যদি Bijoy লেআউট নির্দিষ্ট করা থাকে (বিজ্ঞপ্তি দেখুন)',
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-orange-400 shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Related */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/avro-typing-test" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="font-semibold mb-1">অভ্র টাইপিং টেস্ট</div>
            <div className="text-slate-400 text-sm">Avro লেআউটে পরীক্ষা</div>
          </Link>
          <Link href="/bangla-typing-test" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="font-semibold mb-1">বাংলা টাইপিং টেস্ট</div>
            <div className="text-slate-400 text-sm">সাধারণ টাইপিং টেস্ট</div>
          </Link>
          <Link href="/learn/home-row" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors block">
            <div className="font-semibold mb-1">হোম রো শিখুন</div>
            <div className="text-slate-400 text-sm">টাইপিং-এর ভিত্তি</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
