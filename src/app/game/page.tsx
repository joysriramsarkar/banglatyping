import FallingWordsGame from "@/components/falling-words-game";

export default function GamePage() {
    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-headline">টাইপিং গেম - ঝরন্ত শব্দ</h1>
                <p className="text-muted-foreground">শব্দগুলো নিচে পড়ার আগেই টাইপ করুন!</p>
            </div>
            <FallingWordsGame />
        </div>
    );
}
