const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const serverless = require("serverless-http");
const connectDb = async (url) => {
  await mongoose.connect(url);
};

const app = express();
app.use(cors());
app.use(express.json());

const Schema = mongoose.Schema;

const uri =
  "mongodb+srv://riteesh:tG8ETMGEbCZyPSVR@cluster0.53yd1uz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
connectDb(uri);

const leaderboardSchema = new Schema(
  {
    playerName: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { timestamps: true }
);

exports.handler = serverless(app);
const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

// Submit a score
app.post("/submit-score", async (req, res) => {
  const { playerName, score } = req.body;
  const newScore = new Leaderboard({ playerName, score });
  await newScore.save();
  res.status(201).send("Score submitted successfully");
});

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  const topScores = await Leaderboard.find().sort({ score: -1 }).limit(10);
  res.json(topScores);
  return topScores;
});
