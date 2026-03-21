"use client";
import type { ParticipantScore } from "@/lib/scoring";
import { SCOREBOARD_ROUND_LABELS } from "@/lib/scoring";

const ROUND_HEADERS_SHORT = ["R64", "R32", "S16", "E8", "F4", "CH"] as const;

export default function Leaderboard({ scores }: { scores: ParticipantScore[] }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>🏆</span> Leaderboard
        </h2>
        <p className="text-xs text-white/35 mt-1">Points earned per round (final games only). Scroll horizontally on small screens.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-wide text-white/40">
              <th className="pl-5 pr-2 py-2 font-semibold w-8">#</th>
              <th className="px-2 py-2 font-semibold min-w-[140px]">Participant</th>
              {ROUND_HEADERS_SHORT.map((abbr, i) => (
                <th
                  key={abbr}
                  className="px-1.5 py-2 font-semibold text-center tabular-nums w-10"
                  title={SCOREBOARD_ROUND_LABELS[i]}
                >
                  {abbr}
                </th>
              ))}
              <th className="pl-2 pr-5 py-2 font-semibold text-right tabular-nums whitespace-nowrap min-w-[88px]">
                Pts / Poss
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {scores.map((s, i) => (
              <tr key={s.participant.id} className="hover:bg-white/[0.02] transition-colors">
                <td
                  className={`pl-5 pr-2 py-2.5 text-center font-bold tabular-nums ${
                    i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-white/30"
                  }`}
                >
                  {i + 1}
                </td>
                <td className="px-2 py-2.5 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {s.participant.photo && (
                      <img
                        src={s.participant.photo}
                        alt={s.participant.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                        width={32}
                        height={32}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{s.participant.name}</div>
                      <div className="text-[10px] text-white/30 tabular-nums">
                        {s.correctPicks}/{s.totalDecided} correct
                      </div>
                    </div>
                  </div>
                </td>
                {s.pointsByRound.map((pts, ri) => (
                  <td key={ri} className="px-1.5 py-2.5 text-center tabular-nums text-white/80">
                    {pts}
                  </td>
                ))}
                <td className="pl-2 pr-5 py-2.5 text-right">
                  <div className="font-black tabular-nums text-base">
                    {s.currentPoints}
                    <span className="text-white/35 font-semibold text-sm"> / {s.maxPossible}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
