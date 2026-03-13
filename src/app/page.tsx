import { StartAmericanoCTA } from "@/components/StartAmericanoCTA";
import { LiveSnapshot } from "@/components/LiveSnapshot";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-8 py-6">
      <section className="glass-panel fade-border relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12">
        <div className="absolute -left-40 -top-40 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" />
        <div className="absolute -right-32 top-0 h-48 w-48 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-5">
            <p className="pill inline-flex items-center gap-2 bg-slate-900/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              The Padel Platform
            </p>
            <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
              Patelution makes{" "}
              <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Americano
              </span>{" "}
              tournaments effortless and exciting.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Create beautiful tournaments in seconds, let Patelution schedule
              every match, and track real‑time standings without a single
              spreadsheet or WhatsApp message.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <StartAmericanoCTA />
              <a
                href="#how-it-works"
                className="pill inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-slate-200 hover:text-white sm:text-sm"
              >
                How Patelution works
              </a>
            </div>
          </div>
          <LiveSnapshot />
        </div>
      </section>

      <section
        id="how-it-works"
        className="glass-panel fade-border px-6 py-8 sm:px-10 sm:py-12 lg:px-16"
      >
        <div className="mb-8 border-b border-slate-800/60 pb-6">
          <h2 className="text-lg font-semibold uppercase tracking-wider text-slate-300 sm:text-xl">
            Introduction
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            The idea of Americano is that every participant plays with all the other
            participants. You gather points for yourself by winning individual points
            during matches.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-slate-100 sm:text-lg">
              How to play Americano
            </h3>
            <div className="space-y-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              <p>
                A match lasts for a predefined number of points, e.g. 32 points. Each point
                won gives you and your partner a point. When the match is completed (32
                points have been played), the result is entered into Patelution&apos;s
                Americano software. A result of 20–12 will give 20 points to the winners of
                the match and 12 points to the losers of the match. The fun in Americano is
                that every point matters.
              </p>
              <p>
                After this, players will switch courts according to the schedule provided
                by Patelution, and play another match of 32 points. After the second match,
                the points from the second match will be added to the points from the first
                match, and so on — until all matches have been played and you have final
                standings and a winner of the tournament.
              </p>
            </div>
          </div>

          <aside className="lg:pt-0">
            <div className="sticky top-24 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl shadow-black/20 ring-1 ring-slate-700/50">
              <h3 className="text-base font-semibold text-slate-100 sm:text-lg">
                Why Patelution?
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300 sm:text-base">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                  <span>Simple and intuitive Americano game management</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                  <span>Automatic match scheduling and point tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                  <span>No more spreadsheets or chat groups — everything in one place</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
