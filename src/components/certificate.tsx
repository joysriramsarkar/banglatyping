"use client";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { Award, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toBengaliNumber } from "@/lib/utils";

interface CertificateProps {
  name: string;
  wpm: number;
  accuracy: number;
  verificationId?: string;
  date?: string;
}

export default function Certificate({
  name,
  wpm,
  accuracy,
  verificationId,
  date,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate deterministic or random verification code if not provided
  const certId = useMemo(() => {
    if (verificationId) return verificationId;
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `BTP-2026-${rand}`;
  }, [verificationId]);

  const certDate = date || new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher resolution for crisp print quality
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${name.replace(/\s+/g, "-") || "certificate"}-${certId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white text-black p-4 sm:p-8 relative rounded-xl shadow-lg">
      <div ref={certificateRef} className="border-8 border-double border-yellow-600 p-6 sm:p-10 space-y-6 relative bg-white rounded-lg">
        {/* Decorative Background Pattern */}
        <div
          className="absolute inset-0 m-2 rounded-lg -z-10 opacity-30 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23dcb14a\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        {/* Certificate Header */}
        <div className="text-center space-y-2">
          <Logo className="justify-center text-3xl" />
          <h1 className="text-4xl sm:text-5xl font-extrabold font-headline text-yellow-700 tracking-wider">
            সাফল্যের সনদপত্র
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-gray-500 uppercase">
            CERTIFICATE OF TYPING PROFICIENCY &amp; MASTERY
          </p>
        </div>

        {/* Recipient */}
        <div className="text-center py-2">
          <p className="text-base text-gray-600">এই সনদপত্রটি সগৌরবে প্রদান করা হচ্ছে</p>
          <p className="text-3xl sm:text-4xl font-bold font-headline my-3 text-primary border-b-2 border-primary/30 inline-block px-8 pb-1">
            {name}
          </p>
        </div>
        
        {/* Body Text */}
        <div className="text-center text-base sm:text-lg text-gray-800 max-w-2xl mx-auto leading-relaxed">
          <p>
            বাংলা কীবোর্ড টাইপিংয়ে অসাধারণ দক্ষতা ও নির্ভুলতার স্বীকৃতিস্বরূপ। তিনি সফলভাবে
            <span className="font-bold text-gray-950 mx-1.5">{toBengaliNumber(wpm)} WPM</span> গতি এবং
            <span className="font-bold text-gray-950 mx-1.5">{toBengaliNumber(accuracy)}%</span> নির্ভুলতা অর্জন করেছেন।
          </p>
        </div>

        {/* Verification and Signatures Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-gray-200">
          <div className="text-center sm:text-left space-y-1">
            <p className="text-xs text-gray-500 font-medium">সনদ আইডি (Verification ID):</p>
            <p className="font-mono font-bold text-sm text-yellow-800">{certId}</p>
            <p className="text-xs text-gray-500">তারিখ: {certDate}</p>
          </div>

          <div className="text-center">
            <Award className="h-16 w-16 text-yellow-600 mx-auto drop-shadow-sm" aria-hidden="true" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mt-1">
              OFFICIAL VERIFIED
            </span>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="font-serif italic text-lg text-gray-900 border-b border-gray-400 pb-1">Bangla Typing Master</p>
            <p className="text-xs text-gray-500 font-medium">অনুমোদিত পরীক্ষা কর্তৃপক্ষ</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center pt-4 print:hidden">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span>যাচাইকরণ লিংক: </span>
          <Link href={`/verify/${certId}`} className="text-primary underline font-mono">
            /verify/{certId}
          </Link>
        </div>

        <Button
          id="print-button"
          onClick={handleDownload}
          disabled={isGenerating}
          className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2 font-bold shadow-sm"
        >
          <Download className="h-4 w-4" />
          {isGenerating ? "তৈরি হচ্ছে..." : "ডাউনলোড সনদ (PDF)"}
        </Button>
      </div>
    </div>
  );
}