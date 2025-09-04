
"use client";

import FallingWordsGame from "@/components/falling-words-game";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";


export default function GamePage() {
    const router = useRouter();

    return (
        <div>
            <Card className="flex flex-col sm:flex-row items-center justify-between p-4 mb-8">
                 <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold font-headline">টাইপিং গেম - ঝরন্ত শব্দ</h1>
                    <p className="text-muted-foreground">শব্দগুলো নিচে পড়ার আগেই টাইপ করুন!</p>
                </div>
                <Button onClick={() => router.push('/dashboard')} variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    হোমে ফিরে যান
                </Button>
            </Card>
            <FallingWordsGame />
        </div>
    );
}
