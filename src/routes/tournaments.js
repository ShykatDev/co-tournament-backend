const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const cloudinary = require("../lib/cloudinary")
const upload = require("../middleware/upload")

// Create tournament
router.post("/", upload.single("logo"), async (req, res) => {
  const { name, startDate, endDate } = req.body;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Logo required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "co-tournaments",
    });

    const tournament = await prisma.tournament.create({
      data: {
        name,
        logo: result.secure_url,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List tournaments
router.get("/", async (req, res) => {
  const tournaments = await prisma.tournament.findMany();
  res.status(200).json(tournaments);
});

module.exports = router;
