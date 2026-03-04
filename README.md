# 🦋 Vlindertuin - Interactieve Vlinder-Tekentuin

Een real-time interactieve applicatie waarmee bezoekers vlinders kunnen tekenen en ze live zien rondvliegen in een gedeelde virtuele tuin. Perfect voor events, tentoonstellingen en educatieve doeleinden.

## 🚀 Features

### Tekenomgeving (draw.html)
- 600x400px canvas met gradient achtergrond
- 6 kleurkeuzes: roze, goud, blauw, groen, oranje, paars
- Smooth brush met 15px breedte en ronde eindjes
- Ondersteuning voor:
  - Mouse events (desktop)
  - Touch events (mobile/tablet)
  - Pointer events (Raspberry Pi touchscreen)
- Clear button + verzendbevestiging
- Real-time Socket.io communicatie

### Vlindertuin (garden.html)
- Fullscreen (100vw x 100vh) groene achtergrond
- 20 willekeurig geplaatste bloem emoji's als decoratie
- Vlinders verschijnen op random locatie
- Flutter-animatie (vleugels fladderen continu)
- Beweging naar random eindpunt in 4-7 seconden
- Rotatie-effect (0-360 graden)
- Fade-out en verdwijnt vanzelf
- Live vlinderteller rechtsboven
- Gedeelde ervaring: alle bezoekers zien dezelfde vlinders

### Landing Page (index.html)
- Twee knoppen: "Tekenen" & "Tuin"
- Paarse gradient achtergrond
- Responsive design

## 📋 Vereisten

- Node.js (v14 of hoger)
- npm

## 🛠️ Installatie

1. Dependencies installeren:
```bash
npm install
```

2. Server starten:
```bash
npm start
```

3. Openen in browser:
```
http://localhost:3000
```

## 📁 Projectstructuur

```
vlinder-world/
├── package.json
├── server.js
├── public/
│   ├── index.html      # Landing page
│   ├── draw.html       # Tekenomgeving
│   ├── garden.html     # Vlindertuin
│   ├── style.css       # Alle styling
│   ├── draw.js         # Drawing logic
│   └── garden.js       # Garden & butterfly animation
└── Ella/               # (Niet aanraken!)
```

## 🎨 Tech Stack

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: HTML5, CSS3, Canvas API, JavaScript
- **Real-time**: Socket.io WebSockets
- **Animatie**: Canvas + JavaScript requestAnimationFrame

## 📱 Browser Support

- ✅ Desktop: Chrome, Firefox, Safari, Edge
- ✅ Mobile: iOS Safari, Android Chrome
- ✅ Raspberry Pi touchscreen
- ✅ Responsive design

## 🌐 Deployment Opties

### Option 1: Lokaal (Raspberry Pi)
```bash
# Op Raspberry Pi
npm install
npm start

# Toegankelijk via: http://<pi-ip>:3000
```

### Option 2: GitHub Pages (Draw.html standalone)
- Upload `public/index.html` en `public/draw.html` naar GitHub Pages
- Draw werkt als offline tekentool
- Garden vereist server (werkt niet op static hosting)

### Option 3: Cloud Services
- Deploy met Heroku, Glitch, Replit etc.
- Zorg voor Socket.io support

## 🎮 Gebruik

1. **Thuis pagina**: Kies tussen Tekenen of Tuin
2. **Tekenomgeving**: 
   - Selecteer een kleur
   - Teken je vlinder
   - Klik "Verzenden naar tuin"
3. **Vlindertuin**: 
   - Bekijk alle vlinders vliegen
   - Vlinders verschijnen in real-time
   - Zie de teller stijgen

## 🔧 Configuratie

**Server poort**: Pas `server.js` aan (default: 3000)

**Canvas grootte**: Wijzig in `draw.html` en `draw.js`

**Animatie snelheid**: Pas in `garden.js` aan (`duration: 4000 + Math.random() * 3000`)

**Bloemen aantal**: Wijzig in `garden.js` (`for (let i = 0; i < 20; i++)`)

## 🐛 Troubleshooting

**Socket.io verbinding mislukt?**
- Controleer of server draait
- Zorg dat port 3000 niet geblokkeerd is
- Controleer firewall settings

**Tekening ziet er raar uit?**
- Refresh de pagina
- Controleer browser zoom (moet 100% zijn)

**Vlinders verschijnen niet?**
- Zorg dat je draw.html en garden.html tegelijk open hebt
- Check browser console op errors (F12)

## 📄 Licentie

MIT

## 👥 Credits

Gemaakt voor een interactieve vlindertuin ervaring!

---

**Veel plezier met Vlindertuin! 🦋🌻✨**
