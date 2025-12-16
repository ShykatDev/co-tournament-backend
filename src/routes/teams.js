const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

// Create team
router.post("/", async (req, res) => {
  
  const { name, clubId, tournamentId } = req.body;

  if (!name || !clubId || !tournamentId) {
    return res
      .status(400)
      .json({ error: "name, clubId and tournamentId are required" });
  }

  try {
    const team = await prisma.team.create({
      data: {
        name,
        clubId: Number(clubId),
        tournamentId: Number(tournamentId),
      },
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});


// List teams
router.get("/", async (req, res) => {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      name: true,
      club: {
        select: {
          id: true,
          name: true,
          logo: true,
        }
      },
      players: {
        select: {
          id: true,
          name: true,
          profileImg: true,
          tier: true
        },
      },
      points: {
        select: {
          won: true,
          lost: true,
          draw: true,
          points: true,
          totalGoals: true
        }
      }
    },
  });
  res.json(teams);
});

module.exports = router;
