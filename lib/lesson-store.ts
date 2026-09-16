"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { lessons } from "@/lib/content";
import type { H5PBlock, Lesson } from "@/lib/types";

export type EditableLesson = Lesson & {
  updatedAt?: string;
  approvalStatus: "draft" | "approved";
};

const STORAGE_KEY = "biotutor-teacher-lessons";
const MAX_INLINE_IMAGE_LENGTH = 1200000;

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function toEditableLesson(lesson: Lesson): EditableLesson {
  return {
    ...lesson,
    diagramImageUrl: lesson.diagramImageUrl ?? "",
    h5pBlocks: lesson.h5pBlocks ?? [],
    approvalStatus: "approved"
  };
}

export function mergeEditableLesson(baseLesson: Lesson, edit?: Partial<EditableLesson> | null): EditableLesson {
  return {
    ...toEditableLesson(baseLesson),
    ...edit,
    id: baseLesson.id,
    topicSlug: baseLesson.topicSlug,
    questions: baseLesson.questions,
    keyTerms: edit?.keyTerms ?? baseLesson.keyTerms,
    objectives: edit?.objectives ?? baseLesson.objectives,
    content: edit?.content ?? baseLesson.content,
    h5pBlocks: edit?.h5pBlocks ?? baseLesson.h5pBlocks ?? [],
    diagramImageUrl: edit?.diagramImageUrl || baseLesson.diagramImageUrl || ""
  };
}

export function loadEditableLessons(): EditableLesson[] {
  if (!canUseStorage()) return lessons.map(toEditableLesson);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return lessons.map(toEditableLesson);
    const saved = JSON.parse(raw) as EditableLesson[];
    const savedBySlug = new Map(saved.map((lesson) => [lesson.topicSlug, lesson]));
    return lessons.map((lesson) => mergeEditableLesson(lesson, savedBySlug.get(lesson.topicSlug)));
  } catch {
    return lessons.map(toEditableLesson);
  }
}

export function saveEditableLessons(nextLessons: EditableLesson[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLessons));
    window.dispatchEvent(new Event("biotutor-lessons-updated"));
  }
  return nextLessons;
}

export function saveEditableLesson(nextLesson: EditableLesson) {
  const current = loadEditableLessons();
  const nextLessons = current.map((lesson) =>
    lesson.topicSlug === nextLesson.topicSlug
      ? { ...nextLesson, updatedAt: new Date().toISOString() }
      : lesson
  );
  return saveEditableLessons(nextLessons);
}

export function getEditableLesson(slug: string) {
  return loadEditableLessons().find((lesson) => lesson.topicSlug === slug);
}

export async function fetchApprovedLesson(baseLesson: Lesson, fallbackToLocal = true) {
  if (!isFirebaseConfigured()) return fallbackToLocal ? getEditableLesson(baseLesson.topicSlug) : null;

  try {
    const snapshot = await getDoc(doc(getFirebaseDb(), "lessons", baseLesson.topicSlug));
    if (!snapshot.exists()) return fallbackToLocal ? getEditableLesson(baseLesson.topicSlug) : null;
    const data = snapshot.data() as Partial<EditableLesson> & { published?: boolean; approvalStatus?: string };
    if (!data.published || data.approvalStatus !== "approved") return fallbackToLocal ? getEditableLesson(baseLesson.topicSlug) : null;
    const merged = mergeEditableLesson(baseLesson, { ...data, approvalStatus: "approved" });
    saveEditableLesson(merged);
    return merged;
  } catch {
    return fallbackToLocal ? getEditableLesson(baseLesson.topicSlug) : null;
  }
}

export async function publishEditableLesson(lesson: EditableLesson) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not connected yet. Add Firebase environment variables in Vercel, then redeploy and try again.");
  }

  if ((lesson.diagramImageUrl ?? "").length > MAX_INLINE_IMAGE_LENGTH) {
    throw new Error("The lesson picture is too large for online publishing. Please upload a smaller image below about 900 KB, then approve again.");
  }

  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Please sign in as a teacher before publishing lessons.");

  await setDoc(doc(getFirebaseDb(), "lessons", lesson.topicSlug), {
    topicSlug: lesson.topicSlug,
    title: lesson.title,
    introduction: lesson.introduction,
    objectives: lesson.objectives,
    content: lesson.content,
    keyTerms: lesson.keyTerms,
    diagramPrompt: lesson.diagramPrompt,
    diagramImageUrl: lesson.diagramImageUrl ?? "",
    activity: lesson.activity,
    h5pBlocks: lesson.h5pBlocks ?? [],
    remediation: lesson.remediation,
    summary: lesson.summary,
    approvalStatus: lesson.approvalStatus,
    published: lesson.approvalStatus === "approved",
    updatedBy: user.uid,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return { ok: true, id: lesson.topicSlug };
}

export function createH5PBlock(type: H5PBlock["type"]): H5PBlock {
  return {
    id: `h5p-${Date.now()}`,
    type,
    title: typeLabel(type),
    prompt: "",
    items: type === "flashcards" ? ["Term | Meaning"] : ["Option A", "Option B", "Option C"],
    answer: ""
  };
}

export function typeLabel(type: H5PBlock["type"]) {
  switch (type) {
    case "multiple-choice":
      return "Multiple Choice";
    case "flashcards":
      return "Flashcards";
    case "fill-blank":
      return "Fill in the Blank";
    case "drag-sort":
      return "Drag and Sort";
  }
}
