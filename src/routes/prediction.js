const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

// Get prediction results
router.get("/", async (req, res) => {
  const predictionTable = await prisma.prediction.findMany({
    select: {
      id: true,
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
      match: {
        select: {
          id: true,
          status: true,
          matchType: true,
          tournament: {
            select: {
              id: true,
              name: true,
            },
          },
          teamA: {
            select: {
              id: true,
              name: true,
              club: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },
          teamB: {
            select: {
              id: true,
              name: true,
              club: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },
          scoreA: true,
          scoreB: true,
        },
      },
      predictScoreA: true,
      predictScoreB: true,
      point: true,
      isLocked: true,
      result: true,
    },
  });
  res.send(predictionTable);
});

// Post prediction
router.post("/", async (req, res) => {
  const { userId, matchId, predictScoreA, predictScoreB } = req.body;

  try {
    const predict = await prisma.prediction.create({
      data: {
        userId,
        matchId,
        predictScoreA,
        predictScoreB,
      },
    });
    res.status(201).json(predict);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

// Update prediction
router.patch("/:id", auth, async (req, res) => {
  const predictionId = Number(req.params.id);
  const { predictScoreA, predictScoreB } = req.body;
  const userId = req.user.id;

  try {
    const result = await prisma.prediction.updateMany({
      where: {
        id: predictionId,
        userId,
        isLocked: false,
      },
      data: {
        predictScoreA,
        predictScoreB,
      },
    });

    if (result.count === 0) {
      return res.status(403).json({
        error: "Prediction not found, locked, or unauthorized",
      });
    }

    res.status(200).json({ message: "Prediction updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

