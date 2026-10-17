"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";

export default function VerifyActions({ certId }: { certId: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/verify/${certId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button variant="outline" onClick={copyLink} className="gap-2">
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copied ? "লিংক কপি হয়েছে" : "যাচাই লিংক কপি করুন"}
    </Button>
  );
}
