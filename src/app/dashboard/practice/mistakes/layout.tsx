import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ভুল সংশোধন হাব — বাংলা টাইপিং মাস্টার',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MistakesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
