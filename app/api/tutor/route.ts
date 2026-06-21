import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { COURSE_SCOPE_SUMMARY, isApprovedCourseTopic } from "@/lib/course-scope";
import { LESSON_NOTE_CONTEXT } from "@/lib/lesson-note-context";

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1500) })).min(1).max(20),
  performance: z.object({
    lastScore: z.number().optional(),
    weakTopics: z.array(z.string()).optional()
  }).optional()
});

const systemInstruction = `You are BioTutor, a friendly intelligent Biology tutor for secondary school students.

CONTENT RULE:
You are limited to Biology learning. Use the uploaded lesson note titled "Ifeoma_lesson updated.docx" as the primary course source when the question relates to:
${COURSE_SCOPE_SUMMARY}

Approved lesson-note content:
${LESSON_NOTE_CONTEXT}

You may answer Biology questions conversationally, add simple examples, and explain beyond the exact wording of the note when it helps the learner. When a question is about the uploaded course topics, prioritize the lesson note. When a Biology question is outside the lesson note, answer briefly and gently connect it back to Biology learning.

Do not answer non-Biology questions. If the learner asks something unrelated to Biology, politely say you can only help with Biology learning.

Explain simply, guide step by step, adapt to learner performance, remember the conversation context, and ask one short follow-up question when useful.`;

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash-latest"
].filter(Boolean) as string[];

function isCourseNavigationMessage(value: string) {
  return /^(hi|hello|help|start|what can you teach|course|lesson|quiz|test|revise|revision|summary)/i.test(value.trim());
}

function isAmbiguousFollowUp(value: string) {
  return /^(why|what|how|explain|describe|list|mention|name|is|are|can|could|tell)\b/i.test(value.trim());
}

function isBiologyMessage(value: string) {
  const normalized = value.toLowerCase();
  if (isApprovedCourseTopic(normalized)) return true;

  const biologyTerms = [
    "biology",
    "living",
    "organism",
    "organisms",
    "plant",
    "plants",
    "animal",
    "animals",
    "human",
    "humans",
    "cell",
    "cells",
    "tissue",
    "organ",
    "organs",
    "system",
    "reproduction",
    "reproductive",
    "fertilization",
    "fertilisation",
    "embryo",
    "mammal",
    "mammals",
    "bird",
    "birds",
    "pest",
    "pests",
    "disease",
    "diseases",
    "conservation",
    "resource",
    "resources",
    "soil",
    "water",
    "forest",
    "wildlife",
    "photosynthesis",
    "respiration",
    "digestion",
    "genetics",
    "classification",
    "ecology",
    "nutrition",
    "enzyme",
    "enzymes"
  ];

  return biologyTerms.some((term) => normalized.includes(term));
}

function isClearlyNonBiology(value: string) {
  const normalized = value.toLowerCase();
  const nonBiologyTerms = [
    "noun",
    "verb",
    "adjective",
    "adverb",
    "pronoun",
    "preposition",
    "grammar",
    "sentence",
    "essay",
    "math",
    "mathematics",
    "algebra",
    "physics",
    "chemistry",
    "history",
    "government",
    "president",
    "capital city",
    "programming",
    "javascript",
    "python"
  ];

  return nonBiologyTerms.some((term) => normalized.includes(term));
}

function isFollowUpAnswer(messages: { role: "user" | "assistant"; content: string }[]) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const previousAssistantMessage = [...messages]
    .slice(0, -1)
    .reverse()
    .find((message) => message.role === "assistant")?.content ?? "";
  const shortAnswer = /^[a-z ,.'-]{1,80}$/i.test(lastUserMessage.trim());
  return shortAnswer && isApprovedCourseTopic(previousAssistantMessage);
}

function localLessonNoteReply(message: string, context = "") {
  const normalized = message.toLowerCase();
  const contextualized = `${context} ${message}`.toLowerCase();
  const asksForExamples = /\b(example|examples|list|mention|name)\b/.test(normalized);
  const isVagueFollowUp = !isBiologyMessage(message) || /\b(yes|yeah|okay|ok|break|pieces|step|steps|simple|simplify|toddler|todler)\b/.test(normalized);

  if (normalized.includes("natural resource") || normalized.includes("natural resources")) {
    return "From the lesson note, natural resources are resources supplied by nature, such as water, soil, forests, minerals, fossil fuels, wildlife, and biodiversity. The lesson explains that these resources are limited and can be exhausted if misused, so they should be carefully used, managed, and protected for present and future generations. Can you name two natural resources from the lesson?";
  }

  if ((normalized.includes("bird") || normalized.includes("birds")) && asksForExamples) {
    return "Examples of birds from the lesson note include hen, pigeon, and eagle. These are used in the note when comparing reproduction in birds and mammals. Can you mention one way birds reproduce differently from mammals?";
  }

  if ((normalized.includes("mammal") || normalized.includes("mammals")) && asksForExamples) {
    return "Examples of mammals from the lesson note include humans, dogs, lions, and elephants. These mammals are used in the note when comparing reproduction in birds and mammals. Can you name one example of a mammal?";
  }

  if (/\b(dog|dogs|human|humans|lion|lions|elephant|elephants)\b/.test(normalized)) {
    return "Correct. That is an example of a mammal from the lesson note. Mammals mostly give birth to live young, and mothers feed their young with milk from mammary glands. Can you list one more mammal example?";
  }

  if (/\b(hen|pigeon|eagle)\b/.test(normalized)) {
    return "Correct. That is an example of a bird from the lesson note. Birds lay shelled eggs, incubate them, and the young hatch from eggs. Can you name one mammal example for comparison?";
  }

  if (normalized.includes("soil") || (isVagueFollowUp && contextualized.includes("soil"))) {
    if (/\b(toddler|todler|very simple|like a child)\b/.test(normalized)) {
      return "Sure. Think of soil like a blanket for plants. Soil conservation means we stop that blanket from being washed away, blown away, or becoming weak. Trees and grasses hold the soil with their roots. Mulch covers the soil like a small mat. Terraces and contour ploughing slow down running water on slopes. Crop rotation helps the soil stay healthy. So, soil conservation simply means protecting soil so plants can keep growing well.";
    }
    if (/\b(yes|yeah|okay|ok)\b/.test(normalized)) {
      return "Great. Let us start with plant cover methods. Afforestation, reforestation, cover cropping, mulching, and strip cropping all protect soil by covering it. When soil is covered, rain and wind do not remove it easily, and plant roots help hold it together. Next, should I explain slope control methods like contour ploughing and terracing?";
    }
    if (/\b(break|pieces|step|steps|simple|simplify)\b/.test(normalized)) {
      return "Sure. Soil conservation methods from the lesson note can be broken down like this: 1. Plant cover methods: afforestation, reforestation, cover cropping, mulching, and strip cropping protect the soil surface. 2. Slope control methods: contour ploughing and terracing slow down water runoff on slopes. 3. Farming practice methods: crop rotation and conservation tillage help maintain fertility and reduce erosion. 4. Damage repair methods: gully control stops erosion channels from widening. 5. Grazing control: controlled grazing prevents animals from removing too much vegetation. Which group should I explain first?";
    }
    return "From the lesson note, soil conservation means protecting soil from erosion, nutrient depletion, and degradation. Methods include afforestation and reforestation, contour ploughing, terracing, crop rotation, cover cropping or green manure, mulching, strip cropping, conservation tillage, gully control, and controlled grazing. Would you like me to break these methods into groups?";
  }

  if (normalized.includes("water") || (isVagueFollowUp && contextualized.includes("water"))) {
    return "From the lesson note, water conservation methods include rainwater harvesting, drip and sprinkler irrigation, reuse and recycling of water, protection of water sources, reducing water pollution, groundwater conservation, water-saving technologies at home, and public awareness. Which method can be used at home?";
  }

  if (normalized.includes("forest") || (isVagueFollowUp && contextualized.includes("forest"))) {
    return "From the lesson note, forest conservation methods include afforestation, reforestation, controlled and regulated cutting, prevention of bush burning, prevention of overgrazing, social forestry, protected areas, forest laws, and public awareness. Why do you think bush burning harms forest conservation?";
  }

  if (normalized.includes("wildlife") || (isVagueFollowUp && contextualized.includes("wildlife"))) {
    return "From the lesson note, wildlife conservation protects wild animals and their habitats. Methods include protected areas, enforcement of laws, captive breeding and rehabilitation, habitat restoration, prevention of over-exploitation, wildlife corridors, pollution control, and community education. Can you name one protected area example from the note?";
  }

  if (normalized.includes("importance") || normalized.includes("important") || normalized.includes("why")) {
    return "From the lesson note, conservation is important because it supports sustainability for future generations, protects the environment, preserves biodiversity, helps regulate climate, conserves soil and water, reduces dependence on non-renewable resources, supports economic activities, and improves quality of life. Which importance would you like me to explain further?";
  }

  if (normalized.includes("method") || normalized.includes("methods") || normalized.includes("ways")) {
    return "The lesson note gives several conservation and control methods. For conservation, methods include soil conservation, water conservation, forest conservation, and wildlife conservation. For pests and diseases, methods include chemical, biological, cultural, mechanical or physical control, quarantine and legislation, resistant varieties, and integrated pest or disease management. Which method should I explain?";
  }

  if (normalized.includes("conservation")) {
    return "From the lesson note, conservation of natural resources means the careful use, management, and protection of resources such as water, soil, forests, minerals, fossil fuels, wildlife, and biodiversity so they remain available for present and future generations. It is important because resources are limited and can be exhausted if misused. Can you mention one natural resource from the lesson?";
  }

  if (normalized.includes("symbol") || normalized.includes("slogan")) {
    return "From the lesson note, conservation symbols include the recycling symbol, tree symbol, panda symbol, earth or globe symbol, water drop symbol, and green leaf symbol. Slogans include Reduce, Reuse, Recycle; Plant a tree, plant a life; Save water, save life; and Protect wildlife, protect nature. Which symbol should I explain?";
  }

  if (normalized.includes("pest") || (isVagueFollowUp && contextualized.includes("pest"))) {
    return "From the lesson note, pests are organisms such as insects, weeds, fungi, rodents, bacteria, or other animals that harm humans, crops, livestock, property, or the environment. Types include insect pests, mite pests, nematode pests, rodent pests, bird pests, mollusk pests, weed pests, and microbial pests. Can you give one example of an insect pest?";
  }

  if (normalized.includes("disease") || (isVagueFollowUp && contextualized.includes("disease"))) {
    return "From the lesson note, a disease is an abnormal condition that disrupts normal structure or function. Plant diseases may be fungal, bacterial, viral, nematode, mycoplasma or phytoplasma, or abiotic. Examples include powdery mildew, rust, leaf spot, bacterial blight, tobacco mosaic virus, and cassava mosaic disease. Which type do you want to revise?";
  }

  if (normalized.includes("control") || (isVagueFollowUp && contextualized.includes("control"))) {
    return "From the lesson note, pest and disease control methods include chemical, biological, cultural, mechanical or physical methods, resistant varieties, quarantine and legislation, and integrated pest or disease management. Benefits include higher yield and better food quality; drawbacks include pollution, resistance, cost, and harm to non-target organisms. Which method should we compare?";
  }

  if (normalized.includes("bird") || normalized.includes("birds") || (isVagueFollowUp && (contextualized.includes("bird") || contextualized.includes("birds")))) {
    return "From the lesson note, birds reproduce sexually through internal fertilization. They are oviparous, lay shelled eggs, incubate the eggs, and the young hatch from eggs. Bird embryos develop outside the mother's body and are nourished by yolk. Can you name one feature of bird reproduction?";
  }

  if (normalized.includes("mammal") || normalized.includes("mammals") || (isVagueFollowUp && (contextualized.includes("mammal") || contextualized.includes("mammals")))) {
    return "From the lesson note, mammals reproduce sexually through internal fertilization. Most mammals are viviparous, meaning they give birth to live young. The embryo develops in the uterus, is nourished by the placenta, and the young are fed with milk from mammary glands. What is one difference between mammals and birds?";
  }

  if (normalized.includes("fertilization") || normalized.includes("fertilisation") || (isVagueFollowUp && (contextualized.includes("fertilization") || contextualized.includes("fertilisation")))) {
    return "From the lesson note, fertilization is the fusion of a sperm cell and an egg or ovum to form a zygote. In birds it occurs in the infundibulum of the oviduct; in mammals it occurs in the fallopian tube. What is formed after fertilization?";
  }

  if (normalized.includes("embryo") || normalized.includes("embryonic") || normalized.includes("zygote") || (isVagueFollowUp && (contextualized.includes("embryo") || contextualized.includes("embryonic") || contextualized.includes("zygote")))) {
    return "From the lesson note, embryonic development in birds occurs inside an egg outside the mother and uses nutrients from the yolk. In mammals, the zygote divides, implants in the uterus, receives nutrients through the placenta and umbilical cord, and develops into an embryo and then a fetus. Which animal group develops inside an egg?";
  }

  if (normalized.includes("photosynthesis")) {
    return "Photosynthesis is a Biology process where green plants make food using light energy, carbon dioxide, and water. Since your current course note focuses on conservation, pests and diseases, and reproduction in birds and mammals, I can explain this briefly or help you return to the course topics. Which would you prefer?";
  }

  if (normalized.includes("respiration")) {
    return "Respiration is a Biology process by which living cells release energy from food. It is outside the main uploaded lesson note, but it is still Biology. Do you want a short explanation, or should we connect back to the current course topics?";
  }

  return "Good question. Let us keep it in Biology and take it step by step. Can you tell me the exact part you want explained, or should I connect it to conservation, pest and disease control, or reproduction in birds and mammals?";
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });

  const lastUserMessage = [...parsed.data.messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const previousAssistantMessage = [...parsed.data.messages]
    .slice(0, -1)
    .reverse()
    .find((message) => message.role === "assistant")?.content ?? "";
  const hasConversationContext = Boolean(previousAssistantMessage);
  if (isClearlyNonBiology(lastUserMessage)) {
    return NextResponse.json({
      reply: "I am BioTutor, so I can only help with Biology learning. Please ask me a Biology question."
    });
  }

  const allowedMessage =
    isBiologyMessage(lastUserMessage) ||
    isCourseNavigationMessage(lastUserMessage) ||
    isFollowUpAnswer(parsed.data.messages) ||
    (hasConversationContext && isAmbiguousFollowUp(lastUserMessage));

  if (!allowedMessage) {
    return NextResponse.json({
      reply: "I am BioTutor, so I can only help with Biology learning. Ask me about living things, conservation, pests and diseases, or reproduction in birds and mammals."
    });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({
      reply: localLessonNoteReply(lastUserMessage, previousAssistantMessage),
      model: "local-biology-fallback"
    });
  }

  const genAI = new GoogleGenerativeAI(key);
  const context = parsed.data.performance
    ? `Learner performance context: last score ${parsed.data.performance.lastScore ?? "unknown"}; weak topics ${parsed.data.performance.weakTopics?.join(", ") || "none provided"}.`
    : "No learner performance context provided.";
  const prompt = `${context}

Approved course scope:
${COURSE_SCOPE_SUMMARY}

Approved lesson-note content:
${LESSON_NOTE_CONTEXT}

Conversation:
${parsed.data.messages.map((m) => `${m.role}: ${m.content}`).join("\n")}

Reply as BioTutor. Keep the conversation limited to Biology. Use the uploaded lesson note as the foundation for course topics, but answer naturally and conversationally. For follow-up messages, use the previous conversation context instead of asking the learner to restate everything.`;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const result = await model.generateContent(prompt);
      return NextResponse.json({ reply: result.response.text(), model: modelName });
    } catch {
      continue;
    }
  }

  return NextResponse.json({
    reply: localLessonNoteReply(lastUserMessage, previousAssistantMessage),
    model: "local-lesson-note-fallback"
  });
}
