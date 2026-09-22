import type { CostType, Difficulty, RiskLevel } from "@/lib/types";

const pill = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
const base = `${pill} tracking-wide uppercase`;

const difficultyStyles: Record<Difficulty, string> = {
  ADVANCED: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
  EXPERT: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30",
  EXTREME: "bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
  INSANE: "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-500/30",
};

const riskStyles: Record<RiskLevel, string> = {
  MODERATE: "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30",
  HIGH: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30",
  SEVERE: "bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
  EXTREME: "bg-red-700/20 text-red-400 ring-1 ring-red-700/40",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`${base} ${difficultyStyles[difficulty]}`}>{difficulty}</span>;
}

export function RiskBadge({ riskLevel }: { riskLevel: RiskLevel }) {
  return <span className={`${base} ${riskStyles[riskLevel]}`}>Risk: {riskLevel}</span>;
}

export function CostBadge({
  costType,
  costEstimate,
  currency,
}: {
  costType: CostType;
  costEstimate: string | null;
  currency: string | null;
}) {
  if (costType === "FREE") {
    return (
      <span className={`${base} bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30`}>
        Free
      </span>
    );
  }
  const label = costEstimate
    ? `${currency ? currency + " " : ""}${costEstimate}`
    : costType === "VARIES"
      ? "Varies"
      : "Paid";
  return (
    <span className={`${pill} bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30`}>{label}</span>
  );
}
