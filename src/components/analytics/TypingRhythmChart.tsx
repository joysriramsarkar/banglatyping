"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { toBengaliNumber } from "@/lib/utils";
import { Activity } from "lucide-react";

interface RhythmInterval {
  interval: string;
  wpm: number;
  accuracy: number;
}

interface TypingRhythmChartProps {
  data?: RhythmInterval[];
  className?: string;
}

// Sample realistic velocity rhythm data
const SAMPLE_RHYTHM_DATA: RhythmInterval[] = [
  { interval: "৫ সে.", wpm: 28, accuracy: 100 },
  { interval: "১০ সে.", wpm: 34, accuracy: 96 },
  { interval: "১৫ সে.", wpm: 42, accuracy: 98 },
  { interval: "২০ সে.", wpm: 39, accuracy: 92 },
  { interval: "২৫ সে.", wpm: 45, accuracy: 100 },
  { interval: "৩০ সে.", wpm: 48, accuracy: 96 },
  { interval: "৩৫ সে.", wpm: 51, accuracy: 98 },
  { interval: "৪০ সে.", wpm: 47, accuracy: 95 },
  { interval: "৪৫ সে.", wpm: 53, accuracy: 100 },
  { interval: "৫০ সে.", wpm: 50, accuracy: 97 },
];

export default function TypingRhythmChart({ data = SAMPLE_RHYTHM_DATA, className }: TypingRhythmChartProps) {
  return (
    <Card className={`border shadow-sm ${className || ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base sm:text-lg font-bold font-headline">
              টাইপিং ছন্দ ও গতিধারা (Rhythm & Velocity)
            </CardTitle>
            <CardDescription className="text-xs">
              ৫-সেকেন্ড ব্যবধানে আপনার গতির ওঠা-নামা এবং স্থিরতা (Consistency) গ্রাফ।
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="interval" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[0, 'dataMax + 10']} />
            <YAxis yAxisId="right" orientation="right" domain={[70, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
              formatter={(val: number, name: string) => [
                toBengaliNumber(val) + (name === "নির্ভুলতা" ? "%" : " WPM"),
                name,
              ]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wpm"
              name="গতি (WPM)"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              name="নির্ভুলতা"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
