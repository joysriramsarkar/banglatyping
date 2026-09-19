import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা টাইপিং বটম রো — নিচের সারির কী ও আঙুলের অবস্থান | বাংলা টাইপিং মাস্টার',
  description:
    'বাংলা টাইপিংয়ের নিচের সারি বা Bottom Row (Z, X, C, V, B, N, M)-এর প্রতিটি অক্ষরের সঠিক আঙুলের অবস্থান, কী-ম্যাপিং ও অনুশীলনের বিস্তারিত নির্দেশিকা।',
  alternates: {
    canonical: `${siteUrl}/learn/bottom-row`,
  },
  openGraph: {
    title: 'বাংলা টাইপিং বটম রো (Bottom Row) গাইড ও অনুশীলন',
    description: 'বটম রো কী-এর আঙুলের অবস্থান ও শব্দ অনুশীলন।',
    url: `${siteUrl}/learn/bottom-row`,
    type: 'article',
  },
};

const bottomRowKeys = [
  { key: 'Z', bijoy: '্য (Shift: ্র)', finger: 'বাম কনিষ্ঠা (Left Pinky)', avro: 'z' },
  { key: 'X', bijoy: 'ও (Shift: ৌ)', finger: 'বাম অনামিকা (Left Ring)', avro: 'x / o' },
  { key: 'C', bijoy: 'ে (Shift: ৈ)', finger: 'বাম মধ্যমা (Left Middle)', avro: 'e / oi' },
  { key: 'V', bijoy: 'র (Shift: ল)', finger: 'বাম তর্জনী (Left Index)', avro: 'r' },
  { key: 'B', bijoy: 'ন (Shift: ণ)', finger: 'বাম তর্জনী (Left Index)', avro: 'n / N' },
  { key: 'N', bijoy: 'স (Shift: ষ)', finger: 'ডান তর্জনী (Right Index)', avro: 's / Sh' },
  { key: 'M', bijoy: 'শ (Shift: ঢ়)', finger: 'ডান তর্জনী (Right Index)', avro: 'S' },
  { key: '<', bijoy: ', (কমা)', finger: 'ডান মধ্যমা (Right Middle)', avro: ',' },
  { key: '>', bijoy: '। (দাঁড়ি)', finger: 'ডান অনামিকা (Right Ring)', avro: '.' },
];

export default function BottomRowLearnPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'শিখুন', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'বটম রো টাইপিং', item: `${siteUrl}/learn/bottom-row` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/20">
          <div className="container mx-auto px-4 py-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
            <span>/</span>
            <Link href="/learn" className="hover:text-primary transition-colors">শিখুন</Link>
            <span>/</span>
            <span className="text-foreground font-medium">বটম রো (Bottom Row)</span>
          </div>
        </div>

        {/* Hero */}
        <header className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 font-headline">
            বাংলা টাইপিং বটম রো — নিচের সারির কী ও আঙুলের সঠিক নিয়ম
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            নিচের সারি বা বটম রো টাইপ করা অধিকাংশ নতুনদের জন্য সবচেয়ে চ্যালেঞ্জিং। হাতের পেশিকে সঠিকভাবে নিচু করে আঙুল দিয়ে নিখুঁত স্পর্শ টাইপিং রপ্ত করুন।
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/lessons"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              বটম রো লেসন শুরু করুন
            </Link>
            <Link
              href="/learn/top-row"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-border bg-card font-semibold hover:border-primary transition-colors"
            >
              ← টপ রো গাইড দেখুন
            </Link>
          </div>
        </header>

        {/* Bottom Row Table */}
        <section className="container mx-auto px-4 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 font-headline text-center">
            বটম রো কী ও আঙুলের ম্যাপিং (Z থেকে M ও বিরামচিহ্ন)
          </h2>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-foreground font-bold border-b text-xs">
                <tr>
                  <th className="p-3.5">কী (Key)</th>
                  <th className="p-3.5">নির্ধারিত আঙুল</th>
                  <th className="p-3.5">বিজয় অক্ষর</th>
                  <th className="p-3.5">অভ্র নিয়ম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bottomRowKeys.map((item) => (
                  <tr key={item.key} className="hover:bg-muted/20">
                    <td className="p-3.5 font-bold font-mono text-primary text-base">{item.key}</td>
                    <td className="p-3.5">{item.finger}</td>
                    <td className="p-3.5 font-bold text-foreground">{item.bijoy}</td>
                    <td className="p-3.5 text-xs text-muted-foreground font-mono">{item.avro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom Row Strategy */}
        <section className="container mx-auto px-4 py-10 max-w-3xl border-t">
          <h2 className="text-2xl font-bold mb-4 font-headline">বটম রো সহজ করার কৌশল</h2>
          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              <strong>১. আঙুল বাঁকানো শিখুন:</strong> বটম রো চাপতে হলে আঙুল সোজা না রেখে সামান্য ভেতরের দিকে কুঁকড়ে নিতে হয়। হাতের তালু নিচের দিকে নামিয়ে আঙুলকে বাঁকিয়ে স্পর্শ করুন।
            </p>
            <p>
              <strong>২. কার-চিহ্নের অবস্থান:</strong> বিজয় কীবোর্ডে বহুল ব্যবহৃত এ-কার (ে) এবং ঐ-কার (ৈ) বটম রো-এর C কী-তে অবস্থিত। এই কী চাপার পর আঙুলটি সঙ্গে সঙ্গে হোম রো D কী-তে ফিরিয়ে আনার অভ্যাস করুন।
            </p>
            <p>
              <strong>৩. র ও ল-এর সঠিক নিয়ন্ত্রণ:</strong> বিজয় লেআউটে বাম তর্জনী দিয়ে V কী-তে র এবং শিফট+V দিয়ে ল টাইপ করা হয়। এই দুটো অক্ষর বাংলা ভাষায় প্রচুর ব্যবহৃত হয়, তাই এগুলোর প্রতি বিশেষ নজর দিন।
            </p>
          </div>
        </section>

        {/* Prev / Next Links */}
        <section className="container mx-auto px-4 py-10 max-w-3xl border-t flex items-center justify-between text-sm font-semibold">
          <Link href="/learn/top-row" className="text-primary hover:underline">
            ← পূর্ববর্তী: টপ রো গাইড
          </Link>
          <Link href="/learn/kar" className="text-primary hover:underline">
            পরবর্তী: কার-চিহ্ন টাইপিং →
          </Link>
        </section>
      </div>
    </>
  );
}
