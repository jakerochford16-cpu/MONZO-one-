import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityCard } from "@/components/ActivityCard";
import { getCountry } from "@/lib/api";

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = await getCountry(slug);

  if (!country) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
      <Link href="/" className="text-sm font-medium text-white/50 hover:text-white">
        &larr; All countries
      </Link>

      <section className="mt-4 mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
          {country.continent} &middot; {country.heroTag}
        </p>
        <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">{country.name}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
          {country.summary}
        </p>
      </section>

      <section>
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white/40">
          {country.activities.length} extreme{" "}
          {country.activities.length === 1 ? "line" : "lines"}
        </h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {country.activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </main>
  );
}
