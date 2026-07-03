import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getTopic } from "@/lib/content";

const QUESTIONS_PER_MODULE = 20;

const questionSchema = z.object({
  id: z.string().min(1).max(120),
  topicSlug: z.string().min(1).max(160),
  prompt: z.string().min(3).max(1000),
  options: z.array(z.string().min(1).max(300)).length(4),
  correctAnswer: z.string().min(1).max(300),
  explanation: z.string().min(1).max(1000),
  difficulty: z.enum(["easy", "medium", "hard"])
});

const bankSchema = z.object({
  title: z.string().min(3).max(200),
  topicSlug: z.string().min(1).max(160),
  questions: z.array(questionSchema).length(QUESTIONS_PER_MODULE)
});

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const supabase = await createClient();

  const { data: topic } = await supabase.from("topics").select("id, slug").eq("slug", slug).maybeSingle();
  if (!topic) return NextResponse.json({ bank: null });

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, created_at")
    .eq("quiz_type", "adaptive")
    .in("lesson_id", await lessonIdsForTopic(supabase, topic.id))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!quiz) return NextResponse.json({ bank: null });

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, options, correct_answer, explanation, difficulty, topic_tag, created_at")
    .eq("quiz_id", quiz.id)
    .order("created_at", { ascending: true });

  if (!questions?.length) return NextResponse.json({ bank: null });

  return NextResponse.json({
    bank: {
      topicSlug: slug,
      title: quiz.title,
      questions: questions.map((question) => ({
        id: question.id,
        topicSlug: slug,
        prompt: question.question_text,
        options: question.options ?? [],
        correctAnswer: question.correct_answer,
        explanation: question.explanation,
        difficulty: question.difficulty
      }))
    }
  });
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const baseLesson = getLesson(slug);
  const baseTopic = getTopic(slug);
  if (!baseLesson || !baseTopic) return NextResponse.json({ error: "Unknown module" }, { status: 404 });

  const parsed = bankSchema.safeParse(await request.json());
  if (!parsed.success || parsed.data.topicSlug !== slug) {
    return NextResponse.json({ error: `Each module quiz must contain exactly ${QUESTIONS_PER_MODULE} valid questions.` }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (user.user_metadata?.role !== "teacher" && profile?.role !== "teacher") {
    return NextResponse.json({ error: "Only teachers can publish quizzes" }, { status: 403 });
  }

  const topic = await ensureTopic(supabase, slug, baseTopic, user.id);
  if (!topic.id) return NextResponse.json({ error: "Could not save topic" }, { status: 500 });

  const lesson = await ensureLesson(supabase, topic.id, baseLesson, user.id);
  if (!lesson.id) return NextResponse.json({ error: "Could not save lesson for quiz" }, { status: 500 });

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      lesson_id: lesson.id,
      title: parsed.data.title,
      quiz_type: "adaptive",
      created_by: user.id
    })
    .select("id")
    .single();

  if (quizError || !quiz) return NextResponse.json({ error: quizError?.message ?? "Could not save quiz" }, { status: 500 });

  const { error: questionError } = await supabase.from("questions").insert(parsed.data.questions.map((question) => ({
    quiz_id: quiz.id,
    question_text: question.prompt,
    options: question.options,
    correct_answer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty,
    topic_tag: slug
  })));

  if (questionError) return NextResponse.json({ error: questionError.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: quiz.id });
}

async function lessonIdsForTopic(supabase: Awaited<ReturnType<typeof createClient>>, topicId: string) {
  const { data } = await supabase.from("lessons").select("id").eq("topic_id", topicId);
  return data?.map((lesson) => lesson.id) ?? [];
}

async function ensureTopic(supabase: Awaited<ReturnType<typeof createClient>>, slug: string, topic: NonNullable<ReturnType<typeof getTopic>>, userId: string) {
  const existing = await supabase.from("topics").select("id").eq("slug", slug).maybeSingle();
  if (existing.data) return existing.data;

  const inserted = await supabase.from("topics").insert({
    slug,
    title: topic.title,
    description: topic.description,
    level: topic.level,
    estimated_minutes: topic.estimatedMinutes,
    created_by: userId
  }).select("id").single();
  return inserted.data ?? { id: "" };
}

async function ensureLesson(supabase: Awaited<ReturnType<typeof createClient>>, topicId: string, lesson: NonNullable<ReturnType<typeof getLesson>>, userId: string) {
  const existing = await supabase.from("lessons").select("id").eq("topic_id", topicId).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (existing.data) return existing.data;

  const inserted = await supabase.from("lessons").insert({
    topic_id: topicId,
    title: lesson.title,
    source_note_title: "Ifeoma_lesson updated.docx",
    approval_status: "approved",
    objectives: lesson.objectives,
    introduction: lesson.introduction,
    content: lesson.content,
    key_terms: lesson.keyTerms,
    diagram_prompt: lesson.diagramPrompt,
    h5p_blocks: lesson.h5pBlocks ?? [],
    activity: lesson.activity,
    remediation: lesson.remediation,
    summary: lesson.summary,
    published: true,
    created_by: userId
  }).select("id").single();
  return inserted.data ?? { id: "" };
}
