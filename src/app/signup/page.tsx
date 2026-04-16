
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/db";

const GoogleIcon = () => (
    <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-67.7 67.7C314.6 114.5 283.5 104 248 104c-73.8 0-134.3 60.3-134.3 134.3s60.5 134.3 134.3 134.3c81.5 0 115.7-60.2 120.3-91.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
);

const FacebookIcon = () => (
    <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path>
    </svg>
);

const DiscordIcon = () => (
    <svg className="h-5 w-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M20.317 4.3671a19.8062 19.8062 0 0 0-4.8851-1.5152.074.074 0 0 0-.0784.0372c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.0785-.037 19.7512 19.7512 0 0 0-4.8854 1.515.0699.0699 0 0 0-.032.0277C.5934 9.834.57 15.1648 1.6591 20.3734a.082.082 0 0 0 .031.0477 19.9384 19.9384 0 0 0 5.9921 3.0398.084.084 0 0 0 .084-.028c.462-.612.873-1.25 1.226-1.911a.081.081 0 0 0-.044-.113 13.07 13.07 0 0 1-1.857-.892.083.083 0 0 1-.008-.138c.125-.093.25-.19.371-.287a.08.08 0 0 1 .082-.01c3.904 1.879 8.129 1.879 12.013 0a.082.082 0 0 1 .083.011c.121.098.246.195.371.288a.083.083 0 0 1-.006.138 12.299 12.299 0 0 1-1.857.892.084.084 0 0 0-.046.113c.353.66.764 1.299 1.225 1.911a.084.084 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-3.0398.083.083 0 0 0 .032-.0477c1.309-5.271 1.175-10.451.166-15.5562a.06.06 0 0 0-.031-.0286zM8.02 17.982c-1.316 0-2.404-.956-2.404-2.131 0-1.175.956-2.134 2.404-2.134 1.454 0 2.404.959 2.404 2.134 0 1.175-.95 2.131-2.404 2.131zm7.952 0c-1.316 0-2.404-.956-2.404-2.131 0-1.175.956-2.134 2.404-2.134 1.454 0 2.404.959 2.404 2.134 0 1.175-.95 2.131-2.404 2.131Z"/>
    </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        toast({
          variant: "destructive",
          title: "ত্রুটি",
          description: "অনুগ্রহ করে সমস্ত তথ্য পূরণ করুন।",
        });
        setIsLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (error) {
        let errorMessage = "অ্যাকাউন্ট তৈরিতে একটি সমস্যা হয়েছে।";
        if (error.message?.includes("already registered")) {
          errorMessage = "এই ইমেল ঠিকানাটি ইতিমধ্যে ব্যবহৃত হচ্ছে।";
        } else if (error.message?.includes("password")) {
          errorMessage = "পাসওয়ার্ডটি খুব দুর্বল। অনুগ্রহ করে আরও শক্তিশালী পাসওয়ার্ড দিন।";
        }
        toast({
          variant: "destructive",
          title: "ত্রুটি",
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "সাফল্য!",
        description: "আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। অনুগ্রহ করে আপনার ইমেল নিশ্চিত করুন।",
      });
      
      router.push("/login");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: error.message || "সাইন আপে সমস্যা হয়েছে।",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOAuthSignup = async (providerName: 'google' | 'facebook' | 'discord') => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: providerName,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "ত্রুটি",
          description: error.message,
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: error.message || "সাইন আপে সমস্যা হয়েছে।",
      });
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-2" />
          <CardTitle className="text-2xl">অ্যাকাউন্ট তৈরি করুন</CardTitle>
          <CardDescription>আপনার যাত্রা শুরু করতে সাইন আপ করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">নাম</Label>
              <Input id="name" name="name" placeholder="আপনার নাম" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">ইমেল</Label>
              <Input id="email" name="email" type="email" placeholder="email@example.com" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input id="password" name="password" type="password" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "লোড হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
            </Button>
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">অথবা</span>
                </div>
            </div>
            <div className="flex justify-center gap-4">
               <Button variant="outline" type="button" size="icon" onClick={() => handleOAuthSignup('google')} disabled={isLoading} aria-label="Google দিয়ে সাইন আপ করুন">
                  <GoogleIcon />
               </Button>
               <Button variant="outline" type="button" size="icon" onClick={() => handleOAuthSignup('facebook')} disabled={isLoading} aria-label="Facebook দিয়ে সাইন আপ করুন">
                  <FacebookIcon />
               </Button>
               <Button variant="outline" type="button" size="icon" onClick={() => handleOAuthSignup('discord')} disabled={isLoading} aria-label="Discord দিয়ে সাইন আপ করুন">
                  <DiscordIcon />
               </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="underline">
              লগইন করুন
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

