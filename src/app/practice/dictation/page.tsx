"use client";

/**
 * Dictation practice — uses DictationEngine (SpeechSynthesis bn-BD):
 * word list, speed control, play, input check, score.
 */

import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DictationEngine } from "@/lib/voice/dictation-engine";

const WORDS = ["জল", "ফল", "কলম", "বই", "পাখি", "নদী", "আকাশ", "বন্ধু", "বিদ্যালয়", "কম্পিউটার"];

export default function DictationPage() {
  const engineRef = useRef<DictationEngine | null>(null);
  if (!engineRef.current) engineRef.current = new DictationEngine();
  const engine = engineRef.current;

  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(0.85);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const supported = useMemo(() => engine.isSupported(), [engine]);
  const current = WORDS[index % WORDS.length];

  function play() {
    setResult(null);
    engine.speakWord(current, { rate });
  }

  function check() {
    const correct = input.trim() === current;
    setAttempts((a) => a + 1);
    if (correct) {
      setScore((s) => s + 1);
      setResult("সঠিক! 🎉");
      setIndex((i) => i + 1);
      setInput("");
    } else {
      setResult(`ভুল — সঠিক উত্তর: ${current}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">শ্রুতলিপি অনুশীলন</h1>
        <p className="text-sm text-muted-foreground">শুনে শুনে টাইপ করুন।</p>
      </div>
      {!supported && (
        <p className="text-sm text-destructive">
          আপনার ব্রাউজারে স্পিচ সিন্থেসিস সমর্থিত নয়।
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>
            শব্দ {index + 1} / {WORDS.length} — স্কোর: {score}/{attempts}
          </CardTitle>
          <CardDescription>গতি নিয়ন্ত্রণ করে শুনুন, তারপর লিখুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">গতি: {rate.toFixed(2)}</span>
            <Slider
              value={[rate]}
              min={0.4}
              max={1.2}
              step={0.05}
              onValueChange={(v) => setRate(v[0] ?? 0.85)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={play} disabled={!supported}>
              ▶ শুনুন
            </Button>
            <Button variant="outline" onClick={() => engine.stop()}>
              ⏹ থামান
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="যা শুনলেন লিখুন…"
              onKeyDown={(e) => {
                if (e.key === "Enter") check();
              }}
            />
            <Button onClick={check}>যাচাই</Button>
          </div>
          {result && <p className="text-sm font-semibold">{result}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
