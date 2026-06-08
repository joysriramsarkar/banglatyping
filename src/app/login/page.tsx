
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
    <svg className="h-5 w-5" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-67.7 67.7C314.6 114.5 283.5 104 248 104c-73.8 0-134.3 60.3-134.3 134.3s60.5 134.3 134.3 134.3c81.5 0 115.7-60.2 120.3-91.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
);

const FacebookIcon = () => (
    <svg className="h-5 w-5" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path>
    </svg>
);

const MicrosoftIcon = () => (
    <svg className="h-5 w-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
        toast({ variant: "destructive", title: "\u09a4\u09cd\u09b0\u09c1\u099f\u09bf", description: "\u0985\u09a8\u09c1\u0997\u09cd\u09b0\u09b9 \u0995\u09b0\u09c7 \u0987\u09ae\u09c7\u09b2 \u098f\u09ac\u0982 \u09aa\u09be\u09b8\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1 \u09a6\u09bf\u09a8\u0964" });
        setIsLoading(false);
        return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({
          variant: "destructive",
          title: "\u09a4\u09cd\u09b0\u09c1\u099f\u09bf",
          description: error.message === "Invalid login credentials"
            ? "\u0986\u09aa\u09a8\u09be\u09b0 \u0987\u09ae\u09c7\u09b2 \u09ac\u09be \u09aa\u09be\u09b8\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1 \u09b8\u09a0\u09bf\u0995 \u09a8\u09af\u09bc\u0964"
            : error.message,
        });
        setIsLoading(false);
        return;
      }

      toast({ title: "\u09b8\u09be\u09ab\u09b2\u09cd\u09af!", description: "\u09b8\u09ab\u09b2\u09ad\u09be\u09ac\u09c7 \u09b2\u0997\u0987\u09a8 \u0995\u09b0\u09c7\u099b\u09c7\u09a8\u0964" });
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "\u09a4\u09cd\u09b0\u09c1\u099f\u09bf",
        description: error instanceof Error ? error.message : "\u09b2\u0997\u0987\u09a8\u09c7 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (providerName: 'google' | 'facebook' | 'azure') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerName,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) {
        toast({ variant: "destructive", title: "\u09a4\u09cd\u09b0\u09c1\u099f\u09bf", description: error instanceof Error ? error.message : String(error) });
        setIsLoading(false);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "\u09a4\u09cd\u09b0\u09c1\u099f\u09bf", description: error instanceof Error ? error.message : "\u0985\u09a5\u09c7\u09a8\u09cd\u099f\u09bf\u0995\u09c7\u09b6\u09a8\u09c7 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964" });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-2"/>
          <CardTitle className="text-2xl">\u09b8\u09cd\u09ac\u09be\u0997\u09a4\u09ae!</CardTitle>
          <CardDescription>\u0986\u09aa\u09a8\u09be\u09b0 \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f\u09c7 \u09b2\u0997\u0987\u09a8 \u0995\u09b0\u09c1\u09a8</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">\u0987\u09ae\u09c7\u09b2</Label>
              <Input id="email" name="email" type="email" placeholder="email@example.com" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">\u09aa\u09be\u09b8\u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1</Label>
              <Input id="password" name="password" type="password" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "\u09b2\u09cb\u09a1 \u09b9\u099a\u09cd\u099b\u09c7..." : "\u09b2\u0997\u0987\u09a8 \u0995\u09b0\u09c1\u09a8"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">\u0985\u09a5\u09ac\u09be</span>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" type="button" size="icon" onClick={() => handleOAuthLogin('google')} disabled={isLoading} aria-label="Google \u09a6\u09bf\u09af\u09bc\u09c7 \u09b2\u0997\u0987\u09a8 \u0995\u09b0\u09c1\u09a8">
                <GoogleIcon />
              </Button>
              <Button variant="outline" type="button" size="icon" onClick={() => handleOAuthLogin('facebook')} disabled={isLoading} aria-label="Facebook \u09a6\u09bf\u09af\u09bc\u09c7 \u09b2\u0997\u0987\u09a8 \u0995\u09b0\u09c1\u09a8">
                <FacebookIcon />
              </Button>
              <Button variant="outline" type="button" size="icon" onClick={() => handleOAuthLogin('azure')} disabled={isLoading} aria-label="Microsoft \u09a6\u09bf\u09af\u09bc\u09c7 \u09b2\u0997\u0987\u09a8 \u0995\u09b0\u09c1\u09a8">
                <MicrosoftIcon />
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            \u0995\u09cb\u09a8\u09cb \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f \u09a8\u09c7\u0987?{" "}
            <Link href="/signup" className="underline">
              \u09b8\u09be\u0987\u09a8 \u0986\u09aa \u0995\u09b0\u09c1\u09a8
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
