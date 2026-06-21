"use client";

import type { Role } from "@/lib/types";

export type StudentProfile = {
  fullName: string;
  role: Role;
  schoolName: string;
  classLevel: string;
  bio: string;
  avatarUrl: string;
  updatedAt?: string;
};

const STORAGE_KEY = "biotutor-student-profile";

export const defaultStudentProfile: StudentProfile = {
  fullName: "Student User",
  role: "student",
  schoolName: "",
  classLevel: "SSII",
  bio: "",
  avatarUrl: ""
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadStudentProfile(): StudentProfile {
  if (!canUseStorage()) return defaultStudentProfile;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStudentProfile;
    return { ...defaultStudentProfile, ...JSON.parse(raw) };
  } catch {
    return defaultStudentProfile;
  }
}

export function saveStudentProfile(profile: StudentProfile) {
  const nextProfile = { ...profile, updatedAt: new Date().toISOString() };
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    window.dispatchEvent(new Event("biotutor-profile-updated"));
  }
  return nextProfile;
}

export function initialsFromName(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "ST";
}
