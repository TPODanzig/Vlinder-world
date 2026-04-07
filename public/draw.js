const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let baseColor = "#ff69b4";
let currentColor = "#ff69b4";
let lineWidth = 15;
let isEraser = false;
let colorVibrancy = 100;

let username = localStorage.getItem("username") || "Anonymous";

const name = prompt("Wat is je naam?");
if (name) {
  username = name;
}

let clippingPath;

function createClippingPath() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  clippingPath = new Path2D();

  // linksboven vleugel
  clippingPath.bezierCurveTo(centerX - 120, centerY - 40, centerX - 150, centerY - 100, centerX - 100, centerY - 130);
  clippingPath.bezierCurveTo(centerX - 80, centerY - 110, centerX - 70, centerY - 60, centerX - 60, centerY - 20);
  clippingPath.bezierCurveTo(centerX - 80, centerY - 30, centerX - 100, centerY - 20, centerX - 100, centerY + 10);
  clippingPath.bezierCurveTo(centerX - 120, centerY - 10, centerX - 130, centerY - 40, centerX - 120, centerY - 40);

  // linksonder vleugel
  clippingPath.bezierCurveTo(centerX - 90, centerY + 20, centerX - 110, centerY + 60, centerX - 80, centerY + 100);
  clippingPath.bezierCurveTo(centerX - 60, centerY + 90, centerX - 50, centerY + 50, centerX - 50, centerY + 20);
  clippingPath.bezierCurveTo(centerX - 70, centerY + 25, centerX - 80, centerY + 20, centerX - 90, centerY + 20);

  // lichaam
  clippingPath.ellipse(centerX, centerY - 20, 12, 40, 0, 0, Math.PI * 2);

  // rechtsboven vleugel
  clippingPath.bezierCurveTo(centerX + 120, centerY - 40, centerX + 150, centerY - 100, centerX + 100, centerY - 130);
  clippingPath.bezierCurveTo(centerX + 80, centerY - 110, centerX + 70, centerY - 60, centerX + 60, centerY - 20);
  clippingPath.bezierCurveTo(centerX + 80, centerY - 30, centerX + 100, centerY - 20, centerX + 100, centerY + 10);
  clippingPath.bezierCurveTo(centerX + 120, centerY - 10, centerX + 130, centerY - 40, centerX + 120, centerY - 40);

  // rechtsonder vleugel
  clippingPath.bezierCurveTo(centerX + 90, centerY + 20, centerX + 110, centerY + 60, centerX + 80, centerY + 100);
  clippingPath.bezierCurveTo(centerX + 60, centerY + 90, centerX + 50, centerY + 50, centerX + 50, centerY + 20);
  clippingPath.bezierCurveTo(centerX + 70, centerY + 25, centerX + 80, centerY + 20, centerX + 90, centerY + 20);
}

createClippingPath();

// Clear canvas
function drawButterflyTemplate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

drawButterflyTemplate();
const blankCanvasDataURL = canvas.toDataURL();

let undoStack = [];
let redoStack = [];

function saveState() {
  const currentState = canvas.toDataURL();
  if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== currentState) {
    undoStack.push(currentState);
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
  }
}

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(canvas.toDataURL());
    const prevState = undoStack.pop();
    const img = new Image();
    img.src = prevState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(canvas.toDataURL());
    const nextState = redoStack.pop();
    const img = new Image();
    img.src = nextState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);

// Tekenen functies
let lastX = 0;
let lastY = 0;

function drawSegment(x1, y1, x2, y2) {
  ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";

  // Originele kant
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  // Gespiegelde kant
  ctx.beginPath();
  ctx.moveTo(canvas.width - x1, y1);
  ctx.lineTo(canvas.width - x2, y2);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.globalCompositeOperation = "source-over";
}

function startDrawing(x, y) {
  drawing = true;
  canvas.classList.add("drawing");
  lastX = x;
  lastY = y;
  drawSegment(x, y, x, y);
}

function draw(x, y) {
  if (!drawing) return;
  drawSegment(lastX, lastY, x, y);
  lastX = x;
  lastY = y;
}

function stopDrawing() {
  drawing = false;
  canvas.classList.remove("drawing");
}

// Pointer events - with proper scaling
canvas.addEventListener("pointerdown", e => {
  saveState();
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  startDrawing(x, y);
});
canvas.addEventListener("pointermove", e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  draw(x, y);
});
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);

// Touch events - FIX for offset with proper scaling
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  saveState();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (touch.clientX - rect.left) * scaleX;
  const y = (touch.clientY - rect.top) * scaleY;
  startDrawing(x, y);
}, false);
canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (touch.clientX - rect.left) * scaleX;
  const y = (touch.clientY - rect.top) * scaleY;
  draw(x, y);
}, false);
canvas.addEventListener("touchend", e => { e.preventDefault(); stopDrawing(); }, false);

document.getElementById('sizeSlider').addEventListener('input', (e) => {
  lineWidth = parseInt(e.target.value, 10);
  const newSize = 12 + (lineWidth - 1) * 0.5;
  const scale = newSize / 20;
  e.target.style.setProperty('--thumb-scale', scale);
});

document.getElementById('vibrancySlider').addEventListener('input', (e) => {
  colorVibrancy = parseInt(e.target.value, 10);
  updateCurrentColor();
});

function updateCurrentColor() {
  if (isEraser) return;
  
  let hex = baseColor.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  let finalR = Math.floor(r * (colorVibrancy / 100));
  let finalG = Math.floor(g * (colorVibrancy / 100));
  let finalB = Math.floor(b * (colorVibrancy / 100));
  
  currentColor = `#${(1 << 24 | finalR << 16 | finalG << 8 | finalB).toString(16).slice(1)}`;
  
  const vibrancySlider = document.getElementById('vibrancySlider');
  vibrancySlider.style.setProperty('--thumb-color', baseColor);
  vibrancySlider.style.setProperty('--current-vibrancy-color', currentColor);
}

// Kleurpicker
document.querySelectorAll(".color-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".color-option").forEach(o => o.classList.remove("active"));
    option.classList.add("active");

    const color = option.getAttribute("data-color");
    if (color === "eraser") {
      isEraser = true;
    } else {
      isEraser = false;
      baseColor = color;
      updateCurrentColor();
    }
  });
});

// Clear knop
document.getElementById("clearBtn").addEventListener("click", () => {
  saveState();
  drawButterflyTemplate();
  document.getElementById("status").textContent = "🗑️ Alles gewist!";
  setTimeout(() => document.getElementById("status").textContent = "", 2000);
});

// Send knop
document.getElementById("sendBtn").addEventListener("click", () => {
  // Set white background temporarily for export
  const originalBackground = canvas.style.background;
  canvas.style.background = "white";
  
  const dataURL = canvas.toDataURL();
  
  // Restore black background
  canvas.style.background = originalBackground;

  if (dataURL === blankCanvasDataURL) {
    document.getElementById("status").textContent = "✏️ Teken eerst iets moois!";
    setTimeout(() => document.getElementById("status").textContent = "", 3000);
    return;
  }

  fetch("/api/butterflies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataURL, color: currentColor, username })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("status").textContent = "🦋 Vlinder gestuurd!";
      drawButterflyTemplate();
      setTimeout(() => document.getElementById("status").textContent = "", 3000);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("status").textContent = "❌ Fout bij versturen!";
      setTimeout(() => document.getElementById("status").textContent = "", 3000);
    });
});

console.log("🦋 Vlinderkleuren gereed!");