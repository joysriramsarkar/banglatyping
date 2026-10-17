import { getSupabase } from '@/lib/db';

export interface VerifiedCertificate {
  verification_id: string;
  recipient_name: string | null;
  gpm: number | null;
  wpm: number | null;
  accuracy: number | null;
  layout: string | null;
  issued_at: string | null;
}

/**
 * Look up a certificate by its verification id. Returns null when the id is
 * unknown OR when the database is unreachable/unconfigured — the caller must
 * render the not-found UI in both cases and never fake a success.
 */
export async function getCertificateByVerificationId(
  verificationId: string,
): Promise<VerifiedCertificate | null> {
  const id = (verificationId ?? '').trim();
  if (!id) return null;

  // Missing env: fail closed to the invalid UI, never a fake success.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = getSupabase();

    // Prefer the public view (no user-identifying columns). Fall back to the
    // base table with an explicit column list when the view is not migrated yet.
    const viewQuery = await supabase
      .from('public_certificates')
      .select('verification_id, recipient_name, gpm, wpm, accuracy, layout, issued_at')
      .eq('verification_id', id)
      .maybeSingle();

    if (!viewQuery.error && viewQuery.data) {
      return viewQuery.data as VerifiedCertificate;
    }

    const tableQuery = await supabase
      .from('certificates')
      .select('verification_id, recipient_name, gpm, wpm, accuracy, layout, issued_at')
      .eq('verification_id', id)
      .maybeSingle();

    if (tableQuery.error || !tableQuery.data) return null;
    return tableQuery.data as VerifiedCertificate;
  } catch {
    return null;
  }
}
