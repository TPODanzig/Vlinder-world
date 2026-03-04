// Initialize Socket.io connection
const socket = io();

// Canvas setup
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const statusDiv = document.getElementById('status');

// Set proper canvas resolution
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = 600;
    canvas.height = 400;
    
    // Set scale for high DPI devices
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 600 * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);
    
    // Redraw gradient background
    drawBackground();
}

function drawBackground() {
    // Complete transparent background - no color, no gradient
    ctx.clearRect(0, 0, 600, 400);
}

// Drawing settings
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#FF69B4'; // Default pink

// Brush settings
const brushWidth = 15;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Initialize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Identify as draw client
socket.emit('identify', { type: 'draw' });

// Color button handling
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        // Set current color
        currentColor = btn.getAttribute('data-color');
    });
});

// Set first color as active
document.querySelector('.color-btn').classList.add('active');

// Canvas event listeners - Mouse
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Canvas event listeners - Touch
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', stopDrawing);

// Canvas event listeners - Pointer (for Raspberry Pi)
canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointerleave', stopDrawing);

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 400 / rect.height;
    
    let x, y;
    if (e.touches) {
        x = (e.touches[0].clientX - rect.left) * scaleX;
        y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
        x = (e.clientX - rect.left) * scaleX;
        y = (e.clientY - rect.top) * scaleY;
    }
    
    return { x, y };
}

function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCoordinates(e);
    lastX = x;
    lastY = y;
}

function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushWidth;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    if (e.type === 'touchstart') {
        startDrawing(e);
    } else if (e.type === 'touchmove') {
        draw(e);
    }
}

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, 600, 400);
    drawBackground();
    showStatus('Canvas gewist');
});

// Send button
document.getElementById('sendBtn').addEventListener('click', () => {
    console.log('Send button clicked');
    
    // Convert canvas to image data WITH transparency
    const imageData = canvas.toDataURL('image/png');
    console.log('Image data created, size:', imageData.length);
    
    // Send to server
    const butterflyData = {
        image: imageData,
        timestamp: new Date().toISOString(),
        color: currentColor
    };
    
    console.log('Emitting draw_butterfly event:', butterflyData.color);
    socket.emit('draw_butterfly', butterflyData);
    
    showStatus('🦋 Vlinder verzonden naar tuin!');
    
    // Clear canvas after sending
    setTimeout(() => {
        ctx.clearRect(0, 0, 600, 400);
        drawBackground();
    }, 500);
});

function showStatus(message) {
    statusDiv.textContent = message;
    setTimeout(() => {
        statusDiv.textContent = '';
    }, 3000);
}
