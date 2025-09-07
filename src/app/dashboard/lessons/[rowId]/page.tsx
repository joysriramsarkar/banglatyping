
"use client";

import { useParams, useRouter } from 'next/navigation';
import { lessons, rowCategories } from '@/lib/lessons';
import { Button } from '@/components/ui/button';
import { PlayCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Lesson } from '@/lib/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';


const accuracyLevels = [
    { value: 90, label: 'সহজ', description: 'নতুনদের জন্য প্রস্তাবিত' },
    { value: 95, label: 'মাঝারি', description: 'অনুশীলনের জন্য আদর্শ' },
    { value: 98, label: 'দক্ষ', description: 'বিশেষজ্ঞদের জন্য' }
];

const LessonListItem = ({ lesson, onSelect }: { lesson: Lesson, onSelect: (lessonId: string) => void }) => (
    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
        <div className="flex items-center gap-4">
            <PlayCircle className="h-6 w-6 text-muted-foreground" />
            <div>
                <p className="font-medium">{lesson.title}</p>
            </div>
        </div>
        <Button onClick={() => onSelect(lesson.id)}>
            শুরু করুন
        </Button>
    </div>
);

export default function RowDrillPage() {
    const params = useParams();
    const router = useRouter();
    const { rowId } = params;

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [selectedAccuracy, setSelectedAccuracy] = useState<number>(95);

    const categoryId = Array.isArray(rowId) ? rowId[0] : rowId;

    const category = rowCategories.find(c => c.id === categoryId);
    const rowLessons = lessons.filter(l => l.row === categoryId);

    const handleStartDrill = () => {
        if (selectedLesson) {
            router.push(`/dashboard/practice/${selectedLesson.id}?accuracy=${selectedAccuracy}`);
        }
    };

    if (selectedLesson) {
        return (
             <div className="flex items-center justify-center py-12">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-headline"> নির্ভুলতার লক্ষ্য নির্ধারণ করুন</CardTitle>
                        <CardDescription>"{selectedLesson.title}" অনুশীলনের জন্য আপনার লক্ষ্যমাত্রা নির্বাচন করুন।</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div>
                            <RadioGroup
                            value={String(selectedAccuracy)}
                            onValueChange={(value) => setSelectedAccuracy(parseInt(value))}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                            >
                            {accuracyLevels.map(level => (
                                <div key={level.value}>
                                <RadioGroupItem value={String(level.value)} id={`accuracy-${level.value}`} className="sr-only" />
                                <Label
                                    htmlFor={`accuracy-${level.value}`}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent",
                                        selectedAccuracy === level.value && "border-primary ring-2 ring-primary"
                                    )}
                                >
                                    <span className="text-xl font-bold">{level.label}</span>
                                    <span className="text-sm text-muted-foreground">{level.value}%</span>
                                </Label>
                                </div>
                            ))}
                            </RadioGroup>
                        </div>
                         <div className="flex flex-col gap-2">
                            <Button onClick={handleStartDrill} size="lg" className="w-full">
                                অনুশীলন শুরু করুন
                            </Button>
                            <Button onClick={() => setSelectedLesson(null)} variant="outline" className="w-full">
                                ফিরে যান
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!category) {
        return <div className="p-4">ক্যাটাগরি খুঁজে পাওয়া যায়নি।</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/lessons')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    সকল পাঠে ফিরে যান
                </Button>
                <h1 className="text-3xl font-bold font-headline">{category.name}</h1>
                <p className="text-muted-foreground">{category.description}</p>
            </div>
            <div className="space-y-4">
                {rowLessons.length > 0 ? (
                    rowLessons.map((lesson) => (
                       <LessonListItem key={lesson.id} lesson={lesson} onSelect={() => setSelectedLesson(lesson)} />
                    ))
                ) : (
                    <p>এই বিভাগে কোনো পাঠ পাওয়া যায়নি।</p>
                )}
            </div>
        </div>
    );
}

    