"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import { createH5PBlock, loadEditableLessons, publishEditableLesson, saveEditableLesson, type EditableLesson, typeLabel } from "@/lib/lesson-store";
import type { H5PBlock } from "@/lib/types";

const h5pTypes: H5PBlock["type"][] = ["multiple-choice", "flashcards", "fill-blank", "drag-sort"];

export function TeacherLessonEditor() {
  const [lessons, setLessons] = useState<EditableLesson[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState<EditableLesson | null>(null);
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadEditableLessons();
    setLessons(loaded);
    setSelectedSlug(loaded[0]?.topicSlug ?? "");
    setDraft(loaded[0] ?? null);
  }, []);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.topicSlug === selectedSlug) ?? lessons[0],
    [lessons, selectedSlug]
  );

  function selectLesson(slug: string) {
    const nextLesson = lessons.find((lesson) => lesson.topicSlug === slug);
    if (!nextLesson) return;
    setSelectedSlug(slug);
    setDraft(nextLesson);
    setMessage("");
  }

  function updateDraft<K extends keyof EditableLesson>(field: K, value: EditableLesson[K]) {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  }

  function updateTextList(field: "objectives" | "content", value: string) {
    updateDraft(field, value.split("\n").map((item) => item.trim()).filter(Boolean));
  }

  function updateKeyTerms(value: string) {
    const keyTerms = value
      .split("\n")
      .map((line) => {
        const [term, ...meaningParts] = line.split("|");
        return { term: term?.trim() ?? "", meaning: meaningParts.join("|").trim() };
      })
      .filter((item) => item.term && item.meaning);
    updateDraft("keyTerms", keyTerms);
  }

  async function uploadDiagram(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !draft) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file for the lesson picture.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMessage("Please choose a lesson image below 3 MB.");
      return;
    }
    const imageUrl = await readFileAsDataUrl(file);
    setDraft({ ...draft, diagramImageUrl: imageUrl, diagramPrompt: draft.diagramPrompt || file.name });
    setMessage("Lesson picture added. Save the lesson to keep it.");
  }

  function addH5PBlock(type: H5PBlock["type"]) {
    if (!draft) return;
    updateDraft("h5pBlocks", [...(draft.h5pBlocks ?? []), createH5PBlock(type)]);
  }

  function updateH5PBlock(id: string, patch: Partial<H5PBlock>) {
    if (!draft) return;
    updateDraft("h5pBlocks", (draft.h5pBlocks ?? []).map((block) => block.id === id ? { ...block, ...patch } : block));
  }

  function deleteH5PBlock(id: string) {
    if (!draft) return;
    updateDraft("h5pBlocks", (draft.h5pBlocks ?? []).filter((block) => block.id !== id));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const nextLessons = saveEditableLesson({ ...draft, approvalStatus: "draft" });
    setLessons(nextLessons);
    setDraft(nextLessons.find((lesson) => lesson.topicSlug === draft.topicSlug) ?? draft);
    setMessage("Draft saved on this browser. Students will see the change only after you click Approve for students.");
  }

  async function approveLesson() {
    if (!draft) return;
    setPublishing(true);
    const approvedLesson = { ...draft, approvalStatus: "approved" as const };
    const nextLessons = saveEditableLesson(approvedLesson);
    setLessons(nextLessons);
    setDraft(nextLessons.find((lesson) => lesson.topicSlug === draft.topicSlug) ?? approvedLesson);

    try {
      await publishEditableLesson(approvedLesson);
      setMessage("Lesson approved and published. Students will see the updated content after opening or refreshing the lesson.");
    } catch (error) {
      setMessage(error instanceof Error ? `Saved locally, but Supabase publish failed: ${error.message}` : "Saved locally, but Supabase publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  function resetLesson() {
    if (!selectedLesson) return;
    setDraft(selectedLesson);
    setMessage("Unsaved changes discarded.");
  }

  if (!draft) {
    return <Card><p className="font-bold text-slate-600">Loading lesson editor...</p></Card>;
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card>
        <h2 className="text-xl font-black">Approved lessons</h2>
        <div className="mt-4 space-y-2">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => selectLesson(lesson.topicSlug)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm font-bold ${lesson.topicSlug === draft.topicSlug ? "border-leaf-500 bg-leaf-50 text-leaf-700" : "border-slate-200 hover:bg-leaf-50"}`}
            >
              {lesson.title}
              <span className="mt-1 block text-xs capitalize text-slate-500">{lesson.approvalStatus}</span>
            </button>
          ))}
        </div>
      </Card>

      <form onSubmit={submit} className="space-y-5">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Edit approved lesson content</h2>
              <p className="mt-1 text-sm text-slate-600">Keep content within the approved Biology lesson note unless the teacher approves new content.</p>
            </div>
            <span className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-black uppercase text-leaf-700">{draft.approvalStatus}</span>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="font-bold">
              Lesson title
              <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
            <label className="font-bold">
              Introduction
              <textarea value={draft.introduction} onChange={(event) => updateDraft("introduction", event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
            <label className="font-bold">
              Learning objectives, one per line
              <textarea value={draft.objectives.join("\n")} onChange={(event) => updateTextList("objectives", event.target.value)} rows={5} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
            <label className="font-bold">
              Main lesson content, one paragraph per line
              <textarea value={draft.content.join("\n")} onChange={(event) => updateTextList("content", event.target.value)} rows={8} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
            <label className="font-bold">
              Key terms, use Term | Meaning
              <textarea value={draft.keyTerms.map((item) => `${item.term} | ${item.meaning}`).join("\n")} onChange={(event) => updateKeyTerms(event.target.value)} rows={5} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-xl font-black"><ImagePlus className="h-5 w-5 text-coral" /> Lesson picture or diagram</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="grid min-h-40 place-items-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-center text-sm font-bold text-slate-500">
              {draft.diagramImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.diagramImageUrl} alt="Lesson diagram preview" className="h-full w-full object-cover" />
              ) : (
                <span>No picture uploaded</span>
              )}
            </div>
            <div className="space-y-3">
              <input ref={fileRef} type="file" accept="image/*" onChange={uploadDiagram} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 font-black text-white">
                <ImagePlus className="h-4 w-4" /> Upload lesson picture
              </button>
              <label className="block font-bold">
                Diagram note
                <textarea value={draft.diagramPrompt} onChange={(event) => updateDraft("diagramPrompt", event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">H5P-style interactive features</h2>
              <p className="mt-1 text-sm text-slate-600">Add classroom interactions such as multiple choice, flashcards, fill-blank, and sorting tasks.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {h5pTypes.map((type) => (
                <button key={type} type="button" onClick={() => addH5PBlock(type)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-black text-ink hover:bg-slate-50">
                  <Plus className="h-3 w-3" /> {typeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {(draft.h5pBlocks ?? []).length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-600">No H5P-style activities yet. Add one from the buttons above.</p>
            ) : draft.h5pBlocks?.map((block) => (
              <div key={block.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-black uppercase text-leaf-700">{typeLabel(block.type)}</p>
                  <button type="button" onClick={() => deleteH5PBlock(block.id)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-black text-slate-700">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input value={block.title} onChange={(event) => updateH5PBlock(block.id, { title: event.target.value })} className="rounded-md border border-slate-300 px-3 py-3 font-medium" placeholder="Activity title" />
                  <input value={block.answer} onChange={(event) => updateH5PBlock(block.id, { answer: event.target.value })} className="rounded-md border border-slate-300 px-3 py-3 font-medium" placeholder="Correct answer. For sorting, write order as item 1 -> item 2 -> item 3" />
                  <textarea value={block.prompt} onChange={(event) => updateH5PBlock(block.id, { prompt: event.target.value })} rows={3} className="rounded-md border border-slate-300 px-3 py-3 font-medium md:col-span-2" placeholder="Prompt or instruction" />
                  <textarea value={block.items.join("\n")} onChange={(event) => updateH5PBlock(block.id, { items: event.target.value.split("\n").filter(Boolean) })} rows={4} className="rounded-md border border-slate-300 px-3 py-3 font-medium md:col-span-2" placeholder="Options/items, one per line. Flashcards can use Term | Meaning." />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="grid gap-4">
            <label className="font-bold">
              Interactive activity instruction
              <textarea value={draft.activity} onChange={(event) => updateDraft("activity", event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
            <label className="font-bold">
              Remediation
              <textarea value={draft.remediation} onChange={(event) => updateDraft("remediation", event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
            <label className="font-bold">
              Summary
              <textarea value={draft.summary} onChange={(event) => updateDraft("summary", event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 font-medium" />
            </label>
          </div>

          {message ? <p className="mt-4 rounded-md bg-leaf-50 px-4 py-3 text-sm font-bold text-leaf-700">{message}</p> : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-leaf-500 px-4 py-3 font-black text-white hover:bg-leaf-700"><Save className="h-4 w-4" /> Save draft</button>
            <button type="button" onClick={approveLesson} disabled={publishing} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 className="h-4 w-4" /> {publishing ? "Publishing" : "Approve for students"}</button>
            <button type="button" onClick={resetLesson} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-3 font-black text-slate-700"><RotateCcw className="h-4 w-4" /> Reset changes</button>
          </div>
        </Card>
      </form>
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}


