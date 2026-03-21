"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BracketEditor from "@/components/BracketEditor";
import type { Bracket } from "@/lib/bracket-data";

export default function EditPage() {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bracket", { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => setBracket(data.bracket))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-white/30 hover:text-white/60 transition-colors text-sm">← Dashboard</Link>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl">📋</span>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">Edit Bracket Picks</h1>
              <p className="text-white/30 text-sm">Select a person, click teams to set picks. Changes save automatically.</p>
            </div>
          </div>
        </header>
        {error && <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">Error: {error}</div>}
        {!bracket && !error && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
              <span className="text-white/40">Loading bracket…</span>
            </div>
          </div>
        )}
        <BracketEditor bracket={bracket} />
      </div>
    </div>
  );
}
