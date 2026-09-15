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

      <main className="flex-grow">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold shadow-xs">
              <Sparkles className="h-4 w-4" /> পূর্ণাঙ্গ বাংলা টাইপিং লার্নিং ও প্র্যাকটিস প্ল্যাটফর্ম
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground font-headline leading-tight">
              বাংলা টাইপিং মাস্টার
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ধাপে ধাপে ১৩টি লেভেলে বাংলা টাইপিং শিখুন, ভুল চিহ্নিত করে দুর্বলতা দূর করুন, এবং সরকারি পরীক্ষার জন্য নিজেকে প্রস্তুত করুন।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground font-bold gap-2 text-base px-8 shadow-md hover:shadow-lg"
                onClick={() => router.push("/dashboard/lessons")}
              >
                <PlayCircle className="h-5 w-5" /> বিনামূল্যে অনুশীলন শুরু করুন
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto font-semibold"
                onClick={() => router.push("/dashboard/test")}
              >
                টাইপিং টেস্ট দিন
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

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="mb-14 text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold font-headline">সব ফিচার এক নজরে</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              বাংলা টাইপিংয়ে দ্রুত গতি, নির্ভুলতা ও স্থায়ী দক্ষতা অর্জনের আধুনিক সিস্টেম
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition-all hover:border-primary/50 hover:shadow-md border">
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-base text-foreground font-headline">{f.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
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

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {toBengaliNumber(new Date().getFullYear())} বাংলা টাইপিং মাস্টার (BanglaTyping)। সর্বস্বত্ব সংরক্ষিত।
      </footer>
    </div>
  );
}
