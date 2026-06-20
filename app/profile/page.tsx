import { Topbar, Shell, Card } from "@/components/ui";

export default function ProfilePage() {
  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-4xl font-black">Profile</h1>
        <Card className="mt-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-lg bg-leaf-500 text-2xl font-black text-white">ST</span>
            <div>
              <h2 className="text-2xl font-black">Student User</h2>
              <p className="text-slate-600">Level 6 Biology learner</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4"><p className="font-bold">Role</p><p>Student or Teacher from Supabase profile</p></div>
            <div className="rounded-lg bg-slate-50 p-4"><p className="font-bold">Account security</p><p>Managed by Supabase Auth</p></div>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
