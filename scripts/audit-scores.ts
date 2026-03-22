/**
 * Run: npx tsx scripts/audit-scores.ts
 * Flags ESPN finals we never merge + bracket finals with no resolved winner.
 */
import { fetchLiveBracket } from "../lib/espn";
import { BRACKET_2026, collectBracketGames } from "../lib/bracket-data";
import { mergeLiveData } from "../lib/merge-espn-bracket";
import { scoreAll } from "../lib/scoring";
import { PARTICIPANTS } from "../lib/participants";
import { getResolvedWinnerName } from "../lib/game-result";
import { getRoundIndex, ROUND_POINTS } from "../lib/bracket-data";

function key(t1: string, t2: string) {
  return [t1, t2].sort().join("||");
}

async function main() {
  const espn = await fetchLiveBracket();
  const merged = mergeLiveData(BRACKET_2026, espn);
  const scores = scoreAll(PARTICIPANTS, merged);

  const bracketKeys = new Set<string>();
  for (const g of collectBracketGames(merged)) {
    if (g.team1.name !== "TBD" && g.team2.name !== "TBD") {
      bracketKeys.add(key(g.team1.name, g.team2.name));
    }
  }

  const espnFinals = espn.filter((e) => e.status === "post");
  const missedEspn: string[] = [];
  for (const e of espnFinals) {
    const k = key(e.team1.name, e.team2.name);
    if (!bracketKeys.has(k)) {
      missedEspn.push(`${k} (id ${e.id})`);
    }
  }

  const brokenFinal: string[] = [];
  for (const g of collectBracketGames(merged)) {
    if (g.status === "final" && !getResolvedWinnerName(g)) {
      brokenFinal.push(`${g.id} ${g.team1.name} vs ${g.team2.name} w=${g.winner} s=${g.score1}-${g.score2}`);
    }
  }

  console.log("=== Scores ===");
  for (const s of scores) {
    const [r64, r32, s16, e8, f4, ch] = s.pointsByRound;
    console.log(
      `${s.participant.name.padEnd(10)} pts=${s.currentPoints} max=${s.maxPossible} R64=${r64} R32=${r32} S16=${s16} E8=${e8} F4=${f4} CH=${ch}`
    );
  }

  console.log("\n=== ESPN finals with no matching bracket slot (name mismatch or wrong region) ===");
  console.log(missedEspn.length ? missedEspn.join("\n") : "(none)");

  console.log("\n=== Bracket games marked final but no resolved winner (scoring bug) ===");
  console.log(brokenFinal.length ? brokenFinal.join("\n") : "(none)");

  const adam = PARTICIPANTS.find((p) => p.id === "adam");
  if (adam) {
    console.log("\n=== Adam — every decided game (compare picks to Yahoo) ===");
    for (const g of collectBracketGames(merged)) {
      const w = getResolvedWinnerName(g);
      if (!w) continue;
      const pick = adam.picks[g.id];
      const ri = getRoundIndex(g.id);
      const pts = ROUND_POINTS[ri] ?? 0;
      const got = pick === w ? pts : 0;
      console.log(
        `${g.id.padEnd(16)} R${ri} pts=${got}/${pts} pick=${pick ?? "—"} winner=${w} | ${g.team1.name} vs ${g.team2.name}`
      );
    }
  }
}

main().catch(console.error);
