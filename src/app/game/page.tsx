"use client";

import { useSearchParams } from "next/navigation";
import ArcadeHub, { GameMode } from "@/components/game/ArcadeHub";
import { Suspense } from "react";

function GameContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") as GameMode | null;
  const initialMode: GameMode = modeParam && ['falling', 'space', 'racer'].includes(modeParam) ? modeParam : 'hub';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:py-6">
      <ArcadeHub initialMode={initialMode} />
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">আর্কেড লোড হচ্ছে...</div>}>
      <GameContent />
    </Suspense>
  );
}
