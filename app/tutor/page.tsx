import { Topbar, Shell, Card } from "@/components/ui";
import { TutorChat } from "@/components/tutor-chat";

export default function TutorPage() {
  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[340px_1fr]">
        <Card>
          <p className="font-black uppercase text-leaf-700">AI tutor</p>
          <h1 className="mt-2 text-3xl font-black">Ask BioTutor</h1>
          <p className="mt-3 text-slate-600">BioTutor answers Biology questions naturally while keeping the conversation focused on Biology learning.</p>
          <div className="mt-5 rounded-lg bg-leaf-50 p-4 text-sm font-semibold text-leaf-700">Try: &quot;Explain soil conservation methods step by step.&quot;</div>
        </Card>
        <TutorChat />
      </div>
    </Shell>
  );
}

