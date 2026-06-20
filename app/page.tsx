import Link from "next/link";
import { ArrowRight, Bot, GraduationCap, LineChart, ShieldCheck, type LucideIcon } from "lucide-react";
import { Shell } from "@/components/ui";

const featureCards: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Bot, title: "AI Biology tutor", text: "Guided explanations, follow-up questions, and Biology-only guardrails." },
  { Icon: GraduationCap, title: "Adaptive mastery", text: "Pre-tests, quizzes, remediation, XP, badges, and level unlocks." },
  { Icon: LineChart, title: "Teacher analytics", text: "Weak topics, engagement, quiz scores, and export-ready reporting." },
  { Icon: ShieldCheck, title: "Secure by design", text: "Supabase Auth, role-based access, RLS policies, and protected API keys." }
];

export default function LandingPage() {
  return (
    <Shell>
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-black uppercase tracking-wide text-leaf-700">BioTutor ITS</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight text-ink md:text-7xl">Biology learning that adapts to every secondary school student.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Structured lessons, Gemini-powered tutoring, adaptive quizzes, gamified progress, teacher analytics, and offline lesson access in one classroom-ready platform.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-md bg-leaf-500 px-5 py-3 font-black text-white hover:bg-leaf-700">Create account <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login" className="rounded-md border border-slate-300 bg-white px-5 py-3 font-black text-ink">Sign in</Link>
          </div>
        </div>
        <div className="grid gap-4">
          {featureCards.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <Icon className="h-7 w-7 text-leaf-600" />
              <h2 className="mt-3 font-black text-ink">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
