
"use client";

import { useParams, useRouter } from 'next/navigation';
import { lessons, rowCategories } from '@/lib/lessons';
import { Button } from '@/components/ui/button';
import { PlayCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Lesson } from '@/lib/types';

const LessonListItem = ({ lesson }: { lesson: Lesson }) => (
    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
        <div className="flex items-center gap-4">
            <PlayCircle className="h-6 w-6 text-muted-foreground" />
            <div>
                <p className="font-medium">{lesson.title}</p>
            </div>
        </div>
        <Button asChild>
            <Link href={`/dashboard/practice/${lesson.id}`}>
                শুরু করুন
            </Link>
        </Button>
    </div>
);

export default function RowDrillPage() {
    const params = useParams();
    const router = useRouter();
    const { rowId } = params;

    const categoryId = Array.isArray(rowId) ? rowId[0] : rowId;

    const category = rowCategories.find(c => c.id === categoryId);
    const rowLessons = lessons.filter(l => l.row === categoryId);

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
                       <LessonListItem key={lesson.id} lesson={lesson} />
                    ))
                ) : (
                    <p>এই বিভাগে কোনো পাঠ পাওয়া যায়নি।</p>
                )}
            </div>
        </div>
    );
}
