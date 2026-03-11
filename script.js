/* =====================================================
   CRYPTO FISHING TYCOON — script.js  v2.0
   Fish It Gileg Edition
   Fishing System: Cast → Wait(2–5s) → Bite Alert → Tarik → Get Fish
   ===================================================== */
'use strict';

// ══════════════════════════════════════
//  DATA
// ══════════════════════════════════════

const FISH_DATA = {
  Common: [
    { id:'doge',   name:'Dogecoin (DOGE)',              icon:'🐟', value:30,  size:'Kecil'  },
    { id:'shib',   name:'Shiba Inu (SHIB)',             icon:'🐟', value:25,  size:'Kecil'  },
    { id:'ada',    name:'Cardano (ADA)',                icon:'🐟', value:35,  size:'Kecil'  },
    { id:'matic',  name:'Polygon (MATIC)',              icon:'🐟', value:30,  size:'Kecil'  },
    { id:'usd_idr',name:'USD/IDR',                     icon:'🐟', value:40,  size:'Sedang' },
    { id:'eur_usd',name:'EUR/USD',                     icon:'🐟', value:38,  size:'Sedang' },
    { id:'bbri',   name:'Bank Rakyat Indonesia (BBRI)', icon:'🐟', value:45,  size:'Sedang' },
    { id:'tlkm',   name:'Telkom Indonesia (TLKM)',      icon:'🐟', value:42,  size:'Kecil'  },
  ],
  Uncommon: [
    { id:'sol',    name:'Solana (SOL)',               icon:'🐠', value:90,  size:'Sedang' },
    { id:'dot',    name:'Polkadot (DOT)',             icon:'🐠', value:85,  size:'Sedang' },
    { id:'avax',   name:'Avalanche (AVAX)',           icon:'🐠', value:95,  size:'Sedang' },
    { id:'link',   name:'Chainlink (LINK)',           icon:'🐠', value:88,  size:'Sedang' },
    { id:'gbp_usd',name:'GBP/USD',                   icon:'🐠', value:100, size:'Sedang' },
    { id:'usd_jpy',name:'USD/JPY',                   icon:'🐠', value:95,  size:'Sedang' },
    { id:'bbca',   name:'Bank Central Asia (BBCA)',   icon:'🐠', value:110, size:'Besar'  },
    { id:'bmri',   name:'Bank Mandiri (BMRI)',        icon:'🐠', value:105, size:'Besar'  },
  ],
  Rare: [
    { id:'bnb',    name:'Binance Coin (BNB)',           icon:'🐡', value:220, size:'Besar'  },
    { id:'ltc',    name:'Litecoin (LTC)',               icon:'🐡', value:200, size:'Besar'  },
    { id:'atom',   name:'Cosmos (ATOM)',                icon:'🐡', value:210, size:'Besar'  },
    { id:'xrp',    name:'XRP',                         icon:'🐡', value:230, size:'Besar'  },
    { id:'aud_usd',name:'AUD/USD',                     icon:'🐡', value:250, size:'Besar'  },
    { id:'usd_chf',name:'USD/CHF',                     icon:'🐡', value:240, size:'Besar'  },
    { id:'asii',   name:'Astra International (ASII)',   icon:'🐡', value:270, size:'Langka' },
    { id:'unvr',   name:'Unilever Indonesia (UNVR)',    icon:'🐡', value:260, size:'Langka' },
  ],
  Epic: [
    { id:'eth',    name:'Ethereum (ETH)',            icon:'🐙', value:550, size:'Langka'   },
    { id:'ripple', name:'Ripple (XRP)',              icon:'🐙', value:520, size:'Langka'   },
    { id:'eur_jpy',name:'EUR/JPY',                  icon:'🐙', value:580, size:'Langka'   },
    { id:'gbp_jpy',name:'GBP/JPY',                  icon:'🐙', value:570, size:'Langka'   },
    { id:'indf',   name:'Indofood (INDF)',           icon:'🐙', value:600, size:'Langka'   },
    { id:'ggrm',   name:'Gudang Garam (GGRM)',       icon:'🐙', value:620, size:'Langka'   },
  ],
  Legendary: [
    { id:'btc',    name:'Bitcoin (BTC)',                       icon:'🐋', value:1500, size:'Legendaris' },
    { id:'eth_btc',name:'ETH/BTC',                            icon:'🐋', value:1400, size:'Legendaris' },
    { id:'usd_cad',name:'USD/CAD',                            icon:'🐋', value:1300, size:'Legendaris' },
    { id:'bbni',   name:'Bank Negara Indonesia (BBNI)',        icon:'🐋', value:1600, size:'Legendaris' },
  ],
  Mythic: [
    { id:'satoshi',  name:'Satoshi Coin (MYTHIC)',   icon:'🐉', value:5000, size:'Legendaris' },
    { id:'qbtc',     name:'Quantum Bitcoin',         icon:'🐉', value:6000, size:'Legendaris' },
    { id:'gmwhale',  name:'Global Market Whale',     icon:'🐉', value:7500, size:'Legendaris' },
    { id:'idx_dragon',name:'IDX Dragon Asset',       icon:'🐉', value:8000, size:'Legendaris' },
  ],
};

const BASE_RATES = { Common:55, Uncommon:20, Rare:12, Epic:7, Legendary:4, Mythic:2 };

const MAPS = [
  { id:'river',  name:'River Market', emoji:'🌊', desc:'Saham Indonesia umum', bonus:{Common:10}, bonusLabel:'+10% Common', bg:'linear-gradient(135deg,#1a6fa3,#0d4a7a)' },
  { id:'forex',  name:'Forex Ocean',  emoji:'💹', desc:'Pair forex dunia',     bonus:{Rare:5},   bonusLabel:'+5% Rare',   bg:'linear-gradient(135deg,#0a4f7a,#062040)' },
  { id:'crypto', name:'Crypto Sea',   emoji:'🪙', desc:'Cryptocurrency top',   bonus:{Epic:5},   bonusLabel:'+5% Epic',   bg:'linear-gradient(135deg,#1a3a7a,#0a1f5a)' },
  { id:'abyss',  name:'Whale Abyss',  emoji:'🌌', desc:'Legendary & Mythic!', bonus:{Legendary:5},bonusLabel:'+5% Legendary',bg:'linear-gradient(135deg,#1a0a5a,#300a8a)' },
  { id:'trench', name:'Mythic Trench',emoji:'🐉', desc:'Zona eksklusif Mythic',bonus:{Mythic:3}, bonusLabel:'+3% Mythic', bg:'linear-gradient(135deg,#3a0a6a,#1a0040)' },
];

const RODS = [
  { id:'basic',  name:'Basic Rod',  icon:'🎣', bonus:{},           cost:0,     level:0 },
  { id:'trader', name:'Trader Rod', icon:'🎣', bonus:{Rare:2},     cost:500,   level:1 },
  { id:'sultan', name:'Sultan Rod', icon:'🎣', bonus:{Epic:3},     cost:1500,  level:2 },
  { id:'whale',  name:'Whale Rod',  icon:'🎣', bonus:{Legendary:3},cost:5000,  level:3 },
  { id:'god',    name:'God Rod',    icon:'🪄', bonus:{Mythic:4},   cost:20000, level:4 },
];

const BAITS = [
  { name:'Basic Bait',    waitMin:3000, waitMax:5000, cost:0 },
  { name:'Pro Bait',      waitMin:2000, waitMax:4000, cost:200 },
  { name:'Turbo Bait',    waitMin:1200, waitMax:3000, cost:700 },
  { name:'Legendary Bait',waitMin:700,  waitMax:1800, cost:2000 },
];

const PETS = [
  { id:'koi',    name:'Lucky Koi',       icon:'🐟', bonus:{Rare:2},            desc:'+2% Rare chance',          cost:1000 },
  { id:'octo',   name:'Smart Octopus',   icon:'🐙', bonus:{},    xpBonus:.1,   desc:'+10% XP Bonus',            cost:2000 },
  { id:'puffer', name:'Treasure Puffer', icon:'🐡', bonus:{},    coinBonus:.1, desc:'+10% Coin Reward',         cost:3500 },
  { id:'dragon', name:'Crypto Dragon',   icon:'🐉', bonus:{Legendary:2,Mythic:1},desc:'+2% Legendary +1% Mythic',cost:10000 },
];

const MISSIONS = [
  { id:'m1', title:'Pemancing Pemula',   desc:'Tangkap 5 ikan Common',         type:'catch_rarity', rarity:'Common',    target:5,  reward:{coins:200,xp:50},    rl:'+200💰 +50XP' },
  { id:'m2', title:'Trader Forex',       desc:'Tangkap 3 pair Forex',          type:'catch_specific', ids:['usd_idr','eur_usd','gbp_usd','usd_jpy','aud_usd','usd_chf','eur_jpy','gbp_jpy','usd_cad'], target:3, reward:{coins:400,xp:100}, rl:'+400💰 +100XP' },
  { id:'m3', title:'Crypto Hunter',      desc:'Tangkap 5 aset Crypto',         type:'catch_specific', ids:['doge','shib','ada','matic','sol','dot','avax','link','bnb','ltc','atom','xrp','eth','ripple','btc','eth_btc','satoshi','qbtc','gmwhale','idx_dragon'], target:5, reward:{coins:500,xp:150}, rl:'+500💰 +150XP' },
  { id:'m4', title:'Penangkap Legendaris',desc:'Tangkap 1 ikan Legendary',      type:'catch_rarity', rarity:'Legendary', target:1,  reward:{coins:1000,gems:2,xp:300}, rl:'+1000💰 +2💎 +300XP' },
  { id:'m5', title:'Sultan Saham',       desc:'Tangkap saham BBCA dan BBRI',   type:'catch_both', ids:['bbca','bbri'],             reward:{coins:600,xp:200},   rl:'+600💰 +200XP' },
  { id:'m6', title:'Pencari Mythic',     desc:'Tangkap 1 ikan Mythic',         type:'catch_rarity', rarity:'Mythic',    target:1,  reward:{coins:5000,gems:10,xp:1000}, rl:'+5000💰 +10💎 +1000XP' },
  { id:'m7', title:'Kolektor Aquarium',  desc:'Kumpulkan 20 ikan total',        type:'total_catch',                     target:20, reward:{coins:800,xp:250},   rl:'+800💰 +250XP' },
  { id:'m8', title:'Miliuner Crypto',    desc:'Kumpulkan 5000 💰 total',        type:'earn_coins',                      target:5000,reward:{gems:5,xp:500},     rl:'+5💎 +500XP' },
];

const XP_TABLE = [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6200,7600,9200,11000,13200,15700,18500,21600,25000,30000];

// ══════════════════════════════════════
//  STATE
// ══════════════════════════════════════
let G = {
  playerName:'Angler', coins:0, gems:0, xp:0, level:1,
  currentMap:'river', rodLevel:0, baitLevel:0,
  activePet:null, ownedPets:[],
  inventory:{},
  totalCaught:0, totalCoinsEarned:0, legendaryCount:0, mythicCount:0,
  missionProg:{}, missionClaimed:{},
  sfx:true, music:false,
};

// ══════════════════════════════════════
//  SAVE / LOAD
// ══════════════════════════════════════
function saveG() { try { localStorage.setItem('cft2_save', JSON.stringify(G)); } catch(e){} }
function loadG() {
  try {
    const s = localStorage.getItem('cft2_save');
    if (s) G = Object.assign(G, JSON.parse(s));
  } catch(e) {}
}
function resetG() { localStorage.removeItem('cft2_save'); location.reload(); }

// ══════════════════════════════════════
//  DROP RATE ENGINE
// ══════════════════════════════════════
function calcRates() {
  const r = { ...BASE_RATES };
  const rod = RODS[G.rodLevel];
  const map = MAPS.find(m => m.id === G.currentMap);
  const pet = G.activePet ? PETS.find(p => p.id === G.activePet) : null;

  // Level bonus reduces Common, boosts rares
  let lb = G.level >= 31 ? 10 : G.level >= 21 ? 6 : G.level >= 11 ? 4 : G.level >= 6 ? 2 : 0;
  r.Common = Math.max(0, r.Common - lb);
  r.Rare += lb * .4; r.Epic += lb * .3; r.Legendary += lb * .2; r.Mythic += lb * .1;

  // Rod bonus
  applyBonus(r, rod.bonus);
  // Pet bonus
  if (pet) applyBonus(r, pet.bonus || {});
  // Map bonus
  if (map) applyBonus(r, map.bonus, false); // map bonus doesn't reduce Common

  // Normalise
  const total = Object.values(r).reduce((a,b)=>a+b,0) || 1;
  const n = {};
  for (const [k,v] of Object.entries(r)) n[k] = (v/total)*100;
  return n;
}

function applyBonus(r, bonus, reduceCommon=true) {
  for (const [k,v] of Object.entries(bonus)) {
    r[k] = (r[k]||0) + v;
    if (reduceCommon) r.Common = Math.max(0, r.Common - v);
  }
}

function pickRarity() {
  const rates = calcRates();
  const roll = Math.random() * 100;
  let cum = 0;
  for (const rr of ['Mythic','Legendary','Epic','Rare','Uncommon','Common']) {
    cum += rates[rr] || 0;
    if (roll <= cum) return rr;
  }
  return 'Common';
}

function pickFish(rarity) {
  const pool = FISH_DATA[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ══════════════════════════════════════
//  FISHING STATE MACHINE
//  States: idle → waiting → bite → pulling → result
//          idle → waiting → miss (timeout)
// ══════════════════════════════════════

let fishingPhase = 'idle';
let waitTimer   = null;
let biteTimer   = null;   // 3s window to press TARIK
let pullTimer   = null;
let pullProgress = 0;
let pendingFish  = null;  // { rarity, fish }
let biteWindow  = 3000;   // ms player has to press Tarik
let biteCountdownInterval = null;
let pullInterval = null;

const PHASES = ['idle','waiting','bite','pulling','result','miss'];

function setPhase(ph) {
  fishingPhase = ph;
  PHASES.forEach(p => {
    const el = document.getElementById('st-' + p);
    if (!el) return;
    if (p === ph) { el.classList.remove('hidden'); el.classList.add('active'); }
    else          { el.classList.add('hidden'); el.classList.remove('active'); }
  });
}

// ── 1. CAST ──
function castLine() {
  if (fishingPhase !== 'idle') return;
  setPhase('waiting');

  // Extend rod line visual
  const rl = document.getElementById('rod-line-visual');
  if (rl) rl.classList.add('extended');

  // Bobber: normal float
  setBobberState('float');
  hideBiteAlert();
  stopBiteRings();

  // Start wait arc animation
  startWaitArc();

  const bait = BAITS[G.baitLevel];
  const wait = bait.waitMin + Math.random() * (bait.waitMax - bait.waitMin);
  waitTimer = setTimeout(triggerBite, wait);
}

// ── 2. BITE ──
function triggerBite() {
  if (fishingPhase !== 'waiting') return;
  stopWaitArc();

  // Pre-determine fish
  const rarity = pickRarity();
  pendingFish = { rarity, fish: pickFish(rarity) };

  setPhase('bite');

  // Visual: bobber dunks, ripples, alert
  setBobberState('biting');
  showBiteAlert();
  startBiteRings();
  playSFX('bite');

  // Start countdown bar
  startBiteCountdown();

  // Miss timer — if player doesn't press in time
  biteTimer = setTimeout(missedBite, biteWindow);
}

// ── 3a. TARIK (success) ──
function pullLine() {
  if (fishingPhase !== 'bite') return;
  clearTimeout(biteTimer);
  stopBiteCountdown();
  hideBiteAlert();
  stopBiteRings();
  setBobberState('float');
  playSFX('pull');

  // Show pulling phase
  setPhase('pulling');
  pullProgress = 0;
  updatePullBar();

  // Show fish icon for pulling phase
  const el = document.getElementById('pull-fish-icon');
  if (el && pendingFish) el.textContent = pendingFish.fish.icon;
}

// ── 3b. MISS ──
function missedBite() {
  if (fishingPhase !== 'bite') return;
  stopBiteCountdown();
  hideBiteAlert();
  stopBiteRings();
  setBobberState('float');
  pendingFish = null;
  playSFX('miss');
  setPhase('miss');

  const rl = document.getElementById('rod-line-visual');
  if (rl) rl.classList.remove('extended');
}

// ── 4. REEL (progress) ──
function reelIn() {
  if (fishingPhase !== 'pulling') return;
  pullProgress = Math.min(100, pullProgress + 22 + Math.random() * 8);
  updatePullBar();
  playSFX('reel');

  if (pullProgress >= 100) {
    setTimeout(catchFish, 150);
  }
}

function updatePullBar() {
  const fill = document.getElementById('pull-bar-fill');
  const pct  = document.getElementById('pull-pct');
  if (fill) fill.style.width = pullProgress + '%';
  if (pct)  pct.textContent  = Math.floor(pullProgress) + '%';
}

// ── 5. CATCH ──
function catchFish() {
  if (!pendingFish) { setPhase('idle'); return; }
  const { rarity, fish } = pendingFish;
  pendingFish = null;
  pullProgress = 0;

  // Coin calc
  let value = fish.value;
  const pet = G.activePet ? PETS.find(p => p.id === G.activePet) : null;
  if (pet && pet.coinBonus) value = Math.round(value * (1 + pet.coinBonus));

  // XP calc
  const xpMap = { Common:10, Uncommon:20, Rare:40, Epic:80, Legendary:200, Mythic:500 };
  let xp = xpMap[rarity] || 10;
  if (pet && pet.xpBonus) xp = Math.round(xp * (1 + pet.xpBonus));

  // Gems
  let gems = rarity === 'Epic' ? 1 : rarity === 'Legendary' ? 3 : rarity === 'Mythic' ? 10 : 0;

  // Update state
  G.inventory[fish.id] = (G.inventory[fish.id] || 0) + 1;
  G.totalCaught++;
  if (rarity === 'Legendary') G.legendaryCount++;
  if (rarity === 'Mythic')    G.mythicCount++;
  G.coins += value;
  G.gems  += gems;
  G.totalCoinsEarned += value;
  addXP(xp);
  updateMissions(fish, rarity);
  saveG();

  // Show result
  showResult(fish, rarity, value, xp, gems);
  playSFX(rarity);

  const rl = document.getElementById('rod-line-visual');
  if (rl) rl.classList.remove('extended');
}

// ── CANCEL ──
function cancelCast() {
  clearTimeout(waitTimer);
  clearTimeout(biteTimer);
  stopWaitArc();
  stopBiteCountdown();
  hideBiteAlert();
  stopBiteRings();
  setBobberState('float');
  pendingFish = null;
  const rl = document.getElementById('rod-line-visual');
  if (rl) rl.classList.remove('extended');
  setPhase('idle');
}

// ── RESULT DISPLAY ──
function showResult(fish, rarity, coins, xp, gems) {
  setPhase('result');

  const card = document.getElementById('result-card');
  if (card) {
    card.className = 'result-card rc-' + rarity;
  }

  setText('result-fish-icon', fish.icon);
  setText('res-rarity', rarity.toUpperCase());
  setText('res-size', fish.size || 'Sedang');
  setText('result-fish-name', fish.name);
  setText('res-coins', '+' + coins + ' 💰');
  setText('res-xp', '+' + xp + ' XP');

  const bonusEl = document.getElementById('res-bonus-text');
  if (bonusEl) {
    let bonus = '';
    if (gems > 0) bonus += '+' + gems + ' 💎  ';
    if (rarity === 'Mythic') bonus += '🌈 MYTHIC CATCH!';
    else if (rarity === 'Legendary') bonus += '⭐ LEGENDARY!';
    bonusEl.textContent = bonus;
  }

  spawnSparkles(rarity);
  updateHUD();
}

// ── SPARKLES ──
function spawnSparkles(rarity) {
  const container = document.getElementById('result-sparkles');
  if (!container) return;
  container.innerHTML = '';

  const count = rarity === 'Mythic' ? 20 : rarity === 'Legendary' ? 14 : rarity === 'Epic' ? 10 : 6;
  const colors = {
    Common:'#6bcb4a', Uncommon:'#4fa8d8', Rare:'#a855f7',
    Epic:'#f39c12', Legendary:'#ef4444', Mythic:'#f093fb'
  };
  const col = colors[rarity] || '#fff';

  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.cssText = `
      left:${30+Math.random()*40}%;top:${20+Math.random()*60}%;
      background:${col};width:${4+Math.random()*5}px;height:${4+Math.random()*5}px;
      --sx:${(Math.random()-.5)*120}px;--sy:${(Math.random()-.5)*100}px;
      animation-delay:${Math.random()*0.3}s;
    `;
    container.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
}

// ══════════════════════════════════════
//  BOBBER VISUAL STATES
// ══════════════════════════════════════
function setBobberState(state) {
  const obj = document.getElementById('bobber-obj');
  if (!obj) return;
  obj.classList.remove('biting');
  if (state === 'biting') obj.classList.add('biting');
}

function showBiteAlert() {
  const el = document.getElementById('bite-alert-box');
  if (el) el.classList.add('show');
}
function hideBiteAlert() {
  const el = document.getElementById('bite-alert-box');
  if (el) el.classList.remove('show');
}

function startBiteRings() {
  [1,2].forEach(i => {
    const el = document.getElementById('ring' + i);
    if (el) el.classList.add('animate');
  });
}
function stopBiteRings() {
  [1,2].forEach(i => {
    const el = document.getElementById('ring' + i);
    if (el) el.classList.remove('animate');
  });
}

// ══════════════════════════════════════
//  WAIT ARC ANIMATION (SVG circle)
// ══════════════════════════════════════
let waitArcInterval = null;
let waitArcProgress = 0;

function startWaitArc() {
  waitArcProgress = 0;
  const arc = document.getElementById('wait-arc');
  if (arc) arc.style.strokeDashoffset = '213';

  const bait = BAITS[G.baitLevel];
  const totalMs = (bait.waitMin + bait.waitMax) / 2;
  const step = 213 / (totalMs / 50); // decrease per 50ms tick

  clearInterval(waitArcInterval);
  waitArcInterval = setInterval(() => {
    waitArcProgress = Math.min(waitArcProgress + step, 213);
    const arc2 = document.getElementById('wait-arc');
    if (arc2) arc2.style.strokeDashoffset = 213 - waitArcProgress;
    if (waitArcProgress >= 213) clearInterval(waitArcInterval);
  }, 50);
}

function stopWaitArc() {
  clearInterval(waitArcInterval);
  const arc = document.getElementById('wait-arc');
  if (arc) arc.style.strokeDashoffset = '213';
}

// ══════════════════════════════════════
//  BITE COUNTDOWN BAR
// ══════════════════════════════════════
let biteCountStart = 0;

function startBiteCountdown() {
  biteCountStart = Date.now();
  const bar = document.getElementById('bite-countdown-bar');
  if (bar) bar.style.width = '100%';

  clearInterval(biteCountdownInterval);
  biteCountdownInterval = setInterval(() => {
    const elapsed = Date.now() - biteCountStart;
    const pct = Math.max(0, 100 - (elapsed / biteWindow) * 100);
    const bar2 = document.getElementById('bite-countdown-bar');
    if (bar2) bar2.style.width = pct + '%';
    if (pct <= 0) clearInterval(biteCountdownInterval);
  }, 40);
}

function stopBiteCountdown() {
  clearInterval(biteCountdownInterval);
  const bar = document.getElementById('bite-countdown-bar');
  if (bar) bar.style.width = '100%';
}

// ══════════════════════════════════════
//  XP & LEVELING
// ══════════════════════════════════════
function addXP(amount) {
  G.xp += amount;
  let leveled = false;
  while (G.level < XP_TABLE.length - 1 && G.xp >= XP_TABLE[G.level]) {
    G.level++;
    leveled = true;
  }
  if (leveled) showLevelUp();
  updateHUD();
}

function showLevelUp() {
  setText('levelup-text', '🎉 Kamu sekarang Level ' + G.level + '!');
  const bonusEl = document.getElementById('levelup-bonus');
  if (bonusEl) {
    const bonus = G.level >= 31 ? '+10% rare bonus!' : G.level >= 21 ? '+6% rare bonus!' : G.level >= 11 ? '+4% rare bonus!' : G.level >= 6 ? '+2% rare bonus!' : '';
    bonusEl.textContent = bonus;
  }
  showModal('levelup-modal');
  playSFX('levelup');
}

function xpProgress() {
  const curr = XP_TABLE[G.level-1] || 0;
  const next = XP_TABLE[G.level]   || XP_TABLE[XP_TABLE.length-1];
  return Math.min(((G.xp - curr)/(next - curr)) * 100, 100);
}

// ══════════════════════════════════════
//  HUD UPDATE
// ══════════════════════════════════════
function updateHUD() {
  setText('hud-coins', fmt(G.coins));
  setText('hud-gems',  fmt(G.gems));
  setText('hud-level', 'Lv.' + G.level);
  setText('hud-name',  G.playerName);
  setText('hud-xp-label', fmt(G.xp) + 'xp');
  setText('market-coins', fmt(G.coins));

  const xpFill = $('hud-xp-fill');
  if (xpFill) xpFill.style.width = xpProgress() + '%';

  const map = MAPS.find(m => m.id === G.currentMap);
  if (map) {
    setText('map-chip', map.emoji + ' ' + map.name);
    setText('current-map-badge', map.name);
  }

  const rod = RODS[G.rodLevel];
  if (rod) { setText('cur-rod-name', rod.name); setText('cur-rod-icon', rod.icon); }

  // Stats chips
  setText('stat-catches',   G.totalCaught);
  setText('stat-xp',        fmt(G.xp));
  setText('stat-legendary', G.legendaryCount);
  setText('stat-mythic',    G.mythicCount);

  // Upgrade buttons
  const nr = RODS[G.rodLevel+1];
  setText('rod-cost', nr ? fmt(nr.cost) : 'MAX');
  const nb = BAITS[G.baitLevel+1];
  setText('bait-cost', nb ? fmt(nb.cost) : 'MAX');

  const rodBtn = $('btn-upgrade-rod');
  if (rodBtn) rodBtn.disabled = !nr || G.coins < nr.cost;
  const baitBtn = $('btn-upgrade-bait');
  if (baitBtn) baitBtn.disabled = !nb || G.coins < nb.cost;
}

// ══════════════════════════════════════
//  AQUARIUM
// ══════════════════════════════════════
function renderAquarium(filter='all') {
  const grid = $('aquarium-grid');
  if (!grid) return;

  const all = getAllFish();
  const shown = filter === 'all' ? all : all.filter(f => f.rarity === filter);

  setText('aq-count', Object.values(G.inventory).reduce((a,b)=>a+b,0) + ' ikan');

  if (!shown.length) {
    grid.innerHTML = `<div class="empty-state"><span>🎣</span><p>${filter==='all'?'Belum ada ikan! Ayo mancing dulu!':'Tidak ada ikan '+filter}</p></div>`;
    return;
  }

  grid.innerHTML = shown.map(({fish,rarity,count}) => `
    <div class="fish-card rarity-${rarity}">
      <div class="fc-icon">${fish.icon}</div>
      <div class="fc-name">${fish.name}</div>
      <div class="fc-qty">×${count}</div>
      <div class="fc-rarity tag-${rarity}">${rarity}</div>
    </div>
  `).join('');
}

function getAllFish() {
  const result = [];
  for (const [id, count] of Object.entries(G.inventory)) {
    if (count <= 0) continue;
    for (const [rarity, arr] of Object.entries(FISH_DATA)) {
      const fish = arr.find(f => f.id === id);
      if (fish) { result.push({fish, rarity, count}); break; }
    }
  }
  return result;
}

function getFishById(id) {
  for (const [rarity, arr] of Object.entries(FISH_DATA)) {
    const fish = arr.find(f => f.id === id);
    if (fish) return { fish, rarity };
  }
  return null;
}

// ══════════════════════════════════════
//  MARKET
// ══════════════════════════════════════
function renderSell() {
  const grid = $('market-sell-grid');
  if (!grid) return;
  const all = getAllFish();
  if (!all.length) { grid.innerHTML = `<div class="empty-state"><span>🐟</span><p>Inventori kosong</p></div>`; return; }
  grid.innerHTML = all.map(({fish,rarity,count}) => `
    <div class="mfc rarity-${rarity}">
      <div class="mfc-icon">${fish.icon}</div>
      <div class="mfc-name">${fish.name}</div>
      <div class="fc-rarity tag-${rarity}">${rarity}</div>
      <div class="mfc-qty">×${count}</div>
      <div class="mfc-price">💰 ${fish.value}</div>
      <button class="btn-sell" data-id="${fish.id}">📤 Jual</button>
    </div>
  `).join('');
  grid.querySelectorAll('.btn-sell').forEach(b => b.addEventListener('click', () => sellFish(b.dataset.id)));
}

function renderBuy() {
  const grid = $('market-buy-grid');
  if (!grid) return;
  const stock = [...FISH_DATA.Common.slice(0,3), ...FISH_DATA.Uncommon.slice(0,2), ...FISH_DATA.Rare.slice(0,1)];
  grid.innerHTML = stock.map(fish => {
    const rarity = rarityOf(fish.id);
    const price = Math.round(fish.value * 1.5);
    return `
      <div class="mfc">
        <div class="mfc-icon">${fish.icon}</div>
        <div class="mfc-name">${fish.name}</div>
        <div class="fc-rarity tag-${rarity}">${rarity}</div>
        <div class="mfc-price">💰 ${price}</div>
        <button class="btn-buy-npc" data-id="${fish.id}" data-price="${price}">📥 Beli</button>
      </div>
    `;
  }).join('');
  grid.querySelectorAll('.btn-buy-npc').forEach(b => b.addEventListener('click', () => buyFish(b.dataset.id, +b.dataset.price)));
}

function sellFish(id) {
  if (!(G.inventory[id] > 0)) return;
  const f = getFishById(id);
  if (!f) return;
  G.inventory[id]--;
  if (!G.inventory[id]) delete G.inventory[id];
  G.coins += f.fish.value;
  showToast('📤 Dijual: ' + f.fish.name + '  +' + f.fish.value + '💰');
  updateHUD(); renderSell(); saveG();
}

function buyFish(id, price) {
  if (G.coins < price) { showToast('💸 Coin tidak cukup!'); return; }
  G.coins -= price;
  G.inventory[id] = (G.inventory[id]||0) + 1;
  const f = getFishById(id);
  showToast('📥 Dibeli: ' + (f ? f.fish.name : id));
  updateHUD(); renderBuy(); saveG();
}

function rarityOf(id) {
  for (const [rarity, arr] of Object.entries(FISH_DATA)) if (arr.find(f=>f.id===id)) return rarity;
  return 'Common';
}

// ══════════════════════════════════════
//  MISSIONS
// ══════════════════════════════════════
function updateMissions(fish, rarity) {
  MISSIONS.forEach(m => {
    if (G.missionClaimed[m.id]) return;
    const p = G.missionProg[m.id] || 0;
    if (m.type === 'catch_rarity'   && rarity === m.rarity)   G.missionProg[m.id] = Math.min(p+1, m.target);
    if (m.type === 'catch_specific' && m.ids.includes(fish.id)) G.missionProg[m.id] = Math.min(p+1, m.target);
    if (m.type === 'catch_both') {
      const s = G.missionProg[m.id+'_s'] || {};
      if (m.ids.includes(fish.id)) s[fish.id] = true;
      G.missionProg[m.id+'_s'] = s;
      G.missionProg[m.id] = Object.keys(s).length;
    }
    if (m.type === 'total_catch') G.missionProg[m.id] = G.totalCaught;
    if (m.type === 'earn_coins')  G.missionProg[m.id] = G.totalCoinsEarned;
  });
  renderMissions();
}

function renderMissions() {
  const list = $('missions-list');
  if (!list) return;

  const ready = MISSIONS.filter(m => {
    const p = G.missionProg[m.id]||0;
    const t = m.target || (m.ids?m.ids.length:1);
    return !G.missionClaimed[m.id] && p >= t;
  }).length;
  setText('mission-progress', ready + ' siap klaim');

  list.innerHTML = MISSIONS.map(m => {
    const p = G.missionProg[m.id]||0;
    const t = m.target||(m.ids?m.ids.length:1);
    const pct = Math.min((p/t)*100,100);
    const done = p >= t;
    const claimed = G.missionClaimed[m.id];
    return `
      <div class="mission-card ${claimed?'claimed':done?'done':''}">
        <div class="mc-head">
          <div class="mc-title">${claimed?'✅ ':done?'🎉 ':'🎯 '}${m.title}</div>
          <div class="mc-reward">${m.rl}</div>
        </div>
        <div class="mc-desc">${m.desc}</div>
        <div class="mc-pbar"><div class="mc-pfill" style="width:${pct}%"></div></div>
        <div class="mc-foot">
          <div class="mc-count">${Math.min(p,t)} / ${t}</div>
          <button class="btn-claim" data-id="${m.id}" ${!done||claimed?'disabled':''}>${claimed?'✓ Claimed':done?'🎁 Klaim!':'Belum...'}</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.btn-claim').forEach(b => {
    if (!b.disabled) b.addEventListener('click', () => claimMission(b.dataset.id));
  });
}

function claimMission(id) {
  const m = MISSIONS.find(x => x.id === id);
  if (!m || G.missionClaimed[id]) return;
  G.missionClaimed[id] = true;
  if (m.reward.coins) G.coins += m.reward.coins;
  if (m.reward.gems)  G.gems  += m.reward.gems;
  if (m.reward.xp)    addXP(m.reward.xp);
  showToast('🎉 Mission selesai! ' + m.rl);
  updateHUD(); renderMissions(); saveG();
}

// ══════════════════════════════════════
//  PETS
// ══════════════════════════════════════
function renderPets() {
  const grid = $('pets-grid');
  if (!grid) return;
  const ap = G.activePet ? PETS.find(p=>p.id===G.activePet) : null;
  setText('pet-active-name', ap ? ap.icon+' '+ap.name+' aktif' : 'Tidak ada pet aktif');

  grid.innerHTML = PETS.map(pet => {
    const owned  = G.ownedPets.includes(pet.id);
    const active = G.activePet === pet.id;
    return `
      <div class="pet-card ${active?'active-pet':owned?'owned':'locked'}">
        <div class="pet-icon">${pet.icon}</div>
        <div class="pet-name">${pet.name}</div>
        <div class="pet-bonus-text">${pet.desc}</div>
        <div class="pet-status-tag ${active?'pst-active':owned?'pst-owned':'pst-cost'}">
          ${active?'⭐ Aktif':owned?'✓ Dimiliki':'💰 '+fmt(pet.cost)}
        </div>
        ${owned
          ? `<button class="btn-equip" data-id="${pet.id}">${active?'Lepas':'Pasang'}</button>`
          : `<button class="btn-buy-pet" data-id="${pet.id}">Beli ${fmt(pet.cost)}💰</button>`
        }
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.btn-equip').forEach(b => b.addEventListener('click',()=>equipPet(b.dataset.id)));
  grid.querySelectorAll('.btn-buy-pet').forEach(b => b.addEventListener('click',()=>buyPet(b.dataset.id)));
}

function equipPet(id) {
  G.activePet = G.activePet===id ? null : id;
  const pet = PETS.find(p=>p.id===id);
  showToast(G.activePet ? pet.icon+' '+pet.name+' dipasang!' : 'Pet dilepas');
  renderPets(); updateHUD(); saveG();
}

function buyPet(id) {
  const pet = PETS.find(p=>p.id===id);
  if (!pet) return;
  if (G.ownedPets.includes(id)) { showToast('Sudah punya!'); return; }
  if (G.coins < pet.cost) { showToast('💸 Butuh '+fmt(pet.cost)+'💰'); return; }
  G.coins -= pet.cost;
  G.ownedPets.push(id);
  showToast('🎉 '+pet.icon+' '+pet.name+' berhasil dibeli!');
  renderPets(); updateHUD(); saveG();
}

// ══════════════════════════════════════
//  MAP
// ══════════════════════════════════════
function renderMap() {
  const grid = $('map-grid');
  if (!grid) return;
  grid.innerHTML = MAPS.map(m => `
    <div class="map-card ${G.currentMap===m.id?'selected':''}" data-id="${m.id}" style="background:${m.bg}">
      <div class="mc-emoji">${m.emoji}</div>
      <div class="mc-name">${m.name}</div>
      <div class="mc-desc">${m.desc}</div>
      <div class="mc-bonus">${m.bonusLabel}</div>
    </div>
  `).join('');
  grid.querySelectorAll('.map-card').forEach(c => c.addEventListener('click',()=>selectMap(c.dataset.id)));
}

function selectMap(id) {
  G.currentMap = id;
  const m = MAPS.find(x=>x.id===id);
  showToast('🗺️ Pindah ke '+m.name);
  renderMap(); updateHUD(); saveG();
}

// ══════════════════════════════════════
//  UPGRADES
// ══════════════════════════════════════
function upgradeRod() {
  const nr = RODS[G.rodLevel+1];
  if (!nr)          { showToast('🎣 Rod sudah MAX!'); return; }
  if (G.coins<nr.cost){ showToast('💸 Butuh '+fmt(nr.cost)+'💰'); return; }
  G.coins -= nr.cost; G.rodLevel++;
  showToast('⬆️ Upgrade ke '+nr.name+'!');
  updateHUD(); saveG();
}

function upgradeBait() {
  const nb = BAITS[G.baitLevel+1];
  if (!nb)           { showToast('🪱 Bait sudah MAX!'); return; }
  if (G.coins<nb.cost){ showToast('💸 Butuh '+fmt(nb.cost)+'💰'); return; }
  G.coins -= nb.cost; G.baitLevel++;
  showToast('⬆️ Upgrade ke '+nb.name+'!');
  updateHUD(); saveG();
}

// ══════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════
function renderSettings() {
  const sd = $('stats-display');
  if (sd) sd.innerHTML = `
    Total tangkapan: ${G.totalCaught}<br>
    Coin diperoleh: ${fmt(G.totalCoinsEarned)}💰<br>
    Legendary: ${G.legendaryCount} · Mythic: ${G.mythicCount}<br>
    Rod: ${RODS[G.rodLevel].name}<br>
    Bait: ${BAITS[G.baitLevel].name}
  `;
  const ni = $('player-name-input');
  if (ni) ni.value = G.playerName;
  const si = $('toggle-sfx');
  if (si) si.checked = G.sfx;
  const mi = $('toggle-music');
  if (mi) mi.checked = G.music;
}

// ══════════════════════════════════════
//  SFX (Web Audio API)
// ══════════════════════════════════════
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playSFX(type) {
  if (!G.sfx) return;
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);

    const cfg = {
      bite:      { f:660, f2:880,  t:'sine',     d:.2,  v:.25 },
      pull:      { f:440, f2:660,  t:'triangle', d:.15, v:.2  },
      reel:      { f:330, f2:440,  t:'sine',     d:.08, v:.1  },
      miss:      { f:220, f2:110,  t:'sawtooth', d:.3,  v:.15 },
      Common:    { f:440, f2:550,  t:'sine',     d:.22, v:.2  },
      Uncommon:  { f:523, f2:660,  t:'sine',     d:.28, v:.22 },
      Rare:      { f:659, f2:880,  t:'triangle', d:.32, v:.25 },
      Epic:      { f:784, f2:1047, t:'triangle', d:.42, v:.28 },
      Legendary: { f:1047,f2:1568, t:'square',   d:.55, v:.2  },
      Mythic:    { f:1319,f2:2093, t:'sawtooth', d:.85, v:.18 },
      levelup:   { f:880, f2:1320, t:'sine',     d:.55, v:.28 },
    }[type] || { f:440, f2:550, t:'sine', d:.2, v:.2 };

    osc.type = cfg.t;
    osc.frequency.setValueAtTime(cfg.f,  ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(cfg.f2, ctx.currentTime + cfg.d);
    gain.gain.setValueAtTime(cfg.v, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.d);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + cfg.d + 0.01);
  } catch(e) {}
}

// ══════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════
let toastTimer = null;
function showToast(msg) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 350);
  }, 2400);
}

function showModal(id) {
  const el = $(id);
  if (el) { el.classList.remove('hidden'); el.classList.add('active'); }
}
function hideModal(id) {
  const el = $(id);
  if (el) { el.classList.add('hidden'); el.classList.remove('active'); }
}

function setText(id, txt) { const el=$(id); if(el) el.textContent=txt; }
function $(id) { return document.getElementById(id); }

function fmt(n) {
  n = Math.floor(n);
  if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
  if (n >= 1000)    return (n/1000).toFixed(1)+'K';
  return n.toString();
}

// ══════════════════════════════════════
//  TAB SWITCHING
// ══════════════════════════════════════
const TABS = ['fishing','aquarium','market','missions','pets','map','settings'];

function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  TABS.forEach(t => {
    const el = $('tab-' + t);
    if (!el) return;
    if (t === tab) { el.classList.remove('hidden'); el.classList.add('active'); }
    else           { el.classList.add('hidden'); el.classList.remove('active'); }
  });

  if (tab === 'aquarium') renderAquarium();
  if (tab === 'market')   { renderSell(); renderBuy(); }
  if (tab === 'missions') renderMissions();
  if (tab === 'pets')     renderPets();
  if (tab === 'map')      renderMap();
  if (tab === 'settings') renderSettings();
}

// ══════════════════════════════════════
//  MARKET TAB SWITCH
// ══════════════════════════════════════
function initMarketTabs() {
  document.querySelectorAll('.market-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.market-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const t = btn.dataset.mtab;
      ['sell','buy'].forEach(p => {
        const el = $('mtab-' + p);
        if (!el) return;
        if (p === t) { el.classList.remove('hidden'); el.classList.add('active'); }
        else         { el.classList.add('hidden'); el.classList.remove('active'); }
      });
      if (t === 'sell') renderSell();
      if (t === 'buy')  renderBuy();
    });
  });
}

// ══════════════════════════════════════
//  AQUARIUM FILTER
// ══════════════════════════════════════
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAquarium(btn.dataset.filter);
    });
  });
}

// ══════════════════════════════════════
//  INIT
// ══════════════════════════════════════
function init() {
  loadG();

  // Start game
  $('btn-start').addEventListener('click', () => {
    $('splash-screen').classList.add('hidden');
    $('splash-screen').classList.remove('active');
    $('game-wrapper').classList.remove('hidden');
    setPhase('idle');
    updateHUD();
    renderMissions();

    // unlock AudioContext on first interaction
    try { getAudioCtx(); } catch(e){}
  });

  // Nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // ─── FISHING BUTTONS ───
  $('btn-cast').addEventListener('click', castLine);
  $('btn-cancel').addEventListener('click', cancelCast);
  $('btn-pull').addEventListener('click', pullLine);
  $('btn-miss-retry').addEventListener('click', () => setPhase('idle'));
  $('btn-reel').addEventListener('click', reelIn);
  // Touch support for reel (tap repeatedly)
  $('btn-reel').addEventListener('touchstart', e => { e.preventDefault(); reelIn(); }, { passive:false });
  $('btn-continue').addEventListener('click', () => setPhase('idle'));

  // Upgrades
  $('btn-upgrade-rod').addEventListener('click', upgradeRod);
  $('btn-upgrade-bait').addEventListener('click', upgradeBait);

  // Level up modal
  $('btn-levelup-close').addEventListener('click', () => hideModal('levelup-modal'));

  // Settings
  $('toggle-sfx').addEventListener('change', e => { G.sfx = e.target.checked; saveG(); });
  $('toggle-music').addEventListener('change', e => { G.music = e.target.checked; saveG(); });
  $('player-name-input').addEventListener('input', e => {
    G.playerName = e.target.value.trim() || 'Angler';
    updateHUD(); saveG();
  });

  // Reset
  $('btn-reset').addEventListener('click', () => showModal('confirm-modal'));
  $('btn-confirm-yes').addEventListener('click', resetG);
  $('btn-confirm-no').addEventListener('click', () => hideModal('confirm-modal'));

  // Sub-systems
  initMarketTabs();
  initFilters();

  // Starter bonus
  if (!G.totalCaught && !G.coins) {
    G.coins = 100;
    showToast('🎣 Selamat datang! Kamu dapat 100💰 starter!');
    saveG();
  }

  updateHUD();

  // Unlock AudioContext on any touch (iOS requirement)
  document.addEventListener('touchstart', () => {
    try { const ctx = getAudioCtx(); if (ctx.state==='suspended') ctx.resume(); } catch(e){}
  }, { once:true, passive:true });
}

document.addEventListener('DOMContentLoaded', init);
