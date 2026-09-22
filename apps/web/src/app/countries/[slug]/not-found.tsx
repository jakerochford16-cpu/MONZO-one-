import Link from "next/link";

export default function CountryNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
        404
      </p>
      <h1 className="mt-2 text-3xl font-black text-white">We haven't scouted that one yet.</h1>
      <p className="mt-3 text-white/60">No country with that slug in the database.</p>
      <Link href="/" className="mt-6 text-sm font-semibold text-orange-400 hover:text-orange-300">
        &larr; Back to all countries
      </Link>
    </main>
  );
}
