const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors()); // Altijd CORS aan voor frontend
app.use(express.json());

// MongoDB connectie
const uri = "mongodb+srv://lauradelissen:admin@vlinders.unu3yc0.mongodb.net";
const client = new MongoClient(uri);

let collection;

async function start() {
  await client.connect();
  const db = client.db("vlinders");
  collection = db.collection("butterflies");
  console.log("✅ MongoDB connected");

  // Render zet PORT via env variable
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();

// POST endpoint
app.post("/butterfly", async (req, res) => {
  try {
    const { image, username } = req.body;
    const result = await collection.insertOne({
      image,
      username,
      createdAt: new Date()
    });
    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save butterfly" });
  }
});

// GET endpoint voor teammate
app.get("/butterflies", async (req, res) => {
  try {
    const butterflies = await collection
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    res.json(butterflies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch butterflies" });
  }
});