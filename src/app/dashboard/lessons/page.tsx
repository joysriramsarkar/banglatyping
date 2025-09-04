
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, PlayCircle } from "lucide-react"
import Link from "next/link"
import { lessons } from "@/lib/lessons"

const lessonsByLevel = {
  "Beginner": [],
  "Intermediate": [],
  "Advanced": [],
};

// This is a bit of a hack to group home row lessons.
const homeRowBeginnerLessons = lessons.filter(lesson => lesson.level === "Beginner" && lesson.id.startsWith("home-row"));
const otherBeginnerLessons = lessons.filter(lesson => lesson.level === "Beginner" && !lesson.id.startsWith("home-row"));

lessons.forEach(lesson => {
    if (lesson.level !== "Beginner") {
        lessonsByLevel[lesson.level].push(lesson);
    }
});

const lessonPlan = [
  {
    level: "শিক্ষানবিশ (Beginner)",
    description: "কীবোর্ডের সাথে পরিচিতি এবং মৌলিক অক্ষর অনুশীলন।",
    lessons: otherBeginnerLessons,
    isHomeRow: true,
    homeRowLessons: homeRowBeginnerLessons
  },
  {
    level: "মধ্যম (Intermediate)",
    description: "সাধারণ শব্দ এবং বাক্য দিয়ে নির্ভুলতা ও গতি বৃদ্ধি।",
    lessons: lessonsByLevel["Intermediate"],
  },
  {
    level: "উন্নত (Advanced)",
    description: "জটিল অনুচ্ছেদ এবং দ্রুত গতির জন্য অনুশীলন।",
    lessons: lessonsByLevel["Advanced"],
  },
]

export default function LessonsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-2">পাঠক্রম</h1>
      <p className="text-muted-foreground mb-8">ধাপে ধাপে আপনার টাইপিং দক্ষতা বাড়ান।</p>
      
      <div className="space-y-6">
        {lessonPlan.map((levelData, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{levelData.level}</CardTitle>
              <CardDescription>{levelData.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 pt-4">
                  
                  {levelData.isHomeRow && (
                    <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
                        <AccordionItem value="home-row">
                          <AccordionTrigger className="text-lg font-semibold">হোম রো অনুশীলন</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                              {levelData.homeRowLessons.map(lesson => (
                                <div key={lesson.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                  <div className="flex items-center gap-4">
                                    <PlayCircle className="h-6 w-6 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">{lesson.title}</p>
                                    </div>
                                  </div>
                                  <Button asChild>
                                    <Link href={`/practice/${lesson.id}`}>
                                      শুরু করুন
                                    </Link>
                                  </Button>
                                </div>
                              ))}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                  )}

                  {levelData.lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-4">
                        <PlayCircle className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/practice/${lesson.id}`}>
                          শুরু করুন
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
