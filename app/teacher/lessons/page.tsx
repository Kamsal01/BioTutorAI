import { Topbar, Shell } from "@/components/ui";
import { TeacherLessonEditor } from "@/components/teacher-lesson-editor";

export default function TeacherLessonsPage() {
  return (
    <Shell>
      <Topbar role="teacher" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-4xl font-black">Approved note management</h1>
        <TeacherLessonEditor />
      </div>
    </Shell>
  );
}
