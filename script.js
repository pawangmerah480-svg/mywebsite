/* ============================================================
   PIXEL WAR — script.js
   Full game engine: map, units, combat, AI, progression, FX
   ============================================================ */

"use strict";

// ============================================================
// CONSTANTS & CONFIG
// ============================================================
const TILE = 40;            // pixels per tile
const MAP_W = 24;           // map width in tiles
const MAP_H = 16;           // map height in tiles

const TERRAIN = {
  GRASS:  { id: 0, name: 'Grass',    move: 1,   color: '#2d5a27', dark: '#1e3d1a' },
  ROAD:   { id: 1, name: 'Road',     move: 0.5, color: '#8b7355', dark: '#6b5a42' },
  WATER:  { id: 2, name: 'Water',    move: 99,  color: '#1e4080', dark: '#163060' },
  MOUNT:  { id: 3, name: 'Mountain', move: 99,  color: '#6b6b6b', dark: '#4a4a4a' },
};
const T = TERRAIN;

// Unit base stats by type
const UNIT_DEF = {
  infantry: { name:'Infantry', emoji:'🗡', hp:80,  atk:15, def:8,  range:1, speed:2, cost:{g:50,f:10},  level:1, color:'#3b82f6' },
  archer:   { name:'Archer',   emoji:'🏹', hp:60,  atk:20, def:4,  range:3, speed:2, cost:{g:70,f:15},  level:3, color:'#22c55e' },
  cavalry:  { name:'Cavalry',  emoji:'🐴', hp:100, atk:18, def:10, range:1, speed:4, cost:{g:100,f:20}, level:5, color:'#f97316' },
  tank:     { name:'Tank',     emoji:'🛡', hp:200, atk:30, def:20, range:2, speed:1, cost:{g:150,f:30}, level:8, color:'#a855f7' },
  boss:     { name:'BOSS',     emoji:'👹', hp:500, atk:40, def:25, range:2, speed:1, cost:{g:0,f:0},    level:0, color:'#ff0000' },
};

// Terrain map layout (0=grass,1=road,2=water,3=mountain)
const MAP_LAYOUT = [
  [0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0],
  [0,0,0,3,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,3,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,2,2,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,0,0,0,2,2,2,2,2,2,0,0,0,1,1,0,0,0,0],
  [0,0,3,1,1,0,0,0,2,2,0,0,0,0,2,2,0,0,0,1,1,3,0,0],
  [0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0],
  [0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0],
  [0,0,3,1,1,0,0,0,2,2,0,0,0,0,2,2,0,0,0,1,1,3,0,0],
  [0,0,0,0,1,1,0,0,0,2,2,2,2,2,2,0,0,0,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,2,2,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,3,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,3,0,0,0],
  [0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0],
  [0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0],
];

// XP thresholds per level
const XP_TABLE = [0,100,250,450,700,1000,1400,1900,2500,3200];

// Achievement definitions
const ACH_DEFS = [
  { id:'first_blood',   name:'First Blood',   desc:'Kill first enemy',   icon:'🩸', req:1,  type:'kills',   reward:50  },
  { id:'warrior',       name:'Warrior',       desc:'Kill 10 enemies',    icon:'⚔️', req:10, type:'kills',   reward:100 },
  { id:'war_machine',   name:'War Machine',   desc:'Kill 50 enemies',    icon:'💀', req:50, type:'kills',   reward:300 },
  { id:'commander',     name:'Commander',     desc:'Build 20 units',     icon:'🎖', req:20, type:'built',   reward:150 },
  { id:'destroyer',     name:'Destroyer',     desc:'Win 5 battles',      icon:'🏆', req:5,  type:'wins',    reward:500 },
  { id:'rich',          name:'Wealthy',       desc:'Earn 1000 gold',     icon:'💰', req:1000,type:'earned', reward:200 },
  { id:'survivor',      name:'Survivor',      desc:'Survive 10 waves',   icon:'🛡', req:10, type:'waves',   reward:400 },
  { id:'boss_slayer',   name:'Boss Slayer',   desc:'Defeat a boss',      icon:'👹', req:1,  type:'bosses',  reward:600 },
];

// Skin definitions
const SKIN_DEFS = [
  { id:'default',  name:'Default',     unlockLevel:1,  hue:0   },
  { id:'knight',   name:'Knight',      unlockLevel:3,  hue:200 },
  { id:'samurai',  name:'Samurai',     unlockLevel:5,  hue:0,  sat:-1 },
  { id:'dark',     name:'Dark Army',   unlockLevel:7,  hue:270 },
  { id:'golden',   name:'Golden Army', unlockLevel:9,  hue:45  },
];

// Combo kill strings
const COMBO_STRINGS = ['','','Double Kill!','Triple Kill!','Quadra Kill!','Penta Kill!','Rampage!!','Godlike!!!'];

// ============================================================
// GAME STATE
// ============================================================
let G = {}; // main game state, reset on new game

function makeState() {
  return {
    // resources
    gold: 200,
    food: 100,
    goldPerWave: 80,
    foodPerWave: 40,
    // progression
    playerLevel: 1,
    xp: 0,
    totalKills: 0,
    totalBuilt: 0,
    totalWins: 0,
    totalBossKills: 0,
    totalEarned: 200,
    totalWaves: 0,
    // units
    units: [],        // all units on map
    nextId: 1,
    // bases
    playerBase: null,
    enemyBase:  null,
    // camera
    camX: 0,
    camY: 0,
    zoom: 1,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragCamX: 0,
    dragCamY: 0,
    // selection & mode
    selectedUnit: null,
    mode: 'select',   // select | move | attack
    // wave
    wave: 1,
    waveActive: false,
    enemyAITimer: 0,
    enemyBuildTimer: 0,
    // particles
    particles: [],
    floatingTexts: [],
    // combo
    comboCount: 0,
    comboTimer: 0,
    // achievements
    achievements: {},
    // skin
    activeSkin: 'default',
    // game over
    gameOver: false,
    paused: false,
    // random events
    randEventTimer: 3000,
    // animation frame id
    rafId: null,
    lastTime: 0,
    // supply drops on map
    supplyDrops: [],
    // boss alive flag
    bossAlive: false,
  };
}

// ============================================================
// PLAYER PERSISTENCE (localStorage)
// ============================================================
const SAVE_KEY = 'pixelwar_save';

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

function writeSave(data) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch(e) {}
}

function getPersist() {
  const d = loadSave();
  return d || {
    totalKills: 0,
    totalWins: 0,
    totalWaves: 0,
    highScore: 0,
    achievements: {},
    unlockedSkins: ['default'],
    activeSkin: 'default',
    dailyLastClaimed: null,
    dailyStreak: 0,
    leaderboard: [],
  };
}

function savePersist() {
  const p = getPersist();
  p.totalKills   = (p.totalKills||0)   + G.totalKills;
  p.totalWins    = (p.totalWins||0)    + G.totalWins;
  p.totalWaves   = (p.totalWaves||0)   + G.totalWaves;
  p.highScore    = Math.max(p.highScore||0, scoreCalc());
  p.achievements = G.achievements;
  p.activeSkin   = G.activeSkin;
  writeSave(p);
}

function scoreCalc() {
  return G.totalKills * 10 + G.totalWins * 100 + G.wave * 5;
}

// ============================================================
// DOM REFS
// ============================================================
const $ = id => document.getElementById(id);

const canvas     = $('game-canvas');
const ctx        = canvas.getContext('2d');
const fxCanvas   = $('fx-canvas');
const fxCtx      = fxCanvas.getContext('2d');
const minimap    = $('minimap');
const miniCtx    = minimap.getContext('2d');
const titleCvs   = $('title-canvas');
const titleCtx   = titleCvs.getContext('2d');
const chestCvs   = $('chest-canvas');
const chestCtx   = chestCvs.getContext('2d');
const portCvs    = $('unit-portrait');
const portCtx    = portCvs.getContext('2d');

// ============================================================
// AUDIO — Web Audio API (procedural sound)
// ============================================================
let audioCtx = null;

function getAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { return null; }
  }
  return audioCtx;
}

function playSound(type) {
  const ac = getAudio(); if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain); gain.connect(ac.destination);

  switch(type) {
    case 'attack':
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(100, t+0.1);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.15);
      osc.start(t); osc.stop(t+0.15);
      break;
    case 'death':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(50, t+0.3);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.35);
      osc.start(t); osc.stop(t+0.35);
      break;
    case 'build':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.setValueAtTime(660, t+0.05);
      osc.frequency.setValueAtTime(880, t+0.1);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.2);
      osc.start(t); osc.stop(t+0.2);
      break;
    case 'win':
      [440,550,660,880].forEach((f,i) => {
        const o2 = ac.createOscillator();
        const g2 = ac.createGain();
        o2.connect(g2); g2.connect(ac.destination);
        o2.type = 'triangle';
        o2.frequency.value = f;
        g2.gain.setValueAtTime(0.15, t+i*0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, t+i*0.1+0.4);
        o2.start(t+i*0.1); o2.stop(t+i*0.1+0.4);
      });
      return;
    case 'select':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.setValueAtTime(800, t+0.05);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.1);
      osc.start(t); osc.stop(t+0.1);
      break;
    case 'boss':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(40, t+0.6);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.7);
      osc.start(t); osc.stop(t+0.7);
      break;
  }
}

// ============================================================
// PIXEL ART DRAWING HELPERS
// ============================================================

// Draw a simple pixel unit sprite on any context
function drawUnitSprite(c, type, team, skin, x, y, size, frame) {
  const s = size || 32;
  const f = frame || 0;
  c.save();
  c.translate(x, y);

  const skinDef = SKIN_DEFS.find(sk => sk.id === skin) || SKIN_DEFS[0];
  const def = UNIT_DEF[type] || UNIT_DEF.infantry;

  // base color
  let baseCol = team === 'player' ? '#3b82f6' : '#ef4444';
  if (skin && skin !== 'default' && team === 'player') {
    // apply skin hue via filter (hack via offscreen canvas)
  }

  const pixel = s / 8; // each "pixel" in sprite

  // body
  c.fillStyle = team === 'player' ? '#2563eb' : '#dc2626';
  if (skin === 'golden' && team === 'player') c.fillStyle = '#d97706';
  if (skin === 'dark'   && team === 'player') c.fillStyle = '#7c3aed';
  if (skin === 'samurai'&& team === 'player') c.fillStyle = '#374151';
  if (skin === 'knight' && team === 'player') c.fillStyle = '#1e40af';

  const bc = c.fillStyle;

  if (type === 'infantry') {
    // head
    c.fillStyle = '#f5c5a0'; c.fillRect(pixel*3, pixel*0, pixel*2, pixel*2);
    // helmet
    c.fillStyle = bc; c.fillRect(pixel*3, 0, pixel*2, pixel);
    // body
    c.fillStyle = bc; c.fillRect(pixel*2, pixel*2, pixel*4, pixel*3);
    // legs walk anim
    const loff = Math.floor(f/4)%2 === 0 ? 0 : pixel;
    c.fillStyle = '#1e293b'; c.fillRect(pixel*2, pixel*5, pixel*1.5, pixel*2 + loff);
    c.fillRect(pixel*4.5, pixel*5, pixel*1.5, pixel*2 - loff + pixel);
    // sword
    c.fillStyle = '#cbd5e1'; c.fillRect(pixel*6, pixel*2, pixel, pixel*3);

  } else if (type === 'archer') {
    // head
    c.fillStyle = '#f5c5a0'; c.fillRect(pixel*3, pixel, pixel*2, pixel*2);
    // cap
    c.fillStyle = '#15803d'; c.fillRect(pixel*3, 0, pixel*2, pixel*1.5);
    // body
    c.fillStyle = bc; c.fillRect(pixel*2, pixel*3, pixel*4, pixel*2.5);
    // bow
    c.strokeStyle = '#92400e'; c.lineWidth = pixel*0.6;
    c.beginPath(); c.arc(pixel*7, pixel*3.5, pixel*2, -Math.PI/2, Math.PI/2); c.stroke();
    // arrow
    if (f % 8 < 4) {
      c.fillStyle = '#fcd34d'; c.fillRect(pixel*5, pixel*3, pixel*2.5, pixel*0.5);
    }
    // legs
    const la = Math.floor(f/4)%2===0;
    c.fillStyle = '#1e293b';
    c.fillRect(pixel*2, pixel*5.5, pixel*1.5, pixel*(la?2:2.5));
    c.fillRect(pixel*4.5, pixel*5.5, pixel*1.5, pixel*(la?2.5:2));

  } else if (type === 'cavalry') {
    // horse body
    c.fillStyle = '#78350f'; c.fillRect(pixel*1, pixel*3, pixel*6, pixel*3);
    // horse head
    c.fillStyle = '#92400e'; c.fillRect(pixel*6, pixel*1.5, pixel*2, pixel*2.5);
    // horse legs
    const ha = Math.floor(f/3)%4;
    c.fillStyle = '#451a03';
    c.fillRect(pixel*2, pixel*6, pixel, pixel*(ha===0?2:ha===1?1:ha===2?2:1));
    c.fillRect(pixel*4, pixel*6, pixel, pixel*(ha===0?1:ha===1?2:ha===2?1:2));
    // rider
    c.fillStyle = '#f5c5a0'; c.fillRect(pixel*3, pixel*0.5, pixel*2, pixel*2);
    c.fillStyle = bc; c.fillRect(pixel*2.5, pixel*2, pixel*3, pixel*2);
    // lance
    c.fillStyle = '#92400e'; c.fillRect(pixel*5, pixel*1, pixel*0.6, pixel*4);
    c.fillStyle = '#cbd5e1'; c.fillRect(pixel*5.4, pixel*0.2, pixel*0.8, pixel*1);

  } else if (type === 'tank') {
    // tracks
    c.fillStyle = '#1c1917'; c.fillRect(pixel, pixel*5, pixel*6, pixel*1.5);
    // body
    c.fillStyle = bc; c.fillRect(pixel*1.5, pixel*3, pixel*5, pixel*2.5);
    // turret
    c.fillStyle = team==='player' ? '#1d4ed8' : '#991b1b';
    if (skin==='golden') c.fillStyle = '#b45309';
    c.fillRect(pixel*2.5, pixel*1.5, pixel*3, pixel*2);
    // cannon
    const tangle = Math.sin(f*0.05)*pixel;
    c.fillStyle = '#374151';
    c.fillRect(pixel*5, pixel*2 + tangle, pixel*2.5, pixel*0.8);
    // bolts
    c.fillStyle = '#6b7280';
    [[2,3.5],[4.5,3.5],[3.3,5.2]].forEach(([bx,by]) => {
      c.fillRect(pixel*bx, pixel*by, pixel*0.6, pixel*0.6);
    });

  } else if (type === 'boss') {
    // Giant boss pixel sprite
    const bs = pixel*1.5;
    c.fillStyle = '#4a0000'; c.fillRect(bs, bs*0.5, bs*4, bs*4);
    c.fillStyle = '#7f0000'; c.fillRect(bs*1.5, bs*0.5, bs*3, bs*2);
    // horns
    c.fillStyle = '#fbbf24';
    c.fillRect(bs*1.5, 0, bs*0.8, bs); c.fillRect(bs*3.7, 0, bs*0.8, bs);
    // eyes
    c.fillStyle = '#ff0000';
    c.fillRect(bs*2, bs, bs*0.8, bs*0.8); c.fillRect(bs*3.2, bs, bs*0.8, bs*0.8);
    // mouth
    c.fillStyle = '#ffff00';
    c.fillRect(bs*2.2, bs*2.2, bs*1.6, bs*0.5);
    // arms
    const aa = Math.sin(f*0.08)*bs;
    c.fillStyle = '#4a0000';
    c.fillRect(0, bs*1.5+aa, bs, bs*2.5);
    c.fillRect(bs*5, bs*1.5-aa, bs, bs*2.5);
    // weapon
    c.fillStyle = '#9ca3af';
    c.fillRect(bs*5.8, bs*0.5-aa, bs*0.8, bs*3);
  }

  c.restore();
}

// Draw base sprite
function drawBase(c, team, x, y, hp, maxHp) {
  const s = TILE * 2;
  c.save();
  c.translate(x, y);

  const col = team === 'player' ? '#1d4ed8' : '#991b1b';
  const col2 = team === 'player' ? '#3b82f6' : '#ef4444';

  // foundation
  c.fillStyle = '#374151'; c.fillRect(4, s-16, s-8, 16);
  // walls
  c.fillStyle = col; c.fillRect(8, 16, s-16, s-24);
  // battlements
  for (let i = 0; i < 4; i++) {
    c.fillStyle = col2; c.fillRect(8 + i*16, 8, 10, 12);
  }
  // gate
  c.fillStyle = '#1e293b'; c.fillRect(s/2-8, s-28, 16, 22);
  // flag
  const ft = Date.now()*0.002;
  c.fillStyle = team === 'player' ? '#60a5fa' : '#f87171';
  c.beginPath();
  c.moveTo(s/2, 8); c.lineTo(s/2, 0);
  c.lineTo(s/2+10+Math.sin(ft)*4, 4); c.lineTo(s/2, 8);
  c.fill();
  // flagpole
  c.fillStyle = '#9ca3af'; c.fillRect(s/2-1, 0, 2, 16);

  // HP bar
  const hpPct = hp / maxHp;
  c.fillStyle = '#000'; c.fillRect(4, -10, s-8, 7);
  c.fillStyle = hpPct>0.5?'#22c55e':hpPct>0.25?'#f97316':'#ef4444';
  c.fillRect(4, -10, (s-8)*hpPct, 7);
  c.strokeStyle = '#fff'; c.lineWidth = 1;
  c.strokeRect(4, -10, s-8, 7);

  c.restore();
}

// Draw terrain tile
function drawTile(c, tid, px, py) {
  const tv = Object.values(TERRAIN).find(t=>t.id===tid) || TERRAIN.GRASS;
  // checkerboard pattern
  const chk = ((px/TILE + py/TILE) % 2 === 0);
  c.fillStyle = chk ? tv.color : tv.dark;
  c.fillRect(px, py, TILE, TILE);

  // terrain details
  if (tid === 2) { // water
    const wt = Date.now() * 0.001;
    c.fillStyle = 'rgba(100,180,255,0.18)';
    c.fillRect(px+4+Math.sin(wt+px)*2, py+TILE/2-3, TILE-8, 6);
  } else if (tid === 3) { // mountain
    c.fillStyle = '#9ca3af';
    c.beginPath();
    c.moveTo(px+TILE/2, py+4);
    c.lineTo(px+TILE-4, py+TILE-4);
    c.lineTo(px+4, py+TILE-4);
    c.closePath(); c.fill();
    c.fillStyle = '#fff';
    c.beginPath();
    c.moveTo(px+TILE/2, py+4);
    c.lineTo(px+TILE/2+8, py+18);
    c.lineTo(px+TILE/2-8, py+18);
    c.closePath(); c.fill();
  } else if (tid === 0) { // grass detail
    if ((Math.abs(px+py)*7+113) % 11 < 2) {
      c.fillStyle = '#1a4a16';
      c.fillRect(px+12, py+20, 3, 6);
      c.fillRect(px+24, py+12, 3, 6);
    }
  }
}

// ============================================================
// UNIT CLASS
// ============================================================
let UID = 1;
class Unit {
  constructor(type, team, tx, ty) {
    this.id    = UID++;
    this.type  = type;
    this.team  = team;
    this.tx    = tx;   // tile x
    this.ty    = ty;   // tile y
    // stats (copy from def)
    const d = UNIT_DEF[type];
    this.name  = d.name;
    this.maxHp = d.hp;
    this.hp    = d.hp;
    this.atk   = d.atk;
    this.def   = d.def;
    this.range = d.range;
    this.speed = d.speed;
    this.color = team === 'player' ? d.color : '#ef4444';
    // upgrade levels
    this.upgAtk = 0; this.upgDef = 0; this.upgSpd = 0;
    // animation state
    this.frame    = 0;
    this.animTimer = 0;
    this.state     = 'idle'; // idle|walk|attack|die
    this.facing    = team === 'player' ? 1 : -1;
    // pixel position (smooth movement)
    this.px = tx * TILE;
    this.py = ty * TILE;
    this.targetPx = this.px;
    this.targetPy = this.py;
    this.moving   = false;
    // combat
    this.attackCooldown = 0;
    this.hasMoved  = false;
    this.hasActed  = false;
    this.dead      = false;
    // flash on hit
    this.hitFlash  = 0;
    this.attackAnim = 0;
    // path queue
    this.path = [];
    this.pathTimer = 0;
  }

  get effectiveAtk() { return this.atk + this.upgAtk * 5; }
  get effectiveDef() { return this.def + this.upgDef * 3; }
  get effectiveSpd() { return this.speed + this.upgSpd; }

  update(dt) {
    // animation frame tick
    this.animTimer += dt;
    if (this.animTimer > 80) { this.frame++; this.animTimer = 0; }
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.attackAnim > 0) this.attackAnim -= dt;

    // smooth movement
    const dx = this.targetPx - this.px;
    const dy = this.targetPy - this.py;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      const spd = 180 * this.effectiveSpd;
      const move = Math.min(spd * dt/1000, dist);
      this.px += (dx/dist)*move;
      this.py += (dy/dist)*move;
      this.state = 'walk';
      this.moving = true;
      // dust particles
      if (Math.random() < 0.1) {
        spawnParticle(this.px + TILE/2, this.py + TILE - 4, 'dust');
      }
    } else {
      this.px = this.targetPx;
      this.py = this.targetPy;
      if (this.moving) { this.state = 'idle'; this.moving = false; }
    }

    // follow path
    if (this.path.length > 0 && !this.moving) {
      const next = this.path.shift();
      this.moveTo(next.x, next.y);
    }
  }

  moveTo(tx, ty) {
    this.tx = tx; this.ty = ty;
    this.targetPx = tx * TILE;
    this.targetPy = ty * TILE;
    this.moving = true;
    this.state = 'walk';
  }

  draw(c) {
    if (this.dead) return;

    c.save();
    // hit flash
    if (this.hitFlash > 0) {
      c.globalAlpha = 0.7;
      c.filter = 'brightness(3) saturate(0)';
    }

    // flip if facing left
    if (this.facing < 0) {
      c.translate(this.px + TILE, this.py);
      c.scale(-1, 1);
      drawUnitSprite(c, this.type, this.team, G.activeSkin, 0, 0, TILE, this.frame);
    } else {
      drawUnitSprite(c, this.type, this.team, G.activeSkin, this.px, this.py, TILE, this.frame);
    }

    c.restore();

    // attack animation flash
    if (this.attackAnim > 0) {
      c.save();
      c.globalAlpha = this.attackAnim / 200;
      c.fillStyle = '#fbbf24';
      c.beginPath();
      c.arc(this.px+TILE/2, this.py+TILE/2, TILE*0.6, 0, Math.PI*2);
      c.fill();
      c.restore();
    }

    // HP bar
    const hpPct = this.hp / this.maxHp;
    const bw = TILE - 6;
    c.fillStyle = '#000';
    c.fillRect(this.px+3, this.py-8, bw, 5);
    c.fillStyle = hpPct>0.5?'#22c55e':hpPct>0.25?'#f97316':'#ef4444';
    c.fillRect(this.px+3, this.py-8, bw*hpPct, 5);

    // selection ring
    if (G.selectedUnit && G.selectedUnit.id === this.id) {
      c.save();
      c.strokeStyle = '#fbbf24';
      c.lineWidth = 2;
      const t = Date.now()*0.004;
      c.setLineDash([4,4]);
      c.lineDashOffset = -t*10;
      c.strokeRect(this.px-2, this.py-2, TILE+4, TILE+4);
      c.restore();
    }

    // team indicator dot
    c.fillStyle = this.team === 'player' ? '#3b82f6' : '#ef4444';
    c.fillRect(this.px+TILE-6, this.py+2, 5, 5);
  }
}

// ============================================================
// PARTICLE SYSTEM
// ============================================================
function spawnParticle(x, y, type, count) {
  const n = count || 1;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 30 + Math.random() * 80;
    let col = '#fbbf24', size = 3+Math.random()*4, life = 0.4+Math.random()*0.3;

    if (type === 'dust') { col = '#a3a3a3'; size = 2+Math.random()*3; life = 0.3; spd *= 0.3; }
    else if (type === 'blood') { col = '#dc2626'; size = 2+Math.random()*3; life = 0.5; }
    else if (type === 'explode') { col = ['#fbbf24','#f97316','#ef4444','#fff'][Math.floor(Math.random()*4)]; size = 3+Math.random()*6; life = 0.5+Math.random()*0.4; }
    else if (type === 'spark') { col = '#60a5fa'; size = 2+Math.random()*3; life = 0.3; }
    else if (type === 'gold') { col = '#ffd700'; size = 4+Math.random()*4; life = 0.6; }
    else if (type === 'fire') { col = ['#fbbf24','#f97316','#ff4444'][Math.floor(Math.random()*3)]; size = 4+Math.random()*5; life = 0.4+Math.random()*0.3; }

    G.particles.push({ x, y, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd, size, col, life, maxLife: life, type });
  }
}

function spawnFloatText(x, y, text, col) {
  G.floatingTexts.push({ x, y, text, col: col||'#fbbf24', life: 1.2, vy: -30 });
}

function updateParticles(dt) {
  const s = dt/1000;
  G.particles = G.particles.filter(p => {
    p.x += p.vx * s; p.y += p.vy * s;
    p.vy += 60 * s; // gravity
    p.life -= s;
    return p.life > 0;
  });
  G.floatingTexts = G.floatingTexts.filter(f => {
    f.y += f.vy * s; f.life -= s;
    return f.life > 0;
  });
}

function drawParticles(c) {
  G.particles.forEach(p => {
    c.save();
    c.globalAlpha = p.life / p.maxLife;
    c.fillStyle = p.col;
    c.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    c.restore();
  });
  G.floatingTexts.forEach(f => {
    c.save();
    c.globalAlpha = Math.min(1, f.life);
    c.fillStyle = f.col;
    c.font = "bold 11px 'Press Start 2P'";
    c.textAlign = 'center';
    c.strokeStyle = '#000'; c.lineWidth = 3;
    c.strokeText(f.text, f.x, f.y);
    c.fillText(f.text, f.x, f.y);
    c.restore();
  });
}

// ============================================================
// MAP & PATHFINDING
// ============================================================
function getTile(tx, ty) {
  if (ty<0||ty>=MAP_H||tx<0||tx>=MAP_W) return 3; // wall
  return MAP_LAYOUT[ty][tx];
}

function canEnter(tx, ty, unit) {
  const tid = getTile(tx,ty);
  const tv = Object.values(TERRAIN).find(t=>t.id===tid);
  if (!tv || tv.move >= 99) return false;
  // check no other unit there
  return !G.units.some(u => !u.dead && u.tx===tx && u.ty===ty);
}

// Simple BFS pathfinding
function findPath(sx,sy, ex,ey, unit) {
  if (sx===ex && sy===ey) return [];
  const visited = new Set();
  const queue = [{x:sx,y:sy,path:[]}];
  const key = (x,y) => `${x},${y}`;
  visited.add(key(sx,sy));
  const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
  while (queue.length) {
    const cur = queue.shift();
    for (const d of dirs) {
      const nx=cur.x+d.x, ny=cur.y+d.y;
      const nk = key(nx,ny);
      if (visited.has(nk)) continue;
      visited.add(nk);
      const tid = getTile(nx,ny);
      const tv = Object.values(TERRAIN).find(t=>t.id===tid);
      if (!tv || tv.move>=99) continue;
      // allow destination even if unit there (for attack path)
      const blocked = G.units.some(u=>!u.dead&&u.tx===nx&&u.ty===ny);
      const newPath = [...cur.path, {x:nx,y:ny}];
      if (nx===ex && ny===ey) return newPath;
      if (!blocked) queue.push({x:nx,y:ny,path:newPath});
    }
    if (visited.size > 800) break; // safety
  }
  return null;
}

// ============================================================
// COMBAT SYSTEM
// ============================================================
function dist(a, b) {
  return Math.max(Math.abs(a.tx-b.tx), Math.abs(a.ty-b.ty));
}

function attackUnit(attacker, target) {
  if (attacker.dead || target.dead) return;
  if (attacker.attackCooldown > 0) return;

  const dmg = Math.max(1, attacker.effectiveAtk - target.effectiveDef + Math.floor(Math.random()*5)-2);
  target.hp -= dmg;
  attacker.attackCooldown = 800;
  attacker.attackAnim = 200;
  attacker.state = 'attack';
  target.hitFlash = 120;

  // particles
  const cx = target.px + TILE/2, cy = target.py + TILE/2;
  spawnParticle(cx, cy, 'blood', 4);
  spawnParticle(cx, cy, 'spark', 3);
  spawnFloatText(cx, cy-10, `-${dmg}`, '#ef4444');
  playSound('attack');

  if (target.hp <= 0) {
    killUnit(target, attacker);
  }
}

function killUnit(unit, killer) {
  unit.dead = true;
  unit.hp = 0;
  const cx = unit.px + TILE/2, cy = unit.py + TILE/2;
  spawnParticle(cx, cy, 'explode', 12);
  spawnParticle(cx, cy, 'fire', 6);
  spawnFloatText(cx, cy-20, 'DEAD!', '#fbbf24');
  playSound('death');

  if (unit.team === 'enemy' && killer && killer.team === 'player') {
    // XP & combo
    const xpGain = unit.type==='boss' ? 200 : (UNIT_DEF[unit.type]?.level||1)*15 + 20;
    addXP(xpGain);
    addGold(unit.type==='boss' ? 300 : 20+Math.floor(Math.random()*20));
    spawnFloatText(cx, cy-40, `+XP ${xpGain}`, '#a78bfa');

    G.totalKills++;
    // combo
    G.comboCount++;
    G.comboTimer = 3000;
    if (G.comboCount >= 2) showCombo(G.comboCount);

    // boss kill
    if (unit.type === 'boss') {
      G.totalBossKills++;
      G.bossAlive = false;
      $('boss-alert').classList.add('hidden');
    }

    checkAchievements();
  }
}

function showCombo(n) {
  const el = $('combo-text');
  const label = COMBO_STRINGS[Math.min(n, COMBO_STRINGS.length-1)] || `x${n} KILL!`;
  el.textContent = label;
  el.classList.remove('hidden');
  // remove after animation
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 1700);
}

// ============================================================
// RESOURCE & PROGRESSION
// ============================================================
function addGold(n) {
  G.gold += n;
  G.totalEarned += n;
  $('gold-val').textContent = G.gold;
}
function spendGold(n) { G.gold -= n; $('gold-val').textContent = G.gold; }
function addFood(n) { G.food += n; $('food-val').textContent = G.food; }
function spendFood(n) { G.food -= n; $('food-val').textContent = G.food; }

function addXP(n) {
  G.xp += n;
  const thresh = XP_TABLE[Math.min(G.playerLevel, XP_TABLE.length-1)];
  if (G.xp >= thresh && G.playerLevel < 10) {
    G.playerLevel++;
    G.xp -= thresh;
    spawnFloatText(canvas.width/2, 80, `LEVEL UP! Lv${G.playerLevel}`, '#a78bfa');
    setMsg(`🎉 Level Up! Now Level ${G.playerLevel}!`);
    checkUnlocks();
  }
  updateXPBar();
}

function updateXPBar() {
  const thresh = XP_TABLE[Math.min(G.playerLevel, XP_TABLE.length-1)];
  const pct = Math.min(100, (G.xp / thresh) * 100);
  $('xp-fill').style.width = pct + '%';
  $('xp-val').textContent = G.xp;
  $('lv-val').textContent = `Lv${G.playerLevel}`;
}

function checkUnlocks() {
  const cav = $('bb-cavalry'), tank = $('bb-tank'), hint = $('unlock-hint');
  if (G.playerLevel >= 5) { cav.classList.remove('locked'); }
  if (G.playerLevel >= 8) { tank.classList.remove('locked'); }

  let hints = [];
  if (G.playerLevel < 5) hints.push(`Cavalry: Lv5`);
  if (G.playerLevel < 8) hints.push(`Tank: Lv8`);
  hint.textContent = hints.join(' | ');
}

// ============================================================
// ACHIEVEMENT SYSTEM
// ============================================================
function checkAchievements() {
  ACH_DEFS.forEach(a => {
    if (G.achievements[a.id]) return; // already done
    let val = 0;
    if (a.type==='kills')  val = G.totalKills;
    if (a.type==='built')  val = G.totalBuilt;
    if (a.type==='wins')   val = G.totalWins;
    if (a.type==='earned') val = G.totalEarned;
    if (a.type==='waves')  val = G.totalWaves;
    if (a.type==='bosses') val = G.totalBossKills;

    if (val >= a.req) {
      G.achievements[a.id] = true;
      addGold(a.reward);
      showAchievement(a);
      renderAchievements();
    }
  });
}

function showAchievement(a) {
  const toast = $('ach-toast');
  $('ach-toast-name').textContent = `${a.icon} ${a.name}`;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), 3000);
  playSound('win');
}

function renderAchievements() {
  const list = $('ach-list');
  list.innerHTML = '';
  ACH_DEFS.forEach(a => {
    const done = G.achievements[a.id];
    const div = document.createElement('div');
    div.className = 'ach-item' + (done?' done':'');
    div.innerHTML = `<span class="ach-ico">${a.icon}</span>
      <span class="ach-n">${a.name}</span>
      <span class="ach-prog">${done?'✓':''}</span>`;
    list.appendChild(div);
  });
}

// ============================================================
// BUILD UNIT
// ============================================================
function buildUnit(type) {
  const def = UNIT_DEF[type];
  if (!def) return;
  if (G.playerLevel < def.level) { setMsg(`Need Lv${def.level} to build ${def.name}!`); return; }
  if (G.gold < def.cost.g) { setMsg(`Not enough Gold! (need ${def.cost.g})`); return; }
  if (G.food < def.cost.f) { setMsg(`Not enough Food! (need ${def.cost.f}f)`); return; }

  // Find spawn near player base
  const bx = G.playerBase.tx, by = G.playerBase.ty;
  const offsets = [{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:1,y:2},{x:0,y:2},{x:-1,y:2},{x:3,y:0},{x:3,y:1}];
  let spawnTile = null;
  for (const off of offsets) {
    const tx = bx+off.x, ty = by+off.y;
    if (tx>=0&&tx<MAP_W&&ty>=0&&ty<MAP_H) {
      const tid = getTile(tx,ty);
      const tv = Object.values(TERRAIN).find(t=>t.id===tid);
      if (tv && tv.move < 99 && !G.units.some(u=>!u.dead&&u.tx===tx&&u.ty===ty)) {
        spawnTile = {x:tx,y:ty}; break;
      }
    }
  }
  if (!spawnTile) { setMsg('No space near base!'); return; }

  spendGold(def.cost.g); spendFood(def.cost.f);
  const u = new Unit(type, 'player', spawnTile.x, spawnTile.y);
  G.units.push(u);
  G.totalBuilt++;
  playSound('build');
  setMsg(`${def.emoji} ${def.name} deployed!`);
  spawnParticle(spawnTile.x*TILE+TILE/2, spawnTile.y*TILE+TILE/2, 'spark', 8);
  checkAchievements();
}

// ============================================================
// UPGRADE UNIT
// ============================================================
function upgradeUnit(u) {
  const cost = 80 + (u.upgAtk+u.upgDef+u.upgSpd)*40;
  if (G.gold < cost) { setMsg(`Need ${cost} gold to upgrade!`); return; }
  spendGold(cost);
  // round-robin upgrade
  const which = (u.upgAtk+u.upgDef+u.upgSpd) % 3;
  if (which===0) { u.upgAtk++; spawnFloatText(u.px+TILE/2, u.py, '+ATK!', '#ef4444'); }
  else if (which===1) { u.upgDef++; spawnFloatText(u.px+TILE/2, u.py, '+DEF!', '#3b82f6'); }
  else { u.upgSpd++; spawnFloatText(u.px+TILE/2, u.py, '+SPD!', '#22c55e'); }
  playSound('build');
  updateUnitPanel(u);
}

// ============================================================
// BASE OBJECTS
// ============================================================
function makeBase(team, tx, ty) {
  return { team, tx, ty, hp: 500, maxHp: 500, dead: false };
}

function attackBase(attacker, base) {
  if (attacker.attackCooldown > 0) return;
  const dmg = Math.max(1, attacker.effectiveAtk - 10);
  base.hp -= dmg;
  attacker.attackCooldown = 1000;
  attacker.attackAnim = 200;
  spawnParticle(base.tx*TILE+TILE, base.ty*TILE+TILE, 'explode', 8);
  spawnFloatText(base.tx*TILE+TILE, base.ty*TILE, `-${dmg}`, '#ef4444');
  playSound('attack');
  if (base.hp <= 0) { base.dead = true; base.hp = 0; checkGameOver(); }
}

function checkGameOver() {
  if (G.gameOver) return;
  if (G.enemyBase.dead) {
    G.gameOver = true;
    G.totalWins++;
    G.totalWaves++;
    setTimeout(showWin, 400);
  } else if (G.playerBase.dead) {
    G.gameOver = true;
    setTimeout(showLose, 400);
  }
}

// ============================================================
// WAVE & AI SYSTEM
// ============================================================
function startWave() {
  if (G.waveActive) return;
  G.waveActive = true;
  G.gameOver = false;
  setMsg(`⚔️ Wave ${G.wave} — Enemy attacking!`);

  // Reset bases
  G.playerBase.hp = G.playerBase.maxHp;
  G.enemyBase.hp  = G.enemyBase.maxHp;
  G.enemyBase.dead = false;
  G.playerBase.dead = false;

  // Resources per wave
  addGold(G.goldPerWave);
  addFood(G.foodPerWave);
  spawnFloatText(canvas.width/2, 60, `+${G.goldPerWave}G +${G.foodPerWave}F`, '#ffd700');

  // Spawn enemy wave
  const wave = G.wave;
  const types = wave>=15?['boss','tank','cavalry']:
                wave>=10?['tank','cavalry','archer','infantry']:
                wave>=5 ?['cavalry','archer','infantry']:
                         ['infantry','infantry','archer'];

  const count = 2 + Math.floor(wave * 0.8);

  // Check boss wave
  const isBossWave = wave % 5 === 0;
  if (isBossWave && !G.bossAlive) {
    spawnEnemyUnit('boss');
    G.bossAlive = true;
    $('boss-alert').classList.remove('hidden');
    playSound('boss');
    setMsg('👹 BOSS WAVE! Defeat the Boss!');
  }

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const t = types[i % types.length];
      if (t !== 'boss') spawnEnemyUnit(t);
    }, i * 600);
  }

  // random event
  setTimeout(triggerRandomEvent, 3000 + Math.random()*5000);
}

function spawnEnemyUnit(type) {
  const bx = G.enemyBase.tx, by = G.enemyBase.ty;
  const offsets = [{x:-2,y:0},{x:-2,y:1},{x:-2,y:2},{x:-1,y:2},{x:0,y:2},{x:-3,y:0},{x:-3,y:1}];
  let spawnTile = null;
  for (const off of offsets) {
    const tx=bx+off.x, ty=by+off.y;
    if (tx>=0&&tx<MAP_W&&ty>=0&&ty<MAP_H) {
      const tid = getTile(tx,ty);
      const tv = Object.values(TERRAIN).find(t=>t.id===tid);
      if (tv && tv.move<99 && !G.units.some(u=>!u.dead&&u.tx===tx&&u.ty===ty)) {
        spawnTile={x:tx,y:ty}; break;
      }
    }
  }
  if (!spawnTile) return;
  const u = new Unit(type, 'enemy', spawnTile.x, spawnTile.y);
  // scale stats with wave
  u.maxHp += G.wave * 8;
  u.hp     = u.maxHp;
  u.atk   += Math.floor(G.wave * 1.5);
  G.units.push(u);
}

// AI tick
function tickEnemyAI(dt) {
  if (!G.waveActive || G.gameOver) return;
  G.enemyAITimer += dt;
  if (G.enemyAITimer < 600) return;
  G.enemyAITimer = 0;

  const enemies = G.units.filter(u => u.team==='enemy' && !u.dead);
  enemies.forEach(e => {
    if (e.moving) return;
    // Find nearest player unit or base
    const playerUnits = G.units.filter(u=>u.team==='player'&&!u.dead);
    let target = null;
    let minDist = Infinity;

    playerUnits.forEach(p => {
      const d2 = dist(e,p);
      if (d2 < minDist) { minDist=d2; target=p; }
    });

    // also consider player base
    const baseDist = Math.max(Math.abs(e.tx-G.playerBase.tx), Math.abs(e.ty-G.playerBase.ty));
    if (!target || baseDist < minDist - 2) {
      // move toward player base
      if (baseDist <= e.range+1) {
        attackBase(e, G.playerBase);
        return;
      }
      const path = findPath(e.tx,e.ty, G.playerBase.tx+1, G.playerBase.ty+1, e);
      if (path && path.length > 0) {
        const steps = Math.min(e.effectiveSpd, path.length);
        e.path = path.slice(0, steps);
      }
      return;
    }

    if (minDist <= e.range) {
      attackUnit(e, target);
    } else {
      const path = findPath(e.tx,e.ty, target.tx, target.ty, e);
      if (path && path.length > 0) {
        const steps = Math.min(e.effectiveSpd, path.length-1);
        e.path = path.slice(0, steps);
      }
    }
  });

  // Check if all enemies dead
  if (enemies.length === 0 && G.waveActive) {
    endWave();
  }
}

function endWave() {
  G.waveActive = false;
  G.totalWaves++;
  setMsg(`✅ Wave ${G.wave} cleared! Prepare for next wave.`);
  G.wave++;
  $('wave-num').textContent = G.wave;
  checkAchievements();
}

// ============================================================
// RANDOM EVENTS
// ============================================================
function triggerRandomEvent() {
  if (G.gameOver || !G.waveActive) return;
  const roll = Math.random();
  if (roll < 0.33) {
    // Meteor impact
    const tx = 4 + Math.floor(Math.random()*(MAP_W-8));
    const ty = 4 + Math.floor(Math.random()*(MAP_H-8));
    setMsg('☄️ METEOR STRIKE incoming!');
    setTimeout(() => {
      spawnParticle(tx*TILE+TILE/2, ty*TILE+TILE/2, 'explode', 20);
      spawnParticle(tx*TILE+TILE/2, ty*TILE+TILE/2, 'fire', 12);
      // damage nearby units
      G.units.forEach(u => {
        if (!u.dead && Math.abs(u.tx-tx)<=1 && Math.abs(u.ty-ty)<=1) {
          u.hp -= 30; u.hitFlash = 200;
          if (u.hp<=0) killUnit(u, null);
        }
      });
    }, 1500);
  } else if (roll < 0.66) {
    // Supply drop
    const tx = 4 + Math.floor(Math.random()*(MAP_W-8));
    const ty = 4 + Math.floor(Math.random()*(MAP_H-8));
    G.supplyDrops.push({tx,ty,life:20000,collected:false});
    setMsg('📦 Supply crate dropped! Go pick it up!');
    spawnParticle(tx*TILE+TILE/2, ty*TILE+TILE/2, 'gold', 8);
  } else {
    // Resource boost
    const g = 50+Math.floor(Math.random()*100);
    addGold(g);
    setMsg(`💰 Found gold stash! +${g} Gold!`);
    spawnFloatText(canvas.width/2, 80, `+${g} GOLD!`, '#ffd700');
  }
}

// ============================================================
// UI HELPERS
// ============================================================
function setMsg(txt) {
  $('game-msg').textContent = txt;
}

function updateUnitPanel(u) {
  if (!u) {
    $('unit-name-disp').textContent = '—';
    $('hp-txt').textContent = '—';
    $('hp-fill').style.width = '0%';
    ['s-atk','s-def','s-rng','s-spd'].forEach(id => $(id).textContent='—');
    $('unit-action-btns').classList.add('hidden');
    portCtx.clearRect(0,0,48,48);
    return;
  }
  $('unit-name-disp').textContent = u.name;
  $('hp-txt').textContent = `${u.hp}/${u.maxHp}`;
  $('hp-fill').style.width = Math.max(0,(u.hp/u.maxHp)*100)+'%';
  $('s-atk').textContent = u.effectiveAtk + (u.upgAtk?` (+${u.upgAtk*5})`:'');
  $('s-def').textContent = u.effectiveDef + (u.upgDef?` (+${u.upgDef*3})`:'');
  $('s-rng').textContent = u.range;
  $('s-spd').textContent = u.effectiveSpd + (u.upgSpd?` (+${u.upgSpd})`:'');
  if (u.team === 'player') {
    $('unit-action-btns').classList.remove('hidden');
  } else {
    $('unit-action-btns').classList.add('hidden');
  }
  // draw portrait
  portCtx.clearRect(0,0,48,48);
  portCtx.fillStyle = '#0a0e1a';
  portCtx.fillRect(0,0,48,48);
  drawUnitSprite(portCtx, u.type, u.team, G.activeSkin, 0, 0, 48, 0);
}

// ============================================================
// MINIMAP
// ============================================================
function drawMinimap() {
  miniCtx.clearRect(0,0,148,90);
  const scaleX = 148/MAP_W, scaleY = 90/MAP_H;

  // terrain
  for (let ty=0; ty<MAP_H; ty++) {
    for (let tx=0; tx<MAP_W; tx++) {
      const tid = MAP_LAYOUT[ty][tx];
      const tv = Object.values(TERRAIN).find(t=>t.id===tid) || TERRAIN.GRASS;
      miniCtx.fillStyle = tv.color;
      miniCtx.fillRect(tx*scaleX, ty*scaleY, scaleX+0.5, scaleY+0.5);
    }
  }
  // bases
  miniCtx.fillStyle = '#3b82f6';
  miniCtx.fillRect(G.playerBase.tx*scaleX, G.playerBase.ty*scaleY, scaleX*2, scaleY*2);
  miniCtx.fillStyle = '#ef4444';
  miniCtx.fillRect(G.enemyBase.tx*scaleX, G.enemyBase.ty*scaleY, scaleX*2, scaleY*2);
  // units
  G.units.filter(u=>!u.dead).forEach(u => {
    miniCtx.fillStyle = u.team==='player'?'#60a5fa':'#f87171';
    miniCtx.fillRect(u.tx*scaleX, u.ty*scaleY, Math.max(2,scaleX), Math.max(2,scaleY));
  });
  // camera viewport
  const vpX = -G.camX / TILE * scaleX;
  const vpY = -G.camY / TILE * scaleY;
  const vpW = (canvas.width/G.zoom) / TILE * scaleX;
  const vpH = (canvas.height/G.zoom) / TILE * scaleY;
  miniCtx.strokeStyle = '#fbbf24';
  miniCtx.lineWidth = 1;
  miniCtx.strokeRect(vpX, vpY, vpW, vpH);
}

// ============================================================
// SKINS PANEL
// ============================================================
function renderSkins() {
  const list = $('skin-list');
  list.innerHTML = '';
  const persist = getPersist();
  SKIN_DEFS.forEach(sk => {
    const locked = G.playerLevel < sk.unlockLevel;
    const div = document.createElement('div');
    div.className = 'skin-item' + (G.activeSkin===sk.id?' active':'') + (locked?' locked':'');
    // tiny preview canvas
    const c2 = document.createElement('canvas');
    c2.width=32; c2.height=32;
    c2.style.imageRendering='pixelated';
    const cx2 = c2.getContext('2d');
    cx2.fillStyle='#0a0e1a'; cx2.fillRect(0,0,32,32);
    if (!locked) drawUnitSprite(cx2,'infantry','player',sk.id,0,0,32,0);
    else { cx2.fillStyle='#333'; cx2.fillRect(4,4,24,24); cx2.fillStyle='#666'; cx2.font='14px serif'; cx2.textAlign='center'; cx2.fillText('🔒',16,22); }
    div.appendChild(c2);
    const lbl = document.createElement('div');
    lbl.textContent = locked ? `Lv${sk.unlockLevel}` : sk.name;
    lbl.style.fontSize='6px'; lbl.style.marginTop='2px';
    div.appendChild(lbl);
    if (!locked) div.onclick = () => { G.activeSkin = sk.id; renderSkins(); };
    list.appendChild(div);
  });
}

// ============================================================
// DAILY REWARD
// ============================================================
function showDailyModal() {
  const persist = getPersist();
  const today = new Date().toDateString();
  const el = $('daily-content');
  const claimed = persist.dailyLastClaimed === today;

  if (claimed) {
    el.innerHTML = `<div style="color:#64748b">Already claimed today!<br>Come back tomorrow 🙂</div>`;
    $('btn-claim').disabled = true;
  } else {
    const rewards = [
      `🪙 +${100 + (persist.dailyStreak||0)*20} Gold`,
      `🌾 +${50 + (persist.dailyStreak||0)*10} Food`,
      `⭐ +50 XP Bonus`,
    ];
    el.innerHTML = rewards.map(r=>`<div>${r}</div>`).join('');
    $('btn-claim').disabled = false;
    $('btn-claim').onclick = () => {
      const g = 100 + (persist.dailyStreak||0)*20;
      const f = 50  + (persist.dailyStreak||0)*10;
      if (G.waveActive || $('game-container').classList.contains('hidden')) {
        // store for next game
        persist.pendingGold = (persist.pendingGold||0)+g;
        persist.pendingFood = (persist.pendingFood||0)+f;
      } else {
        addGold(g); addFood(f);
      }
      persist.dailyLastClaimed = today;
      persist.dailyStreak = (persist.dailyStreak||0)+1;
      writeSave(persist);
      el.innerHTML = `<div style="color:#22c55e">✅ Claimed! +${g}G +${f}F</div>`;
      $('btn-claim').disabled = true;
    };
  }
  $('daily-modal').classList.remove('hidden');
}

// ============================================================
// LEADERBOARD
// ============================================================
function showLeaderboard() {
  const persist = getPersist();
  // add current session score
  const scores = persist.leaderboard || [];
  const el = $('lb-content');
  if (scores.length === 0) {
    el.innerHTML = '<div style="color:#64748b">No scores yet. Play some games!</div>';
  } else {
    scores.sort((a,b)=>b.score-a.score);
    el.innerHTML = scores.slice(0,10).map((s,i)=>
      `<div class="lb-row"><span class="lb-rank">#${i+1}</span><span class="lb-name">${s.name}</span><span class="lb-score">${s.score}</span></div>`
    ).join('');
  }
  $('lb-modal').classList.remove('hidden');
}

function saveScore() {
  const persist = getPersist();
  const score = scoreCalc();
  persist.leaderboard = persist.leaderboard || [];
  persist.leaderboard.push({ name:`Player`, score, wave:G.wave, kills:G.totalKills });
  if (persist.leaderboard.length > 20) persist.leaderboard.sort((a,b)=>b.score-a.score).splice(10);
  writeSave(persist);
}

// ============================================================
// WIN / LOSE SCREENS
// ============================================================
function showWin() {
  playSound('win');
  saveScore();
  const g = 100+G.wave*20;
  addGold(g);
  $('win-stats').innerHTML = `
    <div>Wave: ${G.wave-1}</div>
    <div>Kills: ${G.totalKills}</div>
    <div>Score: ${scoreCalc()}</div>
    <div style="color:#ffd700">+${g} Gold Reward!</div>
  `;
  animateChest();
  $('win-screen').classList.remove('hidden');
}

function showLose() {
  saveScore();
  $('lose-stats').innerHTML = `
    <div>Wave: ${G.wave}</div>
    <div>Kills: ${G.totalKills}</div>
    <div>Score: ${scoreCalc()}</div>
  `;
  $('lose-screen').classList.remove('hidden');
}

function animateChest() {
  const c = chestCtx;
  let frame = 0;
  function drawChest(f) {
    c.clearRect(0,0,80,80);
    const open = f > 30;
    // chest body
    c.fillStyle = '#92400e'; c.fillRect(10, open?30:20, 60, 40);
    // lid
    c.fillStyle = '#b45309';
    if (!open) {
      c.fillRect(10, 20, 60, 18);
    } else {
      c.save(); c.translate(40,30); c.rotate(-Math.PI/4*(f-30)/30);
      c.fillRect(-30,-8,60,18); c.restore();
    }
    // gold band
    c.fillStyle = '#fbbf24'; c.fillRect(10, open?44:34, 60, 6);
    // lock
    if (!open) { c.fillStyle = '#fbbf24'; c.fillRect(35,30,10,14); c.fillRect(33,26,14,8); }
    // light rays if open
    if (open && f > 40) {
      c.save(); c.globalAlpha = (f-40)/30;
      for (let i=0;i<6;i++) {
        const a = (i/6)*Math.PI*2;
        c.fillStyle = '#ffd700';
        c.fillRect(40+Math.cos(a)*15, 25+Math.sin(a)*12, 3, 3);
      }
      c.restore();
    }
  }
  const interval = setInterval(() => {
    drawChest(frame);
    frame++;
    if (frame < 70) spawnParticle(chestCvs.getBoundingClientRect().left+40, chestCvs.getBoundingClientRect().top+25, 'gold', frame>30?2:0);
    if (frame >= 80) clearInterval(interval);
  }, 30);
  $('chest-reward').textContent = '🪙 Gold Reward + XP!';
}

// ============================================================
// TITLE ANIMATION
// ============================================================
function animateTitle() {
  const units = [
    {type:'infantry',team:'player',x:20, y:20},
    {type:'cavalry', team:'player',x:80, y:25},
    {type:'archer',  team:'player',x:150,y:15},
    {type:'tank',    team:'player',x:220,y:20},
    {type:'infantry',team:'enemy', x:310,y:20},
    {type:'cavalry', team:'enemy', x:340,y:25},
  ];
  let frame = 0;
  function drawTitle() {
    titleCtx.clearRect(0,0,400,100);
    titleCtx.fillStyle = '#060c14';
    titleCtx.fillRect(0,0,400,100);
    // ground
    titleCtx.fillStyle = '#1e3d1a';
    titleCtx.fillRect(0,68,400,32);
    units.forEach(u => {
      const off = u.team==='enemy'?-1:1;
      u.x += off * 0.4;
      drawUnitSprite(titleCtx, u.type, u.team, 'default', u.x-4, u.y, 36, frame);
    });
    frame++;
    requestAnimationFrame(drawTitle);
  }
  drawTitle();
}

// ============================================================
// CAMERA
// ============================================================
function clampCamera() {
  const maxX = 0, maxY = 0;
  const minX = -(MAP_W*TILE*G.zoom - canvas.width);
  const minY = -(MAP_H*TILE*G.zoom - canvas.height);
  G.camX = Math.max(minX, Math.min(maxX, G.camX));
  G.camY = Math.max(minY, Math.min(maxY, G.camY));
}

function screenToTile(sx, sy) {
  const wx = (sx - G.camX) / G.zoom;
  const wy = (sy - G.camY) / G.zoom;
  return { tx: Math.floor(wx/TILE), ty: Math.floor(wy/TILE) };
}

function tileToScreen(tx, ty) {
  return { x: tx*TILE*G.zoom + G.camX, y: ty*TILE*G.zoom + G.camY };
}

// ============================================================
// MAIN RENDER LOOP
// ============================================================
function resizeCanvas() {
  const wrap = $('canvas-wrap');
  canvas.width  = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
  fxCanvas.width  = canvas.width;
  fxCanvas.height = canvas.height;
  clampCamera();
}

function render() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  fxCtx.clearRect(0,0,W,H);

  ctx.save();
  ctx.translate(G.camX, G.camY);
  ctx.scale(G.zoom, G.zoom);

  // Draw terrain
  for (let ty=0; ty<MAP_H; ty++) {
    for (let tx=0; tx<MAP_W; tx++) {
      drawTile(ctx, MAP_LAYOUT[ty][tx], tx*TILE, ty*TILE);
    }
  }

  // Grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.5;
  for (let tx=0; tx<=MAP_W; tx++) { ctx.beginPath(); ctx.moveTo(tx*TILE,0); ctx.lineTo(tx*TILE,MAP_H*TILE); ctx.stroke(); }
  for (let ty=0; ty<=MAP_H; ty++) { ctx.beginPath(); ctx.moveTo(0,ty*TILE); ctx.lineTo(MAP_W*TILE,ty*TILE); ctx.stroke(); }

  // Move/attack range overlay
  if (G.selectedUnit && G.mode !== 'select') {
    const u = G.selectedUnit;
    for (let ty=0; ty<MAP_H; ty++) {
      for (let tx=0; tx<MAP_W; tx++) {
        const d = Math.max(Math.abs(u.tx-tx), Math.abs(u.ty-ty));
        if (G.mode==='move' && d<=u.effectiveSpd*2 && d>0) {
          const tid = getTile(tx,ty);
          const tv = Object.values(TERRAIN).find(t=>t.id===tid);
          if (tv && tv.move<99) {
            ctx.fillStyle = 'rgba(59,130,246,0.2)';
            ctx.fillRect(tx*TILE, ty*TILE, TILE, TILE);
            ctx.strokeStyle = 'rgba(59,130,246,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(tx*TILE, ty*TILE, TILE, TILE);
          }
        }
        if (G.mode==='attack' && d<=u.range && d>0) {
          ctx.fillStyle = 'rgba(239,68,68,0.2)';
          ctx.fillRect(tx*TILE, ty*TILE, TILE, TILE);
          ctx.strokeStyle = 'rgba(239,68,68,0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx*TILE, ty*TILE, TILE, TILE);
        }
      }
    }
  }

  // Supply drops
  G.supplyDrops.forEach(s => {
    if (!s.collected) {
      const px = s.tx*TILE, py = s.ty*TILE;
      ctx.fillStyle = '#92400e'; ctx.fillRect(px+6, py+8, TILE-12, TILE-12);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(px+10, py+12, TILE-20, TILE-20);
      ctx.fillStyle = '#fff'; ctx.font = '14px serif'; ctx.textAlign='center';
      ctx.fillText('📦', px+TILE/2, py+TILE/2+5);
    }
  });

  // Bases
  drawBase(ctx, 'player', G.playerBase.tx*TILE, G.playerBase.ty*TILE, G.playerBase.hp, G.playerBase.maxHp);
  drawBase(ctx, 'enemy',  G.enemyBase.tx*TILE,  G.enemyBase.ty*TILE,  G.enemyBase.hp,  G.enemyBase.maxHp);

  // Units
  G.units.filter(u=>!u.dead).forEach(u => u.draw(ctx));

  // Particles
  drawParticles(ctx);

  ctx.restore();

  // Minimap
  drawMinimap();
}

// ============================================================
// GAME LOOP
// ============================================================
function gameLoop(ts) {
  if (G.gameOver) return;
  if (G.paused) { G.rafId = requestAnimationFrame(gameLoop); return; }

  const dt = Math.min(ts - G.lastTime, 100);
  G.lastTime = ts;

  // Update all units
  G.units = G.units.filter(u => {
    if (u.dead) return false;
    u.update(dt);
    return true;
  });

  // Update particles
  updateParticles(dt);

  // Combo timer
  if (G.comboCount > 0) {
    G.comboTimer -= dt;
    if (G.comboTimer <= 0) G.comboCount = 0;
  }

  // Supply drop collect
  G.supplyDrops.forEach(s => {
    if (s.collected) return;
    s.life -= dt;
    if (s.life<=0) { s.collected=true; return; }
    const nearby = G.units.find(u=>u.team==='player'&&!u.dead&&u.tx===s.tx&&u.ty===s.ty);
    if (nearby) {
      s.collected = true;
      const g=30+Math.floor(Math.random()*50), f=15+Math.floor(Math.random()*25);
      addGold(g); addFood(f);
      spawnFloatText(s.tx*TILE+TILE/2, s.ty*TILE, `+${g}G +${f}F`, '#ffd700');
      setMsg(`📦 Supply collected! +${g}G +${f}F`);
    }
  });

  // Auto-combat: player units attack nearby enemies
  if (G.waveActive) {
    G.units.filter(u=>u.team==='player'&&!u.dead&&u.attackCooldown<=0&&!u.moving).forEach(u => {
      const enemies = G.units.filter(e=>e.team==='enemy'&&!e.dead);
      let nearest = null, minD = Infinity;
      enemies.forEach(e => { const d2=dist(u,e); if(d2<=u.range&&d2<minD){minD=d2;nearest=e;} });
      if (nearest) {
        u.facing = nearest.tx > u.tx ? 1 : -1;
        attackUnit(u, nearest);
        return;
      }
      // auto-advance in attack mode
      if (u.type==='infantry'||u.type==='cavalry') {
        const path = findPath(u.tx,u.ty,G.enemyBase.tx+1,G.enemyBase.ty+1,u);
        if (path&&path.length>0) {
          const steps=Math.min(u.effectiveSpd, path.length-1);
          if (steps>0) u.path = path.slice(0,steps);
        }
      }
    });

    tickEnemyAI(dt);
  }

  render();

  G.rafId = requestAnimationFrame(gameLoop);
}

// ============================================================
// INPUT HANDLING
// ============================================================
function setupInput() {
  // Canvas click
  canvas.addEventListener('click', e => {
    if (G.gameOver || G.paused) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const {tx, ty} = screenToTile(sx, sy);

    if (G.mode === 'select') {
      // Try to select a unit
      const clicked = G.units.find(u=>!u.dead && u.tx===tx && u.ty===ty);
      if (clicked) {
        G.selectedUnit = clicked;
        updateUnitPanel(clicked);
        setMsg(`Selected: ${clicked.name} (${clicked.team})`);
        playSound('select');
      } else {
        G.selectedUnit = null;
        updateUnitPanel(null);
      }

    } else if (G.mode === 'move' && G.selectedUnit) {
      const u = G.selectedUnit;
      const d2 = Math.max(Math.abs(u.tx-tx), Math.abs(u.ty-ty));
      if (d2 <= u.effectiveSpd*2 && canEnter(tx,ty,u)) {
        const path = findPath(u.tx,u.ty,tx,ty,u);
        if (path) {
          u.path = path.slice(0, u.effectiveSpd*2);
          u.tx = path[path.length-1]?.x || tx;
          u.ty = path[path.length-1]?.y || ty;
          setMsg(`${u.name} moving...`);
        }
      }
      G.mode = 'select';
      canvas.className = '';

    } else if (G.mode === 'attack' && G.selectedUnit) {
      const u = G.selectedUnit;
      const target = G.units.find(e=>!e.dead&&e.tx===tx&&e.ty===ty&&e.team!==u.team);
      if (target) {
        const d2 = dist(u, target);
        if (d2 <= u.range) {
          attackUnit(u, target);
          setMsg(`${u.name} attacks ${target.name}!`);
        } else {
          setMsg(`Target out of range! (range: ${u.range})`);
        }
      }
      G.mode = 'select';
      canvas.className = '';
    }
  });

  // Right-click deselect
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    G.selectedUnit = null;
    G.mode = 'select';
    canvas.className = '';
    updateUnitPanel(null);
  });

  // Drag pan
  canvas.addEventListener('mousedown', e => {
    if (e.button === 1 || e.button === 2) {
      G.dragging = true;
      G.dragStartX = e.clientX;
      G.dragStartY = e.clientY;
      G.dragCamX = G.camX;
      G.dragCamY = G.camY;
    }
  });
  canvas.addEventListener('mousemove', e => {
    if (G.dragging) {
      G.camX = G.dragCamX + (e.clientX - G.dragStartX);
      G.camY = G.dragCamY + (e.clientY - G.dragStartY);
      clampCamera();
    }
  });
  window.addEventListener('mouseup', () => { G.dragging = false; });

  // Mouse wheel zoom
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const oldZoom = G.zoom;
    G.zoom = Math.max(0.5, Math.min(2.5, G.zoom - e.deltaY*0.001));
    // zoom toward cursor
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    G.camX = mx - (mx - G.camX) * (G.zoom/oldZoom);
    G.camY = my - (my - G.camY) * (G.zoom/oldZoom);
    clampCamera();
  }, {passive:false});

  // Touch support
  let lastTouchDist = 0;
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      G.dragging = true;
      G.dragStartX = e.touches[0].clientX;
      G.dragStartY = e.touches[0].clientY;
      G.dragCamX = G.camX; G.dragCamY = G.camY;
    } else if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    }
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length===1 && G.dragging) {
      G.camX = G.dragCamX+(e.touches[0].clientX-G.dragStartX);
      G.camY = G.dragCamY+(e.touches[0].clientY-G.dragStartY);
      clampCamera();
    } else if (e.touches.length===2) {
      const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      G.zoom = Math.max(0.5,Math.min(2.5,G.zoom*(d/lastTouchDist)));
      lastTouchDist=d; clampCamera();
    }
  },{passive:false});
  canvas.addEventListener('touchend', ()=>{ G.dragging=false; });

  // Minimap click to navigate
  minimap.addEventListener('click', e => {
    const rect = minimap.getBoundingClientRect();
    const mx = e.clientX-rect.left, my = e.clientY-rect.top;
    const tx = (mx/148)*MAP_W, ty = (my/90)*MAP_H;
    G.camX = -(tx*TILE*G.zoom - canvas.width/2);
    G.camY = -(ty*TILE*G.zoom - canvas.height/2);
    clampCamera();
  });

  // HUD buttons
  $('btn-move-mode').onclick = () => {
    if (!G.selectedUnit || G.selectedUnit.team!=='player') return;
    G.mode = 'move';
    canvas.className = 'mode-move';
    setMsg('Click a tile to move unit');
  };
  $('btn-atk-mode').onclick = () => {
    if (!G.selectedUnit || G.selectedUnit.team!=='player') return;
    G.mode = 'attack';
    canvas.className = 'mode-attack';
    setMsg('Click an enemy to attack');
  };
  $('btn-upgrade-unit').onclick = () => {
    if (!G.selectedUnit) return;
    upgradeUnit(G.selectedUnit);
  };

  $('btn-next-wave').onclick = () => {
    if (!G.waveActive) { startWave(); $('btn-next-wave').textContent='⚔️ FIGHTING'; }
    else setMsg('Wave already in progress!');
  };
  $('btn-pause').onclick = () => { togglePause(); };
  $('btn-resume').onclick = () => { togglePause(); };
  $('btn-quit').onclick = () => { goToMenu(); };

  // Build buttons
  document.querySelectorAll('.build-btn').forEach(btn => {
    btn.onclick = () => {
      if (!btn.classList.contains('locked')) buildUnit(btn.dataset.type);
    };
  });

  // Win/lose buttons
  $('btn-next-level').onclick = () => { $('win-screen').classList.add('hidden'); resetWave(); };
  $('btn-menu-win').onclick = () => { $('win-screen').classList.add('hidden'); goToMenu(); };
  $('btn-retry').onclick = () => { $('lose-screen').classList.add('hidden'); startNewGame(); };
  $('btn-menu-lose').onclick = () => { $('lose-screen').classList.add('hidden'); goToMenu(); };

  // Title buttons
  $('btn-start').onclick = () => { startNewGame(); };
  $('btn-leaderboard').onclick = () => showLeaderboard();
  $('btn-daily').onclick = () => showDailyModal();

  // Modal close
  $('btn-close-daily').onclick = () => $('daily-modal').classList.add('hidden');
  $('btn-close-lb').onclick = () => $('lb-modal').classList.add('hidden');
}

// ============================================================
// GAME LIFECYCLE
// ============================================================
function startNewGame() {
  if (G.rafId) cancelAnimationFrame(G.rafId);

  $('title-screen').classList.add('hidden');
  $('game-container').classList.remove('hidden');
  $('win-screen').classList.add('hidden');
  $('lose-screen').classList.add('hidden');
  $('pause-screen').classList.add('hidden');
  $('boss-alert').classList.add('hidden');

  G = makeState();

  // Apply persistent data
  const persist = getPersist();
  G.achievements = {...(persist.achievements||{})};
  G.activeSkin   = persist.activeSkin || 'default';

  // Apply pending daily rewards
  if (persist.pendingGold) { G.gold += persist.pendingGold; persist.pendingGold=0; }
  if (persist.pendingFood) { G.food += persist.pendingFood; persist.pendingFood=0; }
  writeSave(persist);

  // Place bases
  G.playerBase = makeBase('player', 1, MAP_H/2-1);
  G.enemyBase  = makeBase('enemy', MAP_W-3, MAP_H/2-1);

  // Initial player units
  const u1 = new Unit('infantry','player', G.playerBase.tx+2, G.playerBase.ty);
  const u2 = new Unit('infantry','player', G.playerBase.tx+2, G.playerBase.ty+1);
  G.units.push(u1, u2);

  // Camera: start at player base
  G.camX = -G.playerBase.tx * TILE * G.zoom + 80;
  G.camY = -G.playerBase.ty * TILE * G.zoom + 100;

  resizeCanvas();
  clampCamera();
  updateXPBar();
  checkUnlocks();
  renderAchievements();
  renderSkins();
  $('gold-val').textContent = G.gold;
  $('food-val').textContent = G.food;
  $('wave-num').textContent = G.wave;
  $('btn-next-wave').textContent = '⚡ NEXT WAVE';

  G.lastTime = performance.now();
  G.rafId = requestAnimationFrame(gameLoop);

  setMsg('Welcome Commander! Build troops and start a wave!');
}

function resetWave() {
  // Remove all units, keep player progression
  G.units = [];
  G.particles = [];
  G.supplyDrops = [];
  G.waveActive = false;
  G.gameOver = false;
  G.bossAlive = false;
  G.playerBase.hp = G.playerBase.maxHp;
  G.enemyBase.hp = G.enemyBase.maxHp;
  G.enemyBase.dead = false;
  G.playerBase.dead = false;
  $('btn-next-wave').textContent = '⚡ NEXT WAVE';
  $('boss-alert').classList.add('hidden');

  // Give starter units
  const u1 = new Unit('infantry','player', G.playerBase.tx+2, G.playerBase.ty);
  const u2 = new Unit('infantry','player', G.playerBase.tx+2, G.playerBase.ty+1);
  G.units.push(u1, u2);

  addGold(G.goldPerWave + G.wave*10);
  addFood(G.foodPerWave);
  $('wave-num').textContent = G.wave;
  setMsg(`Wave ${G.wave} ready! Build your army!`);
}

function togglePause() {
  G.paused = !G.paused;
  $('pause-screen').classList.toggle('hidden', !G.paused);
  $('btn-pause').textContent = G.paused ? '▶' : '⏸';
}

function goToMenu() {
  if (G.rafId) cancelAnimationFrame(G.rafId);
  savePersist();
  G.gameOver = true;
  $('game-container').classList.add('hidden');
  $('pause-screen').classList.add('hidden');
  $('title-screen').classList.remove('hidden');
}

// ============================================================
// INIT
// ============================================================
window.addEventListener('load', () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setupInput();
  animateTitle();
  setInterval(() => { if (G.waveActive && !G.gameOver) checkAchievements(); }, 5000);
});
