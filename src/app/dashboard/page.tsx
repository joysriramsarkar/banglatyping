import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Target, BookCheck, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const StatCard = ({ icon: Icon, title, value, unit }: { icon: React.ElementType, title: string, value: string, unit: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{toBengaliNumber(value)}</div>
      <p className="text-xs text-muted-foreground">{unit}</p>
    </CardContent>
  </Card>
);

const lessonsByLevel = [
  { level: "শিক্ষানবিশ", lessons: ["হোম রো বেসিক", "টপ রো অনুশীলন", "বটম রো ড্রিল"] },
  { level: "মধ্যম", lessons: ["শব্দ অনুশীলন ১", "সাধারণ বাক্য", "যতিচিহ্ন সহ টাইপিং"] },
  { level: "উন্নত", lessons: ["অনুচ্ছেদ অনুশীলন", "জটিল বাক্য", "দ্রুত গতির ড্রিল"] }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">স্বাগতম, ব্যবহারকারী!</h1>
        <p className="text-muted-foreground">আপনার টাইপিং যাত্রা চালিয়ে যান।</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Zap} title="গড় গতি" value="35" unit="শব্দ প্রতি মিনিট" />
        <StatCard icon={Target} title="গড় নির্ভুলতা" value="96%" unit="সর্বশেষ টেস্ট অনুযায়ী" />
        <StatCard icon={BookCheck} title="পাঠ সম্পন্ন" value="5" unit="মোট ১২টি পাঠের মধ্যে" />
        <StatCard icon={Award} title="টেস্ট দিয়েছেন" value="3" unit="আপনার সেরা স্কোর: ৪২ WPM" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>পরবর্তী পাঠ</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="p-6 bg-secondary rounded-lg text-center">
              <p className="text-lg font-semibold">শব্দ অনুশীলন ১</p>
              <p className="text-sm text-muted-foreground mb-4">মধ্যম স্তরের পাঠ</p>
              <Button asChild>
                <Link href="/practice/word-practice-1">অনুশীলন শুরু করুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>সব পাঠ</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <Accordion type="single" collapsible className="w-full">
              {lessonsByLevel.map(levelData => (
                <AccordionItem value={levelData.level} key={levelData.level}>
                  <AccordionTrigger>{levelData.level}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-4">
                      {levelData.lessons.map(lesson => (
                        <li key={lesson} className="text-sm text-muted-foreground hover:text-foreground">
                           <Link href={`/practice/${lesson.replace(/\s+/g, '-').toLowerCase()}`}>{lesson}</Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
