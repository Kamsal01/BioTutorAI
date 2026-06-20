import type { Difficulty, Question, StudentProgress } from "@/lib/types";

export function scoreAttempt(answers: Record<string, string>, questions: Question[]) {
  const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  return { correct, total: questions.length, score, passed: score >= 50 };
}

export function nextDifficulty(score: number): Difficulty {
  if (score >= 80) return "hard";
  if (score >= 50) return "medium";
  return "easy";
}

export function xpAward(score: number, completedLesson = true) {
  const completionXp = completedLesson ? 40 : 0;
  const performanceXp = Math.max(10, Math.round(score * 0.8));
  const masteryBonus = score >= 80 ? 35 : 0;
  return completionXp + performanceXp + masteryBonus;
}

export function masteryFromScore(score: number): StudentProgress["mastery"] {
  if (score < 50) return "needs-remediation";
  if (score < 80) return "developing";
  return "mastered";
}

export function recommendations(progress: StudentProgress[]) {
  const weak = progress.filter((p) => p.mastery === "needs-remediation").slice(0, 3);
  if (weak.length) return weak.map((p) => p.topicSlug);
  return progress.filter((p) => p.completion < 100).slice(0, 3).map((p) => p.topicSlug);
}
