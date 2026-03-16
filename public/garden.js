// Verbind met Render backend
const socket = io();

let butterflyCount = 0;

// Identify as garden client
socket.emit('identify', { type: 'garden' });

// Listen for new butterflies from the draw page
socket.on('new_butterfly', (data) => {
  butterflyCount++;
  document.getElementById('count').textContent = butterflyCount;
  
  const img = document.createElement("img");
  img.src = data.image;
  img.className = "vlinder";
  document.body.appendChild(img);

  const startX = Math.random() * (window.innerWidth - 100);
  const startY = Math.random() * (window.innerHeight - 100);
  img.style.left = startX + "px";
  img.style.top = startY + "px";

  setTimeout(() => {
    const endX = Math.random() * (window.innerWidth - 100);
    const endY = Math.random() * (window.innerHeight - 100);
    const duration = 4 + Math.random() * 3;
    img.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration}s`;
    img.style.transform = `translate(${endX-startX}px, ${endY-startY}px) rotate(${Math.random()*360}deg)`;
  }, 300);

  const duration = 7 + Math.random() * 3;
  setTimeout(() => {
    img.style.opacity = '0';
  }, duration * 800);

  setTimeout(() => {
    img.remove();
    butterflyCount--;
    document.getElementById('count').textContent = butterflyCount;
  }, duration * 1000);
});
    
    // Draw flowers
    flowers.forEach(flower => {
        ctx.font = `${flower.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(flower.emoji, flower.x, flower.y);
    });


// Butterfly class
class Butterfly {
    constructor(imageData, color) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.targetX = Math.random() * canvas.width;
        this.targetY = Math.random() * canvas.height;
        this.createdAt = Date.now();
        this.duration = 4000 + Math.random() * 3000; // 4-7 seconds
        this.rotation = 0;
        this.targetRotation = Math.random() * 360;
        this.wingFlap = 0;
        this.opacity = 1;
        this.size = 1;
        this.image = null;
        
        // Load image from data
        this.image = new Image();
        this.image.onload = () => {
            console.log('🖼️ Butterfly image loaded');
        };
        this.image.onerror = () => {
            console.error('❌ Failed to load butterfly image');
        };
        this.image.src = imageData;
        
        // Animate in
        this.animateIn = true;
        this.animateInTime = 0;
    }
    
    update() {
        const elapsed = Date.now() - this.createdAt;
        const progress = Math.min(elapsed / this.duration, 1);
        
        // Animate in
        if (this.animateIn && progress < 0.1) {
            this.size = progress * 10;
            this.animateInTime = progress;
        } else {
            this.animateIn = false;
            this.size = 1;
        }
        
        // Move towards target
        const easeProgress = easeInOutCubic(progress);
        this.x = this.x + (this.targetX - this.x) * (easeProgress - (this.animateInTime || 0));
        this.y = this.y + (this.targetY - this.y) * (easeProgress - (this.animateInTime || 0));
        
        // Rotate towards target
        let rotDiff = this.targetRotation - this.rotation;
        if (rotDiff > 180) rotDiff -= 360;
        if (rotDiff < -180) rotDiff += 360;
        this.rotation += rotDiff * (progress - (this.animateInTime || 0));
        
        // Wing flapping
        this.wingFlap = Math.sin(Date.now() / 100) * 15;
        
        // Fade out at the end
        if (progress > 0.9) {
            this.opacity = 1 - ((progress - 0.9) / 0.1);
        }
        
        return progress < 1;
    }
    
    draw() {
        ctx.save();
        
        // Set opacity
        ctx.globalAlpha = this.opacity;
        
        // Move to position
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.scale(this.size, this.size);
        
        // Draw butterfly image if loaded
        if (this.image && this.image.complete) {
            const imgWidth = 60;
            const imgHeight = 40;
            ctx.drawImage(this.image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        } else {
            // Fallback to emoji if image not loaded
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🦋', 0, 0);
        }
        
        ctx.restore();
    }
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Animation loop
function animate() {
    // Draw garden
    drawGarden();
    
    // Update and draw butterflies
    for (let i = butterflies.length - 1; i >= 0; i--) {
        const butterfly = butterflies[i];
        const isAlive = butterfly.update();
        
        if (isAlive) {
            butterfly.draw();
        } else {
            butterflies.splice(i, 1);
            butterflyCount--;
        }
    }
    
    // Update counter
    butterflyCounterDisplay.textContent = butterflies.length;
    
    requestAnimationFrame(animate);
}

animate();

// Receive new butterflies from server
socket.on('new_butterfly', (data) => {
    console.log('🦋 New butterfly received!');
    console.log('   Color:', data?.color);
    console.log('   Image size:', data?.image?.length);
    
    if (!data || !data.image) {
        console.error('❌ Invalid butterfly data!');
        return;
    }
    
    // Create butterfly
    const butterfly = new Butterfly(data.image, data.color);
    butterflies.push(butterfly);
    butterflyCount++;
    
    console.log(`✅ Butterfly added! Total: ${butterflies.length}`);
});

// Handle socket connection
socket.on('connect', () => {
    console.log('🦋 Connected to Vlindertuin server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
