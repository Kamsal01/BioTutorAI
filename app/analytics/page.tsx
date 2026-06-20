import { BarChart3, MessageSquare, Timer, TrendingUp } from "lucide-react";
import { Topbar, Shell, Stat, Card } from "@/components/ui";

export default function AnalyticsPage() {
  return (
    <Shell>
      <Topbar role="teacher" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-4xl font-black">Learning analytics</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat label="Pre-test average" value="54%" />
          <Stat label="Post-test average" value="78%" accent="text-leaf-700" />
          <Stat label="Time learning" value="316h" />
          <Stat label="Engagement" value="High" accent="text-coral" />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-black"><TrendingUp className="h-6 w-6 text-leaf-700" /> Progress over time</h2>
            <div className="mt-5 grid h-72 place-items-center rounded-lg bg-slate-50 text-sm font-bold text-slate-500">Chart area: connect Recharts to quiz_attempts and progress tables</div>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-black"><BarChart3 className="h-6 w-6 text-coral" /> Weak and strong topics</h2>
            <ul className="mt-5 space-y-3 text-slate-700">
              <li><strong>Weak:</strong> Pests and diseases, fertilization, conservation symbols</li>
              <li><strong>Strong:</strong> Conservation meaning, soil conservation, wildlife conservation</li>
              <li><strong>Remediation queue:</strong> 22 learners</li>
            </ul>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-black"><MessageSquare className="h-6 w-6 text-leaf-700" /> Chatbot interactions</h2>
            <p className="mt-4 text-slate-600">Monitor Biology misconceptions, tutor question volume, and flagged unrelated prompts from chatbot_logs.</p>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 text-2xl font-black"><Timer className="h-6 w-6 text-sun" /> Engagement level</h2>
            <p className="mt-4 text-slate-600">Engagement combines time spent, lesson completion, quiz retry frequency, streaks, and tutor use.</p>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
