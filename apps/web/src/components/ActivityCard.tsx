import type { Activity } from "@/lib/types";
import { CostBadge, DifficultyBadge, RiskBadge } from "./badges";

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
            {activity.category} &middot; {activity.region}
          </p>
          <h3 className="mt-1 text-xl font-bold text-white">{activity.title}</h3>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <DifficultyBadge difficulty={activity.difficulty} />
        <RiskBadge riskLevel={activity.riskLevel} />
        <CostBadge
          costType={activity.costType}
          costEstimate={activity.costEstimate}
          currency={activity.currency}
        />
        {activity.permitRequired && (
          <span className="inline-flex items-center rounded-full bg-purple-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-purple-300 ring-1 ring-purple-500/30">
            Permit required
          </span>
        )}
        {activity.guideRequired && (
          <span className="inline-flex items-center rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-teal-300 ring-1 ring-teal-500/30">
            Guide required
          </span>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/75">{activity.description}</p>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/50">
        {activity.bestSeason && <span>Best season: {activity.bestSeason}</span>}
        {activity.latitude != null && activity.longitude != null && (
          <span>
            {activity.latitude.toFixed(3)}, {activity.longitude.toFixed(3)}
          </span>
        )}
      </div>

      {activity.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activity.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
