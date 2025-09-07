
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali, Hind_Siliguri } from 'next/font/google';
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

const hind_siliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ["400", "700"],
  variable: '--font-hind-siliguri',
});

export const metadata: Metadata = {
  title: 'মাস্টার',
  description: 'Master Bangla typing with interactive lessons and games.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", inter.variable, noto_sans_bengali.variable, hind_siliguri.variable)}>
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-2 right-2 z-50 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
            DEV
          </div>
        )}
      </body>
    </html>
  );
}

    