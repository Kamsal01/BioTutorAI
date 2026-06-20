"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { Card } from "@/components/ui";

export function QuizGenerator() {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate(formData: FormData) {
    setLoading(true);
    setRaw("");
    const response = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: String(formData.get("topic")),
        difficulty: String(formData.get("difficulty")),
        count: Number(formData.get("count") || 5)
      })
    });
    const data = await response.json();
    setRaw(data.raw ?? data.error ?? "No quiz generated.");
    setLoading(false);
  }

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-xl font-black"><Bot className="h-5 w-5 text-leaf-700" /> Generate from approved note</h2>
      <form action={generate} className="mt-4 grid gap-4">
        <input name="topic" required className="rounded-md border border-slate-300 px-3 py-3" placeholder="Topic, e.g. pests and diseases" />
        <select name="difficulty" className="rounded-md border border-slate-300 px-3 py-3">
          <option>easy</option>
          <option>medium</option>
          <option>hard</option>
        </select>
        <input name="count" type="number" min={1} max={10} defaultValue={5} className="rounded-md border border-slate-300 px-3 py-3" />
        <button className="rounded-md bg-leaf-500 px-4 py-3 font-black text-white" disabled={loading}>{loading ? "Generating..." : "Generate approved-note MCQs"}</button>
      </form>
      {raw ? <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">{raw}</pre> : null}
    </Card>
  );
}
