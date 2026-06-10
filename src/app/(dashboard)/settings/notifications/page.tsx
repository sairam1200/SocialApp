"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
export const dynamic = "force-dynamic";
export default function NotificationSettingsPage() {
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Notifications</h2>
        <p className="text-sm text-gray-neutral">
          Manage how you get notified of what happens on Gaddr
        </p>
      </div>

      <section className="space-y-4">
        <Checkbox
          label="Push Notifications"
          checked={pushEnabled}
          onChange={(e) => setPushEnabled(e.target.checked)}
          className="py-4 border-b border-[#D9D9D9]"
        />

        <Checkbox
          label="Email Notifications"
          checked={emailEnabled}
          onChange={(e) => setEmailEnabled(e.target.checked)}
          className="py-4 border-b border-[#D9D9D9]"
        />
      </section>
    </div>
  );
}
