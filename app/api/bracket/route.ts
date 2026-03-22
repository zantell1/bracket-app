import { NextResponse } from "next/server";
import { fetchLiveBracket } from "@/lib/espn";
import { mergeLiveData } from "@/lib/merge-espn-bracket";
import {
  BRACKET_2026,
  collectBracketGames,
  findGameById,
  getRoundIndex,
  ROUND_POINTS,
  type Bracket,
} from "@/lib/bracket-data";
import { getResolvedWinnerName } from "@/lib/game-result";
import { PARTICIPANTS } from "@/lib/participants";
import { scoreAll, calcPoolLeverage } from "@/lib/scoring";
import { winProbability } from "@/lib/kenpom-data";

function espnKey(t1: string, t2: string): string {
  return [t1, t2].sort().join("||");
}

function buildResponse(
  bracket: Bracket,
  participants: typeof PARTICIPANTS,
  espnGames: Awaited<ReturnType<typeof fetchLiveBracket>>,
  debug: boolean
) {
  const scores = scoreAll(participants, bracket);
  const poolLeverage = calcPoolLeverage(participants, bracket, 10);

  const espnByTeams = new Map<string, (typeof espnGames)[number]>();
  for (const eg of espnGames) {
    espnByTeams.set(espnKey(eg.team1.name, eg.team2.name), eg);
  }

  const leverageWithProbs = poolLeverage.map((g) => {
    const bg = findGameById(bracket, g.gameId);
    const espn = espnByTeams.get(espnKey(g.team1, g.team2));
    return {
      ...g,
      winProbTeam1: winProbability(g.team1, g.team2),
      winProbTeam2: 1 - winProbability(g.team1, g.team2),
      startsAt: espn?.startTime ?? null,
      channel: espn?.channel ?? null,
      gameStatus: bg?.status ?? null,
      score1: bg?.score1,
      score2: bg?.score2,
      statusLabel: bg?.statusLabel ?? null,
    };
  });

  const liveGames = espnGames.filter((g) => g.status === "in");

  const payload: Record<string, unknown> = {
    bracket,
    scores,
    poolLeverage: leverageWithProbs,
    liveGames,
    updatedAt: new Date().toISOString(),
  };

  if (debug) {
    const bracketKeys = new Set<string>();
    for (const g of collectBracketGames(bracket)) {
      if (g.team1.name !== "TBD" && g.team2.name !== "TBD") {
        bracketKeys.add(espnKey(g.team1.name, g.team2.name));
      }
    }
    const espnFinals = espnGames.filter((e) => e.status === "post");
    const unmergedEspn = espnFinals
      .filter((e) => !bracketKeys.has(espnKey(e.team1.name, e.team2.name)))
      .map((e) => `${e.team1.name} vs ${e.team2.name}`);

    const finalsNoWinner: string[] = [];
    for (const g of collectBracketGames(bracket)) {
      if (g.status === "final" && !getResolvedWinnerName(g)) {
        finalsNoWinner.push(g.id);
      }
    }

    const byGame = collectBracketGames(bracket)
      .filter((g) => getResolvedWinnerName(g))
      .map((g) => ({
        id: g.id,
        t1: g.team1.name,
        t2: g.team2.name,
        winner: getResolvedWinnerName(g),
        round: getRoundIndex(g.id),
        pts: ROUND_POINTS[getRoundIndex(g.id)] ?? 0,
      }));

    payload.scoreDebug = { unmergedEspn, finalsNoWinner, decidedGames: byGame };
  }

  return NextResponse.json(payload);
}

export async function GET(request: Request) {
  try {
    const debug = new URL(request.url).searchParams.get("debug") === "1";
    const espnGames = await fetchLiveBracket();
    const bracket = mergeLiveData(BRACKET_2026, espnGames);
    return buildResponse(bracket, PARTICIPANTS, espnGames, debug);
  } catch (err) {
    console.error("Bracket API error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const overrides: Record<string, Record<string, string>> = body.overrides ?? {};

    const espnGames = await fetchLiveBracket();
    const bracket = mergeLiveData(BRACKET_2026, espnGames);

    const participants = PARTICIPANTS.map((p) => {
      const ov = overrides[p.id];
      if (!ov) return p;
      return { ...p, picks: { ...p.picks, ...ov } };
    });

    const debug = new URL(request.url).searchParams.get("debug") === "1";
    return buildResponse(bracket, participants, espnGames, debug);
  } catch (err) {
    console.error("Bracket API POST error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
