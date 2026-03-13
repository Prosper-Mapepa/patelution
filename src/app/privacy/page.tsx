"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const step = searchParams.get("step") ?? "5";

  const handleBack = () => {
    if (from === "register") {
      router.push(`/auth/register?step=${step}`);
    } else {
      router.back();
    }
  };
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 py-6">
      <section className="glass-panel fade-border px-6 py-6 sm:px-8 sm:py-8">
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Privacy policy
        </h1>
        <p className="mt-2 text-sm text-slate-300 sm:text-base">
          Your privacy matters to us. This page explains in simple terms what
          information Patelution uses and why.
        </p>
      </section>

      <section className="glass-panel fade-border px-6 py-6 text-sm text-slate-300 sm:px-8 sm:py-8 sm:text-base">
        <h2 className="text-base font-semibold text-slate-100 sm:text-lg">
          1. Information you give us
        </h2>
        <p className="mt-2">
          When you register, you provide details such as your name, email
          address, and optional profile information. We use this to create and
          manage your account and to show your name in tournaments you join.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-100 sm:text-lg">
          2. Usage information
        </h2>
        <p className="mt-2">
          We may store basic technical information such as IP address, browser
          type, and logs needed to keep the service secure and reliable.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-100 sm:text-lg">
          3. How we use your data
        </h2>
        <p className="mt-2">
          We use your information to operate Patelution, run tournaments,
          improve the experience, and communicate with you about important
          changes. We do not sell your personal data.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-100 sm:text-lg">
          4. Sharing
        </h2>
        <p className="mt-2">
          We only share data with service providers that help us run Patelution
          (for example, hosting providers). They may only process your data on
          our instructions and must keep it secure.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-100 sm:text-lg">
          5. Your choices
        </h2>
        <p className="mt-2">
          You can update or delete your account information at any time. If you
          have questions or want your data removed, contact us using the details
          provided in the app.
        </p>
        <div className="mt-8 flex justify-start">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-slate-50 sm:px-5 sm:text-sm"
          >
            Back
          </button>
        </div>
      </section>
    </div>
  );
}

