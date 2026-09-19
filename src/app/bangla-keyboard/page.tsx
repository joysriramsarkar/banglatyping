import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://typing.onuron.org';

export const metadata: Metadata = {
  title: 'বাংলা কীবোর্ড — অভ্র, বিজয় ও বাংলা টাইপিং লেআউট পরিচিতি | বাংলা টাইপিং মাস্টার',
  description:
    'অভ্র (Avro Phonetic), বিজয় (Bijoy Classic/Bayanno), ও অন্যান্য বাংলা কীবোর্ড লেআউটের নিয়ম, কী-ম্যাপিং এবং ডাউনলোড ও ব্যবহারের পূর্ণাঙ্গ নির্দেশিকা।',
  alternates: {
    canonical: `${siteUrl}/bangla-keyboard`,
  },
  openGraph: {
    title: 'বাংলা কীবোর্ড — অভ্র, বিজয় ও বাংলা টাইপিং লেআউট পরিচিতি',
    description:
      'অভ্র, বিজয় ও বাংলা কীবোর্ডের সঠিক নিয়ম, আঙুলের অবস্থান ও লাইভ ভার্চুয়াল কীবোর্ড অনুশীলন।',
    url: `${siteUrl}/bangla-keyboard`,
    type: 'website',
  },
};

const keyboardLayouts = [
  {
    name: 'Avro Phonetic (অভ্র ফোনেটিক)',
    developer: 'মেহদী হাসান খান ও ওমিক্রনল্যাব',
    type: 'ধ্বনিভিত্তিক (Phonetic Transliteration)',
    pros: 'সহজ ও স্বজ্ঞাত, নতুনদের জন্য আদর্শ, কোনো কীবোর্ড মুখস্থ করতে হয় না',
    cons: 'সরকারি দপ্তর ও মুদ্রণশিল্পে কম ব্যবহৃত',
    popularFor: 'সোশ্যাল মিডিয়া, ব্যক্তিগত ব্লগিং, মেসেজিং ও দৈনন্দিন কাজ',
    example: 'ami = আমি, bangladesh = বাংলাদেশ, kshama = ক্ষমা',
  },
  {
    name: 'Bijoy Classic / Bayanno (বিজয়)',
    developer: 'মোস্তফা জব্বার ও আনন্দ কম্পিউটার্স',
    type: 'গ্রাফিক্যাল ফিক্সড লেআউট (Fixed Mapping)',
    pros: 'অফিসিয়াল ও মুদ্রণশিল্পের মানদণ্ড, অতি দ্রুত টাইপ করা সম্ভব',
    cons: 'প্রতিটি কী মুখস্থ করতে হয়, যুক্তাক্ষরের জন্য হসন্ত নিয়ম বাধ্যতামূলক',
    popularFor: 'সরকারি ও আধা-সরকারি দপ্তর, প্রেস, প্রকাশনা ও আদালত',
    example: 'd (ি), k (া), j (ক), g (হসন্ত) → j + g + j = ক্ক',
  },
  {
    name: 'BanglaWord (বাংলাওয়ার্ড)',
    developer: 'বাংলাওয়ার্ড টিম',
    type: 'স্মার্ট ফিক্সড ও কার কম্বিনেশন',
    pros: 'স্বজ্ঞাত স্বরচিহ্ন এবং ফন্টের সাথে সরাসরি কমপ্যাটিবিলিটি',
    cons: 'ইউনিকোড যুগে সীমিত ব্যবহার',
    popularFor: 'পুরনো অফিসিয়াল ডকুমেন্ট সংরক্ষণ ও প্রফেশনাল টাইপিং',
    example: 'সরাসরি কার চিহ্নের সহায়তায় উচ্চগতির ড্রিল',
  },
  {
    name: 'Jatiya (জাতীয় কীবোর্ড)',
    developer: 'বাংলাদেশ কম্পিউটার কাউন্সিল (BCC)',
    type: 'জাতীয় মানক লেআউট (BDS 1738)',
    pros: 'বাংলাদেশ সরকারের আনুষ্ঠানিক জাতীয় স্ট্যান্ডার্ড',
    cons: 'বিজয় বা অভ্রর মতো ব্যাপক সার্বজনীন ব্যবহারকারী নেই',
    popularFor: 'প্রমিত সরকারি ডিজিটাল রেকর্ড ও নথি',
    example: 'প্রমিত ধ্বনিতাত্ত্বিক বিন্যাস',
  },
];

export default function BanglaKeyboardPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'হোম', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'বাংলা কীবোর্ড', item: `${siteUrl}/bangla-keyboard` },
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
            <span className="text-foreground font-medium">বাংলা কীবোর্ড লেআউট</span>
          </div>
        </div>

        {/* Hero */}
        <header className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 font-headline">
            বাংলা কীবোর্ড — অভ্র, বিজয় ও জনপ্রিয় লেআউট পরিচিতি
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            কম্পিউটারে বাংলা লেখার জন্য সঠিক কীবোর্ড নির্বাচন ও তার নিয়ম জানা টাইপিং শেখার প্রথম ধাপ। এখানে অভ্র, বিজয় ও অন্যান্য লেআউটের তুলনা ও নিয়মাবলি জানুন।
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/layouts"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              লাইভ ভার্চুয়াল কীবোর্ড দেখুন
            </Link>
            <Link
              href="/bangla-typing-practice"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-border bg-card font-semibold hover:border-primary transition-colors"
            >
              টাইপিং অনুশীলন শুরু করুন
            </Link>
          </div>
        </header>

        {/* Comparison Section */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 font-headline text-center">
            প্রধান বাংলা কীবোর্ডগুলোর তুলনামূলক বিশ্লেষণ
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {keyboardLayouts.map((kb) => (
              <div key={kb.name} className="p-6 rounded-xl border bg-card/60 shadow-xs space-y-3">
                <div className="border-b pb-3">
                  <h3 className="text-xl font-bold text-primary">{kb.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">উদ্ভাবক: {kb.developer}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>ধরণ:</strong> <span className="text-muted-foreground">{kb.type}</span></p>
                  <p><strong>সুবিধা:</strong> <span className="text-muted-foreground">{kb.pros}</span></p>
                  <p><strong>সীমাবদ্ধতা:</strong> <span className="text-muted-foreground">{kb.cons}</span></p>
                  <p><strong>ব্যবহার ক্ষেত্র:</strong> <span className="text-muted-foreground">{kb.popularFor}</span></p>
                  <div className="mt-3 p-3 rounded-md bg-muted/40 text-xs font-mono">
                    <span className="font-bold text-foreground">উদাহরণ: </span>
                    <span className="text-primary">{kb.example}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Which keyboard to choose? */}
        <section className="container mx-auto px-4 py-12 max-w-4xl border-t">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 font-headline">
            আপনার জন্য কোন বাংলা কীবোর্ড সবচেয়ে উপযোগী?
          </h2>
          <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            <div className="p-5 rounded-lg border bg-card">
              <h3 className="text-base font-bold text-foreground mb-1">১. আপনি যদি নতুন শিক্ষার্থী হন:</h3>
              <p>
                <strong>অভ্র ফোনেটিক (Avro)</strong> দিয়ে শুরু করা সবচেয়ে সহজ। কারণ এটিতে বাড়তি কোনো কি মুখস্থ করতে হয় না; আপনি যেভাবে মুখে বলেন সেভাবেই ইংরেজি অক্ষরে টাইপ করলেই বাংলায় রূপান্তর হয়।
              </p>
            </div>
            <div className="p-5 rounded-lg border bg-card">
              <h3 className="text-base font-bold text-foreground mb-1">২. আপনি যদি সরকারি চাকরি বা মুদ্রণশিল্পে কাজ করতে চান:</h3>
              <p>
                <strong>বিজয় ক্লাসিক (Bijoy Classic/Bayanno)</strong> শেখা অপরিহার্য। বাংলাদেশের মন্ত্রণালয়, অধিদপ্তর ও সংবাদপত্রের টাইপিং পরীক্ষায় বিজয় লেআউটই মানদণ্ড হিসেবে যাচাই করা হয়।
              </p>
            </div>
            <div className="p-5 rounded-lg border bg-card">
              <h3 className="text-base font-bold text-foreground mb-1">৩. আপনি যদি দ্রুত স্পর্শ টাইপিং (Touch Typing) শিখতে চান:</h3>
              <p>
                আমাদের প্ল্যাটফর্মের <Link href="/learn/home-row" className="text-primary underline">হোম রো পাঠক্রম</Link> অনুসরণ করুন। প্রতিটি আঙুলের জন্য নির্ধারিত কী অনুশীলনের মাধ্যমে আপনি না দেখেই ৩০+ WPM গতি অর্জন করতে পারবেন।
              </p>
            </div>
          </div>
        </section>

        {/* Quick Nav Links */}
        <section className="container mx-auto px-4 py-12 max-w-4xl border-t text-center">
          <h2 className="text-xl font-bold mb-6">গুরুত্বপূর্ণ টাইপিং রিসোর্স</h2>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/avro-typing-test" className="px-4 py-2 rounded-lg border hover:border-primary hover:text-primary transition-colors">
              অভ্র টাইপিং টেস্ট
            </Link>
            <Link href="/bijoy-typing-test" className="px-4 py-2 rounded-lg border hover:border-primary hover:text-primary transition-colors">
              বিজয় টাইপিং টেস্ট
            </Link>
            <Link href="/learn/kar" className="px-4 py-2 rounded-lg border hover:border-primary hover:text-primary transition-colors">
              কার-চিহ্ন টাইপিং
            </Link>
            <Link href="/learn/juktakkhor" className="px-4 py-2 rounded-lg border hover:border-primary hover:text-primary transition-colors">
              যুক্তাক্ষর টাইপিং
            </Link>
            <Link href="/bangla-typing-for-jobs" className="px-4 py-2 rounded-lg border hover:border-primary hover:text-primary transition-colors">
              চাকরির পরীক্ষা প্রস্তুতি
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
