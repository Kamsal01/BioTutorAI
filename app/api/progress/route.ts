import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { masteryFromScore, xpAward } from "@/lib/adaptive";

const schema = z.object({
  lessonId: z.string().uuid(),
  quizId: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  answers: z.record(z.string()).default({}),
  timeSpentMinutes: z.number().int().min(0).default(0)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const xp = xpAward(parsed.data.score);
  await supabase.from("quiz_attempts").insert({
    student_id: user.id,
    quiz_id: parsed.data.quizId,
    score: parsed.data.score,
    answers: parsed.data.answers,
    completed_at: new Date().toISOString()
  });
  await supabase.from("progress").upsert({
    student_id: user.id,
    lesson_id: parsed.data.lessonId,
    completion: parsed.data.score >= 50 ? 100 : 50,
    best_score: parsed.data.score,
    time_spent_minutes: parsed.data.timeSpentMinutes,
    mastery: masteryFromScore(parsed.data.score),
    synced_at: new Date().toISOString()
  }, { onConflict: "student_id,lesson_id" });
  await supabase.rpc("increment_xp", { amount: xp }).throwOnError();

  return NextResponse.json({ xp, mastery: masteryFromScore(parsed.data.score), passed: parsed.data.score >= 50 });
}
