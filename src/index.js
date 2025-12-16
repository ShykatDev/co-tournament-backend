const express = require("express")
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => res.send("ok"));

// Import routes
const tournamentsRoutes = require("./routes/tournaments");
const teamsRoutes = require("./routes/teams");
const playersRoutes = require("./routes/players");
const matchesRoutes = require("./routes/matches");
const pointsRoutes = require("./routes/points");
const clubRoutes = require("./routes/club");

app.use("/tournaments", tournamentsRoutes);
app.use("/club", clubRoutes);
app.use("/teams", teamsRoutes);
app.use("/players", playersRoutes);
app.use("/matches", matchesRoutes);
app.use("/points", pointsRoutes);


app.listen(8000, () => console.log("Server running"));