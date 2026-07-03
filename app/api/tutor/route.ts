import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1500) })).min(1).max(20),
  performance: z.object({
    lastScore: z.number().optional(),
    weakTopics: z.array(z.string()).optional()
  }).optional()
});

type ChatMessage = z.infer<typeof schema>["messages"][number];

const systemInstruction = `You are BioTutor, a friendly intelligent Biology tutor for secondary school students.

CORE BEHAVIOR:
- Answer Biology questions freely, naturally, and conversationally.
- You are not limited to a lesson note or uploaded material.
- Stay strictly within Biology and Biology learning.
- Explain concepts in simple language first, then add detail if the learner asks.
- Use examples, analogies, and step-by-step explanations when useful.
- Remember the conversation context, especially short follow-up messages like "yes", "break it down", "explain more", or "like a toddler".
- Adapt to the learner's level and performance.
- Ask one short follow-up question only when it helps the learner continue.
- If the learner asks a non-Biology question, politely refuse and invite a Biology question.
- Do not twist unrelated questions into Biology answers.`;

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash-latest"
].filter(Boolean) as string[];

const BIOLOGY_TERMS = [
  "biology", "living", "life", "organism", "organisms", "plant", "plants", "animal", "animals",
  "human", "humans", "cell", "cells", "tissue", "tissues", "organ", "organs", "system", "systems",
  "reproduction", "reproductive", "fertilization", "fertilisation", "embryo", "embryonic", "zygote",
  "fetus", "foetus", "mammal", "mammals", "bird", "birds", "fish", "amphibian", "reptile",
  "insect", "insects", "pest", "pests", "disease", "diseases", "pathogen", "virus", "bacteria",
  "fungus", "fungi", "conservation", "resource", "resources", "soil", "water", "forest", "wildlife",
  "ecosystem", "habitat", "biodiversity", "photosynthesis", "chlorophyll", "respiration", "digestion",
  "nutrition", "enzyme", "enzymes", "genetics", "gene", "genes", "dna", "chromosome", "classification",
  "ecology", "evolution", "adaptation", "blood", "heart", "lung", "lungs", "kidney", "brain", "nerve",
  "hormone", "immune", "immunity", "flower", "seed", "germination", "root", "stem", "leaf", "leaves"
];

const BIOLOGY_EXAMPLE_WORDS = [
  "dog", "cat", "lion", "elephant", "goat", "cow", "rat", "rabbit", "bat", "whale", "dolphin",
  "hen", "chicken", "eagle", "pigeon", "maize", "bean", "mango", "mosquito", "grasshopper"
];

const NON_BIOLOGY_PATTERNS = [
  /\b(noun|verb|adjective|adverb|pronoun|preposition|grammar|sentence|essay|letter writing)\b/i,
  /\b(algebra|trigonometry|calculus|simultaneous equation|quadratic|percentage profit)\b/i,
  /\b(president|governor|capital city|election|politics|government)\b/i,
  /\b(javascript|typescript|python|java|html|css|programming|coding|database)\b/i,
  /\b(football|soccer|basketball|movie|music|song|celebrity)\b/i,
  /\b(physics|chemistry|geography|economics|commerce|accounting|literature)\b/i
];

const FOLLOW_UP_PATTERNS = [
  /^(yes|yeah|yep|ok|okay|sure|please|go on|continue)$/i,
  /\b(break it down|pieces|step by step|explain more|more explanation|simplify|simple|toddler|child|example|examples|why|how|what about|compare|difference|list|name|mention)\b/i
];
function normalize(value: string) {
  return value.trim().toLowerCase();
}

function includesBiologyTerm(value: string) {
  const normalized = normalize(value);
  return BIOLOGY_TERMS.some((term) => normalized.includes(term)) || BIOLOGY_EXAMPLE_WORDS.some((term) => new RegExp(`\\b${term}\\b`, "i").test(value));
}

function isGreetingOrTutorNavigation(value: string) {
  return /^(hi|hello|hey|good morning|good afternoon|good evening|help|start|what can you teach|who are you)\b/i.test(value.trim());
}

function isClearlyNonBiology(value: string) {
  return NON_BIOLOGY_PATTERNS.some((pattern) => pattern.test(value));
}

function isFollowUp(value: string) {
  const trimmed = value.trim();
  return trimmed.length <= 120 && FOLLOW_UP_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function recentConversationHasBiology(messages: ChatMessage[]) {
  return messages.slice(-6).some((message) => includesBiologyTerm(message.content));
}

function isAllowedBiologyConversation(messages: ChatMessage[]) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

  if (isClearlyNonBiology(lastUserMessage) && !includesBiologyTerm(lastUserMessage)) return false;
  if (includesBiologyTerm(lastUserMessage)) return true;
  if (isGreetingOrTutorNavigation(lastUserMessage)) return true;
  if (isFollowUp(lastUserMessage) && recentConversationHasBiology(messages.slice(0, -1))) return true;

  return false;
}

function localBiologyReply(message: string, previousContext = "") {
  const normalized = normalize(message);
  const context = normalize(`${previousContext} ${message}`);

  if (/\b(noun|verb|adjective|adverb|grammar)\b/i.test(message)) {
    return "I am BioTutor, so I can only help with Biology learning. Please ask me a Biology question.";
  }

  if (normalized.includes("soil") || (isFollowUp(message) && context.includes("soil"))) {
    if (/\b(toddler|child|simple|simplify)\b/i.test(message)) {
      return "Sure. Think of soil like a soft bed where plants grow. Soil conservation means protecting that bed so rain, wind, animals, or bad farming do not wash it away or make it weak. We protect soil by planting trees and grasses, covering it with mulch, farming across slopes, making terraces, rotating crops, and controlling grazing.";
    }
    if (/\b(break|pieces|step|groups)\b/i.test(message)) {
      return "Sure. Soil conservation can be broken into five parts: plant cover methods like trees, grasses, cover crops, and mulch; slope control methods like contour ploughing and terracing; good farming methods like crop rotation and reduced tillage; repair methods like gully control; and grazing control so animals do not remove too much vegetation.";
    }
    return "Soil conservation means protecting soil from being washed away, blown away, or losing nutrients. Common methods include planting trees, using cover crops, mulching, contour ploughing, terracing, crop rotation, reduced tillage, gully control, and controlled grazing.";
  }

  if (normalized.includes("photosynthesis")) {
    return "Photosynthesis is the process by which green plants make their own food. They use sunlight, carbon dioxide from the air, and water from the soil to make glucose, and oxygen is released. The green pigment chlorophyll helps trap light energy.";
  }

  if (normalized.includes("respiration")) {
    return "Respiration is how living cells release energy from food. In aerobic respiration, glucose reacts with oxygen to release energy, carbon dioxide, and water. Plants and animals both respire because all living cells need energy.";
  }
  if (normalized.includes("mammal") || /\b(dog|cat|lion|elephant|goat|cow|rabbit|bat|whale|dolphin)\b/i.test(message)) {
    return "Mammals are animals that usually have hair or fur, give birth to live young, and feed their young with milk from mammary glands. Examples include humans, dogs, cats, goats, cows, lions, elephants, bats, whales, and dolphins.";
  }

  if (normalized.includes("bird") || /\b(hen|chicken|eagle|pigeon)\b/i.test(message)) {
    return "Birds are animals with feathers, beaks, wings, and hard-shelled eggs. Examples include hens, eagles, pigeons, ducks, and parrots. Most birds reproduce by laying eggs that develop outside the mother.";
  }

  if (normalized.includes("cell")) {
    return "A cell is the basic unit of life. It is the smallest part of a living organism that can carry out life processes. Plant cells and animal cells both have parts such as a cell membrane, cytoplasm, and nucleus, while plant cells also have a cell wall and chloroplasts.";
  }

  if (normalized.includes("conservation")) {
    return "Conservation in Biology means the careful use and protection of natural resources and living things so they remain available for the future. It helps protect soil, water, forests, wildlife, and biodiversity.";
  }

  if (normalized.includes("pest")) {
    return "A pest is an organism that harms crops, animals, stored food, property, or human health. Examples include insects, rodents, weeds, nematodes, and some microorganisms. Pest control can be chemical, biological, cultural, physical, or integrated.";
  }

  if (normalized.includes("disease")) {
    return "A disease is a condition that stops a living organism from working normally. In plants, diseases may be caused by fungi, bacteria, viruses, nematodes, or poor environmental conditions. Control includes resistant varieties, sanitation, crop rotation, chemicals, and quarantine.";
  }

  if (isFollowUp(message) && previousContext) {
    return "Yes, let us continue from the Biology idea we were discussing. I can explain it more simply, give examples, compare it with another concept, or ask you a short practice question. Which one do you want?";
  }

  return "I can help with that as Biology. Tell me the exact Biology topic or concept you want explained, and I will break it down clearly.";
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });

  const lastUserMessage = [...parsed.data.messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const previousAssistantMessage = [...parsed.data.messages]
    .slice(0, -1)
    .reverse()
    .find((message) => message.role === "assistant")?.content ?? "";

  if (!isAllowedBiologyConversation(parsed.data.messages)) {
    return NextResponse.json({
      reply: "I am BioTutor, so I can only help with Biology learning. Please ask me a Biology question."
    });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({
      reply: localBiologyReply(lastUserMessage, previousAssistantMessage),
      model: "local-biology-fallback"
    });
  }

  const genAI = new GoogleGenerativeAI(key);
  const context = parsed.data.performance
    ? `Learner performance context: last score ${parsed.data.performance.lastScore ?? "unknown"}; weak topics ${parsed.data.performance.weakTopics?.join(", ") || "none provided"}.`
    : "No learner performance context provided.";
  const prompt = `${context}

Conversation so far:
${parsed.data.messages.map((m) => `${m.role}: ${m.content}`).join("\n")}

Reply as BioTutor. Answer the latest learner message naturally using the conversation context. Stay within Biology only. If the latest message is a short follow-up, continue the previous Biology explanation instead of restarting. If the learner asks outside Biology, refuse politely.`;

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
    reply: localBiologyReply(lastUserMessage, previousAssistantMessage),
    model: "local-biology-fallback"
  });
}

