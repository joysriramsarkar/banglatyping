"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import AuthGuard from "@/components/auth-guard";
import { 
  getKeyboardLayoutOptions, 
  getActiveKeyboardLayout, 
  setActiveKeyboardLayout, 
  type KeyboardLayoutKey 
} from "@/lib/keyboard-layouts";

function ProfilePageContent() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [keyboardLayout, setKeyboardLayout] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.display_name || '');
      setKeyboardLayout(user.user_metadata?.keyboard_layout || 'avro');
    }
  }, [user]);

  const handleProfileSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: name,
          keyboard_layout: keyboardLayout,
        }
      });

      if (error) throw error;
      
      toast({ title: "সাফল্য!", description: "আপনার প্রোফাইল তথ্য সংরক্ষণ করা হয়েছে।" });
    } catch {
      toast({ variant: "destructive", title: "ত্রুটি", description: "প্রোফাইল তথ্য সংরক্ষণ করা যায়নি।" });
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
              <AvatarImage src={user?.user_metadata?.avatar_url || "https://picsum.photos/200"} data-ai-hint="user avatar" />
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
          <CardDescription>টাইপিং প্র্যাকটিস ও গেমের জন্য আপনার পছন্দের কীবোর্ড লেআউট নির্বাচন করুন।</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyboard-layout">কীবোর্ড লেআউট</Label>
            <Select 
              value={keyboardLayout || 'banglaword'} 
              onValueChange={(val) => {
                setKeyboardLayout(val);
                setActiveKeyboardLayout(val as KeyboardLayoutKey);
                toast({
                  title: "কীবোর্ড লেআউট পরিবর্তিত হয়েছে",
                  description: `সক্রিয় লেআউট: ${getKeyboardLayoutOptions().find(o => o.value === val)?.label || val}`,
                });
              }}
            >
              <SelectTrigger id="keyboard-layout">
                <SelectValue placeholder="লেআউট নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {getKeyboardLayoutOptions().map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span>{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
