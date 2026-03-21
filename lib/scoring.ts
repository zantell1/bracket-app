import type { Bracket, Picks, Game } from "./bracket-data";
import { ROUND_POINTS, getRoundIndex } from "./bracket-data";
import type { Participant } from "./participants";

export interface ParticipantScore {
  participant: Participant;
  currentPoints: number;
  maxPossible: number;
  correctPicks: number;
  totalDecided: number;
  eliminated: string[];
}

export interface GameImportance {
  gameId: string;
  round: string;
  team1: string;
  team2: string;
  importance: { participantId: string; team: string; pointsAtStake: number }[];
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
  if (game.status !== "final" || !game.winner) return null;
  return game.winner === 1 ? game.team1.name : game.team2.name;
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
      return {
        participant: p,
        currentPoints: points,
        maxPossible: calcMaxPossible(p.picks, bracket),
        correctPicks: correct,
        totalDecided: decided,
        eliminated: findEliminated(p.picks, bracket),
      };
    })
    .sort((a, b) => b.currentPoints - a.currentPoints || b.maxPossible - a.maxPossible);
}

export function calcMatchImportance(participants: Participant[], bracket: Bracket): GameImportance[] {
  const upcoming = allGames(bracket).filter(
    (g) => g.status === "scheduled" || g.status === "in_progress"
  );

  return upcoming
    .filter((g) => g.team1.name !== "TBD" && g.team2.name !== "TBD")
    .map((game) => {
      const roundIdx = getRoundIndex(game.id);
      const pts = ROUND_POINTS[roundIdx] ?? 0;
      const roundNames = ["", "R64", "R32", "Sweet 16", "Elite 8", "Final Four", "Championship"];

      const importance = participants.map((p) => ({
        participantId: p.id,
        team: p.picks[game.id] ?? "—",
        pointsAtStake: p.picks[game.id] ? pts : 0,
      }));

      return {
        gameId: game.id,
        round: roundNames[roundIdx] ?? `Round ${roundIdx}`,
        team1: game.team1.name,
        team2: game.team2.name,
        importance,
      };
    });
}
