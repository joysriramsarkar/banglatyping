import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, RefreshCw, Zap, Target, XCircle, Timer as TimerIcon } from "lucide-react";
import { TypingStats } from "@/lib/types";
import { useState } from "react";
import Certificate from "./certificate";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <div className="flex items-center justify-between py-2 border-b">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
    </div>
    <span className="font-semibold text-lg">{value}</span>
  </div>
);

export default function TestResults({ stats, onRestart }: { stats: TypingStats, onRestart: () => void }) {
  const { wpm, accuracy, errors, timeElapsed } = stats;
  const canGetCertificate = wpm >= 40 && accuracy >= 95;
  const keystrokes = Math.round((wpm * 5 * timeElapsed) / 60);

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
            <p className="text-4xl font-bold text-primary">{wpm}</p>
            <p className="text-xs text-muted-foreground mt-1">কীস্ট্রোক: {keystrokes}</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">নির্ভুলতা</p>
            <p className="text-4xl font-bold text-primary">{accuracy}%</p>
            <p className="text-xs text-muted-foreground mt-1">ভুল: {errors}</p>
          </div>
        </div>

        <div className="space-y-2">
          <StatItem icon={TimerIcon} label="সময়" value={`${timeElapsed} সেকেন্ড`} />
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

      </CardContent>
    </Card>
  );
}
