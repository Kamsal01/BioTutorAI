import Link from "next/link";
import { Activity, Apple, Dna, Flame, Flower2, Leaf, Microscope, Network, Sun, Trees } from "lucide-react";
import type { Topic } from "@/lib/types";
import { ProgressBar } from "@/components/ui";

const icons = { Activity, Apple, Dna, Flame, Flower2, Leaf, Microscope, Network, Sun, Trees };

export function TopicCard({ topic, progress = 0 }: { topic: Topic; progress?: number }) {
  const Icon = icons[topic.icon as keyof typeof icons] ?? Leaf;
  return (
    <Link href={`/lesson/${topic.slug}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-leaf-500">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-leaf-50 text-leaf-700">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-black text-ink">{topic.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{topic.description}</p>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={progress} />
        <p className="mt-2 text-xs font-bold text-slate-500">Level {topic.level} • {topic.estimatedMinutes} min • {progress}% complete</p>
      </div>
    </Link>
  );
}
