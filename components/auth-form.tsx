"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import type { Role } from "@/lib/types";

function friendlyAuthMessage(codeOrMessage: string, mode: "login" | "register") {
  const lower = codeOrMessage.toLowerCase();

  if (lower.includes("auth/invalid-credential") || lower.includes("auth/wrong-password") || lower.includes("auth/user-not-found")) {
    return "Invalid login details. Please use the email address you registered with and check the password. If you have not created an account yet, click Create an account below.";
  }

  if (lower.includes("auth/email-already-in-use")) {
    return "This email is already registered. Go to Sign in, or use reset password if you forgot the password.";
  }

  if (lower.includes("auth/weak-password")) {
    return "Password is too weak. Use at least 6 characters.";
  }

  if (lower.includes("auth/invalid-email")) {
    return "The email address is not valid. Please check it and try again.";
  }

  if (lower.includes("auth/network-request-failed")) {
    return "Network error. Check your internet connection and try again.";
  }

  if (lower.includes("password")) {
    return mode === "login" ? "The password does not match this email address. Try again or send a password reset link." : codeOrMessage;
  }

  return codeOrMessage;
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

    if (!isFirebaseConfigured()) {
      setMessage("Firebase is not connected yet. Add your Firebase environment variables in .env.local or Vercel, then restart/redeploy.");
      return;
    }

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      const credential = mode === "login"
        ? await signInWithEmailAndPassword(auth, normalizedEmail, password)
        : await createUserWithEmailAndPassword(auth, normalizedEmail, password);

      if (mode === "register") {
        if (fullName) await updateProfile(credential.user, { displayName: fullName });
        await setDoc(doc(db, "profiles", credential.user.uid), {
          full_name: fullName,
          email: normalizedEmail,
          role,
          avatar_url: "",
          school_name: "",
          class_level: "SSII",
          bio: "",
          xp: 0,
          level: 1,
          daily_streak: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        }, { merge: true });
      }

      let actualRole: Role = role;
      const profileSnap = await getDoc(doc(db, "profiles", credential.user.uid));
      const profileRole = profileSnap.data()?.role;
      if (profileRole === "teacher" || profileRole === "student") actualRole = profileRole;

      startTransition(() => router.push(actualRole === "teacher" ? "/teacher" : "/student"));
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : error instanceof Error ? error.message : "Could not sign in.";
      setMessage(friendlyAuthMessage(code, mode));
    }
  }

  async function sendPasswordReset() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setMessage("Enter your registered email address first, then click reset password.");
      return;
    }

    if (!isFirebaseConfigured()) {
      setMessage("Firebase is not connected yet, so password reset cannot be sent.");
      return;
    }

    try {
      await sendPasswordResetEmail(getFirebaseAuth(), normalizedEmail);
      setMessage("Password reset link sent. Check the inbox for your registered email address.");
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : error instanceof Error ? error.message : "Could not send password reset.";
      setMessage(friendlyAuthMessage(code, mode));
    }
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
