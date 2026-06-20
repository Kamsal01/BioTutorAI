import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Shell } from "@/components/ui";

export default function RegisterPage() {
  return (
    <Shell>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <h1 className="text-4xl font-black">Join BioTutor</h1>
        <p className="mt-2 text-slate-600">Create a secure account and choose your role.</p>
        <AuthForm mode="register" />
        <p className="mt-5 text-sm text-slate-600">Already registered? <Link className="font-bold text-leaf-700" href="/login">Sign in</Link></p>
      </div>
    </Shell>
  );
}
