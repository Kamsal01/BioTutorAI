import Link from "next/link";
import { Download, FilePlus2, LineChart, Users } from "lucide-react";
import { Topbar, Shell, Stat, Card, IconButton } from "@/components/ui";
import { topics } from "@/lib/content";

export default function TeacherDashboard() {
  return (
    <Shell>
      <Topbar role="teacher" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-black uppercase text-leaf-700">Teacher dashboard</p>
            <h1 className="mt-1 text-4xl font-black">Monitor mastery and manage Biology content.</h1>
          </div>
          <div className="flex gap-3">
            <IconButton Icon={FilePlus2} label="Manage lessons" href="/teacher/lessons" />
            <IconButton Icon={LineChart} label="Analytics" href="/analytics" />
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat label="Students" value="128" />
          <Stat label="Average score" value="71%" accent="text-leaf-700" />
          <Stat label="Weak topics" value="3" accent="text-coral" />
          <Stat label="Tutor chats" value="486" />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card>
            <h2 className="text-2xl font-black">Approved lesson-note management</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <h3 className="font-black">{topic.title}</h3>
                    <p className="text-sm text-slate-600">{topic.description}</p>
                  </div>
                  <Link href={`/teacher/lessons?topic=${topic.slug}`} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">Edit</Link>
                </div>
              ))}
            </div>
          </Card>
          <aside className="space-y-5">
            <Card>
              <h2 className="flex items-center gap-2 text-xl font-black"><Users className="h-5 w-5 text-leaf-700" /> Students needing support</h2>
              <p className="mt-3 text-sm text-slate-600">No student records yet. Learners who score below the mastery threshold will appear here after completing quizzes.</p>
            </Card>
            <Card>
              <h2 className="flex items-center gap-2 text-xl font-black"><Download className="h-5 w-5 text-coral" /> Reports</h2>
              <p className="mt-2 text-sm text-slate-600">Export quiz performance, topic mastery, engagement, and chatbot interaction summaries as CSV from Supabase or your reporting job.</p>
            </Card>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
