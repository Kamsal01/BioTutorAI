import { Award, Bot, Flame, Trophy } from "lucide-react";
import { Topbar, Shell, Stat, Card, IconButton, ProgressBar } from "@/components/ui";
import { TopicCard } from "@/components/topic-card";
import { demoProgress, topics } from "@/lib/content";

export default function StudentDashboard() {
  const progressByTopic = new Map(demoProgress.map((p) => [p.topicSlug, p]));
  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-black uppercase text-leaf-700">Student dashboard</p>
            <h1 className="mt-1 text-4xl font-black">Start your Biology learning journey.</h1>
          </div>
          <IconButton Icon={Bot} label="Ask BioTutor" href="/tutor" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat label="XP points" value="0" accent="text-leaf-700" />
          <Stat label="Level" value="1" />
          <Stat label="Daily streak" value="0 days" accent="text-coral" />
          <Stat label="Badges" value="0" accent="text-sun" />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <section>
            <h2 className="mb-4 text-2xl font-black">Approved lesson-note topics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {topics.map((topic) => <TopicCard key={topic.id} topic={topic} progress={progressByTopic.get(topic.slug)?.completion ?? 0} />)}
            </div>
          </section>
          <aside className="space-y-5">
            <Card>
              <h2 className="flex items-center gap-2 text-xl font-black"><Trophy className="h-5 w-5 text-sun" /> Recommended next</h2>
              <p className="mt-2 text-slate-600">Begin with Lesson One: Conservation of Natural Resources. Read the objectives, study the lesson, ask BioTutor questions, then take the quiz.</p>
              <ProgressBar value={0} />
            </Card>
            <Card>
              <h2 className="flex items-center gap-2 text-xl font-black"><Award className="h-5 w-5 text-leaf-700" /> Rewards</h2>
              <p className="mt-3 text-sm text-slate-600">No badges yet. Complete lessons and pass quizzes to earn your first rewards.</p>
            </Card>
            <Card>
              <h2 className="flex items-center gap-2 text-xl font-black"><Flame className="h-5 w-5 text-coral" /> Learning history</h2>
              <p className="mt-3 text-sm text-slate-600">No learning history yet. Your completed lessons, quiz attempts, and tutor activity will appear here as you learn.</p>
            </Card>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
