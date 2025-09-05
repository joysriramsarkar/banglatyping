
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const noto_sans_bengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ["400", "700"],
  variable: '--font-noto-sans-bengali',
});

export const metadata: Metadata = {
  title: 'বাংলা টাইপিং মাস্টার',
  description: 'Master Bangla typing with interactive lessons and games.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", inter.variable, noto_sans_bengali.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
