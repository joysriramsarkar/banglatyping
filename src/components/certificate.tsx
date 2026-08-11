"use client";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { Award, Download } from "lucide-react";

interface CertificateProps {
  name: string;
  wpm: number;
  accuracy: number;
}

const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export default function Certificate({ name, wpm, accuracy }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${name.replace(/\s+/g, "-") || "certificate"}-certificate.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white text-black p-8 relative">
        <div ref={certificateRef} className="border-4 border-yellow-500 p-8 space-y-6 relative bg-white">
            <div className="absolute inset-0 bg-secondary/20 m-2 rounded-lg -z-10"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23dcb14a\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}>
            </div>

            <div className="text-center space-y-2">
                <Logo className="justify-center text-3xl" />
                <h1 className="text-5xl font-bold font-headline text-yellow-600 tracking-wider">সাফল্যের সনদপত্র</h1>
                <p className="text-lg text-gray-600">CERTIFICATE OF ACHIEVEMENT</p>
            </div>

            <div className="text-center">
                <p className="text-lg">এই সনদপত্রটি প্রদান করা হচ্ছে</p>
                <p className="text-4xl font-semibold font-headline my-4 text-primary">{name}</p>
            </div>
            
            <div className="text-center text-lg">
                <p>বাংলা টাইপিং এ অসাধারণ দক্ষতা প্রদর্শনের জন্য।</p>
                <p className="mt-2">তিনি সফলভাবে <span className="font-bold">{toBengaliNumber(wpm)} শব্দ প্রতি মিনিট</span> গতি এবং <span className="font-bold">{toBengaliNumber(accuracy)}% নির্ভুলতা</span> অর্জন করেছেন।</p>
            </div>

            <div className="flex justify-between items-end pt-8">
                <div className="text-center">
                    <p className="border-t-2 border-gray-400 pt-2 font-semibold">তারিখ</p>
                    <p>{new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-center">
                   <Award className="h-16 w-16 text-yellow-500 mx-auto" />
                </div>
                <div className="text-center">
                    <p className="border-t-2 border-gray-400 pt-2 font-semibold">কর্তৃপক্ষের স্বাক্ষর</p>
                    <p className="font-serif italic">Bangla Typing Master</p>
                </div>
            </div>
        </div>
        <Button id="print-button" onClick={handleDownload} disabled={isGenerating} className="absolute bottom-4 right-4 print:hidden">
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "ডাউনলোড হচ্ছে..." : "ডাউনলোড (PDF)"}
        </Button>
    </div>
  );
}

    