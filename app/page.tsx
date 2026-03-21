"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import LiveGames from "@/components/LiveGames";
import MatchImportance from "@/components/MatchImportance";
import type { ParticipantScore, PoolLeverageGame } from "@/lib/scoring";
import type { EspnGame } from "@/lib/espn";

interface DashboardData {
  scores: ParticipantScore[];
  poolLeverage: (PoolLeverageGame & { winProbTeam1: number; winProbTeam2: number })[];
  liveGames: EspnGame[];
  updatedAt: string;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const overrides: Record<string, Record<string, string>> = {};
      if (typeof window !== "undefined") {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith("bracket-picks-")) {
            const id = key.replace("bracket-picks-", "");
            try { overrides[id] = JSON.parse(localStorage.getItem(key) || "{}"); } catch { /* skip */ }
          }
        }
      }
      const hasOverrides = Object.keys(overrides).length > 0;
      const res = hasOverrides
        ? await fetch("/api/bracket", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ overrides }) })
        : await fetch("/api/bracket", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏀</span>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                March Madness 2026
              </h1>
              <p className="text-white/30 text-sm">Live bracket tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && <span className="text-xs text-white/20">Updated {lastUpdate}</span>}
            <Link href="/edit" className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              Edit Picks
            </Link>
            <button onClick={fetchData} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              ↻ Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
              <span className="text-white/40">Loading bracket data…</span>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Leaderboard scores={data.scores} />
              </div>
              <div className="lg:col-span-2 space-y-8">
                <LiveGames games={data.liveGames} />
                <MatchImportance games={data.poolLeverage} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
