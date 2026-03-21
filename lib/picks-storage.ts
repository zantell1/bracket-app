import type { Picks, Team } from "./bracket-data";
import { BRACKET_2026 } from "./bracket-data";

export const GAME_FEEDS: Record<string, [string, string]> = {};
for (const prefix of ["s", "e", "w", "m"]) {
  GAME_FEEDS[`${prefix}9`] = [`${prefix}1`, `${prefix}2`];
  GAME_FEEDS[`${prefix}10`] = [`${prefix}3`, `${prefix}4`];
  GAME_FEEDS[`${prefix}11`] = [`${prefix}5`, `${prefix}6`];
  GAME_FEEDS[`${prefix}12`] = [`${prefix}7`, `${prefix}8`];
  GAME_FEEDS[`${prefix}13`] = [`${prefix}9`, `${prefix}10`];
  GAME_FEEDS[`${prefix}14`] = [`${prefix}11`, `${prefix}12`];
  GAME_FEEDS[`${prefix}15`] = [`${prefix}13`, `${prefix}14`];
}
GAME_FEEDS["ff-east-south"] = ["e15", "s15"];
GAME_FEEDS["ff-west-midwest"] = ["w15", "m15"];
GAME_FEEDS["champ"] = ["ff-east-south", "ff-west-midwest"];

export const FEEDS_INTO: Record<string, string[]> = {};
for (const [downstream, [feed1, feed2]] of Object.entries(GAME_FEEDS)) {
  if (!FEEDS_INTO[feed1]) FEEDS_INTO[feed1] = [];
  if (!FEEDS_INTO[feed2]) FEEDS_INTO[feed2] = [];
  FEEDS_INTO[feed1].push(downstream);
  FEEDS_INTO[feed2].push(downstream);
}

export const R64_TEAMS: Record<string, { team1: Team; team2: Team }> = {};
for (const region of BRACKET_2026.regions) {
  for (const game of region.rounds[0]) {
    R64_TEAMS[game.id] = { team1: game.team1, team2: game.team2 };
  }
}

const SEED_LOOKUP: Record<string, number> = {};
for (const { team1, team2 } of Object.values(R64_TEAMS)) {
  SEED_LOOKUP[team1.name] = team1.seed;
  SEED_LOOKUP[team2.name] = team2.seed;
}

export function getSeed(name: string): number {
  return SEED_LOOKUP[name] ?? 0;
}

export function getTeamOptions(
  gameId: string,
  picks: Picks
): [{ name: string; seed: number } | null, { name: string; seed: number } | null] {
  const r64 = R64_TEAMS[gameId];
  if (r64) return [r64.team1, r64.team2];
  const feeds = GAME_FEEDS[gameId];
  if (!feeds) return [null, null];
  const t1 = picks[feeds[0]];
  const t2 = picks[feeds[1]];
  return [
    t1 ? { name: t1, seed: getSeed(t1) } : null,
    t2 ? { name: t2, seed: getSeed(t2) } : null,
  ];
}

export function cascadeClears(picks: Picks, changedGameId: string): Picks {
  const out = { ...picks };
  const queue = [changedGameId];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const gid = queue.shift()!;
    if (visited.has(gid)) continue;
    visited.add(gid);
    for (const ds of FEEDS_INTO[gid] ?? []) {
      const [f1, f2] = GAME_FEEDS[ds];
      const valid = [out[f1], out[f2]].filter(Boolean);
      if (out[ds] && !valid.includes(out[ds])) {
        delete out[ds];
        queue.push(ds);
      }
    }
  }
  return out;
}

const LS_PREFIX = "bracket-picks-";

export function loadPicks(participantId: string): Picks | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LS_PREFIX + participantId);
  return raw ? JSON.parse(raw) : null;
}

export function savePicks(participantId: string, picks: Picks): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_PREFIX + participantId, JSON.stringify(picks));
}

export function clearPicks(participantId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_PREFIX + participantId);
}
