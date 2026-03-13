"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import type { Court, Match, Participant, StandingRow, Tournament } from "@/lib/api";
import {
  apiGetTournament,
  apiGetStandings,
  apiListMatches,
  apiUpdateTournament,
  apiUpdateMatchScore,
  apiUpdateParticipant,
  apiAddParticipant,
  apiDeleteParticipant,
  apiCreateMatch,
} from "@/lib/api";
import { Toast, ToastType } from "@/components/Toast";

type TabKey = "matches" | "standings" | "participants";

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

/**
 * Generate one round of matches using 1-factorization: roundNumber (1-based) picks which
 * unique set of partnerships to use, so the same pair never repeats across rounds.
 */
function generateRoundPairs(
  participants: Participant[],
  courts: Court[],
  roundNumber: number
): { courtId: string; pairA: string; pairB: string }[] {
  const names = participants.map((p) => p.displayName);
  if (names.length < 4 || courts.length < 1 || names.length % 2 !== 0) return [];
  const n = names.length;
  const maxRounds = n - 1;
  if (roundNumber < 1 || roundNumber > maxRounds) return [];

  const r = roundNumber - 1;
  const pairs: [number, number][] = [];
  pairs.push([0, r + 1]);
  for (let i = 1; i < n / 2; i++) {
    const a = (r + i) % (n - 1) + 1;
    const b = (r - i + (n - 1)) % (n - 1) + 1;
    pairs.push([a, b]);
  }

  const courtIds = courts.map((c) => c.id);
  const matches: { courtId: string; pairA: string; pairB: string }[] = [];
  for (let j = 0; j + 1 < pairs.length; j += 2) {
    const [a, b] = pairs[j];
    const [c, d] = pairs[j + 1];
    matches.push({
      courtId: courtIds[(j / 2) % courtIds.length],
      pairA: `${names[a]} / ${names[b]}`,
      pairB: `${names[c]} / ${names[d]}`,
    });
  }
  return matches;
}

export default function AmericanoDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isSignedIn } = useAuth(pathname ?? "");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const id = params?.id as string;
  const [tab, setTab] = useState<TabKey>(
    () => (searchParams.get("tab") === "standings" ? "standings" : "matches")
  );
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editingScores, setEditingScores] = useState<Record<string, { a: number; b: number }>>({});
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});

  const maxScore = tournament?.maxScore ?? 0;

  const loadTournament = useCallback(() => {
    if (!id) return;
    apiGetTournament(id)
      .then((t) => {
        setTournament(t);
        const names: Record<string, string> = {};
        (t.participants ?? []).forEach((p) => {
          names[p.id] = p.displayName;
        });
        setParticipantNames(names);
      })
      .catch(() =>
        setToast({ message: "Failed to load tournament.", type: "error" })
      );
  }, [id]);

  const loadMatches = useCallback(() => {
    if (!id) return;
    apiListMatches(id)
      .then(setMatches)
      .catch(() =>
        setToast({ message: "Failed to load matches.", type: "error" })
      );
  }, [id]);

  const loadStandings = useCallback(() => {
    if (!id) return;
    apiGetStandings(id).then(setStandings).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      apiGetTournament(id),
      apiListMatches(id),
      apiGetStandings(id),
    ])
      .then(([t, m, s]) => {
        setTournament(t);
        setMatches(m);
        setStandings(s);
        const names: Record<string, string> = {};
        (t.participants ?? []).forEach((p) => {
          names[p.id] = p.displayName;
        });
        setParticipantNames(names);
      })
      .catch(() =>
        setToast({ message: "Failed to load tournament.", type: "error" })
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUserId(window.localStorage.getItem("patelution_user_id"));
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      setToast({ message: "Americano created. Add participants and generate rounds.", type: "success" });
    }
  }, [searchParams]);

  const isOwner = Boolean(
    isSignedIn && tournament?.ownerId && currentUserId && tournament.ownerId === currentUserId
  );

  const refreshAll = useCallback(() => {
    loadTournament();
    loadMatches();
    loadStandings();
  }, [loadTournament, loadMatches, loadStandings]);

  const handleStartAmericano = useCallback(() => {
    if (!id) return;
    apiUpdateTournament(id, { status: "in_progress" })
      .then((t) => {
        setTournament(t);
        setToast({ message: "Americano started.", type: "success" });
        refreshAll();
      })
      .catch(() =>
        setToast({ message: "Failed to start Americano.", type: "error" })
      );
  }, [id, refreshAll]);

  const handleFinishAmericano = useCallback(() => {
    if (!id) return;
    apiUpdateTournament(id, { status: "finished" })
      .then((t) => {
        setTournament(t);
        setToast({ message: "Americano finished. Results are ready.", type: "success" });
        refreshAll();
      })
      .catch(() =>
        setToast({ message: "Failed to finish Americano.", type: "error" })
      );
  }, [id, refreshAll]);

  const handleGenerateMoreRounds = useCallback(() => {
    if (!id || !tournament) return;
    const courts = tournament.courts ?? [];
    const participants = tournament.participants ?? [];
    if (participants.length < 4 || courts.length < 1) {
      setToast({
        message: "Add at least 4 participants and 1 court to generate matches.",
        type: "error",
      });
      return;
    }
    const n = participants.length;
    const maxRounds = n - 1;
    const maxRound = matches.length ? Math.max(...matches.map((m) => m.round)) : 0;
    const nextRound = maxRound + 1;
    if (nextRound > maxRounds) {
      setToast({
        message: `All ${maxRounds} rounds are already generated for ${n} players.`,
        type: "success",
      });
      return;
    }
    const newMatches = generateRoundPairs(participants, courts, nextRound);
    if (newMatches.length === 0) {
      setToast({ message: "Not enough participants to generate more matches.", type: "error" });
      return;
    }
    Promise.all(
      newMatches.map((body) =>
        apiCreateMatch(id, { ...body, round: nextRound })
      )
    )
      .then(() => {
        setToast({ message: "Round generated.", type: "success" });
        loadMatches();
        loadTournament();
      })
      .catch(() =>
        setToast({ message: "Failed to generate round.", type: "error" })
      );
  }, [id, tournament, matches, loadMatches, loadTournament]);

  const handleSaveScore = useCallback(
    (matchId: string, scoreA: number, scoreB: number) => {
      apiUpdateMatchScore(matchId, scoreA, scoreB)
        .then(() => {
          setToast({ message: "Score saved.", type: "success" });
          setEditingMatchId(null);
          refreshAll();
        })
        .catch(() =>
          setToast({ message: "Failed to save score.", type: "error" })
        );
    },
    [refreshAll]
  );

  const handleUpdateParticipants = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) return;
      const entries = Object.entries(participantNames);
      if (entries.length === 0) {
        setToast({ message: "No changes to save.", type: "success" });
        return;
      }
      Promise.all(
        entries.map(([participantId, displayName]) =>
          apiUpdateParticipant(participantId, displayName)
        )
      )
        .then(() => {
          setToast({ message: "Participants updated.", type: "success" });
          loadTournament();
          loadMatches();
          loadStandings();
        })
        .catch(() =>
          setToast({ message: "Failed to update participants.", type: "error" })
        );
    },
    [id, participantNames, loadTournament, loadMatches, loadStandings]
  );

  const handleAddParticipant = useCallback(
    (displayName: string) => {
      if (!id || !displayName.trim()) return;
      apiAddParticipant(id, displayName.trim())
        .then(() => {
          setToast({ message: "Participant added.", type: "success" });
          loadTournament();
        })
        .catch(() =>
          setToast({ message: "Failed to add participant.", type: "error" })
        );
    },
    [id, loadTournament]
  );

  const handleDeleteParticipant = useCallback(
    (participantId: string) => {
      apiDeleteParticipant(participantId)
        .then(() => {
          setToast({ message: "Participant removed.", type: "success" });
          loadTournament();
          loadStandings();
          loadMatches();
        })
        .catch(() =>
          setToast({ message: "Failed to remove participant.", type: "error" })
        );
    },
    [loadTournament, loadStandings, loadMatches]
  );

  const courtName = useCallback(
    (courtId: string) => {
      return tournament?.courts?.find((c) => c.id === courtId)?.name ?? "Court";
    },
    [tournament]
  );

  if (loading && !tournament) {
    return (
      <div className="flex flex-1 flex-col gap-5 py-4">
        <div className="glass-panel fade-border px-5 py-8 text-center text-slate-400">
          Loading…
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-1 flex-col gap-5 py-4">
        <div className="glass-panel fade-border px-5 py-8 text-center text-slate-400">
          Tournament not found.
        </div>
        <Link
          href="/americano"
          className="text-sm text-teal-400 hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const participants = tournament.participants ?? [];
  const status = tournament.status ?? "draft";

  return (
    <div className="flex flex-1 flex-col gap-5 py-4">
      <section className="glass-panel fade-border px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium text-slate-400">
            Americano • {tournament.createdAt ? formatDate(tournament.createdAt) : "—"}
          </p>
          {isOwner && (
            <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300">
              Owner
            </span>
          )}
        </div>
        <h1 className="mt-1 text-xl font-semibold text-slate-50 sm:text-2xl">
          {tournament.name}
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">
          {tournament.format} • max {tournament.maxScore} points
        </p>
      </section>

      <section className="glass-panel fade-border flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
        <div className="mb-4 flex gap-2 rounded-full bg-slate-950/80 p-1">
          {(["matches", "standings", "participants"] as TabKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex-1 rounded-full px-3 py-1.5 text-center text-xs font-medium transition ${
                tab === key
                  ? "bg-teal-400 text-slate-950"
                  : "bg-slate-900/70 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {key === "matches"
                ? "Matches"
                : key === "standings"
                  ? "Standings"
                  : `Participants ${participants.length}`}
            </button>
          ))}
        </div>

        {tab === "participants" && (
          isOwner ? (
            <form className="space-y-3 text-sm" onSubmit={handleUpdateParticipants}>
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/80 px-3 py-2"
                >
                  <input
                    className="flex-1 rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-50 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-sm"
                    value={participantNames[p.id] ?? p.displayName}
                    onChange={(e) =>
                      setParticipantNames((prev) => ({
                        ...prev,
                        [p.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteParticipant(p.id)}
                    className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:border-red-400/70 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <AddParticipantForm onAdd={handleAddParticipant} />
              <div className="pt-1">
                <button
                  type="submit"
                  className="accent-pill inline-flex w-full items-center justify-center px-4 py-2 text-xs font-semibold sm:text-sm"
                >
                  Update
                </button>
              </div>
            </form>
          ) : (
            <ul className="space-y-2 text-sm">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-slate-50"
                >
                  {participantNames[p.id] ?? p.displayName}
                </li>
              ))}
            </ul>
          )
        )}

        {tab === "standings" && (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/80 text-xs">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-300">#</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-300">Player</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-300">W</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-300">T</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-300">L</th>
                  <th className="border-l border-slate-700/80 bg-teal-500/10 px-4 py-2 text-center text-sm font-bold uppercase tracking-wide text-teal-300">P</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {standings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                      No standings yet. Add scores in Matches to see results.
                    </td>
                  </tr>
                ) : (
                  standings.map((row, index) => (
                    <tr key={row.name}>
                      <td className="px-3 py-1.5 text-slate-400">{index + 1}</td>
                      <td className="px-3 py-1.5 text-slate-50">{row.name}</td>
                      <td className="px-3 py-1.5 text-center text-slate-300">{row.wins}</td>
                      <td className="px-3 py-1.5 text-center text-slate-300">{row.ties}</td>
                      <td className="px-3 py-1.5 text-center text-slate-300">{row.losses}</td>
                      <td className="border-l border-slate-700/80 bg-teal-500/5 px-4 py-2 text-center  font-bold text-teal-300">
                        {row.points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "matches" && (
          <div className="space-y-5 text-sm">
            {matches.length === 0 && (
              <p className="text-slate-400">
                No matches yet. Add participants, then use &quot;Generate more rounds&quot; to create matches.
              </p>
            )}
            {matches.map((match) => {
              const isEditing = editingMatchId === match.id;
              const [a1, a2] = match.pairA.split("/").map((s) => s.trim());
              const [b1, b2] = match.pairB.split("/").map((s) => s.trim());

              return (
                <div key={match.id} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Round {match.round}
                  </p>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{courtName(match.courtId)}</span>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              setEditingMatchId(null);
                              setEditingScores((prev) => {
                                const next = { ...prev };
                                delete next[match.id];
                                return next;
                              });
                            } else {
                              setEditingMatchId(match.id);
                              setEditingScores((prev) => ({
                                ...prev,
                                [match.id]: { a: match.scoreA, b: match.scoreB },
                              }));
                            }
                          }}
                          className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-200 hover:border-teal-400 hover:text-teal-300"
                        >
                          {isEditing
                            ? "Cancel"
                            : match.scoreA !== 0 || match.scoreB !== 0
                              ? "Edit score"
                              : "Add score"}
                        </button>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm text-slate-50">
                      <span>{match.pairA}</span>
                      <span className="text-xs text-slate-500">vs</span>
                      <span>{match.pairB}</span>
                    </div>

                    {isEditing && (() => {
                      const draft = editingScores[match.id] ?? { a: match.scoreA, b: match.scoreB };
                      const clamp = (n: number) =>
                        maxScore > 0 ? Math.min(maxScore, Math.max(0, n)) : Math.max(0, n);
                      const updateA = (raw: number) => {
                        const a = clamp(raw);
                        setEditingScores((prev) => ({
                          ...prev,
                          [match.id]: {
                            a,
                            b: maxScore > 0 ? maxScore - a : (prev[match.id]?.b ?? 0),
                          },
                        }));
                      };
                      const updateB = (raw: number) => {
                        const b = clamp(raw);
                        setEditingScores((prev) => ({
                          ...prev,
                          [match.id]: {
                            a: maxScore > 0 ? maxScore - b : (prev[match.id]?.a ?? 0),
                            b,
                          },
                        }));
                      };
                      return (
                        <form
                          className="mt-3 space-y-2 text-xs"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveScore(match.id, draft.a, draft.b);
                            setEditingMatchId(null);
                            setEditingScores((prev) => {
                              const next = { ...prev };
                              delete next[match.id];
                              return next;
                            });
                          }}
                        >
                          {maxScore > 0 && (
                            <p className="text-[11px] text-slate-500">
                              Match total: {maxScore} points (other score fills automatically)
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="mb-1 text-[11px] text-slate-400">
                                {a1}
                                {a2 ? ` & ${a2}` : ""} points
                              </p>
                              <input
                                name="a"
                                type="number"
                                min={0}
                                max={maxScore > 0 ? maxScore : undefined}
                                value={draft.a}
                                onChange={(e) => updateA(Number(e.target.value) || 0)}
                                className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-50 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
                              />
                            </div>
                            <div>
                              <p className="mb-1 text-[11px] text-slate-400">
                                {b1}
                                {b2 ? ` & ${b2}` : ""} points
                              </p>
                              <input
                                name="b"
                                type="number"
                                min={0}
                                max={maxScore > 0 ? maxScore : undefined}
                                value={draft.b}
                                onChange={(e) => updateB(Number(e.target.value) || 0)}
                                className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-50 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40"
                              />
                            </div>
                          </div>
                          <div className="pt-1">
                            <button
                              type="submit"
                              className="accent-pill inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold"
                            >
                              Save score
                            </button>
                          </div>
                        </form>
                      );
                    })()}

                    {!isEditing && (match.scoreA > 0 || match.scoreB > 0) && (
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200">
                        <span>
                          {match.pairA}:{" "}
                          <span className="font-semibold text-teal-300">{match.scoreA}</span>
                        </span>
                        <span>
                          {match.pairB}:{" "}
                          <span className="font-semibold text-teal-300">{match.scoreB}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isOwner && (
            <div className="mt-4 space-y-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-xs text-slate-300 sm:text-sm">
              {status === "draft" && (
                <>
                  <p className="font-semibold text-slate-100">Ready to start your Americano?</p>
                  <p className="text-slate-400">
                    Add participants, then generate rounds. When you&apos;re ready, start and add scores.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartAmericano}
                    className="accent-pill mt-2 inline-flex items-center justify-center px-5 py-2 text-sm font-semibold"
                  >
                    Start Americano
                  </button>
                </>
              )}

              {(status === "in_progress" || status === "draft") && (
                <>
                  <p className="font-semibold text-slate-100">Need more rounds or ready to finish?</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleGenerateMoreRounds}
                      className="rounded-full border border-teal-400/70 px-4 py-2 text-xs font-semibold text-teal-300 hover:border-teal-300 hover:text-teal-200 sm:text-sm"
                    >
                      Generate more rounds
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishAmericano}
                      className="accent-pill inline-flex flex-1 items-center justify-center px-4 py-2 text-xs font-semibold sm:text-sm"
                    >
                      Finish Americano
                    </button>
                  </div>
                </>
              )}

              {status === "finished" && (
                <>
                  <p className="font-semibold text-slate-100">Americano finished. Standings are ready.</p>
                  <p className="text-slate-400">
                    View final results in the Standings tab.
                  </p>
                </>
              )}
            </div>
            )}
          </div>
        )}
      </section>

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

function AddParticipantForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/50 px-3 py-2">
      <input
        className="flex-1 rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-50 placeholder-slate-500 outline-none transition focus:border-teal-400 sm:text-sm"
        placeholder="New participant name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          if (name.trim()) {
            onAdd(name);
            setName("");
          }
        }}
        className="accent-pill inline-flex px-3 py-1.5 text-xs font-semibold"
      >
        Add
      </button>
    </div>
  );
}
