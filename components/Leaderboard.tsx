"use client";
import type { ParticipantScore } from "@/lib/scoring";

export default function Leaderboard({ scores }: { scores: ParticipantScore[] }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>🏆</span> Leaderboard
        </h2>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {scores.map((s, i) => (
          <div
            key={s.participant.id}
            className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors"
          >
            <span className={`w-6 text-center font-bold text-sm ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-white/30"}`}>
              {i + 1}
            </span>
            {s.participant.photo && (
              <img
                src={s.participant.photo}
                alt={s.participant.name}
                className="w-8 h-8 rounded-full object-cover"
                style={{ width: 32, height: 32 }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{s.participant.name}</div>
              <div className="text-xs text-white/30">
                {s.correctPicks}/{s.totalDecided} correct
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black tabular-nums">{s.currentPoints}</div>
              <div className="text-[10px] text-white/25">max {s.maxPossible}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
