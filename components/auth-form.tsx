"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/types";

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("example.supabase.co") &&
      key !== "local-dev-placeholder"
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const fullName = String(formData.get("fullName") || "");

    if (!isSupabaseConfigured()) {
      setMessage("Supabase is not connected yet. Use demo mode now, or add your real Supabase URL and anon key in .env.local, then restart the dev server.");
      return;
    }

    const supabase = createClient();
    const response = await (async () => {
      try {
        return mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password, options: { data: { role, full_name: fullName } } });
      } catch {
        return {
          error: {
            message: "Supabase is not connected yet. Add your real Supabase URL and anon key in .env.local, then restart the dev server."
          }
        };
      }
    })();

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    router.push(role === "teacher" ? "/teacher" : "/student");
  }

  return (
    <form action={submit} className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      {mode === "register" ? (
        <label className="block text-sm font-bold text-slate-700">Full name
          <input name="fullName" required className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3" />
        </label>
      ) : null}
      <label className="mt-4 block text-sm font-bold text-slate-700">Email
        <input name="email" type="email" required className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3" />
      </label>
      <label className="mt-4 block text-sm font-bold text-slate-700">Password
        <input name="password" type="password" required minLength={6} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3" />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
        {(["student", "teacher"] as Role[]).map((item) => (
          <button key={item} type="button" onClick={() => setRole(item)} className={`rounded-md px-3 py-2 text-sm font-black capitalize ${role === item ? "bg-white text-leaf-700 shadow-sm" : "text-slate-600"}`}>{item}</button>
        ))}
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-coral">{message}</p> : null}
      <button className="mt-5 w-full rounded-md bg-leaf-500 px-4 py-3 font-black text-white hover:bg-leaf-700">{mode === "login" ? "Sign in" : "Create account"}</button>
      <button type="button" onClick={() => router.push(role === "teacher" ? "/teacher" : "/student")} className="mt-3 w-full rounded-md border border-slate-300 bg-white px-4 py-3 font-black text-ink hover:bg-slate-50">
        Continue in demo mode
      </button>
    </form>
  );
}
