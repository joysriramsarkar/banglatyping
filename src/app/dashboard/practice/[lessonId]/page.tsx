"use client";

import { useParams, useSearchParams } from 'next/navigation';
import TypingPractice, { VisualTypingDrill, WordDrill } from '@/components/typing-practice';
import LessonPlayer from '@/components/lessons/LessonPlayer';
import { lessons } from '@/lib/lessons';
import { getCurriculumLessonById } from '@/lib/curriculum/curriculum-data';
import { useEffect, useState } from 'react';
import type { Lesson } from '@/lib/types';
import type { CurriculumLesson } from '@/lib/curriculum/types';

export default function PracticePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const lessonId = Array.isArray(params?.lessonId) ? params.lessonId[0] : params?.lessonId;

    const [curriculumLesson, setCurriculumLesson] = useState<CurriculumLesson | null>(null);
    const [legacyLesson, setLegacyLesson] = useState<Lesson | null>(null);
    const [accuracyGoal, setAccuracyGoal] = useState<number | undefined>(undefined);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (lessonId) {
            const curr = getCurriculumLessonById(lessonId);
            if (curr) {
                setCurriculumLesson(curr);
                setLegacyLesson(null);
            } else {
                const foundLesson = lessons.find(l => l.id === lessonId);
                setLegacyLesson(foundLesson || null);
                setCurriculumLesson(null);
            }
            setIsLoaded(true);
        }
        if (searchParams.has('accuracy')) {
            setAccuracyGoal(parseInt(searchParams.get('accuracy') as string));
        } else {
            setAccuracyGoal(95); // Default accuracy for word/paragraph drills
        }
    }, [lessonId, searchParams]);

    if (!isLoaded) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold">পাঠ লোড হচ্ছে...</h1>
                <p className="text-muted-foreground mt-2">অনুগ্রহ করে অপেক্ষা করুন।</p>
            </div>
        );
    }

    // Render modern structured Curriculum Lesson if matched
    if (curriculumLesson) {
        return (
            <div className="w-full max-w-7xl mx-auto py-2 sm:py-4">
                <LessonPlayer lesson={curriculumLesson} />
            </div>
        );
    }

    // Render Legacy Lesson if matched
    if (legacyLesson) {
        return (
            <div className="w-full max-w-7xl mx-auto">
                <div className="text-center mb-6 md:mb-8">
                    <h1 className="text-3xl font-bold font-headline">{legacyLesson.title}</h1>
                    <p className="text-muted-foreground">
                        {legacyLesson.level === 'Beginner' ? 'শিক্ষানবিশ' : legacyLesson.level === 'Intermediate' ? 'মাধ্যমিক' : 'উন্নত'} স্তরের পাঠ
                    </p>
                </div>
                {legacyLesson.text && (
                     <TypingPractice 
                        textToType={legacyLesson.text} 
                        lessonId={legacyLesson.id}
                        accuracyGoal={accuracyGoal}
                    />
                )}
                {legacyLesson.drills && !legacyLesson.isWordDrill && (
                    <VisualTypingDrill drills={legacyLesson.drills} lessonId={legacyLesson.id} accuracyGoal={accuracyGoal} />
                )}
                {legacyLesson.drills && legacyLesson.isWordDrill && (
                    <WordDrill drills={legacyLesson.drills} lessonId={legacyLesson.id} accuracyGoal={accuracyGoal} />
                )}
            </div>
        );
    }

    return (
        <div className="text-center py-12">
            <h1 className="text-2xl font-bold">পাঠ খুঁজে পাওয়া যায়নি</h1>
            <p className="text-muted-foreground mt-2">এই আইডি সম্পর্কিত কোনো পাঠ বিদ্যমান নেই।</p>
        </div>
    );
}
