"use client";

import { useEffect, useState } from "react";
import { Card, ProgressBar } from "@/components/ui";
import { topics } from "@/lib/content";
import { loadLearningState, type StoredLearningState } from "@/lib/progress-store";

export function ProgressClient() {
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

  if (state.progress.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-black">No progress yet</h2>
        <p className="mt-2 text-slate-600">Start from Lesson One, complete the lesson activities, and take the quiz. Your scores, time spent, and mastery level will appear here.</p>
      </Card>
    );
  }

  return (
    <>
      {state.progress.map((item) => {
        const topic = topics.find((topicItem) => topicItem.slug === item.topicSlug);
        return (
          <Card key={item.topicSlug}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{topic?.title ?? item.topicSlug}</h2>
                <p className="text-sm capitalize text-slate-600">{item.mastery.replace("-", " ")} - {item.timeSpentMinutes} min spent</p>
              </div>
              <p className="text-2xl font-black text-leaf-700">{item.bestScore}%</p>
            </div>
            <div className="mt-4"><ProgressBar value={item.completion} /></div>
          </Card>
        );
      })}
    </>
  );
}
