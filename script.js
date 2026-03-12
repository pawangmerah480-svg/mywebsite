// Data pesan
const messages = [
    {
        sender: 'Mama',
        text: 'Selamat ulang tahun ya sayang 🎂\nSemoga sehat selalu, panjang umur, dan semua impianmu tercapai.\nMama selalu bangga sama kamu ❤️',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
        sender: 'Kakak Perempuan',
        text: 'Happy birthday adekku 🎉\nSemoga kamu makin dewasa dan makin sukses ke depannya.\nJangan lupa tetap jadi adik yang baik ya 😄',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
        sender: 'Kakak Laki-Laki',
        text: 'HBD bro 🔥\nSemoga makin kuat menghadapi hidup dan semua targetmu tercapai.\nGas terus jangan malas!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
];

let currentMessageIndex = 0;
let typingTimeout;
let confettiAnimation;
let musicPlaying = false;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const typingStatus = document.getElementById('typingStatus');
const musicToggle = document.getElementById('musicToggle');
const birthdayMusic = document.getElementById('birthdayMusic');
const giftBtn = document.getElementById('giftBtn');
const celebrateBtn = document.getElementById('celebrateBtn');
const memoryBtn = document.getElementById('memoryBtn');
const giftPopup = document.getElementById('giftPopup');
const galleryPopup = document.getElementById('galleryPopup');
const closeGiftPopup = document.getElementById('closeGiftPopup');
const closeGalleryPopup = document.getElementById('closeGalleryPopup');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');

// Set canvas size
function setCanvasSize() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Typing animation
function showTyping() {
    typingStatus.style.display = 'flex';
}

function hideTyping() {
    typingStatus.style.display = 'none';
}

// Type message effect
async function typeMessage(message, element) {
    const textElement = element.querySelector('.message-text');
    const fullText = message.text;
    textElement.textContent = '';
    
    for (let i = 0; i < fullText.length; i++) {
        textElement.textContent += fullText[i];
        await new Promise(resolve => setTimeout(resolve, 50));
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Add message to chat
function addMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-sender">${message.sender}</div>
            <div class="message-text"></div>
            <div class="message-time">${message.time}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    typeMessage(message, messageDiv);
}

// Start message sequence
function startMessageSequence() {
    if (currentMessageIndex < messages.length) {
        showTyping();
        
        typingTimeout = setTimeout(() => {
            hideTyping();
            addMessage(messages[currentMessageIndex]);
            currentMessageIndex++;
            
            // Check if all messages are sent
            if (currentMessageIndex === messages.length) {
                setTimeout(() => {
                    startCelebration();
                }, 1000);
            } else {
                setTimeout(startMessageSequence, 2000);
            }
        }, 2000);
    }
}

// Celebration effects
function startCelebration() {
    startConfetti();
    createBalloons();
    createSparkles();
}

// Confetti effect
function startConfetti() {
    const particles = [];
    const colors = ['#f2d74e', '#95c3de', '#ff9a9e', '#fad0c4', '#fbc2eb'];
    
    function createParticle() {
        return {
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            size: Math.random() * 10 + 5,
            speed: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360
        };
    }
    
    for (let i = 0; i < 100; i++) {
        particles.push(createParticle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        particles.forEach(particle => {
            particle.y += particle.speed;
            particle.rotation += 0.5;
            
            if (particle.y > confettiCanvas.height) {
                Object.assign(particle, createParticle());
            }
            
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate((particle.rotation * Math.PI) / 180);
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            ctx.restore();
        });
        
        confettiAnimation = requestAnimationFrame(animate);
    }
    
    animate();
}

// Create balloons
function createBalloons() {
    const balloons = [];
    
    for (let i = 0; i < 10; i++) {
        const balloon = document.createElement('div');
        balloon.style.cssText = `
            position: fixed;
            bottom: -50px;
            left: ${Math.random() * 100}%;
            width: 40px;
            height: 50px;
            background: ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)]};
            border-radius: 50%;
            animation: float ${Math.random() * 3 + 4}s linear infinite;
            z-index: 99;
            pointer-events: none;
        `;
        
        // Add string
        const string = document.createElement('div');
        string.style.cssText = `
            position: absolute;
            bottom: -10px;
            left: 50%;
            width: 2px;
            height: 30px;
            background: #999;
            transform: translateX(-50%);
        `;
        
        balloon.appendChild(string);
        document.body.appendChild(balloon);
        balloons.push(balloon);
    }
    
    // Clean up balloons after animation
    setTimeout(() => {
        balloons.forEach(balloon => balloon.remove());
    }, 10000);
}

// Create sparkles
function createSparkles() {
    const sparkles = [];
    
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: fixed;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            width: 5px;
            height: 5px;
            background: white;
            border-radius: 50%;
            animation: sparkle ${Math.random() * 1 + 1}s ease-in-out infinite;
            z-index: 101;
            pointer-events: none;
        `;
        
        document.body.appendChild(sparkle);
        sparkles.push(sparkle);
    }
    
    // Add keyframe animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-100vh) rotate(10deg); opacity: 0; }
        }
        
        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Clean up sparkles
    setTimeout(() => {
        sparkles.forEach(sparkle => sparkle.remove());
    }, 3000);
}

// Music control
musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
        birthdayMusic.pause();
        musicToggle.textContent = '🔈';
    } else {
        birthdayMusic.play().catch(e => console.log('Audio play failed:', e));
        musicToggle.textContent = '🔊';
    }
    musicPlaying = !musicPlaying;
});

// Gift button
giftBtn.addEventListener('click', () => {
    giftPopup.style.display = 'flex';
});

closeGiftPopup.addEventListener('click', () => {
    giftPopup.style.display = 'none';
});

// Celebrate button
celebrateBtn.addEventListener('click', () => {
    startCelebration();
});

// Memory button
memoryBtn.addEventListener('click', () => {
    galleryPopup.style.display = 'flex';
});

closeGalleryPopup.addEventListener('click', () => {
    galleryPopup.style.display = 'none';
});

// Close popups when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === giftPopup) {
        giftPopup.style.display = 'none';
    }
    if (e.target === galleryPopup) {
        galleryPopup.style.display = 'none';
    }
});

// Auto scroll to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    startMessageSequence();
    
    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message';
    welcomeMessage.innerHTML = `
        <div class="message-content" style="background: rgba(255, 255, 255, 0.8);">
            <div class="message-sender">🎉 Sistem</div>
            <div class="message-text">Pesan ucapan akan muncul sebentar lagi...</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
    chatMessages.appendChild(welcomeMessage);
    
    // Simulate typing indicator
    setTimeout(scrollToBottom, 100);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (confettiAnimation) {
        cancelAnimationFrame(confettiAnimation);
    }
    clearTimeout(typingTimeout);
});