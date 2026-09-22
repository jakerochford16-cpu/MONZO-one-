import Link from "next/link";
import type { CountrySummary } from "@/lib/types";

export function CountryCard({ country }: { country: CountrySummary }) {
  return (
    <Link
      href={`/countries/${country.slug}`}
      className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/25 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
            {country.continent}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-white">{country.name}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
          {country.activityCount} {country.activityCount === 1 ? "line" : "lines"}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-white/50">{country.heroTag}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{country.summary}</p>
      <p className="mt-4 text-sm font-semibold text-orange-400 transition group-hover:translate-x-1">
        See the extremes &rarr;
      </p>
    </Link>
  );
}
