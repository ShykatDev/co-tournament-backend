const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

// Create match
router.post("/", async (req, res) => {
  const { tournamentId, teamAId, teamBId, scheduledAt } = req.body;
  try {
    const match = await prisma.match.create({
      data: {
        tournamentId,
        teamAId,
        teamBId,
        scheduledAt: new Date(scheduledAt),
      },
    });
    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start match
router.patch("/:id/start", async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    // Find the match first
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.status !== "UPCOMING") {
      return res
        .status(400)
        .json({ error: "Only upcoming matches can be started" });
    }

    // Update status
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { status: "ONGOING" },
      include: {
        teamA: { include: { players: true } },
        teamB: { include: { players: true } },
      },
    });

    res.json({ message: "Match started", match: updatedMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Finish match and update points + totalGoals
router.post("/:id/finish", async (req, res) => {
  const matchId = Number(req.params.id);
  const { scoreA, scoreB } = req.body;

  if (isNaN(matchId)) {
    return res.status(400).json({ error: "Invalid match ID" });
  }

  try {
    // Find the match first
    const match = await prisma.match.findUnique({ where: { id: matchId } });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Only allow finishing ongoing matches
    if (match.status !== "ONGOING") {
      return res
        .status(400)
        .json({ error: "Only ongoing matches can be finished" });
    }

    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "FINISHED",
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
        endedAt: new Date(),
      },
    });

    // Update points table
    await updatePoints(
      match.tournamentId,
      match.teamAId,
      match.teamBId,
      Number(scoreA),
      Number(scoreB)
    );

    res.json(updatedMatch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function updatePoints(tournamentId, teamAId, teamBId, scoreA, scoreB) {
  // Team A
  await prisma.pointTable.upsert({
    where: { teamId: teamAId },
    update: {
      played: { increment: 1 },
      won: scoreA > scoreB ? { increment: 1 } : undefined,
      draw: scoreA === scoreB ? { increment: 1 } : undefined,
      lost: scoreA < scoreB ? { increment: 1 } : undefined,
      points: { increment: scoreA > scoreB ? 3 : scoreA === scoreB ? 1 : 0 },
      totalGoals: { increment: scoreA }, // <-- increment total goals
    },
    create: {
      tournamentId,
      teamId: teamAId,
      played: 1,
      won: scoreA > scoreB ? 1 : 0,
      draw: scoreA === scoreB ? 1 : 0,
      lost: scoreA < scoreB ? 1 : 0,
      points: scoreA > scoreB ? 3 : scoreA === scoreB ? 1 : 0,
      totalGoals: scoreA, // <-- initial total goals
    },
  });

  // Team B
  await prisma.pointTable.upsert({
    where: { teamId: teamBId },
    update: {
      played: { increment: 1 },
      won: scoreB > scoreA ? { increment: 1 } : undefined,
      draw: scoreA === scoreB ? { increment: 1 } : undefined,
      lost: scoreB < scoreA ? { increment: 1 } : undefined,
      points: { increment: scoreB > scoreA ? 3 : scoreA === scoreB ? 1 : 0 },
      totalGoals: { increment: scoreB },
    },
    create: {
      tournamentId,
      teamId: teamBId,
      played: 1,
      won: scoreB > scoreA ? 1 : 0,
      draw: scoreA === scoreB ? 1 : 0,
      lost: scoreB < scoreA ? 1 : 0,
      points: scoreB > scoreA ? 3 : scoreA === scoreB ? 1 : 0,
      totalGoals: scoreB,
    },
  });
}

router.get("/", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      select: {
        id: true,
        tournamentId: true,
        status: true,
        scheduledAt: true,
        scoreA: true,
        scoreB: true,
        teamA: {
          select: {
            name: true,
            club: true,
            players: true,
          },
        },
        teamB: {
          select: {
            name: true,
            club: true,
            players: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/live", async (req, res) => {
  try {
    const ongoingMatch = await prisma.match.findFirst({
      where: { status: "ONGOING" },
      select: {
        id: true,
        tournamentId: true,
        status: true,
        scheduledAt: true,
        scoreA: true,
        scoreB: true,
        startedAt: true,
        teamA: {
          select: {
            id: true,
            name: true,
            club: true,
            players: true,
            points: {
              select: {
                won: true,
                played: true,
                totalGoals: true,
              },
            },
          },
        },
        teamB: {
          select: {
            id: true,
            name: true,
            club: true,
            players: true,
            points: {
              select: {
                won: true,
                played: true,
                totalGoals: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" }, // in case multiple ongoing matches
    });

    res.json({ ongoingMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/upcoming", async (req, res) => {
  try {
    const upcomingMatches = await prisma.match.findMany({
      where: { status: "UPCOMING", scheduledAt: { gt: new Date() } },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        teamA: {
          select: {
            club: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
        teamB: {
          select: {
            club: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    res.json({ upcomingMatches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
