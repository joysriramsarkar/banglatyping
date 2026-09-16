"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart2, CheckCircle2, Keyboard, Flame } from "lucide-react";
import { toBengaliNumber } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface DrillProgressProps {
    wpmHistory: { time: number, wpm: number }[];
    timeLeft: number;
    currentWpm: number;
    currentAccuracy: number;
    currentDrillIndex?: number;
    totalDrills?: number;
    totalCharsTyped?: number;
    totalErrors?: number;
}

export const DrillProgress: React.FC<DrillProgressProps> = ({
    wpmHistory,
    timeLeft,
    currentWpm,
    currentAccuracy,
    currentDrillIndex = 0,
    totalDrills = 1,
    totalCharsTyped = 0,
    totalErrors = 0,
}) => {
    const progressPercent = Math.min(100, Math.round((currentDrillIndex / Math.max(1, totalDrills)) * 100));

    return (
        <Card className="h-full border shadow-xs">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <span className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        আপনার প্রগতি
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {toBengaliNumber(progressPercent)}% সম্পন্ন
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Visual Progress Bar */}
                <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border">
                    <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            আইটেম সম্পন্ন
                        </span>
                        <span className="font-bold font-headline text-foreground">
                            {toBengaliNumber(currentDrillIndex)} / {toBengaliNumber(totalDrills)}
                        </span>
                    </div>
                    <Progress value={progressPercent} className="h-2.5 bg-muted" />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1">
                            <Keyboard className="h-3 w-3" />
                            মোট অক্ষর: <strong className="text-foreground">{toBengaliNumber(totalCharsTyped)}</strong>
                        </span>
                        <span>
                            ভুল: <strong className={totalErrors > 0 ? "text-red-500" : "text-green-600"}>{toBengaliNumber(totalErrors)}</strong>
                        </span>
                    </div>
                </div>

                {/* Stat Counters Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-secondary/30">
                        <p className="text-[11px] text-muted-foreground">সময় বাকি</p>
                        <p className="text-xl font-bold font-mono text-foreground mt-0.5">
                            {toBengaliNumber(new Date(Math.max(0, timeLeft) * 1000).toISOString().substr(14, 5))}
                        </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-secondary/30">
                        <p className="text-[11px] text-muted-foreground">গতি (WPM)</p>
                        <p className="text-xl font-bold text-primary mt-0.5">
                            {toBengaliNumber(currentWpm)}
                        </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-secondary/30">
                        <p className="text-[11px] text-muted-foreground">নির্ভুলতা</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">
                            {toBengaliNumber(currentAccuracy)}%
                        </p>
                    </div>
                </div>

                {/* WPM Velocity Chart */}
                <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        গতি বিশ্লেষণ গ্রাফ
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={wpmHistory} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="time" unit="s" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => toBengaliNumber(tick)} />
                            <YAxis domain={[0, 60]} allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => toBengaliNumber(tick)} />
                            <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                    fontSize: "12px",
                                }}
                                labelFormatter={(label) => `${toBengaliNumber(label)} সেকেন্ডে`}
                                formatter={(value: number) => [toBengaliNumber(value), 'গতি (WPM)']}
                            />
                            <Bar dataKey="wpm" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="গতি (WPM)">
                                <LabelList dataKey="wpm" position="top" fontSize={10} formatter={(value: number) => toBengaliNumber(value)} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
