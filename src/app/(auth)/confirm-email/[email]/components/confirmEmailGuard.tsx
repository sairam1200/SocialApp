"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PENDING_EMAIL_KEY = "pendingEmailChange";

export default function ConfirmEmailGuard({ email }: { email: string }) {
  const router = useRouter();

  useEffect(() => {
    const pending = localStorage.getItem(PENDING_EMAIL_KEY);
    if (pending && pending !== email) {
      localStorage.removeItem(PENDING_EMAIL_KEY);
      router.replace(`/confirm-email/${encodeURIComponent(pending)}`);
    }
  }, [email, router]);

  return null;
}
