"use client";

import { useState, useTransition } from "react";
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

function friendlyAuthMessage(message: string, mode: "login" | "register") {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Invalid login credentials. Please use the email address you registered with, not your name or username, and check the password. If you have not created an account yet, click Create an account below.";
  }

  if (lower.includes("email not confirmed")) {
    return "Your email has not been confirmed yet. Check your inbox for the Supabase confirmation email, then try signing in again.";
  }

  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "This email is already registered. Go to Sign in, or use the password reset option if you forgot the password.";
  }

  if (lower.includes("password")) {
    return mode === "login"
      ? "The password does not match this email address. Try again or send a password reset link."
      : message;
  }

  return message;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    const normalizedEmail = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const fullName = String(formData.get("fullName") || "").trim();
    setEmail(normalizedEmail);

    if (!isSupabaseConfigured()) {
      setMessage("Supabase is not connected yet. Use demo mode now, or add your real Supabase URL and anon key in .env.local, then restart the dev server.");
      return;
    }

    const supabase = createClient();
    const response = await (async () => {
      try {
        return mode === "login"
          ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
          : await supabase.auth.signUp({ email: normalizedEmail, password, options: { data: { role, full_name: fullName } } });
      } catch {
        return {
          error: {
            message: "Supabase is not connected yet. Add your real Supabase URL and anon key in .env.local, then restart the dev server."
          }
        };
      }
    })();

    if (response.error) {
      setMessage(friendlyAuthMessage(response.error.message, mode));
      return;
    }

    if (mode === "register" && !response.data.session) {
      setMessage("Account created. Check your email for the confirmation link, then come back to sign in.");
      return;
    }

    const actualRole = response.data.user?.user_metadata?.role === "teacher" ? "teacher" : role;
    startTransition(() => router.push(actualRole === "teacher" ? "/teacher" : "/student"));
  }

  async function sendPasswordReset() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setMessage("Enter your registered email address first, then click reset password.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setMessage("Supabase is not connected yet, so password reset cannot be sent.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/login`
    });

    if (error) {
      setMessage(friendlyAuthMessage(error.message, mode));
      return;
    }

    setMessage("Password reset link sent. Check the inbox for your registered email address.");
  }

  return (
    <form action={submit} className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      {mode === "register" ? (
        <label className="block text-sm font-bold text-slate-700">Full name
          <input name="fullName" required className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3" />
        </label>
      ) : null}
      <label className="mt-4 block text-sm font-bold text-slate-700">Email address
        <input name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Use your registered email, not username" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3" />
      </label>
      <label className="mt-4 block text-sm font-bold text-slate-700">Password
        <input name="password" type="password" required minLength={6} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3" />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
        {(["student", "teacher"] as Role[]).map((item) => (
          <button key={item} type="button" onClick={() => setRole(item)} className={`rounded-md px-3 py-2 text-sm font-black capitalize ${role === item ? "bg-white text-leaf-700 shadow-sm" : "text-slate-600"}`}>{item}</button>
        ))}
      </div>
      {message ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-coral">{message}</p> : null}
      <button disabled={isPending} className="mt-5 w-full rounded-md bg-leaf-500 px-4 py-3 font-black text-white hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-60">{isPending ? "Please wait" : mode === "login" ? "Sign in" : "Create account"}</button>
      {mode === "login" ? (
        <button type="button" onClick={sendPasswordReset} className="mt-3 w-full rounded-md border border-slate-300 bg-white px-4 py-3 font-black text-ink hover:bg-slate-50">
          Reset password
        </button>
      ) : null}
      <button type="button" onClick={() => router.push(role === "teacher" ? "/teacher" : "/student")} className="mt-3 w-full rounded-md border border-slate-300 bg-white px-4 py-3 font-black text-ink hover:bg-slate-50">
        Continue in demo mode
      </button>
    </form>
  );
}
