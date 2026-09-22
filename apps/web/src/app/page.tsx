import { CountryCard } from "@/components/CountryCard";
import { getCountries } from "@/lib/api";

export default async function HomePage() {
  const countries = await getCountries();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <section className="mb-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
          Not a sightseeing app
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
          Find out what a country actually offers if you want to suffer for it.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
          Bivouac on a 500m suspension bridge crossing. Guided ascents that cost more than
          your flight. Outback hunts, cage-free wreck dives, portaledge camps hanging off a
          cliff. Pick a country, see what it's really got.
        </p>
      </section>

      <section>
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white/40">
          Countries ({countries.length})
        </h2>
        {countries.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/60">
            No countries loaded yet &mdash; is the API running?
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
