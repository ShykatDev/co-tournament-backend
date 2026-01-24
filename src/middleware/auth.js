const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res
      .status(401)
      .json({ status: "fail", message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res
        .status(401)
        .json({ status: "fail", message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ status: "fail", message: "Invalid or expired token" });
  }
};

module.exports = auth;
