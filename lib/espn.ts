export interface EspnGame {
  id: string;
  team1: { name: string; score: number | undefined };
  team2: { name: string; score: number | undefined };
  status: "pre" | "in" | "post";
  statusDetail: string;
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
  "TCU": "TCU",
  "UCLA": "UCLA",
  "SMU": "SMU",
  "UMBC": "UMBC",
  "USC": "USC",
};

function normalizeName(raw: string): string {
  return ESPN_NAME_MAP[raw] ?? raw;
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
function processEvent(event: any): EspnGame {
  const competitors = event.competitions?.[0]?.competitors ?? [];
  const home = competitors.find((c: { homeAway: string }) => c.homeAway === "home");
  const away = competitors.find((c: { homeAway: string }) => c.homeAway === "away");

  const statusType = event.status?.type?.name ?? "";
  let status: EspnGame["status"] = "pre";
  if (statusType === "STATUS_IN_PROGRESS" || statusType === "STATUS_HALFTIME" || statusType === "STATUS_END_PERIOD") {
    status = "in";
  } else if (statusType === "STATUS_FINAL") {
    status = "post";
  }

  return {
    id: event.id,
    team1: {
      name: normalizeName(away?.team?.shortDisplayName ?? away?.team?.displayName ?? "TBD"),
      score: away?.score !== undefined ? parseInt(away.score, 10) : undefined,
    },
    team2: {
      name: normalizeName(home?.team?.shortDisplayName ?? home?.team?.displayName ?? "TBD"),
      score: home?.score !== undefined ? parseInt(home.score, 10) : undefined,
    },
    status,
    statusDetail: event.status?.type?.shortDetail ?? "",
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
