document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getTheme());
    initNavigation();
    initEventListeners();
    initCountdown();
    initParticles();
    renderAccounts('featuredAccounts', accounts.filter(a => a.status === 'promo' || a.status === 'available').slice(0, 4));
    renderAccounts('allAccountsGrid', accounts);
    renderTestimonialSlider();
    renderRecently();
    renderRecommendations();
    updateBadges();
    checkDailyReward();
    setTimeout(() => document.getElementById('loadingScreen').classList.add('hidden'), 2000);
    document.getElementById('stickyBuyBtn').style.display = 'flex';
});

function initNavigation() {
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });
    document.getElementById('hamburgerBtn').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.toggle('active');
    });
}

function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link, .mobile-link').forEach(l => l.classList.remove('active'));
    const target = document.getElementById(`${page}-page`);
    if (target) target.classList.add('active');
    document.querySelectorAll(`[data-page="${page}"]`).forEach(l => l.classList.add('active'));
    if (page === 'marketplace') applyFilters();
    if (page === 'home') { renderRecently(); renderRecommendations(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initEventListeners() {
    document.getElementById('themeToggle').addEventListener('click', () => {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
        document.getElementById('themeToggle').innerHTML = getTheme() === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });
    document.getElementById('cartBtn').addEventListener('click', openCartModal);
    document.getElementById('wishlistBtn').addEventListener('click', openWishlistModal);
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.querySelectorAll('.filter-options select, #filterPriceMin, #filterPriceMax').forEach(el => el.addEventListener('change', applyFilters));
    document.getElementById('backToTop').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
    window.addEventListener('scroll', () => {
        document.getElementById('backToTop').style.display = window.scrollY > 500 ? 'block' : 'none';
    });
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const rank = document.getElementById('filterRank').value;
    const login = document.getElementById('filterLogin').value;
    const kategori = document.getElementById('filterKategori').value;
    const status = document.getElementById('filterStatus').value;
    const min = parseInt(document.getElementById('filterPriceMin').value) || 0;
    const max = parseInt(document.getElementById('filterPriceMax').value) || Infinity;

    let filtered = accounts.filter(acc => {
        if (search && !`${acc.kode} ${acc.deskripsi} ${acc.bundle}`.toLowerCase().includes(search)) return false;
        if (rank && acc.rank !== rank) return false;
        if (login && acc.loginMethod !== login) return false;
        if (kategori && acc.kategori !== kategori) return false;
        if (status && acc.status !== status) return false;
        if (acc.harga < min || acc.harga > max) return false;
        return true;
    });
    renderAccounts('allAccountsGrid', filtered);
    document.getElementById('displayedCount').textContent = filtered.length;
    document.getElementById('availableCount').textContent = filtered.filter(a => a.status === 'available').length;
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.filter-options select').forEach(s => s.value = '');
    document.getElementById('filterPriceMin').value = '';
    document.getElementById('filterPriceMax').value = '';
    applyFilters();
}

function openCartModal() {
    const modal = document.getElementById('cartModal');
    const container = document.getElementById('cartItems');
    const cart = getCart();
    container.innerHTML = '';
    if (!cart.length) {
        container.innerHTML = '<p>Keranjang kosong.</p>';
        document.getElementById('cartFooter').style.display = 'none';
    } else {
        let total = 0;
        cart.forEach(id => {
            const acc = accounts.find(a => a.id === id);
            if (acc) {
                total += acc.harga;
                container.innerHTML += `<div style="display:flex;justify-content:space-between;padding:0.5rem;">${acc.kode} - Rp${acc.harga.toLocaleString()} <button onclick="removeFromCart('${id}');openCartModal();">Hapus</button></div>`;
            }
        });
        document.getElementById('cartTotal').textContent = 'Rp' + total.toLocaleString();
        document.getElementById('cartFooter').style.display = 'block';
    }
    modal.classList.add('active');
}
function closeCartModal() { document.getElementById('cartModal').classList.remove('active'); }
function checkoutCart() {
    const cart = getCart();
    if (!cart.length) return;
    const msg = cart.map(id => { const a = accounts.find(ac => ac.id === id); return a ? `${a.kode} (Rp${a.harga})` : ''; }).join('\n');
    openWhatsApp('admin', `Halo, saya ingin beli:\n${msg}`);
}
function openWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    const container = document.getElementById('wishlistItems');
    const list = getWishlist().map(id => accounts.find(a => a.id === id)).filter(Boolean);
    container.innerHTML = list.length ? list.map(a => `<p>${a.kode} - ${a.rank} <button onclick="toggleWishlist('${a.id}');openWishlistModal();">Hapus</button></p>`).join('') : '<p>Wishlist kosong.</p>';
    modal.classList.add('active');
}
function closeWishlistModal() { document.getElementById('wishlistModal').classList.remove('active'); }

function openLoginModal() { document.getElementById('loginModal').classList.add('active'); }
function closeLoginModal() { document.getElementById('loginModal').classList.remove('active'); }
function loginWithGoogle() { showToast('Fitur login Google segera hadir.', 'info'); closeLoginModal(); }
function loginWithDiscord() { showToast('Fitur login Discord segera hadir.', 'info'); closeLoginModal(); }

function openWhatsApp(ctx, msg) { window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, '_blank'); }

function initCountdown() {
    const end = new Date().getTime() + 86400000;
    setInterval(() => {
        const now = Date.now(), dist = end - now;
        if (dist < 0) return document.getElementById('countdownTimer').textContent = 'EXPIRED';
        const h = Math.floor(dist / 3600000), m = Math.floor((dist % 3600000) / 60000), s = Math.floor((dist % 60000) / 1000);
        document.getElementById('countdownTimer').textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }, 1000);
}

function toggleLiveChat() { document.getElementById('chatPanel').classList.toggle('open'); }
function sendChatMessage() {
    const input = document.getElementById('chatInput'), msg = input.value.trim();
    if (!msg) return;
    const box = document.getElementById('chatMessages');
    box.innerHTML += `<div class="chat-msg user-msg"><p>${msg}</p></div>`;
    input.value = '';
    setTimeout(() => {
        box.innerHTML += `<div class="chat-msg admin-msg typing-animation"><p>Terima kasih! Admin akan merespons segera.</p></div>`;
        box.scrollTop = box.scrollHeight;
    }, 600);
}
function handleChatEnter(e) { if (e.key === 'Enter') sendChatMessage(); }
function quickReply(text) { document.getElementById('chatInput').value = text; sendChatMessage(); }

// LUCKY SPIN
function openLuckySpin() { document.getElementById('luckySpinModal').classList.add('active'); }
function closeLuckySpin() { document.getElementById('luckySpinModal').classList.remove('active'); }
function spinTheWheel() {
    const wheel = document.getElementById('spinWheel'), res = document.getElementById('spinResult');
    if (wheel.style.transform.includes('rotate')) return;
    const deg = Math.floor(Math.random() * 3600) + 720;
    wheel.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
        const prizes = ['10%','20%','30%','5%','50%','15%','25%','Free!'];
        res.textContent = `Selamat! Anda dapat diskon ${prizes[Math.floor(Math.random()*8)]}!`;
    }, 4000);
}

// DAILY REWARD
function checkDailyReward() {
    if (canClaimDaily()) {
        setTimeout(() => {
            document.getElementById('dailyRewardContent').innerHTML = `<div class="reward-icon"><i class="fas fa-gift"></i></div><p class="reward-text">Klaim hadiah harianmu!</p><button class="btn-primary" onclick="claimDailyReward()">Klaim Sekarang</button>`;
            document.getElementById('dailyRewardModal').classList.add('active');
        }, 3000);
    }
}
function claimDailyReward() {
    setDailyReward({ lastClaim: new Date().toISOString() });
    showToast('Hadiah harian diklaim! +100 Poin', 'success');
    closeDailyReward();
}
function closeDailyReward() { document.getElementById('dailyRewardModal').classList.remove('active'); }

// MUSIC
function toggleMusic() {
    const audio = document.getElementById('lobbyMusic');
    const player = document.getElementById('musicPlayerMini');
    if (audio.paused) {
        audio.play().catch(() => {});
        player.style.display = 'flex';
    } else {
        audio.pause();
        player.style.display = 'none';
    }
}
function adjustVolume(val) { document.getElementById('lobbyMusic').volume = val / 100; }

// PARTICLES
function initParticles() {
    const canvas = document.getElementById('particleCanvas'), ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const particles = Array.from({length: 50}, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1, dx: Math.random() * 0.5, dy: Math.random() * 0.5
    }));
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.dx; p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255,107,0,${Math.random()*0.5+0.2})`; ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
}

function renderTestimonialSlider() {
    const slider = document.getElementById('testimonialSlider');
    if (!slider) return;
    const data = [
        { nama: 'RizkyGaming', bintang: 5, review: 'Akun sesuai, proses cepat!' },
        { nama: 'SultanFF', bintang: 5, review: 'Mantap banget, recommend!' },
        { nama: 'ProPlayer99', bintang: 4, review: 'Bagus, pengiriman agak lama.' },
    ];
    slider.innerHTML = data.map(t => `<div class="testimonial-card"><div class="stars">${'★'.repeat(t.bintang)}</div><p>"${t.review}"</p><strong>- ${t.nama}</strong></div>`).join('');
}