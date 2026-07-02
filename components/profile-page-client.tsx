"use client";

import { useState } from "react";
import { Topbar, Shell } from "@/components/ui";
import { ProfileClient } from "@/components/profile-client";
import type { Role } from "@/lib/types";

export function ProfilePageClient() {
  const [role, setRole] = useState<Role>("student");

  return (
    <Shell>
      <Topbar role={role} />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-4xl font-black">Profile</h1>
        <ProfileClient onRoleChange={setRole} />
      </div>
    </Shell>
  );
}
