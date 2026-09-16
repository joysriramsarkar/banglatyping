
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://banglatyping.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'বাংলা টাইপিং মাস্টার - সেরা অনলাইন বাংলা টাইপিং টেস্ট ও প্র্যাকটিস | Bangla Typing Test & Master',
    template: '%s | বাংলা টাইপিং মাস্টার (Bangla Typing Master)',
  },
  description: 'সম্পূর্ণ বিনামূল্যে অনলাইনে বাংলা টাইপিং শিখুন ও স্পিড টেস্ট দিন। Avro, Bijoy ও BanglaWord লেআউটে ১৩ স্তরের পূর্ণাঙ্গ কোর্স, যুক্তাক্ষর প্র্যাকটিস, স্পিড টেস্ট (WPM/GPM), ভুল সংশোধন হাব এবং সরকারি চাকরির পরীক্ষার ভেরিফায়েড সার্টিফিকেট পান।',
  keywords: [
    'বাংলা টাইপিং',
    'বাংলা টাইপিং টেস্ট',
    'bangla typing',
    'bangla typing test',
    'অনলাইন বাংলা টাইপিং',
    'বাংলা টাইপিং স্পিড টেস্ট',
    'bangla typing speed test',
    'bangla typing master',
    'বাংলা টাইপিং শেখার সহজ উপায়',
    'bengali typing test online',
    'bengali typing practice',
    'avro typing test',
    'অভ্র টাইপিং টেস্ট',
    'bijoy typing test',
    'বিজয় টাইপিং টেস্ট',
    'banglaword typing test',
    'বাংলা টাইপিং সার্টিফিকেট',
    'bangla typing certificate',
    'যুক্তাক্ষর টাইপিং',
    'সরকারি চাকরির টাইপিং পরীক্ষা',
    'govt typing exam bangla',
    'bangla keyboard typing practice',
    'touch typing bengali',
    'free bangla typing tutor',
  ],
  authors: [{ name: 'Bangla Typing Master Team', url: siteUrl }],
  creator: 'Bangla Typing Master',
  publisher: 'Bangla Typing Master',
  applicationName: 'বাংলা টাইপিং মাস্টার',
  category: 'Education',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'bn-BD': '/',
      'bn-IN': '/',
      'en-US': '/',
    },
  },
  openGraph: {
    title: 'বাংলা টাইপিং মাস্টার - সেরা অনলাইন বাংলা টাইপিং টেস্ট ও প্র্যাকটিস | Bangla Typing Master',
    description: 'বিনামূল্যে বাংলা টাইপিং শিখুন ও গতি পরীক্ষা করুন। Avro, Bijoy এবং BanglaWord লেআউটে ১৩ স্তরের কোর্স ও ভেরিফায়েড সার্টিফিকেট।',
    url: siteUrl,
    siteName: 'বাংলা টাইপিং মাস্টার (Bangla Typing Master)',
    locale: 'bn_BD',
    alternateLocale: ['en_US', 'bn_IN'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'বাংলা টাইপিং মাস্টার - Bangla Typing Test & Practice',
    description: 'অনলাইনে সেরা বাংলা টাইপিং টেস্ট, লেসন ও প্র্যাকটিস প্ল্যাটফর্ম। Avro, Bijoy ও BanglaWord সাপোর্ট।',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'বাংলা টাইপিং মাস্টার (Bangla Typing Master)',
    url: siteUrl,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description: 'অনলাইনে বাংলা টাইপিং শেখার ও গতি পরীক্ষার সেরা প্ল্যাটফর্ম। Avro, Bijoy এবং BanglaWord লেআউটে ইন্টারঅ্যাক্টিভ লেসন, লাইভ স্পিড টেস্ট ও ফ্রি সার্টিফিকেট।',
    inLanguage: ['bn', 'en'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BDT',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1280',
      bestRating: '5',
      worstRating: '1',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'বাংলা টাইপিং মাস্টার - Bangla Typing Test & Practice',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/dashboard/lessons?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'বাংলা টাইপিং পূর্ণাঙ্গ কোর্স (১৩টি স্তর)',
    description: 'হোম রো, টপ রো, বটম রো, কার, হসন্ত, ফলা, যুক্তাক্ষর এবং সরকারি চাকরির পরীক্ষা উপযোগী বাংলা টাইপিং কোর্স।',
    provider: {
      '@type': 'Organization',
      name: 'Bangla Typing Master',
      sameAs: siteUrl,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'অনলাইনে বিনামূল্যে বাংলা টাইপিং কীভাবে শিখব?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'বাংলা টাইপিং মাস্টারে ১৩ স্তরের ধাপে ধাপে সাজানো পাঠক্রম রয়েছে। হাতের সঠিক আঙুল রাখার নিয়ম থেকে শুরু করে যুক্তাক্ষর ও গতি বৃদ্ধির জন্য নিয়মিত অনুশীলন করুন।',
        },
      },
      {
        '@type': 'Question',
        name: 'বাংলা টাইপিং টেস্টে WPM ও GPM এর অর্থ কী?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'WPM মানে Words Per Minute (প্রতি মিনিটে শব্দের সংখ্যা) এবং GPM মানে Graphemes Per Minute (প্রতি মিনিটে সঠিক বাংলা অক্ষরের সংখ্যা)। বাংলায় যুক্তাক্ষর নির্ভুলতার জন্য GPM অত্যন্ত কার্যকর।',
        },
      },
      {
        '@type': 'Question',
        name: 'কোন কোন কীবোর্ড লেআউট সাপোর্ট করে?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'আমাদের প্ল্যাটফর্মে বহুল ব্যবহৃত তিনটি লেআউটই রয়েছে: অভ্র (Avro Phonetic), বিজয় ক্লাসিক (Bijoy Classic), এবং বাংলাওয়ার্ড (BanglaWord)।',
        },
      },
      {
        '@type': 'Question',
        name: 'টাইপিং শেষে কীভাবে সার্টিফিকেট পাওয়া যায়?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'টাইপিং টেস্ট সম্পন্ন করার পর নির্ধারিত নির্ভুলতা ও গতি অর্জন করলে তৎক্ষণাৎ ভেরিফায়েড সার্টিফিকেট আইডি সহ সনদপত্র ডাউনলোড করা যায়।',
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
        />
      </head>
      <body className={cn("font-body antialiased", inter.variable, noto_sans_bengali.variable, hind_siliguri.variable)}>
        <AuthProvider>
          {children}
        </AuthProvider>
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

    