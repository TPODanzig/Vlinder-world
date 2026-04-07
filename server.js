const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const { spawn } = require('child_process');

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
  createdAt: { type: Date, default: Date.now },
  flagged: { type: Boolean, default: false },
  flagReason: { type: String, default: null }
});

const Butterfly = mongoose.model('Butterfly', butterflySchema);

// Moderation helper — calls moderation.py and returns { safe, reason }
function moderateImage(dataURL) {
  return new Promise((resolve) => {
    const py = spawn('python3', ['moderation.py', dataURL]);

    let output = '';
    let error = '';

    py.stdout.on('data', (data) => { output += data.toString(); });
    py.stderr.on('data', (data) => { error += data.toString(); });

    py.on('close', (code) => {
      if (code !== 0 || error) {
        // If moderation fails for any reason, let it through
        console.warn('⚠️ Moderation script error:', error);
        resolve({ safe: true, reason: null });
        return;
      }

      const trimmed = output.trim();
      if (trimmed === 'SAFE') {
        resolve({ safe: true, reason: null });
      } else {
        // Output format is: UNSAFE:<reason>
        const reason = trimmed.startsWith('UNSAFE:')
          ? trimmed.slice(7)
          : 'content policy violation';
        resolve({ safe: false, reason });
      }
    });

    // If Python takes more than 10 seconds, let it through
    setTimeout(() => resolve({ safe: true, reason: null }), 10000);
  });
}

// API Endpoints
app.get('/api/butterflies', async (req, res) => {
  try {
    console.log('📥 GET /api/butterflies request received');
    const butterflies = await Butterfly.find({ flagged: { $ne: true } }).sort({ createdAt: -1 });
    console.log(`✅ Found ${butterflies.length} butterflies`);
    res.json(butterflies);
  } catch (err) {
    console.error('❌ Error fetching butterflies:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/butterflies/flagged', async (req, res) => {
  try {
    const butterflies = await Butterfly.find({ flagged: true }).sort({ createdAt: -1 });
    res.json(butterflies);
  } catch (err) {
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
    const { image, color, username } = req.body;

    // Run moderation check
    const moderation = await moderateImage(image);

    if (!moderation.safe) {
      // Save to DB as flagged so mods can review it
      const flagged = new Butterfly({
        image,
        color,
        username,
        flagged: true,
        flagReason: moderation.reason
      });
      await flagged.save();
      console.log(`🚫 Flagged submission from ${username}: ${moderation.reason}`);

      // Tell the user why it was blocked
      return res.status(451).json({
        blocked: true,
        reason: moderation.reason,
        message: `Je vlinder is geblokkeerd: ${moderation.reason}. Je inzending wordt bekeken door een moderator. Je kunt je tekening aanpassen en opnieuw proberen.`
      });
    }

    // Safe — save normally
    const butterfly = new Butterfly({ image, color, username });
    await butterfly.save();
    console.log('💾 Butterfly saved:', username);
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