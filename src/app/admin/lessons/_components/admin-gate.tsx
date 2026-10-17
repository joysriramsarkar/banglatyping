"use client";

/**
 * AdminGate — compares the signed-in user's email against the
 * ADMIN_EMAILS allow-list (passed from the server component).
 */

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";

export function AdminGate({ adminEmails, children }: { adminEmails: string[]; children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-sm text-muted-foreground">যাচাই করা হচ্ছে…</p>;
  }

  const email = (user?.email ?? "").toLowerCase();
  const allowed = email !== "" && adminEmails.map((e) => e.toLowerCase()).includes(email);

  if (!allowed) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-10 text-center space-y-2">
          <p className="text-2xl font-extrabold">403 — প্রবেশ নিষেধ</p>
          <p className="text-sm text-muted-foreground">
            এই পৃষ্ঠা শুধুমাত্র অ্যাডমিনদের জন্য।
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

export default AdminGate;
