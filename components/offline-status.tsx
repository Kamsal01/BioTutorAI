"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export function OfflineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;

  return (
    <Link href="/offline" className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-soft">
      <WifiOff className="h-4 w-4" />
      Offline mode
    </Link>
  );
}
