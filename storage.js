const STORAGE_KEYS = {
    CART: 'nyxff_cart',
    WISHLIST: 'nyxff_wishlist',
    THEME: 'nyxff_theme',
    FILTERS: 'nyxff_filters',
    RECENTLY: 'nyxff_recently',
    VIP: 'nyxff_vip',
    DAILY_REWARD: 'nyxff_daily_reward',
    USER: 'nyxff_user',
};

function getCart() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || []; }
function setCart(cart) { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)); }
function addToCart(id) { let c = getCart(); if (!c.includes(id)) { c.push(id); setCart(c); } }
function removeFromCart(id) { setCart(getCart().filter(i => i !== id)); }

function getWishlist() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST)) || []; }
function setWishlist(list) { localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list)); }
function toggleWishlist(id) {
    let list = getWishlist();
    list.includes(id) ? list = list.filter(i => i !== id) : list.push(id);
    setWishlist(list);
    return list.includes(id);
}
function isInWishlist(id) { return getWishlist().includes(id); }

function getRecently() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY)) || []; }
function addRecently(id) {
    let list = getRecently().filter(i => i !== id);
    list.unshift(id);
    if (list.length > 10) list.pop();
    localStorage.setItem(STORAGE_KEYS.RECENTLY, JSON.stringify(list));
}

function getTheme() { return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark'; }
function setTheme(theme) { localStorage.setItem(STORAGE_KEYS.THEME, theme); applyTheme(theme); }
function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); }

function getVipStatus() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.VIP)) || { active: false, since: null }; }
function setVipStatus(status) { localStorage.setItem(STORAGE_KEYS.VIP, JSON.stringify(status)); }

function getDailyReward() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_REWARD)) || { lastClaim: null }; }
function setDailyReward(data) { localStorage.setItem(STORAGE_KEYS.DAILY_REWARD, JSON.stringify(data)); }
function canClaimDaily() {
    const last = getDailyReward().lastClaim;
    if (!last) return true;
    return new Date() - new Date(last) > 86400000;
}