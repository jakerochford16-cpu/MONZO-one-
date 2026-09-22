import { Router } from "express";
import { prisma } from "../db";

export const activitiesRouter = Router();

activitiesRouter.get("/", async (req, res) => {
  const { category, difficulty, riskLevel } = req.query;

  const activities = await prisma.activity.findMany({
    where: {
      category: typeof category === "string" ? category : undefined,
      difficulty: typeof difficulty === "string" ? (difficulty as any) : undefined,
      riskLevel: typeof riskLevel === "string" ? (riskLevel as any) : undefined,
    },
    include: { country: { select: { name: true, slug: true } } },
    orderBy: { title: "asc" },
  });

  res.json(
    activities.map((a) => ({
      ...a,
      tags: a.tags ? a.tags.split(",").map((t) => t.trim()) : [],
    }))
  );
});

activitiesRouter.get("/:id", async (req, res) => {
  const activity = await prisma.activity.findUnique({
    where: { id: req.params.id },
    include: { country: true },
  });
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json({
    ...activity,
    tags: activity.tags ? activity.tags.split(",").map((t) => t.trim()) : [],
  });
});
