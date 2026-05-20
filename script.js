// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getTheme());
    initNavigation();
    initEventListeners();
    initCountdown();
    renderAccounts('featuredAccounts', accounts.slice(0,4), true);
    renderAccounts('allAccountsGrid', accounts);
    renderTestimonialSlider();
    updateCartBadge();
    updateWishlistBadge();
    restoreScrollPosition();
    window.addEventListener('beforeunload', saveScrollPosition);
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 2000);
});

function initNavigation() {
    const links = document.querySelectorAll('.nav-link, .mobile-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
    document.getElementById('hamburgerBtn').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.toggle('active');
    });
}

function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link, .mobile-link').forEach(l => l.classList.remove('active'));
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) targetPage.classList.add('active');
    document.querySelectorAll(`[data-page="${page}"]`).forEach(l => l.classList.add('active'));
    if (page === 'marketplace') renderAccounts('allAccountsGrid', accounts);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initEventListeners() {
    document.getElementById('themeToggle').addEventListener('click', () => {
        const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
    document.getElementById('cartBtn').addEventListener('click', () => openCartModal());
    document.getElementById('wishlistBtn').addEventListener('click', () => openWishlistModal());
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.querySelectorAll('.filter-options select').forEach(select => {
        select.addEventListener('change', applyFilters);
    });
    document.getElementById('backToTop').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('backToTop');
        btn.style.display = window.scrollY > 500 ? 'block' : 'none';
    });
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const rank = document.getElementById('filterRank').value;
    const login = document.getElementById('filterLogin').value;
    const kategori = document.getElementById('filterKategori').value;
    const harga = document.getElementById('filterHarga').value;
    const status = document.getElementById('filterStatus').value;

    let filtered = accounts.filter(acc => {
        if (search && !acc.kode.toLowerCase().includes(search) && !acc.deskripsi.toLowerCase().includes(search) && !acc.bundle.toLowerCase().includes(search)) return false;
        if (rank && acc.rank !== rank) return false;
        if (login && acc.loginMethod !== login) return false;
        if (kategori && acc.kategori !== kategori) return false;
        if (status && acc.status !== status) return false;
        if (harga) {
            const [min, max] = harga.split('-').map(Number);
            if (acc.harga < min || acc.harga > max) return false;
        }
        return true;
    });
    renderAccounts('allAccountsGrid', filtered);
    document.getElementById('displayedCount').textContent = filtered.length;
    document.getElementById('availableCount').textContent = filtered.filter(a=>a.status==='available').length;
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.filter-options select').forEach(s => s.value = '');
    applyFilters();
}

function openCartModal() {
    const modal = document.getElementById('cartModal');
    const container = document.getElementById('cartItems');
    const cart = getCart();
    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = '<p>Keranjang kosong.</p>';
        document.getElementById('cartFooter').style.display = 'none';
    } else {
        let total = 0;
        cart.forEach(id => {
            const acc = accounts.find(a => a.id === id);
            if (acc) {
                total += acc.harga;
                container.innerHTML += `<div class="cart-item"><span>${acc.kode} - ${acc.rank}</span><span>Rp${acc.harga.toLocaleString()}</span><button onclick="removeFromCart('${id}');openCartModal();">Hapus</button></div>`;
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
    if (cart.length === 0) return;
    const message = `Halo admin, saya ingin membeli akun berikut:\n${cart.map(id => {
        const acc = accounts.find(a => a.id === id);
        return acc ? `- ${acc.kode} (Rp${acc.harga.toLocaleString()})` : '';
    }).join('\n')}`;
    openWhatsApp('admin', message);
}

function openLoginModal() { document.getElementById('loginModal').classList.add('active'); }
function closeLoginModal() { document.getElementById('loginModal').classList.remove('active'); }
function loginWithGoogle() { alert('Fitur login Google akan tersedia setelah integrasi Firebase.'); closeLoginModal(); }
function loginWithDiscord() { alert('Fitur login Discord akan tersedia setelah integrasi.'); closeLoginModal(); }

function initCountdown() {
    const endTime = new Date().getTime() + 86400000; // 24 jam
    const timer = document.getElementById('countdownTimer');
    setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;
        if (distance < 0) { timer.textContent = 'EXPIRED'; return; }
        const h = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
        const m = Math.floor((distance % (1000*60*60)) / (1000*60));
        const s = Math.floor((distance % (1000*60)) / 1000);
        timer.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }, 1000);
}

function toggleLiveChat() {
    document.getElementById('chatPanel').classList.toggle('open');
}
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `<div class="chat-msg user-msg"><p>${msg}</p></div>`;
    input.value = '';
    setTimeout(() => {
        chatMessages.innerHTML += `<div class="chat-msg admin-msg"><p>Terima kasih! Admin akan segera merespons.</p></div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
}
function handleChatEnter(e) { if (e.key === 'Enter') sendChatMessage(); }