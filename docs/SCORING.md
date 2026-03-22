# Scoring vs Yahoo (and other pools)

## What we match
- **1 / 2 / 4 / 8 / 16 / 32** points per round (Round of 64 → Championship), same as standard Yahoo Tourney Pick’em.
- Winners come from **ESPN** after merging into our bracket tree.

## Known reasons totals can differ from Yahoo
1. **Picks in `lib/participants.ts` must match what was entered on Yahoo.** Any typo or outdated export → drift in both **points** and Yahoo’s **“X of 63 picks correct”** tally. Common slip-ups in Mar 2026 were **e2** (Ohio St vs TCU) and **s7** (Saint Mary’s vs Texas A&M). For **Adam** ([Pesto Boiz](https://tournament.fantasysports.yahoo.com/mens-basketball-bracket/693355)), **`e2: "Ohio St"`** is what matches Yahoo’s **34 / 63** correct count in our audit (Mar 20, 2026); a mismatched **e2** or **s7** usually moves someone by exactly **±1** on that counter.
2. **First Four (play-in) games** are **not** in our bracket JSON (`firstFour: []`). If Yahoo awarded points for a play-in pick, we have **no slot** for it — usually only affects people who picked a 16-seed that came out of a play-in.
3. **“Possible points”** can differ slightly pool-to-pool depending on how eliminated teams are treated; our `maxPossible` zeroes out paths where a picked team is already out.

## Debug API (compare to Yahoo row-by-row)
`GET /api/bracket?debug=1` adds `scoreDebug`:
- `unmergedEspn` — ESPN finals we couldn’t attach to any bracket slot (name mismatch).
- `finalsNoWinner` — games marked `final` but no winner resolved (should be empty).
- `decidedGames` — every decided game with `id`, teams, `winner`, round index, and points value.

## Local audit script
```bash
npx tsx scripts/audit-scores.ts
```
Prints everyone’s `pointsByRound` and merge health against live ESPN.
