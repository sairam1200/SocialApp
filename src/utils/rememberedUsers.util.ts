"use client";

import { LOCAL_STORAGE_KEYS, ClaimTypes } from "@/constants/globals";
import { jwtDecode } from "jwt-decode";

export interface RememberedUser {
  email: string;
  profileImage: string;
  fullName: string;
  lastLoggedIn: number;
}

const getStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const getRememberedUsers = (): RememberedUser[] => {
  try {
    const storage = getStorage();
    if (!storage) return [];

    const raw = storage.getItem(LOCAL_STORAGE_KEYS.REMEMBERED_USER_INFO);
    if (!raw) return [];

    const users = JSON.parse(raw);

    if (!Array.isArray(users)) return [];

    return users.map((user) => ({
      ...user,
      lastLoggedIn: user.lastLoggedIn || 0,
    }));
  } catch (error) {
    console.error("Failed to retrieve remembered users:", error);
    return [];
  }
};

export const addRememberedUser = (
  user: Omit<RememberedUser, "lastLoggedIn">
): void => {
  try {
    const storage = getStorage();
    if (!storage) return;

    const users = getRememberedUsers();
    const now = Date.now();

    const existingIndex = users.findIndex((u) => u.email === user.email);

    if (existingIndex >= 0) {
      users[existingIndex] = {
        ...user,
        lastLoggedIn: now,
      };
    } else {
      users.push({
        ...user,
        lastLoggedIn: now,
      });
    }

    storage.setItem(
      LOCAL_STORAGE_KEYS.REMEMBERED_USER_INFO,
      JSON.stringify(users)
    );
  } catch (error) {
    console.error("Failed to add remembered user:", error);
  }
};

export const removeRememberedUser = (email: string): void => {
  try {
    const storage = getStorage();
    if (!storage) return;

    const users = getRememberedUsers();
    const filteredUsers = users.filter((u) => u.email !== email);

    storage.setItem(
      LOCAL_STORAGE_KEYS.REMEMBERED_USER_INFO,
      JSON.stringify(filteredUsers)
    );
  } catch (error) {
    console.error("Failed to remove remembered user:", error);
  }
};

export const clearRememberedUsers = (): void => {
  try {
    const storage = getStorage();
    if (!storage) return;

    storage.removeItem(LOCAL_STORAGE_KEYS.REMEMBERED_USER_INFO);
  } catch (error) {
    console.error("Failed to clear remembered users:", error);
  }
};

export const findRememberedUser = (
  email: string
): RememberedUser | null => {
  try {
    const users = getRememberedUsers();
    return users.find((u) => u.email === email) || null;
  } catch (error) {
    console.error("Failed to find remembered user:", error);
    return null;
  }
};

export const getActiveRememberedUser = (): RememberedUser | null => {
  try {
    const users = getRememberedUsers();

    if (users.length === 0) return null;

    return [...users].sort(
      (a, b) => b.lastLoggedIn - a.lastLoggedIn
    )[0];
  } catch (error) {
    console.error("Failed to get active remembered user:", error);
    return null;
  }
};

export const getRememberedUsersSorted = (): RememberedUser[] => {
  try {
    const users = getRememberedUsers();

    return [...users].sort(
      (a, b) => b.lastLoggedIn - a.lastLoggedIn
    );
  } catch (error) {
    console.error("Failed to get sorted remembered users:", error);
    return [];
  }
};

export const rememberUserFromToken = (
  accessToken: string,
  fallbackUserImage?: string
): boolean => {
  if (!accessToken) return false;

  try {
    const decoded = jwtDecode<Record<string, unknown>>(accessToken);

    const email = decoded[ClaimTypes.Email] as string | undefined;
    if (!email) return false;

    const profileImage =
      (decoded[ClaimTypes.ProfileImage] as string | undefined) ||
      fallbackUserImage ||
      "";

    const fullName =
      (decoded[ClaimTypes.FullName] as string | undefined) || "";

    addRememberedUser({
      email,
      profileImage,
      fullName,
    });

    return true;
  } catch (error) {
    console.error("Failed to extract user info from token:", error);
    return false;
  }
};