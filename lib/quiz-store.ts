"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { lessons } from "@/lib/content";
import type { Difficulty, Question } from "@/lib/types";

const STORAGE_KEY = "biotutor-teacher-quizzes";
export const QUESTIONS_PER_MODULE = 20;

export type QuizBank = {
  topicSlug: string;
  title: string;
  questions: Question[];
  updatedAt?: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function blankQuestion(topicSlug: string, index: number): Question {
  return {
    id: `${topicSlug}-teacher-q${index + 1}`,
    topicSlug,
    prompt: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    difficulty: index < 7 ? "easy" : index < 14 ? "medium" : "hard"
  };
}

export function normalizeQuestion(question: Partial<Question>, topicSlug: string, index: number): Question {
  const options = Array.isArray(question.options) ? question.options.slice(0, 4) : [];
  while (options.length < 4) options.push("");
  return {
    id: question.id || `${topicSlug}-teacher-q${index + 1}`,
    topicSlug,
    prompt: question.prompt || "",
    options,
    correctAnswer: question.correctAnswer || "",
    explanation: question.explanation || "",
    difficulty: isDifficulty(question.difficulty) ? question.difficulty : index < 7 ? "easy" : index < 14 ? "medium" : "hard"
  };
}

export function createDefaultBank(topicSlug: string): QuizBank {
  const lesson = lessons.find((item) => item.topicSlug === topicSlug);
  const starter = lesson?.questions ?? [];
  const questions = Array.from({ length: QUESTIONS_PER_MODULE }, (_, index) =>
    normalizeQuestion(starter[index] ?? blankQuestion(topicSlug, index), topicSlug, index)
  );

  return {
    topicSlug,
    title: `${lesson?.title ?? topicSlug} Quiz`,
    questions
  };
}

export function loadQuizBanks(): QuizBank[] {
  const defaults = lessons.map((lesson) => createDefaultBank(lesson.topicSlug));
  if (!canUseStorage()) return defaults;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as QuizBank[];
    const savedBySlug = new Map(saved.map((bank) => [bank.topicSlug, bank]));
    return defaults.map((bank) => {
      const savedBank = savedBySlug.get(bank.topicSlug);
      if (!savedBank) return bank;
      return {
        ...bank,
        ...savedBank,
        questions: Array.from({ length: QUESTIONS_PER_MODULE }, (_, index) =>
          normalizeQuestion(savedBank.questions?.[index] ?? bank.questions[index], bank.topicSlug, index)
        )
      };
    });
  } catch {
    return defaults;
  }
}

export function saveQuizBank(bank: QuizBank) {
  const banks = loadQuizBanks();
  const nextBank = { ...bank, updatedAt: new Date().toISOString() };
  const nextBanks = banks.map((item) => item.topicSlug === bank.topicSlug ? nextBank : item);
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBanks));
    window.dispatchEvent(new Event("biotutor-quizzes-updated"));
  }
  return nextBanks;
}

export function getLocalQuizBank(topicSlug: string) {
  return loadQuizBanks().find((bank) => bank.topicSlug === topicSlug) ?? createDefaultBank(topicSlug);
}

export async function fetchPublishedQuiz(topicSlug: string, fallbackToLocal = true) {
  if (!isFirebaseConfigured()) return fallbackToLocal ? getLocalQuizBank(topicSlug) : null;

  try {
    const snapshot = await getDoc(doc(getFirebaseDb(), "quizzes", topicSlug));
    if (!snapshot.exists()) return fallbackToLocal ? getLocalQuizBank(topicSlug) : null;
    const data = snapshot.data() as Partial<QuizBank> & { published?: boolean };
    if (!data.published || !Array.isArray(data.questions)) return fallbackToLocal ? getLocalQuizBank(topicSlug) : null;
    const bank: QuizBank = {
      topicSlug,
      title: String(data.title || `${topicSlug} Quiz`),
      questions: data.questions.map((question, index) => normalizeQuestion(question, topicSlug, index)).slice(0, QUESTIONS_PER_MODULE),
      updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined
    };
    saveQuizBank(bank);
    return bank;
  } catch {
    return fallbackToLocal ? getLocalQuizBank(topicSlug) : null;
  }
}

export async function publishQuizBank(bank: QuizBank) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not connected yet. Add Firebase environment variables in Vercel, then redeploy and try again.");
  }

  const complete = completeQuestions(bank.questions);
  if (complete.length !== QUESTIONS_PER_MODULE) {
    throw new Error(`Each module must have exactly ${QUESTIONS_PER_MODULE} complete questions before publishing.`);
  }

  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Please sign in as a teacher before publishing quizzes.");

  await setDoc(doc(getFirebaseDb(), "quizzes", bank.topicSlug), {
    topicSlug: bank.topicSlug,
    title: bank.title,
    questions: complete,
    published: true,
    updatedBy: user.uid,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return { ok: true, id: bank.topicSlug };
}

export function completeQuestions(questions: Question[]) {
  return questions.filter((question) =>
    question.prompt.trim() &&
    question.options.length === 4 &&
    question.options.every((option) => option.trim()) &&
    question.correctAnswer.trim() &&
    question.explanation.trim()
  );
}

export function parseQuestionUpload(raw: string, topicSlug: string): Question[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as Array<Record<string, unknown>>;
    if (Array.isArray(parsed)) {
      return parsed.slice(0, QUESTIONS_PER_MODULE).map((item, index) => normalizeQuestion({
        id: String(item.id || `${topicSlug}-uploaded-q${index + 1}`),
        prompt: String(item.prompt || item.questionText || item.question || ""),
        options: Array.isArray(item.options) ? item.options.map(String) : [],
        correctAnswer: String(item.correctAnswer || item.correct_answer || item.answer || ""),
        explanation: String(item.explanation || ""),
        difficulty: String(item.difficulty || "medium") as Difficulty
      }, topicSlug, index));
    }
  } catch {
    // Fall through to pipe-delimited parsing.
  }

  return trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, QUESTIONS_PER_MODULE)
    .map((line, index) => {
      const [prompt, optionA, optionB, optionC, optionD, correctAnswer, explanation, difficulty] = line.split("|").map((part) => part.trim());
      return normalizeQuestion({
        id: `${topicSlug}-uploaded-q${index + 1}`,
        prompt,
        options: [optionA, optionB, optionC, optionD],
        correctAnswer,
        explanation,
        difficulty: difficulty as Difficulty
      }, topicSlug, index);
    });
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}
