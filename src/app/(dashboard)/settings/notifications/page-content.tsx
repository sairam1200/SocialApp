"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/services/apiClient.service";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";
export default function NotificationSettingsPage() {
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
  const [emailFrequency, setEmailFrequency] = useState<string>("immediate");

  const handleFrequencyChange = async (value: string) => {
    setEmailFrequency(value);
    try {
      await apiClient.User.updateNotificationPreferencesAsync({
        emailFrequency: value as "immediate" | "daily" | "weekly",
      });
      toast.success("Email frequency updated");
    } catch {
      toast.error("Failed to update email frequency");
    }
  };

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

        {emailEnabled && (
          <div className="py-4 border-b border-[#D9D9D9]">
            <label className="block text-sm font-medium mb-2">
              Email Frequency
            </label>
            <Select value={emailFrequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="w-full max-w-xs" aria-label="Email notification frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily digest</SelectItem>
                <SelectItem value="weekly">Weekly digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </section>
    </div>
  );
}
