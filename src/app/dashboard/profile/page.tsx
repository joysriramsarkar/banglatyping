import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">প্রোফাইল</h1>
        <p className="text-muted-foreground">আপনার প্রোফাইল তথ্য দেখুন এবং সম্পাদনা করুন।</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
          <CardDescription>আপনার সর্বজনীন প্রোফাইল তথ্য পরিচালনা করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://picsum.photos/200" data-ai-hint="user avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Button variant="outline">ছবি পরিবর্তন করুন</Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">নাম</Label>
            <Input id="name" defaultValue="ব্যবহারকারী" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ইমেল</Label>
            <Input id="email" type="email" defaultValue="user@example.com" disabled />
          </div>

          <Button>সংরক্ষণ করুন</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>কীবোর্ড সেটিংস</CardTitle>
          <CardDescription>আপনার পছন্দের কীবোর্ড লেআউট পরিবর্তন করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyboard-layout">কীবোর্ড লেআউট</Label>
            <Select defaultValue="avro">
              <SelectTrigger id="keyboard-layout">
                <SelectValue placeholder="একটি লেআউট নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avro">Avro Phonetic</SelectItem>
                <SelectItem value="bijoy">Bijoy Classic</SelectItem>
                <SelectItem value="banglaword">BanglaWord</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>সেটিংস সংরক্ষণ করুন</Button>
        </CardContent>
      </Card>
    </div>
  );
}
