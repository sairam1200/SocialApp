"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/services/apiClient.service";
import toast from "react-hot-toast";

type PrivacySetting = "public" | "private" | "followers_only";

export default function PrivacyPage() {
  const [profilePrivacy, setProfilePrivacy] = useState<PrivacySetting>("public");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.User.getUserProfileAsync("") as any;
        if (res?.profilePrivacy) {
          setProfilePrivacy(res.profilePrivacy as PrivacySetting);
        }
      } catch {
        // ignore - use default
      }
    }
    void load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.Account.updatePrivacySettings({ profilePrivacy });
      toast.success("Privacy settings saved");
    } catch {
      toast.error("Failed to save privacy settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Privacy</h2>
        <p className="text-sm text-gray-neutral">
          Control who can see your profile and activity.
        </p>
      </div>

      <section className="space-y-4">
        <div className="rounded-xl border border-border p-4 space-y-4">
          <div>
            <p className="font-medium mb-1">Profile visibility</p>
            <p className="text-sm text-muted-foreground mb-3">
              Choose who can see your profile.
            </p>
            <Select
              value={profilePrivacy}
              onValueChange={(v) => setProfilePrivacy(v as PrivacySetting)}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="followers_only">Followers only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button
              label="Save"
              onClick={handleSave}
              disabled={saving}
              loading={saving}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
