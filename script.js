// ==========================================
// 1. SISTEMA DE BAFORADAS DE DRAGÃO (CANVAS)
// ==========================================
const canvas = document.getElementById('breath-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let currentBreath = 'fire';

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const breathConfigs = {
    fire: {
        colors: ['#ffd700', '#ff8c00', '#ff4500', '#8a2be2'],
        speedY: () => -Math.random() * 3 - 1.5,
        speedX: () => (Math.random() - 0.5) * 2,
        size: () => Math.random() * 6 + 2,
        shape: 'circle'
    },
    lightning: {
        colors: ['#ffd700', '#fff700', '#b19cd9', '#ffffff'],
        speedY: () => (Math.random() - 0.5) * 8,
        speedX: () => (Math.random() - 0.5) * 12,
        size: () => Math.random() * 3 + 1,
        shape: 'bolt'
    },
    acid: {
        colors: ['#ccff00', '#ffd700', '#39ff14', '#4b0082'],
        speedY: () => Math.random() * 2.5 + 1,
        speedX: () => (Math.random() - 0.5) * 1.5,
        size: () => Math.random() * 7 + 3,
        shape: 'bubble'
    },
    arcane: {
        colors: ['#8a2be2', '#ffd700', '#da70d6', '#9400d3'],
        speedY: () => (Math.random() - 0.5) * 3,
        speedX: () => (Math.random() - 0.5) * 3,
        size: () => Math.random() * 5 + 2,
        shape: 'diamond'
    }
};

class BreathParticle {
    constructor() {
        const cfg = breathConfigs[currentBreath];
        this.x = Math.random() * canvas.width;
        this.y = currentBreath === 'acid' ? 0 : (currentBreath === 'fire' ? canvas.height : Math.random() * canvas.height);
        this.size = cfg.size();
        this.speedX = cfg.speedX();
        this.speedY = cfg.speedY();
        this.color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.005;
        this.shape = cfg.shape;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;

        if (this.shape === 'bolt') {
            this.speedX += (Math.random() - 0.5) * 4;
            this.speedY += (Math.random() - 0.5) * 4;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'bubble') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else if (this.shape === 'bolt') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.speedX * 2, this.y - this.speedY * 2);
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (this.shape === 'diamond') {
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        ctx.restore();
    }
}

function animateBreath() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Adiciona novas partículas continuamente
    for (let i = 0; i < 3; i++) {
        particles.push(new BreathParticle());
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animateBreath);
}

function setBreath(type) {
    currentBreath = type;
    particles = []; // Limpa a tela para a nova baforada
    
    // Atualiza o botão ativo
    document.querySelectorAll('.btn-breath').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${type}`).classList.add('active');
}

animateBreath();

// ==========================================
// 2. ANIMAÇÃO E ROLAGEM DO D20 DE D&D
// ==========================================
let isRolling = false;

function rollD20() {
    if (isRolling) return;
    isRolling = true;

    const d20Shape = document.getElementById('d20-shape');
    const d20Number = document.getElementById('d20-number');
    const resultText = document.getElementById('d20-result-text');

    d20Shape.classList.remove('rolling');
    void d20Shape.offsetWidth; // Reinicia a animação CSS
    d20Shape.classList.add('rolling');

    resultText.textContent = "Rolando os dados do destino...";

    // Efeito de números mudando rápido durante o giro
    let counter = 0;
    const interval = setInterval(() => {
        d20Number.textContent = Math.floor(Math.random() * 20) + 1;
        counter++;
        if (counter > 10) {
            clearInterval(interval);
            finalizeRoll();
        }
    }, 50);

    function finalizeRoll() {
        const finalRoll = Math.floor(Math.random() * 20) + 1;
        d20Number.textContent = finalRoll;
        isRolling = false;

        if (finalRoll === 20) {
            resultText.textContent = "🔥 20 NATURAL! Sucesso Crítico! A Wizards of the Coast já é sua!";
        } else if (finalRoll === 1) {
            resultText.textContent = "💀 1 NATURAL! Falha Crítica... Faltou comida para os 50 filhos hoje!";
        } else if (finalRoll >= 15) {
            resultText.textContent = `⚔️ ${finalRoll}! Sucesso absoluto na dominação mundial.`;
        } else {
            resultText.textContent = `🎲 ${finalRoll}! O plano segue conforme o previsto pelo conselho dos dragões.`;
        }
    }
}