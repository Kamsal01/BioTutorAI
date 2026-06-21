import { Medal } from "lucide-react";
import { Topbar, Shell, Card } from "@/components/ui";

const leaders: { name: string; xp: number; streak: number }[] = [];

export default function LeaderboardPage() {
  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-4xl font-black">Leaderboard</h1>
        <div className="mt-6 space-y-3">
          {leaders.length === 0 ? (
            <Card>
              <Medal className="h-8 w-8 text-sun" />
              <h2 className="mt-3 text-xl font-black">No rankings yet</h2>
              <p className="mt-2 text-slate-600">Students will appear here after they complete lessons and earn XP. New learners start with 0 XP.</p>
            </Card>
          ) : leaders.map(({ name, xp, streak }, index) => (
            <Card key={name}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-sun font-black">{index + 1}</span>
                  <div>
                    <h2 className="font-black">{name}</h2>
                    <p className="text-sm text-slate-600">{streak} day streak</p>
                  </div>
                </div>
                <p className="flex items-center gap-2 font-black text-leaf-700"><Medal className="h-5 w-5" /> {xp} XP</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  );
}
