/*
  Warnings:

  - A unique constraint covering the columns `[teamId,tournamentId]` on the table `PointTable` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PointTable" ADD COLUMN     "goalAgainst" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goalDiff" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goalFor" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "PointTable_teamId_tournamentId_key" ON "PointTable"("teamId", "tournamentId");
