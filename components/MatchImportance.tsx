"use client";
import type { PoolLeverageGame } from "@/lib/scoring";
import { LEVERAGE_WEIGHTS } from "@/lib/scoring";

type GameRow = PoolLeverageGame & { winProbTeam1: number; winProbTeam2: number };

export default function MatchImportance({ games }: { games: GameRow[] }) {
  if (!games.length) return null;

  return (
    <section>
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
        <span>⚡</span> Top 10 pool leverage
      </h2>
      <p className="text-sm text-white/35 mb-2 max-w-3xl">
        Ranked by a <strong className="text-white/50">weight</strong> that combines leaderboard movement, whether{" "}
        <strong className="text-white/50">first place can change</strong>, top-3 shuffles, and{" "}
        <strong className="text-white/50">contrarian picks</strong> (sole or tiny minorities on a team — the games
        that can toast someone). KenPom % is context only.
      </p>
      <p className="text-[10px] text-white/20 mb-5 font-mono">
        Weights: rank swing ×{LEVERAGE_WEIGHTS.rankSwing}, leader flip +{LEVERAGE_WEIGHTS.leaderFlip}, podium +{LEVERAGE_WEIGHTS.podiumChange}, sole picker +{LEVERAGE_WEIGHTS.solePicker} each side, duo +{LEVERAGE_WEIGHTS.duoPicker}, split × pts ×{LEVERAGE_WEIGHTS.roundPoints}√(n₁n₂); unanimous games damped.
      </p>

      <div className="space-y-3">
        {games.map((g, idx) => {
          const fav = g.winProbTeam1 >= 0.5 ? g.team1 : g.team2;
          return (
            <div
              key={g.gameId}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex flex-col sm:flex-row sm:items-stretch gap-4"
            >
              <div className="flex items-start gap-3 sm:w-52 shrink-0">
                <span
                  className={`text-lg font-black tabular-nums w-8 shrink-0 ${
                    idx === 0 ? "text-amber-400" : idx === 1 ? "text-white/50" : "text-white/25"
                  }`}
                >
                  #{idx + 1}
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">{g.round}</div>
                  <div className="font-semibold text-sm leading-tight">{g.team1}</div>
                  <div className="text-[10px] text-white/25 my-0.5">vs</div>
                  <div className="font-semibold text-sm leading-tight">{g.team2}</div>
                  <div className="mt-2 text-[10px] text-white/25">
                    Picks:{" "}
                    <span className="text-white/45">
                      {g.splitTeam1} · {g.splitTeam2}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono bg-amber-500/15 text-amber-200/90 px-2 py-0.5 rounded-md border border-amber-500/20">
                    weight {g.weight}
                  </span>
                  <span className="text-[10px] text-white/25">KenPom fav: {fav}</span>
                </div>
                <div className="flex items-center gap-2 max-w-xs">
                  <span className="text-[9px] text-blue-400/80 w-8">{Math.round(g.winProbTeam1 * 100)}%</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: `${g.winProbTeam1 * 100}%` }} />
                    <div className="h-full bg-orange-500" style={{ width: `${g.winProbTeam2 * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-orange-400/80 w-8 text-right">{Math.round(g.winProbTeam2 * 100)}%</span>
                </div>
                <ul className="text-xs text-white/45 space-y-1.5 list-disc pl-4 marker:text-white/20">
                  {g.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
