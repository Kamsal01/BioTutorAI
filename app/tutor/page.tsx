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
          <p className="mt-3 text-slate-600">BioTutor uses the SSII lesson note as its foundation and can add helpful explanations within conservation, pest and disease control, and reproduction in birds and mammals.</p>
          <div className="mt-5 rounded-lg bg-leaf-50 p-4 text-sm font-semibold text-leaf-700">Try: “Explain soil conservation methods from the lesson note.”</div>
        </Card>
        <TutorChat />
      </div>
    </Shell>
  );
}
