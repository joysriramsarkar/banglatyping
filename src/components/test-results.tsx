
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, RefreshCw, Zap, Target, XCircle, Timer as TimerIcon, Home, ArrowRight, BrainCircuit } from "lucide-react";
import { TypingStats, Lesson, TestSummary, ErredCharacter } from "@/lib/types";
import { useState, useEffect, useRef } from "react";
import Certificate from "./certificate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { lessons } from "@/lib/lessons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const toBengaliNumber = (num: number | string) => {
    if (typeof num === 'undefined' || num === null) return '০';
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

export default function TestResults({ stats, onRestart, lessonId, isDrill = false, customDrill }: { stats: TypingStats, onRestart: () => void, lessonId?: string, isDrill?: boolean, customDrill?: () => void }) {
  const { wpm, accuracy, errors, timeElapsed, erredCharacters = [] } = stats;
  const router = useRouter();
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const nextLessonButtonRef = useRef<HTMLButtonElement>(null);
  const restartButtonRef = useRef<HTMLButtonElement>(null);
  const hasSavedResult = useRef(false);

  const canGetCertificate = wpm >= 40 && accuracy >= 95 && !isDrill;
  
  let nextLesson: Lesson | null = null;
  if(lessonId) {
    const currentLessonIndex = lessons.findIndex(l => l.id === lessonId);
    if(currentLessonIndex !== -1 && currentLessonIndex < lessons.length - 1) {
        nextLesson = lessons[currentLessonIndex + 1];
    }
  }

  useEffect(() => {
    const saveResults = async () => {
      if (user && !isDrill && !hasSavedResult.current) {
        hasSavedResult.current = true;
        try {
          const statsCollectionRef = collection(db, `users/${user.uid}/stats`);
          const resultData: TestSummary = {
            wpm,
            accuracy,
            errors,
            timeElapsed,
            lessonId: lessonId || 'typing-test',
            timestamp: serverTimestamp(),
            erredCharacters,
          };
          await addDoc(statsCollectionRef, resultData);
          toast({ title: "সাফল্য!", description: "আপনার ফলাফল সংরক্ষণ করা হয়েছে।" });
        } catch (error) {
          console.error("Error saving results: ", error);
          toast({ variant: "destructive", title: "ত্রুটি", description: "ফলাফল সংরক্ষণ করা যায়নি।" });
          hasSavedResult.current = false;
        }
      }
    };

    saveResults();
  }, [user, wpm, accuracy, errors, timeElapsed, lessonId, toast, isDrill, erredCharacters]);


  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (nextLesson && nextLessonButtonRef.current) {
          nextLessonButtonRef.current.click();
        } else if (restartButtonRef.current) {
          restartButtonRef.current.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [nextLesson]);


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <Award className="mx-auto h-12 w-12 text-yellow-500" />
        <CardTitle className="text-3xl font-headline">ফলাফল</CardTitle>
        <CardDescription>আপনার টাইপিং টেস্টের সারাংশ নিচে দেওয়া হলো।</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
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
            <StatItem icon={Target} label="সঠিক অক্ষর" value={toBengaliNumber(Math.round(wpm * 5 * (timeElapsed/60) * (accuracy/100) ) )} />
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
                          <DialogHeader className="sr-only">
                            <DialogTitle>সাফল্যের সনদপত্র</DialogTitle>
                          </DialogHeader>
                          <Certificate name={userData?.displayName || 'ব্যবহারকারী'} wpm={wpm} accuracy={accuracy} />
                      </DialogContent>
                  </Dialog>
              )}
              <Button ref={restartButtonRef} onClick={onRestart} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                পুনরায় চেষ্টা করুন
              </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button onClick={() => router.push('/dashboard/lessons')} variant="secondary" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                পাঠক্রমে ফিরে যান
              </Button>
              {nextLesson && !isDrill && (
                  <Button ref={nextLessonButtonRef} onClick={() => router.push(`/dashboard/practice/${nextLesson?.id}`)} className="w-full">
                      পরবর্তী পাঠ <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
              )}
          </div>
        </div>

        {erredCharacters && erredCharacters.length > 0 && (
           <div className="space-y-4">
              <Card>
                <CardHeader>
                    <CardTitle>ভুলপ্রবণ অক্ষর</CardTitle>
                    <CardDescription>এই অক্ষরগুলো টাইপ করতে গিয়ে আপনি সবচেয়ে বেশি ভুল করেছেন।</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={erredCharacters}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="char" />
                            <YAxis allowDecimals={false}/>
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}}/>
                            <Bar dataKey="count" fill="hsl(var(--primary))" name="ভুলের সংখ্যা" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
             </Card>
             {customDrill && (
                <Button onClick={customDrill} className="w-full">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    পর্যালোচনা অনুশীলন করুন
                </Button>
            )}
           </div>
        )}

      </CardContent>
    </Card>
  );
}
