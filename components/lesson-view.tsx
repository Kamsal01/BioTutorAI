"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bot, CheckCircle2, ClipboardList, Image as ImageIcon, Layers3, Lightbulb, Sparkles } from "lucide-react";
import type { H5PBlock, Lesson } from "@/lib/types";
import { Card, IconButton } from "@/components/ui";
import { fetchApprovedLesson, getEditableLesson } from "@/lib/lesson-store";

export function LessonView({ lesson }: { lesson: Lesson }) {
  const [visibleLesson, setVisibleLesson] = useState<Lesson>(lesson);

  useEffect(() => {
    let active = true;
    const updateLesson = () => {
      const edited = getEditableLesson(lesson.topicSlug);
      setVisibleLesson(edited?.approvalStatus === "approved" ? edited : lesson);
    };

    updateLesson();
    fetchApprovedLesson(lesson).then((edited) => {
      if (!active || !edited) return;
      setVisibleLesson(edited.approvalStatus === "approved" ? edited : lesson);
    });

    window.addEventListener("storage", updateLesson);
    window.addEventListener("biotutor-lessons-updated", updateLesson);
    return () => {
      active = false;
      window.removeEventListener("storage", updateLesson);
      window.removeEventListener("biotutor-lessons-updated", updateLesson);
    };
  }, [lesson]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="space-y-5">
        <Card>
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">Lesson</p>
          <h1 className="mt-2 text-4xl font-black text-ink">{visibleLesson.title}</h1>
          <p className="mt-3 text-slate-600">{visibleLesson.introduction}</p>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-black"><CheckCircle2 className="h-5 w-5 text-leaf-600" /> Learning objectives</h2>
          <ul className="mt-4 grid gap-2 text-slate-700">
            {visibleLesson.objectives.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Main lesson content</h2>
          <div className="mt-4 space-y-3 leading-7 text-slate-700">
            {visibleLesson.content.map((p) => <p key={p}>{p}</p>)}
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-black"><ImageIcon className="h-5 w-5 text-coral" /> Diagram and illustration</h2>
          {visibleLesson.diagramImageUrl ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={visibleLesson.diagramImageUrl} alt={visibleLesson.diagramPrompt} className="max-h-[420px] w-full object-contain" />
            </div>
          ) : null}
          <div className="mt-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center font-semibold text-slate-500">{visibleLesson.diagramPrompt}</div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-black"><Sparkles className="h-5 w-5 text-sun" /> Interactive activity</h2>
          <p className="mt-3 text-slate-700">{visibleLesson.activity}</p>
        </Card>
        {(visibleLesson.h5pBlocks ?? []).length > 0 ? (
          <Card>
            <h2 className="flex items-center gap-2 text-xl font-black"><Layers3 className="h-5 w-5 text-leaf-700" /> H5P-style activities</h2>
            <div className="mt-4 grid gap-4">
              {visibleLesson.h5pBlocks?.map((block) => <H5PBlockView key={block.id} block={block} />)}
            </div>
          </Card>
        ) : null}
      </section>
      <aside className="space-y-5">
        <Card>
          <h2 className="text-lg font-black">Key terms</h2>
          <dl className="mt-4 space-y-3">
            {visibleLesson.keyTerms.map((term) => (
              <div key={term.term}>
                <dt className="font-bold text-ink">{term.term}</dt>
                <dd className="text-sm text-slate-600">{term.meaning}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-lg font-black"><Lightbulb className="h-5 w-5 text-sun" /> Remediation</h2>
          <p className="mt-3 text-sm text-slate-600">{visibleLesson.remediation}</p>
        </Card>
        <div className="flex flex-wrap gap-3">
          <IconButton Icon={ClipboardList} label="Take quiz" href={`/quiz/${visibleLesson.topicSlug}`} />
          <IconButton Icon={Bot} label="Ask tutor" href={`/tutor?topic=${visibleLesson.topicSlug}`} />
        </div>
        <Link href="/student" className="block rounded-md border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700">Back to dashboard</Link>
      </aside>
    </div>
  );
}

function H5PBlockView({ block }: { block: H5PBlock }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase text-leaf-700">{labelForType(block.type)}</p>
      <h3 className="mt-1 text-lg font-black">{block.title}</h3>
      {block.prompt ? <p className="mt-2 text-sm font-semibold text-slate-700">{block.prompt}</p> : null}
      <div className="mt-3 grid gap-2">
        {block.items.map((item, index) => (
          <div key={`${block.id}-${item}-${index}`} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            {block.type === "drag-sort" ? `${index + 1}. ` : ""}{item}
          </div>
        ))}
      </div>
      {block.answer ? <p className="mt-3 rounded-md bg-leaf-50 px-3 py-2 text-sm font-bold text-leaf-700">Teacher answer: {block.answer}</p> : null}
    </div>
  );
}

function labelForType(type: H5PBlock["type"]) {
  switch (type) {
    case "multiple-choice":
      return "Multiple choice";
    case "flashcards":
      return "Flashcards";
    case "fill-blank":
      return "Fill in the blank";
    case "drag-sort":
      return "Drag and sort";
  }
}

