"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Brain, Trophy, Users, Globe, BookOpen } from 'lucide-react';

export default function AboutPage() {
  // Mocking the classes object that was causing issues
  // Mapping the requested properties to Tailwind classes
  const classes = {
    background: "bg-background",
    surface: "bg-card",
    text: "text-foreground",
    accent: "text-primary",
    border: "border-border",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    muted: "text-muted-foreground",
    card: "rounded-lg border bg-card text-card-foreground shadow-sm",
    button: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    input: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    pageTransition: "animate-in fade-in zoom-in duration-500",
    hoverEffects: "hover:bg-accent hover:text-accent-foreground transition-colors",
    scrollEffects: "scroll-smooth"
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen ${classes.background} ${classes.text}`}>
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-20 px-4 text-center space-y-4"
      >
        <Badge variant="outline" className="mb-4">আমাদের সম্পর্কে</Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
          বাংলা টাইপিং মাস্টার
        </h1>
        <p className={`text-xl md:text-2xl max-w-3xl mx-auto ${classes.muted}`}>
          বাংলা ভাষা শেখা এবং টাইপিং চর্চার জন্য একটি আধুনিক এবং ইন্টারেক্টিভ প্ল্যাটফর্ম।
        </p>
      </motion.section>

      <Separator className="my-8" />

      {/* Mission Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-3xl font-bold">আমাদের লক্ষ্য</h2>
            <p className={classes.muted}>
              আমাদের লক্ষ্য হলো বাংলা ভাষাকে প্রযুক্তির মাধ্যমে সবার কাছে সহজলভ্য করে তোলা। আমরা বিশ্বাস করি, সঠিক টুল এবং নির্দেশনার মাধ্যমে যে কেউ দ্রুত এবং নির্ভুলভাবে বাংলা টাইপ করতে শিখতে পারে।
            </p>
            <p className={classes.muted}>
              ছাত্রছাত্রী, পেশাজীবী এবং সাধারণ ব্যবহারকারী - সবার জন্যই আমাদের এই প্রচেষ্টা।
            </p>
            <Button className="mt-4">
              আরও জানুন
            </Button>
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-primary" />
                  <span>আধুনিক</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                সর্বাধুনিক প্রযুক্তির ব্যবহার
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>স্মার্ট</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                AI-চালিত শেখার পদ্ধতি
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>গেম</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                মজার মাধ্যমে শেখা
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>সবার জন্য</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                বিনামূল্যে এবং উন্মুক্ত
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`py-20 ${classes.surface}`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">কেন আমাদের বেছে নেবেন?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">বিস্তৃত পাঠ্যক্রম</h3>
              <p className={classes.muted}>
                বর্ণমালা থেকে শুরু করে জটিল বাক্য গঠন পর্যন্ত ধাপে ধাপে শেখার ব্যবস্থা।
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">কমিউনিটি সাপোর্ট</h3>
              <p className={classes.muted}>
                অন্যান্য শিক্ষার্থীদের সাথে প্রতিযোগিতা এবং অভিজ্ঞতা শেয়ার করার সুযোগ।
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">সার্টিফিকেট</h3>
              <p className={classes.muted}>
                কোর্স সম্পন্ন করার পর দক্ষতা প্রমাণের জন্য সার্টিফিকেট অর্জন করুন।
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer CTA */}
      <section className="py-20 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">আজই শুরু করুন</h2>
        <p className={`text-xl mb-8 max-w-2xl mx-auto ${classes.muted}`}>
          বিনামূল্যে রেজিস্ট্রেশন করুন এবং আপনার বাংলা টাইপিং যাত্রা শুরু করুন।
        </p>
        <Button size="lg" className="text-lg px-8">
          অ্যাকাউন্ট তৈরি করুন
        </Button>
      </section>
    </div>
  );
}
