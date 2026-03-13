"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error";

export function Toast({
  message,
  type,
  onDismiss,
  duration = 4000,
}: {
  message: string;
  type: ToastType;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div
      role="alert"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
        type === "success"
          ? "border-emerald-500/50 bg-emerald-950/95 text-emerald-100"
          : "border-red-500/50 bg-red-950/95 text-red-100"
      }`}
    >
      {message}
    </div>
  );
}
