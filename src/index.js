const express = require("express")
const cors = require("cors");
require("dotenv").config();
const auth = require('./middleware/auth')
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// Enable CORS for all origins
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman) or from any domain
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true, // allow cookies
}));

app.get("/health", (_, res) => res.send("ok"));

// Import routes
const tournamentsRoutes = require("./routes/tournaments");
const teamsRoutes = require("./routes/teams");
const playersRoutes = require("./routes/players");
const matchesRoutes = require("./routes/matches");
const pointsRoutes = require("./routes/points");
const clubRoutes = require("./routes/club");
const adminRoutes = require("./routes/user");

app.use("/tournaments", tournamentsRoutes);
app.use("/club", clubRoutes);
app.use("/teams", teamsRoutes);
app.use("/players", playersRoutes);
app.use("/matches", matchesRoutes);
app.use("/points", pointsRoutes);
app.use("/", adminRoutes);


app.listen(8000, () => console.log("Server running"));
