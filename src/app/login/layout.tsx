import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'লগইন — বাংলা টাইপিং মাস্টার',
  description: 'আপনার বাংলা টাইপিং অ্যাকাউন্টে লগইন করুন এবং ব্যক্তিগত অনুশীলন ও ফলাফল ট্র্যাক করুন।',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
