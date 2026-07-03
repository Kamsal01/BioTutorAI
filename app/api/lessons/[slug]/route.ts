import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getTopic } from "@/lib/content";

const h5pBlockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["multiple-choice", "flashcards", "fill-blank", "drag-sort"]),
  title: z.string().max(160),
  prompt: z.string().max(1000),
  items: z.array(z.string().max(400)).max(30),
  answer: z.string().max(1000)
});

const lessonSchema = z.object({
  title: z.string().min(3).max(200),
  introduction: z.string().max(3000),
  objectives: z.array(z.string().min(1).max(400)).min(1).max(20),
  content: z.array(z.string().min(1).max(3000)).min(1).max(60),
  keyTerms: z.array(z.object({ term: z.string().min(1).max(120), meaning: z.string().min(1).max(500) })).max(40),
  diagramPrompt: z.string().max(1000),
  diagramImageUrl: z.string().max(5000000).optional().default(""),
  activity: z.string().max(2000),
  h5pBlocks: z.array(h5pBlockSchema).max(20).optional().default([]),
  remediation: z.string().max(2000),
  summary: z.string().max(2000),
  approvalStatus: z.enum(["draft", "approved"]).default("approved")
});

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const readSupabase = adminClient ?? supabase;
  const baseTopic = getTopic(slug);

  let { data: topic } = await readSupabase.from("topics").select("id, slug").eq("slug", slug).maybeSingle();

  if (!topic && baseTopic && adminClient) {
    const inserted = await adminClient
      .from("topics")
      .insert({
        slug,
        title: baseTopic.title,
        description: baseTopic.description,
        level: baseTopic.level,
        estimated_minutes: baseTopic.estimatedMinutes
      })
      .select("id, slug")
      .single();
    topic = inserted.data;
  }

  if (!topic) return NextResponse.json({ lesson: null });

  const { data: lesson } = await readSupabase
    .from("lessons")
    .select("title, introduction, objectives, content, key_terms, diagram_url, diagram_prompt, h5p_blocks, activity, remediation, summary, approval_status, updated_at")
    .eq("topic_id", topic.id)
    .eq("published", true)
    .eq("approval_status", "approved")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lesson) return NextResponse.json({ lesson: null });

  return NextResponse.json({
    lesson: {
      topicSlug: slug,
      title: lesson.title,
      introduction: lesson.introduction,
      objectives: lesson.objectives ?? [],
      content: lesson.content ?? [],
      keyTerms: lesson.key_terms ?? [],
      diagramImageUrl: lesson.diagram_url ?? "",
      diagramPrompt: lesson.diagram_prompt ?? "",
      h5pBlocks: lesson.h5p_blocks ?? [],
      activity: lesson.activity ?? "",
      remediation: lesson.remediation ?? "",
      summary: lesson.summary ?? "",
      approvalStatus: lesson.approval_status,
      updatedAt: lesson.updated_at
    }
  });
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const baseLesson = getLesson(slug);
  const baseTopic = getTopic(slug);
  if (!baseLesson || !baseTopic) return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });

  const parsed = lessonSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid lesson payload" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const metadataRole = user.user_metadata?.role;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (metadataRole !== "teacher" && profile?.role !== "teacher") {
    return NextResponse.json({ error: "Only teachers can publish lessons" }, { status: 403 });
  }

  const adminClient = createAdminClient();
  if (!adminClient) return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables." }, { status: 500 });
  const writeSupabase = adminClient;

  let { data: topic, error: topicError } = await writeSupabase.from("topics").select("id").eq("slug", slug).maybeSingle();

  if (!topic) {
    const inserted = await writeSupabase
      .from("topics")
      .insert({
        slug,
        title: baseTopic.title,
        description: baseTopic.description,
        level: baseTopic.level,
        estimated_minutes: baseTopic.estimatedMinutes,
        created_by: user.id
      })
      .select("id")
      .single();
    topic = inserted.data;
    topicError = inserted.error;
  }

  if (topicError || !topic) return NextResponse.json({ error: topicError?.message ?? "Could not save topic" }, { status: 500 });

  const payload = {
    topic_id: topic.id,
    title: parsed.data.title,
    source_note_title: "Ifeoma_lesson updated.docx",
    approval_status: parsed.data.approvalStatus,
    objectives: parsed.data.objectives,
    introduction: parsed.data.introduction,
    content: parsed.data.content,
    key_terms: parsed.data.keyTerms,
    diagram_url: parsed.data.diagramImageUrl,
    diagram_prompt: parsed.data.diagramPrompt,
    h5p_blocks: parsed.data.h5pBlocks,
    activity: parsed.data.activity,
    remediation: parsed.data.remediation,
    summary: parsed.data.summary,
    published: parsed.data.approvalStatus === "approved",
    created_by: user.id,
    updated_at: new Date().toISOString()
  };

  const { data: existing } = await writeSupabase
    .from("lessons")
    .select("id")
    .eq("topic_id", topic.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const result = existing
    ? await writeSupabase.from("lessons").update(payload).eq("id", existing.id).select("id").single()
    : await writeSupabase.from("lessons").insert(payload).select("id").single();

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: result.data.id });
}
