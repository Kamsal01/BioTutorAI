import { Topbar, Shell, Card, ProgressBar } from "@/components/ui";
import { demoProgress, topics } from "@/lib/content";

export default function ProgressPage() {
  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-4xl font-black">Progress</h1>
        <div className="mt-6 grid gap-4">
          {demoProgress.length === 0 ? (
            <Card>
              <h2 className="text-xl font-black">No progress yet</h2>
              <p className="mt-2 text-slate-600">Start from Lesson One, complete the lesson activities, and take the quiz. Your scores, time spent, and mastery level will appear here.</p>
            </Card>
          ) : demoProgress.map((item) => {
            const topic = topics.find((t) => t.slug === item.topicSlug);
            return (
              <Card key={item.topicSlug}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">{topic?.title}</h2>
                    <p className="text-sm capitalize text-slate-600">{item.mastery.replace("-", " ")} • {item.timeSpentMinutes} min spent</p>
                  </div>
                  <p className="text-2xl font-black text-leaf-700">{item.bestScore}%</p>
                </div>
                <div className="mt-4"><ProgressBar value={item.completion} /></div>
              </Card>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
