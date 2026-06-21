import { masteryFromScore, xpAward } from "@/lib/adaptive";
import type { StudentProgress } from "@/lib/types";

export type LearningHistoryItem = {
  topicSlug: string;
  title: string;
  score: number;
  xp: number;
  date: string;
};

export type StoredLearningState = {
  progress: StudentProgress[];
  history: LearningHistoryItem[];
};

const STORAGE_KEY = "biotutor-learning-state";

const emptyState: StoredLearningState = {
  progress: [],
  history: []
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadLearningState(): StoredLearningState {
  if (!canUseStorage()) return emptyState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as StoredLearningState;
    return {
      progress: Array.isArray(parsed.progress) ? parsed.progress : [],
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    return emptyState;
  }
}

export function saveQuizProgress(input: {
  topicSlug: string;
  title: string;
  score: number;
  timeSpentMinutes?: number;
}) {
  if (!canUseStorage()) return emptyState;

  const current = loadLearningState();
  const existing = current.progress.find((item) => item.topicSlug === input.topicSlug);
  const bestScore = Math.max(existing?.bestScore ?? 0, input.score);
  const completion = input.score >= 50 ? 100 : Math.max(existing?.completion ?? 0, 50);
  const updatedProgress: StudentProgress = {
    topicSlug: input.topicSlug,
    completion,
    bestScore,
    timeSpentMinutes: (existing?.timeSpentMinutes ?? 0) + (input.timeSpentMinutes ?? 5),
    mastery: masteryFromScore(bestScore)
  };

  const nextState: StoredLearningState = {
    progress: [
      ...current.progress.filter((item) => item.topicSlug !== input.topicSlug),
      updatedProgress
    ],
    history: [
      {
        topicSlug: input.topicSlug,
        title: input.title,
        score: input.score,
        xp: xpAward(input.score),
        date: new Date().toISOString()
      },
      ...current.history
    ].slice(0, 12)
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event("biotutor-progress-updated"));
  return nextState;
}

export function summarizeLearningState(state: StoredLearningState) {
  const xp = state.progress.reduce((total, item) => total + xpAward(item.bestScore), 0);
  const completed = state.progress.filter((item) => item.completion >= 100).length;
  const badges = completed === 0 ? 0 : Math.min(3, completed);
  const latestDate = state.history[0]?.date;
  const streak = latestDate ? 1 : 0;

  return {
    xp,
    level: Math.max(1, Math.floor(xp / 500) + 1),
    streak,
    badges,
    completed
  };
}
