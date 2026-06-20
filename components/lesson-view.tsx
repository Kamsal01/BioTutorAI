import Link from "next/link";
import { Bot, CheckCircle2, ClipboardList, Image as ImageIcon, Lightbulb, Sparkles } from "lucide-react";
import type { Lesson } from "@/lib/types";
import { Card, IconButton } from "@/components/ui";

export function LessonView({ lesson }: { lesson: Lesson }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="space-y-5">
        <Card>
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">Lesson</p>
          <h1 className="mt-2 text-4xl font-black text-ink">{lesson.title}</h1>
          <p className="mt-3 text-slate-600">{lesson.introduction}</p>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-black"><CheckCircle2 className="h-5 w-5 text-leaf-600" /> Learning objectives</h2>
          <ul className="mt-4 grid gap-2 text-slate-700">
            {lesson.objectives.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Main lesson content</h2>
          <div className="mt-4 space-y-3 leading-7 text-slate-700">
            {lesson.content.map((p) => <p key={p}>{p}</p>)}
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-black"><ImageIcon className="h-5 w-5 text-coral" /> Diagram placeholder</h2>
          <div className="mt-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center font-semibold text-slate-500">{lesson.diagramPrompt}</div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-black"><Sparkles className="h-5 w-5 text-sun" /> Interactive activity</h2>
          <p className="mt-3 text-slate-700">{lesson.activity}</p>
        </Card>
      </section>
      <aside className="space-y-5">
        <Card>
          <h2 className="text-lg font-black">Key terms</h2>
          <dl className="mt-4 space-y-3">
            {lesson.keyTerms.map((term) => (
              <div key={term.term}>
                <dt className="font-bold text-ink">{term.term}</dt>
                <dd className="text-sm text-slate-600">{term.meaning}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-lg font-black"><Lightbulb className="h-5 w-5 text-sun" /> Remediation</h2>
          <p className="mt-3 text-sm text-slate-600">{lesson.remediation}</p>
        </Card>
        <div className="flex flex-wrap gap-3">
          <IconButton Icon={ClipboardList} label="Take quiz" href={`/quiz/${lesson.topicSlug}`} />
          <IconButton Icon={Bot} label="Ask tutor" href={`/tutor?topic=${lesson.topicSlug}`} />
        </div>
        <Link href="/student" className="block rounded-md border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700">Back to dashboard</Link>
      </aside>
    </div>
  );
}
