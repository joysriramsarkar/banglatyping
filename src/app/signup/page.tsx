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
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-67.7 67.7C314.6 114.5 283.5 104 248 104c-73.8 0-134.3 60.3-134.3 134.3s60.5 134.3 134.3 134.3c81.5 0 115.7-60.2 120.3-91.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });

      toast({
        title: "সাফল্য!",
        description: "আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।",
      });
      
      router.push("/dashboard");

    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = "অ্যাকাউন্ট তৈরিতে একটি সমস্যা হয়েছে।";
      if (errorCode === 'auth/email-already-in-use') {
          errorMessage = "এই ইমেল ঠিকানাটি 이미 ব্যবহৃত হচ্ছে।";
      } else if (errorCode === 'auth/weak-password') {
          errorMessage = "পাসওয়ার্ডটি খুব দুর্বল। অনুগ্রহ করে আরও শক্তিশালী পাসওয়ার্ড দিন।";
      }
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    const handleGoogleSignup = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      }, { merge: true }); // Use merge to avoid overwriting existing data if user signs up differently

      toast({
        title: "সাফল্য!",
        description: `স্বাগতম, ${user.displayName}!`,
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: "Google দিয়ে সাইন আপ করার সময় একটি সমস্যা হয়েছে।",
      });
    } finally {
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
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignup} disabled={isLoading}>
              <GoogleIcon />
              {isLoading ? "লোড হচ্ছে..." : "গুগল দিয়ে সাইন আপ করুন"}
            </Button>
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
