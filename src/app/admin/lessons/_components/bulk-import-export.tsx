"use client";

/**
 * BulkImportExport — accepts a CSV/JSON file, parses lesson rows
 * (title,description), and tries POST /api/lessons bulk import.
 * The bulk route does not exist yet, so on 404/405 it falls back to
 * downloading a CSV template with the parsed rows included.
 */

import { useState, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LessonRow {
  title: string;
  description: string;
}

const TEMPLATE_HEADER = "title,description";

function parseCsv(text: string): LessonRow[] {
  return text
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [title = "", ...rest] = line.split(",");
      return { title: title.trim(), description: rest.join(",").trim() };
    })
    .filter((r) => r.title.length > 0);
}

function parseFile(text: string, fileName: string): LessonRow[] {
  if (fileName.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(text) as Array<{ title?: unknown; description?: unknown }>;
    if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
    return parsed
      .filter((r) => typeof r.title === "string" && r.title.length > 0)
      .map((r) => ({
        title: r.title as string,
        description: typeof r.description === "string" ? r.description : "",
      }));
  }
  return parseCsv(text);
}

function toCsv(rows: LessonRow[]): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [TEMPLATE_HEADER, ...rows.map((r) => `${esc(r.title)},${esc(r.description)}`)].join("\n");
}

export function BulkImportExport() {
  const [rows, setRows] = useState<LessonRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus(null);
    try {
      const text = await file.text();
      const parsed = parseFile(text, file.name);
      setRows(parsed);
      // Try bulk import; fall back when the route does not exist.
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessons: parsed }),
      });
      if (res.status === 404 || res.status === 405) {
        setStatus(`${parsed.length}টি সারি পড়া হয়েছে — বাল্ক রুট নেই, টেমপ্লেট ডাউনলোড করুন।`);
      } else if (!res.ok) {
        setStatus(`${parsed.length}টি সারি পড়া হয়েছে — আমদানি ব্যর্থ (${res.status})।`);
      } else {
        setStatus(`${parsed.length}টি সারি আমদানি হয়েছে।`);
      }
    } catch {
      setStatus("ফাইল পড়া যায়নি — CSV (title,description) বা JSON অ্যারে দিন।");
    }
  }

  function downloadTemplate() {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lessons-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>বাল্ক ইমপোর্ট / এক্সপোর্ট</CardTitle>
        <CardDescription>CSV (title,description) বা JSON অ্যারে ফাইল দিন।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input type="file" accept=".csv,.json" onChange={onFile} />
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={downloadTemplate}>
            টেমপ্লেট ডাউনলোড
          </Button>
          {rows.length > 0 && (
            <span className="text-xs text-muted-foreground">{rows.length}টি সারি প্রস্তুত</span>
          )}
        </div>
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </CardContent>
    </Card>
  );
}

export default BulkImportExport;
