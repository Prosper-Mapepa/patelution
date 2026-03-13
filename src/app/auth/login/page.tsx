"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiLogin } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:text-sm">
          Welcome back
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">
          Log in to Patelution
        </h1>
        
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setLoading(true);
          try {
            await apiLogin({ email, password });
            router.push("/americano");
          } catch (err) {
            setError("Could not log in. Please check your details.");
            // eslint-disable-next-line no-console
            console.error(err);
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <label className="block text-sm font-medium text-slate-300 sm:text-sm">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 sm:text-sm">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/40 sm:text-base"
            placeholder="••••••••"
          />
          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            At least 8 characters, with upper‑ and lowercase letters, a number
            and a symbol.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="accent-pill mt-3 inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold sm:text-base disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-sm text-slate-400 sm:text-sm">
        {error && <span className="mb-2 block text-[11px] text-red-400">{error}</span>}
        New to Patelution?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-teal-300 hover:text-teal-200"
        >
          Create an account
        </Link>
        .
      </p>
    </div>
  );
}

