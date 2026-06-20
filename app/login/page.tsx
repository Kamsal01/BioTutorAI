import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Shell } from "@/components/ui";

export default function LoginPage() {
  return (
    <Shell>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <h1 className="text-4xl font-black">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in as a student or teacher to continue learning.</p>
        <AuthForm mode="login" />
        <p className="mt-5 text-sm text-slate-600">New to BioTutor? <Link className="font-bold text-leaf-700" href="/register">Create an account</Link></p>
      </div>
    </Shell>
  );
}
