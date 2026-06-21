import { Topbar, Shell } from "@/components/ui";
import { ProgressClient } from "@/components/progress-client";

export default function ProgressPage() {
  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-4xl font-black">Progress</h1>
        <div className="mt-6 grid gap-4">
          <ProgressClient />
        </div>
      </div>
    </Shell>
  );
}
