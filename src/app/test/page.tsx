"use client";

import { useState } from "react";
import TypingPractice from "@/components/typing-practice";
import { practiceParagraphs } from "@/lib/lessons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Timer } from "lucide-react";

const timeOptions = [1, 2, 5, 10];

export default function TestPage() {
  const [selectedTime, setSelectedTime] = useState(1);
  const [testStarted, setTestStarted] = useState(false);
  const [paragraph, setParagraph] = useState("");

  const startTest = () => {
    const randomParagraph = practiceParagraphs[Math.floor(Math.random() * practiceParagraphs.length)];
    setParagraph(randomParagraph);
    setTestStarted(true);
  };

  if (testStarted) {
    return (
      <div>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-headline">টাইপিং টেস্ট</h1>
            <p className="text-muted-foreground">{selectedTime} মিনিটের পরীক্ষা</p>
        </div>
        <TypingPractice textToType={paragraph} timeLimit={selectedTime} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Timer className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-headline">টাইপিং টেস্ট</CardTitle>
          <CardDescription>আপনার গতি এবং নির্ভুলতা পরীক্ষা করুন। একটি সময় নির্বাচন করে শুরু করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-4 block text-center">সময়কাল নির্বাচন করুন (মিনিট)</Label>
            <RadioGroup
              defaultValue="1"
              onValueChange={(value) => setSelectedTime(parseInt(value))}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {timeOptions.map(time => (
                <Label
                  key={time}
                  htmlFor={`time-${time}`}
                  className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-accent has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary"
                >
                  <RadioGroupItem value={String(time)} id={`time-${time}`} className="sr-only" />
                  <span className="text-2xl font-bold">{time}</span>
                  <span className="text-muted-foreground">মিনিট</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          <Button onClick={startTest} size="lg" className="w-full">
            টেস্ট শুরু করুন
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
