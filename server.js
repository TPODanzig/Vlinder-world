const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://lauradelissen:admin@vlinders.unu3yc0.mongodb.net/vlinders?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// Butterfly Schema
const butterflySchema = new mongoose.Schema({
  image: String,
  color: String,
  username: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now }
});

const Butterfly = mongoose.model('Butterfly', butterflySchema);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Store connected clients
let drawingClients = [];
let gardenClients = [];

// API Endpoints
app.get('/api/butterflies', async (req, res) => {
  try {
    const butterflies = await Butterfly.find().sort({ createdAt: -1 }).limit(100);
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
    const butterfly = new Butterfly(req.body);
    await butterfly.save();
    res.json(butterfly);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Client identifies itself (draw or garden)
  socket.on('identify', (data) => {
    if (data.type === 'draw') {
      drawingClients.push(socket.id);
      console.log('Drawing client joined:', socket.id);
    } else if (data.type === 'garden') {
      gardenClients.push(socket.id);
      console.log('Garden client joined:', socket.id);
    }
  });

  // Receive drawing data from draw.html and broadcast to garden.html
  socket.on('draw_butterfly', async (data) => {
    console.log('🎨 Butterfly received from client:', socket.id);
    console.log('   Color:', data.color);
    console.log('   User:', data.username);
    
    // Sla vlinder op in MongoDB
    try {
      const butterfly = new Butterfly({
        image: data.image,
        color: data.color,
        username: data.username
      });
      await butterfly.save();
      console.log('💾 Butterfly saved to MongoDB!');
    } catch (err) {
      console.error('DB Error:', err);
    }
    
    // Broadcast to all garden clients
    io.emit('new_butterfly', data);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    drawingClients = drawingClients.filter(id => id !== socket.id);
    gardenClients = gardenClients.filter(id => id !== socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🦋 Vlindertuin server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log(`Local network: http://<your-ip>:${PORT}`);
});
