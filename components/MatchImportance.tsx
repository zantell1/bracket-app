"use client";
import type { GameImportance } from "@/lib/scoring";
import { winProbability } from "@/lib/kenpom-data";

export default function MatchImportance({ games }: { games: (GameImportance & { winProbTeam1: number; winProbTeam2: number })[] }) {
  if (!games.length) return null;

  const upcomingGames = games.filter((g) => g.team1 !== "TBD" && g.team2 !== "TBD");

  return (
    <section>
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
        <span>📅</span> Upcoming Games & Win Probability
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {upcomingGames.map((g) => (
          <div key={g.gameId} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] text-white/25 uppercase tracking-wider">{g.round}</span>
              <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">
                +{g.importance[0]?.pointsAtStake ?? 0} pts
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{g.team1}</span>
                <span className="text-sm tabular-nums text-blue-400">{Math.round(g.winProbTeam1 * 100)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${g.winProbTeam1 * 100}%` }} />
                <div className="h-full bg-orange-500 rounded-r-full" style={{ width: `${g.winProbTeam2 * 100}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{g.team2}</span>
                <span className="text-sm tabular-nums text-orange-400">{Math.round(g.winProbTeam2 * 100)}%</span>
              </div>
            </div>
            <div className="text-[10px] text-white/20 mt-2">
              Favored: <span className="text-white/40">{g.winProbTeam1 >= 0.5 ? g.team1 : g.team2}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
        <span>🎯</span> Match Importance
      </h2>
      <p className="text-sm text-white/30 mb-4">Points each person gains if their picked team wins. Brighter = higher stakes.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Rd</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Game</th>
              <th className="text-center py-2 px-2 text-white/40 font-medium text-xs">Prob</th>
              {upcomingGames[0]?.importance.map((imp) => (
                <th key={imp.participantId} className="text-center py-2 px-1 text-white/40 font-medium text-xs capitalize">
                  {imp.participantId}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {upcomingGames.map((g) => (
              <tr key={g.gameId} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="py-2 px-2 text-white/30 text-xs">{g.round}</td>
                <td className="py-2 px-2">
                  <div className="text-xs font-medium">{g.team1}</div>
                  <div className="text-[10px] text-white/30">vs</div>
                  <div className="text-xs font-medium">{g.team2}</div>
                </td>
                <td className="py-2 px-2 text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${g.winProbTeam1 * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-white/30 tabular-nums">{Math.round(g.winProbTeam1 * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center mt-0.5">
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${g.winProbTeam2 * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-white/30 tabular-nums">{Math.round(g.winProbTeam2 * 100)}%</span>
                  </div>
                </td>
                {g.importance.map((imp) => (
                  <td key={imp.participantId} className="py-2 px-1 text-center">
                    {imp.pointsAtStake > 0 ? (
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${imp.pointsAtStake >= 4 ? "bg-green-500/20 text-green-300" : "bg-green-500/10 text-green-400/60"}`}>
                        +{imp.pointsAtStake}<br />
                        <span className="font-normal text-white/40">{imp.team}</span>
                      </span>
                    ) : (
                      <span className="text-white/10 text-[10px]">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
