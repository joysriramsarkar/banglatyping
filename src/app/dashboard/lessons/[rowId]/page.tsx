"use client";

import { useParams, useRouter } from 'next/navigation';
import { lessons, rowCategories } from '@/lib/lessons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, ArrowLeft, Sparkles } from 'lucide-react';
import type { Lesson } from '@/lib/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn, toBengaliNumber } from '@/lib/utils';

const accuracyLevels = [
    { value: 90, label: 'সহজ', description: 'নতুনদের জন্য প্রস্তাবিত' },
    { value: 95, label: 'মাঝারি', description: 'অনুশীলনের জন্য আদর্শ' },
    { value: 98, label: 'দক্ষ', description: 'বিশেষজ্ঞদের জন্য' }
];

const LessonListItem = ({ lesson, onSelect }: { lesson: Lesson, onSelect: (lessonId: string) => void }) => {
    const isWord = lesson.isWordDrill || !!lesson.text;
    const itemCount = lesson.drills?.length || (lesson.text ? lesson.text.split(' ').length : 0);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border rounded-xl hover:border-primary/50 transition-all shadow-xs gap-3">
            <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                    <PlayCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm sm:text-base text-foreground font-headline">{lesson.title}</p>
                        <Badge variant="outline" className="text-[11px]">
                            {lesson.level === 'Beginner' ? 'শিক্ষানবিশ' : lesson.level === 'Intermediate' ? 'মাধ্যমিক' : 'উন্নত'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{isWord ? 'শব্দ/টেক্সট ড্রিল' : 'ক্যারেক্টার ড্রিল'}</span>
                        {itemCount > 0 && (
                            <>
                                <span>•</span>
                                <span>{toBengaliNumber(itemCount)}টি {isWord ? 'শব্দ' : 'স্টেপ'}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Button onClick={() => onSelect(lesson.id)} className="font-semibold sm:shrink-0">
                অনুশীলন শুরু করুন
            </Button>
        </div>
    );
};

export default function RowDrillPage() {
    const params = useParams();
    const router = useRouter();
    const { rowId } = params;

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    const categoryId = Array.isArray(rowId) ? rowId[0] : rowId;

    const category = rowCategories.find(c => c.id === categoryId);
    const rowLessons = lessons.filter(l => l.row === categoryId);

    const handleStartDrill = (lessonId: string, accuracy: number) => {
        router.push(`/dashboard/practice/${lessonId}?accuracy=${accuracy}`);
    };

    if (selectedLesson) {
        return (
             <div className="flex items-center justify-center py-12">
                <Card className="w-full max-w-lg border shadow-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto p-3 bg-primary/10 text-primary rounded-full w-fit mb-2">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl font-headline">নির্ভুলতার লক্ষ্য নির্ধারণ করুন</CardTitle>
                        <CardDescription>&quot;{selectedLesson.title}&quot; অনুশীলনের জন্য আপনার লক্ষ্যমাত্রা নির্বাচন করুন।</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {accuracyLevels.map(level => (
                                <div key={level.value}
                                     onClick={() => handleStartDrill(selectedLesson.id, level.value)}
                                     className={cn(
                                        "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all hover:bg-accent hover:border-primary hover:shadow-xs text-center"
                                     )}
                                >
                                    <span className="text-lg font-bold">{level.label}</span>
                                    <span className="text-sm font-semibold text-primary mt-0.5">{toBengaliNumber(level.value)}%</span>
                                    <span className="text-[11px] text-muted-foreground mt-1 leading-tight">{level.description}</span>
                                </div>
                            ))}
                        </div>
                         <div className="flex flex-col gap-2 pt-2">
                            <Button onClick={() => setSelectedLesson(null)} variant="outline" className="w-full">
                                পাঠ তালিকায় ফিরে যান
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!category) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-muted-foreground">ক্যাটাগরি খুঁজে পাওয়া যায়নি।</p>
                <Button onClick={() => router.push('/dashboard/lessons')}>সকল পাঠে ফিরে যান</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/lessons')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    সকল পাঠে ফিরে যান
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-headline">{category.name}</h1>
                        <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                    </div>
                    <Badge variant="secondary" className="w-fit text-xs font-semibold">
                        মোট {toBengaliNumber(rowLessons.length)}টি পাঠ
                    </Badge>
                </div>
            </div>

            <div className="space-y-3">
                {rowLessons.length > 0 ? (
                    rowLessons.map((lesson) => (
                       <LessonListItem key={lesson.id} lesson={lesson} onSelect={() => setSelectedLesson(lesson)} />
                    ))
                ) : (
                    <div className="text-center py-12 border rounded-xl bg-card">
                        <p className="text-muted-foreground text-sm">এই বিভাগে বর্তমানে কোনো পাঠ নেই।</p>
                    </div>
                )}
            </div>
        </div>
    );
}
