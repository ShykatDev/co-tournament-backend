const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const cloudinary = require("../lib/cloudinary");
const upload = require("../middleware/upload");

router.post("/", upload.single("logo"), async (req, res) => {
  const { name, tournamentId } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Logo required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "co-clubs",
    });

    const club = await prisma.club.create({
      data: { name, logo: result.secure_url, tournamentId: Number(tournamentId) },
    });

    res.status(201).json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const clubs = await prisma.club.findMany();
  res.status(200).json(clubs);
});

module.exports = router;
