import { Topbar, Shell } from "@/components/ui";
import { QuizGenerator } from "@/components/quiz-generator";
import { TeacherQuizManager } from "@/components/teacher-quiz-manager";

export default function TeacherQuizzesPage() {
  return (
    <Shell>
      <Topbar role="teacher" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-4xl font-black">Quiz management</h1>
        <p className="mt-2 max-w-3xl text-slate-600">Each Biology module should have exactly 20 multiple-choice questions. Generate drafts, upload or paste questions, review them, then publish for students.</p>
        <div className="mt-6 grid gap-5 xl:grid-cols-[420px_1fr]">
          <QuizGenerator />
          <TeacherQuizManager />
        </div>
      </div>
    </Shell>
  );
}
