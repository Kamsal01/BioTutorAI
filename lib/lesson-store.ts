"use client";

import { lessons } from "@/lib/content";
import type { H5PBlock, Lesson } from "@/lib/types";

export type EditableLesson = Lesson & {
  updatedAt?: string;
  approvalStatus: "draft" | "approved";
};

const STORAGE_KEY = "biotutor-teacher-lessons";

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
    diagramImageUrl: edit?.diagramImageUrl ?? baseLesson.diagramImageUrl ?? ""
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

export async function fetchApprovedLesson(baseLesson: Lesson) {
  try {
    const response = await fetch(`/api/lessons/${encodeURIComponent(baseLesson.topicSlug)}`, {
      cache: "no-store"
    });
    if (!response.ok) return getEditableLesson(baseLesson.topicSlug);
    const data = await response.json() as { lesson?: Partial<EditableLesson> | null };
    if (!data.lesson) return getEditableLesson(baseLesson.topicSlug);
    const merged = mergeEditableLesson(baseLesson, { ...data.lesson, approvalStatus: "approved" });
    saveEditableLesson(merged);
    return merged;
  } catch {
    return getEditableLesson(baseLesson.topicSlug);
  }
}

export async function publishEditableLesson(lesson: EditableLesson) {
  const response = await fetch(`/api/lessons/${encodeURIComponent(lesson.topicSlug)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
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
      approvalStatus: lesson.approvalStatus
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Could not publish lesson" })) as { error?: string };
    throw new Error(data.error ?? "Could not publish lesson");
  }

  return response.json();
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
