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

const lessonPlan = [
  {
    level: "শিক্ষানবিশ (Beginner)",
    description: "কীবোর্ডের সাথে পরিচিতি এবং মৌলিক অক্ষর অনুশীলন।",
    lessons: [
      { id: "home-row", title: "হোম রো", completed: true },
      { id: "top-row", title: "টপ রো", completed: true },
      { id: "bottom-row", title: "বটম রো", completed: false },
    ],
  },
  {
    level: "মধ্যম (Intermediate)",
    description: "সাধারণ শব্দ এবং বাক্য দিয়ে নির্ভুলতা ও গতি বৃদ্ধি।",
    lessons: [
      { id: "word-practice-1", title: "শব্দ অনুশীলন ১", completed: false },
      { id: "sentence-practice-1", title: "বাক্য অনুশীলন ১", completed: false },
      { id: "punctuation", title: "যতিচিহ্ন অনুশীলন", completed: false },
    ],
  },
  {
    level: "উন্নত (Advanced)",
    description: "জটিল অনুচ্ছেদ এবং দ্রুত গতির জন্য অনুশীলন।",
    lessons: [
      { id: "paragraph-practice-1", title: "অনুচ্ছেদ অনুশীলন ১", completed: false },
      { id: "paragraph-practice-2", title: "অনুচ্ছেদ অনুশীলন ২", completed: false },
      { id: "speed-drill", title: "দ্রুত গতির ড্রিল", completed: false },
    ],
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
              <Accordion type="single" collapsible defaultValue="item-0">
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-base">পাঠ তালিকা দেখুন</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {levelData.lessons.map(lesson => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex items-center gap-4">
                            {lesson.completed ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <PlayCircle className="h-6 w-6 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              {lesson.completed && <Badge variant="secondary">সম্পন্ন</Badge>}
                            </div>
                          </div>
                          <Button asChild variant={lesson.completed ? 'secondary' : 'default'}>
                            <Link href={`/practice/${lesson.id}`}>
                              {lesson.completed ? 'পুনরায় করুন' : 'শুরু করুন'}
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
