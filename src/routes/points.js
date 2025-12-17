const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

// Get points table with totalGoals
router.get("/:tournamentId", async (req, res) => {
  const tournamentId = Number(req.params.tournamentId);
  try {
    const table = await prisma.pointTable.findMany({
      where: { tournamentId },
      // include: { team: true },
      select: {
        team: {
          select: {
            name: true,
            club: true,
            players: true
          }
        },
        won: true,
        draw: true,
        lost: true,
        points: true,
        totalGoals: true,
        goalAgainst: true,
        goalDiff: true,
        goalFor: true,
        played: true
      },
      orderBy: [
        { points: "desc" },
      ],
    });
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
