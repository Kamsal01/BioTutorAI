import { Medal } from "lucide-react";
import { Topbar, Shell, Card } from "@/components/ui";

const leaders = [
  ["Amina S.", 2420, 14],
  ["David E.", 2310, 13],
  ["You", 1420, 9],
  ["Joel O.", 1280, 7],
  ["Mary K.", 1215, 6]
];

export default function LeaderboardPage() {
  return (
    <Shell>
      <Topbar role="student" />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-4xl font-black">Leaderboard</h1>
        <div className="mt-6 space-y-3">
          {leaders.map(([name, xp, streak], index) => (
            <Card key={String(name)} className={name === "You" ? "border-leaf-500 bg-leaf-50" : ""}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-sun font-black">{index + 1}</span>
                  <div>
                    <h2 className="font-black">{String(name)}</h2>
                    <p className="text-sm text-slate-600">{String(streak)} day streak</p>
                  </div>
                </div>
                <p className="flex items-center gap-2 font-black text-leaf-700"><Medal className="h-5 w-5" /> {String(xp)} XP</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  );
}
