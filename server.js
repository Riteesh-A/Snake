const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

mongoose.connect("mongodb://localhost/snakeLeaderboard", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const scoreSchema = new mongoose.Schema({
  playerName: String,
  score: Number,
  date: { type: Date, default: Date.now },
});

const Score = mongoose.model("Score", scoreSchema);

// Submit a score
app.post("/submit-score", async (req, res) => {
  const { playerName, score } = req.body;
  const newScore = new Score({ playerName, score });
  await newScore.save();
  res.status(201).send("Score submitted successfully");
});

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  const topScores = await Score.find().sort({ score: -1 }).limit(10);
  res.json(topScores);
});

async function updateLeaderboard() {
  const response = await fetch("/leaderboard");
  const scores = await response.json();
  const leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = "";
  scores.forEach((score) => {
    const li = document.createElement("li");
    li.textContent = `${score.playerName}: ${score.score}`;
    leaderboardList.appendChild(li);
  });
}

function submitScore(playerName, score) {
  fetch("/submit-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerName, score }),
  }).then(() => updateLeaderboard());
}
