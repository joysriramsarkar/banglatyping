"use client";

/**
 * AiFeedbackCard — logged-in only, opt-in toggle. Calls
 * generatePersonalizedFeedback and renders the Bengali message with
 * loading / error / offline states.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { generatePersonalizedFeedback } from "@/lib/ai/feedback-engine";

interface AiFeedbackCardProps {
  wpm?: number;
  accuracy?: number;
}

export function AiFeedbackCard({ wpm = 0, accuracy = 0 }: AiFeedbackCardProps) {
  const { user } = useAuth();
  const [optIn, setOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function fetchFeedback() {
    setLoading(true);
    setError(null);
    try {
      const res = await generatePersonalizedFeedback({ wpm, accuracy, erredCharacters: [] });
      setMessage(res.message);
      setOffline(res.offline);
    } catch {
      setError("ফিডব্যাক আনা যায়নি — আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-bold">এআই কোচ</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">অনুমতি</span>
            <Switch checked={optIn} onCheckedChange={setOptIn} aria-label="এআই ফিডব্যাক অনুমতি" />
          </div>
        </div>
        <CardDescription className="text-xs">ব্যক্তিগত পরামর্শ পেতে অপ্ট-ইন করুন।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!optIn && (
          <p className="text-xs text-muted-foreground">
            ফিডব্যাক চালু করতে উপরের টগলটি অন করুন।
          </p>
        )}
        {optIn && (
          <Button size="sm" onClick={fetchFeedback} disabled={loading}>
            {loading ? "আনা হচ্ছে…" : "ফিডব্যাক নিন"}
          </Button>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {message && (
          <div className="p-3 rounded-lg bg-secondary/40 border text-sm">
            <p>{message}</p>
            {offline && (
              <p className="text-[11px] text-muted-foreground mt-1">(অফলাইন পরামর্শ)</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AiFeedbackCard;
