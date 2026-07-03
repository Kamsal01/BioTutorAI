"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Bot, CheckCircle2, ClipboardList, Image as ImageIcon, Layers3, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
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
      {block.type === "multiple-choice" ? <MultipleChoiceActivity block={block} /> : null}
      {block.type === "flashcards" ? <FlashcardActivity block={block} /> : null}
      {block.type === "fill-blank" ? <FillBlankActivity block={block} /> : null}
      {block.type === "drag-sort" ? <DragSortActivity block={block} /> : null}
    </div>
  );
}

function MultipleChoiceActivity({ block }: { block: H5PBlock }) {
  const [selected, setSelected] = useState("");
  const isCorrect = normalizeAnswer(selected) === normalizeAnswer(block.answer);

  return (
    <div className="mt-3 grid gap-2">
      {block.items.map((item, index) => {
        const active = selected === item;
        return (
          <button
            key={`${block.id}-${item}-${index}`}
            type="button"
            onClick={() => setSelected(item)}
            className={`rounded-md border px-3 py-3 text-left text-sm font-semibold ${active ? "border-leaf-500 bg-leaf-50 text-leaf-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {item}
          </button>
        );
      })}
      {selected ? <Feedback correct={isCorrect} correctAnswer={block.answer} /> : null}
    </div>
  );
}

function FlashcardActivity({ block }: { block: H5PBlock }) {
  const cards = block.items.length > 0 ? block.items : [block.answer].filter(Boolean);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {cards.map((item, index) => {
        const [front, ...backParts] = item.split("|");
        const back = backParts.join("|").trim() || block.answer || "Review the lesson note.";
        const isRevealed = Boolean(revealed[index]);
        return (
          <button
            key={`${block.id}-${item}-${index}`}
            type="button"
            onClick={() => setRevealed((current) => ({ ...current, [index]: !isRevealed }))}
            className="min-h-28 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-leaf-500"
          >
            <p className="text-xs font-black uppercase text-slate-500">{isRevealed ? "Answer" : "Card"}</p>
            <p className="mt-2 font-bold text-ink">{isRevealed ? back : front.trim()}</p>
          </button>
        );
      })}
    </div>
  );
}

function FillBlankActivity({ block }: { block: H5PBlock }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const isCorrect = normalizeAnswer(answer) === normalizeAnswer(block.answer);

  return (
    <div className="mt-3 space-y-3">
      <input
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          setChecked(false);
        }}
        placeholder="Type your answer"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 font-semibold"
      />
      <button type="button" onClick={() => setChecked(true)} className="rounded-md bg-leaf-500 px-4 py-3 text-sm font-black text-white hover:bg-leaf-700">
        Check answer
      </button>
      {checked ? <Feedback correct={isCorrect} correctAnswer={block.answer} /> : null}
    </div>
  );
}

function DragSortActivity({ block }: { block: H5PBlock }) {
  const [items, setItems] = useState(block.items);
  const [checked, setChecked] = useState(false);
  const expected = parseSortAnswer(block.answer, block.items);
  const isCorrect = expected.length > 0 && items.every((item, index) => normalizeAnswer(item) === normalizeAnswer(expected[index]));

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setItems((current) => {
      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
    setChecked(false);
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-2">
        {items.map((item, index) => (
          <div key={`${block.id}-${item}-${index}`} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <span>{index + 1}. {item}</span>
            <span className="flex gap-1">
              <button type="button" onClick={() => move(index, -1)} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Move up"><ArrowUp className="h-3 w-3" /></button>
              <button type="button" onClick={() => move(index, 1)} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Move down"><ArrowDown className="h-3 w-3" /></button>
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setChecked(true)} className="rounded-md bg-leaf-500 px-4 py-3 text-sm font-black text-white hover:bg-leaf-700">Check order</button>
        <button type="button" onClick={() => { setItems(block.items); setChecked(false); }} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-3 text-sm font-black text-slate-700"><RotateCcw className="h-4 w-4" /> Reset</button>
      </div>
      {checked ? <Feedback correct={isCorrect} correctAnswer={expected.join(" -> ") || block.answer} /> : null}
    </div>
  );
}

function Feedback({ correct, correctAnswer }: { correct: boolean; correctAnswer: string }) {
  return (
    <p className={`rounded-md px-3 py-2 text-sm font-bold ${correct ? "bg-leaf-50 text-leaf-700" : "bg-red-50 text-coral"}`}>
      {correct ? "Correct. Well done." : `Not yet. Correct answer: ${correctAnswer}`}
    </p>
  );
}

function parseSortAnswer(answer: string, fallback: string[]) {
  const parts = answer
    .split(/\n|,|->|>/)
    .map((item) => item.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : fallback;
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/^[a-d][.)]\s*/i, "");
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
