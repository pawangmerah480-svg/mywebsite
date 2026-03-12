// Data pesan keluarga
const messages = [
    {
        sender: 'Mama',
        senderEmoji: '👩',
        text: 'Selamat ulang tahun ya sayang 🎂\nSemoga sehat selalu dan semua impianmu tercapai.\nMama selalu bangga sama kamu ❤️',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
        sender: 'Kakak Perempuan',
        senderEmoji: '👧',
        text: 'Happy birthday adekku 🎉\nSemoga makin dewasa dan semua cita-citamu tercapai.\nTetap jadi adik yang baik ya 😄',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
        sender: 'Kakak Laki-Laki',
        senderEmoji: '👦',
        text: 'HBD bro 🔥\nSemoga makin kuat menghadapi hidup dan makin sukses.\nGas terus jangan malas!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
];

// State management
let currentMessageIndex = 0;
let typingTimer;
let confettiAnimation;
let isCelebrating = false;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');
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

// Typing animation control
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Scroll to bottom function
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Type message character by character
async function typeMessage(element, text) {
    const messageText = element.querySelector('.message-text');
    messageText.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
        messageText.textContent += text[i];
        // Random delay between 40-60ms for realistic typing
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 40));
        scrollToBottom();
    }
}

// Create message bubble
function createMessageBubble(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="message-sender">
                <span>${message.senderEmoji}</span> ${message.sender}
            </div>
            <div class="message-text"></div>
            <div class="message-time">${message.time}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    return messageDiv;
}

// Send next message in sequence
function sendNextMessage() {
    if (currentMessageIndex < messages.length) {
        showTypingIndicator();
        
        typingTimer = setTimeout(async () => {
            hideTypingIndicator();
            
            const message = messages[currentMessageIndex];
            const messageElement = createMessageBubble(message);
            await typeMessage(messageElement, message.text);
            
            currentMessageIndex++;
            
            // Schedule next message
            if (currentMessageIndex < messages.length) {
                setTimeout(sendNextMessage, 2000);
            } else {
                // All messages sent, start celebration
                setTimeout(() => {
                    startCelebration();
                }, 1500);
            }
        }, 2000);
    }
}

// Celebration effects
function startCelebration() {
    if (!isCelebrating) {
        isCelebrating = true;
        startConfetti();
        createSparkles();
    }
}

// Confetti effect
function startConfetti() {
    const particles = [];
    const colors = [
        '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', 
        '#ec4899', '#f97316', '#06b6d4', '#84cc16'
    ];
    
    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2
        });
    }
    
    function animateConfetti() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        let stillFalling = false;
        
        particles.forEach(particle => {
            particle.y += particle.speed;
            particle.rotation += particle.rotationSpeed;
            
            if (particle.y < confettiCanvas.height) {
                stillFalling = true;
            }
            
            // Reset particle if it goes off screen
            if (particle.y > confettiCanvas.height) {
                particle.y = -particle.size;
                particle.x = Math.random() * confettiCanvas.width;
            }
            
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate((particle.rotation * Math.PI) / 180);
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            ctx.restore();
        });
        
        if (stillFalling || isCelebrating) {
            confettiAnimation = requestAnimationFrame(animateConfetti);
        }
    }
    
    animateConfetti();
}

// Create sparkle effects
function createSparkles() {
    const sparkles = [];
    
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: fixed;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 10px ${['#f59e0b', '#ef4444', '#3b82f6'][Math.floor(Math.random() * 3)]};
            animation: sparkleAnim ${Math.random() * 1 + 0.5}s ease-in-out infinite;
            z-index: 101;
            pointer-events: none;
        `;
        document.body.appendChild(sparkle);
        sparkles.push(sparkle);
    }
    
    // Add sparkle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkleAnim {
            0%, 100% { 
                opacity: 0; 
                transform: scale(0) rotate(0deg);
            }
            50% { 
                opacity: 1; 
                transform: scale(1.5) rotate(180deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Clean up sparkles after 3 seconds
    setTimeout(() => {
        sparkles.forEach(sparkle => sparkle.remove());
    }, 3000);
}

// Stop celebration
function stopCelebration() {
    isCelebrating = false;
    if (confettiAnimation) {
        cancelAnimationFrame(confettiAnimation);
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// Event Listeners
giftBtn.addEventListener('click', () => {
    giftPopup.style.display = 'flex';
});

celebrateBtn.addEventListener('click', () => {
    stopCelebration();
    isCelebrating = true;
    startConfetti();
    createSparkles();
    
    // Auto stop after 5 seconds
    setTimeout(() => {
        stopCelebration();
    }, 5000);
});

memoryBtn.addEventListener('click', () => {
    galleryPopup.style.display = 'flex';
});

closeGiftPopup.addEventListener('click', () => {
    giftPopup.style.display = 'none';
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

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    // Add welcome message
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'message';
    welcomeDiv.innerHTML = `
        <div class="message-bubble" style="background: linear-gradient(135deg, #667eea, #764ba2);">
            <div class="message-sender">
                <span>🎉</span> Sistem
            </div>
            <div class="message-text">Selamat ulang tahun! Keluarga akan mengirimkan ucapan...</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
    chatMessages.appendChild(welcomeDiv);
    scrollToBottom();
    
    // Start message sequence after 2 seconds
    setTimeout(sendNextMessage, 2000);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (confettiAnimation) {
        cancelAnimationFrame(confettiAnimation);
    }
    clearTimeout(typingTimer);
});