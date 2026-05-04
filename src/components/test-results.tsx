
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, RefreshCw, Target, XCircle, Timer as TimerIcon, Home, ArrowRight, BrainCircuit } from "lucide-react";
import { TypingStats, Lesson, ErredCharacter } from "@/lib/types";
import { useEffect, useRef } from "react";
import Certificate from "./certificate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { lessons } from "@/lib/lessons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
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

export default function TestResults({ stats, onRestart, lessonId, isDrill = false, customDrill, accuracyGoal = 95 }: { stats: TypingStats, onRestart: () => void, lessonId?: string, isDrill?: boolean, customDrill?: () => void, accuracyGoal?: number }) {
  const { wpm, accuracy, errors, timeElapsed, erredCharacters = [] } = stats;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const hasSavedResult = useRef(false);

  const passedDrill = isDrill && wpm >= 25 && accuracy >= accuracyGoal;
  const canGetCertificate = !isDrill && wpm >= 40 && accuracy >= 95;
  
  let nextLesson: Lesson | null = null;
  if(lessonId) {
    const currentLessonIndex = lessons.findIndex(l => l.id === lessonId);
    if(currentLessonIndex !== -1 && currentLessonIndex < lessons.length - 1) {
        nextLesson = lessons[currentLessonIndex + 1];
    }
  }
  
  const showNextLessonButton = passedDrill && nextLesson;

  useEffect(() => {
    const saveResults = async () => {
      if (user && !hasSavedResult.current) {
        hasSavedResult.current = true;
        try {
          const response = await fetch('/api/user-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              lessonId: lessonId || 'typing-test',
              wpm,
              accuracy,
              errors,
              timeElapsed,
              erredCharacters,
            }),
          });

          if (!response.ok) throw new Error('Failed to save');

          toast({ title: "সাফল্য!", description: "আপনার ফলাফল সংরক্ষণ করা হয়েছে।" });
        } catch (error) {
          console.error("Error saving results: ", error);
          toast({ variant: "destructive", title: "ত্রুটি", description: "ফলাফল সংরক্ষণ করা যায়নি।" });
          hasSavedResult.current = false;
        }
      }
    };

    if (stats.timeElapsed > 0) {
        saveResults();
    }
  }, [user, stats, lessonId, toast]);


  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (actionButtonRef.current) {
          actionButtonRef.current.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <Award className="mx-auto h-12 w-12 text-yellow-500" />
        <CardTitle className="text-3xl font-headline">{isDrill ? (passedDrill ? 'অনুশীলন সফল!' : 'অনুশীলন ব্যর্থ') : 'ফলাফল'}</CardTitle>
        <CardDescription>{isDrill ? `আপনার লক্ষ্য ছিল ${toBengaliNumber(accuracyGoal)}% নির্ভুলতা।` : 'আপনার টাইপিং টেস্টের সারাংশ নিচে দেওয়া হলো।'}</CardDescription>
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
                          <Certificate name={user?.user_metadata?.display_name || 'ব্যবহারকারী'} wpm={wpm} accuracy={accuracy} />
                      </DialogContent>
                  </Dialog>
              )}
              
              {showNextLessonButton ? (
                  <Button ref={actionButtonRef} onClick={() => router.push(`/dashboard/practice/${nextLesson?.id}`)} className="w-full">
                      পরবর্তী পাঠ <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
              ) : (
                   <Button ref={actionButtonRef} onClick={onRestart} variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    পুনরায় চেষ্টা করুন
                  </Button>
              )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button onClick={() => router.push('/dashboard/lessons')} variant="secondary" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                পাঠক্রমে ফিরে যান
              </Button>
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
                            <Tooltip 
                                cursor={{fill: 'hsl(var(--muted))'}}
                                formatter={(value: number) => [toBengaliNumber(value), 'ভুলের সংখ্যা']}
                            />
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
