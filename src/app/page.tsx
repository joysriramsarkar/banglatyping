"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Type, Keyboard, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/logo';

const keyboardLayouts = [
  { id: 'avro', name: 'Avro Phonetic', description: 'Intuitive phonetic typing.' },
  { id: 'bijoy', name: 'Bijoy Classic', description: 'Traditional fixed layout.' },
  { id: 'banglaword', name: 'BanglaWord', description: 'Another popular layout.' },
];

export default function Home() {
  const router = useRouter();
  const [selectedLayout, setSelectedLayout] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedLayout = localStorage.getItem('keyboardLayout');
    // For this example, we assume if a layout is set, the user is "logged in" and is redirected.
    // In a real app, you'd check for an auth token.
    if (storedLayout) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleContinue = () => {
    if (selectedLayout) {
      localStorage.setItem('keyboardLayout', selectedLayout);
      router.push('/signup');
    }
  };
  
  if (!isClient) {
    return null; // or a loading skeleton
  }

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
        <div className="w-full max-w-4xl">
          <section className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-headline text-primary">বাংলা টাইপিং মাস্টার</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              ইন্টারেক্টিভ পাঠ, গেম এবং পরীক্ষার মাধ্যমে আপনার বাংলা টাইপিং দক্ষতা বাড়ান।
            </p>
          </section>

          <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Keyboard className="text-primary" />
                আপনার কীবোর্ড লেআউট নির্বাচন করুন
              </CardTitle>
              <CardDescription>
                অনুশীলন শুরু করার জন্য আপনার পছন্দের লেআউটটি বেছে নিন।
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedLayout} onValueChange={setSelectedLayout} className="space-y-4">
                {keyboardLayouts.map((layout) => (
                  <Label
                    key={layout.id}
                    htmlFor={layout.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedLayout === layout.id ? 'border-primary ring-2 ring-primary' : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value={layout.id} id={layout.id} className="mr-4" />
                    <div className="text-left">
                      <p className="font-semibold">{layout.name}</p>
                      <p className="text-sm text-muted-foreground">{layout.description}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
              <Button
                size="lg"
                className="w-full mt-6"
                onClick={handleContinue}
                disabled={!selectedLayout}
              >
                এগিয়ে যান
                <CheckCircle className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bangla Typing Master. All rights reserved.
      </footer>
    </div>
  );
}
