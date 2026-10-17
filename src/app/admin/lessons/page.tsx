/**
 * Admin CMS — lessons. Server component; admin-gated via the
 * ADMIN_EMAILS comma-separated allow-list vs the session email.
 */

import { AdminGate } from "./_components/admin-gate";
import { LessonEditor } from "./_components/lesson-editor";
import { DrillManager } from "./_components/drill-manager";
import { BulkImportExport } from "./_components/bulk-import-export";

function readAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

export default function AdminLessonsPage() {
  const adminEmails = readAdminEmails();
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">পাঠ ব্যবস্থাপনা (Admin CMS)</h1>
        <p className="text-sm text-muted-foreground">পাঠ সম্পাদনা, ড্রিল ও বাল্ক ইমপোর্ট।</p>
      </div>
      <AdminGate adminEmails={adminEmails}>
        <div className="space-y-6">
          <LessonEditor />
          <DrillManager />
          <BulkImportExport />
        </div>
      </AdminGate>
    </div>
  );
}
