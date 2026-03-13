"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";


function IconBall({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </span>
  );
}

function IconDashboard({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    </span>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    </span>
  );
}

function IconLogOut({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </span>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </span>
  );
}

function IconLogIn({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
    </span>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { isSignedIn, signOut, ready } = useAuth(pathname);

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors sm:px-3 shrink-0 ${
      active ? "text-teal-300 bg-teal-500/10" : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
    }`;

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 overflow-x-auto px-3 py-2 sm:gap-4 sm:px-6 sm:py-2.5 lg:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-0 shrink-0 items-center gap-1">
          <Link
            href="/"
            className={navLinkClass(pathname === "/")}
          >
            <IconBall className="shrink-0 text-teal-400" />
            <span className="hidden sm:inline">Americano</span>
          </Link>
          {ready && isSignedIn && (
            <Link
              href="/americano"
              className={navLinkClass(pathname === "/americano" || pathname?.startsWith("/americano/"))}
            >
              <IconDashboard className="shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}
          <Link
            href="/latest-americanos"
            className={navLinkClass(pathname === "/latest-americanos")}
          >
            <IconList className="shrink-0" />
            <span className="hidden sm:inline">Latest Americanos</span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!ready ? (
            <span className="flex h-9 w-16 items-center rounded-lg bg-slate-800/50 px-2 sm:w-20" aria-hidden />
          ) : isSignedIn ? (
            <>
              <button
                type="button"
                onClick={signOut}
                className={`${navLinkClass(false)} text-slate-300`}
                aria-label="Sign out"
              >
                <IconLogOut className="shrink-0" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
              <Link
                href="/profile"
                className={navLinkClass(pathname === "/profile" || pathname?.startsWith("/profile/"))}
                aria-label="Profile"
              >
                <IconUser className="shrink-0" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className={navLinkClass(false)} aria-label="Sign in">
              <IconLogIn className="shrink-0" />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

