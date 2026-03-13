"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export function StartAmericanoCTA() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth(pathname);

  return (
    <Link
      href={isSignedIn ? "/americano/new" : "/auth/register"}
      className="accent-pill inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-500/40 transition hover:brightness-110 sm:text-base"
    >
      Start new Americano
      <span aria-hidden="true">→</span>
    </Link>
  );
}
