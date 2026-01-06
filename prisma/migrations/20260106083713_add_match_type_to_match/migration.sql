-- CreateEnum
CREATE TYPE "MatchTypes" AS ENUM ('PRESEASON', 'SEMIFINAL', 'FINAL');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "matchType" "MatchTypes" NOT NULL DEFAULT 'PRESEASON';
