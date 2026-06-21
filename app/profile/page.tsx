import { Topbar, Shell } from "@/components/ui";
import { ProfileClient } from "@/components/profile-client";

export default function ProfilePage() {
  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-4xl font-black">Profile</h1>
        <ProfileClient />
      </div>
    </Shell>
  );
}
