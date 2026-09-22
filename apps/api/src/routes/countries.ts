import { Router } from "express";
import { prisma } from "../db";

export const countriesRouter = Router();

countriesRouter.get("/", async (_req, res) => {
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { activities: true } } },
  });
  res.json(
    countries.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      continent: c.continent,
      summary: c.summary,
      heroTag: c.heroTag,
      activityCount: c._count.activities,
    }))
  );
});

countriesRouter.get("/:slug", async (req, res) => {
  const country = await prisma.country.findUnique({
    where: { slug: req.params.slug },
    include: { activities: { orderBy: { title: "asc" } } },
  });
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }
  res.json({
    ...country,
    activities: country.activities.map((a) => ({
      ...a,
      tags: a.tags ? a.tags.split(",").map((t) => t.trim()) : [],
    })),
  });
});
