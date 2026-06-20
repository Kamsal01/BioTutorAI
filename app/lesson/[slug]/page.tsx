import { notFound } from "next/navigation";
import { Topbar, Shell } from "@/components/ui";
import { LessonView } from "@/components/lesson-view";
import { getLesson } from "@/lib/content";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <LessonView lesson={lesson} />
      </div>
    </Shell>
  );
}
