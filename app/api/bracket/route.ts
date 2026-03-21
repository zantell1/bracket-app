import { NextResponse } from "next/server";
import { fetchLiveBracket } from "@/lib/espn";
import { BRACKET_2026, type Bracket, type Game } from "@/lib/bracket-data";
import { PARTICIPANTS } from "@/lib/participants";
import { scoreAll, calcMatchImportance } from "@/lib/scoring";
import { winProbability } from "@/lib/kenpom-data";

function mergeLiveData(bracket: Bracket, espnGames: Awaited<ReturnType<typeof fetchLiveBracket>>): Bracket {
  if (!espnGames.length) return bracket;

  const espnByTeams = new Map<string, (typeof espnGames)[number]>();
  for (const g of espnGames) {
    const key = [g.team1.name, g.team2.name].sort().join("||");
    espnByTeams.set(key, g);
  }

  function updateGame(g: Game): Game {
    if (g.team1.name === "TBD" || g.team2.name === "TBD") return g;
    const key = [g.team1.name, g.team2.name].sort().join("||");
    const live = espnByTeams.get(key);
    if (!live) return g;

    const espnTeam1IsT1 = live.team1.name === g.team1.name;
    const s1 = espnTeam1IsT1 ? live.team1.score : live.team2.score;
    const s2 = espnTeam1IsT1 ? live.team2.score : live.team1.score;

    let status: Game["status"] = g.status;
    if (live.status === "in") status = "in_progress";
    else if (live.status === "post") status = "final";

    let winner: 1 | 2 | undefined = g.winner;
    if (status === "final" && s1 !== undefined && s2 !== undefined) {
      winner = s1 > s2 ? 1 : 2;
    }

    return { ...g, status, score1: s1 ?? g.score1, score2: s2 ?? g.score2, winner, statusLabel: live.statusDetail || g.statusLabel };
  }

  return {
    ...bracket,
    firstFour: bracket.firstFour.map(updateGame),
    regions: bracket.regions.map((r) => ({ ...r, rounds: r.rounds.map((round) => round.map(updateGame)) })),
    finalFour: bracket.finalFour.map(updateGame),
    championship: bracket.championship ? updateGame(bracket.championship) : null,
  };
}

function buildResponse(
  bracket: Bracket,
  participants: typeof PARTICIPANTS,
  espnGames: Awaited<ReturnType<typeof fetchLiveBracket>>
) {
  const scores = scoreAll(participants, bracket);
  const matchImportance = calcMatchImportance(participants, bracket);

  const gamesWithProbs = matchImportance.map((g) => ({
    ...g,
    winProbTeam1: winProbability(g.team1, g.team2),
    winProbTeam2: 1 - winProbability(g.team1, g.team2),
  }));

  const liveGames = espnGames.filter((g) => g.status === "in");

  return NextResponse.json({
    bracket,
    scores,
    matchImportance: gamesWithProbs,
    liveGames,
    updatedAt: new Date().toISOString(),
  });
}

export async function GET() {
  try {
    const espnGames = await fetchLiveBracket();
    const bracket = mergeLiveData(BRACKET_2026, espnGames);
    return buildResponse(bracket, PARTICIPANTS, espnGames);
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

    return buildResponse(bracket, participants, espnGames);
  } catch (err) {
    console.error("Bracket API POST error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
