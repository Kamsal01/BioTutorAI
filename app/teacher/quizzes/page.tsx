import { Plus } from "lucide-react";
import { Topbar, Shell, Card } from "@/components/ui";
import { QuizGenerator } from "@/components/quiz-generator";

export default function TeacherQuizzesPage() {
  return (
    <Shell>
      <Topbar role="teacher" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-4xl font-black">Quiz management</h1>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <QuizGenerator />
          <Card>
            <h2 className="flex items-center gap-2 text-xl font-black"><Plus className="h-5 w-5 text-coral" /> Add manually</h2>
            <form className="mt-4 grid gap-3">
              <textarea className="rounded-md border border-slate-300 px-3 py-3" placeholder="Question text" />
              {["Option A", "Option B", "Option C", "Option D"].map((label) => <input key={label} className="rounded-md border border-slate-300 px-3 py-3" placeholder={label} />)}
              <input className="rounded-md border border-slate-300 px-3 py-3" placeholder="Correct answer" />
              <textarea className="rounded-md border border-slate-300 px-3 py-3" placeholder="Explanation" />
              <button className="rounded-md bg-ink px-4 py-3 font-black text-white">Save question</button>
            </form>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
