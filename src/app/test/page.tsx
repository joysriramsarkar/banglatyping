
"use client";

import { useState } from "react";
import TypingPractice from "@/components/typing-practice";
import { practiceParagraphs } from "@/lib/lessons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Timer, FileText, CheckCircle, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";


const timeOptions = [
    { value: 1, label: '১' },
    { value: 2, label: '২' },
    { value: 5, label: '৫' },
    { value: 10, label: '১০' }
];

const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export default function TestPage() {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const router = useRouter();

  const startTest = () => {
    if (selectedParagraph && selectedTime) {
      setTestStarted(true);
    }
  };

  if (testStarted && selectedParagraph && selectedTime) {
    return (
      <div>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-headline">টাইপিং টেস্ট</h1>
            <p className="text-muted-foreground">{toBengaliNumber(selectedTime)} মিনিটের পরীক্ষা</p>
        </div>
        <TypingPractice textToType={selectedParagraph} timeLimit={selectedTime} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <Timer className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-headline">টাইপিং টেস্ট</CardTitle>
          <CardDescription>আপনার গতি এবং নির্ভুলতা পরীক্ষা করুন। একটি অনুচ্ছেদ ও সময় নির্বাচন করে শুরু করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div>
            <Label className="text-base font-medium mb-4 block text-center">১. একটি অনুচ্ছেদ নির্বাচন করুন</Label>
            <ScrollArea className="h-48 w-full rounded-md border">
                 <div className="space-y-2 p-4">
                    {practiceParagraphs.map((p, index) => (
                        <div key={index}
                             onClick={() => setSelectedParagraph(p)}
                             className={cn("p-3 border rounded-lg cursor-pointer transition-all relative",
                                selectedParagraph === p ? "border-primary ring-2 ring-primary" : "hover:bg-accent"
                             )}
                        >
                           <p className="text-sm text-muted-foreground truncate">{p}</p>
                           {selectedParagraph === p && <CheckCircle className="h-5 w-5 text-primary absolute top-2 right-2"/>}
                        </div>
                    ))}
                 </div>
            </ScrollArea>
          </div>
          
          <div>
            <Label className="text-base font-medium mb-4 block text-center">২. সময়কাল নির্বাচন করুন (মিনিট)</Label>
            <RadioGroup
              value={String(selectedTime)}
              onValueChange={(value) => setSelectedTime(parseInt(value))}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {timeOptions.map(time => (
                <div key={time.value}>
                  <RadioGroupItem value={String(time.value)} id={`time-${time.value}`} className="sr-only" />
                  <Label
                    htmlFor={`time-${time.value}`}
                    className={cn(
                        "flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent",
                        "data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary"
                    )}
                  >
                    <span className="text-2xl font-bold">{time.label}</span>
                    <span className="text-muted-foreground">মিনিট</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={startTest} size="lg" className="w-full" disabled={!selectedParagraph || !selectedTime}>
              টেস্ট শুরু করুন
            </Button>
             <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              হোমে ফিরে যান
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
