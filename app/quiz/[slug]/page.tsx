import { notFound } from "next/navigation";
import { Topbar, Shell } from "@/components/ui";
import { QuizClient } from "@/components/quiz-client";
import { getLesson } from "@/lib/content";

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  return (
    <Shell>
      <Topbar role="student" />
      <div className="px-4 py-8">
        <QuizClient lesson={lesson} />
      </div>
    </Shell>
  );
}
