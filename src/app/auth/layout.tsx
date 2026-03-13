import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="glass-panel fade-border w-full max-w-lg px-6 py-7 sm:px-8 sm:py-9">
        {children}
      </div>
    </div>
  );
}

