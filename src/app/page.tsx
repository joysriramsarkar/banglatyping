"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { BookOpen, Gamepad2, Timer, Trophy, ArrowRight, Keyboard, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const toBengaliNumber = (num: number | string) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const features = [
  {
    icon: BookOpen,
    title: 'ধাপে ধাপে পাঠ',
    description: 'শিক্ষানবিশ থেকে উন্নত স্তর পর্যন্ত সাজানো পাঠক্রম।',
  },
  {
    icon: Gamepad2,
    title: 'টাইপিং গেম',
    description: 'ঝরন্ত শব্দ গেমে মজা করতে করতে গতি বাড়ান।',
  },
  {
    icon: Timer,
    title: 'টাইপিং টেস্ট',
    description: '১, ২, ৫ বা ১০ মিনিটের টেস্টে নিজেকে যাচাই করুন।',
  },
  {
    icon: Trophy,
    title: 'সার্টিফিকেট',
    description: 'দক্ষতা অর্জনের পর সার্টিফিকেট ডাউনলোড করুন।',
  },
  {
    icon: Keyboard,
    title: 'ভার্চুয়াল কীবোর্ড',
    description: 'Avro, Bijoy ও BanglaWord লেআউট সাপোর্ট।',
  },
  {
    icon: TrendingUp,
    title: 'অগ্রগতি ট্র্যাকিং',
    description: 'আপনার দুর্বল অক্ষর চিহ্নিত করে উন্নতির পরামর্শ পান।',
  },
];

const stats = [
  { value: '৩+', label: 'কীবোর্ড লেআউট' },
  { value: '২০+', label: 'পাঠ ও ড্রিল' },
  { value: '১০০%', label: 'বিনামূল্যে' },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/login')}>লগইন</Button>
            <Button onClick={() => router.push('/signup')}>সাইন আপ</Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-5xl font-bold text-primary">
              ট
            </div>
            <h1 className="text-4xl font-bold leading-tight text-primary md:text-6xl">
              বাংলা টাইপিং মাস্টার
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              ইন্টারেক্টিভ পাঠ, গেম এবং পরীক্ষার মাধ্যমে আপনার বাংলা টাইপিং দক্ষতা বাড়ান।
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => router.push('/dashboard/lessons')}>
                অনুশীলন শুরু করুন <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/about')}>
                আরও জানুন
              </Button>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y bg-muted/40">
          <div className="container mx-auto grid grid-cols-3 divide-x px-4 py-6">
            {stats.map((s) => (
              <div key={s.label} className="px-4 text-center">
                <p className="text-2xl font-bold text-primary md:text-3xl">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">সব কিছু এক জায়গায়</h2>
            <p className="mt-2 text-muted-foreground">বাংলা টাইপিং শেখার জন্য যা যা দরকার</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary/5 border-t">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">আজই শুরু করুন — সম্পূর্ণ বিনামূল্যে</h2>
            <p className="mt-3 text-muted-foreground">
              আপনার অগ্রগতি সংরক্ষণ করতে{' '}
              <Link href="/signup" className="font-medium text-primary underline underline-offset-4">
                একটি অ্যাকাউন্ট তৈরি করুন
              </Link>
              , অথবা লগইন ছাড়াই অনুশীলন করুন।
            </p>
            <Button size="lg" className="mt-6" onClick={() => router.push('/dashboard/lessons')}>
              এখনই শুরু করুন <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {toBengaliNumber(new Date().getFullYear())} বাংলা টাইপিং মাস্টার। সর্বস্বত্ব সংরক্ষিত।
      </footer>
    </div>
  );
}
