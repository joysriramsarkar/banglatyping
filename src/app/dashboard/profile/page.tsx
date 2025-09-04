"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import AuthGuard from "@/components/auth-guard";

function ProfilePageContent() {
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [keyboardLayout, setKeyboardLayout] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.displayName || '');
      setKeyboardLayout(userData.keyboardLayout || 'avro');
    }
  }, [userData]);

  const handleProfileSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name });
      // Update Firestore document
      await setDoc(doc(db, "users", user.uid), { displayName: name }, { merge: true });
      
      toast({ title: "সাফল্য!", description: "আপনার প্রোফাইল তথ্য সংরক্ষণ করা হয়েছে।" });
    } catch (error) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "প্রোফাইল তথ্য সংরক্ষণ করা যায়নি।" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { keyboardLayout }, { merge: true });
      toast({ title: "সাফল্য!", description: "আপনার কীবোর্ড সেটিংস সংরক্ষণ করা হয়েছে।" });
    } catch (error) {
       toast({ variant: "destructive", title: "ত্রুটি", description: "সেটিংস সংরক্ষণ করা যায়নি।" });
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) {
      return <div>লোড হচ্ছে...</div>
  }

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
              <AvatarImage src={user?.photoURL || "https://picsum.photos/200"} data-ai-hint="user avatar" />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="outline">ছবি পরিবর্তন করুন</Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">নাম</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ইমেল</Label>
            <Input id="email" type="email" value={user?.email || ''} disabled />
          </div>

          <Button onClick={handleProfileSave} disabled={isSaving}>
            {isSaving ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}
          </Button>
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
            <Select value={keyboardLayout} onValueChange={setKeyboardLayout} disabled={isSaving}>
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
          <Button onClick={handleSettingsSave} disabled={isSaving}>
            {isSaving ? "সংরক্ষণ করা হচ্ছে..." : "সেটিংস সংরক্ষণ করুন"}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfilePageContent />
        </AuthGuard>
    )
}
