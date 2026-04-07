// Send knop — vervang het bestaande sendBtn event listener blok hiermee
document.getElementById("sendBtn").addEventListener("click", () => {
  const originalBackground = canvas.style.background;
  canvas.style.background = "white";

  const dataURL = canvas.toDataURL();

  canvas.style.background = originalBackground;

  if (dataURL === blankCanvasDataURL) {
    document.getElementById("status").textContent = "✏️ Teken eerst iets moois!";
    setTimeout(() => document.getElementById("status").textContent = "", 3000);
    return;
  }

  document.getElementById("status").textContent = "⏳ Versturen...";

  fetch("/api/butterflies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataURL, color: currentColor, username })
  })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
      if (status === 451 && data.blocked) {
        // Blocked by moderation
        document.getElementById("status").textContent =
          `🚫 Geblokkeerd: ${data.reason}. Je inzending wordt bekeken door een moderator. Pas je tekening aan en probeer opnieuw.`;
        // Don't clear the canvas — let them edit and resubmit
      } else {
        // Success
        document.getElementById("status").textContent = "🦋 Vlinder gestuurd!";
        drawButterflyTemplate();
        setTimeout(() => document.getElementById("status").textContent = "", 3000);
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("status").textContent = "❌ Fout bij versturen!";
      setTimeout(() => document.getElementById("status").textContent = "", 3000);
    });
});
