"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Picks, Bracket } from "@/lib/bracket-data";
import { PARTICIPANTS } from "@/lib/participants";
import {
  getTeamOptions,
  cascadeClears,
  loadPicks,
  savePicks,
  clearPicks,
} from "@/lib/picks-storage";

interface GameResult {
  score1: number;
  score2: number;
  winner: string;
  status: string;
  statusLabel?: string;
}

type TeamInfo = { name: string; seed: number } | null;

function buildGameResults(bracket: Bracket): Record<string, GameResult> {
  const out: Record<string, GameResult> = {};
  const process = (g: { id: string; status: string; team1: { name: string }; team2: { name: string }; score1?: number; score2?: number; winner?: 1 | 2; statusLabel?: string }) => {
    if (g.status === "final" || g.status === "in_progress") {
      out[g.id] = {
        score1: g.score1 ?? 0,
        score2: g.score2 ?? 0,
        winner: g.winner === 1 ? g.team1.name : g.team2.name,
        status: g.status,
        statusLabel: g.statusLabel,
      };
    }
  };
  for (const r of bracket.regions)
    for (const round of r.rounds) for (const g of round) process(g);
  for (const g of bracket.finalFour) process(g);
  if (bracket.championship) process(bracket.championship);
  return out;
}

const REGIONS = [
  { key: "s", label: "SOUTH" },
  { key: "e", label: "EAST" },
  { key: "w", label: "WEST" },
  { key: "m", label: "MIDWEST" },
] as const;

const ROUND_LABELS = ["R64", "R32", "Sweet 16", "Elite 8"];
const ROUND_PTS = [1, 2, 4, 8];

function TeamRow({
  team, isPicked, isCorrect, isWrong, isWinner, score, onClick, disabled,
}: {
  team: TeamInfo; isPicked: boolean; isCorrect: boolean; isWrong: boolean;
  isWinner: boolean; score?: number; onClick: () => void; disabled: boolean;
}) {
  if (!team)
    return <div className="flex items-center gap-2 px-2.5 py-1.5 text-white/20 text-xs italic">— pick previous round —</div>;

  const bg = isCorrect ? "bg-emerald-500/15" : isWrong ? "bg-red-500/10" : isPicked ? "bg-blue-500/15" : "hover:bg-white/5";
  const border = isCorrect ? "border-l-emerald-400" : isWrong ? "border-l-red-400" : isPicked ? "border-l-blue-400" : "border-l-transparent";
  const textColor = isWinner ? "text-white font-semibold" : isPicked ? "text-white/90 font-medium" : "text-white/50";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 text-left text-[13px] transition-colors border-l-2 ${bg} ${border} ${disabled && !isPicked ? "opacity-40 cursor-default" : "cursor-pointer"}`}
    >
      <span className="text-white/25 text-[11px] w-4 text-right font-mono">{team.seed}</span>
      <span className={`flex-1 truncate ${textColor}`}>{team.name}</span>
      {score !== undefined && <span className="text-[11px] text-white/30 font-mono tabular-nums">{score}</span>}
      {isCorrect && <span className="text-emerald-400 text-xs">✓</span>}
      {isWrong && <span className="text-red-400 text-xs">✗</span>}
      {!isCorrect && !isWrong && isPicked && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
    </button>
  );
}

function GameCard({ gameId, picks, results, onPick }: {
  gameId: string; picks: Picks; results: Record<string, GameResult>;
  onPick: (gameId: string, team: string) => void;
}) {
  const [team1, team2] = getTeamOptions(gameId, picks);
  const pick = picks[gameId];
  const result = results[gameId];
  const isCompleted = result?.status === "final";
  const isLive = result?.status === "in_progress";

  return (
    <div className="w-[168px] bg-white/[0.03] border border-white/[0.08] rounded-lg overflow-hidden flex-shrink-0">
      <TeamRow team={team1} isPicked={pick === team1?.name}
        isCorrect={isCompleted && pick === team1?.name && result.winner === team1?.name}
        isWrong={isCompleted && pick === team1?.name && result.winner !== team1?.name}
        isWinner={!!isCompleted && result.winner === team1?.name}
        score={result?.score1} onClick={() => team1 && onPick(gameId, team1.name)} disabled={!team1} />
      <div className="border-t border-white/[0.06]" />
      <TeamRow team={team2} isPicked={pick === team2?.name}
        isCorrect={isCompleted && pick === team2?.name && result.winner === team2?.name}
        isWrong={isCompleted && pick === team2?.name && result.winner !== team2?.name}
        isWinner={!!isCompleted && result.winner === team2?.name}
        score={result?.score2} onClick={() => team2 && onPick(gameId, team2.name)} disabled={!team2} />
      {(isCompleted || isLive) && (
        <div className={`text-center text-[10px] py-0.5 border-t border-white/[0.06] ${isLive ? "text-red-400 bg-red-500/5" : "text-white/20"}`}>
          {isLive ? result.statusLabel ?? "LIVE" : "FINAL"}
        </div>
      )}
    </div>
  );
}

function Connector() {
  return (
    <div className="relative w-5 h-full">
      <div className="absolute left-0 right-1/2 top-[25%] h-px bg-white/[0.08]" />
      <div className="absolute left-0 right-1/2 bottom-[25%] h-px bg-white/[0.08]" />
      <div className="absolute left-1/2 top-[25%] bottom-[25%] w-px bg-white/[0.08]" />
      <div className="absolute left-1/2 right-0 top-1/2 h-px bg-white/[0.08]" />
    </div>
  );
}

function RegionBracket({ prefix, picks, results, onPick }: {
  prefix: string; picks: Picks; results: Record<string, GameResult>;
  onPick: (gameId: string, team: string) => void;
}) {
  const r64 = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `${prefix}${n}`);
  const r32 = [9, 10, 11, 12].map((n) => `${prefix}${n}`);
  const s16 = [13, 14].map((n) => `${prefix}${n}`);
  const e8 = `${prefix}15`;
  const ROW_H = 82;

  return (
    <div>
      <div className="grid mb-3" style={{ gridTemplateColumns: "168px 20px 168px 20px 168px 20px 168px" }}>
        {ROUND_LABELS.map((label, i) => (
          <div key={label} className="text-xs text-white/30 font-medium" style={{ gridColumn: i * 2 + 1 }}>
            {label} <span className="text-white/15">({ROUND_PTS[i]}pt{ROUND_PTS[i] > 1 ? "s" : ""})</span>
          </div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "168px 20px 168px 20px 168px 20px 168px", gridTemplateRows: `repeat(8, ${ROW_H}px)` }}>
        {r64.map((gid, i) => (
          <div key={gid} className="flex items-center" style={{ gridRow: i + 1, gridColumn: 1 }}>
            <GameCard gameId={gid} picks={picks} results={results} onPick={onPick} />
          </div>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <div key={`c1-${i}`} className="flex items-stretch" style={{ gridRow: `${i * 2 + 1} / ${i * 2 + 3}`, gridColumn: 2 }}>
            <Connector />
          </div>
        ))}
        {r32.map((gid, i) => (
          <div key={gid} className="flex items-center" style={{ gridRow: `${i * 2 + 1} / ${i * 2 + 3}`, gridColumn: 3 }}>
            <GameCard gameId={gid} picks={picks} results={results} onPick={onPick} />
          </div>
        ))}
        {[0, 1].map((i) => (
          <div key={`c2-${i}`} className="flex items-stretch" style={{ gridRow: `${i * 4 + 1} / ${i * 4 + 5}`, gridColumn: 4 }}>
            <Connector />
          </div>
        ))}
        {s16.map((gid, i) => (
          <div key={gid} className="flex items-center" style={{ gridRow: `${i * 4 + 1} / ${i * 4 + 5}`, gridColumn: 5 }}>
            <GameCard gameId={gid} picks={picks} results={results} onPick={onPick} />
          </div>
        ))}
        <div className="flex items-stretch" style={{ gridRow: "1 / 9", gridColumn: 6 }}><Connector /></div>
        <div className="flex items-center" style={{ gridRow: "1 / 9", gridColumn: 7 }}>
          <GameCard gameId={e8} picks={picks} results={results} onPick={onPick} />
        </div>
      </div>
    </div>
  );
}

function FinalFourBracket({ picks, results, onPick }: {
  picks: Picks; results: Record<string, GameResult>;
  onPick: (gameId: string, team: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="grid" style={{ gridTemplateColumns: "168px 20px 168px 20px 168px" }}>
        <div className="text-xs text-white/30 font-medium" style={{ gridColumn: 1 }}>Final Four <span className="text-white/15">(16pts)</span></div>
        <div className="text-xs text-white/30 font-medium" style={{ gridColumn: 3 }}>Championship <span className="text-white/15">(32pts)</span></div>
        <div className="text-xs text-white/30 font-medium" style={{ gridColumn: 5 }}>Champion</div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "168px 20px 168px 20px 168px", gridTemplateRows: "repeat(2, 68px)" }}>
        <div className="flex items-center" style={{ gridRow: 1, gridColumn: 1 }}>
          <GameCard gameId="ff-east-south" picks={picks} results={results} onPick={onPick} />
        </div>
        <div className="flex items-stretch" style={{ gridRow: "1 / 3", gridColumn: 2 }}><Connector /></div>
        <div className="flex items-center" style={{ gridRow: "1 / 3", gridColumn: 3 }}>
          <GameCard gameId="champ" picks={picks} results={results} onPick={onPick} />
        </div>
        <div className="flex items-center" style={{ gridRow: "1 / 3", gridColumn: 4 }}>
          <div className="w-5 relative h-full"><div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.08]" /></div>
        </div>
        <div className="flex items-center" style={{ gridRow: "1 / 3", gridColumn: 5 }}>
          {picks["champ"] ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-center">
              <div className="text-[10px] text-amber-400/60 uppercase tracking-wider mb-0.5">Champion</div>
              <div className="text-amber-300 font-bold text-sm">{picks["champ"]}</div>
            </div>
          ) : (
            <div className="text-white/15 text-xs italic">Pick all rounds</div>
          )}
        </div>
        <div className="flex items-center" style={{ gridRow: 2, gridColumn: 1 }}>
          <GameCard gameId="ff-west-midwest" picks={picks} results={results} onPick={onPick} />
        </div>
      </div>
    </div>
  );
}

export default function BracketEditor({ bracket }: { bracket: Bracket | null }) {
  const [selectedId, setSelectedId] = useState(PARTICIPANTS[0].id);
  const [activeTab, setActiveTab] = useState<string>("s");
  const [picks, setPicks] = useState<Picks>({});
  const [changeCount, setChangeCount] = useState(0);

  const participant = PARTICIPANTS.find((p) => p.id === selectedId)!;
  const results = useMemo(() => (bracket ? buildGameResults(bracket) : {}), [bracket]);

  useEffect(() => {
    const stored = loadPicks(selectedId);
    const active = stored ?? { ...participant.picks };
    setPicks(active);
    countChanges(active, participant.picks);
  }, [selectedId, participant.picks]);

  function countChanges(current: Picks, base: Picks) {
    let n = 0;
    const allKeys = new Set([...Object.keys(current), ...Object.keys(base)]);
    for (const k of allKeys) if (current[k] !== base[k]) n++;
    setChangeCount(n);
  }

  const handlePick = useCallback((gameId: string, teamName: string) => {
    setPicks((prev) => {
      const updated = { ...prev, [gameId]: teamName };
      const cascaded = cascadeClears(updated, gameId);
      savePicks(selectedId, cascaded);
      countChanges(cascaded, participant.picks);
      return cascaded;
    });
  }, [selectedId, participant.picks]);

  const handleReset = useCallback(() => {
    clearPicks(selectedId);
    setPicks({ ...participant.picks });
    setChangeCount(0);
  }, [selectedId, participant.picks]);

  const handleCopyPicks = useCallback(() => {
    const base = participant.picks;
    const diffs: string[] = [];
    for (const [k, v] of Object.entries(picks)) {
      if (v !== base[k]) diffs.push(`  ${k}: "${base[k]}" → "${v}"`);
    }
    const text = diffs.length ? `${participant.name} pick changes:\n${diffs.join("\n")}` : `${participant.name}: no changes`;
    navigator.clipboard.writeText(text);
  }, [picks, participant]);

  const tabs = [...REGIONS.map((r) => ({ key: r.key, label: r.label })), { key: "ff", label: "FINAL FOUR" }];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {PARTICIPANTS.map((p) => (
          <button key={p.id} onClick={() => setSelectedId(p.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm ${p.id === selectedId ? "bg-blue-500/15 border-blue-500/30 text-white" : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06]"}`}>
            {p.photo && <img src={p.photo} alt={p.name} className="w-6 h-6 rounded-full object-cover" />}
            <span className="font-medium">{p.name}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-6">
        {changeCount > 0 ? (
          <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">
            {changeCount} pick{changeCount > 1 ? "s" : ""} changed
          </span>
        ) : (
          <span className="text-xs text-white/20 px-2.5 py-1">Showing default picks</span>
        )}
        {changeCount > 0 && (
          <>
            <button onClick={handleCopyPicks} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors">Copy Changes</button>
            <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/15 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">Reset</button>
          </>
        )}
      </div>
      <div className="flex gap-1 mb-6 border-b border-white/[0.06] pb-px">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab.key === activeTab ? "bg-white/[0.06] text-white border-b-2 border-blue-400" : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto pb-4">
        {activeTab === "ff" ? (
          <FinalFourBracket picks={picks} results={results} onPick={handlePick} />
        ) : (
          <RegionBracket prefix={activeTab} picks={picks} results={results} onPick={handlePick} />
        )}
      </div>
    </div>
  );
}
