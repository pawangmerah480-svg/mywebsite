// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Elemen-elemen
    const messagesContainer = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    const giftModal = document.getElementById('giftModal');
    const memoriesModal = document.getElementById('memoriesModal');
    const openGiftBtn = document.getElementById('openGiftBtn');
    const celebrateBtn = document.getElementById('celebrateAgainBtn');
    const memoriesBtn = document.getElementById('memoriesBtn');
    const musicBtn = document.getElementById('musicBtn');
    const bgMusic = document.getElementById('bgMusic');
    const closeGift = document.getElementById('closeGiftModal');
    const closeMemories = document.getElementById('closeMemoriesModal');
    const canvas = document.getElementById('confettiCanvas');
    let isPlaying = false;
    
    // Data pesan
    const messages = [
        { sender: 'Mama', text: 'Selamat ulang tahun ya sayang 🎂\nSemoga sehat selalu, panjang umur, dan semua impianmu tercapai.\nMama selalu bangga sama kamu ❤️', class: 'sender-mama' },
        { sender: 'Kakak Perempuan', text: 'Happy birthday adekku 🎉\nSemoga kamu makin dewasa dan makin sukses ke depannya.\nJangan lupa tetap jadi adik yang baik ya 😄', class: 'sender-kakak-perempuan' },
        { sender: 'Kakak Laki-Laki', text: 'HBD bro 🔥\nSemoga makin kuat menghadapi hidup dan semua targetmu tercapai.\nGas terus jangan malas!', class: 'sender-kakak-laki' }
    ];

    let currentMessageIndex = 0;
    let typingSpeed = 50; // ms per huruf

    // Fungsi untuk menampilkan pesan dengan efek mengetik
    function showNextMessage() {
        if (currentMessageIndex >= messages.length) {
            // Semua pesan selesai: matikan typing indicator, mulai confetti
            typingIndicator.style.display = 'none';
            startCelebration();
            return;
        }

        // Tampilkan indikator mengetik
        typingIndicator.style.display = 'flex';

        const msgData = messages[currentMessageIndex];
        
        // Buat elemen pesan (tampil kosong dulu)
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msgData.class}`;
        messageDiv.innerHTML = `<div class="message-header">${msgData.sender}</div><div class="message-content"></div>`;
        messagesContainer.appendChild(messageDiv);
        
        const contentDiv = messageDiv.querySelector('.message-content');
        let charIndex = 0;
        const fullText = msgData.text;

        // Fungsi ketik per karakter
        function typeChar() {
            if (charIndex < fullText.length) {
                contentDiv.innerHTML += fullText.charAt(charIndex);
                charIndex++;
                setTimeout(typeChar, typingSpeed);
                // Auto scroll ke bawah
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } else {
                // Selesai mengetik satu pesan, lanjut ke pesan berikutnya setelah jeda
                currentMessageIndex++;
                // Sembunyikan typing sebentar, lalu lanjut
                typingIndicator.style.display = 'none';
                setTimeout(() => {
                    showNextMessage();
                }, 800);
            }
        }

        // Mulai mengetik setelah jeda (simulasi orang mikir)
        setTimeout(typeChar, 500);
    }

    // Mulai semua pesan
    showNextMessage();

    // Efek confetti dan balon
    function startCelebration() {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#f9d8d4', '#f9e6d8', '#d4e1f9', '#f4c6d4', '#f7f0c3', '#a3d8f4'];

        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.2 - 100, // mulai dari atas
                size: Math.random() * 10 + 5,
                speedY: Math.random() * 3 + 2,
                speedX: (Math.random() - 0.5) * 1.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                type: Math.random() > 0.5 ? 'confetti' : 'balloon' // balon lebih besar
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let stillFalling = false;
            
            particles.forEach(p => {
                if (p.y < canvas.height + 50) {
                    stillFalling = true;
                }
                
                // Update posisi
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += 0.5;

                // Gambar sebagai kotak atau lingkaran (balon)
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI/180);
                
                if (p.type === 'confetti') {
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
                } else {
                    // Balon
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size/1.5, p.size, 0, 0, Math.PI*2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    // tali balon
                    ctx.beginPath();
                    ctx.moveTo(0, p.size-2);
                    ctx.lineTo(2, p.size+6);
                    ctx.strokeStyle = '#aaa';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                
                ctx.restore();

                // Kalau keluar layar, munculkan lagi dari bawah? tidak, biarkan jatuh
                if (p.y > canvas.height + 50) {
                    p.y = -50;
                    p.x = Math.random() * canvas.width;
                }
            });

            if (stillFalling) {
                requestAnimationFrame(draw);
            } else {
                // Jika berhenti, gambar ulang sedikit untuk menjaga efek
                setTimeout(() => requestAnimationFrame(draw), 500);
            }
        }

        draw();

        // Tambah sparkle sesekali
        setInterval(() => {
            if (Math.random() > 0.7) {
                for (let i = 0; i < 5; i++) {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height * 0.2,
                        size: Math.random() * 5 + 2,
                        speedY: Math.random() * 2 + 1,
                        speedX: (Math.random() - 0.5) * 1,
                        color: '#ffffaa',
                        rotation: 0,
                        type: 'confetti'
                    });
                }
            }
        }, 2000);
    }

    // Event tombol Buka Hadiah
    openGiftBtn.addEventListener('click', () => {
        giftModal.style.display = 'flex';
    });

    // Event tombol Rayakan Lagi
    celebrateBtn.addEventListener('click', () => {
        startCelebration();
    });

    // Tombol Lihat Kenangan
    memoriesBtn.addEventListener('click', () => {
        memoriesModal.style.display = 'flex';
    });

    // Tutup modal
    closeGift.addEventListener('click', () => {
        giftModal.style.display = 'none';
    });
    closeMemories.addEventListener('click', () => {
        memoriesModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === giftModal) giftModal.style.display = 'none';
        if (e.target === memoriesModal) memoriesModal.style.display = 'none';
    });

    // Musik
    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.innerHTML = '<i class="fas fa-play"></i> Putar Musik';
        } else {
            bgMusic.play().catch(e => console.log('Autoplay dicegah browser, user harus interaksi'));
            musicBtn.innerHTML = '<i class="fas fa-pause"></i> Jeda Musik';
        }
        isPlaying = !isPlaying;
    });

    // Atur ulang ukuran canvas saat resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Efek background partikel tambahan (dari CSS juga sudah ada)
});