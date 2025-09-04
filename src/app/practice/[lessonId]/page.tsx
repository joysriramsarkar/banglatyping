"use client";

import { useParams } from 'next/navigation';
import TypingPractice, { VisualTypingDrill } from '@/components/typing-practice';
import { lessons } from '@/lib/lessons';
import { useEffect, useState } from 'react';
import type { Lesson } from '@/lib/types';

export default function PracticePage() {
    const params = useParams();
    const { lessonId } = params;
    const [lesson, setLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        if (lessonId) {
            const foundLesson = lessons.find(l => l.id === lessonId);
            setLesson(foundLesson || null);
        }
    }, [lessonId]);

    if (!lesson) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">পাঠ লোড হচ্ছে...</h1>
                <p className="text-muted-foreground">অথবা এই নামে কোনো পাঠ খুঁজে পাওয়া যায়নি।</p>
            </div>
        );
    }
    
    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-headline">{lesson.title}</h1>
                <p className="text-muted-foreground">{lesson.level} স্তরের পাঠ</p>
            </div>
            {lesson.text && <TypingPractice textToType={lesson.text} lessonId={lesson.id} />}
            {lesson.drills && <VisualTypingDrill drills={lesson.drills} lessonId={lesson.id} />}
        </div>
    );
}
