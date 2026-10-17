import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ShieldX,
  ArrowLeft,
  Calendar,
  User,
  Zap,
  Target,
  Keyboard,
} from 'lucide-react';
import Link from 'next/link';
import { toBengaliNumber } from '@/lib/utils';
import type { VerifiedCertificate } from '@/lib/certificates';
import VerifyActions from './verify-actions';

function formatSpeed(cert: VerifiedCertificate): string {
  const gpm = typeof cert.gpm === 'number' ? cert.gpm : null;
  const wpm = typeof cert.wpm === 'number' ? cert.wpm : null;
  const value = gpm ?? wpm;
  if (value === null || !Number.isFinite(value)) return '—';
  return `${toBengaliNumber(Math.round(value))} GPM`;
}

function formatAccuracy(cert: VerifiedCertificate): string {
  if (typeof cert.accuracy !== 'number' || !Number.isFinite(cert.accuracy)) return '—';
  return `${toBengaliNumber(Math.round(cert.accuracy * 10) / 10)}%`;
}

function formatDate(issuedAt: string | null): string {
  if (!issuedAt) return '—';
  const d = new Date(issuedAt);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function CertificateNotFound({ certId }: { certId: string }) {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl space-y-6">
        <Card className="border shadow-lg bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white text-center space-y-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldX className="h-10 w-10 text-white" />
            </div>
            <Badge className="bg-white text-red-700 font-bold px-3 py-1">
              সনদ পাওয়া যায়নি
            </Badge>
            <h1 className="text-2xl font-bold font-headline mt-2">
              এই আইডির কোনো সনদ নেই
            </h1>
            <p className="text-red-100 text-xs font-mono">আইডি: {certId}</p>
          </div>

          <CardContent className="p-6 space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              এই যাচাইকরণ আইডির সাথে মিলে এমন কোনো সনদ আমাদের রেকর্ডে নেই। আইডিটি
              ঠিকভাবে লিখেছেন কি না পরীক্ষা করুন।
            </p>

            <Button asChild className="w-full bg-primary text-primary-foreground">
              <Link href="/dashboard/test">
                <ArrowLeft className="mr-2 h-4 w-4" /> নিজে পরীক্ষা দিন ও সনদ অর্জন করুন
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CertificateVerified({
  cert,
  certId,
}: {
  cert: VerifiedCertificate;
  certId: string;
}) {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl space-y-6">
        <Card className="border shadow-lg bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center space-y-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <Badge className="bg-white text-green-700 font-bold px-3 py-1">
              সনদপত্র পাওয়া গেছে
            </Badge>
            <h1 className="text-2xl font-bold font-headline mt-2">
              সনদপত্র যাচাইকরণ সফল হয়েছে
            </h1>
            <p className="text-green-100 text-xs font-mono">আইডি: {certId}</p>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-4 divide-y divide-border">
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" /> সনদের প্রাপক
                </span>
                <span className="font-bold text-base text-foreground font-headline">
                  {cert.recipient_name || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> অর্জিত গতি
                </span>
                <span className="font-bold text-lg text-primary">{formatSpeed(cert)}</span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" /> গড় নির্ভুলতা (Accuracy)
                </span>
                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                  {formatAccuracy(cert)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Keyboard className="h-4 w-4" /> কিবোর্ড লেআউট
                </span>
                <span className="font-medium text-sm text-foreground">
                  {cert.layout || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> সনদ ইস্যুর তারিখ
                </span>
                <span className="font-medium text-sm text-foreground">
                  {formatDate(cert.issued_at)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground text-center">
              এই সনদপত্রটি BanglaTyping রেকর্ড থেকে যাচাই করা হয়েছে।
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild className="flex-1 bg-primary text-primary-foreground">
                <Link href="/dashboard/test">
                  <ArrowLeft className="mr-2 h-4 w-4" /> নিজে পরীক্ষা দিন ও সনদ অর্জন করুন
                </Link>
              </Button>
              <VerifyActions certId={certId} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
