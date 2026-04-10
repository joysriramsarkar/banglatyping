
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, PlayCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { lessons, rowCategories } from "@/lib/lessons";
import { RowDrillCategory } from "@/lib/types"

const beginnerLessons = lessons.filter(lesson => lesson.level === "Beginner" && !lesson.row);
const intermediateLessons = lessons.filter(lesson => lesson.level === "Intermediate");
const advancedLessons = lessons.filter(lesson => lesson.level === "Advanced");

const lessonPlan = [
   {
    level: "শিক্ষানবিশ (Beginner)",
    description: "কীবোর্ডের সাথে পরিচিতি এবং মৌলিক অক্ষর অনুশীলন।",
    isRowDrills: true,
    lessons: beginnerLessons
  },
  {
    level: "মধ্যম (Intermediate)",
    description: "সাধারণ শব্দ এবং বাক্য দিয়ে নির্ভুলতা ও গতি বৃদ্ধি।",
    lessons: intermediateLessons,
  },
  {
    level: "উন্নত (Advanced)",
    description: "জটিল অনুচ্ছেদ এবং দ্রুত গতির জন্য অনুশীলন।",
    lessons: advancedLessons,
  },
]

const LessonListItem = ({ lesson }: { lesson: any }) => (
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
                  
                  {levelData.isRowDrills && (
                     <div className="space-y-4">
                      {rowCategories.map(category => (
                        <Link href={`/dashboard/lessons/${category.id}`} key={category.id} className="block border rounded-lg p-4 hover:bg-accent transition-colors">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold">{category.name}</h3>
                                    <p className="text-sm text-muted-foreground">{category.description}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                            </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {levelData.lessons.map(lesson => (
                    <LessonListItem key={lesson.id} lesson={lesson} />
                  ))}
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
