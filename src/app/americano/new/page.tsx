"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Court } from "@/lib/api";
import {
  apiCreateTournament,
  apiAddParticipant,
  apiCreateMatch,
} from "@/lib/api";

type FormatId = "americano" | "team-americano" | "mexicano" | "team-mexicano";

const FORMAT_CONFIG: Record<
  FormatId,
  { label: string; description: string; minPlayers: number; maxPlayers: number; step: number }
> = {
  americano: {
    label: "Americano",
    description: "Everyone plays with everyone once.",
    minPlayers: 6,
    maxPlayers: 24,
    step: 2,
  },
  "team-americano": {
    label: "Team Americano",
    description: "You play with the same pair against other pairs.",
    minPlayers: 8,
    maxPlayers: 40,
    step: 4,
  },
  mexicano: {
    label: "Mexicano",
    description:
      "The best players play against each other and the weakest with the weakest.",
    minPlayers: 6,
    maxPlayers: 40,
    step: 2,
  },
  "team-mexicano": {
    label: "Team Mexicano",
    description:
      "The best pairs play against each other and the weaker pairs against the weaker ones.",
    minPlayers: 8,
    maxPlayers: 40,
    step: 4,
  },
};

function clampPlayersForFormat(format: FormatId, players: number) {
  const config = FORMAT_CONFIG[format];
  let next = Math.round(players / config.step) * config.step;
  if (next < config.minPlayers) next = config.minPlayers;
  if (next > config.maxPlayers) next = config.maxPlayers;
  return next;
}

function recommendCourts(players: number) {
  // Simple heuristic: roughly one court per 8 players, at least 1, at most 6.
  return Math.min(6, Math.max(1, Math.round(players / 8)));
}

type MatchSpec = { round: number; courtId: string; pairA: string; pairB: string };

/**
 * 1-factorization of K_n: each partnership (i,j) appears in exactly one round.
 * For n even we get n-1 rounds; each round has n/2 disjoint pairs (every player in exactly one pair).
 */
function generateAllRounds(
  names: string[],
  courts: Court[]
): MatchSpec[] {
  if (names.length < 4 || courts.length < 1 || names.length % 2 !== 0) return [];
  const n = names.length;
  const numRounds = n - 1;
  const matches: MatchSpec[] = [];
  const courtIds = courts.map((c) => c.id);

  for (let r = 0; r < numRounds; r++) {
    const round = r + 1;
    const pairs: [number, number][] = [];
    pairs.push([0, r + 1]);
    for (let i = 1; i < n / 2; i++) {
      const a = (r + i) % (n - 1) + 1;
      const b = (r - i + (n - 1)) % (n - 1) + 1;
      pairs.push([a, b]);
    }
    let courtIndex = 0;
    for (let j = 0; j + 1 < pairs.length; j += 2) {
      const [a, b] = pairs[j];
      const [c, d] = pairs[j + 1];
      matches.push({
        round,
        courtId: courtIds[courtIndex % courtIds.length],
        pairA: `${names[a]} / ${names[b]}`,
        pairB: `${names[c]} / ${names[d]}`,
      });
      courtIndex += 1;
    }
  }
  return matches;
}

export default function NewAmericanoPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [format, setFormat] = useState<FormatId>("americano");
  const [players, setPlayers] = useState(8);
  const [courts, setCourts] = useState(2);
  const [autoCourts, setAutoCourts] = useState(true);
  const [maxScore, setMaxScore] = useState(32);
  const [courtNames, setCourtNames] = useState<string[]>(["Court 1", "Court 2"]);
  const [name, setName] = useState("");
  const [playerNames, setPlayerNames] = useState<string[]>(() =>
    Array.from({ length: 8 }, (_, i) => "")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adjustedPlayers = clampPlayersForFormat(format, players);
    setPlayers(adjustedPlayers);
    setCourts((current) => {
      const suggested = recommendCourts(adjustedPlayers);
      return autoCourts ? suggested : current;
    });
  }, [format]);

  useEffect(() => {
    setCourtNames((current) => {
      const next = [...current];
      if (next.length < courts) {
        for (let i = next.length; i < courts; i += 1) {
          next.push(`Court ${i + 1}`);
        }
      }
      return next.slice(0, courts);
    });
  }, [courts]);

  // Keep player names array length in sync with number of players
  useEffect(() => {
    setPlayerNames((current) => {
      if (current.length === players) return current;
      if (current.length < players) {
        return [
          ...current,
          ...Array.from({ length: players - current.length }, () => ""),
        ];
      }
      return current.slice(0, players);
    });
  }, [players]);

  return (
    <div className="flex flex-1 flex-col gap-6 py-5">
      <section className="glass-panel fade-border px-6 py-6 sm:px-7 sm:py-7">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:text-sm">
          {step} / 3
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">
          {step === 1
            ? "Select type"
            : step === 2
              ? "New Americano"
              : "Player details"}
        </h1>
        <p className="mt-1 text-sm text-slate-300 sm:text-base">
          {step === 1
            ? "Choose the Americano format that best fits your event."
            : step === 2
              ? "Set the basic information for your tournament. Add player names in the next step."
              : "Enter each player's name. The number of fields matches the number of players you set."}
        </p>
      </section>

      <form
        className="glass-panel fade-border flex flex-1 flex-col gap-6 px-6 py-6 sm:px-7 sm:py-7"
        onSubmit={async (event) => {
          event.preventDefault();
          if (step === 1) {
            setStep(2);
            return;
          }
          if (step === 2) {
            setStep(3);
            return;
          }
          // Step 3: create tournament, add participants, generate rounds
          setError(null);
          setLoading(true);
          try {
            const tournament = await apiCreateTournament({
              name: name || "Untitled Americano",
              format,
              maxScore,
              courtNames: courtNames.slice(0, courts),
            });
            const tournamentId = tournament?.id;
            if (!tournamentId) {
              router.push("/americano");
              return;
            }
            const courtsList = tournament.courts ?? [];
            const displayNames = playerNames.slice(0, players).map((n, i) =>
              (n && n.trim()) ? n.trim() : `Player ${i + 1}`
            );
            for (const displayName of displayNames) {
              await apiAddParticipant(tournamentId, displayName);
            }
            if (displayNames.length >= 4 && courtsList.length >= 1) {
              const allMatches = generateAllRounds(displayNames, courtsList);
              for (const m of allMatches) {
                await apiCreateMatch(tournamentId, {
                  courtId: m.courtId,
                  round: m.round,
                  pairA: m.pairA,
                  pairB: m.pairB,
                });
              }
            }
            router.push(`/americano/${tournamentId}?created=1`);
          } catch (err) {
            setError("Could not create Americano. Please try again.");
            // eslint-disable-next-line no-console
            console.error(err);
          } finally {
            setLoading(false);
          }
        }}
      >
        {step === 1 ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                Object.keys(FORMAT_CONFIG) as FormatId[]
              ).map((id) => {
                const config = FORMAT_CONFIG[id];
                const active = id === format;

                return (
                  <button
                    key={id}
                    type="submit"
                    onClick={() => setFormat(id)}
                    className={`flex flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? "border-teal-400/80 bg-slate-900/90 text-slate-50 shadow-[0_18px_45px_rgba(45,212,191,0.45)]"
                        : "border-slate-700/80 bg-slate-950/80 text-slate-200 hover:border-teal-400/60 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-semibold">{config.label}</span>
                      {id === "americano" && (
                        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{config.description}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 sm:text-xs">
              Player ranges and match distribution adjust automatically based on the
              format you choose.
            </p>
          </div>
        ) : step === 2 ? (
          <>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                  Tournament name
                </label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base"
                  placeholder="Warzone Padel Friday Americano"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 sm:text-sm">
                  <label className="font-medium">Number of players</label>
                  <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] sm:text-xs">
                    {players} players
                  </span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={40}
                  step={1}
                  value={players}
                  onChange={(event) => {
                    const raw = Number(event.target.value);
                    const adjusted = clampPlayersForFormat(format, raw);
                    setPlayers(adjusted);
                    if (autoCourts) {
                      setCourts(recommendCourts(adjusted));
                    }
                  }}
                  className="mt-2 w-full accent-teal-400"
                />
                <div className="mt-1 flex justify-between text-[11px] text-slate-500 sm:text-xs">
                  <span>6</span>
                  <span>20</span>
                  <span>40</span>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div>
                  <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                    Number of courts
                  </label>
                  <div className="mt-2 inline-flex rounded-full border border-slate-700 bg-slate-950/70 p-1 text-xs sm:text-sm">
                    {[1, 2, 3, 4, 5, 6].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setCourts(value);
                          setAutoCourts(false);
                        }}
                        className={`min-w-[2.25rem] rounded-full px-2 py-1 font-medium transition ${
                          courts === value
                            ? "bg-teal-400 text-slate-950"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 space-y-2">
                    {Array.from({ length: courts }).map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          Court {index + 1}
                        </span>
                        <input
                          className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-sm"
                          value={courtNames[index] ?? `Court ${index + 1}`}
                          onChange={(event) => {
                            const next = [...courtNames];
                            next[index] = event.target.value;
                            setCourtNames(next);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 sm:text-sm">
                    Max score
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={2}
                    value={maxScore}
                    onChange={(event) => setMaxScore(Number(event.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base"
                  />
                  <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                    Enter 0 for no score limit.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
              <div>
                <p className="font-semibold text-slate-200 sm:text-base">
                  Americano overview
                </p>
                <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                  Next step: add each player&apos;s name, then we&apos;ll create the tournament and generate the first round.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-slate-50 sm:px-5 sm:text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="accent-pill inline-flex items-center justify-center px-7 py-2.5 text-sm font-semibold sm:text-base"
                >
                  Continue to player details
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <p className="text-xs text-slate-400 sm:text-sm">
                Enter a name for each of the {players} players. Leave blank to use &quot;Player 1&quot;, &quot;Player 2&quot;, etc.
              </p>
              <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                {playerNames.slice(0, players).map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/80 px-3 py-2"
                  >
                    <span className="w-20 shrink-0 text-xs font-medium text-slate-400 sm:text-sm">
                      Player {index + 1}
                    </span>
                    <input
                      className="flex-1 rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base"
                      placeholder={`Player ${index + 1}`}
                      value={value}
                      onChange={(event) => {
                        const next = [...playerNames];
                        next[index] = event.target.value;
                        setPlayerNames(next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
              <div>
                {error && (
                  <p className="text-[11px] text-red-400 sm:text-xs">{error}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-slate-50 sm:px-5 sm:text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="accent-pill inline-flex items-center justify-center px-7 py-2.5 text-sm font-semibold disabled:opacity-60 sm:text-base"
                >
                  {loading ? "Creating & generating rounds…" : "Create & generate rounds"}
                </button>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

