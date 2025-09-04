import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold text-primary", className)}>
      <div className="h-8 w-8 bg-primary/20 rounded-md flex items-center justify-center text-xl font-bold">ট</div>
      <span className="font-headline">বাংলা টাইপিং মাস্টার</span>
    </Link>
  );
}
