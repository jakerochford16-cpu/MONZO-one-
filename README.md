# MONZO-one-

## Outer Line — extreme travel, by country

A travel app for people who don't want a sightseeing itinerary — they want to know
what a country's extreme scene actually looks like: wild bivouacs, guided high-risk
climbs, outback hunts, cage-free wreck dives, cliff-edge camping. Browse by country,
see what's on offer, and what it costs, requires, and risks.

```
apps/
  api/   Express + Prisma (SQLite) REST API serving countries & activities
  web/   Next.js (App Router) frontend that browses them
```

The API is a standalone service on purpose: the web app is the first client, but the
same REST endpoints are meant to be reused by a future mobile app.

### Data model

Each **Activity** belongs to a **Country** and carries:

- `category`, `region`, `description`
- `difficulty` (ADVANCED / EXPERT / EXTREME / INSANE)
- `riskLevel` (MODERATE / HIGH / SEVERE / EXTREME)
- `costType` (FREE / VARIES / PAID) + a human cost estimate
- `permitRequired`, `guideRequired`, `bestSeason`
- optional `latitude`/`longitude` for a future map view

Content is hand-curated to start (see `apps/api/prisma/seed.ts`) — it's a real,
researched dataset for Switzerland, Australia, New Zealand and Norway, not
placeholder text. Every entry is a **starting point, not an instruction** — verify
permits, conditions and costs with a local guide or operator before you go.

### Running it locally

```bash
npm install                # installs both apps (npm workspaces)
cd apps/api
cp .env.example .env       # if you don't already have apps/api/.env
npm run prisma:migrate     # creates apps/api/prisma/dev.db
npm run seed                # loads the curated countries/activities
cd ../..
npm run dev                  # runs the API (localhost:4000) and web app (localhost:3000)
```

Individual services: `npm run dev:api` / `npm run dev:web`.

### Adding a country or activity

Edit the `data` array in `apps/api/prisma/seed.ts` and re-run `npm run db:seed`
from the repo root. There's no admin UI yet — everything ships through the seed
file until user/community submissions are built.

### Roadmap (not yet built)

- Map view with pins per activity
- Accounts + saved trips
- Community submissions and condition reports
- Native/mobile client against the same API
