# Scoring vs Yahoo (and other pools)

## What we match
- **1 / 2 / 4 / 8 / 16 / 32** points per round (Round of 64 → Championship), same as [Yahoo’s default Bracket Mayhem scoring](https://help.yahoo.com/kb/SLN6654.html). Commissioners can add **upset bonuses** or **seed-difference multipliers** — we do **not** model those unless you extend `lib/scoring.ts`.
- Winners come from **ESPN** after merging into our bracket tree.
- **`currentPoints` vs your Yahoo group row:** We align **total points** to the group leaderboard when picks in `lib/participants.ts` match what Yahoo used for **scoring**. Yahoo’s **“X of 63 picks correct”** can disagree with that same snapshot (e.g. **e2** Ohio St vs TCU): wrong for points but counted differently in their correct-pick tally.
- **Round-of-64 / Round-of-32 columns on Yahoo** sometimes **split differently** from our `getRoundIndex()` buckets even when **totals match** (same 1+2+… weights, same decided games).

## Known reasons totals can differ from Yahoo
1. **Picks in `lib/participants.ts` must match what was entered on Yahoo** for the metric you care about (leaderboard **points** vs **pick accuracy**). Example fixes for Mar 2026 group totals: **Zach** — **`e2: "Ohio St"`**, **`s11: "Illinois"`**; **Reid** — **`e2: "Ohio St"`**; **Adam** — **`w3: "Wisconsin"`** (not High Point); **Jacob** — **`e2: "Ohio St"`**; **Harrison** — **`s10: "Vanderbilt"`**, **`w3: "High Point"`** vs Steven’s Nebraska / Wisconsin path.
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
