const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let currentColor = "#ff69b4";
let lineWidth = 15;

let username = localStorage.getItem("username") || "Anonymous";

if (!localStorage.getItem("username")) {
  const name = prompt("Wat is je naam?");
  if (name) {
    username = name;
    localStorage.setItem("username", name);
  }
}

// Draw butterfly outline
function drawButterflyOutline() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;
  
  // Linksboven vleugel
  ctx.beginPath();
  ctx.moveTo(centerX-40, centerY-10);
  ctx.bezierCurveTo(centerX-120, centerY-40, centerX-150, centerY-100, centerX-100, centerY-130);
  ctx.bezierCurveTo(centerX-80, centerY-110, centerX-70, centerY-60, centerX-60, centerY-20);
  ctx.bezierCurveTo(centerX-80, centerY-30, centerX-100, centerY-20, centerX-40, centerY-10);
  ctx.stroke();
  
  // Linksonder vleugel
  ctx.beginPath();
  ctx.moveTo(centerX-40, centerY+10);
  ctx.bezierCurveTo(centerX-90, centerY+20, centerX-110, centerY+60, centerX-80, centerY+100);
  ctx.bezierCurveTo(centerX-60, centerY+90, centerX-50, centerY+50, centerX-50, centerY+20);
  ctx.bezierCurveTo(centerX-70, centerY+25, centerX-40, centerY+10, centerX-40, centerY+10);
  ctx.stroke();
  
  // Lichaam
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 8, 60, 0, 0, Math.PI*2);
  ctx.stroke();
  
  // Rechtsboven vleugel
  ctx.beginPath();
  ctx.moveTo(centerX+40, centerY-10);
  ctx.bezierCurveTo(centerX+120, centerY-40, centerX+150, centerY-100, centerX+100, centerY-130);
  ctx.bezierCurveTo(centerX+80, centerY-110, centerX+70, centerY-60, centerX+60, centerY-20);
  ctx.bezierCurveTo(centerX+80, centerY-30, centerX+100, centerY-20, centerX+40, centerY-10);
  ctx.stroke();
  
  // Rechtsonder vleugel
  ctx.beginPath();
  ctx.moveTo(centerX+40, centerY+10);
  ctx.bezierCurveTo(centerX+90, centerY+20, centerX+110, centerY+60, centerX+80, centerY+100);
  ctx.bezierCurveTo(centerX+60, centerY+90, centerX+50, centerY+50, centerX+50, centerY+20);
  ctx.bezierCurveTo(centerX+70, centerY+25, centerX+40, centerY+10, centerX+40, centerY+10);
  ctx.stroke();
}

// Clear canvas
function drawButterflyTemplate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawButterflyOutline();
}

drawButterflyTemplate();

// Tekenen functies
function startDrawing(x, y) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function draw(x, y) {
  if (!drawing) return;
  ctx.lineTo(x, y);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
}

// Pointer events
canvas.addEventListener("pointerdown", e => {
  const rect = canvas.getBoundingClientRect();
  startDrawing(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener("pointermove", e => {
  const rect = canvas.getBoundingClientRect();
  draw(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);

// Touch events
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
}, false);
canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  draw(touch.clientX - rect.left, touch.clientY - rect.top);
}, false);
canvas.addEventListener("touchend", e => { e.preventDefault(); stopDrawing(); }, false);

// Kleurpicker
document.querySelectorAll(".color-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".color-option").forEach(o => o.classList.remove("active"));
    option.classList.add("active");
    currentColor = option.getAttribute("data-color");
  });
});

// Clear knop
document.getElementById("clearBtn").addEventListener("click", () => {
  drawButterflyTemplate();
  document.getElementById("status").textContent = "Canvas cleared!";
  setTimeout(() => document.getElementById("status").textContent = "", 2000);
});

// Send knop
document.getElementById("sendBtn").addEventListener("click", () => {
  const dataURL = canvas.toDataURL();
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