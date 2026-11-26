"use client";

import { Suspense } from 'react';
import PracticeHub from '@/components/game/PracticeHub';

export default function PracticeHubClientPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">অনুশীলন হাব লোড হচ্ছে...</div>}>
      <PracticeHub onBackToHub={() => window.history.back()} />
    </Suspense>
  );
}