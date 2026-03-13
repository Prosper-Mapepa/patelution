"use client";

import { useEffect, useState } from "react";
import {
  apiGetTournament,
  apiListTournaments,
  Match,
  Tournament,
} from "@/lib/api";

type SnapshotState = {
  loading: boolean;
  tournament?: Tournament;
  match?: Match;
  totalMatches: number;
  completedMatches: number;
};

export function LiveSnapshot() {
  const [state, setState] = useState<SnapshotState>({
    loading: true,
    totalMatches: 0,
    completedMatches: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const tournaments = await apiListTournaments();
        if (cancelled || tournaments.length === 0) {
          if (!cancelled) {
            setState((prev) => ({ ...prev, loading: false }));
          }
          return;
        }

        const inProgress = tournaments
          .filter((t) => t.status === "in_progress")
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          );

        const latest =
          inProgress[0] ??
          [...tournaments].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          )[0];

        const detailed = await apiGetTournament(latest.id);
        if (cancelled) return;

        const matches = detailed.matches ?? [];
        const totalMatches = matches.length;
        const maxScore = detailed.maxScore ?? 0;
        const completedMatches = matches.filter(
          (m) => m.scoreA !== 0 || m.scoreB !== 0,
        ).length;

        const isFinished = (m: Match) =>
          maxScore > 0 && m.scoreA + m.scoreB >= maxScore;
        const isInProgress = (m: Match) =>
          (m.scoreA > 0 || m.scoreB > 0) && !isFinished(m);

        const inProgressMatches = matches.filter(isInProgress);
        const match: Match | undefined = inProgressMatches.length > 0
          ? inProgressMatches.sort((a, b) => a.round - b.round || (a.scoreA + a.scoreB) - (b.scoreA + b.scoreB))[0]
          : undefined;

        setState({
          loading: false,
          tournament: detailed,
          match,
          totalMatches,
          completedMatches,
        });
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { loading, tournament, match, totalMatches, completedMatches } = state;

  const playersCount = tournament?.participants?.length ?? 0;
  const label =
    tournament?.status === "in_progress"
      ? "Live now"
      : tournament
        ? "Courtside ready"
        : "No live Americano";

  const title =
    tournament?.name && tournament.name !== "Untitled Americano"
      ? tournament.name
      : "Tonight's Americano";

  if (!match) {
    return (
      <div className="mt-8 w-full max-w-md shrink-0 rounded-3xl border border-sky-500/40 bg-slate-950/90 p-5 shadow-[0_25px_80px_rgba(8,47,73,0.9)] ring-1 ring-sky-400/30 sm:mt-10 lg:mt-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 sm:text-sm">
          Live snapshot
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {loading ? "Loading…" : "No live match in progress."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-md shrink-0 space-y-4 rounded-3xl border border-sky-500/40 bg-slate-950/90 p-5 shadow-[0_25px_80px_rgba(8,47,73,0.9)] ring-1 ring-sky-400/30 sm:mt-10 lg:mt-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 sm:text-sm">
          Live snapshot
        </p>
        <span className="rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-medium text-sky-300">
          {label}
        </span>
      </div>

      <div className="mt-2 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-400 sm:text-xs">
              Current Americano
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-50 sm:text-base">
              {title}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
              {match.pairA} vs {match.pairB}
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Round
            </p>
            <p className="text-sm font-semibold text-teal-300">
              {match.round}
            </p>
            <p className="text-[11px] text-slate-400">
              {completedMatches} / {totalMatches} matches
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className="rounded-2xl bg-slate-900/90 p-3.5">
          <p className="text-slate-400">Players</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">
            {playersCount}
          </p>
          <p className="mt-0.5 text-[11px] text-teal-300 sm:text-xs">
            In this Americano
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900/90 p-3.5">
          <p className="text-slate-400">Total matches</p>
          <p className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">
            {totalMatches}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-300 sm:text-xs">
            {completedMatches} played so far
          </p>
        </div>
      </div>
    </div>
  );
}

