import { Save, Trash2 } from "lucide-react";
import { Topbar, Shell, Card } from "@/components/ui";
import { topics } from "@/lib/content";

export default function TeacherLessonsPage() {
  return (
    <Shell>
      <Topbar role="teacher" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-4xl font-black">Approved note management</h1>
        <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
          <Card>
            <h2 className="text-xl font-black">Topics</h2>
            <div className="mt-4 space-y-2">
              {topics.map((topic) => <button key={topic.id} className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-bold hover:bg-leaf-50">{topic.title}</button>)}
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-black">Create or edit approved content</h2>
            <form className="mt-4 grid gap-4">
              <input className="rounded-md border border-slate-300 px-3 py-3" placeholder="Topic title" />
              <textarea className="min-h-24 rounded-md border border-slate-300 px-3 py-3" placeholder="Learning objectives" />
              <textarea className="min-h-32 rounded-md border border-slate-300 px-3 py-3" placeholder="Main lesson content from Ifeoma_lesson updated.docx" />
              <textarea className="min-h-24 rounded-md border border-slate-300 px-3 py-3" placeholder="Key terms, activity, remediation, summary" />
              <div className="flex gap-3">
                <button className="inline-flex items-center gap-2 rounded-md bg-leaf-500 px-4 py-3 font-black text-white"><Save className="h-4 w-4" /> Save for teacher approval</button>
                <button type="button" className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-3 font-black text-slate-700"><Trash2 className="h-4 w-4" /> Delete</button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
