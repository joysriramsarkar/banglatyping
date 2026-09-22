import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-200 group-hover:scale-105", className)}
      aria-hidden="true"
    >
      {/* Keycap Body */}
      <rect width="200" height="200" rx="44" fill="#FFC700" />
      <rect x="2.5" y="2.5" width="195" height="195" rx="41.5" stroke="#111111" strokeWidth="6" fill="none" />

      {/* Matra (Top Bar) */}
      <rect x="55" y="55" width="90" height="11" rx="5.5" fill="#111111" />

      {/* Right Vertical Stem */}
      <rect x="115" y="73" width="11" height="44" rx="5.5" fill="#111111" />

      {/* Main Glyph Ring & Eye */}
      <circle cx="95" cy="105" r="27" stroke="#111111" strokeWidth="11" fill="none" />
      <circle cx="95" cy="105" r="12" fill="#111111" />

      {/* Dynamic Cursor Accent */}
      <rect x="127" y="113" width="11" height="24" rx="3.5" fill="#F24E1E" />
    </svg>
  );
}

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="বাংলা টাইপিং মাস্টার — হোম পেজে যান"
      className={cn("group flex items-center gap-2.5 text-xl font-bold text-foreground hover:opacity-95 transition-all", className)}
    >
      <LogoIcon size={34} className="rounded-xl drop-shadow-sm" />
      {!iconOnly && (
        <span className="font-headline font-black tracking-tight text-foreground">
          বাংলা টাইপিং মাস্টার
        </span>
      )}
    </Link>
  );
}