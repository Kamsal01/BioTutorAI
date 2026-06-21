"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Bot, Flame, Trophy } from "lucide-react";
import { Card, IconButton, ProgressBar, Stat } from "@/components/ui";
import { TopicCard } from "@/components/topic-card";
import { topics } from "@/lib/content";
import { loadLearningState, summarizeLearningState, type StoredLearningState } from "@/lib/progress-store";

export function StudentDashboardClient() {
  const [state, setState] = useState<StoredLearningState>({ progress: [], history: [] });

  useEffect(() => {
    const update = () => setState(loadLearningState());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("biotutor-progress-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("biotutor-progress-updated", update);
    };
  }, []);

  const summary = useMemo(() => summarizeLearningState(state), [state]);
  const progressByTopic = new Map(state.progress.map((item) => [item.topicSlug, item]));
  const nextTopic = topics.find((topic) => (progressByTopic.get(topic.slug)?.completion ?? 0) < 100) ?? topics[0];
  const nextProgress = nextTopic ? progressByTopic.get(nextTopic.slug)?.completion ?? 0 : 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-black uppercase text-leaf-700">Student dashboard</p>
          <h1 className="mt-1 text-4xl font-black">Start your Biology learning journey.</h1>
        </div>
        <IconButton Icon={Bot} label="Ask BioTutor" href="/tutor" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat label="XP points" value={String(summary.xp)} accent="text-leaf-700" />
        <Stat label="Level" value={String(summary.level)} />
        <Stat label="Daily streak" value={`${summary.streak} day${summary.streak === 1 ? "" : "s"}`} accent="text-coral" />
        <Stat label="Badges" value={String(summary.badges)} accent="text-sun" />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="mb-4 text-2xl font-black">Approved lesson-note topics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} progress={progressByTopic.get(topic.slug)?.completion ?? 0} />
            ))}
          </div>
        </section>
        <aside className="space-y-5">
          <Card>
            <h2 className="flex items-center gap-2 text-xl font-black"><Trophy className="h-5 w-5 text-sun" /> Recommended next</h2>
            <p className="mt-2 text-slate-600">
              {nextTopic ? `Continue with ${nextTopic.title}. Read the lesson, ask BioTutor questions, then take the quiz.` : "All lessons completed. Review any topic or retry quizzes for mastery."}
            </p>
            <ProgressBar value={nextProgress} />
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 text-xl font-black"><Award className="h-5 w-5 text-leaf-700" /> Rewards</h2>
            {summary.badges === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No badges yet. Complete lessons and pass quizzes to earn your first rewards.</p>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm font-bold">
                {["Conservation Keeper", "Quiz Sprint", "Streak Star"].slice(0, summary.badges).map((badge) => (
                  <span key={badge} className="rounded-lg bg-leaf-50 p-3 text-leaf-700">{badge}</span>
                ))}
              </div>
            )}
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 text-xl font-black"><Flame className="h-5 w-5 text-coral" /> Learning history</h2>
            {state.history.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No learning history yet. Your completed lessons, quiz attempts, and tutor activity will appear here as you learn.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {state.history.slice(0, 5).map((item) => (
                  <li key={`${item.topicSlug}-${item.date}`}>{item.title}: {item.score}% (+{item.xp} XP)</li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
