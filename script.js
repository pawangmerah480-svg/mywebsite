/* ═══════════════════════════════════════════════
   CRYPTO FISHING TYCOON — script.js  v3.0
   Fish It Gileg Edition
   Canvas 2D Scene + Full Fishing Mechanic
═══════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════
   1. DATA & CONSTANTS
══════════════════════════════════ */

// Weight ranges per rarity (kg)
const WEIGHT_RANGE = {
  Common:    [0.5,  2],
  Uncommon:  [1,    5],
  Rare:      [3,   15],
  Epic:      [10,  50],
  Legendary: [30, 150],
  Mythic:    [100,300],
};

// Size label from weight
function sizeLabel(kg) {
  if (kg < 2)   return 'Kecil';
  if (kg < 10)  return 'Sedang';
  if (kg < 50)  return 'Besar';
  return 'Boss';
}

// Rod max carry weight (kg) & name
const RODS = [
  { id:'basic',  name:'Basic Rod',  icon:'🎣', maxKg:10,  bonus:{},            cost:0,     xpMul:1   },
  { id:'trader', name:'Trader Rod', icon:'🎣', maxKg:25,  bonus:{Rare:2},      cost:500,   xpMul:1.2 },
  { id:'sultan', name:'Sultan Rod', icon:'🎣', maxKg:60,  bonus:{Epic:3},      cost:1500,  xpMul:1.5 },
  { id:'whale',  name:'Whale Rod',  icon:'🎣', maxKg:150, bonus:{Legendary:3}, cost:5000,  xpMul:2   },
  { id:'god',    name:'God Rod',    icon:'🪄', maxKg:500, bonus:{Mythic:4},    cost:20000, xpMul:3   },
];

const BAITS = [
  { name:'Basic Bait',     waitMin:3000, waitMax:5000, cost:0    },
  { name:'Pro Bait',       waitMin:2000, waitMax:3800, cost:200  },
  { name:'Turbo Bait',     waitMin:1200, waitMax:2500, cost:700  },
  { name:'Legendary Bait', waitMin:600,  waitMax:1500, cost:2000 },
];

const FISH_DATA = {
  Common: [
    { id:'doge',   name:'Dogecoin (DOGE)',              icon:'🐟', baseVal:28  },
    { id:'shib',   name:'Shiba Inu (SHIB)',             icon:'🐟', baseVal:22  },
    { id:'ada',    name:'Cardano (ADA)',                icon:'🐟', baseVal:32  },
    { id:'matic',  name:'Polygon (MATIC)',              icon:'🐟', baseVal:27  },
    { id:'usd_idr',name:'USD/IDR',                     icon:'🐟', baseVal:35  },
    { id:'eur_usd',name:'EUR/USD',                     icon:'🐟', baseVal:33  },
    { id:'bbri',   name:'Bank Rakyat Indonesia (BBRI)', icon:'🐟', baseVal:40  },
    { id:'tlkm',   name:'Telkom Indonesia (TLKM)',      icon:'🐟', baseVal:36  },
  ],
  Uncommon: [
    { id:'sol',    name:'Solana (SOL)',              icon:'🐠', baseVal:85  },
    { id:'dot',    name:'Polkadot (DOT)',            icon:'🐠', baseVal:80  },
    { id:'avax',   name:'Avalanche (AVAX)',          icon:'🐠', baseVal:90  },
    { id:'link',   name:'Chainlink (LINK)',          icon:'🐠', baseVal:83  },
    { id:'gbp_usd',name:'GBP/USD',                  icon:'🐠', baseVal:95  },
    { id:'usd_jpy',name:'USD/JPY',                  icon:'🐠', baseVal:90  },
    { id:'bbca',   name:'Bank Central Asia (BBCA)',  icon:'🐠', baseVal:105 },
    { id:'bmri',   name:'Bank Mandiri (BMRI)',       icon:'🐠', baseVal:100 },
  ],
  Rare: [
    { id:'bnb',    name:'Binance Coin (BNB)',          icon:'🐡', baseVal:200 },
    { id:'ltc',    name:'Litecoin (LTC)',              icon:'🐡', baseVal:185 },
    { id:'atom',   name:'Cosmos (ATOM)',               icon:'🐡', baseVal:195 },
    { id:'xrp',    name:'XRP',                        icon:'🐡', baseVal:215 },
    { id:'aud_usd',name:'AUD/USD',                    icon:'🐡', baseVal:230 },
    { id:'usd_chf',name:'USD/CHF',                    icon:'🐡', baseVal:220 },
    { id:'asii',   name:'Astra International (ASII)', icon:'🐡', baseVal:250 },
    { id:'unvr',   name:'Unilever Indonesia (UNVR)',   icon:'🐡', baseVal:240 },
  ],
  Epic: [
    { id:'eth',    name:'Ethereum (ETH)',   icon:'🐙', baseVal:500 },
    { id:'ripple', name:'Ripple (XRP)',     icon:'🐙', baseVal:475 },
    { id:'eur_jpy',name:'EUR/JPY',         icon:'🐙', baseVal:530 },
    { id:'gbp_jpy',name:'GBP/JPY',         icon:'🐙', baseVal:520 },
    { id:'indf',   name:'Indofood (INDF)', icon:'🐙', baseVal:550 },
    { id:'ggrm',   name:'Gudang Garam (GGRM)', icon:'🐙', baseVal:570 },
  ],
  Legendary: [
    { id:'btc',    name:'Bitcoin (BTC)',                icon:'🐋', baseVal:1400 },
    { id:'eth_btc',name:'ETH/BTC',                     icon:'🐋', baseVal:1300 },
    { id:'usd_cad',name:'USD/CAD',                     icon:'🐋', baseVal:1200 },
    { id:'bbni',   name:'Bank Negara Indonesia (BBNI)', icon:'🐋', baseVal:1500 },
  ],
  Mythic: [
    { id:'satoshi',   name:'Satoshi Coin (MYTHIC)', icon:'🐉', baseVal:4500 },
    { id:'qbtc',      name:'Quantum Bitcoin',       icon:'🐉', baseVal:5500 },
    { id:'gmwhale',   name:'Global Market Whale',   icon:'🐉', baseVal:7000 },
    { id:'idx_dragon',name:'IDX Dragon Asset',      icon:'🐉', baseVal:7500 },
  ],
};

// Price formula: baseVal * (1 + weight/maxWeight) * rarityMul * petCoinBonus
const RARITY_PRICE_MUL = { Common:1, Uncommon:1.5, Rare:2.5, Epic:4, Legendary:8, Mythic:20 };

const BASE_RATES = { Common:55, Uncommon:20, Rare:12, Epic:7, Legendary:4, Mythic:2 };

const MAPS = [
  { id:'river',  name:'River Market', emoji:'🌊', desc:'Saham Indonesia umum', bonus:{Common:10},    bl:'+10% Common',    bg:'linear-gradient(135deg,#1a6fa3,#0d4a7a)', skyA:'#87ceeb', skyB:'#ffe0b2' },
  { id:'forex',  name:'Forex Ocean',  emoji:'💹', desc:'Pair forex dunia',     bonus:{Rare:5},       bl:'+5% Rare',       bg:'linear-gradient(135deg,#0a4f7a,#062040)', skyA:'#4682b4', skyB:'#b8d4e8' },
  { id:'crypto', name:'Crypto Sea',   emoji:'🪙', desc:'Cryptocurrency top',   bonus:{Epic:5},       bl:'+5% Epic',       bg:'linear-gradient(135deg,#1a3a7a,#0a1f5a)', skyA:'#3a4fa0', skyB:'#8898cc' },
  { id:'abyss',  name:'Whale Abyss',  emoji:'🌌', desc:'Legendary & Mythic!', bonus:{Legendary:5},  bl:'+5% Legendary',  bg:'linear-gradient(135deg,#1a0a5a,#300a8a)', skyA:'#1a0040', skyB:'#4a2080' },
  { id:'trench', name:'Mythic Trench',emoji:'🐉', desc:'Zona eksklusif Mythic',bonus:{Mythic:3},     bl:'+3% Mythic',     bg:'linear-gradient(135deg,#3a0a6a,#1a0040)', skyA:'#0a0020', skyB:'#2a0060' },
];

const PETS = [
  { id:'koi',    name:'Lucky Koi',       icon:'🐟', bonus:{Rare:2},             coinMul:1,   xpMul:1,    desc:'+2% Rare',             cost:1000 },
  { id:'octo',   name:'Smart Octopus',   icon:'🐙', bonus:{},                   coinMul:1,   xpMul:1.1,  desc:'+10% XP',              cost:2000 },
  { id:'puffer', name:'Treasure Puffer', icon:'🐡', bonus:{},                   coinMul:1.1, xpMul:1,    desc:'+10% Coin',            cost:3500 },
  { id:'dragon', name:'Crypto Dragon',   icon:'🐉', bonus:{Legendary:2,Mythic:1},coinMul:1, xpMul:1,    desc:'+2%Legend +1%Mythic',  cost:10000 },
];

const MISSIONS = [
  { id:'m1', title:'Pemancing Pemula',    desc:'Tangkap 5 ikan Common',           type:'catch_rarity', rarity:'Common',    target:5,  reward:{coins:200,xp:50},      rl:'+200💰 +50XP' },
  { id:'m2', title:'Trader Forex',        desc:'Tangkap 3 pair Forex',            type:'catch_ids',    ids:['usd_idr','eur_usd','gbp_usd','usd_jpy','aud_usd','usd_chf','eur_jpy','gbp_jpy','usd_cad'], target:3, reward:{coins:400,xp:100}, rl:'+400💰 +100XP' },
  { id:'m3', title:'Crypto Hunter',       desc:'Tangkap 5 aset Crypto',           type:'catch_ids',    ids:['doge','shib','ada','matic','sol','dot','avax','link','bnb','ltc','atom','xrp','eth','ripple','btc','eth_btc','satoshi','qbtc','gmwhale','idx_dragon'], target:5, reward:{coins:500,xp:150}, rl:'+500💰 +150XP' },
  { id:'m4', title:'Penangkap Legendaris',desc:'Tangkap 1 ikan Legendary',        type:'catch_rarity', rarity:'Legendary', target:1,  reward:{coins:1000,gems:2,xp:300}, rl:'+1000💰 +2💎' },
  { id:'m5', title:'Sultan Saham',        desc:'Tangkap saham BBCA dan BBRI',     type:'catch_both',   ids:['bbca','bbri'],                                             reward:{coins:600,xp:200},  rl:'+600💰 +200XP' },
  { id:'m6', title:'Pencari Mythic',      desc:'Tangkap 1 ikan Mythic',           type:'catch_rarity', rarity:'Mythic',    target:1,  reward:{coins:5000,gems:10,xp:1000}, rl:'+5000💰 +10💎' },
  { id:'m7', title:'Kolektor Aquarium',   desc:'Kumpulkan 20 ikan total',          type:'total_catch',                      target:20, reward:{coins:800,xp:250},     rl:'+800💰 +250XP' },
  { id:'m8', title:'Pancing Kuat!',       desc:'Tangkap ikan dengan berat 50kg+', type:'heavy_catch',                      target:1,  reward:{gems:3,xp:400},         rl:'+3💎 +400XP' },
];

const XP_TABLE = [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6200,7600,9200,11000,13200,15700,18500,21600,25000,30000];

const BITE_WINDOW_MS = 3000; // ms to press TARIK before miss

/* ══════════════════════════════════
   2. GAME STATE
══════════════════════════════════ */
let G = {
  playerName:'Angler', coins:0, gems:0, xp:0, level:1,
  currentMap:'river', rodLevel:0, baitLevel:0,
  activePet:null, ownedPets:[],
  inventory:{},           // { fishId: {count, totalWeight} }
  totalCaught:0, totalCoinsEarned:0, legendaryCount:0, mythicCount:0,
  heaviestCatch:0,
  missionProg:{}, missionClaimed:{},
  sfx:true, music:false,
};

function saveG()  { try { localStorage.setItem('cft3_save', JSON.stringify(G)); } catch(e){} }
function loadG()  { try { const s=localStorage.getItem('cft3_save'); if(s) G=Object.assign(G,JSON.parse(s)); } catch(e){} }
function resetG() { localStorage.removeItem('cft3_save'); location.reload(); }

/* ══════════════════════════════════
   3. CANVAS FISHING SCENE
══════════════════════════════════ */
class FishingScene {
  constructor(canvas) {
    this.cv  = canvas;
    this.ctx = canvas.getContext('2d');
    this.t   = 0;
    this.W   = 0; this.H = 0;
    this.waterY  = 0;
    this.rodBase = { x:0, y:0 };
    this.rodTip  = { x:0, y:0 };
    this.bobber  = { x:0, y:0, visible:false, ripple:0, biting:false };
    this.line    = { active:false };
    this.fishes  = [];
    this.effects = [];
    this.spawnTimer = null;
    this.running = false;
    this.phase = 'idle';
    this.onBite = null;       // callback
    this.onCastDone = null;   // callback
  }

  resize() {
    const wrap = this.cv.parentElement;
    const W = wrap.clientWidth  || 320;
    const H = this.cv.clientHeight || 220;
    this.cv.width  = W * (window.devicePixelRatio || 1);
    this.cv.height = H * (window.devicePixelRatio || 1);
    this.cv.style.width  = W + 'px';
    this.cv.style.height = H + 'px';
    this.ctx.scale(window.devicePixelRatio||1, window.devicePixelRatio||1);
    this.W = W; this.H = H;
    this.waterY  = H * 0.48;
    this.rodBase = { x: W * 0.82, y: H * 0.12 };
    this.rodTip  = { x: W * 0.55, y: H * 0.26 };
  }

  start() { if(this.running) return; this.running=true; this._loop(); }
  stop()  { this.running=false; if(this._raf) cancelAnimationFrame(this._raf); }

  _loop() {
    if (!this.running) return;
    this.t += 0.016;
    this._update();
    this._draw();
    this._raf = requestAnimationFrame(() => this._loop());
  }

  /* ── UPDATE ── */
  _update() {
    // Update fish
    this.fishes.forEach(f => {
      if (f.state === 'swimming') {
        f.x  += f.vx;
        f.y  += Math.sin(this.t * f.freq + f.phase) * f.amplitude;
        if (f.canBite && this.bobber.visible) {
          const dx = Math.abs(f.x - this.bobber.x);
          const dy = Math.abs(f.y - this.waterY);
          if (dx < 18 && dy < 15) {
            f.state = 'biting';
            this.bobber.biting = true;
            this.bobber.ripple = 1;
            this._doSpawnSplash(this.bobber.x, this.waterY, 10);
            this._doSpawnBubbles(this.bobber.x, this.waterY, 6);
            if (this.onBite) this.onBite();
            return;
          }
        }
        // Off-screen — remove
        if (f.x > this.W + 80 || f.x < -80) f.dead = true;
      }
    });
    this.fishes = this.fishes.filter(f => !f.dead);

    // Update effects
    this.effects.forEach(e => {
      e.life -= 0.02;
      e.x  += (e.vx || 0);
      e.y  += (e.vy || 0);
      if (e.type === 'particle') e.vy += 0.06;
      if (e.type === 'bubble')   e.vy -= 0.04;
      if (e.r_grow) e.r += 0.4;
    });
    this.effects = this.effects.filter(e => e.life > 0);

    // Bobber ripple fade
    if (this.bobber.ripple > 0) this.bobber.ripple -= 0.018;
  }

  /* ── DRAW ── */
  _draw() {
    const ctx = this.ctx, W = this.W, H = this.H, wy = this.waterY;

    ctx.clearRect(0, 0, W, H);

    // Sky
    const map = MAPS.find(m => m.id === G.currentMap) || MAPS[0];
    const sg = ctx.createLinearGradient(0, 0, 0, wy);
    sg.addColorStop(0, map.skyA || '#87ceeb');
    sg.addColorStop(1, map.skyB || '#ffe0b2');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, wy);

    // Clouds (simple)
    this._drawClouds(ctx, W, wy);

    // Water body
    const wg = ctx.createLinearGradient(0, wy, 0, H);
    wg.addColorStop(0,   '#1e6fa3');
    wg.addColorStop(0.4, '#0d2b4e');
    wg.addColorStop(1,   '#060e1f');
    ctx.fillStyle = wg;
    ctx.fillRect(0, wy, W, H - wy);

    // Animated wave line
    this._drawWaves(ctx, W, wy);

    // Seaweed
    this._drawSeaweed(ctx, W, H, wy);

    // Underwater bubbles
    this._drawUwBubbles(ctx, W, H, wy);

    // Fishing rod
    this._drawRod(ctx);

    // Fishing line
    if (this.line.active && this.bobber.visible) {
      const bY = this.bobber.biting ? this.waterY + 8 : this.waterY + Math.sin(this.t * 2.5) * 3;
      ctx.beginPath();
      ctx.moveTo(this.rodTip.x, this.rodTip.y);
      ctx.lineTo(this.bobber.x, bY);
      ctx.strokeStyle = this.bobber.biting ? 'rgba(255,150,0,.85)' : 'rgba(255,255,255,.55)';
      ctx.lineWidth = this.bobber.biting ? 1.8 : 1;
      ctx.stroke();
    }

    // Bobber
    if (this.bobber.visible) {
      const bY = this.bobber.biting
        ? this.waterY + 8 + Math.sin(this.t * 6) * 4
        : this.waterY + Math.sin(this.t * 2.5) * 3;
      this._drawBobber(ctx, this.bobber.x, bY);
      if (this.bobber.ripple > 0) {
        this._drawRipple(ctx, this.bobber.x, this.waterY, this.bobber.ripple * 25, this.bobber.ripple * .5);
      }
    }

    // Fish
    this.fishes.forEach(f => this._drawFish(ctx, f));

    // Effects
    this.effects.forEach(e => this._drawEffect(ctx, e));
  }

  _drawClouds(ctx, W, wy) {
    const cx = [(W*0.15 + Math.sin(this.t*.08)*W*.25), W*0.55 + Math.sin(this.t*.06+1)*W*.15, W*0.8 + Math.sin(this.t*.07+2)*W*.12];
    const cy = [wy*.25, wy*.4, wy*.2];
    cx.forEach((x, i) => {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, cy[i], 14, 0, Math.PI*2);
      ctx.arc(x+16, cy[i]-5, 11, 0, Math.PI*2);
      ctx.arc(x+32, cy[i], 14, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    });
  }

  _drawWaves(ctx, W, wy) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,.28)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= W; x += 3) {
      const y = wy + Math.sin(x * 0.025 + this.t * 2.2) * 3 + Math.sin(x * 0.055 + this.t * 1.5) * 1.5;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Foam highlight
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth = 4;
    for (let x = 0; x <= W; x += 3) {
      const y = wy + Math.sin(x * 0.025 + this.t * 2.2) * 3;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  _drawSeaweed(ctx, W, H, wy) {
    const positions = [W*.08, W*.42, W*.78];
    positions.forEach((px, i) => {
      const sway = Math.sin(this.t * 1.4 + i * 1.2) * 6;
      const h = 30 + i * 8;
      ctx.beginPath();
      ctx.moveTo(px, H);
      ctx.quadraticCurveTo(px + sway, H - h*.6, px + sway*1.4, H - h);
      ctx.strokeStyle = '#1a7a2a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      // Leaf
      ctx.beginPath();
      ctx.arc(px + sway*1.4, H - h, 6, 0, Math.PI*2);
      ctx.fillStyle = '#2a9a3a';
      ctx.fill();
    });
  }

  _drawUwBubbles(ctx, W, H, wy) {
    // Static decorative bubbles (animated via t)
    for (let i = 0; i < 5; i++) {
      const bx = W * (0.1 + i * 0.2);
      const phase = i * 1.3;
      const by = wy + (H - wy) * 0.8 - ((this.t * 15 + phase * 20) % (H - wy));
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  _drawRod(ctx) {
    const { x: bx, y: by } = this.rodBase;
    const { x: tx, y: ty } = this.rodTip;
    // Shadow
    ctx.beginPath();
    ctx.moveTo(bx+2, by+2); ctx.lineTo(tx+1, ty+1);
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
    // Body
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(tx, ty);
    const rg = ctx.createLinearGradient(bx, by, tx, ty);
    rg.addColorStop(0, '#6B3410'); rg.addColorStop(1, '#C8A06A');
    ctx.strokeStyle = rg; ctx.lineWidth = 4; ctx.stroke();
    // Guide rings
    for (let i = 0; i < 3; i++) {
      const p = (i+1) / 4;
      const gx = bx + (tx - bx) * p;
      const gy = by + (ty - by) * p;
      ctx.beginPath(); ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#C8A06A'; ctx.fill();
    }
    // Grip
    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI*2);
    ctx.fillStyle = '#8B4513'; ctx.fill();
    // Tip glow when line active
    if (this.line.active) {
      ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(79,172,254,.6)'; ctx.fill();
    }
  }

  _drawBobber(ctx, x, y) {
    // Top (red)
    ctx.beginPath();
    ctx.arc(x, y - 5, 6, Math.PI, 0);
    ctx.fillStyle = this.bobber.biting ? '#ff8800' : '#e74c3c';
    ctx.fill();
    // White bottom
    ctx.beginPath();
    ctx.arc(x, y + 2, 6, 0, Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    // Line
    ctx.beginPath();
    ctx.moveTo(x, y - 11); ctx.lineTo(x, y - 5);
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1; ctx.stroke();
    // Center stripe
    ctx.fillStyle = '#444';
    ctx.fillRect(x - 6, y - 1, 12, 2);
    // Glow if biting
    if (this.bobber.biting) {
      ctx.save();
      ctx.shadowBlur = 14; ctx.shadowColor = '#ff6600';
      ctx.beginPath(); ctx.arc(x, y - 1, 7, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,150,0,.6)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }
  }

  _drawRipple(ctx, x, y, r, alpha) {
    if (r < 1) return;
    ctx.beginPath();
    ctx.arc(x, y + 2, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 1.5; ctx.stroke();
    // Second ring
    ctx.beginPath();
    ctx.arc(x, y + 2, r * 1.6, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${alpha * .45})`;
    ctx.lineWidth = 1; ctx.stroke();
  }

  _drawFish(ctx, f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.vx < 0) ctx.scale(-1, 1);
    if (f.glow) { ctx.shadowBlur = 12; ctx.shadowColor = f.glowColor || '#4facfe'; }
    ctx.font = `${f.sz}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(f.emoji, 0, 0);
    ctx.restore();
  }

  _drawEffect(ctx, e) {
    if (e.life <= 0) return;
    ctx.save(); ctx.globalAlpha = Math.max(0, e.life);
    if (e.type === 'particle') {
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
      ctx.fillStyle = e.color || '#7fd8f8'; ctx.fill();
    } else if (e.type === 'bubble') {
      ctx.beginPath(); ctx.arc(e.x, e.y, Math.max(0, e.r), 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(180,220,255,.8)'; ctx.lineWidth = 1; ctx.stroke();
    } else if (e.type === 'splash') {
      ctx.beginPath(); ctx.arc(e.x, e.y, Math.max(0.1, e.r), 0, Math.PI*2);
      ctx.fillStyle = 'rgba(130,200,255,.7)'; ctx.fill();
    }
    ctx.restore();
  }

  /* ── SPAWN HELPERS ── */
  _doSpawnSplash(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 2.5;
      this.effects.push({ type:'particle', x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 2.5, r: 1.5+Math.random()*2.5, life:0.7+Math.random()*.3, color:'#7fd8f8' });
    }
  }

  _doSpawnBubbles(x, y, n) {
    for (let i = 0; i < n; i++) {
      this.effects.push({ type:'bubble', x: x+(Math.random()-.5)*20, y: y+5, vy: -(0.3+Math.random()*.5), r: 2+Math.random()*3, life: 0.8+Math.random()*.4 });
    }
  }

  _doSpawnRipples(x, y) {
    for (let i = 0; i < 3; i++) {
      this.effects.push({ type:'splash', x, y, r: 3 + i*4, r_grow:true, vy:0, vx:0, life: 0.9 - i*.2 });
    }
  }

  /* ── ACTIONS ── */
  doCast(targetXFrac) {
    this.phase = 'casting';
    this.fishes = []; this.effects = [];
    this.bobber.visible = false;
    this.bobber.biting  = false;
    this.line.active = false;
    if (this.spawnTimer) clearInterval(this.spawnTimer);

    const map = MAPS.find(m => m.id === G.currentMap) || MAPS[0];
    const mapIdx = MAPS.indexOf(map);
    const targetX = this.W * (0.22 + (targetXFrac || 0) * 0.3);

    const sx = this.rodTip.x, sy = this.rodTip.y;
    const ex = targetX, ey = this.waterY;
    const dur = 700;
    const t0  = performance.now();

    // Animate bobber flying
    const flyAnim = (now) => {
      const p  = Math.min((now - t0) / dur, 1);
      const ep = p < .5 ? 2*p*p : -1+(4-2*p)*p; // ease
      // Draw a "flying" bobber
      this.bobber._flyX = sx + (ex - sx) * ep;
      this.bobber._flyY = sy + (ey - sy) * ep - Math.sin(p * Math.PI) * 70;
      if (p < 1) { requestAnimationFrame(flyAnim); return; }
      // Landed
      this.bobber.x = ex; this.bobber.y = ey;
      this.bobber.visible = true; this.bobber.ripple = 1;
      this.line.active = true;
      this.phase = 'waiting';
      this._doSpawnSplash(ex, ey, 12);
      this._doSpawnRipples(ex, ey);
      playSFX('splash');
      this._startSpawning(mapIdx);
      if (this.onCastDone) this.onCastDone();
    };
    requestAnimationFrame(flyAnim);
  }

  _startSpawning(mapIdx) {
    if (this.spawnTimer) clearInterval(this.spawnTimer);
    let spawns = 0;
    const maxSpawns = 4 + mapIdx;
    let biterScheduled = false;

    const spawnOne = () => {
      if (this.phase !== 'waiting') { clearInterval(this.spawnTimer); return; }
      // Spawn ambient fish
      this._spawnAmbientFish();
      spawns++;
      // After 1-2 ambient fish, spawn the biter
      if (!biterScheduled && spawns >= 1 + Math.floor(Math.random()*2)) {
        biterScheduled = true;
        const baitDelay = BAITS[G.baitLevel].waitMin + Math.random() * (BAITS[G.baitLevel].waitMax - BAITS[G.baitLevel].waitMin);
        setTimeout(() => {
          if (this.phase === 'waiting') this._spawnBiterFish();
        }, baitDelay);
      }
      if (spawns >= maxSpawns) clearInterval(this.spawnTimer);
    };

    this.spawnTimer = setInterval(spawnOne, 900 + Math.random() * 700);
    setTimeout(spawnOne, 400);
  }

  _spawnAmbientFish() {
    const fromLeft = Math.random() > .5;
    const depth = this.waterY + 12 + Math.random() * (this.H - this.waterY - 25);
    const sp    = (0.6 + Math.random() * 1) * (fromLeft ? 1 : -1);
    const emojis = ['🐟','🐠','🐡'];
    this.fishes.push({
      x: fromLeft ? -50 : this.W + 50,
      y: depth, vx: sp,
      freq: 1 + Math.random() * 2, phase: Math.random()*6, amplitude: 1 + Math.random()*1.5,
      emoji: emojis[Math.floor(Math.random()*emojis.length)],
      sz: 18 + Math.random() * 8,
      state:'swimming', canBite:false, glow:false, dead:false,
    });
  }

  _spawnBiterFish() {
    if (this.phase !== 'waiting') return;
    const fromLeft = Math.random() > .5;
    const sp = (1.2 + Math.random() * .8) * (fromLeft ? 1 : -1);
    const targetY = this.waterY + 8;
    this.fishes.push({
      x: fromLeft ? -50 : this.W + 50,
      y: targetY, vx: sp,
      freq: 3, phase: 0, amplitude: .5,
      emoji: '🐟', sz: 22,
      state:'swimming', canBite:true, glow:true, glowColor:'#ffd700', dead:false,
    });
  }

  doReel(fishIcon) {
    // Update the reel fish icon emoji in the display
    const el = document.getElementById('reel-fish-icon');
    if (el) el.textContent = fishIcon;
  }

  doBreak() {
    // Line break effect
    this._doSpawnSplash(this.bobber.x, this.waterY, 8);
    this.line.active = false;
    this.bobber.visible = false;
    this.bobber.biting = false;
    this.phase = 'rodbreak';
    if (this.spawnTimer) clearInterval(this.spawnTimer);
  }

  doCatch() {
    this._doSpawnSplash(this.bobber.x, this.waterY, 18);
    this._doSpawnBubbles(this.bobber.x, this.waterY, 10);
    this._doSpawnRipples(this.bobber.x, this.waterY);
    this.line.active = false;
    this.bobber.visible = false;
    this.bobber.biting = false;
    this.fishes = [];
    this.phase = 'result';
    if (this.spawnTimer) clearInterval(this.spawnTimer);
    playSFX('catch');
  }

  doReset() {
    if (this.spawnTimer) clearInterval(this.spawnTimer);
    this.fishes = []; this.effects = [];
    this.bobber.visible = false; this.bobber.biting = false; this.line.active = false;
    this.phase = 'idle';
  }
}

/* ══════════════════════════════════
   4. DROP RATE ENGINE
══════════════════════════════════ */
function calcRates() {
  const r = { ...BASE_RATES };
  const rod = RODS[G.rodLevel];
  const map = MAPS.find(m => m.id === G.currentMap);
  const pet = G.activePet ? PETS.find(p => p.id === G.activePet) : null;

  let lb = G.level>=31 ? 10 : G.level>=21 ? 6 : G.level>=11 ? 4 : G.level>=6 ? 2 : 0;
  r.Common = Math.max(0, r.Common - lb);
  r.Rare += lb*.4; r.Epic += lb*.3; r.Legendary += lb*.2; r.Mythic += lb*.1;

  applyBonus(r, rod.bonus || {});
  if (pet) applyBonus(r, pet.bonus || {});
  if (map) applyBonus(r, map.bonus || {}, false);

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
  const roll  = Math.random() * 100;
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

function rollWeight(rarity) {
  const [mn, mx] = WEIGHT_RANGE[rarity];
  return +(mn + Math.random() * (mx - mn)).toFixed(1);
}

function calcFishValue(fish, rarity, weight) {
  const wr  = WEIGHT_RANGE[rarity];
  const wf  = 1 + (weight - wr[0]) / (wr[1] - wr[0] + 0.01); // 1 → 2
  const pm  = RARITY_PRICE_MUL[rarity] || 1;
  const pet = G.activePet ? PETS.find(p => p.id === G.activePet) : null;
  const cm  = pet ? pet.coinMul : 1;
  return Math.round(fish.baseVal * wf * pm * cm * .25);
}

/* ══════════════════════════════════
   5. FISHING STATE MACHINE
══════════════════════════════════ */
const STATES = ['idle','casting','waiting','bite','reeling','rodbreak','miss','result'];

let fishingPhase = 'idle';
let pendingCatch = null;      // { rarity, fish, weight }
let pullProgress = 0;
let biteTimer    = null;
let biteCountInt = null;
let autoReelInt  = null;

let scene = null;  // FishingScene instance

function setPhase(ph) {
  fishingPhase = ph;
  STATES.forEach(s => {
    const el = document.getElementById('st-' + s);
    if (!el) return;
    if (s === ph) { el.classList.remove('hidden'); el.classList.add('active'); }
    else          { el.classList.add('hidden');    el.classList.remove('active'); }
  });
}

/* CAST */
function doCast() {
  if (fishingPhase !== 'idle') return;
  setPhase('casting');
  scene.onCastDone = () => { setPhase('waiting'); startWaitArc(); };
  scene.onBite     = onFishBite;
  scene.doCast(Math.random());
  playSFX('cast');
}

/* CANCEL */
function doCancel() {
  clearTimeout(biteTimer);
  stopBiteCountdown(); stopWaitArc();
  scene.doReset();
  setPhase('idle');
}

/* FISH BITES */
function onFishBite() {
  if (fishingPhase !== 'waiting') return;
  stopWaitArc();

  const rarity = pickRarity();
  const fish   = pickFish(rarity);
  const weight = rollWeight(rarity);
  pendingCatch = { rarity, fish, weight };

  // Update bite fish emoji on canvas
  if (scene) {
    const bf = scene.fishes.find(f => f.canBite);
    if (bf) bf.emoji = fish.icon;
  }

  setPhase('bite');
  showBiteAlert(true);
  playSFX('bite');
  startBiteCountdown();
  biteTimer = setTimeout(onMiss, BITE_WINDOW_MS);
}

/* PULL */
function doPull() {
  if (fishingPhase !== 'bite') return;
  clearTimeout(biteTimer);
  stopBiteCountdown();
  showBiteAlert(false);

  const { rarity, fish, weight } = pendingCatch;
  const rod = RODS[G.rodLevel];

  // Check rod strength
  if (weight > rod.maxKg) {
    scene.doBreak();
    doShake();
    setPhase('rodbreak');
    const breakSubEl = document.getElementById('break-sub');
    const breakDetEl = document.getElementById('break-detail');
    if (breakSubEl) breakSubEl.textContent = fish.name + ' terlalu berat!';
    if (breakDetEl) breakDetEl.textContent =
      `Berat ikan: ${weight} kg | Max rod: ${rod.maxKg} kg`;
    playSFX('break');
    pendingCatch = null;
    return;
  }

  // Start reeling
  pullProgress = 0;
  setPhase('reeling');
  scene.doReel(fish.icon);

  setText('reel-weight', weight + ' kg');
  setText('reel-type', rarity);
  const reelTypeEl = document.getElementById('reel-type');
  if (reelTypeEl) reelTypeEl.className = 'reel-type tag-' + rarity;

  updateTensionBar(weight, rod.maxKg);
  updateReelBar();

  playSFX('reel');

  // For heavy fish: auto-decrease tension periodically (fish fights back)
  if (weight > rod.maxKg * 0.5) {
    autoReelInt = setInterval(() => {
      if (fishingPhase !== 'reeling') { clearInterval(autoReelInt); return; }
      pullProgress = Math.max(0, pullProgress - (weight / rod.maxKg) * 4);
      updateReelBar();
      if (weight > rod.maxKg * 0.75) { doShake(); playSFX('fight'); }
    }, 1200);
  }
}

function doReel() {
  if (fishingPhase !== 'reeling') return;
  const { weight } = pendingCatch;
  const rod = RODS[G.rodLevel];
  const gain = Math.max(5, 28 - (weight / rod.maxKg) * 18);
  pullProgress = Math.min(100, pullProgress + gain);
  updateReelBar();
  playSFX('reel');
  if (pullProgress >= 100) {
    clearInterval(autoReelInt);
    setTimeout(onCatchSuccess, 120);
  }
}

function onCatchSuccess() {
  if (!pendingCatch) return;
  clearInterval(autoReelInt);
  const { rarity, fish, weight } = pendingCatch;
  pendingCatch = null;

  // Calc value & XP
  const value = calcFishValue(fish, rarity, weight);
  const xpMap = { Common:10, Uncommon:20, Rare:40, Epic:80, Legendary:200, Mythic:500 };
  const pet   = G.activePet ? PETS.find(p => p.id === G.activePet) : null;
  let xp = Math.round((xpMap[rarity]||10) * (pet ? pet.xpMul : 1) * RODS[G.rodLevel].xpMul);
  let gems = rarity==='Epic'?1 : rarity==='Legendary'?3 : rarity==='Mythic'?10 : 0;

  G.inventory[fish.id] = G.inventory[fish.id] || { count:0, totalWeight:0 };
  G.inventory[fish.id].count++;
  G.inventory[fish.id].totalWeight = +(G.inventory[fish.id].totalWeight + weight).toFixed(1);
  G.totalCaught++;
  if (rarity==='Legendary') G.legendaryCount++;
  if (rarity==='Mythic')    G.mythicCount++;
  if (weight > G.heaviestCatch) G.heaviestCatch = weight;
  G.coins += value;
  G.gems  += gems;
  G.totalCoinsEarned += value;
  addXP(xp);
  updateMissions(fish, rarity, weight);
  saveG();

  scene.doCatch();
  doShake();
  showResult(fish, rarity, weight, value, xp, gems);
  updateHUD();
}

function onMiss() {
  if (fishingPhase !== 'bite') return;
  stopBiteCountdown();
  showBiteAlert(false);
  pendingCatch = null;
  scene.doReset(); scene.phase = 'idle';
  setPhase('miss');
  playSFX('miss');
}

/* ── Reel bar ── */
function updateReelBar() {
  const fill = document.getElementById('reel-bar-fill');
  const pct  = document.getElementById('reel-pct');
  if (fill) fill.style.width = pullProgress + '%';
  if (pct)  pct.textContent  = Math.floor(pullProgress) + '%';
}

/* ── Tension bar ── */
function updateTensionBar(weight, maxKg) {
  const ratio = weight / maxKg;
  const fill  = document.getElementById('tension-bar-fill');
  const warn  = document.getElementById('tension-warn');
  if (!fill) return;
  const pct = Math.min(100, ratio * 100);
  fill.style.width = pct + '%';
  fill.style.background = pct > 80 ? 'linear-gradient(90deg,#ff4444,#ff0000)' : pct > 50 ? 'linear-gradient(90deg,#ff6b35,#ffd700)' : 'linear-gradient(90deg,#56ab2f,#a8e063)';
  if (warn) warn.textContent = pct > 80 ? '⚠️ KRITIS!' : pct > 50 ? '⚠️ Berat' : '';
}

/* ── Show result ── */
function showResult(fish, rarity, weight, coins, xp, gems) {
  setPhase('result');
  const card = document.getElementById('result-card');
  if (card) card.className = 'result-card rc-' + rarity;
  setText('res-icon', fish.icon);
  setText('res-rarity', rarity.toUpperCase());
  setText('res-size', sizeLabel(weight));
  setText('res-weight', weight + ' kg');
  setText('res-name', fish.name);
  setText('res-coins', '+' + coins + ' 💰');
  setText('res-xp', '+' + xp + ' XP');
  const bonusEl = document.getElementById('res-bonus');
  if (bonusEl) {
    let b = gems > 0 ? '+' + gems + ' 💎  ' : '';
    if (rarity==='Mythic') b += '🌈 MYTHIC CATCH!';
    else if (rarity==='Legendary') b += '⭐ LEGENDARY!';
    else if (weight >= 50) b += '🏆 IKAN BESAR!';
    bonusEl.textContent = b;
  }
  spawnSparkles(rarity);
  playSFX(rarity);
}

/* ── Sparkles ── */
function spawnSparkles(rarity) {
  const c = document.getElementById('result-sparks');
  if (!c) return; c.innerHTML = '';
  const count = {Mythic:20,Legendary:16,Epic:12,Rare:8}[rarity] || 5;
  const col   = {Common:'#6bcb4a',Uncommon:'#4fa8d8',Rare:'#a855f7',Epic:'#f39c12',Legendary:'#ef4444',Mythic:'#f093fb'}[rarity]||'#fff';
  for (let i=0;i<count;i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.cssText=`left:${20+Math.random()*60}%;top:${15+Math.random()*70}%;background:${col};width:${3+Math.random()*5}px;height:${3+Math.random()*5}px;--sx:${(Math.random()-.5)*130}px;--sy:${(Math.random()-.5)*110}px;animation-delay:${Math.random()*.35}s;`;
    c.appendChild(s);
    setTimeout(()=>s.remove(),1200);
  }
}

/* ── Screen shake ── */
function doShake() {
  const el = document.getElementById('shake-overlay');
  if (!el) return;
  el.classList.remove('shaking');
  void el.offsetWidth;
  el.classList.add('shaking');
  setTimeout(() => el.classList.remove('shaking'), 450);
}

/* ── Bite alert overlay on canvas ── */
function showBiteAlert(show) {
  // We'll update the bite state UI instead
}

/* ══════════════════════════════════
   6. WAIT ARC ANIMATION
══════════════════════════════════ */
let waitArcIv = null;
let waitArcP  = 0;

function startWaitArc() {
  const arc = document.getElementById('wait-arc');
  if (arc) { arc.style.strokeDashoffset = '188'; }
  waitArcP = 0;
  clearInterval(waitArcIv);
  const bait = BAITS[G.baitLevel];
  const avg  = (bait.waitMin + bait.waitMax) / 2;
  const step = 188 / (avg / 50);
  waitArcIv = setInterval(() => {
    waitArcP = Math.min(waitArcP + step, 188);
    const a2 = document.getElementById('wait-arc');
    if (a2) a2.style.strokeDashoffset = 188 - waitArcP;
    if (waitArcP >= 188) clearInterval(waitArcIv);
  }, 50);
}
function stopWaitArc() {
  clearInterval(waitArcIv);
  const arc = document.getElementById('wait-arc');
  if (arc) arc.style.strokeDashoffset = '188';
}

/* ══════════════════════════════════
   7. BITE COUNTDOWN
══════════════════════════════════ */
let biteCountStart = 0;
function startBiteCountdown() {
  biteCountStart = Date.now();
  const bar = document.getElementById('bite-cd-fill');
  if (bar) bar.style.width = '100%';
  clearInterval(biteCountInt);
  biteCountInt = setInterval(() => {
    const elapsed = Date.now() - biteCountStart;
    const pct = Math.max(0, 100 - (elapsed / BITE_WINDOW_MS) * 100);
    const b2 = document.getElementById('bite-cd-fill');
    if (b2) b2.style.width = pct + '%';
    if (pct <= 0) clearInterval(biteCountInt);
  }, 40);
}
function stopBiteCountdown() {
  clearInterval(biteCountInt);
  const bar = document.getElementById('bite-cd-fill');
  if (bar) bar.style.width = '100%';
}

/* ══════════════════════════════════
   8. XP & LEVELING
══════════════════════════════════ */
function addXP(amt) {
  G.xp += amt;
  let lvd = false;
  while (G.level < XP_TABLE.length-1 && G.xp >= XP_TABLE[G.level]) {
    G.level++; lvd = true;
  }
  if (lvd) showLevelUp();
  updateHUD();
}

function showLevelUp() {
  setText('lvl-text', '🎉 Kamu sekarang Level ' + G.level + '!');
  const lb = document.getElementById('lvl-bonus');
  if (lb) { const b = G.level>=31?'+10% rare':G.level>=21?'+6% rare':G.level>=11?'+4% rare':G.level>=6?'+2% rare':''; lb.textContent = b; }
  showModal('modal-lvl');
  playSFX('levelup');
}

function xpProgress() {
  const curr = XP_TABLE[G.level-1]||0;
  const next = XP_TABLE[G.level]||XP_TABLE[XP_TABLE.length-1];
  return Math.min(((G.xp-curr)/(next-curr))*100, 100);
}

/* ══════════════════════════════════
   9. HUD
══════════════════════════════════ */
function updateHUD() {
  setText('hud-coins', fmt(G.coins));
  setText('hud-gems',  fmt(G.gems));
  setText('hud-lv',    'Lv.' + G.level);
  setText('hud-name',  G.playerName);
  setText('hud-xp-txt', fmt(G.xp) + 'xp');
  setText('mkt-coins', fmt(G.coins));

  const xpFill = $('hud-xp-fill');
  if (xpFill) xpFill.style.width = xpProgress() + '%';

  const map = MAPS.find(m => m.id === G.currentMap);
  if (map) {
    setText('inf-map', map.emoji + ' ' + map.name);
    setText('map-badge', map.name);
  }
  const rod = RODS[G.rodLevel];
  if (rod) {
    setText('inf-rod', rod.icon + ' ' + rod.name);
    const rodFill = $('rod-str-fill');
    if (rodFill) rodFill.style.width = ((G.rodLevel+1) / RODS.length * 100) + '%';
    setText('rod-str-label', rod.maxKg + 'kg');
    // Scene HUD
    $('sh-rod') && setText('sh-rod', rod.icon + ' ' + rod.name);
    $('sh-map') && setText('sh-map', map ? map.emoji + ' ' + map.name : '');
  }

  setText('s-catch', G.totalCaught);
  setText('s-xp',    fmt(G.xp));
  setText('s-leg',   G.legendaryCount);
  setText('s-myth',  G.mythicCount);

  const nr = RODS[G.rodLevel+1];
  setText('rod-cost', nr ? fmt(nr.cost) : 'MAX');
  const nb = BAITS[G.baitLevel+1];
  setText('bait-cost', nb ? fmt(nb.cost) : 'MAX');

  const rb = $('btn-upg-rod');
  if (rb) rb.disabled = !nr || G.coins < nr.cost;
  const bb = $('btn-upg-bait');
  if (bb) bb.disabled = !nb || G.coins < nb.cost;
}

/* ══════════════════════════════════
   10. AQUARIUM
══════════════════════════════════ */
function renderAquarium(filter='all') {
  const grid = $('aq-grid');
  if (!grid) return;
  const all = getAllFish();
  const shown = filter==='all' ? all : all.filter(f=>f.rarity===filter);
  const total = Object.values(G.inventory).reduce((a,b)=>a+(b.count||0),0);
  setText('aq-count', total + ' ikan');
  if (!shown.length) {
    grid.innerHTML=`<div class="empty-st"><span>🎣</span><p>${filter==='all'?'Belum ada ikan!':'Tidak ada '+filter}</p></div>`;
    return;
  }
  grid.innerHTML = shown.map(({fish,rarity,count,totalWeight}) => {
    const avgW = count ? +(totalWeight/count).toFixed(1) : 0;
    return `<div class="fish-card rarity-${rarity}">
      <div class="fc-ic">${fish.icon}</div>
      <div class="fc-nm">${fish.name}</div>
      <div class="fc-qty">×${count}</div>
      <div class="fc-wt">⚖️ ~${avgW}kg avg</div>
      <div class="fc-rar tag-${rarity}">${rarity}</div>
    </div>`;
  }).join('');
}

function getAllFish() {
  const res = [];
  for (const [id, info] of Object.entries(G.inventory)) {
    const cnt = info.count || info || 0;
    const tw  = info.totalWeight || 0;
    if (cnt <= 0) continue;
    for (const [rarity, arr] of Object.entries(FISH_DATA)) {
      const fish = arr.find(f=>f.id===id);
      if (fish) { res.push({fish, rarity, count:cnt, totalWeight:tw}); break; }
    }
  }
  return res;
}

function getFishById(id) {
  for (const [rarity, arr] of Object.entries(FISH_DATA)) {
    const fish = arr.find(f=>f.id===id);
    if (fish) return {fish, rarity};
  }
  return null;
}

/* ══════════════════════════════════
   11. MARKET
══════════════════════════════════ */
function renderSell() {
  const grid = $('mkt-sell-grid');
  if (!grid) return;
  const all = getAllFish();
  if (!all.length) { grid.innerHTML=`<div class="empty-st"><span>🐟</span><p>Inventori kosong</p></div>`; return; }
  grid.innerHTML = all.map(({fish,rarity,count,totalWeight}) => {
    const avgW   = count ? +(totalWeight/count).toFixed(1) : 0;
    const sellPx = calcFishValue(fish, rarity, avgW);
    return `<div class="mfc"><div class="mfc-ic">${fish.icon}</div>
      <div class="mfc-nm">${fish.name}</div>
      <div class="fc-rar tag-${rarity}">${rarity}</div>
      <div class="mfc-qty">×${count} · ~${avgW}kg</div>
      <div class="mfc-pr">💰 ${sellPx}/ekor</div>
      <button class="btn-sell" data-id="${fish.id}" data-price="${sellPx}">📤 Jual 1</button>
    </div>`;
  }).join('');
  grid.querySelectorAll('.btn-sell').forEach(b=>b.addEventListener('click',()=>sellFish(b.dataset.id,+b.dataset.price)));
}

function renderBuy() {
  const grid = $('mkt-buy-grid');
  if (!grid) return;
  const stock = [...FISH_DATA.Common.slice(0,3),...FISH_DATA.Uncommon.slice(0,2),...FISH_DATA.Rare.slice(0,1)];
  grid.innerHTML = stock.map(fish => {
    const rarity = rarityOf(fish.id);
    const avgW   = WEIGHT_RANGE[rarity][0] + 0.5;
    const price  = Math.round(calcFishValue(fish, rarity, avgW) * 1.6);
    return `<div class="mfc"><div class="mfc-ic">${fish.icon}</div>
      <div class="mfc-nm">${fish.name}</div>
      <div class="fc-rar tag-${rarity}">${rarity}</div>
      <div class="mfc-pr">💰 ${price}</div>
      <button class="btn-buy-npc" data-id="${fish.id}" data-price="${price}">📥 Beli</button>
    </div>`;
  }).join('');
  grid.querySelectorAll('.btn-buy-npc').forEach(b=>b.addEventListener('click',()=>buyFish(b.dataset.id,+b.dataset.price)));
}

function sellFish(id, price) {
  const info = G.inventory[id];
  if (!info || (info.count||info) <= 0) return;
  const f = getFishById(id);
  if (!f) return;
  if (typeof G.inventory[id] === 'object') {
    G.inventory[id].count--;
    if (G.inventory[id].count <= 0) delete G.inventory[id];
  } else { G.inventory[id]--; if (!G.inventory[id]) delete G.inventory[id]; }
  G.coins += price;
  showToast('📤 Dijual: ' + f.fish.name + ' +' + price + '💰');
  updateHUD(); renderSell(); saveG();
}

function buyFish(id, price) {
  if (G.coins < price) { showToast('💸 Coin tidak cukup!'); return; }
  G.coins -= price;
  if (!G.inventory[id]) G.inventory[id] = { count:0, totalWeight:0 };
  const r = rarityOf(id);
  const w = rollWeight(r);
  G.inventory[id].count++;
  G.inventory[id].totalWeight = +(G.inventory[id].totalWeight + w).toFixed(1);
  const f = getFishById(id);
  showToast('📥 Dibeli: ' + (f?f.fish.name:id));
  updateHUD(); renderBuy(); saveG();
}

function rarityOf(id) {
  for (const [r,a] of Object.entries(FISH_DATA)) if (a.find(f=>f.id===id)) return r;
  return 'Common';
}

/* ══════════════════════════════════
   12. MISSIONS
══════════════════════════════════ */
function updateMissions(fish, rarity, weight) {
  MISSIONS.forEach(m => {
    if (G.missionClaimed[m.id]) return;
    const p = G.missionProg[m.id]||0;
    if (m.type==='catch_rarity'  && rarity===m.rarity)     G.missionProg[m.id]=Math.min(p+1,m.target);
    if (m.type==='catch_ids'     && (m.ids||[]).includes(fish.id)) G.missionProg[m.id]=Math.min(p+1,m.target);
    if (m.type==='catch_both') {
      const s = G.missionProg[m.id+'_s']||{};
      if ((m.ids||[]).includes(fish.id)) s[fish.id]=true;
      G.missionProg[m.id+'_s']=s;
      G.missionProg[m.id]=Object.keys(s).length;
    }
    if (m.type==='total_catch')  G.missionProg[m.id]=G.totalCaught;
    if (m.type==='heavy_catch' && weight>=50) G.missionProg[m.id]=1;
  });
  renderMissions();
}

function renderMissions() {
  const list = $('miss-list');
  if (!list) return;
  const ready = MISSIONS.filter(m => { const p=G.missionProg[m.id]||0; const t=m.target||(m.ids?m.ids.length:1); return !G.missionClaimed[m.id]&&p>=t; }).length;
  setText('miss-badge', ready + ' siap klaim');
  list.innerHTML = MISSIONS.map(m => {
    const p = G.missionProg[m.id]||0;
    const t = m.target||(m.ids?m.ids.length:1);
    const pct = Math.min((p/t)*100,100);
    const done = p>=t; const claimed = G.missionClaimed[m.id];
    return `<div class="miss-card ${claimed?'claimed':done?'done':''}">
      <div class="mc-head"><div class="mc-title">${claimed?'✅ ':done?'🎉 ':'🎯 '}${m.title}</div><div class="mc-reward">${m.rl}</div></div>
      <div class="mc-desc">${m.desc}</div>
      <div class="mc-bar"><div class="mc-fill" style="width:${pct}%"></div></div>
      <div class="mc-foot"><div class="mc-count">${Math.min(p,t)} / ${t}</div>
        <button class="btn-claim" data-id="${m.id}" ${!done||claimed?'disabled':''}>${claimed?'✓ Claimed':done?'🎁 Klaim!':'Belum...'}</button>
      </div>
    </div>`;
  }).join('');
  list.querySelectorAll('.btn-claim').forEach(b=>{ if(!b.disabled) b.addEventListener('click',()=>claimMission(b.dataset.id)); });
}

function claimMission(id) {
  const m = MISSIONS.find(x=>x.id===id);
  if (!m||G.missionClaimed[id]) return;
  G.missionClaimed[id]=true;
  if (m.reward.coins) G.coins+=m.reward.coins;
  if (m.reward.gems)  G.gems +=m.reward.gems;
  if (m.reward.xp)    addXP(m.reward.xp);
  showToast('🎉 Mission selesai! ' + m.rl);
  updateHUD(); renderMissions(); saveG();
}

/* ══════════════════════════════════
   13. PETS
══════════════════════════════════ */
function renderPets() {
  const grid = $('pets-grid');
  if (!grid) return;
  const ap = G.activePet ? PETS.find(p=>p.id===G.activePet) : null;
  setText('pet-badge', ap ? ap.icon+' '+ap.name+' aktif' : 'Tidak ada');
  grid.innerHTML = PETS.map(pet => {
    const owned=G.ownedPets.includes(pet.id), active=G.activePet===pet.id;
    return `<div class="pet-card ${active?'active-pet':owned?'owned':'locked'}">
      <div class="pet-ic">${pet.icon}</div>
      <div class="pet-nm">${pet.name}</div>
      <div class="pet-bn">${pet.desc}</div>
      <div class="pet-st ${active?'pst-a':owned?'pst-o':'pst-c'}">${active?'⭐ Aktif':owned?'✓ Milikmu':'💰 '+fmt(pet.cost)}</div>
      ${owned?`<button class="btn-equip" data-id="${pet.id}">${active?'Lepas':'Pasang'}</button>`:`<button class="btn-buy-pet" data-id="${pet.id}">Beli ${fmt(pet.cost)}💰</button>`}
    </div>`;
  }).join('');
  grid.querySelectorAll('.btn-equip').forEach(b=>b.addEventListener('click',()=>equipPet(b.dataset.id)));
  grid.querySelectorAll('.btn-buy-pet').forEach(b=>b.addEventListener('click',()=>buyPet(b.dataset.id)));
}

function equipPet(id) {
  G.activePet = G.activePet===id ? null : id;
  const p = PETS.find(x=>x.id===id);
  showToast(G.activePet ? p.icon+' '+p.name+' dipasang!' : 'Pet dilepas');
  renderPets(); updateHUD(); saveG();
}
function buyPet(id) {
  const p = PETS.find(x=>x.id===id);
  if (!p||G.ownedPets.includes(id)) { showToast('Sudah punya!'); return; }
  if (G.coins < p.cost) { showToast('💸 Butuh '+fmt(p.cost)+'💰'); return; }
  G.coins -= p.cost; G.ownedPets.push(id);
  showToast('🎉 '+p.icon+' '+p.name+' dibeli!');
  renderPets(); updateHUD(); saveG();
}

/* ══════════════════════════════════
   14. MAP
══════════════════════════════════ */
function renderMap() {
  const grid = $('map-grid');
  if (!grid) return;
  grid.innerHTML = MAPS.map(m => `
    <div class="map-card ${G.currentMap===m.id?'selected':''}" data-id="${m.id}" style="background:${m.bg}">
      <div class="mc-em">${m.emoji}</div>
      <div class="mc-nm">${m.name}</div>
      <div class="mc-dc">${m.desc}</div>
      <div class="mc-bn">${m.bl}</div>
    </div>`).join('');
  grid.querySelectorAll('.map-card').forEach(c=>c.addEventListener('click',()=>selectMap(c.dataset.id)));
}

function selectMap(id) {
  G.currentMap = id;
  const m = MAPS.find(x=>x.id===id);
  showToast('🗺️ Pindah ke '+m.name);
  renderMap(); updateHUD(); saveG();
}

/* ══════════════════════════════════
   15. UPGRADES
══════════════════════════════════ */
function upgradeRod() {
  const nr = RODS[G.rodLevel+1];
  if (!nr) { showToast('🎣 Rod sudah MAX!'); return; }
  if (G.coins < nr.cost) { showToast('💸 Butuh '+fmt(nr.cost)+'💰'); return; }
  G.coins -= nr.cost; G.rodLevel++;
  showToast('⬆️ Upgrade ke '+nr.name+'! Max '+nr.maxKg+'kg');
  updateHUD(); saveG();
}
function upgradeBait() {
  const nb = BAITS[G.baitLevel+1];
  if (!nb) { showToast('🪱 Bait sudah MAX!'); return; }
  if (G.coins < nb.cost) { showToast('💸 Butuh '+fmt(nb.cost)+'💰'); return; }
  G.coins -= nb.cost; G.baitLevel++;
  showToast('⬆️ Upgrade ke '+nb.name+'!');
  updateHUD(); saveG();
}

/* ══════════════════════════════════
   16. SETTINGS
══════════════════════════════════ */
function renderSettings() {
  const sd = $('stat-disp');
  if (sd) sd.innerHTML = `Total tangkap: ${G.totalCaught}<br>Coin diperoleh: ${fmt(G.totalCoinsEarned)}💰<br>Terberat: ${G.heaviestCatch}kg<br>Legendary: ${G.legendaryCount} · Mythic: ${G.mythicCount}<br>Rod: ${RODS[G.rodLevel].name} (${RODS[G.rodLevel].maxKg}kg max)<br>Bait: ${BAITS[G.baitLevel].name}`;
  const ni=$('name-input'); if(ni) ni.value=G.playerName;
  const si=$('tog-sfx');    if(si) si.checked=G.sfx;
  const mi=$('tog-music');  if(mi) mi.checked=G.music;
}

/* ══════════════════════════════════
   17. SFX (Web Audio API)
══════════════════════════════════ */
let _actx = null;
function getActx() {
  if (!_actx) _actx = new (window.AudioContext||window.webkitAudioContext)();
  if (_actx.state==='suspended') _actx.resume();
  return _actx;
}

function playSFX(type) {
  if (!G.sfx) return;
  try {
    const ctx = getActx();
    const osc = ctx.createOscillator();
    const gain= ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const C = {
      cast:     {f:330,f2:440,t:'sine',     d:.18,v:.2 },
      splash:   {f:200,f2:150,t:'sawtooth', d:.25,v:.22},
      bite:     {f:660,f2:880,t:'sine',     d:.2, v:.25},
      pull:     {f:440,f2:600,t:'triangle', d:.15,v:.2 },
      reel:     {f:280,f2:380,t:'sine',     d:.1, v:.12},
      fight:    {f:180,f2:120,t:'square',   d:.18,v:.15},
      miss:     {f:220,f2:100,t:'sawtooth', d:.3, v:.18},
      break:    {f:150,f2:80, t:'square',   d:.4, v:.2 },
      catch:    {f:523,f2:784,t:'sine',     d:.35,v:.25},
      Common:   {f:440,f2:550,t:'sine',     d:.22,v:.2 },
      Uncommon: {f:523,f2:660,t:'sine',     d:.28,v:.22},
      Rare:     {f:659,f2:880,t:'triangle', d:.32,v:.25},
      Epic:     {f:784,f2:1047,t:'triangle',d:.4, v:.28},
      Legendary:{f:1047,f2:1568,t:'square', d:.55,v:.2 },
      Mythic:   {f:1319,f2:2093,t:'sawtooth',d:.9,v:.18},
      levelup:  {f:880,f2:1320,t:'sine',   d:.6, v:.28},
    }[type]||{f:440,f2:550,t:'sine',d:.2,v:.2};
    osc.type=C.t;
    osc.frequency.setValueAtTime(C.f, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(C.f2, ctx.currentTime+C.d);
    gain.gain.setValueAtTime(C.v, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+C.d);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime+C.d+.01);
  } catch(e){}
}

/* ══════════════════════════════════
   18. UI HELPERS
══════════════════════════════════ */
let _toastTimer = null;
function showToast(msg) {
  const el=$('toast'); if(!el) return;
  el.textContent=msg; el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>el.classList.remove('show'), 2500);
}

function showModal(id) { const el=$(id); if(el) el.style.display='flex'; }
function hideModal(id) { const el=$(id); if(el) el.style.display='none'; }
function setText(id, t) { const el=$(id); if(el) el.textContent=t; }
function $(id) { return document.getElementById(id); }
function fmt(n) {
  n=Math.floor(n);
  if(n>=1000000) return (n/1000000).toFixed(1)+'M';
  if(n>=1000) return (n/1000).toFixed(1)+'K';
  return n.toString();
}

/* ══════════════════════════════════
   19. TAB SWITCHING
══════════════════════════════════ */
const ALL_TABS = ['fishing','aquarium','market','missions','pets','map','settings'];

function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  ALL_TABS.forEach(t => {
    const el=$('tab-'+t);
    if (!el) return;
    if (t===tab) { el.classList.remove('hidden'); el.classList.add('active'); el.style.display='flex'; }
    else         { el.classList.add('hidden'); el.style.display='none'; }
  });
  if (tab==='aquarium') renderAquarium();
  if (tab==='market')   { renderSell(); renderBuy(); }
  if (tab==='missions') renderMissions();
  if (tab==='pets')     renderPets();
  if (tab==='map')      renderMap();
  if (tab==='settings') renderSettings();
}

/* Market sub-tabs */
function initMktTabs() {
  document.querySelectorAll('.mkt-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mkt-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const t=btn.dataset.mt;
      ['sell','buy'].forEach(p => {
        const el=$('mt-'+p);
        if (!el) return;
        el.classList.toggle('hidden', p!==t);
        el.style.display=p===t?'block':'none';
      });
      if(t==='sell') renderSell();
      if(t==='buy')  renderBuy();
    });
  });
}

/* Aquarium filters */
function initFilters() {
  document.querySelectorAll('.filt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filt').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderAquarium(btn.dataset.f);
    });
  });
}

/* ══════════════════════════════════
   20. MAIN INIT
══════════════════════════════════ */
function init() {
  loadG();

  /* ── START BUTTON FIX ──
     Use both click AND touchend to ensure mobile works */
  const btnStart = $('btn-start');
  if (btnStart) {
    const startGame = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const splash = $('splash-screen');
      const wrapper = $('game-wrapper');
      if (splash) splash.style.display = 'none';
      if (wrapper) wrapper.style.display = 'flex';
      initCanvas();
      setPhase('idle');
      updateHUD();
      renderMissions();
      try { getActx(); } catch(x){}
    };
    btnStart.addEventListener('click', startGame);
    btnStart.addEventListener('touchend', startGame, { passive:false });
  }

  /* Nav tabs */
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* Fishing buttons */
  $('btn-cast').addEventListener('click', doCast);
  $('btn-cast').addEventListener('touchend', e=>{ e.preventDefault(); doCast(); }, {passive:false});

  $('btn-cancel').addEventListener('click', doCancel);
  $('btn-pull').addEventListener('click', doPull);
  $('btn-pull').addEventListener('touchend', e=>{ e.preventDefault(); doPull(); }, {passive:false});

  $('btn-reel').addEventListener('click', doReel);
  $('btn-reel').addEventListener('touchend', e=>{ e.preventDefault(); doReel(); }, {passive:false});

  $('btn-miss-retry').addEventListener('click',   ()=>{ scene.doReset(); setPhase('idle'); });
  $('btn-break-retry').addEventListener('click',  ()=>{ scene.doReset(); setPhase('idle'); });
  $('btn-continue').addEventListener('click',     ()=>{ scene.doReset(); setPhase('idle'); });

  /* Upgrades */
  $('btn-upg-rod').addEventListener('click', upgradeRod);
  $('btn-upg-bait').addEventListener('click', upgradeBait);

  /* Level up modal */
  $('btn-lvl-ok').addEventListener('click', ()=>hideModal('modal-lvl'));

  /* Settings */
  $('tog-sfx').addEventListener('change', e=>{ G.sfx=e.target.checked; saveG(); });
  $('tog-music').addEventListener('change', e=>{ G.music=e.target.checked; saveG(); });
  $('name-input').addEventListener('input', e=>{ G.playerName=e.target.value.trim()||'Angler'; updateHUD(); saveG(); });

  /* Reset */
  $('btn-reset').addEventListener('click', ()=>showModal('modal-reset'));
  $('btn-yes-reset').addEventListener('click', resetG);
  $('btn-no-reset').addEventListener('click',  ()=>hideModal('modal-reset'));

  /* Sub-systems */
  initMktTabs(); initFilters();

  /* Starter bonus */
  if (!G.totalCaught && !G.coins) {
    G.coins = 150;
    showToast('🎣 Selamat datang! Kamu dapat 150💰 starter!');
    saveG();
  }

  /* Unlock AudioContext on any touch (iOS) */
  document.addEventListener('touchstart', () => { try { getActx(); } catch(e){} }, { once:true, passive:true });

  /* Handle window resize for canvas */
  window.addEventListener('resize', () => { if (scene) scene.resize(); });
}

/* Init canvas after game starts */
function initCanvas() {
  const cv = $('game-canvas');
  if (!cv) return;
  scene = new FishingScene(cv);
  scene.resize();
  scene.start();
  // Show scene HUD
  const sh = $('scene-hud');
  if (sh) sh.style.display = 'flex';
  updateHUD();
}

document.addEventListener('DOMContentLoaded', init);
