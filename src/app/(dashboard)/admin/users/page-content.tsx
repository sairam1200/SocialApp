"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import type { AdminUser } from "@/services/api/admin.service";

export default function AdminUsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (term?: string) => {
    setLoading(true);
    try {
      const result = await apiClient.Admin.getUsers(1, 50, term || undefined);
      setUsers(result.items ?? []);
    } catch {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    fetchUsers(search);
  };

  const handleBan = async (userId: string) => {
    if (!confirm("Ban this user?")) return;
    await apiClient.Admin.banUser(userId);
    fetchUsers(search);
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage platform users.</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm bg-background"
        />
        <button
          onClick={handleSearch}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Username</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3">@{u.userName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={u.isActive ? "text-green-600" : "text-destructive"}>
                      {u.isActive ? "Active" : "Banned"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isActive && (
                      <button
                        onClick={() => handleBan(u.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
