import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, RefreshCw, Zap, Target, XCircle, Timer as TimerIcon, Home, ArrowRight } from "lucide-react";
import { TypingStats, Lesson } from "@/lib/types";
import { useState } from "react";
import Certificate from "./certificate";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { lessons } from "@/lib/lessons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const StatItem = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: string | number, unit?: string }) => (
  <div className="flex items-center justify-between py-2 border-b">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
    </div>
    <span className="font-semibold text-lg">{toBengaliNumber(value)} {unit}</span>
  </div>
);

export default function TestResults({ stats, onRestart, lessonId }: { stats: TypingStats, onRestart: () => void, lessonId?: string }) {
  const { wpm, accuracy, errors, timeElapsed } = stats;
  const router = useRouter();

  const canGetCertificate = wpm >= 40 && accuracy >= 95;
  
  let nextLesson: Lesson | null = null;
  if(lessonId) {
    const currentLessonIndex = lessons.findIndex(l => l.id === lessonId);
    if(currentLessonIndex !== -1 && currentLessonIndex < lessons.length - 1) {
        nextLesson = lessons[currentLessonIndex + 1];
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <Award className="mx-auto h-12 w-12 text-yellow-500" />
        <CardTitle className="text-3xl font-headline">ফলাফল</CardTitle>
        <CardDescription>আপনার টাইপিং টেস্টের সারাংশ নিচে দেওয়া হলো।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">গতি (WPM)</p>
            <p className="text-4xl font-bold text-primary">{toBengaliNumber(wpm)}</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">নির্ভুলতা</p>
            <p className="text-4xl font-bold text-primary">{toBengaliNumber(accuracy)}%</p>
          </div>
        </div>

        <div className="space-y-2 text-base">
          <StatItem icon={Target} label="সঠিক শব্দ" value={toBengaliNumber(Math.round(wpm * (timeElapsed/60)))} />
          <StatItem icon={XCircle} label="ভুল শব্দ" value={toBengaliNumber(errors)} />
          <StatItem icon={TimerIcon} label="সময়" value={toBengaliNumber(timeElapsed)} unit="সেকেন্ড" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
            {canGetCertificate && (
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full">সার্টিফিকেট দেখুন</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0">
                        <Certificate name="ব্যবহারকারী" wpm={wpm} accuracy={accuracy} />
                    </DialogContent>
                 </Dialog>
            )}
            <Button onClick={onRestart} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              পুনরায় চেষ্টা করুন
            </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button onClick={() => router.push('/dashboard/lessons')} variant="secondary" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              পাঠক্রমে ফিরে যান
            </Button>
            {nextLesson && (
                 <Button onClick={() => router.push(`/practice/${nextLesson?.id}`)} className="w-full">
                    পরবর্তী পাঠ <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>


      </CardContent>
    </Card>
  );
}
