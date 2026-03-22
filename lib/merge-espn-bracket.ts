import type { Bracket, Game } from "./bracket-data";
import type { EspnGame } from "./espn";
import { getResolvedWinnerName } from "./game-result";

/**
 * Merge ESPN scoreboard rows into a bracket clone (same logic as API route).
 */
export function mergeLiveData(bracket: Bracket, espnGames: EspnGame[]): Bracket {
  if (!espnGames.length) return bracket;

  const espnByTeams = new Map<string, EspnGame>();
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
      } else if (live.winnerIsEspnTeam1 !== undefined) {
        // away = EspnGame.team1; avoids brittle string compare on winner name
        winner = espnTeam1IsT1 ? (live.winnerIsEspnTeam1 ? 1 : 2) : live.winnerIsEspnTeam1 ? 2 : 1;
      } else if (live.winningTeamName) {
        if (live.winningTeamName === g.team1.name) winner = 1;
        else if (live.winningTeamName === g.team2.name) winner = 2;
      }
    }

    return { ...g, status, score1: s1 ?? g.score1, score2: s2 ?? g.score2, winner, statusLabel: live.statusDetail || g.statusLabel };
  }

  const b: Bracket = JSON.parse(JSON.stringify(bracket));

  for (const region of b.regions) {
    region.rounds[0] = region.rounds[0].map(updateGame);
  }

  for (const region of b.regions) {
    const rounds = region.rounds;
    for (let ri = 1; ri < rounds.length; ri++) {
      const prev = rounds[ri - 1];
      for (let gi = 0; gi < rounds[ri].length; gi++) {
        const g = rounds[ri][gi];
        const feed1 = prev[gi * 2];
        const feed2 = prev[gi * 2 + 1];
        if (feed1 && feed2) {
          const w1 = getResolvedWinnerName(feed1);
          const w2 = getResolvedWinnerName(feed2);
          if (w1) g.team1 = { ...feed1.team1, name: w1, seed: w1 === feed1.team1.name ? feed1.team1.seed : feed1.team2.seed };
          if (w2) g.team2 = { ...feed2.team1, name: w2, seed: w2 === feed2.team1.name ? feed2.team1.seed : feed2.team2.seed };
        }
      }
      rounds[ri] = rounds[ri].map(updateGame);
    }
  }

  const regionMap: Record<string, Game> = {};
  for (const region of b.regions) {
    const last = region.rounds[region.rounds.length - 1];
    if (last?.[0]) regionMap[region.name] = last[0];
  }

  const ffES = b.finalFour[0];
  const eastChamp = getResolvedWinnerName(regionMap["EAST"]);
  const southChamp = getResolvedWinnerName(regionMap["SOUTH"]);
  if (eastChamp && regionMap["EAST"]) {
    ffES.team1 = {
      ...regionMap["EAST"].team1,
      name: eastChamp,
      seed: eastChamp === regionMap["EAST"].team1.name ? regionMap["EAST"].team1.seed : regionMap["EAST"].team2.seed,
    };
  }
  if (southChamp && regionMap["SOUTH"]) {
    ffES.team2 = {
      ...regionMap["SOUTH"].team1,
      name: southChamp,
      seed: southChamp === regionMap["SOUTH"].team1.name ? regionMap["SOUTH"].team1.seed : regionMap["SOUTH"].team2.seed,
    };
  }
  b.finalFour[0] = updateGame(ffES);

  const ffWM = b.finalFour[1];
  const westChamp = getResolvedWinnerName(regionMap["WEST"]);
  const midwestChamp = getResolvedWinnerName(regionMap["MIDWEST"]);
  if (westChamp && regionMap["WEST"]) {
    ffWM.team1 = {
      ...regionMap["WEST"].team1,
      name: westChamp,
      seed: westChamp === regionMap["WEST"].team1.name ? regionMap["WEST"].team1.seed : regionMap["WEST"].team2.seed,
    };
  }
  if (midwestChamp && regionMap["MIDWEST"]) {
    ffWM.team2 = {
      ...regionMap["MIDWEST"].team1,
      name: midwestChamp,
      seed: midwestChamp === regionMap["MIDWEST"].team1.name ? regionMap["MIDWEST"].team1.seed : regionMap["MIDWEST"].team2.seed,
    };
  }
  b.finalFour[1] = updateGame(ffWM);

  if (b.championship) {
    const ff1Winner = getResolvedWinnerName(b.finalFour[0]);
    const ff2Winner = getResolvedWinnerName(b.finalFour[1]);
    if (ff1Winner) {
      b.championship.team1 = {
        ...b.finalFour[0].team1,
        name: ff1Winner,
        seed: ff1Winner === b.finalFour[0].team1.name ? b.finalFour[0].team1.seed : b.finalFour[0].team2.seed,
      };
    }
    if (ff2Winner) {
      b.championship.team2 = {
        ...b.finalFour[1].team1,
        name: ff2Winner,
        seed: ff2Winner === b.finalFour[1].team1.name ? b.finalFour[1].team1.seed : b.finalFour[1].team2.seed,
      };
    }
    b.championship = updateGame(b.championship);
  }

  return b;
}
