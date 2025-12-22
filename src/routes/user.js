const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
  const { name, role, password, email } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        role,
        password: hashPassword,
        email,
      },
    });

    res.status(201).json({
      name,
      email,
      message: "User created!",
    });
  } catch (err) {
    res.status(500).json({
      error: "User not created",
      message: "Something went wrong",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const pass = await bcrypt.compare(password, user.password);

   if (!pass) return res.status(401).json({ message: "Incorrect password" });

    // JWT
    const accesstoken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshtoken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_REFRESH_SECRECT,
      { expiresIn: "7d" }
    );

    res.cookie("access_token", accesstoken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

    res.status(200).json({
      message: 'Login Success',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
});


router.get("/me", auth, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    },
  });
});


module.exports = router;
