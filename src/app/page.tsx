"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import {
  BookOpen,
  Timer,
  Trophy,
  ArrowRight,
  Keyboard,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { toBengaliNumber } from "@/lib/utils";

const features = [
  {
    icon: BookOpen,
    title: "১৩-স্তরের পূর্ণাঙ্গ পাঠক্রম",
    description: "কীবোর্ড পরিচিতি, স্বরবর্ণ, ব্যঞ্জনবর্ণ, কার, হসন্ত থেকে চূড়ান্ত নিয়োগ পরীক্ষা।",
  },
  {
    icon: AlertTriangle,
    title: "ভুল সংশোধন হাব (Adaptive)",
    description: "আপনার দুর্বল অক্ষর চিহ্নিত করে স্বয়ংক্রিয়ভাবে কাস্টম ড্রিল তৈরি করে।",
  },
  {
    icon: Timer,
    title: "মাল্টি-মোড টাইপিং টেস্ট",
    description: "সময়ভিত্তিক, অক্ষরের দৈর্ঘ্য এবং কঠোর সরকারি নিয়োগ পরীক্ষা সিমুলেশন।",
  },
  {
    icon: Trophy,
    title: "ভেরিফায়েড সার্টিফিকেট",
    description: "অফিসিয়াল সনদ আইডি (BTP-2026-XXXXXX) সহ ডাউনলোডযোগ্য সনদপত্র।",
  },
  {
    icon: Keyboard,
    title: "ভার্চুয়াল কীবোর্ড ও ফিঙ্গার গাইড",
    description: "Avro, Bijoy ও BanglaWord লেআউটের জন্য লাইভ আঙুল ও কি-হাইলাইটিং।",
  },
  {
    icon: TrendingUp,
    title: "হিটম্যাপ ও রিদম অ্যানালিটিক্স",
    description: "কীবোর্ড হিটম্যাপ এবং ৫-সেকেন্ড ভেলোসিটি রিদম গ্রাফের মাধ্যমে গতি বিশ্লেষণ।",
  },
];

const stats = [
  { value: "১৩", label: "কারিকুলাম লেভেল" },
  { value: "১০০%", label: "বাংলা গ্রাফিম ইঞ্জিন" },
  { value: "বিনামূল্যে", label: "সার্টিফিকেট ও প্র্যাকটিস" },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
              <Link href="/dashboard/lessons" className="text-muted-foreground hover:text-primary transition-colors">
                পাঠক্রম
              </Link>
              <Link href="/dashboard/test" className="text-muted-foreground hover:text-primary transition-colors">
                টাইপিং টেস্ট
              </Link>
              <Link href="/dashboard/practice/mistakes" className="text-muted-foreground hover:text-primary transition-colors">
                ভুল সংশোধন
              </Link>
              <Link href="/game" className="text-muted-foreground hover:text-primary transition-colors">
                টাইপিং গেম
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                সম্পর্কে
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
              লগইন
            </Button>
            <Button size="sm" onClick={() => router.push("/signup")} className="bg-primary text-primary-foreground font-bold">
              সাইন আপ
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold shadow-xs">
              <Sparkles className="h-4 w-4" /> সেরা অনলাইন বাংলা টাইপিং টেস্ট ও লার্নিং প্ল্যাটফর্ম
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-headline leading-tight">
              বাংলা টাইপিং মাস্টার ও স্পিড টেস্ট
              <span className="block text-primary text-2xl sm:text-4xl mt-2 font-bold">
                (Bangla Typing Test & Master Online)
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Avro (অভ্র), Bijoy (বিজয়) ও BanglaWord লেআউটে সহজে বাংলা টাইপিং শিখুন। ১ থেকে ৫ মিনিটের স্পিড টেস্ট দিন, দুর্বলতা চিহ্নিত করে গতি বাড়ান এবং সরকারি চাকরির পরীক্ষার জন্য ভেরিফায়েড সার্টিফিকেট অর্জন করুন।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground font-bold gap-2 text-base px-8 shadow-md hover:shadow-lg"
                onClick={() => router.push("/dashboard/lessons")}
              >
                <PlayCircle className="h-5 w-5" /> বিনামূল্যে টাইপিং শিখুন
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto font-semibold text-base"
                onClick={() => router.push("/dashboard/test")}
              >
                <Timer className="h-5 w-5 mr-1" /> ১ মিনিটে টাইপিং টেস্ট দিন
              </Button>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y bg-muted/30">
          <div className="container mx-auto grid grid-cols-3 divide-x px-4 py-8">
            {stats.map((s) => (
              <div key={s.label} className="px-4 text-center">
                <p className="text-2xl sm:text-4xl font-extrabold text-primary font-headline">{s.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Supported Keyboards Guide (SEO Rich) */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">
              সমর্থিত সকল জনপ্রিয় বাংলা কীবোর্ড লেআউট
            </h2>
            <p className="text-muted-foreground text-sm">
              আপনার পছন্দের কীবোর্ড সিলেক্ট করে টাইপিং অনুশীলন ও স্পিড টেস্ট শুরু করুন
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card className="border hover:border-primary/50 transition-all p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 font-bold text-lg">অ</div>
                <div>
                  <h3 className="font-bold text-base">Avro Phonetic (অভ্র)</h3>
                  <p className="text-xs text-muted-foreground">ধ্বনিভিত্তিক সহজ টাইপিং</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ইংরেজি অক্ষরে লিখলেই স্বয়ংক্রিয়ভাবে বাংলায় রূপান্তরিত হয় (যেমন: ami = আমি, bangla = বাংলা)। নতুনদের জন্য সবচেয়ে জনপ্রিয়।
              </p>
            </Card>

            <Card className="border hover:border-primary/50 transition-all p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-green-500/10 text-green-600 font-bold text-lg">ব</div>
                <div>
                  <h3 className="font-bold text-base">Bijoy Classic (বিজয়)</h3>
                  <p className="text-xs text-muted-foreground">সরকারি ও প্রাতিষ্ঠানিক স্ট্যান্ডার্ড</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                অফিস আদালত এবং মুদ্রণশিল্পের আদর্শ কীবোর্ড। হসন্ত (G) চেপে দ্রুত যুক্তাক্ষর লেখার জন্য ডিজাইন করা হয়েছে।
              </p>
            </Card>

            <Card className="border hover:border-primary/50 transition-all p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-lg">বw</div>
                <div>
                  <h3 className="font-bold text-base">BanglaWord (বাংলাওয়ার্ড)</h3>
                  <p className="text-xs text-muted-foreground">স্বজ্ঞাত স্বরচিহ্ন ও যুক্তাক্ষর</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                স্মার্ট কম্বিনেশন এবং সরাসরি কার চিহ্নের সহায়তায় উচ্চগতির পেশাদার ডকুমেন্টেশন ও টাইপিংয়ের উপযোগী।
              </p>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16 bg-muted/20 border-y">
          <div className="mb-14 text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold font-headline">
              বাংলা টাইপিং মাস্টারের আধুনিক সুবিধাসমূহ
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              বাংলা টাইপিংয়ে দ্রুত গতি, নির্ভুলতা ও স্থায়ী দক্ষতা অর্জনের আধুনিক সিস্টেম
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((f) => (
              <Card key={f.title} className="transition-all hover:border-primary/50 hover:shadow-md border bg-card">
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground font-headline">{f.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section (Structured Schema Matching) */}
        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">
              বাংলা টাইপিং সম্পর্কে সাধারণ প্রশ্নোত্তর (FAQ)
            </h2>
            <p className="text-muted-foreground text-sm">
              বাংলা টাইপিং ও স্পিড টেস্ট নিয়ে শিক্ষার্থীদের বহুল জিজ্ঞাসিত প্রশ্নসমূহ
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-5 border">
              <h3 className="font-bold text-base text-foreground mb-1.5">
                ১. অনলাইনে বিনামূল্যে বাংলা টাইপিং কীভাবে দ্রুত শেখা যায়?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                বাংলা টাইপিং মাস্টারে ১৩ স্তরের পর্যায়ক্রমিক পাঠক্রম রয়েছে। হাতের সঠিক আঙুল রাখার নিয়ম (Home Row Position) থেকে শুরু করে কার, হসন্ত এবং যুক্তাক্ষর অনুশীলনের মাধ্যমে প্রতিদিন ১৫-২০ মিনিট টাইপ করলে কয়েক সপ্তাহের মধ্যেই ৩০+ WPM গতি অর্জন সম্ভব।
              </p>
            </Card>

            <Card className="p-5 border">
              <h3 className="font-bold text-base text-foreground mb-1.5">
                ২. বাংলা টাইপিং টেস্টে WPM এবং GPM এর পার্থক্য কী?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                WPM (Words Per Minute) দ্বারা প্রতি মিনিটে গড়ে কতটি শব্দ টাইপ করা হয়েছে তা বোঝায়। অন্যদিকে GPM (Graphemes Per Minute) হলো বাংলা ভাষার প্রতিটি দৃশ্যমান অক্ষরের একক হিসাব (যেমন: &apos;ক্ষ্ম&apos; টাইপ করতে ৫টি কি চাপতে হলেও এটি ১টি গ্রাফিম)। বাংলা টাইপিংয়ে GPM সবচেয়ে নির্ভরযোগ্য মাপকাঠি।
              </p>
            </Card>

            <Card className="p-5 border">
              <h3 className="font-bold text-base text-foreground mb-1.5">
                ৩. সরকারি চাকরির টাইপিং পরীক্ষার প্রস্তুতি কীভাবে নেব?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                আমাদের প্ল্যাটফর্মে ৫ মিনিটের কঠোর সরকারি পরীক্ষা সিমুলেটর রয়েছে যা হুবহু নিয়োগ পরীক্ষার নিয়ম (যেমন: ব্যাকস্পেস নিয়ন্ত্রণ, ৯৫% সর্বনিম্ন নির্ভুলতা এবং ২৫-৩০ WPM স্পিড) অনুসরণ করে ফলাফল ও ভেরিফায়েড সনদপত্র প্রদান করে।
              </p>
            </Card>

            <Card className="p-5 border">
              <h3 className="font-bold text-base text-foreground mb-1.5">
                ৪. টাইপিং টেস্ট শেষে সার্টিফিকেট ডাউনলোড করার নিয়ম কী?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                টাইপিং টেস্ট সফলভাবে সম্পন্ন করার পর ফলাফল পৃষ্ঠায় অবিলম্বে সনদপত্র জেনারেট হয়। আপনি আপনার নাম প্রদান করে ইউনিক ভেরিফিকেশন আইডি সহ অফিসিয়াল PDF সার্টিফিকেট ডাউনলোড ও শেয়ার করতে পারবেন।
              </p>
            </Card>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-t py-16 text-center">
          <div className="container mx-auto px-4 max-w-2xl space-y-4">
            <h2 className="text-3xl font-extrabold font-headline">আজই শুরু করুন — সম্পূর্ণ বিনামূল্যে</h2>
            <p className="text-sm text-muted-foreground">
              অ্যাকাউন্ট তৈরি করে ক্লাউডে অগ্রগতি সংরক্ষণ করুন, অথবা লগইন ছাড়াই সরাসরি গেস্ট হিসেবে টাইপ করুন।
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground font-bold px-8 shadow-md"
                onClick={() => router.push("/dashboard/lessons")}
              >
                পাঠক্রম দেখুন <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo />
            <span>— বাংলা টাইপিং মাস্টার ও স্পিড টেস্ট</span>
          </div>
          <div className="flex flex-wrap gap-4 font-medium">
            <Link href="/dashboard/lessons" className="hover:text-primary transition-colors">পাঠক্রম</Link>
            <Link href="/dashboard/test" className="hover:text-primary transition-colors">টাইপিং টেস্ট</Link>
            <Link href="/dashboard/practice/mistakes" className="hover:text-primary transition-colors">ভুল সংশোধন</Link>
            <Link href="/game" className="hover:text-primary transition-colors">টাইপিং গেম</Link>
            <Link href="/about" className="hover:text-primary transition-colors">আমাদের সম্পর্কে</Link>
          </div>
          <div>
            © {toBengaliNumber(new Date().getFullYear())} সর্বস্বত্ব সংরক্ষিত।
          </div>
        </div>
      </footer>
    </div>
  );
}
