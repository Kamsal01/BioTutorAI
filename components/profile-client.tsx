"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Save, ShieldCheck, Upload, UserRound } from "lucide-react";
import { Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import {
  defaultStudentProfile,
  initialsFromName,
  loadStudentProfile,
  saveStudentProfile,
  type StudentProfile
} from "@/lib/profile-store";

type Message = {
  tone: "success" | "error" | "info";
  text: string;
};

const classLevels = ["JSS1", "JSS2", "JSS3", "SSI", "SSII", "SSIII"];

export function ProfileClient() {
  const [profile, setProfile] = useState<StudentProfile>(defaultStudentProfile);
  const [message, setMessage] = useState<Message | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const localProfile = loadStudentProfile();
      if (active) setProfile(localProfile);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url, school_name, class_level, bio")
        .eq("id", user.id)
        .maybeSingle();

      if (!active || !data) return;

      const remoteProfile = saveStudentProfile({
        fullName: data.full_name || user.user_metadata?.full_name || localProfile.fullName,
        role: data.role === "teacher" ? "teacher" : "student",
        avatarUrl: data.avatar_url || localProfile.avatarUrl,
        schoolName: data.school_name || localProfile.schoolName,
        classLevel: data.class_level || localProfile.classLevel,
        bio: data.bio || localProfile.bio
      });
      setProfile(remoteProfile);
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [supabase]);

  function updateField(field: keyof StudentProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ tone: "error", text: "Please choose an image file." });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ tone: "error", text: "Please choose an image below 2 MB." });
      return;
    }

    setUploading(true);
    const localPreview = await readFileAsDataUrl(file);
    let avatarUrl = localPreview;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const extension = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${extension}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: true
      });

      if (!error) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = data.publicUrl;
      } else {
        setMessage({ tone: "info", text: "Picture saved on this browser. Create the Supabase avatars bucket to sync it online." });
      }
    }

    const nextProfile = saveStudentProfile({ ...profile, avatarUrl });
    setProfile(nextProfile);
    setUploading(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const nextProfile = saveStudentProfile(profile);
    setProfile(nextProfile);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: nextProfile.fullName,
          avatar_url: nextProfile.avatarUrl,
          school_name: nextProfile.schoolName,
          class_level: nextProfile.classLevel,
          bio: nextProfile.bio,
          updated_at: nextProfile.updatedAt
        })
        .eq("id", user.id);

      if (error) {
        setMessage({ tone: "info", text: "Profile saved on this browser. Run the latest Supabase schema to sync these fields online." });
        setSaving(false);
        return;
      }
    }

    setMessage({ tone: "success", text: "Profile saved successfully." });
    setSaving(false);
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card>
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={`${profile.fullName} profile`} className="h-32 w-32 rounded-lg object-cover ring-4 ring-leaf-100" />
            ) : (
              <span className="grid h-32 w-32 place-items-center rounded-lg bg-leaf-500 text-4xl font-black text-white ring-4 ring-leaf-100">
                {initialsFromName(profile.fullName)}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-md bg-ink px-3 py-2 text-xs font-black text-white shadow-sm"
            >
              <Camera className="h-4 w-4" />
              {uploading ? "Uploading" : "Photo"}
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <h2 className="mt-8 text-2xl font-black">{profile.fullName || "Student User"}</h2>
          <p className="text-sm font-semibold text-slate-600">{profile.classLevel} Biology learner</p>
          <div className="mt-5 grid w-full gap-3 text-left text-sm">
            <div className="rounded-lg bg-leaf-50 p-4">
              <p className="flex items-center gap-2 font-black text-leaf-700"><ShieldCheck className="h-4 w-4" /> Account</p>
              <p className="mt-1 text-slate-600">Authentication is managed by Supabase Auth when connected.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="font-black">Picture upload</p>
              <p className="mt-1 text-slate-600">Images are previewed immediately and sync to Supabase Storage when the avatars bucket exists.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase text-leaf-700"><UserRound className="h-4 w-4" /> Student profile</p>
            <h2 className="mt-1 text-2xl font-black">Edit your details</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="font-bold">
              Full name
              <input value={profile.fullName} onChange={(event) => updateField("fullName", event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
            <label className="font-bold">
              Class level
              <select value={profile.classLevel} onChange={(event) => updateField("classLevel", event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium">
                {classLevels.map((level) => <option key={level}>{level}</option>)}
              </select>
            </label>
            <label className="font-bold md:col-span-2">
              School name
              <input value={profile.schoolName} onChange={(event) => updateField("schoolName", event.target.value)} placeholder="Enter your school name" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
            <label className="font-bold md:col-span-2">
              Short bio
              <textarea value={profile.bio} onChange={(event) => updateField("bio", event.target.value)} rows={4} maxLength={180} placeholder="Example: I am learning conservation, pest control, and reproduction in birds and mammals." className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
          </div>

          {message ? (
            <p className={`rounded-md px-4 py-3 text-sm font-bold ${message.tone === "error" ? "bg-red-50 text-coral" : message.tone === "info" ? "bg-sun/15 text-ink" : "bg-leaf-50 text-leaf-700"}`}>
              {message.text}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-leaf-500 px-5 py-3 font-black text-white hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? "Saving" : "Save profile"}
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 font-black text-ink hover:bg-slate-50">
              <Upload className="h-4 w-4" />
              Upload picture
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
