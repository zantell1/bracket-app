export interface EspnGame {
  id: string;
  team1: { name: string; score: number | undefined };
  team2: { name: string; score: number | undefined };
  status: "pre" | "in" | "post";
  statusDetail: string;
  /** Normalized name of winning team when game is final (from ESPN `competitors[].winner`) */
  winningTeamName?: string;
  /** True if away won (= `team1` in this row); from winner competitor `homeAway` */
  winnerIsEspnTeam1?: boolean;
  /** ISO8601 scheduled tip time (UTC from ESPN) */
  startTime?: string;
  /** TV / streaming, e.g. "TNT" or "CBS, truTV" */
  channel?: string;
}

const ESPN_NAME_MAP: Record<string, string> = {
  "UConn": "UConn",
  "Connecticut": "UConn",
  "St. John's": "St John's",
  "St. John's (NY)": "St John's",
  "N.C. State": "NC State",
  "Miami": "Miami FL",
  "Miami (FL)": "Miami FL",
  "Miami (OH)": "Miami OH",
  "N Dakota St": "North Dakota St",
  "Hawai'i": "Hawaii",
  "CA Baptist": "Cal Baptist",
  "South Fla": "South Florida",
  "S Florida": "South Florida",
  "Texas A&M": "Texas A&M",
  "VCU": "VCU",
  "BYU": "BYU",
  "UCF": "UCF",
  "LIU": "LIU",
  "Long Island": "LIU",
  "TCU": "TCU",
  "Ohio State": "Ohio St",
  "UCLA": "UCLA",
  "SMU": "SMU",
  "UMBC": "UMBC",
  "USC": "USC",
  /** Align long / alt ESPN names with `bracket-data` TEAM_IDS keys */
  "Wright State": "Wright St",
  "Tennessee State": "Tennessee St",
  SLU: "Saint Louis",
  "St. Louis U": "Saint Louis",
};

function normalizeName(raw: string): string {
  const s = raw.replace(/\u2019/g, "'").replace(/\u2018/g, "'").trim();
  return ESPN_NAME_MAP[s] ?? ESPN_NAME_MAP[raw] ?? s;
}

function parseScore(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : undefined;
}

const TOURNAMENT_DATES = [
  "20260319", "20260320", // R64
  "20260321", "20260322", // R32
  "20260327", "20260328", // Sweet 16
  "20260329", "20260330", // Elite 8
  "20260404",             // Final Four
  "20260406",             // Championship
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractChannel(comp: any): string | undefined {
  const names = new Set<string>();
  for (const b of comp?.broadcasts ?? []) {
    for (const n of b.names ?? []) {
      if (typeof n === "string" && n.trim()) names.add(n.trim());
    }
  }
  for (const g of comp?.geoBroadcasts ?? []) {
    const sn = g?.media?.shortName;
    if (typeof sn === "string" && sn.trim()) names.add(sn.trim());
  }
  if (!names.size) return undefined;
  return [...names].sort().join(", ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processEvent(event: any): EspnGame {
  const comp = event.competitions?.[0];
  const competitors = comp?.competitors ?? [];
  const home = competitors.find((c: { homeAway: string }) => c.homeAway === "home");
  const away = competitors.find((c: { homeAway: string }) => c.homeAway === "away");

  const statusType = comp?.status?.type?.name || event.status?.type?.name || "";
  let status: EspnGame["status"] = "pre";
  if (statusType === "STATUS_IN_PROGRESS" || statusType === "STATUS_HALFTIME" || statusType === "STATUS_END_PERIOD") {
    status = "in";
  } else if (statusType === "STATUS_FINAL") {
    status = "post";
  }

  const startTime =
    typeof comp?.date === "string"
      ? comp.date
      : typeof event.date === "string"
        ? event.date
        : undefined;

  const winComp = competitors.find((c: { winner?: boolean }) => c.winner === true);
  const winningTeamName = winComp
    ? normalizeName(winComp.team?.shortDisplayName ?? winComp.team?.displayName ?? "")
    : undefined;
  let winnerIsEspnTeam1: boolean | undefined;
  if (winComp?.homeAway === "away") winnerIsEspnTeam1 = true;
  else if (winComp?.homeAway === "home") winnerIsEspnTeam1 = false;

  return {
    id: event.id,
    team1: {
      name: normalizeName(away?.team?.shortDisplayName ?? away?.team?.displayName ?? "TBD"),
      score: parseScore(away?.score),
    },
    team2: {
      name: normalizeName(home?.team?.shortDisplayName ?? home?.team?.displayName ?? "TBD"),
      score: parseScore(home?.score),
    },
    status,
    statusDetail: comp?.status?.type?.shortDetail || event.status?.type?.shortDetail || "",
    startTime,
    channel: extractChannel(comp),
    winningTeamName: winningTeamName || undefined,
    winnerIsEspnTeam1,
  };
}

export async function fetchLiveBracket(): Promise<EspnGame[]> {
  const BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard";

  const responses = await Promise.all(
    TOURNAMENT_DATES.map((date) =>
      fetch(`${BASE}?groups=100&limit=100&dates=${date}`, { next: { revalidate: 30 } })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((r): Promise<any> => (r.ok ? r.json() : Promise.resolve({ events: [] })))
        .catch(() => ({ events: [] }))
    )
  );

  const seen = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allEvents: any[] = [];
  for (const data of responses) {
    for (const ev of data?.events ?? []) {
      if (!seen.has(ev.id)) {
        seen.add(ev.id);
        allEvents.push(ev);
      }
    }
  }

  return allEvents.map(processEvent);
}
