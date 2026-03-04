const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Store connected clients
let drawingClients = [];
let gardenClients = [];

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
  socket.on('draw_butterfly', (data) => {
    console.log('🎨 Butterfly received from client:', socket.id);
    console.log('   Color:', data.color);
    console.log('   Broadcasting to', gardenClients.length, 'garden clients');
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
server.listen(PORT, () => {
  console.log(`🦋 Vlindertuin server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
