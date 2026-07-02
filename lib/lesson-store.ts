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

export function loadEditableLessons(): EditableLesson[] {
  if (!canUseStorage()) return lessons.map(toEditableLesson);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return lessons.map(toEditableLesson);
    const saved = JSON.parse(raw) as EditableLesson[];
    const savedBySlug = new Map(saved.map((lesson) => [lesson.topicSlug, lesson]));
    return lessons.map((lesson) => savedBySlug.get(lesson.topicSlug) ?? toEditableLesson(lesson));
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
