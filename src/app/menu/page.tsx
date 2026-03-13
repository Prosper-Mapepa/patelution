export default function MenuPage() {
  return (
    <div className="flex flex-1 flex-col gap-5 py-4">
      <section className="glass-panel fade-border px-5 py-5 sm:px-6 sm:py-6">
        <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
          Coming soon to Patelution
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          These features mirror and extend the mobile app experience. We will
          wire them up to the backend as the next step.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Pages",
            description:
              "Public pages for your club, events and Americano nights.",
          },
          {
            title: "Events",
            description:
              "Multi‑day and recurring padel events with RSVP and waitlists.",
          },
          {
            title: "Leagues",
            description:
              "Seasonal box leagues, ladders and divisions with automatic promotion / relegation.",
          },
          {
            title: "News",
            description:
              "Highlight match reports, photos and announcements to your community.",
          },
          {
            title: "Patelution Ratings",
            description:
              "Cross‑event player rating with confidence intervals and trend lines.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="glass-panel fade-border flex flex-col justify-between px-5 py-4 text-sm"
          >
            <div>
              <h2 className="text-base font-semibold text-slate-50">
                {card.title}
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                {card.description}
              </p>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Planned – will become interactive once the backend is connected.
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

