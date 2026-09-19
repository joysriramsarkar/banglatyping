import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা সংখ্যা টাইপিং — ১ থেকে ০ সংখ্যা ও গাণিতিক চিহ্ন | বাংলা টাইপিং মাস্টার',
  description:
    'বাংলা সংখ্যা (১, ২, ৩, ৪, ৫, ৬, ৭, ৮, ৯, ০) এবং গাণিতিক চিহ্নের সঠিক কীবোর্ড নিয়ম, আঙুলের অবস্থান ও সরকারি পরীক্ষার সংখ্যা টাইপিং প্রস্তুতি।',
  alternates: {
    canonical: `${siteUrl}/learn/numbers`,
  },
  openGraph: {
    title: 'বাংলা সংখ্যা টাইপিং গাইড ও ড্রিলস',
    description: 'বাংলা সংখ্যা ১-০ টাইপিং ও গাণিতিক চিহ্নের নিয়মাবলী।',
    url: `${siteUrl}/learn/numbers`,
    type: 'article',
  },
};

const numberKeys = [
  { key: '1', bn: '১', finger: 'বাম কনিষ্ঠা (Left Pinky)', name: 'এক' },
  { key: '2', bn: '২', finger: 'বাম অনামিকা (Left Ring)', name: 'দুই' },
  { key: '3', bn: '৩', finger: 'বাম মধ্যমা (Left Middle)', name: 'তিন' },
  { key: '4', bn: '৪', finger: 'বাম তর্জনী (Left Index)', name: 'চার' },
  { key: '5', bn: '৫', finger: 'বাম তর্জনী (Left Index)', name: 'পাঁচ' },
  { key: '6', bn: '৬', finger: 'ডান তর্জনী (Right Index)', name: 'ছয়' },
  { key: '7', bn: '৭', finger: 'ডান তর্জনী (Right Index)', name: 'সাত' },
  { key: '8', bn: '৮', finger: 'ডান মধ্যমা (Right Middle)', name: 'আট' },
  { key: '9', bn: '৯', finger: 'ডান অনামিকা (Right Ring)', name: 'নয়' },
  { key: '0', bn: '০', finger: 'ডান কনিষ্ঠা (Right Pinky)', name: 'শূন্য' },
];

export default function NumbersLearnPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'শিখুন', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'বাংলা সংখ্যা টাইপিং', item: `${siteUrl}/learn/numbers` },
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
            <span className="text-foreground font-medium">সংখ্যা টাইপিং</span>
          </div>
        </div>

        {/* Hero */}
        <header className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 font-headline">
            বাংলা সংখ্যা টাইপিং — ১ থেকে ০ ও গাণিতিক চিহ্ন
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            সরকারি ও ব্যাংকিং পরীক্ষার টাইপিং টেস্টে প্রচুর সন-তারিখ, টাকা-পয়সার হিসাব ও পরিসংখ্যান টাইপ করতে হয়। বাংলা সংখ্যার দ্রুত ও নির্ভুল টাইপিং নিয়ম জেনে নিন।
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/lessons"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              সংখ্যা টাইপিং লেসন অনুশীলন করুন
            </Link>
            <Link
              href="/learn/punctuation"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-border bg-card font-semibold hover:border-primary transition-colors"
            >
              বিরামচিহ্ন গাইড দেখুন
            </Link>
          </div>
        </header>

        {/* Numbers Table */}
        <section className="container mx-auto px-4 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 font-headline text-center">
            বাংলা সংখ্যা ও আঙুলের ম্যাপিং
          </h2>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-foreground font-bold border-b text-xs">
                <tr>
                  <th className="p-3.5">কী (Key)</th>
                  <th className="p-3.5">বাংলা সংখ্যা</th>
                  <th className="p-3.5">উচ্চারণ</th>
                  <th className="p-3.5">নির্ধারিত আঙুল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {numberKeys.map((item) => (
                  <tr key={item.key} className="hover:bg-muted/20">
                    <td className="p-3.5 font-bold font-mono text-primary text-base">{item.key}</td>
                    <td className="p-3.5 font-extrabold text-lg text-foreground">{item.bn}</td>
                    <td className="p-3.5 text-muted-foreground">{item.name}</td>
                    <td className="p-3.5 text-xs sm:text-sm">{item.finger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Practical Drills */}
        <section className="container mx-auto px-4 py-10 max-w-3xl border-t">
          <h2 className="text-2xl font-bold mb-4 font-headline">বাস্তব সংখ্যা টাইপিং ড্রিল</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-card/60">
              <h3 className="font-bold text-sm text-primary mb-1">১. সন ও গুরুত্বপূর্ণ তারিখ:</h3>
              <p className="font-mono text-base text-foreground">১৯৫২, ১৯৭১, ১৯৭৫, ২০২৪, ২০২৬</p>
            </div>
            <div className="p-4 rounded-lg border bg-card/60">
              <h3 className="font-bold text-sm text-primary mb-1">২. ফোন ও মোবাইল নম্বর:</h3>
              <p className="font-mono text-base text-foreground">০১৭১১-০০০০০০, ০১৯৭২-১২৩৪৫৬</p>
            </div>
            <div className="p-4 rounded-lg border bg-card/60">
              <h3 className="font-bold text-sm text-primary mb-1">৩. আর্থিক হিসাব ও শতাংশ:</h3>
              <p className="font-mono text-base text-foreground">২৫,০০০ টাকা, ৯৫% নির্ভুলতা, ৫.৫ শতাংশ লাভ</p>
            </div>
          </div>
        </section>

        {/* Prev / Next Links */}
        <section className="container mx-auto px-4 py-10 max-w-3xl border-t flex items-center justify-between text-sm font-semibold">
          <Link href="/learn/juktakkhor" className="text-primary hover:underline">
            ← পূর্ববর্তী: যুক্তাক্ষর গাইড
          </Link>
          <Link href="/learn/punctuation" className="text-primary hover:underline">
            পরবর্তী: বিরামচিহ্ন গাইড →
          </Link>
        </section>
      </div>
    </>
  );
}
