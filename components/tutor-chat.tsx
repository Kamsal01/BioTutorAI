"use client";

import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Card } from "@/components/ui";

type Message = { role: "user" | "assistant"; content: string };

export function TutorChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi, I am BioTutor. I can help with conservation of natural resources, pest and disease control, and reproduction in birds and mammals from this course note." }
  ]);
  const [loading, setLoading] = useState(false);

  async function send(formData: FormData) {
    const content = String(formData.get("message") || "").trim();
    if (!content) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setLoading(true);

    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next, performance: { lastScore: 62, weakTopics: ["pests and diseases"] } })
    });
    const data = await response.json();
    setMessages([...next, { role: "assistant", content: data.reply ?? "I could not answer that yet. Please try again." }]);
    setLoading(false);
  }

  return (
    <Card className="flex min-h-[680px] flex-col p-0">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" ? <Bot className="mt-2 h-5 w-5 text-leaf-700" /> : null}
            <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-ink text-white" : "bg-leaf-50 text-ink"}`}>{message.content}</div>
            {message.role === "user" ? <User className="mt-2 h-5 w-5 text-slate-500" /> : null}
          </div>
        ))}
        {loading ? <p className="text-sm font-semibold text-slate-500">BioTutor is thinking...</p> : null}
      </div>
      <form action={send} className="flex gap-3 border-t border-slate-200 p-4">
        <input name="message" placeholder="Ask about the approved SSII lesson note..." className="flex-1 rounded-md border border-slate-300 px-4 py-3" />
        <button className="rounded-md bg-leaf-500 px-4 text-white hover:bg-leaf-700" aria-label="Send"><Send className="h-5 w-5" /></button>
      </form>
    </Card>
  );
}
