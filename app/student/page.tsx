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
            <h1 className="mt-1 text-4xl font-black">Keep your Biology streak alive.</h1>
          </div>
          <IconButton Icon={Bot} label="Ask BioTutor" href="/tutor" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat label="XP points" value="1,420" accent="text-leaf-700" />
          <Stat label="Level" value="6" />
          <Stat label="Daily streak" value="9 days" accent="text-coral" />
          <Stat label="Badges" value="12" accent="text-sun" />
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
              <p className="mt-2 text-slate-600">Pests and diseases needs remediation. Review the summary, ask BioTutor for a simpler explanation, then retry easy questions.</p>
              <ProgressBar value={45} />
            </Card>
            <Card>
              <h2 className="flex items-center gap-2 text-xl font-black"><Award className="h-5 w-5 text-leaf-700" /> Rewards</h2>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm font-bold">
                {["Conservation Keeper", "Quiz Sprint", "Streak Star"].map((badge) => <span key={badge} className="rounded-lg bg-leaf-50 p-3 text-leaf-700">{badge}</span>)}
              </div>
            </Card>
            <Card>
              <h2 className="flex items-center gap-2 text-xl font-black"><Flame className="h-5 w-5 text-coral" /> Learning history</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Completed Conservation post-test: 86%</li>
                <li>Asked 4 tutor questions about pest control</li>
                <li>Unlocked Forest and Wildlife Conservation practice set</li>
              </ul>
            </Card>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
