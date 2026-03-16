// Verbind met Raspberry Pi server (verander 'rpi.local' naar je RPi hostname of IP)
const SOCKET_URL = 'http://rpi.local:3000'; // of http://192.168.x.x:3000
const socket = io(SOCKET_URL);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let currentColor = "#ff69b4";
let lineWidth = 15;

// Clipping path voor de vlinder vorm
let clippingPath;

function createClippingPath() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  clippingPath = new Path2D();
  
  // Bovenvleugels (links)
  clippingPath.bezierCurveTo(
    centerX - 120, centerY - 40,
    centerX - 150, centerY - 100,
    centerX - 100, centerY - 130
  );
  clippingPath.bezierCurveTo(
    centerX - 80, centerY - 110,
    centerX - 70, centerY - 60,
    centerX - 60, centerY - 20
  );
  clippingPath.bezierCurveTo(
    centerX - 80, centerY - 30,
    centerX - 100, centerY - 20,
    centerX - 100, centerY + 10
  );
  clippingPath.bezierCurveTo(
    centerX - 120, centerY - 10,
    centerX - 130, centerY - 40,
    centerX - 120, centerY - 40
  );
  
  // Ondervleugels (links)
  clippingPath.bezierCurveTo(
    centerX - 90, centerY + 20,
    centerX - 110, centerY + 60,
    centerX - 80, centerY + 100
  );
  clippingPath.bezierCurveTo(
    centerX - 60, centerY + 90,
    centerX - 50, centerY + 50,
    centerX - 50, centerY + 20
  );
  clippingPath.bezierCurveTo(
    centerX - 70, centerY + 25,
    centerX - 80, centerY + 20,
    centerX - 90, centerY + 20
  );
  
  // Lichaam
  clippingPath.ellipse(centerX, centerY - 20, 12, 40, 0, 0, Math.PI * 2);
  
  // Bovenvleugels (rechts)
  clippingPath.bezierCurveTo(
    centerX + 120, centerY - 40,
    centerX + 150, centerY - 100,
    centerX + 100, centerY - 130
  );
  clippingPath.bezierCurveTo(
    centerX + 80, centerY - 110,
    centerX + 70, centerY - 60,
    centerX + 60, centerY - 20
  );
  clippingPath.bezierCurveTo(
    centerX + 80, centerY - 30,
    centerX + 100, centerY - 20,
    centerX + 100, centerY + 10
  );
  clippingPath.bezierCurveTo(
    centerX + 120, centerY - 10,
    centerX + 130, centerY - 40,
    centerX + 120, centerY - 40
  );
  
  // Ondervleugels (rechts)
  clippingPath.bezierCurveTo(
    centerX + 90, centerY + 20,
    centerX + 110, centerY + 60,
    centerX + 80, centerY + 100
  );
  clippingPath.bezierCurveTo(
    centerX + 60, centerY + 90,
    centerX + 50, centerY + 50,
    centerX + 50, centerY + 20
  );
  clippingPath.bezierCurveTo(
    centerX + 70, centerY + 25,
    centerX + 80, centerY + 20,
    centerX + 90, centerY + 20
  );
}

// Functie om canvas leeg te maken
function drawButterflyTemplate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Teken vlinder bij het laden
drawButterflyTemplate();

document.querySelectorAll(".color-option").forEach(el => {
  el.addEventListener("click", (e) => {
    document.querySelectorAll(".color-option").forEach(c => c.classList.remove("active"));
    e.target.classList.add("active");
    currentColor = e.target.dataset.color;
  });
});

// Pointer events - vrij tekenen in de vlinder
canvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Alleen tekenen als binnen vlinder
  if (isPointInPath(x, y)) {
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
});

canvas.addEventListener("pointermove", (e) => {
  if(!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Alleen tekenen als binnen vlinder
  if (isPointInPath(x, y)) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  }
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
});

canvas.addEventListener("pointerleave", () => {
  drawing = false;
});

// Helper: check of punt in vlinder zit (nu altijd true omdat geen template)
function isPointInPath(x, y) {
  return true;
}


document.getElementById("clearBtn").addEventListener("click", () => {
  drawButterflyTemplate();
  document.getElementById("status").textContent = "Vlinder gereset!";
  setTimeout(() => document.getElementById("status").textContent = "", 2000);
});

document.getElementById("sendBtn").addEventListener("click", () => {
  const dataURL = canvas.toDataURL();
  socket.emit("draw_butterfly", { image: dataURL, color: currentColor });
  document.getElementById("status").textContent = "✨ Vlinder gestuurd naar de tuin!";
  setTimeout(() => drawButterflyTemplate(), 500);
  setTimeout(() => document.getElementById("status").textContent = "", 3000);
});

// Mouse fallback
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (isPointInPath(x, y)) {
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if(!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (isPointInPath(x, y)) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
});

canvas.addEventListener("mouseleave", () => {
  drawing = false;
});

// Touch events
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  drawing = true;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  if (isPointInPath(x, y)) {
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
}, false);

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if(!drawing) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  if (isPointInPath(x, y)) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}, false);

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  drawing = false;
}, false);

console.log("🦋 Vlinderkleuren gereed!");
