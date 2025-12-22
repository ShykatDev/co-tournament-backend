const prisma = require("../lib/prisma");
const jwt= require('jsonwebtoken')

const auth = async (req, res, next) => {
  try {
   const token = req.cookies?.access_token;
    if (!token) {
      return res
        .status(401)
        .json({ status: "fail", message: "No token provided" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        return res
          .status(401)
          .json({ status: "fail", message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ status: "fail", message: "Invalid token" });
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(500).json({ status: "fail", message: "Invalid token" });
  }
};

module.exports = auth;
