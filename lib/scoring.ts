import type { Bracket, Picks, Game } from "./bracket-data";
import { ROUND_POINTS, getRoundIndex } from "./bracket-data";
import type { Participant } from "./participants";

/** Earned points per bracket stage (indices 0–5 = R64 … Championship) */
export type RoundPointsEarned = [number, number, number, number, number, number];

export const SCOREBOARD_ROUND_LABELS = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Round of 8",
  "Round of 4",
  "Championship",
] as const;

export interface ParticipantScore {
  participant: Participant;
  currentPoints: number;
  maxPossible: number;
  correctPicks: number;
  totalDecided: number;
  eliminated: string[];
  /** Points from correct picks in each round (only final games) */
  pointsByRound: RoundPointsEarned;
}

/** Weights for pool leverage (tournament standings impact, not KenPom). */
export const LEVERAGE_WEIGHTS = {
  rankSwing: 3.2,
  leaderFlip: 52,
  podiumChange: 22,
  solePicker: 48,
  duoPicker: 16,
  lopsidedMinority: 12, // 1–2 people on the smaller side
  roundPoints: 2.1, // multiplier on sqrt(n1*n2) for split games
} as const;

export interface PoolLeverageGame {
  gameId: string;
  round: string;
  team1: string;
  team2: string;
  /** Combined leverage score (higher = more pool drama) */
  weight: number;
  /** Human-readable explanations (2–4 typical) */
  reasons: string[];
  splitTeam1: number;
  splitTeam2: number;
}

function allGames(bracket: Bracket): Game[] {
  const games: Game[] = [];
  for (const region of bracket.regions) {
    for (const round of region.rounds) {
      for (const game of round) games.push(game);
    }
  }
  for (const g of bracket.finalFour) games.push(g);
  if (bracket.championship) games.push(bracket.championship);
  return games;
}

function getWinner(game: Game): string | null {
  if (game.status !== "final") return null;
  if (game.winner === 1 || game.winner === 2) {
    return game.winner === 1 ? game.team1.name : game.team2.name;
  }
  const s1 = game.score1;
  const s2 = game.score2;
  if (s1 !== undefined && s2 !== undefined && s1 !== s2) {
    return s1 > s2 ? game.team1.name : game.team2.name;
  }
  return null;
}

function calcPointsByRound(picks: Picks, bracket: Bracket): RoundPointsEarned {
  const by: RoundPointsEarned = [0, 0, 0, 0, 0, 0];
  for (const game of allGames(bracket)) {
    const winner = getWinner(game);
    if (!winner) continue;
    const pick = picks[game.id];
    if (pick !== winner) continue;
    const roundIdx = getRoundIndex(game.id);
    if (roundIdx >= 1 && roundIdx <= 6) {
      by[roundIdx - 1] += ROUND_POINTS[roundIdx] ?? 0;
    }
  }
  return by;
}

function calcCurrentScore(picks: Picks, bracket: Bracket): { points: number; correct: number; decided: number } {
  let points = 0;
  let correct = 0;
  let decided = 0;

  for (const game of allGames(bracket)) {
    const winner = getWinner(game);
    if (!winner) continue;
    decided++;
    const pick = picks[game.id];
    if (pick === winner) {
      const roundIdx = getRoundIndex(game.id);
      points += ROUND_POINTS[roundIdx] ?? 0;
      correct++;
    }
  }
  return { points, correct, decided };
}

function findEliminated(picks: Picks, bracket: Bracket): string[] {
  const losers = new Set<string>();
  for (const game of allGames(bracket)) {
    const winner = getWinner(game);
    if (!winner) continue;
    const loser = game.team1.name === winner ? game.team2.name : game.team1.name;
    losers.add(loser);
  }

  const eliminated: string[] = [];
  for (const [gameId, pick] of Object.entries(picks)) {
    if (losers.has(pick)) {
      const game = allGames(bracket).find((g) => g.id === gameId);
      if (game) {
        const winner = getWinner(game);
        if (winner && winner !== pick) continue;
        if (!winner && losers.has(pick)) eliminated.push(gameId);
      }
    }
  }
  return eliminated;
}

function calcMaxPossible(picks: Picks, bracket: Bracket): number {
  const losers = new Set<string>();
  for (const game of allGames(bracket)) {
    const winner = getWinner(game);
    if (!winner) continue;
    const loser = game.team1.name === winner ? game.team2.name : game.team1.name;
    losers.add(loser);
  }

  let max = 0;
  for (const [gameId, pick] of Object.entries(picks)) {
    const roundIdx = getRoundIndex(gameId);
    const pts = ROUND_POINTS[roundIdx] ?? 0;
    const game = allGames(bracket).find((g) => g.id === gameId);

    if (game) {
      const winner = getWinner(game);
      if (winner) {
        if (winner === pick) max += pts;
      } else {
        if (!losers.has(pick)) max += pts;
      }
    }
  }
  return max;
}

export function scoreAll(participants: Participant[], bracket: Bracket): ParticipantScore[] {
  return participants
    .map((p) => {
      const { points, correct, decided } = calcCurrentScore(p.picks, bracket);
      const pointsByRound = calcPointsByRound(p.picks, bracket);
      return {
        participant: p,
        currentPoints: points,
        maxPossible: calcMaxPossible(p.picks, bracket),
        correctPicks: correct,
        totalDecided: decided,
        eliminated: findEliminated(p.picks, bracket),
        pointsByRound,
      };
    })
    .sort((a, b) => b.currentPoints - a.currentPoints || b.maxPossible - a.maxPossible);
}

const ROUND_SHORT = ["", "R64", "R32", "Sweet 16", "Elite 8", "Final Four", "Championship"] as const;

function rankMap(scores: { id: string; score: number }[]): Map<string, number> {
  const sorted = [...scores].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const m = new Map<string, number>();
  sorted.forEach((s, i) => m.set(s.id, i));
  return m;
}

function leaderId(scores: { id: string; score: number }[]): string {
  const sorted = [...scores].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return sorted[0]?.id ?? "";
}

function topKIds(scores: { id: string; score: number }[], k: number): string {
  const sorted = [...scores].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return sorted
    .slice(0, k)
    .map((s) => s.id)
    .sort()
    .join(",");
}

/**
 * Undecided games ranked by how much the outcome moves the *pool* (ranks, leader, contrarians).
 * Top `limit` returned, sorted by weight descending.
 */
export function calcPoolLeverage(
  participants: Participant[],
  bracket: Bracket,
  limit = 10
): PoolLeverageGame[] {
  const upcoming = allGames(bracket).filter(
    (g) =>
      (g.status === "scheduled" || g.status === "in_progress") &&
      g.team1.name !== "TBD" &&
      g.team2.name !== "TBD"
  );

  const baseScores = participants.map((p) => ({
    id: p.id,
    name: p.name,
    score: calcCurrentScore(p.picks, bracket).points,
  }));

  const out: PoolLeverageGame[] = [];

  for (const game of upcoming) {
    const t1 = game.team1.name;
    const t2 = game.team2.name;
    if (t1 === "TBD" || t2 === "TBD") continue;

    const roundIdx = getRoundIndex(game.id);
    const pts = ROUND_POINTS[roundIdx] ?? 0;
    const round = ROUND_SHORT[roundIdx] ?? `R${roundIdx}`;

    const on1: { id: string; name: string }[] = [];
    const on2: { id: string; name: string }[] = [];
    for (const p of participants) {
      const pick = p.picks[game.id];
      if (pick === t1) on1.push({ id: p.id, name: p.name });
      else if (pick === t2) on2.push({ id: p.id, name: p.name });
    }

    const n1 = on1.length;
    const n2 = on2.length;
    if (n1 + n2 === 0) continue;

    const scoreIf1 = baseScores.map((b) => {
      const side = on1.some((x) => x.id === b.id);
      return { id: b.id, score: b.score + (side ? pts : 0) };
    });
    const scoreIf2 = baseScores.map((b) => {
      const side = on2.some((x) => x.id === b.id);
      return { id: b.id, score: b.score + (side ? pts : 0) };
    });

    const r1 = rankMap(scoreIf1);
    const r2 = rankMap(scoreIf2);
    let rankSwing = 0;
    for (const p of participants) {
      rankSwing += Math.abs((r1.get(p.id) ?? 0) - (r2.get(p.id) ?? 0));
    }

    const lead1 = leaderId(scoreIf1);
    const lead2 = leaderId(scoreIf2);
    const leaderFlips = lead1 !== lead2;

    const podium1 = topKIds(scoreIf1, 3);
    const podium2 = topKIds(scoreIf2, 3);
    const podiumChanges = podium1 !== podium2;

    const reasons: string[] = [];
    const W = LEVERAGE_WEIGHTS;

    if (n1 === 1) {
      reasons.push(`Only ${on1[0].name} picked ${t1}; everyone else on this game is on ${t2}.`);
    }
    if (n2 === 1) {
      reasons.push(`Only ${on2[0].name} picked ${t2}; everyone else on this game is on ${t1}.`);
    }
    if (n1 === 2 && n2 >= 1) {
      reasons.push(`${on1.map((x) => x.name).join(" & ")} are the only two on ${t1} (${n2} on ${t2}).`);
    }
    if (n2 === 2 && n1 >= 1) {
      reasons.push(`${on2.map((x) => x.name).join(" & ")} are the only two on ${t2} (${n1} on ${t1}).`);
    }

    if (leaderFlips) {
      const name1 = participants.find((p) => p.id === lead1)?.name ?? lead1;
      const name2 = participants.find((p) => p.id === lead2)?.name ?? lead2;
      reasons.push(`If ${t1} wins, ${name1} is on top; if ${t2} wins, ${name2} is — leader can flip.`);
    } else if (podiumChanges) {
      reasons.push(`The top 3 on the board reshuffles depending on who wins (${pts} pts in play).`);
    }

    if (rankSwing >= 4 && !leaderFlips) {
      reasons.push(`Heavy leaderboard movement: ${rankSwing} total rank positions shift between the two outcomes.`);
    }

    if (n1 > 0 && n2 > 0) {
      const duoStory = (n1 === 2 && n2 >= 1) || (n2 === 2 && n1 >= 1);
      if (n1 !== 1 && n2 !== 1 && !duoStory) {
        reasons.push(`Pick split: ${n1} for ${t1} · ${n2} for ${t2} (${pts} pts to the winners).`);
      }
    } else {
      reasons.push(`Unanimous on this game (${n1 > 0 ? t1 : t2}); no one took the other side — lower pool drama.`);
    }

    const soleBonus =
      (n1 === 1 ? W.solePicker : 0) + (n2 === 1 ? W.solePicker : 0);
    const duoBonus =
      (n1 === 2 && n2 >= 1 ? W.duoPicker : 0) + (n2 === 2 && n1 >= 1 ? W.duoPicker : 0);
    const minority = Math.min(n1, n2);
    const lopsided =
      minority >= 1 && minority <= 2 && n1 > 0 && n2 > 0 ? W.lopsidedMinority * (3 - minority) : 0;

    let weight =
      W.rankSwing * rankSwing +
      (leaderFlips ? W.leaderFlip : 0) +
      (podiumChanges && !leaderFlips ? W.podiumChange : 0) +
      soleBonus +
      duoBonus +
      lopsided +
      (n1 > 0 && n2 > 0 ? W.roundPoints * pts * Math.sqrt(n1 * n2) : 0);

    if (n1 === 0 || n2 === 0) weight *= 0.35;

    out.push({
      gameId: game.id,
      round,
      team1: t1,
      team2: t2,
      weight: Math.round(weight * 10) / 10,
      reasons: [...new Set(reasons)],
      splitTeam1: n1,
      splitTeam2: n2,
    });
  }

  out.sort((a, b) => b.weight - a.weight);
  return out.slice(0, limit);
}
