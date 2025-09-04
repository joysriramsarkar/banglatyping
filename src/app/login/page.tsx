
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
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-67.7 67.7C314.6 114.5 283.5 104 248 104c-73.8 0-134.3 60.3-134.3 134.3s60.5 134.3 134.3 134.3c81.5 0 115.7-60.2 120.3-91.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
);

const FacebookIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path>
    </svg>
);

const MicrosoftIcon = () => (
    <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Microsoft</title>
      <path fill="currentColor" d="M11.4 22.2h-10v-10h10v10zm0-11.6h-10v-10h10v10zm11.2 11.6h-10v-10h10v10zm0-11.6h-10v-10h10v10z"/>
    </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        toast({ variant: "destructive", title: "ত্রুটি", description: "অনুগ্রহ করে ইমেল এবং পাসওয়ার্ড দিন।" });
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "সাফল্য!", description: "সফলভাবে লগইন করেছেন।" });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: "আপনার ইমেল বা পাসওয়ার্ড সঠিক নয়।",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (providerName: 'google' | 'facebook' | 'microsoft') => {
    setIsLoading(true);
    let provider;
    if (providerName === 'google') {
        provider = new GoogleAuthProvider();
    } else if (providerName === 'facebook') {
        provider = new FacebookAuthProvider();
    } else {
        provider = new OAuthProvider('microsoft.com');
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
         await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
          }, { merge: true });
      }

      toast({ title: "সাফল্য!", description: `স্বাগতম, ${user.displayName}!` });
      router.push("/dashboard");
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: "লগইন করার সময় একটি সমস্যা হয়েছে।",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-2"/>
          <CardTitle className="text-2xl">স্বাগতম!</CardTitle>
          <CardDescription>আপনার অ্যাকাউন্টে লগইন করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">ইমেল</Label>
              <Input id="email" name="email" type="email" placeholder="email@example.com" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input id="password" name="password" type="password" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "লোড হচ্ছে..." : "লগইন করুন"}
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">অথবা</span>
                </div>
            </div>
            <Button variant="outline" type="button" onClick={() => handleOAuthLogin('google')} className="w-full" disabled={isLoading}>
              <GoogleIcon />
              {isLoading ? "লোড হচ্ছে..." : "গুগল দিয়ে লগইন করুন"}
            </Button>
             <Button variant="outline" type="button" onClick={() => handleOAuthLogin('facebook')} className="w-full" disabled={isLoading}>
                <FacebookIcon />
                {isLoading ? "লোড হচ্ছে..." : "ফেসবুক দিয়ে লগইন করুন"}
            </Button>
             <Button variant="outline" type="button" onClick={() => handleOAuthLogin('microsoft')} className="w-full" disabled={isLoading}>
                <MicrosoftIcon />
                {isLoading ? "লোড হচ্ছে..." : "মাইক্রোসফ্ট দিয়ে লগইন করুন"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            কোনো অ্যাকাউন্ট নেই?{" "}
            <Link href="/signup" className="underline">
              সাইন আপ করুন
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
