-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "heroTag" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "costType" TEXT NOT NULL,
    "costEstimate" TEXT,
    "currency" TEXT,
    "difficulty" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "permitRequired" BOOLEAN NOT NULL DEFAULT false,
    "guideRequired" BOOLEAN NOT NULL DEFAULT false,
    "bestSeason" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "tags" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE INDEX "Activity_countryId_idx" ON "Activity"("countryId");
