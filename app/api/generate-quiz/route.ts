import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { COURSE_REFUSAL, COURSE_SCOPE_SUMMARY, isApprovedCourseTopic } from "@/lib/course-scope";
import { LESSON_NOTE_CONTEXT } from "@/lib/lesson-note-context";

const schema = z.object({
  topic: z.string().min(2).max(120),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  count: z.number().int().min(1).max(10).default(5)
});

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash-latest"
].filter(Boolean) as string[];

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid quiz request" }, { status: 400 });
  if (!isApprovedCourseTopic(parsed.data.topic)) {
    return NextResponse.json({ error: COURSE_REFUSAL }, { status: 400 });
  }
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const prompt = `Generate ${parsed.data.count} secondary school Biology MCQs for topic "${parsed.data.topic}" at ${parsed.data.difficulty} difficulty.

Use the uploaded lesson note titled "Ifeoma_lesson updated.docx" as the primary source and stay inside this approved course scope:
${COURSE_SCOPE_SUMMARY}

Approved lesson-note content:
${LESSON_NOTE_CONTEXT}

You may add simple examples or wording beyond the exact note text only when they directly support the approved scope. Do not add unrelated Biology topics or facts from outside conservation, pest and disease control, or reproduction in birds and mammals. Return strict JSON array only. Each item must have questionText, options array of four strings, correctAnswer, explanation, difficulty, topicTag.`;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return NextResponse.json({ raw: result.response.text(), model: modelName });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "Could not reach a supported Gemini model. Check GEMINI_API_KEY and optionally set GEMINI_MODEL=gemini-2.0-flash." }, { status: 502 });
}
