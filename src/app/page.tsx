"use client";

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
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { toBengaliNumber } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { user, loading, signOut } = useAuth();
  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "ব্যবহারকারী";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <nav aria-label="প্রধান নেভিগেশন" className="hidden md:flex items-center gap-5 text-sm font-semibold">
              <Link href="/bangla-typing-test" className="text-muted-foreground hover:text-primary transition-colors">
                টাইপিং টেস্ট
              </Link>
              <Link href="/bangla-typing-practice" className="text-muted-foreground hover:text-primary transition-colors">
                অনুশীলন
              </Link>
              <Link href="/learn" className="text-muted-foreground hover:text-primary transition-colors">
                শিখুন
              </Link>
              <Link href="/bangla-typing-course" className="text-muted-foreground hover:text-primary transition-colors">
                কোর্স
              </Link>
              <Link href="/bangla-keyboard" className="text-muted-foreground hover:text-primary transition-colors">
                কীবোর্ড
              </Link>
              <Link href="/bangla-typing-for-jobs" className="text-muted-foreground hover:text-primary transition-colors">
                চাকরির প্রস্তুতি
              </Link>
              <Link href="/game" className="text-muted-foreground hover:text-primary transition-colors">
                গেম
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-20 bg-muted/60 animate-pulse rounded-md" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors group"
                  title="প্রোফাইল দেখুন"
                >
                  <Avatar className="h-8 w-8 border border-border group-hover:border-primary transition-colors">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || "https://picsum.photos/100"}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block max-w-[120px] truncate text-xs sm:text-sm font-medium">
                    {displayName}
                  </span>
                </Link>

                <Button size="sm" asChild className="bg-primary text-primary-foreground font-bold shadow-xs">
                  <Link href="/dashboard" className="gap-1.5">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>ড্যাশবোর্ড</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs px-2 sm:px-2.5"
                  title="লগআউট"
                >
                  <LogOut className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">লগআউট</span>
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">লগইন</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary text-primary-foreground font-bold">
                  <Link href="/signup">সাইন আপ</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 sm:py-24 text-center" aria-labelledby="hero-heading">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold shadow-xs" aria-hidden="true">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> ধাপে ধাপে বাংলা টাইপিং শেখা, অনুশীলন ও স্পিড টেস্ট
            </div>

            <h1 id="hero-heading" className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-headline leading-tight">
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
                asChild
              >
                <Link href={user ? "/dashboard" : "/dashboard/lessons"}>
                  <PlayCircle className="h-5 w-5" aria-hidden="true" />
                  {user ? "অনুশীলন ড্যাশবোর্ডে যান" : "বিনামূল্যে টাইপিং শিখুন"}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto font-semibold text-base"
                asChild
              >
                <Link href="/dashboard/test">
                  <Timer className="h-5 w-5 mr-1" aria-hidden="true" /> ১ মিনিটে টাইপিং টেস্ট দিন
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y bg-muted/30" aria-label="প্ল্যাটফর্মের পরিসংখ্যান">
          <div className="container mx-auto grid grid-cols-3 divide-x px-4 py-8" role="list">
            {stats.map((s) => (
              <div key={s.label} className="px-4 text-center" role="listitem">
                <p className="text-2xl sm:text-4xl font-extrabold text-primary font-headline" aria-label={`${s.value} ${s.label}`}>{s.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1" aria-hidden="true">{s.label}</p>
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
                    <f.icon className="h-6 w-6" aria-hidden="true" />
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

        {/* 10 Steps Educational Guide (Section 17 of পরিকল্পনা.md) */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold font-headline">
              বাংলা টাইপিং দ্রুত শেখার ১০টি কার্যকর ধাপ
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              নতুন শিক্ষার্থী থেকে পেশাদার টাইপিস্ট হয়ে ওঠার প্রমাণিত রোডম্যাপ
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { step: '০১', title: 'কীবোর্ড নির্বাচন', desc: 'দৈনন্দিন কাজের জন্য অভ্র বা চাকরির পরীক্ষার জন্য বিজয় নির্ধারণ করুন।' },
              { step: '০২', title: 'হোম রো পজিশন', desc: 'হাতের আঙুলগুলো সবসময় F ও J কী-র দাগে স্থাপন করে শুরু করুন।' },
              { step: '০৩', title: 'স্পর্শ টাইপিং', desc: 'কীবোর্ডের দিকে না তাকিয়ে শুধুমাত্র স্ক্রিনে তাকিয়ে টাইপ করার অভ্যাস করুন।' },
              { step: '০৪', title: 'কার-চিহ্ন নিয়ন্ত্রণ', desc: 'আ-কার, ই-কার, এ-কার প্রভৃতি স্বরচিহ্নের কীবোর্ড ম্যাপিং রপ্ত করুন।' },
              { step: '০৫', title: 'হসন্তের সঠিক ব্যবহার', desc: 'যুক্তাক্ষর তৈরির ভিত্তি হলো হসন্ত (্); এর কি-পজিশন মুখস্থ করুন।' },
              { step: '০৬', title: 'যুক্তাক্ষর ড্রিল', desc: 'ক্ষ, জ্ঞ, ষ্ণ, ঞ্চ-এর মতো বহুল ব্যবহৃত যুক্তবর্ণগুলো আলাদা অনুশীলন করুন।' },
              { step: '০৭', title: 'শব্দ থেকে বাক্য', desc: 'একক বর্ণ আয়ত্তের পর ২-৩ অক্ষরের শব্দ ও পূর্ণ বাক্যে টাইপ শুরু করুন।' },
              { step: '০৮', title: 'ভুল চিহ্নিতকরণ', desc: 'আমাদের ভুল সংশোধন হাব ব্যবহার করে দুর্বল অক্ষরগুলো নিয়মিত শোধরান।' },
              { step: '০৯', title: 'দৈনিক ১৫ মিনিট', desc: 'একটানা দীর্ঘক্ষণ না করে প্রতিদিন ১৫-২০ মিনিট একাগ্র মনোযোগে টাইপ করুন।' },
              { step: '১০', title: 'মক টেস্ট ও সনদ', desc: '৫ মিনিটের সরকারি পরীক্ষা মোডে পরীক্ষা দিয়ে স্পিড সার্টিফিকেট অর্জন করুন।' },
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-xl border bg-card/60 space-y-1.5 hover:border-primary/50 transition-all">
                <span className="text-xl font-extrabold text-primary font-mono">{item.step}</span>
                <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Hub Grid (Direct Internal Linking) */}
        <section className="container mx-auto px-4 py-12 max-w-5xl border-t">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">
              পর্যায়ক্রমিক বাংলা টাইপিং লার্নিং হাব
            </h2>
            <p className="text-muted-foreground text-sm">
              আপনার প্রয়োজন অনুযায়ী সরাসরি নির্দিষ্ট পাঠক্রম ও গাইডলাইনে প্রবেশ করুন
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Link href="/learn/home-row" className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-xs transition-all text-center">
              <span className="block font-bold text-sm text-foreground">হোম রো টাইপিং</span>
              <span className="text-xs text-muted-foreground">মূল আঙুলের অবস্থান</span>
            </Link>
            <Link href="/learn/top-row" className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-xs transition-all text-center">
              <span className="block font-bold text-sm text-foreground">টপ রো টাইপিং</span>
              <span className="text-xs text-muted-foreground">উপরের সারির বর্ণমালা</span>
            </Link>
            <Link href="/learn/bottom-row" className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-xs transition-all text-center">
              <span className="block font-bold text-sm text-foreground">বটম রো টাইপিং</span>
              <span className="text-xs text-muted-foreground">নিচের সারির অক্ষর ও কার</span>
            </Link>
            <Link href="/learn/kar" className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-xs transition-all text-center">
              <span className="block font-bold text-sm text-foreground">কার-চিহ্ন গাইড</span>
              <span className="text-xs text-muted-foreground">া, ি, ী, ু, ূ, ে, ো</span>
            </Link>
            <Link href="/learn/hasanta" className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-xs transition-all text-center">
              <span className="block font-bold text-sm text-foreground">হসন্তের ব্যবহার</span>
              <span className="text-xs text-muted-foreground">যুক্তবর্ণ গঠনের নিয়ম</span>
            </Link>
            <Link href="/learn/phola" className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-xs transition-all text-center">
              <span className="block font-bold text-sm text-foreground">বাংলা ফলা টাইপিং</span>
              <span className="text-xs text-muted-foreground">য-ফলা, র-ফলা, ব-ফলা</span>
            </Link>
            <Link href="/learn/juktakkhor" className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-xs transition-all text-center">
              <span className="block font-bold text-sm text-foreground">যুক্তাক্ষর টাইপিং</span>
              <span className="text-xs text-muted-foreground">কঠিন যুক্তবর্ণের সহজ ট্রিক</span>
            </Link>
            <Link href="/learn/numbers" className="p-4 rounded-lg border bg-card hover:border-primary hover:shadow-xs transition-all text-center">
              <span className="block font-bold text-sm text-foreground">সংখ্যা ও বিরামচিহ্ন</span>
              <span className="text-xs text-muted-foreground">১-০ ও দাঁড়ি, কমা</span>
            </Link>
          </div>
        </section>

        {/* FAQ Section (Structured Schema Matching) */}
        <section className="container mx-auto px-4 py-16 max-w-4xl border-t">
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
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-t py-16 text-center" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4 max-w-2xl space-y-4">
            <h2 id="cta-heading" className="text-3xl font-extrabold font-headline">আজই শুরু করুন — সম্পূর্ণ বিনামূল্যে</h2>
            <p className="text-sm text-muted-foreground">
              অ্যাকাউন্ট তৈরি করে ক্লাউডে অগ্রগতি সংরক্ষণ করুন, অথবা লগইন ছাড়াই সরাসরি গেস্ট হিসেবে টাইপ করুন।
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-primary text-primary-foreground font-bold px-8 shadow-md" asChild>
                <Link href={user ? "/dashboard" : "/bangla-typing-course"}>
                  {user ? "আপনার ড্যাশবোর্ডে যান" : "সম্পূর্ণ কোর্স দেখুন"} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-semibold px-6" asChild>
                <Link href="/bangla-typing-test">টাইপিং টেস্ট দিন</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Rich Multi-Column Footer (Section 27 of পরিকল্পনা.md) */}
      <footer className="border-t bg-muted/40 py-12 text-sm text-muted-foreground" aria-label="সাইট ফুটার">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 pb-8 border-b">
            {/* Column 1: Tests */}
            <nav aria-label="টাইপিং টেস্ট ও টুলস" className="space-y-3">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">টাইপিং টেস্ট ও টুলস</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/bangla-typing-test" className="hover:text-primary transition-colors">বাংলা টাইপিং টেস্ট</Link></li>
                <li><Link href="/bangla-typing-speed-test" className="hover:text-primary transition-colors">টাইপিং স্পিড টেস্ট (WPM)</Link></li>
                <li><Link href="/avro-typing-test" className="hover:text-primary transition-colors">অভ্র টাইপিং টেস্ট</Link></li>
                <li><Link href="/bijoy-typing-test" className="hover:text-primary transition-colors">বিজয় টাইপিং টেস্ট</Link></li>
                <li><Link href="/game" className="hover:text-primary transition-colors">টাইপিং গেম ও আর্কেড</Link></li>
              </ul>
            </nav>

            {/* Column 2: Learn */}
            <nav aria-label="শেখার পাঠক্রম" className="space-y-3">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">শেখার পাঠক্রম</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/learn" className="hover:text-primary transition-colors">টাইপিং শেখার হাব</Link></li>
                <li><Link href="/bangla-typing-course" className="hover:text-primary transition-colors">১৩ লেভেলের সম্পূর্ণ কোর্স</Link></li>
                <li><Link href="/learn/home-row" className="hover:text-primary transition-colors">হোম রো (Home Row)</Link></li>
                <li><Link href="/learn/top-row" className="hover:text-primary transition-colors">টপ রো (Top Row)</Link></li>
                <li><Link href="/learn/bottom-row" className="hover:text-primary transition-colors">বটম রো (Bottom Row)</Link></li>
                <li><Link href="/learn/kar" className="hover:text-primary transition-colors">কার-চিহ্ন টাইপিং</Link></li>
              </ul>
            </nav>

            {/* Column 3: Rules & Grammar */}
            <nav aria-label="যুক্তাক্ষর ও নিয়মাবলি" className="space-y-3">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">যুক্তাক্ষর ও নিয়মাবলি</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/learn/hasanta" className="hover:text-primary transition-colors">হসন্তের (্) নিয়ম</Link></li>
                <li><Link href="/learn/phola" className="hover:text-primary transition-colors">বাংলা ফলা টাইপিং</Link></li>
                <li><Link href="/learn/juktakkhor" className="hover:text-primary transition-colors">যুক্তাক্ষর টাইপিং</Link></li>
                <li><Link href="/learn/words" className="hover:text-primary transition-colors">বাংলা শব্দ প্র্যাকটিস</Link></li>
                <li><Link href="/learn/sentences" className="hover:text-primary transition-colors">বাক্য ও অনুচ্ছেদ টাইপিং</Link></li>
                <li><Link href="/learn/numbers" className="hover:text-primary transition-colors">বাংলা সংখ্যা টাইপিং</Link></li>
                <li><Link href="/learn/punctuation" className="hover:text-primary transition-colors">বিরামচিহ্ন টাইপিং</Link></li>
              </ul>
            </nav>

            {/* Column 4: Keyboards & Jobs */}
            <nav aria-label="কীবোর্ড ও ক্যারিয়ার" className="space-y-3">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">কীবোর্ড ও ক্যারিয়ার</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/bangla-keyboard" className="hover:text-primary transition-colors">বাংলা কীবোর্ড পরিচিতি</Link></li>
                <li><Link href="/bangla-typing-for-jobs" className="hover:text-primary transition-colors">চাকরির পরীক্ষার প্রস্তুতি</Link></li>
                <li><Link href="/layouts" className="hover:text-primary transition-colors">ভার্চুয়াল কীবোর্ড লেআউট</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">আমাদের সম্পর্কে</Link></li>
                <li>
                  <Link href={user ? "/dashboard" : "/login"} className="hover:text-primary transition-colors">
                    {user ? "ড্যাশবোর্ড ও প্রোফাইল" : "লগইন ও অ্যাকাউন্ট"}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Logo />
              <span>— বাংলা টাইপিং শেখা, অনুশীলন ও স্পিড টেস্ট প্ল্যাটফর্ম</span>
            </div>
            <div>
              © {toBengaliNumber(new Date().getFullYear())} অনূরণ (onuron.org)। সর্বস্বত্ব সংরক্ষিত।
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
