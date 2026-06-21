"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, RotateCcw } from "lucide-react";
import type { Lesson } from "@/lib/types";
import { masteryFromScore, nextDifficulty, scoreAttempt, xpAward } from "@/lib/adaptive";
import { Card, ProgressBar } from "@/components/ui";
import { saveQuizProgress } from "@/lib/progress-store";

export function QuizClient({ lesson }: { lesson: Lesson }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const result = useMemo(() => scoreAttempt(answers, lesson.questions), [answers, lesson.questions]);
  const recommendedDifficulty = nextDifficulty(result.score);
  const xp = xpAward(result.score);

  function submitQuiz() {
    setSubmitted(true);
    saveQuizProgress({
      topicSlug: lesson.topicSlug,
      title: lesson.title,
      score: result.score,
      timeSpentMinutes: Math.max(5, lesson.questions.length * 2)
    });
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card>
        <p className="text-sm font-black uppercase text-leaf-700">Adaptive quiz</p>
        <h1 className="mt-2 text-3xl font-black">{lesson.title}</h1>
        <p className="mt-2 text-slate-600">Multiple-choice only. Score 50% or above to progress; below 50% opens remediation.</p>
      </Card>
      {lesson.questions.map((question, index) => (
        <Card key={question.id}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-black">Question {index + 1}: {question.prompt}</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">{question.difficulty}</span>
          </div>
          <div className="mt-4 grid gap-2">
            {question.options.map((option) => {
              const selected = answers[question.id] === option;
              const correct = submitted && option === question.correctAnswer;
              const wrong = submitted && selected && option !== question.correctAnswer;
              return (
                <button
                  key={option}
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                  className={`rounded-md border px-4 py-3 text-left font-semibold ${correct ? "border-leaf-500 bg-leaf-50" : wrong ? "border-coral bg-red-50" : selected ? "border-ink bg-slate-50" : "border-slate-200 bg-white"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {submitted ? <p className="mt-3 text-sm text-slate-600">{question.explanation}</p> : null}
        </Card>
      ))}
      <Card>
        {!submitted ? (
          <button onClick={submitQuiz} className="w-full rounded-md bg-leaf-500 px-5 py-3 font-black text-white hover:bg-leaf-700">Submit quiz</button>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">Result</p>
                <p className="text-4xl font-black">{result.score}%</p>
              </div>
              <div className="rounded-lg bg-leaf-50 p-4 text-leaf-700">
                <Award className="h-7 w-7" />
                <p className="font-black">+{xp} XP</p>
              </div>
            </div>
            <ProgressBar value={result.score} />
            <p className="font-semibold text-slate-700">
              {result.passed ? `Progress unlocked. Next recommended difficulty: ${recommendedDifficulty}.` : `Remediation recommended. Review the lesson and retry easy questions.`}
            </p>
            {saved ? <p className="rounded-md bg-leaf-50 px-4 py-3 text-sm font-bold text-leaf-700">Progress saved. Your dashboard and progress page have been updated.</p> : null}
            <p className="text-sm font-bold capitalize text-slate-500">Mastery: {masteryFromScore(result.score).replace("-", " ")}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => { setSubmitted(false); setAnswers({}); setSaved(false); }} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-3 font-bold">
                <RotateCcw className="h-4 w-4" /> Retry
              </button>
              <Link href={`/lesson/${lesson.topicSlug}`} className="rounded-md bg-ink px-4 py-3 font-bold text-white">Back to lesson</Link>
              <Link href="/progress" className="rounded-md border border-leaf-500 px-4 py-3 font-bold text-leaf-700">View progress</Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
