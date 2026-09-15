"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  Award,
  Sparkles,
  ChevronRight,
  BookOpen,
  Zap,
  Clock,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { CURRICULUM_LEVELS } from "@/lib/curriculum/curriculum-data";
import {
  getStoredCurriculumState,
  isLessonUnlocked,
  calculateCurriculumProgress,
} from "@/lib/curriculum/engine";
import type { UserCurriculumState } from "@/lib/curriculum/types";
import { rowCategories } from "@/lib/lessons";
import { toBengaliNumber } from "@/lib/utils";

export default function LessonsPage() {
  const [curriculumState, setCurriculumState] = useState<UserCurriculumState | null>(null);
  const [activeTab, setActiveTab] = useState<string>("curriculum");

  useEffect(() => {
    setCurriculumState(getStoredCurriculumState());
  }, []);

  const progressInfo = curriculumState
    ? calculateCurriculumProgress(curriculumState)
    : { completedCount: 0, totalCount: 0, percentage: 0, masteredCount: 0 };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Overall Progress Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> পূর্ণাঙ্গ বাংলা টাইপিং পাঠক্রম (১৩টি লেভেল)
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-foreground">
              টাইপিং পাঠক্রম ও দক্ষতা মানচিত্র
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              হাতের সঠিক অবস্থান থেকে শুরু করে স্বরবর্ণ, ব্যঞ্জনবর্ণ, কার, হসন্ত, যুক্তাক্ষর এবং চূড়ান্ত নিয়োগ পরীক্ষা—ধাপে ধাপে টাইপিংয়ে মাস্টার হন।
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="bg-card/90 backdrop-blur border rounded-xl p-5 min-w-[260px] space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-muted-foreground">সার্বিক অগ্রগতি</span>
              <span className="text-primary font-bold">{toBengaliNumber(progressInfo.percentage)}%</span>
            </div>
            <Progress value={progressInfo.percentage} className="h-2.5" />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>সম্পন্ন: {toBengaliNumber(progressInfo.completedCount)}/{toBengaliNumber(progressInfo.totalCount)}</span>
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Award className="h-3.5 w-3.5" /> মাস্টার্ড: {toBengaliNumber(progressInfo.masteredCount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Full Structured Curriculum vs Classic Row Drills */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="curriculum" className="gap-2">
              <BookOpen className="h-4 w-4" /> মূল পাঠক্রম (Levels 0–12)
            </TabsTrigger>
            <TabsTrigger value="row-drills" className="gap-2">
              <Zap className="h-4 w-4" /> রো-ভিত্তিক ড্রিল
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: FULL 13-LEVEL CURRICULUM */}
        <TabsContent value="curriculum" className="space-y-6">
          <div className="space-y-4">
            {CURRICULUM_LEVELS.map((level) => {
              const allLevelLessons = level.modules.flatMap((m) => m.lessons);
              const completedLevelCount = allLevelLessons.filter(
                (l) => curriculumState?.completedLessons[l.id]?.completed
              ).length;
              const isLevelFullyCompleted = completedLevelCount === allLevelLessons.length;

              return (
                <Card key={level.level} className="border transition-all hover:border-primary/40 shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="text-3xl select-none p-2 bg-background rounded-xl border shadow-xs">
                          {level.badge}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-semibold">
                              লেভেল {toBengaliNumber(level.level)}
                            </Badge>
                            {isLevelFullyCompleted && (
                              <Badge className="bg-green-600 text-white text-xs gap-1">
                                <CheckCircle2 className="h-3 w-3" /> সম্পূর্ণ
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl font-bold font-headline mt-1">
                            {level.title}
                          </CardTitle>
                          <CardDescription className="text-sm mt-0.5">
                            {level.description}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          সম্পন্ন: {toBengaliNumber(completedLevelCount)}/{toBengaliNumber(allLevelLessons.length)}
                        </span>
                        <div className="w-24 mt-1">
                          <Progress
                            value={allLevelLessons.length > 0 ? (completedLevelCount / allLevelLessons.length) * 100 : 0}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-6">
                    {level.modules.map((module) => (
                      <div key={module.id} className="space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b">
                          <h3 className="font-semibold text-sm text-foreground">
                            {module.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            ({module.description})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {module.lessons.map((lesson) => {
                            const isUnlocked = curriculumState ? isLessonUnlocked(lesson.id, curriculumState) : lesson.level === 0;
                            const progress = curriculumState?.completedLessons[lesson.id];
                            const isCompleted = progress?.completed;
                            const isMastered = progress?.mastered;

                            return (
                              <div
                                key={lesson.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                  isCompleted
                                    ? "bg-secondary/40 border-green-500/30"
                                    : isUnlocked
                                    ? "bg-card hover:bg-muted/40 hover:border-primary/50"
                                    : "bg-muted/20 opacity-60 border-dashed"
                                }`}
                              >
                                <div className="space-y-1 pr-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm line-clamp-1">{lesson.title}</h4>
                                    {isMastered && (
                                      <Award className="h-4 w-4 text-amber-500 shrink-0" />
                                    )}
                                    {isCompleted && !isMastered && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {lesson.description}
                                  </p>
                                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> {toBengaliNumber(lesson.estimatedMinutes)} মি.
                                    </span>
                                    <span>•</span>
                                    <span>{toBengaliNumber(lesson.sections.length)}টি ধাপ</span>
                                    {progress && progress.bestWpm > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="font-medium text-foreground">
                                          সেরা: {toBengaliNumber(progress.bestWpm)} WPM ({toBengaliNumber(progress.bestAccuracy)}%)
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 ml-2">
                                  {isUnlocked ? (
                                    <Button asChild size="sm" variant={isCompleted ? "outline" : "default"}>
                                      <Link href={`/dashboard/practice/${lesson.id}`}>
                                        {isCompleted ? (
                                          <>
                                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> পুনরায়
                                          </>
                                        ) : (
                                          <>
                                            <PlayCircle className="h-3.5 w-3.5 mr-1" /> শুরু
                                          </>
                                        )}
                                      </Link>
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="ghost" disabled className="text-muted-foreground">
                                      <Lock className="h-3.5 w-3.5 mr-1" /> লকড
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: CLASSIC ROW DRILLS & LEGACY LESSONS */}
        <TabsContent value="row-drills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>কীবোর্ড রো ড্রিল ও বিশেষ প্র্যাকটিস</CardTitle>
              <CardDescription>
                হোম রো, আপার রো, বটম রো এবং নম্বর রো আলাদাভাবে নিবিড় অনুশীলন করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rowCategories.map((category) => (
                  <Link
                    href={`/dashboard/lessons/${category.id}`}
                    key={category.id}
                    className="block border rounded-xl p-5 hover:bg-accent/60 transition-all hover:border-primary/50 group shadow-xs"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
