"use client";
import type { EspnGame } from "@/lib/espn";
import { winProbability } from "@/lib/kenpom-data";

export default function LiveGames({ games }: { games: EspnGame[] }) {
  if (!games.length) return null;

  return (
    <section>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Now
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {games.map((g) => {
          const wp1 = winProbability(g.team1.name, g.team2.name);
          const wp2 = 1 - wp1;
          return (
            <div
              key={g.id}
              className="min-w-[280px] bg-white/[0.03] border border-white/[0.08] rounded-xl p-4"
            >
              <div className="text-xs text-red-400 font-semibold mb-2 bg-red-500/10 rounded px-2 py-0.5 inline-block">
                LIVE · {g.statusDetail}
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                  <div className="font-semibold text-sm">{g.team1.name}</div>
                  <div className="text-3xl font-black tabular-nums">{g.team1.score ?? "—"}</div>
                </div>
                <span className="text-white/20 text-sm mx-2">VS</span>
                <div className="text-center flex-1">
                  <div className="font-semibold text-sm">{g.team2.name}</div>
                  <div className="text-3xl font-black tabular-nums">{g.team2.score ?? "—"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-400 tabular-nums">{Math.round(wp1 * 100)}%</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${wp1 * 100}%` }} />
                </div>
                <span className="text-orange-400 tabular-nums">{Math.round(wp2 * 100)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
