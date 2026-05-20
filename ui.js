function renderAccounts(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!list.length) { container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Tidak ada akun.</p>'; return; }
    list.forEach(acc => {
        const card = document.createElement('div');
        card.className = 'account-card';
        card.innerHTML = `
            <img src="${acc.gambar[0]}" class="card-img" onerror="this.src='https://i.imgur.com/8Km9tTN.png'">
            <div class="card-body">
                <h3>🔥 ${acc.kode} - ${acc.rank}</h3>
                <span class="card-badge badge-${acc.status}">${acc.status}</span>
                <div class="card-info"><span>Lv.${acc.level}</span><span>💎 ${acc.diamond}</span><span>${acc.loginMethod}</span></div>
                <p class="card-price">Rp ${acc.harga.toLocaleString('id-ID')}</p>
                <p class="card-stock"><i class="fas fa-box"></i> Tersedia</p>
                <div class="card-actions">
                    <button class="btn-buy" onclick="beliSekarang('${acc.id}')"><i class="fas fa-bolt"></i> Beli</button>
                    <button class="btn-wishlist ${isInWishlist(acc.id)?'active':''}" onclick="toggleWishlistUI('${acc.id}',this)"><i class="fas fa-heart"></i></button>
                    <button class="btn-icon" onclick="addToCompare('${acc.id}')"><i class="fas fa-balance-scale"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderRecently() {
    const section = document.getElementById('recentlySection');
    const container = document.getElementById('recentlyAccounts');
    const recentIds = getRecently();
    const list = recentIds.map(id => accounts.find(a => a.id === id)).filter(Boolean);
    if (list.length) { section.style.display = 'block'; renderAccounts('recentlyAccounts', list); }
    else section.style.display = 'none';
}

function renderRecommendations() {
    const shuffled = [...accounts].sort(() => 0.5 - Math.random()).slice(0, 4);
    renderAccounts('recommendationAccounts', shuffled);
}

function beliSekarang(id) { addToCart(id); updateBadges(); showToast('Akun ditambahkan ke keranjang!', 'success'); }
function toggleWishlistUI(id, btn) { const active = toggleWishlist(id); btn.classList.toggle('active', active); updateBadges(); showToast(active ? 'Ditambahkan ke wishlist!' : 'Dihapus dari wishlist', 'info'); }

function updateBadges() {
    document.getElementById('cartBadge').textContent = getCart().length;
    document.getElementById('wishlistBadge').textContent = getWishlist().length;
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':'info-circle'}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// COMPARE
let compareList = [];
function addToCompare(id) {
    if (compareList.includes(id)) { showToast('Akun sudah ada di perbandingan'); return; }
    if (compareList.length >= 2) { compareList.shift(); }
    compareList.push(id);
    showToast('Ditambahkan ke perbandingan', 'info');
    if (compareList.length === 2) openCompareModal();
}
function openCompareModal() {
    const modal = document.getElementById('compareModal');
    const container = document.getElementById('compareContainer');
    container.innerHTML = compareList.map(id => {
        const acc = accounts.find(a => a.id === id);
        return acc ? `<div class="compare-card"><h3>${acc.kode}</h3><div class="compare-item"><span>Harga</span><strong>Rp${acc.harga.toLocaleString()}</strong></div><div class="compare-item"><span>Rank</span>${acc.rank}</div><div class="compare-item"><span>Diamond</span>${acc.diamond}</div><div class="compare-item"><span>Level</span>${acc.level}</div><div class="compare-item"><span>Bundle</span>${acc.bundle}</div></div>` : '';
    }).join('');
    modal.classList.add('active');
}
function closeCompareModal() { document.getElementById('compareModal').classList.remove('active'); compareList = []; }

// LIVE PURCHASE SIMULATION
function showLivePurchase() {
    const popup = document.getElementById('livePurchasePopup');
    const names = ['RizkyGaming','SultanFF','ProPlayer99','DiamondKing','ElitePass'];
    const accs = accounts.filter(a => a.status === 'available');
    if (!accs.length) return;
    const randAcc = accs[Math.floor(Math.random() * accs.length)];
    document.getElementById('purchaseUsername').textContent = names[Math.floor(Math.random() * names.length)];
    document.getElementById('purchaseAccount').textContent = randAcc.kode;
    popup.style.display = 'flex';
    setTimeout(() => { popup.style.display = 'none'; }, 5000);
}
setInterval(showLivePurchase, 15000);

// LIVE VISITOR
setInterval(() => {
    document.getElementById('visitorCount').textContent = Math.floor(Math.random() * 50) + 10;
}, 5000);