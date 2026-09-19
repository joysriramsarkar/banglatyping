import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা বাক্য ও অনুচ্ছেদ টাইপিং — সাবলীল গতি ও রিদম অর্জন | বাংলা টাইপিং মাস্টার',
  description:
    'পৃথক শব্দের পর পূর্ণাঙ্গ বাংলা বাক্য ও অনুচ্ছেদ টাইপিংয়ের ছন্দ, স্পেসবারের সঠিক ব্যবহার, বিরামচিহ্নের সময়জ্ঞান ও উচ্চগতি অর্জনের নির্দেশিকা।',
  alternates: {
    canonical: `${siteUrl}/learn/sentences`,
  },
  openGraph: {
    title: 'বাংলা বাক্য ও অনুচ্ছেদ টাইপিং গাইড',
    description: 'বাংলা বাক্যের সাবলীল টাইপিং রিদম ও অনুচ্ছেদ ড্রিলস।',
    url: `${siteUrl}/learn/sentences`,
    type: 'article',
  },
};

const sampleSentences = [
  {
    level: 'শিক্ষানবিস (Beginner)',
    text: 'আমাদের দেশ বাংলাদেশ। আমরা বাংলাকে খুব ভালোবাসি। প্রতিদিন সকালে নিয়মিত টাইপিং অনুশীলন করা ভালো।',
    focus: 'সহজ শব্দ, দাঁড়ি ও স্পেসবারের সাবলীল সমন্বয়।',
  },
  {
    level: 'মধ্যবর্তী (Intermediate)',
    text: 'তথ্যপ্রযুক্তির এই আধুনিক যুগে বাংলা টাইপিং জানা প্রতিটি ছাত্র-ছাত্রী ও পেশাজীবীর জন্য অপরিহার্য একটি দক্ষতা।',
    focus: 'যুক্তাক্ষর (যুগ, ছাত্র, পেশা), এ-কার ও দীর্ঘ বাক্য প্রবাহ।',
  },
  {
    level: 'উন্নত ও নিয়োগ পরীক্ষা (Advanced)',
    text: 'ডিজিটাল প্রশাসন বিনির্মাণে এবং দাপ্তরিক নথিপত্র নির্ভুলভাবে সংরক্ষণে সাঁটমুদ্রাক্ষরিকদের দ্রুত ও মানসম্মত টাইপিং দক্ষতা রাষ্ট্র পরিচালনায় গতি সঞ্চার করে।',
    focus: 'জটিল যুক্তবর্ণ (ক্ষ, ষ্ণ, ণ্ট), দীর্ঘ সমাসবদ্ধ শব্দ ও কমা-দাঁড়ির সঠিক বিরতি।',
  },
];

export default function SentencesLearnPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'শিখুন', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'বাংলা বাক্য টাইপিং', item: `${siteUrl}/learn/sentences` },
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
            <span className="text-foreground font-medium">বাক্য টাইপিং</span>
          </div>
        </div>

        {/* Hero */}
        <header className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 font-headline">
            বাংলা বাক্য ও অনুচ্ছেদ টাইপিং — রিদম ও উচ্চগতি
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            পৃথক শব্দ লেখার চেয়ে পূর্ণাঙ্গ বাক্য টাইপ করা ভিন্ন মানসিক একাগ্রতা দাবি করে। কীভাবে শব্দের মাঝের স্পেসবার দ্রুত চাপবেন এবং টাইপিং রিদম বজায় রাখবেন তা শিখুন।
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/bangla-typing-practice"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              বাক্য অনুশীলন শুরু করুন
            </Link>
            <Link
              href="/dashboard/test"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-border bg-card font-semibold hover:border-primary transition-colors"
            >
              টাইপিং টেস্ট দিন
            </Link>
          </div>
        </header>

        {/* Sentence Drills */}
        <section className="container mx-auto px-4 py-10 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 font-headline text-center">
            বিভিন্ন পর্যায়ের আদর্শ বাক্য নমুনা
          </h2>

          <div className="space-y-4">
            {sampleSentences.map((s) => (
              <div key={s.level} className="p-6 rounded-xl border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {s.level}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.focus}</span>
                </div>
                <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed pt-2">
                  &ldquo;{s.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Rhythm Tips */}
        <section className="container mx-auto px-4 py-10 max-w-3xl border-t">
          <h2 className="text-2xl font-bold mb-4 font-headline">সাবলীল বাক্য টাইপিংয়ের ৩টি নিয়ম</h2>
          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              <strong>১. এক বৃদ্ধাঙ্গুল স্পেসবারে নির্ধারিত রাখুন:</strong> অধিকাংশ পেশাদার টাইপিস্ট তাদের ডান হাতের বুড়ো আঙুল দিয়ে স্পেসবার চাপেন। প্রতিটি শব্দ শেষ করার সাথে সাথেই রিদমের সাথে স্পেসবার চাপার মেমোরি তৈরি করুন।
            </p>
            <p>
              <strong>২. পরবর্তী শব্দের দিকে নজর রাখুন:</strong> আপনি যে শব্দটি টাইপ করছেন তার চেয়ে ২-৩টি শব্দ সামনে নজর রাখুন। এতে মস্তিষ্ক আগে থেকেই আঙুলকে নির্দেশনা পাঠাতে পারে এবং শব্দের মাঝে কোনো অনাকাঙ্ক্ষিত বিরতি পড়ে না।
            </p>
            <p>
              <strong>৩. ব্যাকস্পেসের অভ্যাস কমান:</strong> বাক্য টাইপ করার সময় কোনো ছোটখাটো ভুল হলে বারবার ব্যাকস্পেস চেপে থামবেন না। ব্যাকস্পেস টাইপিংয়ের স্বাভাবিক প্রবাহ ও গতি মারাত্মকভাবে কমিয়ে দেয়।
            </p>
          </div>
        </section>

        {/* Prev / Next Links */}
        <section className="container mx-auto px-4 py-10 max-w-3xl border-t flex items-center justify-between text-sm font-semibold">
          <Link href="/learn/words" className="text-primary hover:underline">
            ← পূর্ববর্তী: শব্দ প্র্যাকটিস
          </Link>
          <Link href="/bangla-typing-for-jobs" className="text-primary hover:underline">
            চাকরির পরীক্ষার টাইপিং প্রস্তুতি →
          </Link>
        </section>
      </div>
    </>
  );
}
