"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiListTournamentsPublic, Tournament } from "@/lib/api";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Draft";
    case "in_progress":
      return "In progress";
    case "finished":
      return "Finished";
    default:
      return status;
  }
}

function statusColor(status: string) {
  switch (status) {
    case "draft":
      return "bg-slate-600/80 text-slate-200";
    case "in_progress":
      return "bg-teal-600/80 text-teal-100";
    case "finished":
      return "bg-emerald-600/80 text-emerald-100";
    default:
      return "bg-slate-600/80 text-slate-200";
  }
}

export default function LatestAmericanosPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    apiListTournamentsPublic()
      .then(setTournaments)
      .catch(() => setError("Unable to load Americanos."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-1 flex-col gap-6 py-5">
      <section className="glass-panel fade-border px-6 py-6 sm:px-7 sm:py-7">
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Latest Americanos
        </h1>
        <p className="mt-2 text-sm text-slate-300 sm:text-base">
          Recent Americano tournaments. View results and standings — no sign-in required.
        </p>
      </section>

      <section className="glass-panel fade-border px-6 py-6 sm:px-7 sm:py-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold uppercase tracking-wide text-slate-300">
            All recent Americanos
          </h2>
          <span className="rounded-full bg-slate-900/80 px-3 py-0.5 text-[11px] font-medium text-slate-300">
            {loading ? "Loading…" : `${tournaments.length} tournaments`}
          </span>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-400">Loading…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm sm:text-base">
            {tournaments.map((event) => {
              const participantCount = event.participants?.length ?? 0;
              return (
                <li
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 transition hover:border-teal-400/70 hover:bg-slate-900/80"
                >
                  <Link
                    href={`/americano/${event.id}${event.status === "finished" ? "?tab=standings" : ""}`}
                    className="min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-50 sm:text-base">
                        {event.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor(event.status)}`}
                      >
                        {statusLabel(event.status)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {event.format} • max {event.maxScore} pts
                      {participantCount > 0 && ` • ${participantCount} players`}
                      {event.createdAt && ` • ${formatDate(event.createdAt)}`}
                    </p>
                  </Link>
                  <Link
                    href={`/americano/${event.id}${event.status === "finished" ? "?tab=standings" : ""}`}
                    className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-200 hover:border-teal-400 hover:text-teal-300"
                  >
                    {event.status === "finished" ? "View results" : "View"}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !error && tournaments.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            No Americanos yet.
          </p>
        )}
      </section>
    </div>
  );
}
