export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col gap-6 py-5">
      <section className="glass-panel fade-border px-6 py-6 sm:px-7 sm:py-7">
        <p className="pill mb-3 inline-flex items-center gap-2 bg-slate-900/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300">
          Your Patelution profile
        </p>
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Sign in, then make it yours.
        </h1>
        <p className="mt-2 text-sm text-slate-300 sm:text-base">
          In the next step we will connect this experience to a backend with
          secure accounts, onboarding and player stats. For now, this page is a
          preview of the onboarding journey.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="glass-panel fade-border px-6 py-5 text-sm sm:text-base">
          <h2 className="text-base font-semibold text-slate-50">
            Onboarding flow
          </h2>
          <ul className="mt-3 space-y-1 text-xs text-slate-300 sm:text-sm">
            <li>• Name and email</li>
            <li>• Strong password and security tips</li>
            <li>• Birthdate and nationality</li>
            <li>• Phone number and default location</li>
            <li>• Preferred court side and stronger hand</li>
          </ul>
        </article>

        <article className="glass-panel fade-border px-6 py-5 text-sm sm:text-base">
          <h2 className="text-base font-semibold text-slate-50">
            Coming player features
          </h2>
          <ul className="mt-3 space-y-1 text-xs text-slate-300 sm:text-sm">
            <li>• Personal match history across events</li>
            <li>• Patelution rating with progression over time</li>
            <li>• Favourite clubs and usual playing partners</li>
            <li>• Shareable public profile with privacy controls</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

