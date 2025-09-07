

"use client";

import { useParams, useSearchParams } from 'next/navigation';
import TypingPractice, { VisualTypingDrill } from '@/components/typing-practice';
import { lessons } from '@/lib/lessons';
import { useEffect, useState } from 'react';
import type { Lesson } from '@/lib/types';

export default function PracticePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { lessonId } = params;
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [accuracyGoal, setAccuracyGoal] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (lessonId) {
            const foundLesson = lessons.find(l => l.id === lessonId);
            setLesson(foundLesson || null);
        }
        if (searchParams.has('accuracy')) {
            setAccuracyGoal(parseInt(searchParams.get('accuracy') as string));
        } else {
            setAccuracyGoal(95); // Default accuracy for word/paragraph drills
        }
    }, [lessonId, searchParams]);

    if (!lesson) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">পাঠ লোড হচ্ছে...</h1>
                <p className="text-muted-foreground">অথবা এই নামে কোনো পাঠ খুঁজে পাওয়া যায়নি।</p>
            </div>
        );
    }
    
    // Determine if the lesson is a word drill based on its ID
    const isWordDrill = lesson.id.includes('-word-drill');

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-headline">{lesson.title}</h1>
                <p className="text-muted-foreground">{lesson.level} স্তরের পাঠ</p>
            </div>
            {lesson.text && (
                 <TypingPractice 
                    textToType={lesson.text} 
                    lessonId={lesson.id} 
                    isPracticeDrill={isWordDrill}
                    accuracyGoal={accuracyGoal}
                />
            )}
            {lesson.drills && <VisualTypingDrill drills={lesson.drills} lessonId={lesson.id} accuracyGoal={accuracyGoal} />}
        </div>
    );
}

    
