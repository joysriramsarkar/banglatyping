import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lucide-react to avoid ESM issues in Jest (same as home-auth-header.test.tsx)
jest.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => (props: any) => (
        <span data-testid={`lucide-${String(prop)}`} {...props} />
      ),
    }
  );
});

import CertificateVerificationPage from '@/app/verify/[id]/page';
import { CertificateNotFound, CertificateVerified } from '@/app/verify/[id]/verify-view';
import { getCertificateByVerificationId } from '@/lib/certificates';

describe('verify page data lookup', () => {
  const OLD_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const OLD_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    if (OLD_URL === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = OLD_URL;
    if (OLD_KEY === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = OLD_KEY;
  });

  it('returns null (never a fake success) when env is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await expect(getCertificateByVerificationId('BTP-2026-ABCDEF12')).resolves.toBeNull();
  });

  it('returns null for a blank id', async () => {
    await expect(getCertificateByVerificationId('   ')).resolves.toBeNull();
  });
});

describe('verify page UI', () => {
  it('shows the not-found message for an unknown id (no green success shield)', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const element = await CertificateVerificationPage({
      params: Promise.resolve({ id: 'BTP-UNKNOWN-ID' }),
    });
    render(element);

    expect(screen.getByText('এই আইডির কোনো সনদ নেই')).toBeInTheDocument();
    expect(screen.queryByText('সনদপত্র যাচাইকরণ সফল হয়েছে')).not.toBeInTheDocument();
    // Fail UI must not show success/verified/official claims.
    expect(screen.queryByText(/যাচাইকৃত|Verified|সরকারি/i)).not.toBeInTheDocument();
  });

  it('renders the not-found component directly', () => {
    render(<CertificateNotFound certId="BTP-NOPE-123" />);
    expect(screen.getByText('এই আইডির কোনো সনদ নেই')).toBeInTheDocument();
    expect(screen.getByText(/আইডি: BTP-NOPE-123/)).toBeInTheDocument();
  });

  it('renders real certificate data (no hardcoded 45 WPM / 97.5% defaults)', () => {
    render(
      <CertificateVerified
        certId="BTP-2026-ABCDEF12"
        cert={{
          verification_id: 'BTP-2026-ABCDEF12',
          recipient_name: 'পরীক্ষামূলক নাম',
          gpm: 62,
          wpm: 55,
          accuracy: 96.4,
          layout: 'Avro Phonetic',
          issued_at: '2026-03-15T00:00:00.000Z',
        }}
      />
    );

    expect(screen.getByText('পরীক্ষামূলক নাম')).toBeInTheDocument();
    expect(screen.getByText('Avro Phonetic')).toBeInTheDocument();
    // Real accuracy from the row, not the old hardcoded ৯৭.৫%.
    expect(screen.queryByText('৯৭.৫%')).not.toBeInTheDocument();
    expect(screen.getByText('সনদপত্র যাচাইকরণ সফল হয়েছে')).toBeInTheDocument();
  });
});
