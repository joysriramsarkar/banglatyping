
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { toBengaliNumber } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

export const DrillProgress = ({ wpmHistory, timeLeft, currentWpm, currentAccuracy }: {
    wpmHistory: { time: number, wpm: number }[];
    timeLeft: number;
    currentWpm: number;
    currentAccuracy: number;
}) => (
    <Card className="h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart2 className="h-5 w-5" />
                আপনার প্রগতি
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                    <p className="text-xs text-muted-foreground">সময় বাকি</p>
                    <p className="text-2xl font-bold font-mono">{toBengaliNumber(new Date(Math.max(0, timeLeft) * 1000).toISOString().substr(14, 5))}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">গতি (WPM)</p>
                    <p className="text-2xl font-bold">{toBengaliNumber(currentWpm)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">নির্ভুলতা</p>
                    <p className="text-2xl font-bold">{toBengaliNumber(currentAccuracy)}%</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wpmHistory} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" unit="s" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(tick) => toBengaliNumber(tick)} />
                    <YAxis domain={[0, 60]} allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(tick) => toBengaliNumber(tick)} />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                        labelFormatter={(label) => `${toBengaliNumber(label)} সেকেন্ডে`}
                        formatter={(value: number) => [toBengaliNumber(value), 'গতি (WPM)']}
                    />
                    <Bar dataKey="wpm" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="গতি (WPM)">
                         <LabelList dataKey="wpm" position="top" fontSize={12} formatter={(value: number) => toBengaliNumber(value)} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);
