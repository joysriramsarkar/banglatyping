"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Type } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  const router = useRouter();

  const handleStartPracticing = () => {
    router.push('/dashboard/lessons');
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <header className="p-4 border-b bg-background">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => router.push('/login')}>লগইন</Button>
            <Button onClick={() => router.push('/signup')}>সাইন আপ</Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-4xl space-y-8">
          <section>
             <Type className="h-24 w-24 mx-auto text-primary mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-headline text-primary">বাংলা টাইপিং মাস্টার</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              ইন্টারেক্টিভ পাঠ, গেম এবং পরীক্ষার মাধ্যমে আপনার বাংলা টাইপিং দক্ষতা বাড়ান।
            </p>
          </section>

          <div className="space-y-4">
              <Button
                size="lg"
                className="w-full max-w-xs mx-auto"
                onClick={handleStartPracticing}
              >
                অনুশীলন শুরু করুন
              </Button>
               <p className="text-sm text-muted-foreground">
                আপনার অগ্রগতি সংরক্ষণ করতে এবং সম্পূর্ণ অভিজ্ঞতা পেতে একটি <a href="/signup" className="underline text-primary">অ্যাকাউন্ট তৈরি করুন</a>।
              </p>
          </div>

        </div>
      </main>
      
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bangla Typing Master. All rights reserved.
      </footer>
    </div>
  );
}
