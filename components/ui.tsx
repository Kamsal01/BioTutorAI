import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eefdf4,transparent_34%),#f7fbf8]">{children}</main>;
}

export function Topbar({ role }: { role?: "student" | "teacher" }) {
  const href = role === "teacher" ? "/teacher" : "/student";
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-leaf-500 text-white">B</span>
          BioTutor ITS
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Link href={href} className="rounded-md px-3 py-2 hover:bg-leaf-50">Dashboard</Link>
          <Link href="/tutor" className="rounded-md px-3 py-2 hover:bg-leaf-50">AI Tutor</Link>
          <Link href="/leaderboard" className="rounded-md px-3 py-2 hover:bg-leaf-50">Leaderboard</Link>
          <Link href="/profile" className="rounded-md bg-ink px-3 py-2 text-white">Profile</Link>
        </nav>
      </div>
    </header>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-soft", className)}>{children}</section>;
}

export function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={cn("mt-2 text-3xl font-black text-ink", accent)}>{value}</p>
    </Card>
  );
}

export function IconButton({ Icon, label, href }: { Icon: LucideIcon; label: string; href: string }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-2 rounded-md bg-leaf-500 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-leaf-700">
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-leaf-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
