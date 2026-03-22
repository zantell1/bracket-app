import { NextResponse } from "next/server";
import { fetchLiveBracket } from "@/lib/espn";
import { BRACKET_2026, findGameById, type Bracket, type Game } from "@/lib/bracket-data";
import { PARTICIPANTS } from "@/lib/participants";
import { scoreAll, calcPoolLeverage } from "@/lib/scoring";
import { winProbability } from "@/lib/kenpom-data";

function getWinner(g: Game): string | null {
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
    if (status === "final") {
      if (s1 !== undefined && s2 !== undefined && s1 !== s2) {
        winner = s1 > s2 ? 1 : 2;
      } else if (live.winningTeamName) {
        if (live.winningTeamName === g.team1.name) winner = 1;
        else if (live.winningTeamName === g.team2.name) winner = 2;
      }
    }

    return { ...g, status, score1: s1 ?? g.score1, score2: s2 ?? g.score2, winner, statusLabel: live.statusDetail || g.statusLabel };
  }

  // Deep clone so we can mutate
  const b: Bracket = JSON.parse(JSON.stringify(bracket));

  // Pass 1: merge ESPN data into R64 games
  for (const region of b.regions) {
    region.rounds[0] = region.rounds[0].map(updateGame);
  }

  // Propagate winners through each round, then merge ESPN data
  for (const region of b.regions) {
    const rounds = region.rounds;
    for (let ri = 1; ri < rounds.length; ri++) {
      const prev = rounds[ri - 1];
      for (let gi = 0; gi < rounds[ri].length; gi++) {
        const g = rounds[ri][gi];
        const feed1 = prev[gi * 2];
        const feed2 = prev[gi * 2 + 1];
        if (feed1 && feed2) {
          const w1 = getWinner(feed1);
          const w2 = getWinner(feed2);
          if (w1) g.team1 = { ...feed1.team1, name: w1, seed: w1 === feed1.team1.name ? feed1.team1.seed : feed1.team2.seed };
          if (w2) g.team2 = { ...feed2.team1, name: w2, seed: w2 === feed2.team1.name ? feed2.team1.seed : feed2.team2.seed };
        }
      }
      // Now merge ESPN data for this round
      rounds[ri] = rounds[ri].map(updateGame);
    }
  }

  // Propagate regional winners into Final Four
  const regionMap: Record<string, Game> = {};
  for (const region of b.regions) {
    const last = region.rounds[region.rounds.length - 1];
    if (last?.[0]) regionMap[region.name] = last[0];
  }

  // ff-east-south: East E8 winner vs South E8 winner
  const ffES = b.finalFour[0];
  const eastChamp = getWinner(regionMap["EAST"]);
  const southChamp = getWinner(regionMap["SOUTH"]);
  if (eastChamp && regionMap["EAST"]) ffES.team1 = { ...regionMap["EAST"].team1, name: eastChamp, seed: eastChamp === regionMap["EAST"].team1.name ? regionMap["EAST"].team1.seed : regionMap["EAST"].team2.seed };
  if (southChamp && regionMap["SOUTH"]) ffES.team2 = { ...regionMap["SOUTH"].team1, name: southChamp, seed: southChamp === regionMap["SOUTH"].team1.name ? regionMap["SOUTH"].team1.seed : regionMap["SOUTH"].team2.seed };
  b.finalFour[0] = updateGame(ffES);

  // ff-west-midwest: West E8 winner vs Midwest E8 winner
  const ffWM = b.finalFour[1];
  const westChamp = getWinner(regionMap["WEST"]);
  const midwestChamp = getWinner(regionMap["MIDWEST"]);
  if (westChamp && regionMap["WEST"]) ffWM.team1 = { ...regionMap["WEST"].team1, name: westChamp, seed: westChamp === regionMap["WEST"].team1.name ? regionMap["WEST"].team1.seed : regionMap["WEST"].team2.seed };
  if (midwestChamp && regionMap["MIDWEST"]) ffWM.team2 = { ...regionMap["MIDWEST"].team1, name: midwestChamp, seed: midwestChamp === regionMap["MIDWEST"].team1.name ? regionMap["MIDWEST"].team1.seed : regionMap["MIDWEST"].team2.seed };
  b.finalFour[1] = updateGame(ffWM);

  // Championship
  if (b.championship) {
    const ff1Winner = getWinner(b.finalFour[0]);
    const ff2Winner = getWinner(b.finalFour[1]);
    if (ff1Winner) b.championship.team1 = { ...b.finalFour[0].team1, name: ff1Winner, seed: ff1Winner === b.finalFour[0].team1.name ? b.finalFour[0].team1.seed : b.finalFour[0].team2.seed };
    if (ff2Winner) b.championship.team2 = { ...b.finalFour[1].team1, name: ff2Winner, seed: ff2Winner === b.finalFour[1].team1.name ? b.finalFour[1].team1.seed : b.finalFour[1].team2.seed };
    b.championship = updateGame(b.championship);
  }

  return b;
}

function espnKey(t1: string, t2: string): string {
  return [t1, t2].sort().join("||");
}

function buildResponse(
  bracket: Bracket,
  participants: typeof PARTICIPANTS,
  espnGames: Awaited<ReturnType<typeof fetchLiveBracket>>
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

  return NextResponse.json({
    bracket,
    scores,
    poolLeverage: leverageWithProbs,
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
