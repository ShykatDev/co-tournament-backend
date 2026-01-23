const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

router.get('/', async (req, res)=> {
    const predictionTable = await prisma.prediction.findMany()
    res.send(predictionTable)
})

module.exports = router;
