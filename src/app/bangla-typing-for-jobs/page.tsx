import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'চাকরির পরীক্ষার বাংলা টাইপিং অনুশীলন — সরকারি ও বেসরকারি নিয়োগ প্রস্তুতি | বাংলা টাইপিং মাস্টার',
  description:
    'সরকারি ও বেসরকারি নিয়োগ পরীক্ষার জন্য বাংলা টাইপিং প্র্যাকটিস। সাঁটমুদ্রাক্ষরিক, কম্পিউটার অপারেটর ও অফিস সহকারী পদের জন্য ২৫-৩০ WPM স্পিড ও ৯৫% নির্ভুলতা অর্জনের নির্দেশিকা।',
  alternates: {
    canonical: `${siteUrl}/bangla-typing-for-jobs`,
  },
  openGraph: {
    title: 'চাকরির পরীক্ষার বাংলা টাইপিং অনুশীলন ও প্রস্তুতি',
    description:
      'সরকারি নিয়োগ পরীক্ষার বাস্তব উপযোগী ৫ মিনিটের টাইপিং টেস্ট, ব্যাকস্পেস নিয়ন্ত্রণ ও ভেরিফায়েড সার্টিফিকেট।',
    url: `${siteUrl}/bangla-typing-for-jobs`,
    type: 'website',
  },
};

const jobRequirements = [
  {
    post: 'কম্পিউটার অপারেটর / ডাটা এন্ট্রি অপারেটর',
    ministry: 'বিভিন্ন মন্ত্রণালয়, অধিদপ্তর ও স্বায়ত্তশাসিত প্রতিষ্ঠান',
    speedBn: '২৫ WPM (শব্দ প্রতি মিনিটে)',
    speedEn: '৩০ WPM (শব্দ প্রতি মিনিটে)',
    accuracy: '৯৫%',
    layout: 'বিজয় ক্লাসিক (Bijoy Classic/Bayanno) বা প্রমিত ইউনিকোড',
    duration: '৫ মিনিট স্ট্যান্ডার্ড টেস্ট',
  },
  {
    post: 'সাঁটমুদ্রাক্ষরিক-কাম-কম্পিউটার অপারেটর (Steno-typist)',
    ministry: 'মন্ত্রণালয়, বিভাগ ও বিচার বিভাগীয় আদালত',
    speedBn: '২৫ WPM',
    speedEn: '৩০ WPM',
    accuracy: '৯৫%',
    layout: 'বিজয় ক্লাসিক',
    duration: '৫ মিনিট টাইপিং + সাঁটলিপি পরীক্ষা',
  },
  {
    post: 'অফিস সহকারী-কাম-কম্পিউটার মুদ্রাক্ষরিক (LDA/OA)',
    ministry: 'জেলা প্রশাসকের কার্যালয়, পুলিশ বিভাগ ও অন্যান্য সংস্থা',
    speedBn: '২০ WPM',
    speedEn: '২০ WPM',
    accuracy: '৯৫%',
    layout: 'বিজয় কীবোর্ড',
    duration: '৫ মিনিট স্ট্যান্ডার্ড টেস্ট',
  },
  {
    post: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান (অফিসার ক্যাশ / আইটি)',
    ministry: 'বাংলাদেশ ব্যাংক ও রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংকসমূহ',
    speedBn: '২০-২৫ WPM',
    speedEn: '২৫-৩০ WPM',
    accuracy: '৯৫%',
    layout: 'বিজয় / ইউনিকোড',
    duration: 'ব্যবহারিক পরীক্ষা',
  },
];

export default function BanglaTypingForJobsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'চাকরির পরীক্ষার টাইপিং', item: `${siteUrl}/bangla-typing-for-jobs` },
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
            <span className="text-foreground font-medium">চাকরির পরীক্ষার টাইপিং প্রস্তুতি</span>
          </div>
        </div>

        {/* Hero */}
        <header className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            সরকারি ও বেসরকারি নিয়োগ পরীক্ষার বিশেষ গাইড
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 font-headline">
            চাকরির পরীক্ষার বাংলা টাইপিং অনুশীলন ও প্রস্তুতি
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            সাঁটমুদ্রাক্ষরিক, কম্পিউটার অপারেটর ও অফিস সহকারী পদের সরকারি নিয়োগ পরীক্ষায় বাংলায় ন্যূনতম ২৫-৩০ WPM স্পিড এবং ৯৫% নির্ভুলতা আবশ্যক। আমাদের ৫ মিনিটের সিমুলেটরে আজই প্রস্তুতি নিন।
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/test"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              ৫ মিনিটের পরীক্ষা দিন (Exam Mode)
            </Link>
            <Link
              href="/bangla-typing-course"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-border bg-card font-semibold hover:border-primary transition-colors"
            >
              সম্পূর্ণ পাঠক্রম দেখুন
            </Link>
          </div>
        </header>

        {/* Requirements Table */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 font-headline text-center">
            বিভিন্ন সরকারি পদের অফিসিয়াল টাইপিং মানদণ্ড
          </h2>

          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-foreground font-bold border-b text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">পদের নাম</th>
                  <th className="p-4">বাংলা গতি (WPM)</th>
                  <th className="p-4">ইংরেজি গতি (WPM)</th>
                  <th className="p-4">নির্ভুলতা</th>
                  <th className="p-4">কীবোর্ড লেআউট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobRequirements.map((job) => (
                  <tr key={job.post} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      {job.post}
                      <span className="block text-xs text-muted-foreground font-normal mt-0.5">{job.ministry}</span>
                    </td>
                    <td className="p-4 font-bold text-primary">{job.speedBn}</td>
                    <td className="p-4">{job.speedEn}</td>
                    <td className="p-4 font-semibold text-green-600 dark:text-green-400">{job.accuracy}</td>
                    <td className="p-4 text-xs text-muted-foreground">{job.layout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic text-center">
            * দ্রষ্টব্য: গতি ও শর্তসমূহ জনপ্রশাসন মন্ত্রণালয়ের নিয়োগ বিজ্ঞপ্তি অনুযায়ী নির্ধারিত।
          </p>
        </section>

        {/* 5 Critical Rules for Job Seekers */}
        <section className="container mx-auto px-4 py-12 max-w-4xl border-t">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 font-headline">
            চাকরির টাইপিং পরীক্ষায় সফল হওয়ার ৫টি আবশ্যিক কৌশল
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-5 rounded-lg border bg-card">
              <h3 className="font-bold text-base mb-1.5 text-primary">১. নির্ভুলতাকে গতির চেয়ে বেশি গুরুত্ব দিন</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                অনেক পরীক্ষার্থী দ্রুত লিখতে গিয়ে বেশি ভুল করেন। পরীক্ষার হলে ৫টির বেশি ভুল হলে অনেক ক্ষেত্রে পুরো স্ক্রিপ্ট বাতিল হিসেবে গণ্য হতে পারে। তাই ৯৫%+ নির্ভুলতা বজায় রাখা প্রথম লক্ষ্য হওয়া উচিত।
              </p>
            </div>

            <div className="p-5 rounded-lg border bg-card">
              <h3 className="font-bold text-base mb-1.5 text-primary">২. বিজয় ক্লাসিক লেআউটে নিয়মিত অভ্যাস করুন</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                সরকারি দপ্তরগুলোতে সাধারণত বিজয় বা প্রমিত লেআউটের কীবোর্ড সরবরাহ করা হয়। অভ্র দিয়ে দৈনন্দিন কাজ চললেও চাকরির প্রস্তুতির জন্য বিজয় কি-ম্যাপিং ও হসন্তের সঠিক নিয়ম রপ্ত করা জরুরি।
              </p>
            </div>

            <div className="p-5 rounded-lg border bg-card">
              <h3 className="font-bold text-base mb-1.5 text-primary">৩. যুক্তাক্ষর ও সংখ্যা টাইপিংয়ে পারদর্শিতা</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                পরীক্ষার অনুচ্ছেদে প্রচুর যুক্তাক্ষর (যেমন: ক্ষ, জ্ঞ, ষ্ণ, ঞ্চ) এবং সন-তারিখ থাকে। আমাদের <Link href="/learn/juktakkhor" className="text-primary underline">যুক্তাক্ষর হাব</Link>-এ গিয়ে এগুলো আলাদাভাবে ড্রিল করুন।
              </p>
            </div>

            <div className="p-5 rounded-lg border bg-card">
              <h3 className="font-bold text-base mb-1.5 text-primary">৪. ৫ মিনিটের স্ট্যামিনা তৈরি করুন</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ১ মিনিটের পরীক্ষায় ৩০ WPM তোলা গেলেও ৫ মিনিট ধরে একটানা সমগতি বজায় রাখা কঠিন। তাই প্রতিদিন অন্তত ৩ থেকে ৪ বার ৫ মিনিটের পূর্ণাঙ্গ প্যাসেজ পরীক্ষা দিন।
              </p>
            </div>
          </div>
        </section>

        {/* Certificate CTA */}
        <section className="container mx-auto px-4 py-12 max-w-4xl border-t text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-headline">
              ভেরিফায়েড টাইপিং সার্টিফিকেট অর্জন করুন
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-6">
              আমাদের প্ল্যাটফর্মে পরীক্ষা দিয়ে অফিসিয়াল ভেরিফিকেশন আইডি সহ PDF সার্টিফিকেট ডাউনলোড করুন, যা আপনার জীবনবৃত্তান্তে (CV) যুক্ত করে চাকরির প্রস্তুতিতে এক ধাপ এগিয়ে থাকতে পারেন।
            </p>
            <Link
              href="/dashboard/test"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-md"
            >
              এখনই পরীক্ষা দিন
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
