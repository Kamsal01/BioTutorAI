"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardPaste, Save, Upload } from "lucide-react";
import { Card } from "@/components/ui";
import { topics } from "@/lib/content";
import type { Difficulty, Question } from "@/lib/types";
import {
  completeQuestions,
  getLocalQuizBank,
  loadQuizBanks,
  parseQuestionUpload,
  publishQuizBank,
  QUESTIONS_PER_MODULE,
  saveQuizBank,
  type QuizBank
} from "@/lib/quiz-store";

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

export function TeacherQuizManager() {
  const [banks, setBanks] = useState<QuizBank[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState<QuizBank | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const loaded = loadQuizBanks();
    setBanks(loaded);
    setSelectedSlug(loaded[0]?.topicSlug ?? "");
    setDraft(loaded[0] ?? null);
  }, []);

  const completeCount = useMemo(() => completeQuestions(draft?.questions ?? []).length, [draft]);

  function selectBank(slug: string) {
    const bank = banks.find((item) => item.topicSlug === slug) ?? getLocalQuizBank(slug);
    setSelectedSlug(slug);
    setDraft(bank);
    setMessage("");
  }

  function updateQuestion(index: number, patch: Partial<Question>) {
    if (!draft) return;
    setDraft({
      ...draft,
      questions: draft.questions.map((question, questionIndex) => questionIndex === index ? { ...question, ...patch } : question)
    });
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    if (!draft) return;
    const question = draft.questions[questionIndex];
    const options = [...question.options];
    options[optionIndex] = value;
    updateQuestion(questionIndex, { options });
  }

  function saveDraft() {
    if (!draft) return;
    const nextBanks = saveQuizBank(draft);
    setBanks(nextBanks);
    setDraft(nextBanks.find((bank) => bank.topicSlug === draft.topicSlug) ?? draft);
    setMessage(`Draft saved. Complete ${QUESTIONS_PER_MODULE} questions, then publish for students.`);
  }

  async function publish() {
    if (!draft) return;
    setPublishing(true);
    try {
      const nextBanks = saveQuizBank(draft);
      setBanks(nextBanks);
      await publishQuizBank(draft);
      setMessage(`Published ${QUESTIONS_PER_MODULE} questions for this module. Students will receive this quiz after refresh.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not publish quiz.");
    } finally {
      setPublishing(false);
    }
  }

  function applyBulkText() {
    if (!draft) return;
    const parsed = parseQuestionUpload(bulkText, draft.topicSlug);
    if (!parsed.length) {
      setMessage("Paste JSON or pipe-delimited questions before applying.");
      return;
    }
    const questions = [...draft.questions];
    parsed.forEach((question, index) => {
      questions[index] = question;
    });
    setDraft({ ...draft, questions });
    setMessage(`Loaded ${parsed.length} question${parsed.length === 1 ? "" : "s"}. Review them, then publish.`);
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setBulkText(text);
    const parsed = parseQuestionUpload(text, draft?.topicSlug ?? selectedSlug);
    if (draft && parsed.length) {
      const questions = [...draft.questions];
      parsed.forEach((question, index) => {
        questions[index] = question;
      });
      setDraft({ ...draft, questions });
      setMessage(`Uploaded ${parsed.length} question${parsed.length === 1 ? "" : "s"}. Review them, then publish.`);
    }
  }

  if (!draft) return <Card><p className="font-bold text-slate-600">Loading quiz manager...</p></Card>;

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card>
        <h2 className="text-xl font-black">Modules</h2>
        <div className="mt-4 space-y-2">
          {topics.map((topic) => {
            const bank = banks.find((item) => item.topicSlug === topic.slug) ?? getLocalQuizBank(topic.slug);
            const count = completeQuestions(bank.questions).length;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => selectBank(topic.slug)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm font-bold ${topic.slug === selectedSlug ? "border-leaf-500 bg-leaf-50 text-leaf-700" : "border-slate-200 hover:bg-leaf-50"}`}
              >
                {topic.title}
                <span className="mt-1 block text-xs text-slate-500">{count}/{QUESTIONS_PER_MODULE} complete</span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-5">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">20-question module quiz</h2>
              <p className="mt-1 text-sm text-slate-600">Students will only receive the uploaded quiz after all 20 MCQs are complete and published.</p>
            </div>
            <span className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-black text-leaf-700">{completeCount}/{QUESTIONS_PER_MODULE}</span>
          </div>
          <label className="mt-5 block font-bold">
            Quiz title
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
          </label>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-xl font-black"><Upload className="h-5 w-5 text-coral" /> Upload or paste questions</h2>
          <p className="mt-2 text-sm text-slate-600">Paste JSON from Gemini, or pipe-delimited lines: question | A | B | C | D | correct answer | explanation | difficulty.</p>
          <textarea value={bulkText} onChange={(event) => setBulkText(event.target.value)} rows={7} className="mt-4 w-full rounded-md border border-slate-300 px-3 py-3 font-mono text-sm" placeholder="Paste 20 questions here" />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={applyBulkText} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 font-black text-white"><ClipboardPaste className="h-4 w-4" /> Apply pasted questions</button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-4 py-3 font-black text-ink hover:bg-slate-50">
              <Upload className="h-4 w-4" /> Upload .txt or .json
              <input type="file" accept=".txt,.json,.csv" onChange={uploadFile} className="hidden" />
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">Questions</h2>
          <div className="mt-4 space-y-5">
            {draft.questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-black">Question {index + 1}</h3>
                  <select value={question.difficulty} onChange={(event) => updateQuestion(index, { difficulty: event.target.value as Difficulty })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold capitalize">
                    {difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                  </select>
                </div>
                <textarea value={question.prompt} onChange={(event) => updateQuestion(index, { prompt: event.target.value })} rows={2} className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-3 font-medium" placeholder="Question text" />
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {question.options.map((option, optionIndex) => (
                    <input key={optionIndex} value={option} onChange={(event) => updateOption(index, optionIndex, event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-3 font-medium" placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} />
                  ))}
                </div>
                <input value={question.correctAnswer} onChange={(event) => updateQuestion(index, { correctAnswer: event.target.value })} className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-3 font-medium" placeholder="Correct answer, exactly as one option" />
                <textarea value={question.explanation} onChange={(event) => updateQuestion(index, { explanation: event.target.value })} rows={2} className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-3 font-medium" placeholder="Explanation shown after submission" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          {message ? <p className="rounded-md bg-leaf-50 px-4 py-3 text-sm font-bold text-leaf-700">{message}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={saveDraft} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-3 font-black text-ink hover:bg-slate-50"><Save className="h-4 w-4" /> Save draft</button>
            <button type="button" onClick={publish} disabled={publishing || completeCount !== QUESTIONS_PER_MODULE} className="inline-flex items-center gap-2 rounded-md bg-leaf-500 px-4 py-3 font-black text-white hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 className="h-4 w-4" /> {publishing ? "Publishing" : "Publish 20 questions"}</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
