interface KenpomRating {
  adjEM: number;
  adjO: number;
  adjD: number;
  adjT: number;
}

const KENPOM_RATINGS: Record<string, KenpomRating> = {
  Houston: { adjEM: 33.48, adjO: 120.9, adjD: 87.4, adjT: 64.2 },
  Duke: { adjEM: 32.79, adjO: 126.5, adjD: 93.7, adjT: 69.8 },
  Auburn: { adjEM: 31.87, adjO: 121.1, adjD: 89.2, adjT: 68.5 },
  Iowa: { adjEM: 28.0, adjO: 118.0, adjD: 90.0, adjT: 68.0 },
  Florida: { adjEM: 30.62, adjO: 122.3, adjD: 91.7, adjT: 67.4 },
  Michigan: { adjEM: 28.5, adjO: 119.8, adjD: 91.3, adjT: 66.5 },
  "Michigan St": { adjEM: 26.67, adjO: 120.1, adjD: 93.4, adjT: 65.0 },
  Alabama: { adjEM: 26.15, adjO: 118.5, adjD: 92.3, adjT: 71.2 },
  Tennessee: { adjEM: 27.83, adjO: 116.2, adjD: 88.4, adjT: 63.1 },
  Arizona: { adjEM: 27.04, adjO: 121.4, adjD: 94.4, adjT: 66.8 },
  Kansas: { adjEM: 25.2, adjO: 118.9, adjD: 93.7, adjT: 67.3 },
  "Iowa State": { adjEM: 25.04, adjO: 114.8, adjD: 89.8, adjT: 63.5 },
  Purdue: { adjEM: 24.52, adjO: 119.7, adjD: 95.2, adjT: 66.1 },
  "St John's": { adjEM: 23.98, adjO: 117.2, adjD: 93.2, adjT: 65.8 },
  UConn: { adjEM: 23.45, adjO: 120.3, adjD: 96.9, adjT: 68.4 },
  Gonzaga: { adjEM: 23.12, adjO: 123.1, adjD: 100.0, adjT: 71.5 },
  Illinois: { adjEM: 22.56, adjO: 117.8, adjD: 95.2, adjT: 66.9 },
  "Texas Tech": { adjEM: 22.0, adjO: 113.5, adjD: 91.5, adjT: 64.8 },
  Villanova: { adjEM: 21.5, adjO: 116.0, adjD: 94.5, adjT: 66.3 },
  Wisconsin: { adjEM: 21.2, adjO: 115.8, adjD: 94.6, adjT: 64.2 },
  Arkansas: { adjEM: 20.8, adjO: 117.2, adjD: 96.4, adjT: 69.5 },
  BYU: { adjEM: 20.3, adjO: 116.5, adjD: 96.2, adjT: 67.1 },
  Nebraska: { adjEM: 19.8, adjO: 114.2, adjD: 94.4, adjT: 65.5 },
  Clemson: { adjEM: 19.5, adjO: 115.8, adjD: 96.3, adjT: 65.8 },
  UCLA: { adjEM: 19.2, adjO: 116.3, adjD: 97.1, adjT: 66.4 },
  Louisville: { adjEM: 19.0, adjO: 115.5, adjD: 96.5, adjT: 67.2 },
  "Ohio St": { adjEM: 18.5, adjO: 114.8, adjD: 96.3, adjT: 65.9 },
  Virginia: { adjEM: 18.2, adjO: 112.4, adjD: 94.2, adjT: 60.8 },
  Kentucky: { adjEM: 18.0, adjO: 116.8, adjD: 98.8, adjT: 68.2 },
  "North Carolina": { adjEM: 17.5, adjO: 117.0, adjD: 99.5, adjT: 70.1 },
  "Miami FL": { adjEM: 17.0, adjO: 115.2, adjD: 98.2, adjT: 66.5 },
  Vanderbilt: { adjEM: 16.8, adjO: 114.5, adjD: 97.7, adjT: 67.8 },
  Georgia: { adjEM: 16.5, adjO: 113.8, adjD: 97.3, adjT: 66.2 },
  "South Florida": { adjEM: 16.0, adjO: 113.5, adjD: 97.5, adjT: 65.8 },
  "Saint Mary's": { adjEM: 15.8, adjO: 112.8, adjD: 97.0, adjT: 63.5 },
  "Texas A&M": { adjEM: 15.5, adjO: 113.2, adjD: 97.7, adjT: 66.8 },
  TCU: { adjEM: 15.0, adjO: 112.5, adjD: 97.5, adjT: 67.1 },
  UCF: { adjEM: 14.5, adjO: 112.0, adjD: 97.5, adjT: 66.0 },
  VCU: { adjEM: 14.0, adjO: 111.5, adjD: 97.5, adjT: 66.5 },
  "Northern Iowa": { adjEM: 12.0, adjO: 110.0, adjD: 98.0, adjT: 64.5 },
  "Utah State": { adjEM: 11.5, adjO: 109.5, adjD: 98.0, adjT: 65.2 },
  McNeese: { adjEM: 11.0, adjO: 110.2, adjD: 99.2, adjT: 68.5 },
  "Cal Baptist": { adjEM: 5.0, adjO: 105.0, adjD: 100.0, adjT: 66.0 },
  Troy: { adjEM: 6.0, adjO: 106.0, adjD: 100.0, adjT: 67.0 },
  "High Point": { adjEM: 7.0, adjO: 107.5, adjD: 100.5, adjT: 68.0 },
  Akron: { adjEM: 8.0, adjO: 108.0, adjD: 100.0, adjT: 65.5 },
  Hofstra: { adjEM: 7.5, adjO: 107.0, adjD: 99.5, adjT: 67.5 },
  Penn: { adjEM: 6.5, adjO: 106.5, adjD: 100.0, adjT: 65.0 },
  Furman: { adjEM: 5.5, adjO: 105.5, adjD: 100.0, adjT: 64.0 },
  Siena: { adjEM: 3.0, adjO: 103.0, adjD: 100.0, adjT: 66.0 },
  Idaho: { adjEM: 1.0, adjO: 101.0, adjD: 100.0, adjT: 65.0 },
  "North Dakota St": { adjEM: 4.0, adjO: 104.0, adjD: 100.0, adjT: 64.0 },
  LIU: { adjEM: -2.0, adjO: 99.0, adjD: 101.0, adjT: 67.0 },
  "Kennesaw St": { adjEM: 2.0, adjO: 102.0, adjD: 100.0, adjT: 65.0 },
  Missouri: { adjEM: 13.0, adjO: 111.0, adjD: 98.0, adjT: 67.5 },
  Texas: { adjEM: 14.8, adjO: 112.3, adjD: 97.5, adjT: 66.2 },
  Queens: { adjEM: 0.0, adjO: 100.0, adjD: 100.0, adjT: 66.0 },
  Hawaii: { adjEM: 4.5, adjO: 104.5, adjD: 100.0, adjT: 67.0 },
  "Prairie View": { adjEM: -5.0, adjO: 97.0, adjD: 102.0, adjT: 68.0 },
  Howard: { adjEM: -4.0, adjO: 98.0, adjD: 102.0, adjT: 67.0 },
  "Saint Louis": { adjEM: 10.0, adjO: 108.0, adjD: 98.0, adjT: 65.0 },
  "Miami OH": { adjEM: 9.0, adjO: 107.0, adjD: 98.0, adjT: 64.5 },
  "Wright St": { adjEM: 3.5, adjO: 103.5, adjD: 100.0, adjT: 65.5 },
  "Santa Clara": { adjEM: 8.5, adjO: 108.0, adjD: 99.5, adjT: 66.0 },
  "Tennessee St": { adjEM: -3.0, adjO: 98.5, adjD: 101.5, adjT: 67.0 },
};

const BRACKET_TO_KENPOM: Record<string, string> = {
  "St John's": "St John's",
  "Michigan St": "Michigan St",
  "Iowa State": "Iowa State",
  "Texas A&M": "Texas A&M",
  "North Carolina": "North Carolina",
  "Ohio St": "Ohio St",
  "Texas Tech": "Texas Tech",
  "South Florida": "South Florida",
  "North Dakota St": "North Dakota St",
  "Saint Mary's": "Saint Mary's",
  "Cal Baptist": "Cal Baptist",
  "Northern Iowa": "Northern Iowa",
  "Miami FL": "Miami FL",
  "Miami OH": "Miami OH",
  "Utah State": "Utah State",
  "High Point": "High Point",
  "Kennesaw St": "Kennesaw St",
  "Prairie View": "Prairie View",
  "Wright St": "Wright St",
  "Santa Clara": "Santa Clara",
  "Tennessee St": "Tennessee St",
  "Saint Louis": "Saint Louis",
};

function getRating(teamName: string): KenpomRating | null {
  const key = BRACKET_TO_KENPOM[teamName] ?? teamName;
  return KENPOM_RATINGS[key] ?? null;
}

export function winProbability(team1Name: string, team2Name: string): number {
  const r1 = getRating(team1Name);
  const r2 = getRating(team2Name);
  if (!r1 || !r2) return 0.5;
  const diff = r1.adjEM - r2.adjEM;
  return 1 / (1 + Math.pow(10, -diff / 10));
}
