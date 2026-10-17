import { getCertificateByVerificationId } from '@/lib/certificates';
import { CertificateNotFound, CertificateVerified } from './verify-view';

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certId = Array.isArray(id) ? id[0] : id ?? '';

  const cert = await getCertificateByVerificationId(certId);

  if (!cert) {
    return <CertificateNotFound certId={certId} />;
  }

  return <CertificateVerified cert={cert} certId={certId} />;
}
