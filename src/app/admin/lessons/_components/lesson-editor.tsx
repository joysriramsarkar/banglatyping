"use client";

/**
 * LessonEditor — lists lessons from /api/lessons, edits title/description.
 * Tries PUT /api/lessons/[id]; when the route does not exist (404/405),
 * keeps a local draft and offers an Export JSON download instead.
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LessonSummary {
  id: string;
  title: string;
  description?: string | null;
}

interface Draft {
  title: string;
  description: string;
}

export function LessonEditor() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ title: "", description: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [putSupported, setPutSupported] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/lessons");
        const json = (await res.json()) as { success: boolean; data?: LessonSummary[] };
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setLessons(json.data);
        }
      } catch {
        if (!cancelled) setStatus("পাঠ লোড করা যায়নি।");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function select(lesson: LessonSummary) {
    setSelectedId(lesson.id);
    setDraft({ title: lesson.title, description: lesson.description ?? "" });
    setStatus(null);
  }

  async function save() {
    if (!selectedId) return;
    setStatus(null);
    try {
      const res = await fetch(`/api/lessons/${encodeURIComponent(selectedId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draft.title, description: draft.description }),
      });
      if (res.status === 404 || res.status === 405) {
        setPutSupported(false);
        setStatus("PUT রুট নেই — খসড়া হিসেবে সংরক্ষিত। Export JSON ব্যবহার করুন।");
        return;
      }
      if (!res.ok) throw new Error(`save failed: ${res.status}`);
      setLessons((prev) =>
        prev.map((l) => (l.id === selectedId ? { ...l, title: draft.title, description: draft.description } : l))
      );
      setStatus("সংরক্ষিত হয়েছে।");
    } catch {
      setPutSupported(false);
      setStatus("সার্ভারে সংরক্ষণ ব্যর্থ — খসড়া হিসেবে রাখা হয়েছে।");
    }
  }

  function exportJson() {
    const payload = lessons.map((l) =>
      l.id === selectedId ? { ...l, title: draft.title, description: draft.description } : l
    );
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lessons-draft.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>পাঠ সম্পাদনা</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 max-h-96 overflow-auto">
          {lessons.length === 0 && (
            <p className="text-sm text-muted-foreground">কোনো পাঠ পাওয়া যায়নি।</p>
          )}
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => select(lesson)}
              className={`w-full text-left p-2 rounded border text-sm ${
                lesson.id === selectedId ? "border-primary bg-primary/5" : ""
              }`}
            >
              {lesson.title}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <Input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="শিরোনাম"
            disabled={!selectedId}
          />
          <Textarea
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="বিবরণ"
            disabled={!selectedId}
          />
          <div className="flex gap-2">
            <Button onClick={save} disabled={!selectedId}>
              সংরক্ষণ
            </Button>
            {(!putSupported || selectedId) && (
              <Button variant="outline" onClick={exportJson} disabled={lessons.length === 0}>
                Export JSON
              </Button>
            )}
          </div>
          {status && <p className="text-xs text-muted-foreground">{status}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default LessonEditor;
