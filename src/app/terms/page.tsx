"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function TermsPage() {
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
          Terms of service
        </h1>
        <p className="mt-2 text-sm text-slate-300 sm:text-base">
          These Terms of service (&quot;Terms&quot;) apply to your use of Patelution.
          By creating an account or using the site you agree to these Terms.
        </p>
      </section>
      <section className="glass-panel fade-border px-6 py-6 text-sm text-slate-300 sm:px-8 sm:py-8 sm:text-base">
        <h2 className="text-base font-semibold text-slate-100 sm:text-lg">
          1. Use of Patelution
        </h2>
        <p className="mt-2">
          You may use Patelution to organize and follow padel events as long as
          you comply with the law and do not abuse, disrupt, or attempt to
          damage the service or other users.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-100 sm:text-lg">
          2. Accounts
        </h2>
        <p className="mt-2">
          You are responsible for keeping your login details secure and for all
          activity that happens under your account. Let us know if you suspect
          any unauthorised use.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-100 sm:text-lg">
          3. Content and results
        </h2>
        <p className="mt-2">
          You are responsible for the information you enter into Patelution. We
          may show anonymised or aggregated statistics to improve the product.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-100 sm:text-lg">
          4. Service changes
        </h2>
        <p className="mt-2">
          Patelution is provided &quot;as is&quot; without any guarantees. We may
          change, limit, or discontinue parts of the service at any time.
        </p>

        <h2 className="mt-6 text-base font-semibold text-slate-100 sm:text-lg">
          5. Contact
        </h2>
        <p className="mt-2">
          If you have questions about these Terms, please contact us using the
          details provided in the app.
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

