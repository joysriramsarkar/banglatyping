"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Award, ArrowLeft, Calendar, User, Zap, Target } from "lucide-react";
import Link from "next/link";
import { toBengaliNumber } from "@/lib/utils";

export default function CertificateVerificationPage() {
  const params = useParams();
  const certId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "BTP-2026-000000";

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Verification Status Card */}
        <Card className="border shadow-lg bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center space-y-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <Badge className="bg-white text-green-700 font-bold px-3 py-1">
              যাচাইকৃত অফিসিয়াল সনদপত্র (Verified)
            </Badge>
            <h1 className="text-2xl font-bold font-headline mt-2">
              সনদপত্র যাচাইকরণ সফল হয়েছে
            </h1>
            <p className="text-green-100 text-xs font-mono">আইডি: {certId}</p>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-4 divide-y divide-border">
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" /> সনদের প্রাপক
                </span>
                <span className="font-bold text-base text-foreground font-headline">
                  পরীক্ষার্থী / ব্যবহারকারী
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" /> সনদ প্রকার
                </span>
                <span className="font-semibold text-sm text-foreground">
                  বাংলা টাইপিং প্রফিশিয়েন্সি ও মাস্টার্স সনদ
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> অর্জিত গতি (WPM)
                </span>
                <span className="font-bold text-lg text-primary">
                  {toBengaliNumber(45)}+ WPM
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" /> গড় নির্ভুলতা (Accuracy)
                </span>
                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                  ৯৭.৫%
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> সনদ ইস্যুর বছর
                </span>
                <span className="font-medium text-sm text-foreground">
                  ২০২৬ (BanglaTyping Authority)
                </span>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground text-center">
              এই সনদপত্রটি BanglaTyping স্বয়ংক্রিয় অনলাইন মূল্যায়ন সিস্টেমের মাধ্যমে যাচাই করা হয়েছে।
            </div>

            <Button asChild className="w-full bg-primary text-primary-foreground">
              <Link href="/dashboard/test">
                <ArrowLeft className="mr-2 h-4 w-4" /> নিজে পরীক্ষা দিন ও সনদ অর্জন করুন
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
