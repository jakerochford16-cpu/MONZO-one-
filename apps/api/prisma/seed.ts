import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedActivity = {
  title: string;
  region: string;
  category: string;
  description: string;
  costType: "FREE" | "VARIES" | "PAID";
  costEstimate?: string;
  currency?: string;
  difficulty: "ADVANCED" | "EXPERT" | "EXTREME" | "INSANE";
  riskLevel: "MODERATE" | "HIGH" | "SEVERE" | "EXTREME";
  permitRequired: boolean;
  guideRequired: boolean;
  bestSeason?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
};

type SeedCountry = {
  name: string;
  slug: string;
  continent: string;
  summary: string;
  heroTag: string;
  activities: SeedActivity[];
};

const data: SeedCountry[] = [
  {
    name: "Switzerland",
    slug: "switzerland",
    continent: "Europe",
    summary:
      "The Alps aren't just for postcard hikes — this is glacier ice, 500m suspension bridges, and guided lines up the most famous horn in mountaineering.",
    heroTag: "Alpine extremes",
    activities: [
      {
        title: "Bivouac the Europaweg past the Charles Kuonen Suspension Bridge",
        region: "Randa → Grächen, Valais",
        category: "Bivouac & Wild Camping",
        description:
          "Hike the exposed high route between Zermatt and Grächen, crossing the 494m Charles Kuonen Suspension Bridge — one of the longest pedestrian suspension bridges in the world, hung 85m above the Grabengufer ravine. Above the treeline, a one-night bivouac is broadly tolerated under Swiss custom (not on the bridge itself). Exposed scrambling sections either side of the bridge in poor weather turn this from a hike into a real objective.",
        costType: "FREE",
        difficulty: "EXPERT",
        riskLevel: "HIGH",
        permitRequired: false,
        guideRequired: false,
        bestSeason: "Late June – September",
        latitude: 46.0987,
        longitude: 7.8021,
        tags: ["suspension bridge", "bivouac", "via alpine route", "exposure"],
      },
      {
        title: "Guided ascent of the Matterhorn (Hörnli Ridge)",
        region: "Zermatt, Valais",
        category: "Mountaineering",
        description:
          "The classic and still-deadly Hörnli Ridge route to the 4,478m summit. Overnight at the Hörnlihütte, alpine start in the dark, exposed scrambling and fixed-rope sections with serious rockfall and weather risk. An IFMGA mountain guide is effectively mandatory — this isn't a route to solo on your first Alpine 4000er.",
        costType: "PAID",
        costEstimate: "1,650–4,000+ for guide fee, hut and lift combined",
        currency: "CHF",
        difficulty: "INSANE",
        riskLevel: "EXTREME",
        permitRequired: false,
        guideRequired: true,
        bestSeason: "Mid-July – mid-September",
        latitude: 45.9766,
        longitude: 7.6585,
        tags: ["4000er", "guide required", "ridge climb", "hut-to-summit"],
      },
      {
        title: "Free-ride downhill mountain biking above Verbier",
        region: "Verbier / La Chaux, Valais",
        category: "Mountain Biking",
        description:
          "Steep, rooty, exposed alpine downhill trails dropping off the ridgelines above Verbier. Take the lift up and pay for a pass, or earn your line by grinding the climb on the fire roads for free — your call. Trails range from flow to genuinely gnarly rock-garden descents with real consequences if you go off the edge of the track.",
        costType: "VARIES",
        costEstimate: "Free if you climb; ~45–65/day for lift pass",
        currency: "CHF",
        difficulty: "EXPERT",
        riskLevel: "HIGH",
        permitRequired: false,
        guideRequired: false,
        bestSeason: "June – September",
        latitude: 46.0967,
        longitude: 7.2286,
        tags: ["downhill", "lift-access", "self-powered option", "alpine trail"],
      },
    ],
  },
  {
    name: "Australia",
    slug: "australia",
    continent: "Oceania",
    summary:
      "From cage-free shark dives on wreck sites to guided outback hunts and undeveloped cave systems — Queensland's extremes are as much about remoteness as adrenaline.",
    heroTag: "Outback & reef extremes",
    activities: [
      {
        title: "Guided feral game hunt, outback Queensland",
        region: "Western QLD stations",
        category: "Hunting",
        description:
          "Licensed, landholder-approved hunts for feral scrub bulls, boar or deer on remote outback stations. Multi-day trips on foot or by 4WD, tracking animals across genuinely vast, waterless country — the risk here is as much heat, dehydration and isolation as the game itself. Requires a firearms licence (or hire through the outfitter) and written landholder permission.",
        costType: "PAID",
        costEstimate: "1,500–5,000+ depending on species and trip length",
        currency: "AUD",
        difficulty: "EXPERT",
        riskLevel: "HIGH",
        permitRequired: true,
        guideRequired: true,
        bestSeason: "April – October (dry season)",
        latitude: -23.699,
        longitude: 144.284,
        tags: ["firearms licence", "remote", "multi-day", "landholder permit"],
      },
      {
        title: "Cage-free shark dive, SS Yongala wreck",
        region: "Ayr, North Queensland",
        category: "Diving",
        description:
          "Advanced open-water dive on one of the world's best wreck dives — a 109m cyclone-sunk steamer now covered in coral, with resident bull sharks, tiger sharks, giant groupers and sea snakes circling in strong current. No cage, no bars, just buoyancy control and a dive guide who knows the wreck.",
        costType: "PAID",
        costEstimate: "~300–450 per two-dive charter",
        currency: "AUD",
        difficulty: "EXPERT",
        riskLevel: "HIGH",
        permitRequired: false,
        guideRequired: true,
        bestSeason: "Year-round; best visibility Sept–Dec",
        latitude: -19.3039,
        longitude: 147.6229,
        tags: ["wreck dive", "sharks", "strong current", "advanced certification required"],
      },
      {
        title: "Wild caving, Chillagoe–Mungana Caves",
        region: "Chillagoe, Far North Queensland",
        category: "Caving",
        description:
          "Beyond the show caves, permitted wild/adventure caving routes wind through undeveloped limestone tunnels — tight squeezes, pitch darkness, and no fixed lighting or handrails. A national parks permit is required for the undeveloped systems, and a local guide is strongly recommended since routes are unmarked and mobile signal is nonexistent underground.",
        costType: "VARIES",
        costEstimate: "Permit is low-cost; guided trips ~120–250",
        currency: "AUD",
        difficulty: "ADVANCED",
        riskLevel: "MODERATE",
        permitRequired: true,
        guideRequired: false,
        bestSeason: "May – September (dry season)",
        latitude: -17.1548,
        longitude: 144.5336,
        tags: ["wild cave", "permit required", "no phone signal", "tight squeezes"],
      },
    ],
  },
  {
    name: "New Zealand",
    slug: "new-zealand",
    continent: "Oceania",
    summary:
      "Glacier ice, canyon swings and cliff-edge camping on the South Island — the birthplace of commercial extreme sport tourism still does it harder than most.",
    heroTag: "Southern Alps adrenaline",
    activities: [
      {
        title: "Glacier ice climbing, Franz Josef",
        region: "Franz Josef, West Coast",
        category: "Ice Climbing",
        description:
          "Helicopter onto the Franz Josef névé and climb real, moving glacier ice — crevasses, seracs and ice walls that reshape year to year, guided by climbers who re-scout routes every trip because the glacier itself changes weekly. Crampons and ice axes provided; fitness and a head for exposure are on you.",
        costType: "PAID",
        costEstimate: "500–750 for a full-day heli-ice climb",
        currency: "NZD",
        difficulty: "EXPERT",
        riskLevel: "HIGH",
        permitRequired: false,
        guideRequired: true,
        bestSeason: "October – April",
        latitude: -43.4667,
        longitude: 170.1833,
        tags: ["glacier", "helicopter access", "crevasse terrain", "ice axe"],
      },
      {
        title: "Nevis Swing — free-fall canyon swing",
        region: "Queenstown, Otago",
        category: "Extreme Jump",
        description:
          "A 300m fall into the Nevis Canyon before the 70m-radius swing arcs you out over the gorge at speeds over 120km/h. It's a commercial operation with a strong safety record, but the drop and swing profile is more intense than any standard bungy — not for the faint-hearted.",
        costType: "PAID",
        costEstimate: "~250–300 per jump",
        currency: "NZD",
        difficulty: "ADVANCED",
        riskLevel: "HIGH",
        permitRequired: false,
        guideRequired: true,
        bestSeason: "Year-round",
        latitude: -45.1667,
        longitude: 168.85,
        tags: ["canyon swing", "commercial operator", "free fall", "gorge"],
      },
      {
        title: "Cliff-edge portaledge camping, Wanaka backcountry",
        region: "Mount Aspiring National Park, Otago",
        category: "Bivouac & Wild Camping",
        description:
          "Local alpine guiding outfits occasionally run portaledge trips — rigging a suspended camping platform off a rock face rather than pitching on the ground, so you sleep hanging in open air above the valley. Strictly guide-led: anchor-building and rigging for a hanging camp is technical rope work, not a DIY wild-camp.",
        costType: "PAID",
        costEstimate: "Varies by operator — typically a multi-day guided package",
        currency: "NZD",
        difficulty: "EXTREME",
        riskLevel: "SEVERE",
        permitRequired: true,
        guideRequired: true,
        bestSeason: "December – March",
        latitude: -44.3833,
        longitude: 168.7333,
        tags: ["portaledge", "rope access", "guide required", "national park permit"],
      },
    ],
  },
  {
    name: "Norway",
    slug: "norway",
    continent: "Europe",
    summary:
      "Allemannsretten — the right to roam — means free wild camping right up to some of the most vertigo-inducing cliff edges on Earth.",
    heroTag: "Fjord-edge exposure",
    activities: [
      {
        title: "Wild camp on the edge of Preikestolen (Pulpit Rock)",
        region: "Ryfylke, Rogaland",
        category: "Bivouac & Wild Camping",
        description:
          "A flat plateau dropping 604m sheer into Lysefjorden, with no fence or barrier. Norway's allemannsretten right-to-roam law makes wild camping here legal and free — pitch back from the unguarded edge, and treat the exposed rock, wind and sudden fog as the real hazard, not the hike in.",
        costType: "FREE",
        difficulty: "ADVANCED",
        riskLevel: "SEVERE",
        permitRequired: false,
        guideRequired: false,
        bestSeason: "April – October",
        latitude: 58.9866,
        longitude: 6.1903,
        tags: ["right to roam", "cliff edge", "free camping", "no barriers"],
      },
      {
        title: "Reach and stand on Kjeragbolten",
        region: "Kjerag, Rogaland",
        category: "Via Ferrata / Scrambling",
        description:
          "A 5-cubic-metre boulder wedged in a crevasse 984m above Lysefjorden — the classic photo is standing on it with the fjord straight down on both sides. Getting there is a serious full-day scramble with chains on the steepest sections and genuine fall consequences the whole way; this is also a well-known BASE jump exit point if that's more your speed.",
        costType: "FREE",
        difficulty: "EXPERT",
        riskLevel: "SEVERE",
        permitRequired: false,
        guideRequired: false,
        bestSeason: "June – September",
        latitude: 59.0339,
        longitude: 6.6197,
        tags: ["scramble", "exposure", "BASE jump exit", "chains"],
      },
      {
        title: "Sea kayak wild-camp expedition, Lofoten Islands",
        region: "Lofoten, Nordland",
        category: "Sea Kayaking & Wild Camping",
        description:
          "Multi-day self-supported sea kayak trips between the jagged Lofoten peaks, wild-camping on empty beaches under the midnight sun. Arctic water temperatures, fast-changing weather and long committing crossings between islands mean this is for experienced paddlers only — rescue is far away.",
        costType: "VARIES",
        costEstimate: "Free if self-supported with own gear; guided trips from ~1,200",
        currency: "EUR",
        difficulty: "EXPERT",
        riskLevel: "HIGH",
        permitRequired: false,
        guideRequired: false,
        bestSeason: "June – August",
        latitude: 68.1500,
        longitude: 13.6000,
        tags: ["sea kayak", "midnight sun", "self-supported", "arctic water"],
      },
    ],
  },
];

async function main() {
  await prisma.activity.deleteMany();
  await prisma.country.deleteMany();

  for (const country of data) {
    await prisma.country.create({
      data: {
        name: country.name,
        slug: country.slug,
        continent: country.continent,
        summary: country.summary,
        heroTag: country.heroTag,
        activities: {
          create: country.activities.map((a) => ({
            title: a.title,
            region: a.region,
            category: a.category,
            description: a.description,
            costType: a.costType,
            costEstimate: a.costEstimate,
            currency: a.currency,
            difficulty: a.difficulty,
            riskLevel: a.riskLevel,
            permitRequired: a.permitRequired,
            guideRequired: a.guideRequired,
            bestSeason: a.bestSeason,
            latitude: a.latitude,
            longitude: a.longitude,
            tags: a.tags.join(","),
          })),
        },
      },
    });
  }

  console.log(`Seeded ${data.length} countries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
