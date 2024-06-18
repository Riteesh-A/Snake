const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const app = express();
const port = 3000;

// mongoose.connect("mongodb://localhost/snakeLeaderboard", {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // });
  
app.use(cors())
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// const scoreSchema = new mongoose.Schema({
//   playerName: String,
//   score: Number,
//   date: { type: Date, default: Date.now },
// });

// const Score = mongoose.model("Score", scoreSchema);
let Score = [];

// Submit a score
app.post("/submit-score", async (req, res) => {
  const { playerName, score } = req.body;
  // const newScore = new Score({ playerName, score });
  // await newScore.save();
  Score.push({playerName: playerName, score: score})
  res.status(201).send("Score submitted successfully");
});

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  // const topScores = await Score.find().sort({ score: -1 }).limit(10);
  // res.json(topScores);
  res.json(Score.sort((a,b)=> a.score<b.score?1:-1))
});
