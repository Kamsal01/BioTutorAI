import { Topbar, Shell } from "@/components/ui";
import { StudentDashboardClient } from "@/components/student-dashboard-client";

export default function StudentDashboard() {
  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StudentDashboardClient />
      </div>
    </Shell>
  );
}
