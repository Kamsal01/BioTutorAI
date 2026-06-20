import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Shell, Card } from "@/components/ui";

export default function OfflinePage() {
  return (
    <Shell>
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-4">
        <Card>
          <WifiOff className="h-10 w-10 text-coral" />
          <h1 className="mt-4 text-4xl font-black">Offline lesson access</h1>
          <p className="mt-3 text-slate-600">Previously opened lessons and static assets are cached by the PWA service worker. New quizzes, AI tutor messages, and progress sync resume when the connection returns.</p>
          <Link href="/student" className="mt-6 inline-block rounded-md bg-leaf-500 px-5 py-3 font-black text-white">Return to dashboard</Link>
        </Card>
      </div>
    </Shell>
  );
}
