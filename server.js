const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://riteesh:tG8ETMGEbCZyPSVR@cluster0.53yd1uz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Mongoose connected to MongoDB."))
  .catch((err) => console.error("Mongoose connection error:", err));

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const leaderboardSchema = new Schema(
  {
    playerName: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { timestamps: true }
);

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
