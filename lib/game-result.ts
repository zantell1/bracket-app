import type { Game } from "./bracket-data";

/** Resolved winner for a bracket game (for scoring + propagation). */
export function getResolvedWinnerName(g: Game): string | null {
  if (g.status !== "final") return null;
  if (g.winner === 1 || g.winner === 2) {
    return g.winner === 1 ? g.team1.name : g.team2.name;
  }
  const s1 = g.score1;
  const s2 = g.score2;
  if (s1 !== undefined && s2 !== undefined && s1 !== s2) {
    return s1 > s2 ? g.team1.name : g.team2.name;
  }
  return null;
}
