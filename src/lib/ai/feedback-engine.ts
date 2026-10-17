/**
 * AI feedback engine — delegates to Supabase Edge Function `typing-coach`.
 * Env-guarded with an offline fallback message.
 */

export interface FeedbackRequest {
  wpm: number;
  accuracy: number;
  erredCharacters: Array<{ char: string; count: number }>;
  lessonId?: string;
}

export interface FeedbackResponse {
  message: string;
  offline: boolean;
}

export const OFFLINE_FALLBACK_MESSAGE =
  'অফলাইন মোডে আছেন। আপনার গতি অনুযায়ী প্রতিদিন ১০ মিনিট হোম রো অনুশীলন করুন এবং ভুল অক্ষরগুলো পুনরায় চর্চা করুন।';

function edgeFunctionUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/functions/v1/typing-coach`;
}

export async function generatePersonalizedFeedback(
  req: FeedbackRequest,
): Promise<FeedbackResponse> {
  const url = edgeFunctionUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { message: OFFLINE_FALLBACK_MESSAGE, offline: true };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`coach failed: ${res.status}`);
    const data = (await res.json()) as { message?: string };
    return { message: data.message ?? OFFLINE_FALLBACK_MESSAGE, offline: false };
  } catch {
    return { message: OFFLINE_FALLBACK_MESSAGE, offline: true };
  }
}

export default generatePersonalizedFeedback;
