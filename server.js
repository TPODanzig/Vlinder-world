const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://lauradelissen:admin@vlinders.unu3yc0.mongodb.net/butterflies?appName=vlinders';
console.log('🔗 Attempting MongoDB connection...');
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected to butterflies database'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Full error:', err);
  });

// Butterfly Schema
const butterflySchema = new mongoose.Schema({
  image: String,
  color: String,
  username: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now }
});

const Butterfly = mongoose.model('Butterfly', butterflySchema);

// API Endpoints
app.get('/api/butterflies', async (req, res) => {
  try {
    console.log('📥 GET /api/butterflies request received');
    const butterflies = await Butterfly.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${butterflies.length} butterflies`);
    res.json(butterflies);
  } catch (err) {
    console.error('❌ Error fetching butterflies:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/butterflies/user/:username', async (req, res) => {
  try {
    const butterflies = await Butterfly.find({ username: req.params.username }).sort({ createdAt: -1 });
    res.json(butterflies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/butterflies', async (req, res) => {
  try {
    const butterfly = new Butterfly({
      image: req.body.image,
      color: req.body.color,
      username: req.body.username
    });
    await butterfly.save();
    console.log('💾 Butterfly saved:', butterfly.username);
    res.json(butterfly);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/butterflies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Butterfly.deleteOne({ _id: id });
    console.log(`🗑️ Deleted butterfly with id ${id}`);
    res.json({ message: 'Butterfly deleted', deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🦋 Vlindertuin API running on port ${PORT}`);
  console.log(`GET /api/butterflies`);
  console.log(`POST /api/butterflies`);
});