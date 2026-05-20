// js/ui.js
function renderAccounts(containerId, accountList = accounts, isFeatured = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const filtered = accountList.filter(acc => acc.status !== 'sold');
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Tidak ada akun ditemukan.</p>';
        return;
    }
    filtered.forEach(acc => {
        const card = document.createElement('div');
        card.className = 'account-card';
        card.innerHTML = `
            <img src="${acc.gambar[0]}" alt="${acc.kode}" class="card-img" onerror="this.src='https://i.imgur.com/8Km9tTN.png'">
            <div class="card-body">
                <h3 class="card-title">🔥 ${acc.kode} - ${acc.rank}</h3>
                <span class="card-badge badge-${acc.status}">${acc.status}</span>
                <div class="card-info">
                    <span>Lv.${acc.level}</span><span>💎 ${acc.diamond}</span><span>${acc.loginMethod}</span>
                </div>
                <p class="card-price">Rp ${acc.harga.toLocaleString('id-ID')}</p>
                <p class="card-stock"><i class="fas fa-box"></i> Tersedia</p>
                <div class="card-actions">
                    <button class="btn-buy" onclick="beliSekarang('${acc.id}')"><i class="fas fa-bolt"></i> Beli</button>
                    <button class="btn-wishlist ${isInWishlist(acc.id)?'active':''}" onclick="toggleWishlistUI('${acc.id}', this)"><i class="fas fa-heart"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    updateCartBadge();
    updateWishlistBadge();
}

function beliSekarang(accountId) {
    addToCart(accountId);
    updateCartBadge();
    alert('Akun ditambahkan ke keranjang!');
}

function toggleWishlistUI(accountId, btn) {
    const isActive = toggleWishlist(accountId);
    btn.classList.toggle('active', isActive);
    updateWishlistBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = getCart().length;
}
function updateWishlistBadge() {
    const badge = document.getElementById('wishlistBadge');
    if (badge) badge.textContent = getWishlist().length;
}

function renderTestimonialSlider() {
    const slider = document.getElementById('testimonialSlider');
    if (!slider) return;
    const testimonials = [
        { nama: 'RizkyGaming', bintang: 5, review: 'Akun sesuai deskripsi, proses cepat!', img: 'https://i.imgur.com/1.jpg' },
        { nama: 'SultanFF', bintang: 5, review: 'Mantap banget akunnya, recommend!', img: 'https://i.imgur.com/2.jpg' },
        { nama: 'ProPlayer99', bintang: 4, review: 'Bagus, cuma pengiriman agak lama.', img: 'https://i.imgur.com/3.jpg' }
    ];
    slider.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
            <div class="stars">${'★'.repeat(t.bintang)}</div>
            <p>"${t.review}"</p>
            <strong>- ${t.nama}</strong>
        </div>
    `).join('');
}

function openWhatsApp(context, message) {
    const phone = '6281234567890'; // Ganti dengan nomor admin
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function openLuckySpin() { document.getElementById('luckySpinModal').classList.add('active'); }
function closeLuckySpin() { document.getElementById('luckySpinModal').classList.remove('active'); }
function spinTheWheel() {
    const wheel = document.getElementById('spinWheel');
    const result = document.getElementById('spinResult');
    if (wheel.style.transform.includes('rotate')) return;
    const degrees = Math.floor(Math.random() * 3600) + 720;
    wheel.style.transform = `rotate(${degrees}deg)`;
    setTimeout(() => {
        const diskon = ['10%','20%','30%','5%','50%','15%','25%','Free!'][Math.floor(Math.random()*8)];
        result.textContent = `Selamat! Anda dapat diskon ${diskon}!`;
    }, 4000);
}