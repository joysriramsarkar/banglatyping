import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'সাইন আপ — বাংলা টাইপিং মাস্টার',
  description: 'নতুন অ্যাকাউন্ট তৈরি করে ক্লাউডে আপনার বাংলা টাইপিং প্রগ্রেস ও অর্জন সংরক্ষণ করুন।',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
