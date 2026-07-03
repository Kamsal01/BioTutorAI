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
type TopicKey = "soil" | "photosynthesis" | "respiration" | "reproduction" | "fertilization" | "mammals" | "birds" | "cells" | "conservation" | "pests" | "diseases" | "biology";

const systemInstruction = `You are BioTutor, a warm, natural Biology tutor for secondary school students.

Chat like a real tutor:
- Reply directly to what the student just said.
- Use the chat history so short messages like "yes", "continue", "break it down", "give examples", "why", or "explain like a child" continue the same topic.
- Keep answers clear, friendly, and conversational. Avoid sounding like a form or policy.
- Start simple, then add detail when the student asks.
- Ask at most one short follow-up question when useful.
- Stay within Biology. If the student asks a clearly non-Biology question, politely say you can only help with Biology and invite a Biology question.
- Do not force every answer back to the lesson note. Answer Biology naturally.`;

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash-latest"
].filter(Boolean) as string[];

const BIOLOGY_TERMS = [
  "biology", "living", "life", "organism", "organisms", "plant", "plants", "animal", "animals", "human", "humans",
  "cell", "cells", "tissue", "organ", "organs", "system", "reproduction", "reproductive", "fertilization", "fertilisation",
  "embryo", "zygote", "fetus", "foetus", "mammal", "mammals", "bird", "birds", "fish", "amphibian", "reptile",
  "insect", "pest", "pests", "disease", "diseases", "pathogen", "virus", "bacteria", "fungus", "fungi", "conservation",
  "resource", "resources", "soil", "water", "forest", "wildlife", "ecosystem", "habitat", "biodiversity", "photosynthesis",
  "chlorophyll", "respiration", "digestion", "nutrition", "enzyme", "genetics", "gene", "genes", "dna", "chromosome",
  "classification", "ecology", "evolution", "adaptation", "blood", "heart", "lung", "kidney", "brain", "nerve", "hormone",
  "flower", "seed", "germination", "root", "stem", "leaf", "leaves", "dog", "cat", "lion", "elephant", "goat", "cow",
  "rabbit", "bat", "whale", "dolphin", "hen", "chicken", "eagle", "pigeon", "maize", "bean", "mosquito", "grasshopper"
];

const NON_BIOLOGY_PATTERNS = [
  /\b(noun|verb|adjective|adverb|pronoun|preposition|grammar|sentence|essay|letter writing)\b/i,
  /\b(algebra|trigonometry|calculus|simultaneous equation|quadratic|percentage profit)\b/i,
  /\b(president|governor|capital city|election|politics|government)\b/i,
  /\b(javascript|typescript|python|java|html|css|programming|coding|database)\b/i,
  /\b(football|soccer|basketball|movie|music|song|celebrity)\b/i,
  /\b(physics|chemistry|geography|economics|commerce|accounting|literature)\b/i
];

const FOLLOW_UP_PATTERN = /^(yes|yeah|yep|ok|okay|sure|please|go on|continue|next)$|\b(break it down|pieces|step by step|explain more|more explanation|simplify|simple|toddler|child|example|examples|why|how|compare|difference|list|name|mention|quiz me|test me)\b/i;
const GREETING_PATTERN = /^(hi|hello|hey|good morning|good afternoon|good evening|help|start|who are you|what can you teach)\b/i;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function containsBiology(value: string) {
  const normalized = normalize(value);
  return BIOLOGY_TERMS.some((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(normalized));
}

function isClearlyNonBiology(value: string) {
  return NON_BIOLOGY_PATTERNS.some((pattern) => pattern.test(value));
}

function isFollowUp(value: string) {
  return value.trim().length <= 140 && FOLLOW_UP_PATTERN.test(value.trim());
}

function isGreeting(value: string) {
  return GREETING_PATTERN.test(value.trim());
}

function recentBiologyContext(messages: ChatMessage[]) {
  return messages.slice(-8).some((message) => containsBiology(message.content));
}

function canAnswer(messages: ChatMessage[]) {
  const last = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  if (isClearlyNonBiology(last) && !containsBiology(last)) return false;
  if (containsBiology(last) || isGreeting(last)) return true;
  if (isFollowUp(last) && recentBiologyContext(messages.slice(0, -1))) return true;
  return false;
}

function detectTopic(text: string): TopicKey | null {
  const value = normalize(text);
  if (/soil|erosion|mulch|terrac|contour|gully|grazing/.test(value)) return "soil";
  if (/photosynthesis|chlorophyll|sunlight|glucose/.test(value)) return "photosynthesis";
  if (/respiration|energy from food|aerobic|anaerobic/.test(value)) return "respiration";
  if (/fertili[sz]ation|sperm|ovum|egg cell|zygote/.test(value)) return "fertilization";
  if (/reproduction|reproductive|offspring|sexual|asexual/.test(value)) return "reproduction";
  if (/mammal|mammals|dog|cat|lion|elephant|goat|cow|rabbit|bat|whale|dolphin/.test(value)) return "mammals";
  if (/bird|birds|hen|chicken|eagle|pigeon|egg|feather/.test(value)) return "birds";
  if (/cell|cells|nucleus|cytoplasm|membrane|chloroplast/.test(value)) return "cells";
  if (/conservation|natural resource|resources|forest|wildlife|biodiversity/.test(value)) return "conservation";
  if (/pest|aphid|grasshopper|weevil|caterpillar|rodent|snail|weed/.test(value)) return "pests";
  if (/disease|pathogen|fungus|fungi|bacteria|virus|wilting|leaf spot|mosaic/.test(value)) return "diseases";
  if (/biology|living thing|organism/.test(value)) return "biology";
  return null;
}

function lastTopic(messages: ChatMessage[]) {
  for (const message of [...messages].reverse()) {
    const topic = detectTopic(message.content);
    if (topic) return topic;
  }
  return null;
}

function wantsSimple(value: string) {
  return /toddler|child|simple|simplify|small child|beginner/i.test(value);
}

function wantsExamples(value: string) {
  return /example|examples|list|name|mention/i.test(value);
}

function wantsBreakdown(value: string) {
  return /break|pieces|step by step|steps|parts|explain more|continue|go on|yes/i.test(value);
}

function localAnswerFor(topic: TopicKey, message: string) {
  if (topic === "reproduction") {
    if (wantsSimple(message)) return "Sure. Reproduction simply means making new living things. For example, dogs give birth to puppies, birds lay eggs that hatch into chicks, and plants can produce seeds that grow into new plants. It is how life continues from parents to offspring.";
    if (wantsExamples(message)) return "Examples of reproduction include a hen laying eggs that hatch into chicks, a woman giving birth to a baby, a bean seed growing into a new bean plant, and bacteria dividing into two. These all produce new living things.";
    if (wantsBreakdown(message)) return "Let us break reproduction into pieces: first, it means producing offspring. Second, it can be sexual, where male and female sex cells join. Third, it can be asexual, where one parent produces offspring alone. Fourth, the purpose is continuity, so the species does not die out.";
    return "Reproduction is the process by which living organisms produce new individuals of their own kind. It is important because it keeps a species going from one generation to the next. There are two main types: sexual reproduction, which involves male and female sex cells, and asexual reproduction, which involves one parent. Want me to explain the two types with examples?";
  }

  if (topic === "soil") {
    if (wantsSimple(message)) return "Think of soil like a soft bed for plants. Soil conservation means protecting that bed so rain, wind, or animals do not carry it away. We protect it by planting trees and grasses, covering it with mulch, making terraces on slopes, and not allowing animals to overgraze.";
    if (wantsBreakdown(message)) return "Sure. Soil conservation has five easy groups: plant cover methods like trees and cover crops; slope control like terracing and contour ploughing; good farming like crop rotation; repair work like gully control; and grazing control so animals do not remove too much grass.";
    return "Soil conservation means protecting soil from erosion and loss of nutrients. Methods include afforestation, reforestation, mulching, cover cropping, contour ploughing, terracing, crop rotation, gully control, and controlled grazing.";
  }

  if (topic === "photosynthesis") return "Photosynthesis is how green plants make food. They use sunlight, carbon dioxide from the air, and water from the soil to produce glucose. Oxygen is released as a by-product. In simple words: plants use light to cook their own food.";
  if (topic === "respiration") return "Respiration is how living cells release energy from food. In aerobic respiration, glucose reacts with oxygen to release energy, carbon dioxide, and water. Plants and animals both respire because all cells need energy.";
  if (topic === "fertilization") return "Fertilization is when a sperm cell joins with an egg cell. The new cell formed is called a zygote, and it can begin developing into an embryo. It is a key step in sexual reproduction.";
  if (topic === "mammals") return "Mammals are animals that usually have hair or fur, give birth to live young, and feed their young with milk from mammary glands. Examples include humans, dogs, goats, cows, cats, lions, elephants, bats, whales, and dolphins.";
  if (topic === "birds") return "Birds are animals with feathers, beaks, wings, and hard-shelled eggs. Most birds reproduce by laying eggs, incubating them, and caring for the young after hatching. Examples include hens, eagles, pigeons, ducks, and parrots.";
  if (topic === "cells") return "A cell is the basic unit of life. It is the smallest part of a living thing that can carry out life processes. Plant and animal cells have a nucleus, cytoplasm, and cell membrane; plant cells also have a cell wall and chloroplasts.";
  if (topic === "conservation") return "Conservation means using and protecting natural resources wisely so they remain available for the future. It includes protecting soil, water, forests, wildlife, and biodiversity from waste, damage, and overuse.";
  if (topic === "pests") return "A pest is an organism that harms crops, stored food, animals, property, or the environment. Examples include grasshoppers, aphids, weevils, caterpillars, rats, birds, snails, weeds, fungi, and bacteria.";
  if (topic === "diseases") return "A disease is a condition that prevents a living organism from functioning normally. In plants, diseases may be caused by fungi, bacteria, viruses, nematodes, or poor environmental conditions. Signs can include wilting, yellowing, leaf spots, rotting, and stunted growth.";
  return "Biology is the study of living things. It covers plants, animals, humans, cells, nutrition, respiration, reproduction, genetics, ecology, diseases, and how organisms interact with their environment. Which part should we explore first?";
}

function localBiologyReply(messages: ChatMessage[]) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  if (isClearlyNonBiology(lastUserMessage) && !containsBiology(lastUserMessage)) {
    return "I am BioTutor, so I can only help with Biology learning. Ask me any Biology question and I will gladly help.";
  }

  if (isGreeting(lastUserMessage)) {
    return "Hi, I am BioTutor. I can help you understand Biology in a simple way. You can ask me about cells, plants, animals, conservation, pests and diseases, reproduction, respiration, photosynthesis, or any Biology topic you are studying.";
  }

  const topic = detectTopic(lastUserMessage) ?? lastTopic(messages.slice(0, -1));
  if (topic) return localAnswerFor(topic, lastUserMessage);

  if (isFollowUp(lastUserMessage)) {
    return "Sure, let us continue. I can explain it more simply, give examples, break it into steps, or ask you a quick practice question. Which one do you prefer?";
  }

  return "I can help with Biology. Tell me the Biology idea you are thinking about, and I will explain it naturally with examples.";
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });

  if (!canAnswer(parsed.data.messages)) {
    return NextResponse.json({ reply: "I am BioTutor, so I can only help with Biology learning. Please ask me a Biology question." });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ reply: localBiologyReply(parsed.data.messages), model: "local-conversation-fallback" });
  }

  const genAI = new GoogleGenerativeAI(key);
  const context = parsed.data.performance
    ? `Learner context: last score ${parsed.data.performance.lastScore ?? "unknown"}; weak topics ${parsed.data.performance.weakTopics?.join(", ") || "none provided"}.`
    : "No learner performance context provided.";
  const conversation = parsed.data.messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  const prompt = `${context}

Conversation:
${conversation}

Answer the latest student message as BioTutor. Be conversational and remember the previous turns. If the student gives a short follow-up, continue the current Biology topic naturally. Keep it Biology-only.`;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const result = await model.generateContent(prompt);
      const reply = result.response.text().trim();
      if (reply) return NextResponse.json({ reply, model: modelName });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ reply: localBiologyReply(parsed.data.messages), model: "local-conversation-fallback" });
}
