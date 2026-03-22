export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  seed: number;
}

export interface Game {
  id: string;
  status: "scheduled" | "in_progress" | "final";
  team1: Team;
  team2: Team;
  score1?: number;
  score2?: number;
  winner?: 1 | 2;
  statusLabel?: string;
}

export type RegionName = "SOUTH" | "EAST" | "WEST" | "MIDWEST";

export interface Region {
  name: RegionName;
  rounds: Game[][];
}

export interface Bracket {
  year: number;
  regions: Region[];
  finalFour: Game[];
  championship: Game | null;
  firstFour: Game[];
}

export interface Picks {
  [gameId: string]: string;
}

export const ROUND_POINTS: Record<number, number> = {
  1: 1,  // R64
  2: 2,  // R32
  3: 4,  // Sweet 16
  4: 8,  // Elite 8
  5: 16, // Final Four
  6: 32, // Championship
};

export function findGameById(bracket: Bracket, gameId: string): Game | null {
  for (const region of bracket.regions) {
    for (const round of region.rounds) {
      for (const g of round) {
        if (g.id === gameId) return g;
      }
    }
  }
  for (const g of bracket.finalFour) {
    if (g.id === gameId) return g;
  }
  if (bracket.championship?.id === gameId) return bracket.championship;
  return null;
}

export function getRoundIndex(gameId: string): number {
  const m = gameId.match(/^([semw])(\d+)$/);
  if (!m) {
    if (gameId === "champ") return 6;
    if (gameId.startsWith("ff-")) return 5;
    return 1;
  }
  const num = parseInt(m[2], 10);
  if (num <= 8) return 1;
  if (num <= 12) return 2;
  if (num <= 14) return 3;
  if (num <= 15) return 4;
  return 1;
}

export function getTeamLogoUrl(teamId: number, size = 64): string {
  return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/${teamId}.png&w=${size}&h=${size}&scale=crop&cquality=90`;
}

const TEAM_IDS: Record<string, number> = {
  Florida: 57, Clemson: 228, Vanderbilt: 238, Nebraska: 158, "North Carolina": 153, Illinois: 356,
  "Saint Mary's": 260, Houston: 248, Duke: 150, "Ohio St": 194, "St John's": 2599, Kansas: 2305,
  Louisville: 97, "Michigan St": 127, UCLA: 26, UConn: 41, Arizona: 12, Villanova: 222, Wisconsin: 275,
  Arkansas: 8, BYU: 252, Gonzaga: 2250, "Miami FL": 2390, Purdue: 2509, Michigan: 130, Georgia: 61,
  "Texas Tech": 2641, Alabama: 333, Tennessee: 2633, Virginia: 258, Kentucky: 96, "Iowa State": 66,
  "Prairie View": 2504, Howard: 47, Iowa: 2294, McNeese: 2377, Troy: 2653, VCU: 2670, Penn: 219,
  "Texas A&M": 245, Idaho: 70, Siena: 2561, TCU: 2628, "Northern Iowa": 2460, "Cal Baptist": 2856,
  "South Florida": 58, "North Dakota St": 2449, UCF: 2116, Furman: 231, LIU: 112358,
  "Utah State": 328, "High Point": 2272, Hawaii: 62, Texas: 251, "Kennesaw St": 338, Missouri: 142,
  Queens: 2511, "Saint Louis": 139, Akron: 2006, Hofstra: 2275, "Miami OH": 193, "Wright St": 2750,
  "Santa Clara": 2541, "Tennessee St": 2635,
};

const TBD: Team = { id: 0, name: "TBD", abbreviation: "TBD", seed: 0 };

function t(name: string, seed: number): Team {
  return { id: TEAM_IDS[name] ?? 0, name, abbreviation: name.slice(0, 3).toUpperCase(), seed };
}

function scheduled(id: string, team1: Team, team2: Team): Game {
  return { id, status: "scheduled", team1, team2 };
}

function placeholder(id: string): Game {
  return scheduled(id, TBD, TBD);
}

export const BRACKET_2026: Bracket = {
  year: 2026,
  firstFour: [],
  regions: [
    {
      name: "SOUTH",
      rounds: [
        [
          scheduled("s1", t("Florida", 1), t("Prairie View", 16)),
          scheduled("s2", t("Clemson", 8), t("Iowa", 9)),
          scheduled("s3", t("Vanderbilt", 5), t("McNeese", 12)),
          scheduled("s4", t("Nebraska", 4), t("Troy", 13)),
          scheduled("s5", t("North Carolina", 6), t("VCU", 11)),
          scheduled("s6", t("Illinois", 3), t("Penn", 14)),
          scheduled("s7", t("Saint Mary's", 7), t("Texas A&M", 10)),
          scheduled("s8", t("Houston", 2), t("Idaho", 15)),
        ],
        [placeholder("s9"), placeholder("s10"), placeholder("s11"), placeholder("s12")],
        [placeholder("s13"), placeholder("s14")],
        [placeholder("s15")],
      ],
    },
    {
      name: "EAST",
      rounds: [
        [
          scheduled("e1", t("Duke", 1), t("Siena", 16)),
          scheduled("e2", t("Ohio St", 8), t("TCU", 9)),
          scheduled("e3", t("St John's", 5), t("Northern Iowa", 12)),
          scheduled("e4", t("Kansas", 4), t("Cal Baptist", 13)),
          scheduled("e5", t("Louisville", 6), t("South Florida", 11)),
          scheduled("e6", t("Michigan St", 3), t("North Dakota St", 14)),
          scheduled("e7", t("UCLA", 7), t("UCF", 10)),
          scheduled("e8", t("UConn", 2), t("Furman", 15)),
        ],
        [placeholder("e9"), placeholder("e10"), placeholder("e11"), placeholder("e12")],
        [placeholder("e13"), placeholder("e14")],
        [placeholder("e15")],
      ],
    },
    {
      name: "WEST",
      rounds: [
        [
          scheduled("w1", t("Arizona", 1), t("LIU", 16)),
          scheduled("w2", t("Villanova", 8), t("Utah State", 9)),
          scheduled("w3", t("Wisconsin", 5), t("High Point", 12)),
          scheduled("w4", t("Arkansas", 4), t("Hawaii", 13)),
          scheduled("w5", t("BYU", 6), t("Texas", 11)),
          scheduled("w6", t("Gonzaga", 3), t("Kennesaw St", 14)),
          scheduled("w7", t("Miami FL", 7), t("Missouri", 10)),
          scheduled("w8", t("Purdue", 2), t("Queens", 15)),
        ],
        [placeholder("w9"), placeholder("w10"), placeholder("w11"), placeholder("w12")],
        [placeholder("w13"), placeholder("w14")],
        [placeholder("w15")],
      ],
    },
    {
      name: "MIDWEST",
      rounds: [
        [
          scheduled("m1", t("Michigan", 1), t("Howard", 16)),
          scheduled("m2", t("Georgia", 8), t("Saint Louis", 9)),
          scheduled("m3", t("Texas Tech", 5), t("Akron", 12)),
          scheduled("m4", t("Alabama", 4), t("Hofstra", 13)),
          scheduled("m5", t("Tennessee", 6), t("Miami OH", 11)),
          scheduled("m6", t("Virginia", 3), t("Wright St", 14)),
          scheduled("m7", t("Kentucky", 7), t("Santa Clara", 10)),
          scheduled("m8", t("Iowa State", 2), t("Tennessee St", 15)),
        ],
        [placeholder("m9"), placeholder("m10"), placeholder("m11"), placeholder("m12")],
        [placeholder("m13"), placeholder("m14")],
        [placeholder("m15")],
      ],
    },
  ],
  finalFour: [placeholder("ff-east-south"), placeholder("ff-west-midwest")],
  championship: placeholder("champ"),
};
