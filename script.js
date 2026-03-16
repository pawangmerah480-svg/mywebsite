/* ============================================================
   SCHOOL ESCAPE — script.js  v2.0
   + Shop System  + Upgrade System  + Alarm System
   ============================================================ */
'use strict';

// ──────────────────────────────────────────────
// 1. CONSTANTS & CONFIG
// ──────────────────────────────────────────────
const TILE         = 40;
const FPS          = 60;
const BASE_WALK    = 2.4;
const BASE_RUN     = 4.4;
const BASE_STAMINA = 100;
const STAMINA_DRAIN = 0.55;
const STAMINA_REGEN = 0.35;

// ──────────────────────────────────────────────
// 2. STATIC DATA
// ──────────────────────────────────────────────
const LEVEL_DATA = [
  { id:1, name:"Sekolah Kecil",      duration:180, teachers:2, hasCCTV:false, hasSecurity:false, hasPrincipal:false, gridW:20, gridH:15 },
  { id:2, name:"Kampus Luas",        duration:150, teachers:4, hasCCTV:false, hasSecurity:false, hasPrincipal:false, gridW:26, gridH:18 },
  { id:3, name:"CCTV Aktif",         duration:130, teachers:4, hasCCTV:true,  hasSecurity:false, hasPrincipal:false, gridW:28, gridH:20 },
  { id:4, name:"Satpam Patroli",     duration:120, teachers:4, hasCCTV:true,  hasSecurity:true,  hasPrincipal:false, gridW:30, gridH:22 },
  { id:5, name:"Boss: Kepala Sekolah",duration:100,teachers:5, hasCCTV:true,  hasSecurity:true,  hasPrincipal:true,  gridW:32, gridH:24 }
];

const SKINS = [
  { id:'default', name:'Murid Biasa',   emoji:'🧒', unlockLevel:0 },
  { id:'nerd',    name:'Si Kutu Buku',  emoji:'🤓', unlockLevel:1 },
  { id:'athlete', name:'Atlet Sekolah', emoji:'🏃', unlockLevel:2 },
  { id:'rebel',   name:'Si Nakal',      emoji:'😎', unlockLevel:3 },
  { id:'ninja',   name:'Ninja',         emoji:'🥷', unlockLevel:4 },
  { id:'ghost',   name:'Hantu?',        emoji:'👻', unlockLevel:5 }
];

const ACHIEVEMENTS_DEF = [
  { id:'first_escape', icon:'🎒', name:'Kabur Pertama',   desc:'Selesaikan level 1' },
  { id:'speedrun',     icon:'⚡', name:'Speedrun!',        desc:'Selesaikan level dalam 60 detik' },
  { id:'ghost_mode',   icon:'👻', name:'Ghost Mode',       desc:'Selesaikan tanpa ketahuan sama sekali' },
  { id:'collector',    icon:'🎁', name:'Kolektor',         desc:'Kumpulkan semua item dalam 1 level' },
  { id:'never_caught', icon:'🏃', name:'Tak Tertangkap',   desc:'Selesaikan 3 level tanpa ketangkap' },
  { id:'master',       icon:'🏆', name:'Master Kabur',     desc:'Selesaikan semua 5 level' },
  { id:'night_owl',    icon:'🦉', name:'Si Berani',        desc:'Main di level 4 atau 5' },
  { id:'rich_kid',     icon:'🪙', name:'Si Tajir',         desc:'Kumpulkan 500 koin total' },
  { id:'shopper',      icon:'🛒', name:'Pembeli Setia',    desc:'Beli 5 item dari toko' },
  { id:'upgraded',     icon:'💪', name:'Upgrade Sempurna', desc:'Maximalkan 1 upgrade' }
];

const ITEMS_DEF = {
  class_key:    { emoji:'🔑', name:'Kunci Kelas',   desc:'Membuka pintu kelas terkunci' },
  gate_key:     { emoji:'🗝️',  name:'Kunci Gerbang', desc:'Kunci untuk gerbang keluar utama' },
  school_map:   { emoji:'🗺️',  name:'Peta Sekolah',  desc:'Menampilkan layout sekolah' },
  energy_drink: { emoji:'🥤', name:'Minuman Energi', desc:'Mengisi penuh stamina' },
  access_card:  { emoji:'💳', name:'Kartu Akses',   desc:'Membuka ruang guru' }
};

// ── SHOP items ──
const SHOP_ITEMS = [
  {
    id:'shop_energy',    emoji:'🥤', name:'Energy Drink',
    desc:'Isi stamina penuh saat dipakai (tekan Q)',
    price:40, stackable:true, maxOwn:5, activeUse:true
  },
  {
    id:'shop_shoes',     emoji:'👟', name:'Silent Shoes',
    desc:'Langkah tanpa suara, guru susah mendengar (1 level)',
    price:80, stackable:false, maxOwn:1, activeUse:false, passive:true
  },
  {
    id:'shop_smoke',     emoji:'💨', name:'Smoke Bomb',
    desc:'Layar berasap 5 detik — guru kehilangan jejakmu (tekan Q)',
    price:100, stackable:true, maxOwn:3, activeUse:true
  },
  {
    id:'shop_map_up',    emoji:'🗺️', name:'Map Upgrade',
    desc:'Mini map lebih besar & tampilkan posisi semua guru (1 level)',
    price:60, stackable:false, maxOwn:1, activeUse:false, passive:true
  },
  {
    id:'shop_flash',     emoji:'💳', name:'Flash Card',
    desc:'Buka pintu terkunci TANPA kunci kelas (1 kali)',
    price:90, stackable:true, maxOwn:3, activeUse:true
  }
];

// ── UPGRADE definitions ──
const UPGRADES_DEF = [
  {
    id:'stamina_up', emoji:'💛', name:'Stamina Upgrade',
    desc:'Tambah stamina maksimal (+20 per level)',
    maxLevel:5, baseCost:80, costMult:1.4,
    apply: (lvl) => { /* computed dynamically */ }
  },
  {
    id:'speed_up',   emoji:'💨', name:'Speed Upgrade',
    desc:'Tambah kecepatan lari (+0.4 per level)',
    maxLevel:5, baseCost:100, costMult:1.5,
    apply: (lvl) => {}
  },
  {
    id:'stealth_up', emoji:'🫥', name:'Stealth Upgrade',
    desc:'Kurangi jarak penglihatan guru (-0.5 tile per level)',
    maxLevel:5, baseCost:120, costMult:1.5,
    apply: (lvl) => {}
  },
  {
    id:'inv_up',     emoji:'🎒', name:'Inventory Upgrade',
    desc:'Tambah slot inventori (+1 per level, max 5)',
    maxLevel:3, baseCost:70,  costMult:1.6,
    apply: (lvl) => {}
  }
];

function upgradeCost(def, currentLevel) {
  return Math.round(def.baseCost * Math.pow(def.costMult, currentLevel));
}

// ──────────────────────────────────────────────
// 3. SAVE / LOAD
// ──────────────────────────────────────────────
const SAVE_KEY = 'schoolEscape_v2';
let saveData = {
  unlockedLevels:    [1],
  currentLevel:      1,
  bestScores:        {},
  achievements:      [],
  activeSkin:        'default',
  neverCaughtStreak: 0,
  coins:             0,
  totalCoins:        0,  // lifetime total for achievements
  shopPurchases:     0,
  ownedItems:        {},   // { shop_id: count }
  upgrades:          {}    // { upgrade_id: level }
};

function loadSave() {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    if (s) saveData = { ...saveData, ...JSON.parse(s) };
    // migrate from v1
    if (!saveData.coins)         saveData.coins = 0;
    if (!saveData.ownedItems)    saveData.ownedItems = {};
    if (!saveData.upgrades)      saveData.upgrades = {};
    if (!saveData.totalCoins)    saveData.totalCoins = 0;
    if (!saveData.shopPurchases) saveData.shopPurchases = 0;
  } catch(e) {}
}
function writeSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(saveData)); } catch(e) {}
}

function addCoins(n) {
  saveData.coins      = (saveData.coins || 0) + n;
  saveData.totalCoins = (saveData.totalCoins || 0) + n;
  writeSave();
  if (saveData.totalCoins >= 500) unlockAchievement('rich_kid');
}
function spendCoins(n) {
  if (saveData.coins < n) return false;
  saveData.coins -= n;
  writeSave();
  return true;
}

function unlockAchievement(id) {
  if (saveData.achievements.includes(id)) return;
  saveData.achievements.push(id);
  writeSave();
  const ach = ACHIEVEMENTS_DEF.find(a => a.id === id);
  if (ach) showNotification(`${ach.icon} Achievement: ${ach.name}!`, '#f5a623');
}

// Computed player stats from upgrades
function getPlayerStats() {
  const ups = saveData.upgrades;
  const staminaLvl = ups.stamina_up || 0;
  const speedLvl   = ups.speed_up   || 0;
  const stealthLvl = ups.stealth_up || 0;
  const invLvl     = ups.inv_up     || 0;
  return {
    maxStamina:  BASE_STAMINA + staminaLvl * 20,
    runSpeed:    BASE_RUN    + speedLvl   * 0.4,
    walkSpeed:   BASE_WALK   + speedLvl   * 0.2,
    stealthMod:  stealthLvl  * 0.5,   // tiles subtracted from fovDist
    maxInventory: 5 + invLvl           // base 5 slots
  };
}

// ──────────────────────────────────────────────
// 4. AUDIO (Web Audio API)
// ──────────────────────────────────────────────
let audioCtx = null;
let bgmNode  = null, bgmGain = null;
let alarmNode = null, alarmGain = null;
let isTense  = false;

function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}
function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}
function playTone(freq, dur, type='square', vol=0.15, delay=0) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = type; osc.frequency.value = freq;
  const t = audioCtx.currentTime + delay;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t); osc.stop(t + dur + 0.05);
}
function sfxStep(silent=false) {
  if (!audioCtx || silent) return;
  playTone(80 + Math.random()*40, 0.05, 'sine', 0.08);
}
function sfxPickup() {
  [500,700,900].forEach((f,i) => playTone(f, 0.1, 'sine', 0.2, i*0.08));
}
function sfxDoor()  { playTone(200,.3,'sawtooth',.15); playTone(160,.3,'sawtooth',.15,.05); }
function sfxAlert() { [800,1000,800,1000].forEach((f,i)=>playTone(f,.12,'square',.25,i*.1)); }
function sfxWin()   { [523,659,784,1047].forEach((f,i)=>playTone(f,.3,'sine',.3,i*.12)); }
function sfxLose()  { [400,300,200,100].forEach((f,i)=>playTone(f,.3,'sawtooth',.25,i*.1)); }
function sfxHide()  { playTone(300,.2,'sine',.12); playTone(400,.2,'sine',.12,.1); }
function sfxBuy()   { [600,800].forEach((f,i)=>playTone(f,.1,'sine',.2,i*.08)); }
function sfxUseItem(){ [700,900,700].forEach((f,i)=>playTone(f,.08,'sine',.18,i*.06)); }

// Alarm siren
function startAlarmSFX() {
  if (!audioCtx) return;
  stopAlarmSFX();
  alarmGain = audioCtx.createGain();
  alarmGain.gain.value = 0.2;
  alarmGain.connect(audioCtx.destination);
  let phase = 0;
  function tick() {
    if (!alarmGain) return;
    const osc = audioCtx.createOscillator();
    const g   = audioCtx.createGain();
    osc.connect(g); g.connect(alarmGain);
    osc.type = 'sawtooth';
    osc.frequency.value = phase % 2 === 0 ? 880 : 660;
    const t = audioCtx.currentTime;
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.start(t); osc.stop(t + 0.25);
    phase++;
    alarmNode = setTimeout(tick, 240);
  }
  tick();
}
function stopAlarmSFX() {
  if (alarmNode)  clearTimeout(alarmNode);
  if (alarmGain) { alarmGain.disconnect(); alarmGain = null; }
  alarmNode = null;
}

function startBGM(tense=false) {
  if (!audioCtx) return;
  stopBGM();
  isTense  = tense;
  bgmGain  = audioCtx.createGain();
  bgmGain.gain.value = tense ? 0.12 : 0.06;
  bgmGain.connect(audioCtx.destination);
  const notes = tense ? [110,120,130,120,110,100,90,100] : [262,294,330,349,392,330,294,262];
  const tempo = tense ? 0.18 : 0.35;
  let i = 0;
  function tick() {
    if (!bgmGain) return;
    const osc = audioCtx.createOscillator();
    const g   = audioCtx.createGain();
    osc.connect(g); g.connect(bgmGain);
    osc.type = tense ? 'sawtooth' : 'triangle';
    osc.frequency.value = notes[i % notes.length];
    const t = audioCtx.currentTime;
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + tempo - 0.02);
    osc.start(t); osc.stop(t + tempo);
    i++;
    bgmNode = setTimeout(tick, tempo * 1000);
  }
  tick();
}
function stopBGM() {
  if (bgmNode) clearTimeout(bgmNode);
  if (bgmGain) { bgmGain.disconnect(); bgmGain = null; }
  bgmNode = null;
}

// ──────────────────────────────────────────────
// 5. UTILS
// ──────────────────────────────────────────────
function rnd(a,b)  { return a + Math.random()*(b-a); }
function rndInt(a,b){ return Math.floor(rnd(a,b+1)); }
function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }
function dist(ax,ay,bx,by){ return Math.hypot(ax-bx,ay-by); }
function angleTowards(fx,fy,tx,ty){ return Math.atan2(ty-fy,tx-fx); }
function normAngle(a){
  while(a > Math.PI)  a -= Math.PI*2;
  while(a < -Math.PI) a += Math.PI*2;
  return a;
}
function angleDiff(a,b){ return Math.abs(normAngle(a-b)); }
function inFOV(facing,half,check){ return angleDiff(facing,check)<=half; }

// ──────────────────────────────────────────────
// 6. MAP GENERATOR
// ──────────────────────────────────────────────
function generateMap(cfg) {
  const W = cfg.gridW, H = cfg.gridH;
  const tiles = Array.from({length:H}, () => new Uint8Array(W).fill(1));
  const rooms = [];

  function tryRoom(rx,ry,rw,rh) {
    for(let y=ry-1;y<ry+rh+1;y++)
      for(let x=rx-1;x<rx+rw+1;x++)
        if(x<0||x>=W||y<0||y>=H) return false;
    for(const r of rooms)
      if(rx<r.x+r.w+2&&rx+rw>r.x-2&&ry<r.y+r.h+2&&ry+rh>r.y-2) return false;
    return true;
  }
  function carveRoom(rx,ry,rw,rh){
    for(let y=ry;y<ry+rh;y++) for(let x=rx;x<rx+rw;x++) tiles[y][x]=0;
    rooms.push({x:rx,y:ry,w:rw,h:rh});
  }
  function corridor(x1,y1,x2,y2){
    let cx=x1,cy=y1;
    while(cx!==x2){tiles[cy][cx]=0;cx+=Math.sign(x2-cx);}
    while(cy!==y2){tiles[cy][cx]=0;cy+=Math.sign(y2-cy);}
  }

  const numRooms = Math.floor(W*H/70)+4;
  for(let a=0;a<300;a++){
    const rw=rndInt(4,8),rh=rndInt(3,6);
    const rx=rndInt(1,W-rw-1),ry=rndInt(1,H-rh-1);
    if(tryRoom(rx,ry,rw,rh)){ carveRoom(rx,ry,rw,rh); if(rooms.length>=numRooms)break; }
  }
  for(let i=1;i<rooms.length;i++){
    const a=rooms[i-1],b=rooms[i];
    corridor(a.x+Math.floor(a.w/2),a.y+Math.floor(a.h/2),b.x+Math.floor(b.w/2),b.y+Math.floor(b.h/2));
  }

  const itemPositions=[], doorPositions=[];
  for(const r of rooms){
    const cx=r.x+Math.floor(r.w/2);
    if(r.w>=5&&Math.random()<.7) tiles[r.y+1][r.x+1]=5;
    if(r.h>=4&&Math.random()<.6) tiles[r.y+r.h-2][r.x+r.w-2]=4;
    if(Math.random()<.5&&r.y>1){ tiles[r.y][cx]=2; doorPositions.push({x:cx,y:r.y}); }
    itemPositions.push({x:r.x+rndInt(1,r.w-2),y:r.y+rndInt(1,r.h-2)});
  }
  const tr=rooms[rooms.length-1];
  if(tr&&tr.w>=3&&tr.h>=3) tiles[tr.y+1][tr.x+1]=6;

  const startRoom=rooms[0];
  const playerStart={
    x:(startRoom.x+Math.floor(startRoom.w/2))*TILE+TILE/2,
    y:(startRoom.y+Math.floor(startRoom.h/2))*TILE+TILE/2
  };
  const exitRoom=rooms[rooms.length-1];
  const ex=exitRoom.x+Math.floor(exitRoom.w/2), ey=exitRoom.y+Math.floor(exitRoom.h/2);
  tiles[ey][ex]=7;
  const exitPos={x:ex*TILE+TILE/2,y:ey*TILE+TILE/2};

  const reqItems=['gate_key','class_key','access_card','energy_drink','school_map'];
  const placed=[];
  for(let i=0;i<Math.min(reqItems.length,itemPositions.length);i++){
    const p=itemPositions[i];
    if(tiles[p.y]&&tiles[p.y][p.x]===0)
      placed.push({type:reqItems[i],x:p.x*TILE+TILE/2,y:p.y*TILE+TILE/2,collected:false});
  }

  const hides=[];
  for(let y=0;y<H;y++) for(let x=0;x<W;x++)
    if(tiles[y][x]===4||tiles[y][x]===5||tiles[y][x]===6)
      hides.push({x:x*TILE+TILE/2,y:y*TILE+TILE/2,tile:tiles[y][x]});

  const floorTiles=[];
  for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++)
    if(tiles[y][x]===0) floorTiles.push({x:x*TILE+TILE/2,y:y*TILE+TILE/2});

  return {tiles,W,H,playerStart,exitPos,items:placed,hides,doors:doorPositions,floorTiles};
}

// ──────────────────────────────────────────────
// 7. ENTITY CLASSES
// ──────────────────────────────────────────────
class Player {
  constructor(x,y,skinId='default'){
    this.x=x; this.y=y;
    this.facing=0;
    const stats=getPlayerStats();
    this.maxStamina=stats.maxStamina;
    this.stamina=this.maxStamina;
    this.running=false;
    this.hiding=false;
    this.hideSpot=null;
    this.inventory=[];
    this.stepTimer=0;
    this.walkFrame=0;
    this.walkAnim=0;
    this.caught=false;
    this.skin=SKINS.find(s=>s.id===skinId)||SKINS[0];
    // shop passive effects (set on level init)
    this.hasSilentShoes=false;
    this.hasMapUpgrade=false;
    // active item queue
    this.activeItems=[]; // [{id, emoji, name}]
  }
  get tileX(){ return Math.floor(this.x/TILE); }
  get tileY(){ return Math.floor(this.y/TILE); }
  hasItem(type){ return this.inventory.some(i=>i===type); }
  addItem(type){
    const stats=getPlayerStats();
    if(this.inventory.length>=stats.maxInventory){ showNotification('🎒 Inventori penuh!','#f44336'); return false; }
    if(!this.hasItem(type)){ this.inventory.push(type); return true; }
    return false;
  }
}

class Teacher {
  constructor(x,y,cfg={}){
    this.x=x; this.y=y;
    this.facing=Math.random()*Math.PI*2;
    this.baseSpeed=cfg.speed||1.5;
    this.speed=this.baseSpeed;
    this.fovAngle=cfg.fovAngle||Math.PI*.45;
    this.fovDist=cfg.fovDist||TILE*5;
    this.patrol=[];
    this.patrolIdx=0;
    this.patrolWait=0;
    this.state='patrol';
    this.alertTimer=0;
    this.lastSeenX=0; this.lastSeenY=0;
    this.exclamTimer=0;
    this.color=cfg.color||'#e57373';
    this.emoji=cfg.emoji||'👩‍🏫';
    this.type=cfg.type||'teacher';
    this.walkFrame=0; this.walkAnim=0;
    this.isExtra=cfg.isExtra||false; // alarm-spawned
  }
  get tileX(){ return Math.floor(this.x/TILE); }
  get tileY(){ return Math.floor(this.y/TILE); }
}

class CCTV {
  constructor(x,y,angle=0){
    this.x=x; this.y=y;
    this.angle=angle;
    this.sweepDir=1;
    this.sweepAngle=angle;
    this.fovAngle=Math.PI*.35;
    this.fovDist=TILE*6;
    this.alerted=false;
    this.alertTimer=0;
  }
}

// ──────────────────────────────────────────────
// 8. ALARM SYSTEM STATE
// ──────────────────────────────────────────────
const alarm = {
  active:    false,
  timer:     0,
  duration:  12,      // seconds alarm stays active
  speedMult: 1.5,     // teacher speed multiplier during alarm
};

function triggerAlarm(reason='') {
  if (alarm.active) {
    // Reset timer if already active
    alarm.timer = alarm.duration;
    return;
  }
  alarm.active = true;
  alarm.timer  = alarm.duration;

  // Visual
  document.getElementById('alarm-overlay').classList.add('active');
  document.getElementById('hud-alarm').classList.remove('hidden');

  // Audio
  startAlarmSFX();
  startBGM(true); // switch to tense

  // Speed boost teachers
  for(const t of game.teachers) t.speed = t.baseSpeed * alarm.speedMult;

  // Spawn extra patrol teacher at alarm
  spawnExtraTeacher();

  showHudAlert('🚨 ALARM SEKOLAH AKTIF!');
  showNotification(`🚨 ALARM! ${reason}`, '#f44336');
  game.nearCaughtCount += 2;
}

function deactivateAlarm() {
  alarm.active = false;
  document.getElementById('alarm-overlay').classList.remove('active');
  document.getElementById('hud-alarm').classList.add('hidden');
  stopAlarmSFX();
  // restore teacher speeds
  for(const t of game.teachers) t.speed = t.baseSpeed;
  // Remove extra teachers
  game.teachers = game.teachers.filter(t => !t.isExtra);
  startBGM(game.anyTeacherChasing || game.timer < 30);
  showNotification('✅ Alarm reda', '#4caf50');
}

function spawnExtraTeacher() {
  if(!game.map || game.map.floorTiles.length < 10) return;
  const ft = game.map.floorTiles;
  let spawn;
  for(let i=0;i<30;i++){
    spawn = ft[rndInt(0,ft.length-1)];
    if(dist(spawn.x,spawn.y,game.player.x,game.player.y)>TILE*10) break;
  }
  if(!spawn) return;
  const t = new Teacher(spawn.x, spawn.y, {
    emoji:'🏃', color:'#ff5722', speed:1.8 * alarm.speedMult, fovDist:TILE*5.5, isExtra:true
  });
  t.isExtra = true;
  const numWP = rndInt(3,6);
  for(let w=0;w<numWP;w++) t.patrol.push(ft[rndInt(0,ft.length-1)]);
  game.teachers.push(t);
}

function updateAlarm(dt) {
  if(!alarm.active) return;
  alarm.timer -= dt;
  document.getElementById('alarm-timer-txt').textContent = Math.ceil(alarm.timer)+'s';
  if(alarm.timer <= 0) deactivateAlarm();
}

// ──────────────────────────────────────────────
// 9. MAIN GAME STATE
// ──────────────────────────────────────────────
const game = {
  state:'menu',
  level:1, levelCfg:null,
  map:null, player:null,
  teachers:[], cctvs:[],
  cam:{x:0,y:0},
  timer:180, timerFrac:0,
  score:0, nearCaughtCount:0,
  startTime:0,
  tenseMusic:false,
  anyTeacherChasing:false,
  // In-level coin counter
  sessionCoins:0,
  keys:{}, lastKey:{},
  // smoke bomb state
  smokeActive:false,
  smokeTimer:0,
};

// ──────────────────────────────────────────────
// 10. LEVEL INIT
// ──────────────────────────────────────────────
function initLevel(levelId) {
  const cfg = LEVEL_DATA[levelId-1];
  game.level = levelId;
  game.levelCfg = cfg;
  game.timer = cfg.duration;
  game.timerFrac = 0;
  game.score = 0;
  game.nearCaughtCount = 0;
  game.startTime = Date.now();
  game.tenseMusic = false;
  game.anyTeacherChasing = false;
  game.sessionCoins = 0;
  game.smokeActive = false;
  game.smokeTimer = 0;

  // Reset alarm
  alarm.active = false;
  alarm.timer  = 0;
  document.getElementById('alarm-overlay').classList.remove('active');
  document.getElementById('hud-alarm').classList.add('hidden');
  document.getElementById('smoke-overlay').classList.remove('active','hidden');
  document.getElementById('smoke-overlay').classList.add('hidden');
  stopAlarmSFX();

  game.map = generateMap(cfg);
  const {playerStart, floorTiles} = game.map;
  const stats = getPlayerStats();

  // Player
  game.player = new Player(playerStart.x, playerStart.y, saveData.activeSkin);

  // Apply passive shop items
  const owned = saveData.ownedItems || {};
  if (owned['shop_shoes'] && owned['shop_shoes'] > 0) {
    game.player.hasSilentShoes = true;
    owned['shop_shoes'] = 0; // consume for this level
    writeSave();
  }
  if (owned['shop_map_up'] && owned['shop_map_up'] > 0) {
    game.player.hasMapUpgrade = true;
    owned['shop_map_up'] = 0;
    writeSave();
  }

  // Load active items into player queue
  game.player.activeItems = [];
  for(const si of SHOP_ITEMS.filter(s=>s.activeUse)){
    const cnt = owned[si.id] || 0;
    if(cnt > 0) game.player.activeItems.push({...si, remaining: cnt});
  }
  // Deduct active item counts from owned (will re-save on use)
  // We'll track them via player.activeItems.remaining

  // Teachers
  game.teachers = [];
  const teacherCfgs = [
    {emoji:'👩‍🏫',color:'#ef9a9a',speed:1.5,fovDist:TILE*5},
    {emoji:'👨‍🏫',color:'#90caf9',speed:1.6,fovDist:TILE*5},
    {emoji:'👩‍💼',color:'#ce93d8',speed:1.7,fovDist:TILE*5.5},
    {emoji:'👨‍💼',color:'#80cbc4',speed:1.8,fovDist:TILE*6},
    {emoji:'💂', color:'#ffb74d',speed:2.0,fovDist:TILE*6,type:'security'},
  ];
  if(cfg.hasPrincipal)
    teacherCfgs.push({emoji:'🧑‍⚖️',color:'#f44336',speed:2.5,fovDist:TILE*7,type:'principal',fovAngle:Math.PI*.55});

  const stealthMod = stats.stealthMod;
  const numT = Math.min(cfg.teachers, floorTiles.length);
  for(let i=0;i<numT;i++){
    if(floorTiles.length<10) break;
    let spawn;
    for(let a=0;a<30;a++){
      spawn = floorTiles[rndInt(0,floorTiles.length-1)];
      if(dist(spawn.x,spawn.y,playerStart.x,playerStart.y)>TILE*8) break;
    }
    if(!spawn) continue;
    const tc = teacherCfgs[i%teacherCfgs.length];
    if(!cfg.hasSecurity  && tc.type==='security')  continue;
    if(!cfg.hasPrincipal && tc.type==='principal') continue;
    const t = new Teacher(spawn.x, spawn.y, {
      ...tc,
      fovDist: Math.max(TILE*2, tc.fovDist - stealthMod*TILE)
    });
    const numWP = rndInt(4,8);
    for(let w=0;w<numWP;w++) t.patrol.push(floorTiles[rndInt(0,floorTiles.length-1)]);
    game.teachers.push(t);
  }

  // CCTV
  game.cctvs = [];
  if(cfg.hasCCTV){
    const corners=[];
    for(let y=2;y<cfg.gridH-2;y+=6)
      for(let x=2;x<cfg.gridW-2;x+=6){
        const tx=Math.floor(x),ty=Math.floor(y);
        if(game.map.tiles[ty]&&game.map.tiles[ty][tx]===0)
          corners.push({x:tx*TILE+TILE/2,y:ty*TILE+TILE/2});
      }
    const numCCTV=Math.min(4+levelId,corners.length);
    for(let i=0;i<numCCTV;i++)
      game.cctvs.push(new CCTV(corners[i].x,corners[i].y,Math.random()*Math.PI*2));
  }

  game.cam.x = game.player.x - canvas.width/2;
  game.cam.y = game.player.y - canvas.height/2;

  stopBGM();
  startBGM(false);
  updateHUD();
  updateActiveItemsBar();
}

// ──────────────────────────────────────────────
// 11. COLLISION
// ──────────────────────────────────────────────
function isSolid(tile){ return tile===1||tile===2||tile===4||tile===5||tile===6; }
function getTile(tx,ty){
  const{tiles,W,H}=game.map;
  if(tx<0||ty<0||tx>=W||ty>=H) return 1;
  return tiles[ty][tx];
}
function moveEntity(ent,dx,dy,r=12){
  const steps=4,sx=dx/steps,sy=dy/steps;
  for(let s=0;s<steps;s++){
    const nx=ent.x+sx;
    const lx=Math.floor((nx-r)/TILE),rx2=Math.floor((nx+r)/TILE);
    const ty1=Math.floor((ent.y-r)/TILE),ty2=Math.floor((ent.y+r)/TILE);
    if(!(isSolid(getTile(lx,ty1))||isSolid(getTile(lx,ty2))||isSolid(getTile(rx2,ty1))||isSolid(getTile(rx2,ty2)))) ent.x=nx;
    const ny=ent.y+sy;
    const bx1=Math.floor((ent.x-r)/TILE),bx2=Math.floor((ent.x+r)/TILE);
    const ty1y=Math.floor((ny-r)/TILE),ty2y=Math.floor((ny+r)/TILE);
    if(!(isSolid(getTile(bx1,ty1y))||isSolid(getTile(bx2,ty1y))||isSolid(getTile(bx1,ty2y))||isSolid(getTile(bx2,ty2y)))) ent.y=ny;
  }
}

// ──────────────────────────────────────────────
// 12. LOS
// ──────────────────────────────────────────────
function hasLOS(ax,ay,bx,by){
  for(let i=1;i<20;i++){
    const t=i/20,px=ax+(bx-ax)*t,py=ay+(by-ay)*t;
    if(getTile(Math.floor(px/TILE),Math.floor(py/TILE))===1) return false;
  }
  return true;
}
function canSee(sx,sy,face,half,fdist,px,py){
  if(dist(sx,sy,px,py)>fdist) return false;
  if(!inFOV(face,half,angleTowards(sx,sy,px,py))) return false;
  return hasLOS(sx,sy,px,py);
}

// ──────────────────────────────────────────────
// 13. ACTIVE ITEM USE (Q key)
// ──────────────────────────────────────────────
function useActiveItem() {
  const p = game.player;
  if(!p.activeItems.length){
    showNotification('Tidak ada item aktif','#aaa'); return;
  }
  const slot = p.activeItems[0];
  if(!slot || slot.remaining <= 0){ p.activeItems.shift(); updateActiveItemsBar(); return; }

  sfxUseItem();

  if(slot.id === 'shop_energy'){
    p.stamina = p.maxStamina;
    showNotification('🥤 Stamina penuh!','#4caf50');
  }
  else if(slot.id === 'shop_smoke'){
    activateSmokeBomb();
  }
  else if(slot.id === 'shop_flash'){
    useFlashCard();
  }

  slot.remaining--;
  saveData.ownedItems[slot.id] = Math.max(0,(saveData.ownedItems[slot.id]||0)-1);
  writeSave();
  if(slot.remaining <= 0) p.activeItems.shift();
  updateActiveItemsBar();
}

function activateSmokeBomb(){
  game.smokeActive = true;
  game.smokeTimer  = 5;
  const el = document.getElementById('smoke-overlay');
  el.classList.remove('hidden');
  setTimeout(()=>el.classList.add('active'),10);
  showNotification('💨 Smoke Bomb! Guru kehilangan jejakmu!','#9c27b0');
  // All chasing teachers lose track
  for(const t of game.teachers){
    if(t.state==='chase'){
      t.state='patrol';
      t.alertTimer=0;
    }
  }
}

function deactivateSmokeBomb(){
  game.smokeActive = false;
  const el = document.getElementById('smoke-overlay');
  el.classList.remove('active');
  setTimeout(()=>el.classList.add('hidden'), 500);
}

function useFlashCard(){
  const p = game.player;
  // Open nearest locked door
  let opened = false;
  for(let y=0;y<game.map.H&&!opened;y++){
    for(let x=0;x<game.map.W&&!opened;x++){
      if(game.map.tiles[y][x]===2){
        const tx=x*TILE+TILE/2,ty=y*TILE+TILE/2;
        if(dist(p.x,p.y,tx,ty)<TILE*2){
          game.map.tiles[y][x]=3;
          sfxDoor();
          showNotification('💳 Flash Card! Pintu terbuka!','#4caf50');
          opened=true;
          // Opening a door with force = alarm trigger
          triggerAlarm('Pintu dibuka paksa!');
        }
      }
    }
  }
  if(!opened) showNotification('💳 Tidak ada pintu di dekat sini','#aaa');
}

// ──────────────────────────────────────────────
// 14. GAME LOOP
// ──────────────────────────────────────────────
let lastFrame = 0;
function gameLoop(ts){
  if(game.state!=='playing') return;
  const dt=Math.min((ts-lastFrame)/(1000/FPS),3);
  lastFrame=ts;
  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

function update(dt){
  const{player,map}=game;
  if(player.caught) return;

  // Timer
  game.timerFrac+=dt;
  if(game.timerFrac>=1){ game.timerFrac-=1; game.timer=Math.max(0,game.timer-1); }
  if(game.timer<=0){ triggerGameOver('Waktu habis! Bel pulang berbunyi!'); return; }

  // Alarm update
  updateAlarm(dt);

  // Smoke update
  if(game.smokeActive){
    game.smokeTimer-=dt;
    if(game.smokeTimer<=0) deactivateSmokeBomb();
  }

  // BGM state
  const tense = game.anyTeacherChasing || game.timer<30 || alarm.active;
  if(tense!==game.tenseMusic && !alarm.active){
    game.tenseMusic=tense;
    startBGM(tense);
  }

  const stats = getPlayerStats();

  // Player movement
  if(!player.hiding){
    const k=game.keys;
    let dx=0,dy=0;
    if(k['ArrowLeft'] ||k['a']||k['A']) dx-=1;
    if(k['ArrowRight']||k['d']||k['D']) dx+=1;
    if(k['ArrowUp']   ||k['w']||k['W']) dy-=1;
    if(k['ArrowDown'] ||k['s']||k['S']) dy+=1;

    const moving=dx!==0||dy!==0;
    player.running=(k['Shift']||k['shift'])&&player.stamina>0&&moving;
    if(player.running) player.stamina=Math.max(0,player.stamina-STAMINA_DRAIN*dt);
    else if(!moving)   player.stamina=Math.min(player.maxStamina,player.stamina+STAMINA_REGEN*dt);
    if(player.stamina===0) player.running=false;

    const spd=(player.running?stats.runSpeed:stats.walkSpeed)*dt;
    if(moving){
      const len=Math.hypot(dx,dy);
      dx=dx/len*spd; dy=dy/len*spd;
      player.facing=Math.atan2(dy,dx);
      player.stepTimer+=dt;
      const si=player.running?.25:.45;
      if(player.stepTimer>=si){ player.stepTimer=0; sfxStep(player.hasSilentShoes); }
      player.walkAnim+=dt*(player.running?10:5);
      player.walkFrame=Math.floor(player.walkAnim)%4;
    }
    moveEntity(player,dx,dy,12);
  }

  // E key
  if(game.keys['e']||game.keys['E']){ game.keys['e']=false;game.keys['E']=false; interact(); }
  // Q key
  if(game.keys['q']||game.keys['Q']){ game.keys['q']=false;game.keys['Q']=false; useActiveItem(); }

  // Exit check
  const ep=map.exitPos;
  if(!player.hiding&&dist(player.x,player.y,ep.x,ep.y)<TILE*.7){
    if(player.hasItem('gate_key')){ triggerWin(); return; }
    else showNotification('🗝️ Butuh Kunci Gerbang!','#f5a623');
  }

  // Coin pickup (scattered on floor — auto-generate some)
  for(const coin of map.coins||[]){
    if(!coin.collected&&dist(player.x,player.y,coin.x,coin.y)<TILE*.6){
      coin.collected=true;
      game.sessionCoins+=coin.value;
      showNotification(`🪙 +${coin.value} koin!`,'#f5a623');
      sfxPickup();
      updateHUD();
    }
  }

  // Item pickup
  for(const item of map.items){
    if(!item.collected&&dist(player.x,player.y,item.x,item.y)<TILE*.65){
      item.collected=true;
      if(item.type==='energy_drink'){
        player.stamina=player.maxStamina;
        showNotification('🥤 Stamina penuh!','#4caf50');
      } else {
        const ok=player.addItem(item.type);
        if(ok){
          const def=ITEMS_DEF[item.type];
          showNotification(`${def.emoji} Dapat: ${def.name}!`,'#2196f3');
        }
      }
      sfxPickup();
      updateInventoryBar();
    }
  }

  // CCTV
  game.anyTeacherChasing=false;
  for(const cctv of game.cctvs){
    cctv.sweepAngle+=0.008*cctv.sweepDir*dt*60;
    if(Math.abs(normAngle(cctv.sweepAngle-cctv.angle))>Math.PI*.5) cctv.sweepDir*=-1;
    if(cctv.alertTimer>0) cctv.alertTimer-=dt;

    const smokeBlocking = game.smokeActive;
    const spotted = !player.hiding && !smokeBlocking &&
      canSee(cctv.x,cctv.y,cctv.sweepAngle,cctv.fovAngle,cctv.fovDist,player.x,player.y);

    if(spotted){
      cctv.alerted=true; cctv.alertTimer=3;
      // Trigger alarm from CCTV
      triggerAlarm('Terdeteksi CCTV!');
      // Alert nearest teacher
      let md=Infinity,near=null;
      for(const t of game.teachers){
        const d=dist(t.x,t.y,player.x,player.y);
        if(d<md){md=d;near=t;}
      }
      if(near&&near.state==='patrol'){
        near.state='alerted';near.lastSeenX=player.x;near.lastSeenY=player.y;
        near.alertTimer=5;near.exclamTimer=1.5;
        sfxAlert();showHudAlert('📡 CCTV MENDETEKSI!');
      }
    } else {
      cctv.alerted=false;
    }
  }

  // Teachers
  for(const t of game.teachers){
    updateTeacher(t,dt);
    if(t.state==='chase') game.anyTeacherChasing=true;
  }

  // Camera
  game.cam.x+=(player.x-canvas.width/2-game.cam.x)*.1;
  game.cam.y+=(player.y-canvas.height/2-game.cam.y)*.1;

  updateHUD();
  drawMiniMap();
}

function updateTeacher(t,dt){
  const{player}=game;
  if(t.exclamTimer>0) t.exclamTimer-=dt;

  const smokeBlocking = game.smokeActive;
  const canSeePlayer = !player.hiding && !smokeBlocking &&
    canSee(t.x,t.y,t.facing,t.fovAngle,t.fovDist,player.x,player.y);

  if(canSeePlayer&&t.state!=='chase'){
    t.state='alerted';t.alertTimer=6;
    t.lastSeenX=player.x;t.lastSeenY=player.y;
    t.exclamTimer=1.5;
    sfxAlert();showHudAlert('⚠ GURU MELIHATMU!');
    game.nearCaughtCount++;
  }
  if(t.state==='alerted'&&canSeePlayer){ t.state='chase';t.alertTimer=10; }

  if(t.state==='chase'){
    if(!canSeePlayer){ t.alertTimer-=dt; if(t.alertTimer<=0){t.state='patrol';t.alertTimer=0;} }
    else { t.lastSeenX=player.x;t.lastSeenY=player.y; }
    const dx=t.lastSeenX-t.x,dy=t.lastSeenY-t.y,d=Math.hypot(dx,dy);
    if(d>2){ t.facing=Math.atan2(dy,dx); moveEntity(t,dx/d*t.speed*dt*1.5,dy/d*t.speed*dt*1.5,10); }
    if(!player.hiding&&dist(t.x,t.y,player.x,player.y)<TILE*.55){
      // Player caught — but if smoke, teacher confused
      if(game.smokeActive){ t.state='patrol';t.alertTimer=0; }
      else { triggerGameOver('Guru berhasil menangkapmu!'); return; }
    }
  } else if(t.state==='alerted'){
    t.alertTimer-=dt;
    if(t.alertTimer<=0) t.state='patrol';
    const dx=t.lastSeenX-t.x,dy=t.lastSeenY-t.y,d=Math.hypot(dx,dy);
    if(d>TILE){ t.facing=Math.atan2(dy,dx); moveEntity(t,dx/d*t.speed*dt,dy/d*t.speed*dt,10); }
  } else {
    if(!t.patrol.length) return;
    if(t.patrolWait>0){ t.patrolWait-=dt; return; }
    const wp=t.patrol[t.patrolIdx];
    const dx=wp.x-t.x,dy=wp.y-t.y,d=Math.hypot(dx,dy);
    if(d<4){ t.patrolIdx=(t.patrolIdx+1)%t.patrol.length; t.patrolWait=rnd(.3,1.2); }
    else { t.facing=Math.atan2(dy,dx); moveEntity(t,dx/d*t.speed*dt,dy/d*t.speed*dt,10); }
  }
  t.walkAnim+=dt*(t.state==='chase'?10:5);
  t.walkFrame=Math.floor(t.walkAnim)%4;
}

// ──────────────────────────────────────────────
// 15. INTERACTION
// ──────────────────────────────────────────────
function interact(){
  const{player,map}=game;
  if(player.hiding){
    player.hiding=false;player.hideSpot=null;
    showNotification('Keluar dari persembunyian','#aaa');
    return;
  }
  for(const spot of map.hides){
    if(dist(player.x,player.y,spot.x,spot.y)<TILE*1.2){
      player.hiding=true;player.hideSpot=spot;
      player.x=spot.x;player.y=spot.y;
      sfxHide();showNotification('🫥 Bersembunyi...','#9c27b0');
      // If alarm, hiding also helps
      return;
    }
  }
  for(let y=0;y<map.H;y++) for(let x=0;x<map.W;x++){
    if(map.tiles[y][x]===2){
      const tx=x*TILE+TILE/2,ty=y*TILE+TILE/2;
      if(dist(player.x,player.y,tx,ty)<TILE*1.3){
        if(player.hasItem('class_key')){
          map.tiles[y][x]=3;sfxDoor();showNotification('🔑 Pintu terbuka!','#4caf50');
        } else {
          showNotification('🔒 Butuh kunci kelas!','#f44336');
        }
        return;
      }
    }
  }
  showNotification('Tidak ada yang bisa dilakukan di sini','#aaa');
}

// ──────────────────────────────────────────────
// 16. WIN / LOSE
// ──────────────────────────────────────────────
function triggerGameOver(msg){
  game.state='gameover';
  stopBGM(); stopAlarmSFX(); sfxLose();
  game.player.caught=true;
  document.getElementById('alarm-overlay').classList.remove('active');
  document.getElementById('smoke-overlay').classList.remove('active');
  document.getElementById('smoke-overlay').classList.add('hidden');

  // Still award partial coins
  addCoins(game.sessionCoins);
  refreshMenuCoins();

  document.getElementById('gameover-msg').textContent=msg;
  const el=Math.floor((Date.now()-game.startTime)/1000);
  document.getElementById('gameover-stats').innerHTML=`
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-val">${formatTime(el)}</div><div class="stat-lbl">Waktu Main</div></div>
      <div class="stat-item"><div class="stat-val">${game.player.inventory.length}</div><div class="stat-lbl">Item Dikumpul</div></div>
      <div class="stat-item"><div class="stat-val">🪙${game.sessionCoins}</div><div class="stat-lbl">Koin Didapat</div></div>
    </div>`;
  showScreen('gameover');
}

function triggerWin(){
  game.state='win';
  stopBGM(); stopAlarmSFX(); sfxWin();
  document.getElementById('alarm-overlay').classList.remove('active');

  const elapsed=Math.floor((Date.now()-game.startTime)/1000);
  const allItems=game.map.items.every(i=>i.collected);
  const perfect=game.nearCaughtCount===0;

  const baseScore=game.levelCfg.duration-elapsed;
  const itemBonus=game.player.inventory.length*50;
  const streakBonus=perfect?200:0;
  game.score=Math.max(0,baseScore*10+itemBonus+streakBonus);

  // Coin reward
  const coinReward=Math.round(game.level*30+elapsed===0?50:Math.max(10,60-elapsed*.3));
  game.sessionCoins+=coinReward;
  addCoins(game.sessionCoins);
  refreshMenuCoins();

  const prev=saveData.bestScores[game.level]||0;
  if(game.score>prev) saveData.bestScores[game.level]=game.score;
  const next=game.level+1;
  if(next<=LEVEL_DATA.length&&!saveData.unlockedLevels.includes(next))
    saveData.unlockedLevels.push(next);
  saveData.currentLevel=Math.max(saveData.currentLevel,game.level);
  if(perfect) saveData.neverCaughtStreak=(saveData.neverCaughtStreak||0)+1;
  else saveData.neverCaughtStreak=0;
  writeSave();

  // Achievements
  if(game.level===1)  unlockAchievement('first_escape');
  if(elapsed<=60)      unlockAchievement('speedrun');
  if(perfect)          unlockAchievement('ghost_mode');
  if(allItems)         unlockAchievement('collector');
  if((saveData.neverCaughtStreak||0)>=3) unlockAchievement('never_caught');
  if(saveData.currentLevel>=5) unlockAchievement('master');
  if(game.level>=4)    unlockAchievement('night_owl');

  document.getElementById('win-stats').innerHTML=`
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-val">${game.score}</div><div class="stat-lbl">Score</div></div>
      <div class="stat-item"><div class="stat-val">${formatTime(elapsed)}</div><div class="stat-lbl">Waktu</div></div>
      <div class="stat-item"><div class="stat-val">${game.player.inventory.length}</div><div class="stat-lbl">Item</div></div>
      <div class="stat-item"><div class="stat-val">${game.nearCaughtCount}</div><div class="stat-lbl">Hampir Kena</div></div>
    </div>`;
  document.getElementById('win-coins-earned').textContent=`🪙 +${game.sessionCoins} koin diperoleh!`;

  const nb=document.getElementById('btn-next-level');
  if(next>LEVEL_DATA.length){nb.textContent='🏆 Semua Level Selesai!';nb.disabled=true;}
  else{nb.textContent=`▶ Level ${next}`;nb.disabled=false;}
  showScreen('win');
}

// ──────────────────────────────────────────────
// 17. RENDER
// ──────────────────────────────────────────────
const canvas=document.getElementById('game-canvas');
const ctx=canvas.getContext('2d');
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
window.addEventListener('resize',resizeCanvas);resizeCanvas();

function worldToScreen(wx,wy){return{sx:wx-game.cam.x,sy:wy-game.cam.y};}

function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#0f0f1a';ctx.fillRect(0,0,canvas.width,canvas.height);
  if(!game.map) return;

  const{tiles,W,H}=game.map;
  const stX=Math.max(0,Math.floor(game.cam.x/TILE)-1);
  const enX=Math.min(W,Math.ceil((game.cam.x+canvas.width)/TILE)+1);
  const stY=Math.max(0,Math.floor(game.cam.y/TILE)-1);
  const enY=Math.min(H,Math.ceil((game.cam.y+canvas.height)/TILE)+1);

  // Alarm tint on floor
  const alarmTint = alarm.active ? (Math.sin(Date.now()/250)+1)*.5*.12 : 0;

  for(let ty=stY;ty<enY;ty++){
    for(let tx=stX;tx<enX;tx++){
      const t=tiles[ty][tx];
      const{sx,sy}=worldToScreen(tx*TILE,ty*TILE);
      drawTile(ctx,t,sx,sy,alarmTint);
    }
  }

  // Coins on map
  for(const coin of game.map.coins||[]){
    if(coin.collected) continue;
    const{sx,sy}=worldToScreen(coin.x,coin.y);
    if(sx<-30||sx>canvas.width+30||sy<-30||sy>canvas.height+30) continue;
    const bob=Math.sin(Date.now()/350+coin.x)*.2;
    ctx.save();ctx.shadowBlur=8;ctx.shadowColor='#f5a623';
    ctx.font='16px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('🪙',sx,sy+bob);ctx.restore();
  }

  // FOV cones
  ctx.save();
  for(const t of game.teachers){
    const{sx,sy}=worldToScreen(t.x,t.y);
    if(sx<-200||sx>canvas.width+200||sy<-200||sy>canvas.height+200) continue;
    const col=t.state==='chase'?'rgba(255,50,50,.18)':t.state==='alerted'?'rgba(255,200,50,.14)':'rgba(255,230,100,.07)';
    drawFOV(sx,sy,t.facing,t.fovAngle,t.fovDist,col);
  }
  for(const c of game.cctvs){
    const{sx,sy}=worldToScreen(c.x,c.y);
    drawFOV(sx,sy,c.sweepAngle,c.fovAngle,c.fovDist,c.alerted?'rgba(255,50,50,.2)':'rgba(100,200,255,.1)');
  }
  ctx.restore();

  // Items
  for(const item of game.map.items){
    if(item.collected) continue;
    const{sx,sy}=worldToScreen(item.x,item.y);
    if(sx<-50||sx>canvas.width+50||sy<-50||sy>canvas.height+50) continue;
    const bob=Math.sin(Date.now()/400+item.x)*3;
    ctx.save();ctx.shadowBlur=12;ctx.shadowColor='#4fc3f7';
    ctx.font='22px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(ITEMS_DEF[item.type]?.emoji||'?',sx,sy+bob);
    ctx.restore();
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(sx,sy+12,8,3,0,0,Math.PI*2);ctx.fill();
  }

  // CCTVs
  for(const c of game.cctvs){
    const{sx,sy}=worldToScreen(c.x,c.y);
    ctx.save();ctx.translate(sx,sy);
    ctx.fillStyle=c.alerted?'#f44336':'#37474f';
    ctx.fillRect(-8,-8,16,16);
    ctx.fillStyle='#00bcd4';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  // Teachers
  for(const t of game.teachers){
    const{sx,sy}=worldToScreen(t.x,t.y);
    if(sx<-50||sx>canvas.width+50||sy<-50||sy>canvas.height+50) continue;
    drawTeacher(t,sx,sy);
  }

  // Player
  const{sx:px,sy:py}=worldToScreen(game.player.x,game.player.y);
  drawPlayer(game.player,px,py);

  // Hiding overlay
  if(game.player.hiding){
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.globalAlpha=.35;drawPlayer(game.player,px,py);ctx.restore();
    ctx.fillStyle='#9c27b0';ctx.font="bold 13px 'Nunito',sans-serif";
    ctx.textAlign='center';ctx.fillText('🫥 BERSEMBUNYI  (E untuk keluar)',canvas.width/2,canvas.height/2+80);
  }
}

function drawTile(ctx,t,sx,sy,alarmTint){
  if(t===0){
    ctx.fillStyle=((Math.floor(sx/TILE)+Math.floor(sy/TILE))%2===0)?'#3a5c3a':'#3d5c3d';
    ctx.fillRect(sx,sy,TILE,TILE);
    if(alarmTint>0){ctx.fillStyle=`rgba(200,30,30,${alarmTint})`;ctx.fillRect(sx,sy,TILE,TILE);}
    ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=.5;ctx.strokeRect(sx,sy,TILE,TILE);
  } else if(t===1){
    ctx.fillStyle='#1c1c30';ctx.fillRect(sx,sy,TILE,TILE);
    ctx.fillStyle='#252540';ctx.fillRect(sx,sy,TILE,TILE*.35);
    ctx.fillStyle='#0a0a18';ctx.fillRect(sx,sy+TILE*.35,TILE,1);
  } else if(t===2){
    ctx.fillStyle='#8b4513';ctx.fillRect(sx,sy,TILE,TILE);
    ctx.fillStyle='#c0812e';ctx.fillRect(sx+TILE*.15,sy+TILE*.1,TILE*.7,TILE*.8);
    ctx.fillStyle='#e8a84a';ctx.beginPath();ctx.arc(sx+TILE*.75,sy+TILE*.5,4,0,Math.PI*2);ctx.fill();
  } else if(t===3){
    ctx.fillStyle='#3e2723';ctx.fillRect(sx,sy,TILE,TILE);
  } else if(t===4){
    ctx.fillStyle='#546e7a';ctx.fillRect(sx+2,sy+2,TILE-4,TILE-4);
    ctx.strokeStyle='#78909c';ctx.lineWidth=1;ctx.strokeRect(sx+4,sy+4,TILE-8,TILE-8);
    ctx.fillStyle='#90a4ae';ctx.beginPath();ctx.arc(sx+TILE-10,sy+TILE/2,3,0,Math.PI*2);ctx.fill();
  } else if(t===5){
    ctx.fillStyle='#8d6e63';ctx.fillRect(sx+3,sy+3,TILE-6,TILE-6);
    ctx.strokeStyle='#a1887f';ctx.lineWidth=1;ctx.strokeRect(sx+3,sy+3,TILE-6,TILE-6);
  } else if(t===6){
    ctx.fillStyle='#37474f';ctx.fillRect(sx+2,sy+2,TILE-4,TILE-4);
    ctx.fillStyle='#eceff1';ctx.beginPath();ctx.ellipse(sx+TILE/2,sy+TILE/2,TILE*.3,TILE*.35,0,0,Math.PI*2);ctx.fill();
  } else if(t===7){
    ctx.fillStyle='#1b5e20';ctx.fillRect(sx,sy,TILE,TILE);
    const pulse=(Math.sin(Date.now()/300)+1)/2;
    ctx.fillStyle=`rgba(249,168,37,${.4+pulse*.5})`;ctx.fillRect(sx+4,sy+4,TILE-8,TILE-8);
    ctx.font=`${TILE*.6}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('🚪',sx+TILE/2,sy+TILE/2);
  }
}

function drawFOV(sx,sy,facing,half,fdist,col){
  ctx.beginPath();ctx.moveTo(sx,sy);
  for(let i=0;i<=20;i++){
    const a=facing-half+(half*2)*(i/20);
    ctx.lineTo(sx+Math.cos(a)*fdist,sy+Math.sin(a)*fdist);
  }
  ctx.closePath();ctx.fillStyle=col;ctx.fill();
}

function drawPlayer(p,sx,sy){
  ctx.save();ctx.translate(sx,sy);
  const bounce=p.walkFrame<2?-2:0;ctx.translate(0,bounce);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,14,10,4,0,0,Math.PI*2);ctx.fill();
  if(p.hiding){ctx.restore();return;}
  const bc=p.running?'#f44336':p.hasSilentShoes?'#9c27b0':'#4caf50';
  ctx.fillStyle=bc;rr(ctx,-10,-6,20,18,5);ctx.fill();
  ctx.fillStyle='#ffcdd2';rr(ctx,-8,-20,16,16,6);ctx.fill();
  ctx.fillStyle='#212121';
  const ex=Math.cos(p.facing)*2,ey=Math.sin(p.facing)*2;
  ctx.beginPath();ctx.arc(-3+ex,-13+ey,2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc( 3+ex,-13+ey,2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1565c0';rr(ctx,8,-10,8,14,3);ctx.fill();
  if(p.skin.id!=='default'){ctx.font='14px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.skin.emoji,0,-12);}
  ctx.restore();
}

function drawTeacher(t,sx,sy){
  ctx.save();ctx.translate(sx,sy);
  if(t.exclamTimer>0){
    ctx.globalAlpha=Math.min(1,t.exclamTimer);
    ctx.font="bold 20px 'Press Start 2P',monospace";ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillStyle=t.state==='chase'?'#f44336':'#f5a623';ctx.fillText('!',0,-26);ctx.globalAlpha=1;
  }
  const bounce=t.walkFrame<2?-1:0;ctx.translate(0,bounce);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,14,10,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=alarm.active&&t.state==='chase'?'#ff1744':t.color;rr(ctx,-10,-6,20,18,4);ctx.fill();
  ctx.fillStyle='#ffcdd2';rr(ctx,-8,-20,16,16,6);ctx.fill();
  ctx.font='16px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.emoji,0,-12);
  if(t.state==='chase'){
    ctx.strokeStyle=alarm.active?'#ff1744':'#f44336';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,0,18+Math.sin(Date.now()/100)*3,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}

function rr(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}

// ──────────────────────────────────────────────
// 18. MINI MAP
// ──────────────────────────────────────────────
const miniCanvas=document.getElementById('mini-map');
const mctx=miniCanvas.getContext('2d');

function drawMiniMap(){
  if(!game.map) return;
  const{tiles,W,H}=game.map;
  const MW=miniCanvas.width,MH=miniCanvas.height;
  const tw=MW/W,th=MH/H;
  const mapUpgrade=game.player?.hasMapUpgrade;

  mctx.clearRect(0,0,MW,MH);
  mctx.fillStyle='#0f0f1a';mctx.fillRect(0,0,MW,MH);
  for(let ty=0;ty<H;ty++) for(let tx=0;tx<W;tx++){
    const t=tiles[ty][tx];
    if(t===1) mctx.fillStyle='#1a1a2e';
    else if(t===7) mctx.fillStyle='#f9a825';
    else mctx.fillStyle='#2e4a2e';
    mctx.fillRect(tx*tw,ty*th,tw,th);
  }
  // Always show items
  for(const item of game.map.items){
    if(!item.collected){mctx.fillStyle='#4fc3f7';mctx.fillRect(item.x/TILE*tw-1,item.y/TILE*th-1,2,2);}
  }
  // Coins on minimap
  for(const coin of game.map.coins||[]){
    if(!coin.collected){mctx.fillStyle='#f5a623';mctx.fillRect(coin.x/TILE*tw-.8,coin.y/TILE*th-.8,1.6,1.6);}
  }
  // Teachers — only visible with map upgrade
  if(mapUpgrade){
    for(const t of game.teachers){
      mctx.fillStyle=t.state==='chase'?'#f44336':'#ff8a65';
      mctx.fillRect(t.x/TILE*tw-1.5,t.y/TILE*th-1.5,3,3);
    }
  }
  // Player
  const p=game.player;
  mctx.fillStyle='#4caf50';mctx.beginPath();mctx.arc(p.x/TILE*tw,p.y/TILE*th,2.5,0,Math.PI*2);mctx.fill();
}

// ──────────────────────────────────────────────
// 19. COIN GENERATION (scatter coins in map)
// ──────────────────────────────────────────────
function scatterCoins(map){
  const coins=[];
  const{floorTiles}=map;
  const count=Math.min(20,floorTiles.length);
  const sample=[...floorTiles].sort(()=>Math.random()-.5).slice(0,count);
  for(const t of sample){
    coins.push({x:t.x,y:t.y,value:rndInt(5,15),collected:false});
  }
  return coins;
}

// ──────────────────────────────────────────────
// 20. HUD
// ──────────────────────────────────────────────
function updateHUD(){
  const p=game.player;
  if(!p) return;
  document.getElementById('hud-timer').textContent=formatTime(game.timer);
  document.getElementById('hud-timer').style.color=game.timer<30?'#f44336':'#f5a623';
  document.getElementById('stamina-bar').style.width=(p.stamina/p.maxStamina*100)+'%';
  document.getElementById('hud-level-badge').textContent=`LEVEL ${game.level}`;
  document.getElementById('hud-coins').textContent=game.sessionCoins;
  document.getElementById('pause-coins').textContent=game.sessionCoins;
}

function updateInventoryBar(){
  const bar=document.getElementById('inventory-bar');
  bar.innerHTML='';
  for(const type of game.player.inventory){
    const slot=document.createElement('div');
    slot.className='inv-slot';
    slot.title=ITEMS_DEF[type]?.name||type;
    slot.textContent=ITEMS_DEF[type]?.emoji||'?';
    bar.appendChild(slot);
  }
}

function updateActiveItemsBar(){
  const bar=document.getElementById('active-items-slots');
  bar.innerHTML='';
  const p=game.player;
  if(!p) return;
  for(const slot of p.activeItems){
    if(slot.remaining<=0) continue;
    const div=document.createElement('div');
    div.className='active-slot';
    div.title=slot.name;
    div.innerHTML=`${slot.emoji}<span class="slot-count">${slot.remaining}</span>`;
    bar.appendChild(div);
  }
}

let hudAlertTimer=null;
function showHudAlert(msg){
  const el=document.getElementById('hud-alert');
  el.textContent=msg;el.classList.remove('hidden');
  if(hudAlertTimer) clearTimeout(hudAlertTimer);
  hudAlertTimer=setTimeout(()=>el.classList.add('hidden'),2500);
}

function formatTime(s){
  return Math.floor(s/60).toString().padStart(2,'0')+':'+Math.floor(s%60).toString().padStart(2,'0');
}

// ──────────────────────────────────────────────
// 21. NOTIFICATIONS
// ──────────────────────────────────────────────
let notifTimer=null;
function showNotification(msg,color='#fff'){
  const el=document.getElementById('notification');
  el.textContent=msg;el.style.borderColor=color;el.style.color=color;
  el.classList.remove('hidden','hide');el.classList.add('show');
  if(notifTimer) clearTimeout(notifTimer);
  notifTimer=setTimeout(()=>{
    el.classList.remove('show');el.classList.add('hide');
    setTimeout(()=>el.classList.add('hidden'),300);
  },2000);
}

// ──────────────────────────────────────────────
// 22. SCREENS
// ──────────────────────────────────────────────
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===`screen-${id}`));
  const inGame=(id==='game');
  document.getElementById('hud').style.display=inGame?'flex':'none';
  document.getElementById('controls-hint').style.display=inGame?'block':'none';
}

// ──────────────────────────────────────────────
// 23. SHOP UI
// ──────────────────────────────────────────────
function buildShop(){
  const grid=document.getElementById('shop-grid');
  grid.innerHTML='';
  const owned=saveData.ownedItems||{};
  document.getElementById('shop-coins-display').textContent=saveData.coins||0;

  for(const item of SHOP_ITEMS){
    const cnt=owned[item.id]||0;
    const card=document.createElement('div');
    card.className='shop-card';
    const canBuy=cnt<item.maxOwn&&saveData.coins>=item.price;
    card.innerHTML=`
      <div class="sc-top">
        <span class="sc-emoji">${item.emoji}</span>
        <div>
          <div class="sc-name">${item.name}</div>
          ${item.activeUse?'<div style="font-size:10px;color:#80cbc4">Aktif (Q)</div>':'<div style="font-size:10px;color:#ce93d8">Pasif</div>'}
        </div>
      </div>
      <div class="sc-desc">${item.desc}</div>
      <div class="sc-footer">
        <span class="sc-price">🪙 ${item.price}</span>
        ${cnt>=item.maxOwn
          ? `<span class="sc-owned">✓ Dimiliki (${cnt})</span>`
          : `<button class="btn btn-primary btn-buy" data-id="${item.id}" ${canBuy?'':'disabled'}>Beli</button>`
        }
      </div>`;
    grid.appendChild(card);
  }

  // Owned display
  const ownedDiv=document.getElementById('shop-owned-list');
  ownedDiv.innerHTML='';
  let hasOwned=false;
  for(const item of SHOP_ITEMS){
    const cnt=owned[item.id]||0;
    if(cnt>0){
      hasOwned=true;
      const badge=document.createElement('div');
      badge.className='owned-badge';
      badge.innerHTML=`${item.emoji} ${item.name} <span class="ob-count">${cnt}</span>`;
      ownedDiv.appendChild(badge);
    }
  }
  if(!hasOwned) ownedDiv.innerHTML='<span style="color:#aaa;font-size:13px">Belum ada item</span>';

  // Buy button handlers
  grid.querySelectorAll('.btn-buy').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.dataset.id;
      const si=SHOP_ITEMS.find(s=>s.id===id);
      if(!si) return;
      if(!spendCoins(si.price)){showNotification('🪙 Koin tidak cukup!','#f44336');return;}
      saveData.ownedItems[si.id]=(saveData.ownedItems[si.id]||0)+1;
      saveData.shopPurchases=(saveData.shopPurchases||0)+1;
      writeSave();
      sfxBuy();
      showNotification(`${si.emoji} ${si.name} dibeli!`,'#4caf50');
      if(saveData.shopPurchases>=5) unlockAchievement('shopper');
      buildShop();
      refreshMenuCoins();
    });
  });
}

// ──────────────────────────────────────────────
// 24. UPGRADE UI
// ──────────────────────────────────────────────
function buildUpgrades(){
  const grid=document.getElementById('upgrade-grid');
  grid.innerHTML='';
  document.getElementById('upgrade-coins-display').textContent=saveData.coins||0;

  for(const def of UPGRADES_DEF){
    const curLvl=saveData.upgrades[def.id]||0;
    const maxed=curLvl>=def.maxLevel;
    const cost=maxed?0:upgradeCost(def,curLvl);
    const pct=(curLvl/def.maxLevel)*100;
    const canUpgrade=!maxed&&saveData.coins>=cost;

    const card=document.createElement('div');
    card.className='upgrade-card';
    card.innerHTML=`
      <div class="uc-top">
        <span class="uc-emoji">${def.emoji}</span>
        <div>
          <div class="uc-name">${def.name}</div>
          <div class="uc-level">Level ${curLvl}/${def.maxLevel}</div>
        </div>
      </div>
      <div class="uc-bar-wrap"><div class="uc-bar" style="width:${pct}%"></div></div>
      <div class="uc-desc">${def.desc}</div>
      <div class="uc-footer">
        ${maxed
          ? `<span class="uc-maxed">✓ MAXED!</span>`
          : `<span class="uc-cost">🪙 ${cost}</span>
             <button class="btn btn-primary btn-upgrade-buy" data-id="${def.id}" ${canUpgrade?'':'disabled'}>Upgrade</button>`
        }
      </div>`;
    grid.appendChild(card);
  }

  grid.querySelectorAll('.btn-upgrade-buy').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.dataset.id;
      const def=UPGRADES_DEF.find(d=>d.id===id);
      if(!def) return;
      const curLvl=saveData.upgrades[id]||0;
      if(curLvl>=def.maxLevel) return;
      const cost=upgradeCost(def,curLvl);
      if(!spendCoins(cost)){showNotification('🪙 Koin tidak cukup!','#f44336');return;}
      saveData.upgrades[id]=curLvl+1;
      writeSave();
      sfxBuy();
      showNotification(`${def.emoji} ${def.name} → Lv ${curLvl+1}!`,'#00897b');
      if((saveData.upgrades[id]||0)>=def.maxLevel) unlockAchievement('upgraded');
      buildUpgrades();
      refreshMenuCoins();
    });
  });
}

// ──────────────────────────────────────────────
// 25. OTHER UI BUILDERS
// ──────────────────────────────────────────────
function buildLevels(){
  const grid=document.getElementById('levels-grid');
  grid.innerHTML='';
  for(const lvl of LEVEL_DATA){
    const unlocked=saveData.unlockedLevels.includes(lvl.id);
    const card=document.createElement('div');
    card.className=`level-card ${unlocked?'unlocked':'locked'} ${lvl.id===game.level?'current':''}`;
    const best=saveData.bestScores[lvl.id];
    const stars=best?(best>1500?'⭐⭐⭐':best>800?'⭐⭐':'⭐'):'';
    card.innerHTML=unlocked
      ?`<div class="lc-num">${lvl.id}</div><div class="lc-name">${lvl.name}</div><div class="lc-stars">${stars}</div>${best?`<div style="font-size:10px;color:#aaa">Best: ${best}</div>`:''}`
      :`<div class="lc-lock">🔒</div><div class="lc-name">${lvl.name}</div>`;
    if(unlocked) card.addEventListener('click',()=>startGame(lvl.id));
    grid.appendChild(card);
  }
}

function buildSkins(){
  const grid=document.getElementById('skins-grid');
  grid.innerHTML='';
  for(const skin of SKINS){
    const unlocked=skin.unlockLevel<=saveData.currentLevel;
    const card=document.createElement('div');
    card.className=`skin-card ${unlocked?'':'locked'} ${skin.id===saveData.activeSkin?'active':''}`;
    card.innerHTML=`<div class="sk-emoji">${skin.emoji}</div><div class="sk-name">${skin.name}</div>${unlocked?'':`<div class="sk-req">Level ${skin.unlockLevel}</div>`}`;
    if(unlocked) card.addEventListener('click',()=>{saveData.activeSkin=skin.id;writeSave();buildSkins();showNotification(`${skin.emoji} Skin dipilih: ${skin.name}`,'#9c27b0');});
    grid.appendChild(card);
  }
}

function buildAchievements(){
  const list=document.getElementById('achievements-list');
  list.innerHTML='';
  for(const ach of ACHIEVEMENTS_DEF){
    const unlocked=saveData.achievements.includes(ach.id);
    const item=document.createElement('div');
    item.className=`ach-item ${unlocked?'unlocked':''}`;
    item.innerHTML=`<span class="ach-icon">${ach.icon}</span><div class="ach-info"><div class="ach-name">${ach.name} ${unlocked?'✓':''}</div><div class="ach-desc">${ach.desc}</div></div>`;
    list.appendChild(item);
  }
}

function refreshMenuCoins(){
  document.getElementById('menu-coins').textContent=saveData.coins||0;
}

// ──────────────────────────────────────────────
// 26. GAME FLOW
// ──────────────────────────────────────────────
function startGame(levelId){
  initAudio();resumeAudio();
  showScreen('game');
  initLevel(levelId);
  // Scatter coins into map
  game.map.coins=scatterCoins(game.map);
  updateInventoryBar();
  game.state='playing';
  lastFrame=performance.now();
  requestAnimationFrame(gameLoop);
}

// ──────────────────────────────────────────────
// 27. INPUT
// ──────────────────────────────────────────────
window.addEventListener('keydown',e=>{
  game.keys[e.key]=true;
  if(e.key==='Escape'){
    if(game.state==='playing'){ game.state='pause';stopBGM();stopAlarmSFX();showScreen('pause'); }
    else if(game.state==='pause') resumeGame();
  }
});
window.addEventListener('keyup',e=>{ game.keys[e.key]=false; });

function resumeGame(){
  game.state='playing';showScreen('game');
  if(alarm.active) startAlarmSFX();
  startBGM(game.tenseMusic||alarm.active);
  lastFrame=performance.now();
  requestAnimationFrame(gameLoop);
}

// ──────────────────────────────────────────────
// 28. BUTTON BINDINGS
// ──────────────────────────────────────────────
document.getElementById('btn-play').onclick=()=>startGame(saveData.currentLevel||1);
document.getElementById('btn-levels').onclick=()=>{buildLevels();showScreen('levels');};
document.getElementById('btn-shop').onclick=()=>{buildShop();showScreen('shop');};
document.getElementById('btn-upgrade').onclick=()=>{buildUpgrades();showScreen('upgrade');};
document.getElementById('btn-achievements').onclick=()=>{buildAchievements();showScreen('achievements');};
document.getElementById('btn-skins').onclick=()=>{buildSkins();showScreen('skins');};

document.getElementById('btn-back-levels').onclick=()=>showScreen('menu');
document.getElementById('btn-back-shop').onclick=()=>showScreen('menu');
document.getElementById('btn-back-upgrade').onclick=()=>showScreen('menu');
document.getElementById('btn-back-skins').onclick=()=>showScreen('menu');
document.getElementById('btn-back-ach').onclick=()=>showScreen('menu');

document.getElementById('btn-resume').onclick=resumeGame;
document.getElementById('btn-restart').onclick=()=>startGame(game.level);
document.getElementById('btn-pause-menu').onclick=()=>{stopBGM();stopAlarmSFX();game.state='menu';showScreen('menu');};

document.getElementById('btn-retry').onclick=()=>startGame(game.level);
document.getElementById('btn-go-menu').onclick=()=>{stopBGM();showScreen('menu');};

document.getElementById('btn-next-level').onclick=()=>{
  const next=game.level+1;
  if(next<=LEVEL_DATA.length&&saveData.unlockedLevels.includes(next)) startGame(next);
  else showScreen('menu');
};
document.getElementById('btn-win-menu').onclick=()=>{stopBGM();showScreen('menu');};

// ──────────────────────────────────────────────
// 29. BOOT
// ──────────────────────────────────────────────
(function boot(){
  loadSave();
  refreshMenuCoins();
  document.getElementById('best-score-display').textContent='Best Score: '+(Object.values(saveData.bestScores).reduce((a,b)=>a+b,0)||0);
  document.getElementById('level-display').textContent='Level: '+(saveData.currentLevel||1);
  showScreen('menu');
  document.getElementById('hud').style.display='none';
  document.getElementById('controls-hint').style.display='none';
})();
