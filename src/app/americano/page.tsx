"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  apiDeleteTournament,
  apiListTournaments,
  Tournament,
} from "@/lib/api";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Toast, ToastType } from "@/components/Toast";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
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

export default function AmericanoPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [deleting, setDeleting] = useState<Tournament | null>(null);

  const load = useCallback(() => {
    apiListTournaments()
      .then(setTournaments)
      .catch(() => setToast({ message: "Failed to load Americanos.", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleteClick = useCallback((e: React.MouseEvent, t: Tournament) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(t);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleting) return;
    const t = deleting;
    setDeleting(null);
    apiDeleteTournament(t.id)
      .then(() => {
        setToast({ message: "Americano deleted.", type: "success" });
        setTournaments((prev) => prev.filter((x) => x.id !== t.id));
        load();
      })
      .catch(() => {
        setToast({ message: "Failed to delete Americano.", type: "error" });
      });
  }, [deleting, load]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleting(null);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 py-5">
      <section className="glass-panel fade-border px-6 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
              Americano dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              All your Americanos and results in one place.
            </p>
          </div>
          <Link
            href="/americano/new"
            className="accent-pill inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold sm:text-base"
          >
            Create new Americano
          </Link>
        </div>
      </section>

      <section className="glass-panel fade-border px-6 py-6 sm:px-7 sm:py-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold uppercase tracking-wide text-slate-300">
            All Americanos
          </h2>
          <span className="rounded-full bg-slate-900/80 px-3 py-0.5 text-[11px] font-medium text-slate-300">
            {loading ? "Loading…" : `${tournaments.length} tournaments`}
          </span>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-400">Loading from backend…</p>
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
                    href={`/americano/${event.id}`}
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
                  <div className="flex items-center gap-2">
                    <Link
                      href={
                        event.status === "finished"
                          ? `/americano/${event.id}?tab=standings`
                          : `/americano/${event.id}`
                      }
                      className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-200 hover:border-teal-400 hover:text-teal-300"
                    >
                      {event.status === "finished" ? "View results" : "Open"}
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, event)}
                      className="rounded-full border border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-400 hover:border-red-400/70 hover:text-red-300"
                      aria-label={`Delete ${event.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && tournaments.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            No Americanos yet. Create your first one above.
          </p>
        )}
      </section>

      <ConfirmDialog
        open={!!deleting}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Americano?"
        message={
          deleting
            ? `Delete "${deleting.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
