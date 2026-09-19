import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা টাইপিং টপ রো — উপরের সারির কী ও আঙুলের অবস্থান | বাংলা টাইপিং মাস্টার',
  description:
    'বাংলা টাইপিংয়ের উপরের সারি বা Top Row (Q, W, E, R, T, Y, U, I, O, P)-এর প্রতিটি অক্ষরের সঠিক আঙুলের অবস্থান, কী-ম্যাপিং ও অনুশীলনের নির্দেশিকা।',
  alternates: {
    canonical: `${siteUrl}/learn/top-row`,
  },
  openGraph: {
    title: 'বাংলা টাইপিং টপ রো (Top Row) গাইড ও অনুশীলন',
    description: 'টপ রো কী-এর আঙুলের অবস্থান ও শব্দ অনুশীলন।',
    url: `${siteUrl}/learn/top-row`,
    type: 'article',
  },
};

const topRowKeys = [
  { key: 'Q', bijoy: 'ঙ (Shift: ঁ)', finger: 'বাম কনিষ্ঠা (Left Pinky)', avro: 'q' },
  { key: 'W', bijoy: 'য (Shift: ্য)', finger: 'বাম অনামিকা (Left Ring)', avro: 'w' },
  { key: 'E', bijoy: 'ড (Shift: ঢ)', finger: 'বাম মধ্যমা (Left Middle)', avro: 'e' },
  { key: 'R', bijoy: 'প (Shift: ফ)', finger: 'বাম তর্জনী (Left Index)', avro: 'r' },
  { key: 'T', bijoy: 'ট (Shift: ঠ)', finger: 'বাম তর্জনী (Left Index)', avro: 't' },
  { key: 'Y', bijoy: 'চ (Shift: ছ)', finger: 'ডান তর্জনী (Right Index)', avro: 'y' },
  { key: 'U', bijoy: 'জ (Shift: ঝ)', finger: 'ডান তর্জনী (Right Index)', avro: 'u' },
  { key: 'I', bijoy: 'হ (Shift: ঞ)', finger: 'ডান মধ্যমা (Right Middle)', avro: 'i' },
  { key: 'O', bijoy: 'গ (Shift: ঘ)', finger: 'ডান অনামিকা (Right Ring)', avro: 'o' },
  { key: 'P', bijoy: 'ড় (Shift: ঢ়)', finger: 'ডান কনিষ্ঠা (Right Pinky)', avro: 'p' },
];

export default function TopRowLearnPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'শিখুন', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'টপ রো টাইপিং', item: `${siteUrl}/learn/top-row` },
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
            <span className="text-foreground font-medium">টপ রো (Top Row)</span>
          </div>
        </div>

        {/* Hero */}
        <header className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 font-headline">
            বাংলা টাইপিং টপ রো — উপরের সারির কী ও আঙুলের সঠিক নিয়ম
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            হোম রো আয়ত্ত করার পর উপরের সারি বা টপ রো (Top Row) অনুশীলন করা হয়। আঙুলগুলোকে হোম রো থেকে উপরের দিকে তুলে আবার ফিরিয়ে আনার কৌশল শিখুন।
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/lessons"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              টপ রো লেসন শুরু করুন
            </Link>
            <Link
              href="/learn/home-row"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-border bg-card font-semibold hover:border-primary transition-colors"
            >
              ← হোম রো গাইড দেখুন
            </Link>
          </div>
        </header>

        {/* Top Row Table */}
        <section className="container mx-auto px-4 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 font-headline text-center">
            টপ রো কী ও আঙুলের ম্যাপিং (Q থেকে P)
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
                {topRowKeys.map((item) => (
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

        {/* Typing Strategy */}
        <section className="container mx-auto px-4 py-10 max-w-3xl border-t">
          <h2 className="text-2xl font-bold mb-4 font-headline">টপ রো অনুশীলনের মূল কৌশল</h2>
          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              <strong>১. অ্যাঙ্কর পজিশন বজায় রাখুন:</strong> টপ রো-এর কোনো কী চাপার সময় আপনার হাতের তালু কীবোর্ড থেকে বেশি ওপরে তুলবেন না। শুধু প্রয়োজনীয় আঙুলটি বাড়িয়ে কী চাপুন এবং সঙ্গে সঙ্গে আঙুলটিকে তার মূল হোম রো অবস্থানে ফিরিয়ে আনুন।
            </p>
            <p>
              <strong>২. তর্জনীর দ্বৈত কাজ:</strong> লক্ষ্য করুন, বাম তর্জনী R ও T এবং ডান তর্জনী Y ও U চাপার দায়িত্ব পালন করে। এই কীগুলোতে যাওয়ার সময় কবজি বেশি না নাড়িয়ে আঙুলের প্রসারণে মনোযোগ দিন।
            </p>
            <p>
              <strong>৩. শিফট কী-এর সঠিক ব্যবহার:</strong> টপ রো-এর অনেক যুক্ত ও মহাপ্রাণ বর্ণ (যেমন: ঠ, ঢ, ফ, ঝ) শিফট চেপে লিখতে হয়। বাম হাতের অক্ষরের জন্য ডান হাতের কনিষ্ঠা দিয়ে শিফট এবং ডান হাতের অক্ষরের জন্য বাম কনিষ্ঠা দিয়ে শিফট চাপুন।
            </p>
          </div>
        </section>

        {/* Prev / Next Links */}
        <section className="container mx-auto px-4 py-10 max-w-3xl border-t flex items-center justify-between text-sm font-semibold">
          <Link href="/learn/home-row" className="text-primary hover:underline">
            ← পূর্ববর্তী: হোম রো গাইড
          </Link>
          <Link href="/learn/bottom-row" className="text-primary hover:underline">
            পরবর্তী: বটম রো গাইড →
          </Link>
        </section>
      </div>
    </>
  );
}
