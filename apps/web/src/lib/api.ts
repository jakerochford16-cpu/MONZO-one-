import type { CountryDetail, CountrySummary } from "./types";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";

async function fetchJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

export async function getCountries(): Promise<CountrySummary[]> {
  const countries = await fetchJson<CountrySummary[]>("/api/countries");
  return countries ?? [];
}

export async function getCountry(slug: string): Promise<CountryDetail | null> {
  return fetchJson<CountryDetail>(`/api/countries/${slug}`);
}
