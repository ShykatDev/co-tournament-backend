const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const upload = require("../middleware/upload");
const cloudinary = require("../lib/cloudinary");

// Add player (max 2 per team)
router.post("/", upload.single("profileImg"), async (req, res) => {
  const { name, teamId, tier } = req.body;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Profile Image required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "co-stars",
    });

    const count = await prisma.player.count({ where: { teamId: Number(teamId) } });
    if (count >= 2)
      return res.status(400).json({ error: "Team can have max 2 players" });

    const player = await prisma.player.create({
      data: {
        name,
        profileImg: result.secure_url,
        teamId: Number(teamId),
        tier: Number(tier),
      },
    });
    res.status(200).json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const players = await prisma.player.findMany();
  res.status(200).json(players);
});

module.exports = router;
