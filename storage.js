// js/storage.js
const STORAGE_KEYS = {
    CART: 'nyxff_cart',
    WISHLIST: 'nyxff_wishlist',
    THEME: 'nyxff_theme',
    FILTERS: 'nyxff_filters',
    SCROLL_POS: 'nyxff_scroll',
    USER: 'nyxff_user',
};

function getCart() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || []; }
function setCart(cart) { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)); }
function addToCart(accountId) {
    let cart = getCart();
    if (!cart.includes(accountId)) { cart.push(accountId); setCart(cart); }
}
function removeFromCart(accountId) { setCart(getCart().filter(id => id !== accountId)); }
function isInCart(accountId) { return getCart().includes(accountId); }

function getWishlist() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST)) || []; }
function setWishlist(list) { localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list)); }
function toggleWishlist(accountId) {
    let list = getWishlist();
    if (list.includes(accountId)) list = list.filter(id => id !== accountId);
    else list.push(accountId);
    setWishlist(list);
    return list.includes(accountId);
}
function isInWishlist(accountId) { return getWishlist().includes(accountId); }

function getTheme() { return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark'; }
function setTheme(theme) { localStorage.setItem(STORAGE_KEYS.THEME, theme); applyTheme(theme); }
function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); }

function saveScrollPosition() { sessionStorage.setItem('scrollPos', window.scrollY); }
function restoreScrollPosition() { const pos = sessionStorage.getItem('scrollPos'); if (pos) window.scrollTo(0, parseInt(pos)); }

function saveFilters(filters) { sessionStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters)); }
function getSavedFilters() { return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.FILTERS)) || {}; }