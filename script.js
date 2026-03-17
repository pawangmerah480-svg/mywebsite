/* ================================================================
   SCHOOL ESCAPE v3.0 — Full HD Game Engine
   Features: HD Canvas Rendering, Smooth Animations, Particle FX,
   Shop, Upgrades, Alarm, Missions, Ranking, Lucky Spin, Radar,
   Pet, Combo, Daily Bonus, Secret Passages, Boss AI
   ================================================================ */
'use strict';

// ────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────
const TILE   = 48;
const FPS    = 60;
const TWO_PI = Math.PI * 2;

// Base stats (modified by upgrades)
const BASE = { walk:2.6, run:4.8, stamina:100, drain:.5, regen:.32 };

// ────────────────────────────────────────────
// STATIC GAME DATA
// ────────────────────────────────────────────
const LEVELS = [
  { id:1, name:'Kelas 1A',       w:22, h:16, duration:180, npc:4,  teachers:2, hasCCTV:false, sec:false, boss:false, secret:false },
  { id:2, name:'Koridor Timur',  w:26, h:18, duration:160, npc:5,  teachers:3, hasCCTV:false, sec:false, boss:false, secret:false },
  { id:3, name:'Perpustakaan',   w:28, h:20, duration:150, npc:5,  teachers:4, hasCCTV:true,  sec:false, boss:false, secret:true  },
  { id:4, name:'Kantin Sekolah', w:30, h:22, duration:140, npc:6,  teachers:4, hasCCTV:true,  sec:true,  boss:false, secret:true  },
  { id:5, name:'Lapangan',       w:32, h:24, duration:130, npc:7,  teachers:5, hasCCTV:true,  sec:true,  boss:false, secret:true  },
  { id:6, name:'Ruang Guru',     w:34, h:26, duration:120, npc:6,  teachers:5, hasCCTV:true,  sec:true,  boss:true,  secret:true  },
  { id:7, name:'Lantai 2',       w:36, h:26, duration:110, npc:7,  teachers:6, hasCCTV:true,  sec:true,  boss:true,  secret:true  },
  { id:8, name:'Kantor Kepala',  w:38, h:28, duration:100, npc:8,  teachers:7, hasCCTV:true,  sec:true,  boss:true,  secret:true  },
];

const SKINS_DATA = [
  { id:'default', name:'Murid Biasa',   emoji:'🧒', color:'#4caf50', unlockLvl:0 },
  { id:'nerd',    name:'Si Kutu Buku',  emoji:'🤓', color:'#2196f3', unlockLvl:2 },
  { id:'athlete', name:'Si Atlet',      emoji:'🏃', color:'#ff9800', unlockLvl:3 },
  { id:'rebel',   name:'Si Nakal',      emoji:'😎', color:'#e91e63', unlockLvl:4 },
  { id:'ninja',   name:'Ninja',         emoji:'🥷', color:'#9c27b0', unlockLvl:5 },
  { id:'ghost',   name:'Si Hantu',      emoji:'👻', color:'#00bcd4', unlockLvl:6 },
  { id:'hero',    name:'Pahlawan',      emoji:'🦸', color:'#f44336', unlockLvl:7 },
  { id:'vip',     name:'VIP Premium',   emoji:'🤴', color:'#ffd700', unlockLvl:8 },
];

const SHOP_DATA = {
  items:[
    { id:'smoke',   emoji:'💨', name:'Smoke Bomb',    desc:'Guru kehilangan jejak 5 detik',   price:80,  max:5, active:true  },
    { id:'teleport',emoji:'🌀', name:'Teleport',       desc:'Teleport ke lokasi acak di map',  price:150, max:3, active:true  },
    { id:'invis',   emoji:'👻', name:'Invisibility',   desc:'Tak terlihat guru selama 8 detik',price:200, max:2, active:true  },
    { id:'magnet',  emoji:'🧲', name:'Koin Magnet',    desc:'Tarik semua koin dalam radius',   price:60,  max:5, active:true  },
  ],
  consumables:[
    { id:'energy',  emoji:'🥤', name:'Energy Drink',  desc:'Isi stamina penuh',               price:30,  max:10, active:true },
    { id:'shoes',   emoji:'👟', name:'Silent Shoes',  desc:'Langkah senyap 1 level',          price:60,  max:3, active:false, passive:true },
    { id:'radar_up',emoji:'📡', name:'Radar Upgrade', desc:'Aktifkan radar guru 1 level',     price:50,  max:3, active:false, passive:true },
    { id:'map_up',  emoji:'🗺️', name:'Map Upgrade',   desc:'Tampilkan guru di minimap',       price:70,  max:2, active:false, passive:true },
  ]
};

const UPGRADES_DATA = [
  { id:'stamina', emoji:'💛', name:'Stamina Max',     desc:'+20 stamina per level',  max:5, base:80,  mult:1.4 },
  { id:'speed',   emoji:'⚡', name:'Kecepatan',       desc:'+0.4 speed per level',   max:5, base:100, mult:1.5 },
  { id:'stealth', emoji:'🫥', name:'Stealth',         desc:'Kurangi FOV guru .6 tile',max:5, base:110, mult:1.5 },
  { id:'inv',     emoji:'🎒', name:'Inventori',       desc:'+1 slot per level',       max:3, base:70,  mult:1.6 },
  { id:'coin',    emoji:'🪙', name:'Coin Bonus',      desc:'+10% koin per level',     max:5, base:90,  mult:1.4 },
  { id:'xp',      emoji:'✨', name:'XP Bonus',        desc:'+15% XP per level',       max:3, base:80,  mult:1.5 },
];

const MISSIONS_DATA = [
  { id:'m_escape',  icon:'🎒', title:'Melarikan Diri',  desc:'Selesaikan 3 level',       goal:3,   stat:'wins',     reward:150, rewardType:'coins' },
  { id:'m_coins',   icon:'🪙', title:'Kolektor Koin',   desc:'Kumpulkan 500 koin',        goal:500, stat:'totalCoins',reward:2, rewardType:'gems' },
  { id:'m_stealth', icon:'👻', title:'Ghost Run',        desc:'Selesaikan 2 level tanpa kena', goal:2, stat:'perfectRuns', reward:200, rewardType:'coins' },
  { id:'m_speed',   icon:'⚡', title:'Speedrunner',     desc:'Selesaikan level dalam 45s',goal:1,   stat:'speedWins',  reward:3, rewardType:'gems' },
  { id:'m_collect', icon:'🎁', title:'Item Hunter',     desc:'Kumpulkan 20 item',          goal:20,  stat:'itemsGot',   reward:100, rewardType:'coins' },
  { id:'m_combo',   icon:'✨', title:'Combo Master',    desc:'Capai combo x5',             goal:1,   stat:'maxCombo',   reward:2, rewardType:'gems' },
];

const ACHIEVEMENTS_DATA = [
  { id:'first',     icon:'🎒', name:'Kabur Pertama',    desc:'Selesaikan level 1' },
  { id:'speed60',   icon:'⚡', name:'Speedrun',          desc:'Selesaikan dalam 60 detik' },
  { id:'ghost',     icon:'👻', name:'Ghost Mode',        desc:'Tanpa ketahuan sama sekali' },
  { id:'collector', icon:'🎁', name:'Kolektor',          desc:'Kumpulkan semua item 1 level' },
  { id:'rich',      icon:'💰', name:'Si Tajir',          desc:'Kumpulkan 1000 koin total' },
  { id:'master',    icon:'🏆', name:'Master Kabur',      desc:'Selesaikan semua level' },
  { id:'combo5',    icon:'✨', name:'Combo Mania',       desc:'Capai combo ×5' },
  { id:'shopper',   icon:'🛒', name:'Pembeli Setia',     desc:'Beli 10 item dari toko' },
  { id:'upgrader',  icon:'💪', name:'Full Upgrade',      desc:'Max 1 upgrade' },
  { id:'daily7',    icon:'📅', name:'Loyal Player',      desc:'Login 7 hari berturut-turut' },
];

const SPIN_PRIZES = [
  { label:'🪙 50',   type:'coins', val:50,  color:'#ffd700' },
  { label:'🪙 100',  type:'coins', val:100, color:'#f39c12' },
  { label:'🪙 200',  type:'coins', val:200, color:'#e67e22' },
  { label:'💎 1',    type:'gems',  val:1,   color:'#a855f7' },
  { label:'💎 2',    type:'gems',  val:2,   color:'#7c3aed' },
  { label:'⚡ Energy',type:'item',  val:'energy', color:'#2196f3' },
  { label:'💨 Smoke', type:'item',  val:'smoke',  color:'#78909c' },
  { label:'🎁 ×2',   type:'bonus', val:2,   color:'#e91e63' },
];

// ────────────────────────────────────────────
// SAVE / LOAD
// ────────────────────────────────────────────
const SK = 'se_v3';
let S = {
  coins:0, gems:0, xp:0, playerLevel:1,
  unlockedLevels:[1], currentLevel:1,
  bestScores:{}, activeSkin:'default',
  achievements:[], upgrades:{}, ownedItems:{},
  stats:{ wins:0, totalCoins:0, perfectRuns:0, speedWins:0, itemsGot:0, maxCombo:0, deaths:0, totalPlays:0 },
  missions:{}, missionsClaimed:[],
  dailyLastClaim:0, dailyStreak:0,
  settings:{ sound:true, music:true, particles:true, vibration:true },
  shopBuys:0,
};
function loadSave(){
  try{ const d=localStorage.getItem(SK); if(d) S={...S,...JSON.parse(d)}; } catch(e){}
  S.stats     = S.stats     || {};
  S.upgrades  = S.upgrades  || {};
  S.ownedItems= S.ownedItems|| {};
  S.missions  = S.missions  || {};
}
function save(){ try{ localStorage.setItem(SK,JSON.stringify(S)); }catch(e){} }

function addCoins(n){
  const bonus=1+(S.upgrades.coin||0)*.1;
  const final=Math.round(n*bonus);
  S.coins+=final; S.stats.totalCoins=(S.stats.totalCoins||0)+final;
  save(); refreshMenuCoins();
  if(S.stats.totalCoins>=1000) unlockAch('rich');
  return final;
}
function addXP(n){
  const bonus=1+(S.upgrades.xp||0)*.15;
  S.xp+=Math.round(n*bonus);
  checkLevelUp();
  save();
}
function checkLevelUp(){
  const needed=xpNeeded(S.playerLevel);
  if(S.xp>=needed){
    S.xp-=needed; S.playerLevel++;
    toast(`⭐ Level UP! Kamu sekarang Level ${S.playerLevel}!`,'#ffd700');
    // Unlock skins
    SKINS_DATA.forEach(sk=>{ if(sk.unlockLvl===S.playerLevel) toast(`👕 Skin baru terbuka: ${sk.name}!`,'#a855f7'); });
    save();
  }
}
function xpNeeded(lvl){ return Math.floor(100*Math.pow(1.35,lvl-1)); }

function unlockAch(id){
  if(S.achievements.includes(id)) return;
  S.achievements.push(id); save();
  const a=ACHIEVEMENTS_DATA.find(x=>x.id===id);
  if(a) toast(`${a.icon} Achievement: ${a.name}!`,'#ffd700');
}
function upgCost(def,lvl){ return Math.round(def.base*Math.pow(def.mult,lvl)); }
function getStats(){
  return {
    maxStamina: BASE.stamina+(S.upgrades.stamina||0)*20,
    runSpeed:   BASE.run   +(S.upgrades.speed||0)*.4,
    walkSpeed:  BASE.walk  +(S.upgrades.speed||0)*.2,
    stealthMod: (S.upgrades.stealth||0)*.6,
    maxInv:     5+(S.upgrades.inv||0),
  };
}

// ────────────────────────────────────────────
// AUDIO
// ────────────────────────────────────────────
let AC=null, bgmGain=null, bgmTid=null, alarmTid=null, alarmGain=null;
function initAudio(){ if(AC) return; try{ AC=new(window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
function resumeAudio(){ if(AC&&AC.state==='suspended') AC.resume(); }
function tone(f,d,type='square',v=.14,delay=0){
  if(!AC||!S.settings.sound) return;
  const o=AC.createOscillator(), g=AC.createGain();
  o.connect(g); g.connect(AC.destination);
  o.type=type; o.frequency.value=f;
  const t=AC.currentTime+delay;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.01);
  g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.start(t); o.stop(t+d+.05);
}
function sfxStep(silent=false){ if(!silent) tone(75+Math.random()*35,.05,'sine',.07); }
function sfxCoin()  { [700,900,1100].forEach((f,i)=>tone(f,.08,'sine',.18,i*.07)); }
function sfxAlert() { [800,1000,800,1000].forEach((f,i)=>tone(f,.12,'square',.22,i*.1)); }
function sfxWin()   { [523,659,784,1047,1319].forEach((f,i)=>tone(f,.25,'sine',.28,i*.1)); }
function sfxLose()  { [400,300,200,100].forEach((f,i)=>tone(f,.25,'sawtooth',.22,i*.1)); }
function sfxHide()  { tone(350,.18,'sine',.12); tone(450,.18,'sine',.12,.1); }
function sfxBuy()   { [600,800,1000].forEach((f,i)=>tone(f,.08,'sine',.18,i*.07)); }
function sfxUse()   { [700,900].forEach((f,i)=>tone(f,.08,'sine',.18,i*.07)); }
function sfxLevelUp(){ [523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.2,'sine',.3,i*.09)); }
function sfxSpin()  { tone(600+Math.random()*400,.06,'sawtooth',.15); }
function startBGM(tense=false){
  if(!AC||!S.settings.music) return;
  stopBGM();
  bgmGain=AC.createGain(); bgmGain.gain.value=tense?.11:.05; bgmGain.connect(AC.destination);
  const notes=tense?[110,120,130,120,110,100,90,100]:[262,294,330,349,392,330,294,262];
  const tempo=tense?.16:.32; let i=0;
  function tick(){
    if(!bgmGain) return;
    const o=AC.createOscillator(),g=AC.createGain();
    o.connect(g); g.connect(bgmGain); o.type=tense?'sawtooth':'triangle';
    o.frequency.value=notes[i%notes.length];
    const t=AC.currentTime;
    g.gain.setValueAtTime(.5,t); g.gain.exponentialRampToValueAtTime(.001,t+tempo-.02);
    o.start(t); o.stop(t+tempo); i++;
    bgmTid=setTimeout(tick,tempo*1000);
  }
  tick();
}
function stopBGM(){ if(bgmTid)clearTimeout(bgmTid); if(bgmGain){bgmGain.disconnect();bgmGain=null;} bgmTid=null; }
function startAlarmSFX(){
  if(!AC||!S.settings.sound) return;
  stopAlarmSFX();
  alarmGain=AC.createGain(); alarmGain.gain.value=.18; alarmGain.connect(AC.destination);
  let ph=0;
  function tick(){
    if(!alarmGain) return;
    const o=AC.createOscillator(),g=AC.createGain();
    o.connect(g); g.connect(alarmGain); o.type='sawtooth';
    o.frequency.value=ph%2===0?880:660;
    const t=AC.currentTime;
    g.gain.setValueAtTime(.6,t); g.gain.exponentialRampToValueAtTime(.001,t+.2);
    o.start(t); o.stop(t+.22); ph++;
    alarmTid=setTimeout(tick,220);
  }
  tick();
}
function stopAlarmSFX(){ if(alarmTid)clearTimeout(alarmTid); if(alarmGain){alarmGain.disconnect();alarmGain=null;} alarmTid=null; }

// ────────────────────────────────────────────
// UTILS
// ────────────────────────────────────────────
function rnd(a,b){ return a+Math.random()*(b-a); }
function ri(a,b){ return Math.floor(rnd(a,b+1)); }
function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }
function dist(ax,ay,bx,by){ return Math.hypot(ax-bx,ay-by); }
function angle(fx,fy,tx,ty){ return Math.atan2(ty-fy,tx-fx); }
function normA(a){ while(a>Math.PI)a-=TWO_PI; while(a<-Math.PI)a+=TWO_PI; return a; }
function adiff(a,b){ return Math.abs(normA(a-b)); }
function inFOV(face,half,check){ return adiff(face,check)<=half; }
function lerp(a,b,t){ return a+(b-a)*t; }

// ────────────────────────────────────────────
// PARTICLES
// ────────────────────────────────────────────
const particles = [];
function spawnParticle(x,y,opts={}){
  if(!S.settings.particles) return;
  particles.push({
    x,y,
    vx:opts.vx||(rnd(-1.5,1.5)),
    vy:opts.vy||(rnd(-3,-1)),
    life:opts.life||0.8,
    maxLife:opts.life||0.8,
    color:opts.color||'#ffd700',
    size:opts.size||4,
    gravity:opts.gravity||0.08,
    type:opts.type||'circle',
    text:opts.text||null,
  });
}
function spawnCoinParticles(x,y,n=6){
  for(let i=0;i<n;i++) spawnParticle(x,y,{color:'#ffd700',size:3,vy:rnd(-3.5,-1.5),vx:rnd(-2,2),life:.7});
}
function spawnDust(x,y){
  for(let i=0;i<3;i++) spawnParticle(x,y,{color:'rgba(160,140,120,.5)',size:rnd(3,6),vy:rnd(-1,-.3),vx:rnd(-1.5,1.5),life:.4,gravity:.02});
}
function spawnCatchParticles(x,y){
  for(let i=0;i<15;i++) spawnParticle(x,y,{color:'#ff4757',size:rnd(3,7),vy:rnd(-4,-1),vx:rnd(-3,3),life:1,gravity:.12});
}
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.x+=p.vx*dt*60; p.y+=p.vy*dt*60;
    p.vy+=p.gravity*dt*60;
    p.life-=dt;
    if(p.life<=0) particles.splice(i,1);
  }
}
function drawParticles(ctx,cx,cy){
  for(const p of particles){
    const alpha=p.life/p.maxLife;
    ctx.save(); ctx.globalAlpha=alpha;
    if(p.text){
      ctx.font=`bold ${p.size}px Nunito,sans-serif`;
      ctx.fillStyle=p.color; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(p.text,p.x-cx,p.y-cy);
    } else {
      ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x-cx,p.y-cy,p.size,0,TWO_PI); ctx.fill();
    }
    ctx.restore();
  }
}

// ────────────────────────────────────────────
// MAP GENERATOR
// ────────────────────────────────────────────
function generateMap(cfg){
  const W=cfg.w, H=cfg.h;
  const tiles=Array.from({length:H},()=>new Uint8Array(W).fill(1));
  // 0=floor,1=wall,2=door(closed),3=door(open),4=locker,5=desk,6=toilet,7=exit,8=window,9=plant,10=poster,11=secret

  const rooms=[];
  function ok(rx,ry,rw,rh){
    for(let y=ry-1;y<ry+rh+1;y++) for(let x=rx-1;x<rx+rw+1;x++) if(x<0||x>=W||y<0||y>=H) return false;
    for(const r of rooms) if(rx<r.x+r.w+2&&rx+rw>r.x-2&&ry<r.y+r.h+2&&ry+rh>r.y-2) return false;
    return true;
  }
  function carve(rx,ry,rw,rh){ for(let y=ry;y<ry+rh;y++) for(let x=rx;x<rx+rw;x++) tiles[y][x]=0; rooms.push({x:rx,y:ry,w:rw,h:rh}); }
  function corridor(x1,y1,x2,y2){ let cx=x1,cy=y1; while(cx!==x2){tiles[cy][cx]=0;cx+=Math.sign(x2-cx);} while(cy!==y2){tiles[cy][cx]=0;cy+=Math.sign(y2-cy);} }

  const nRooms=Math.floor(W*H/65)+5;
  for(let a=0;a<400&&rooms.length<nRooms;a++){
    const rw=ri(4,9),rh=ri(3,7);
    const rx=ri(1,W-rw-1),ry=ri(1,H-rh-1);
    if(ok(rx,ry,rw,rh)) carve(rx,ry,rw,rh);
  }
  for(let i=1;i<rooms.length;i++){
    const a=rooms[i-1],b=rooms[i];
    corridor(a.x+Math.floor(a.w/2),a.y+Math.floor(a.h/2),b.x+Math.floor(b.w/2),b.y+Math.floor(b.h/2));
  }

  // Decorate rooms
  const itemPositions=[], doorPos=[];
  for(const r of rooms){
    const cx=r.x+Math.floor(r.w/2);
    if(r.w>=5&&Math.random()<.65) tiles[r.y+1][r.x+1]=5;        // desk
    if(r.h>=4&&Math.random()<.55) tiles[r.y+r.h-2][r.x+r.w-2]=4; // locker
    if(r.w>=5&&Math.random()<.4)  tiles[r.y+1][r.x+r.w-2]=9;    // plant
    if(r.h>=5&&Math.random()<.35) tiles[r.y+r.h-2][r.x+1]=10;   // poster
    if(Math.random()<.5&&r.y>1)  { tiles[r.y][cx]=2; doorPos.push({x:cx,y:r.y}); }
    itemPositions.push({x:r.x+ri(1,r.w-2),y:r.y+ri(1,r.h-2)});
  }
  // Toilet in last room
  const tr=rooms[rooms.length-1];
  if(tr&&tr.w>=3&&tr.h>=3) tiles[tr.y+1][tr.x+1]=6;

  // Secret passage
  const secrets=[];
  if(cfg.secret&&rooms.length>=4){
    const ri2=ri(1,rooms.length-3);
    const ra=rooms[ri2], rb=rooms[ri2+2];
    const sx=ra.x+Math.floor(ra.w/2), sy=ra.y+Math.floor(ra.h/2);
    tiles[sy][sx]=11;
    secrets.push({x:sx*TILE+TILE/2,y:sy*TILE+TILE/2,destX:(rb.x+Math.floor(rb.w/2))*TILE+TILE/2,destY:(rb.y+Math.floor(rb.h/2))*TILE+TILE/2});
  }

  // Player start
  const sr=rooms[0];
  const pStart={x:(sr.x+Math.floor(sr.w/2))*TILE+TILE/2,y:(sr.y+Math.floor(sr.h/2))*TILE+TILE/2};

  // Exit
  const er=rooms[rooms.length-1];
  const ex=er.x+Math.floor(er.w/2),ey=er.y+Math.floor(er.h/2);
  tiles[ey][ex]=7;
  const exitPos={x:ex*TILE+TILE/2,y:ey*TILE+TILE/2};

  // Items
  const reqItems=['gate_key','class_key','access_card','school_map','energy_drink'];
  const mapItems=[];
  for(let i=0;i<Math.min(reqItems.length,itemPositions.length);i++){
    const p=itemPositions[i];
    if(tiles[p.y]&&tiles[p.y][p.x]===0)
      mapItems.push({type:reqItems[i],x:p.x*TILE+TILE/2,y:p.y*TILE+TILE/2,collected:false});
  }

  // Hides
  const hides=[];
  for(let y=0;y<H;y++) for(let x=0;x<W;x++)
    if(tiles[y][x]===4||tiles[y][x]===5||tiles[y][x]===6)
      hides.push({x:x*TILE+TILE/2,y:y*TILE+TILE/2,tile:tiles[y][x]});

  const floorTiles=[];
  for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++)
    if(tiles[y][x]===0) floorTiles.push({x:x*TILE+TILE/2,y:y*TILE+TILE/2});

  // Coins
  const coins=[];
  const coinTiles=[...floorTiles].sort(()=>Math.random()-.5).slice(0,Math.min(30,floorTiles.length));
  for(const t of coinTiles) coins.push({x:t.x,y:t.y,value:ri(5,20),collected:false,rare:Math.random()<.08,spin:Math.random()*TWO_PI});

  // NPCs
  const npcs=[];
  for(let i=0;i<cfg.npc;i++){
    const ft=floorTiles[ri(0,floorTiles.length-1)];
    if(!ft) continue;
    const patrol=[]; for(let w=0;w<ri(3,6);w++) patrol.push(floorTiles[ri(0,floorTiles.length-1)]);
    npcs.push({x:ft.x,y:ft.y,facing:Math.random()*TWO_PI,patrol,patrolIdx:0,wait:0,walkAnim:0,walkFrame:0,skin:SKINS_DATA[ri(0,SKINS_DATA.length-1)]});
  }

  // Treasure chest (random rare)
  const chests=[];
  if(Math.random()<.5&&floorTiles.length>20){
    const ct=floorTiles[ri(0,floorTiles.length-1)];
    chests.push({x:ct.x,y:ct.y,opened:false,reward:ri(30,80)});
  }

  return {tiles,W,H,pStart,exitPos,items:mapItems,hides,floorTiles,coins,npcs,secrets,chests,rooms};
}

// ────────────────────────────────────────────
// ENTITY CLASSES
// ────────────────────────────────────────────
class Player {
  constructor(x,y){
    this.x=x; this.y=y;
    this.facing=0;
    const st=getStats();
    this.maxStamina=st.maxStamina;
    this.stamina=this.maxStamina;
    this.running=false; this.sneaking=false; this.hiding=false; this.hideSpot=null;
    this.inventory=[];
    this.stepTimer=0; this.walkAnim=0; this.walkFrame=0;
    this.animState='idle'; // idle|walk|run|sneak|caught|victory
    this.animTimer=0;
    this.caught=false; this.won=false;
    this.skin=SKINS_DATA.find(s=>s.id===S.activeSkin)||SKINS_DATA[0];
    this.hasSilentShoes=false; this.hasRadar=false; this.hasMapUp=false;
    this.activeItems=[];
    this.invisible=false; this.invisTimer=0;
    this.smokeActive=false; this.smokeTimer=0;
    this.combo=0; this.comboTimer=0;
    this.stepDust=0;
    // pet
    this.pet={x:x-30,y:y,targetX:x-30,targetY:y,frame:0,frameTimer:0};
    this.hasPet=S.playerLevel>=5;
  }
  hasItem(t){ return this.inventory.includes(t); }
  addItem(t){
    if(this.inventory.length>=getStats().maxInv){ toast('🎒 Inventori penuh!','#f44336'); return false; }
    if(!this.hasItem(t)){ this.inventory.push(t); return true; }
    return false;
  }
}

class Teacher {
  constructor(x,y,cfg={}){
    this.x=x; this.y=y;
    this.facing=Math.random()*TWO_PI;
    this.baseSpeed=cfg.speed||1.6;
    this.speed=this.baseSpeed;
    this.fovAngle=cfg.fovAngle||Math.PI*.44;
    this.fovDist=cfg.fovDist||TILE*5;
    this.patrol=[]; this.pIdx=0; this.pWait=0;
    this.state='patrol';
    this.alertTimer=0; this.lastSeenX=0; this.lastSeenY=0;
    this.exclamTimer=0;
    this.color=cfg.color||'#ef9a9a';
    this.emoji=cfg.emoji||'👩‍🏫';
    this.isBoss=cfg.isBoss||false;
    this.isExtra=cfg.isExtra||false;
    this.walkAnim=0; this.walkFrame=0;
  }
}

class CCTV {
  constructor(x,y,a=0){ this.x=x;this.y=y;this.angle=a;this.sweep=a;this.dir=1;this.fovA=Math.PI*.33;this.fovD=TILE*6;this.alerted=false; }
}

// ────────────────────────────────────────────
// ALARM
// ────────────────────────────────────────────
const alarm={active:false,timer:0,dur:12,mult:1.55};
function triggerAlarm(reason=''){
  alarm.active=true; alarm.timer=alarm.dur;
  document.getElementById('alarm-overlay').classList.add('active');
  document.getElementById('hud-alarm-strip').classList.remove('hidden');
  startAlarmSFX(); startBGM(true);
  for(const t of G.teachers) t.speed=t.baseSpeed*alarm.mult;
  spawnExtraTeacher();
  showAlert('🚨 ALARM SEKOLAH!');
  toast(`🚨 ${reason}`,'#f44336');
  G.nearCaught+=2;
}
function deactivateAlarm(){
  alarm.active=false;
  document.getElementById('alarm-overlay').classList.remove('active');
  document.getElementById('hud-alarm-strip').classList.add('hidden');
  stopAlarmSFX();
  for(const t of G.teachers) t.speed=t.baseSpeed;
  G.teachers=G.teachers.filter(t=>!t.isExtra);
  startBGM(G.tense);
  toast('✅ Alarm reda','#2ed573');
}
function updateAlarm(dt){
  if(!alarm.active) return;
  alarm.timer-=dt;
  document.getElementById('alarm-time').textContent=Math.ceil(alarm.timer);
  if(alarm.timer<=0) deactivateAlarm();
}
function spawnExtraTeacher(){
  if(!G.map||G.map.floorTiles.length<10) return;
  const ft=G.map.floorTiles;
  let sp=ft[ri(0,ft.length-1)];
  for(let i=0;i<30;i++){ sp=ft[ri(0,ft.length-1)]; if(dist(sp.x,sp.y,G.player.x,G.player.y)>TILE*10) break; }
  const t=new Teacher(sp.x,sp.y,{emoji:'🏃',color:'#ff5722',speed:2*alarm.mult,fovDist:TILE*5.5,isExtra:true});
  const numWP=ri(3,6);
  for(let w=0;w<numWP;w++) t.patrol.push(ft[ri(0,ft.length-1)]);
  G.teachers.push(t);
}

// ────────────────────────────────────────────
// MAIN GAME STATE
// ────────────────────────────────────────────
const G = {
  state:'menu',
  level:1,levelCfg:null,map:null,
  player:null,teachers:[],cctvs:[],
  cam:{x:0,y:0},
  timer:180,timerF:0,
  score:0,nearCaught:0,
  startTime:0,
  tense:false,
  chasing:false,
  sessionCoins:0,
  sessionXP:0,
  doubleEvent:false,
  comboMult:1,
  grassPhase:0,
  lightPhase:0,
  keys:{},
};

// ────────────────────────────────────────────
// LEVEL INIT
// ────────────────────────────────────────────
function initLevel(id){
  const cfg=LEVELS[id-1];
  G.level=id; G.levelCfg=cfg;
  G.timer=cfg.duration; G.timerF=0;
  G.score=0; G.nearCaught=0;
  G.startTime=Date.now();
  G.tense=false; G.chasing=false;
  G.sessionCoins=0; G.sessionXP=0;

  alarm.active=false; alarm.timer=0;
  el('alarm-overlay').classList.remove('active');
  el('hud-alarm-strip').classList.add('hidden');
  stopAlarmSFX();

  G.map=generateMap(cfg);
  const{pStart,floorTiles}=G.map;
  const st=getStats();

  G.player=new Player(pStart.x,pStart.y);
  S.stats.totalPlays=(S.stats.totalPlays||0)+1;

  // Apply passive shop items
  const owned=S.ownedItems||{};
  if((owned.shoes||0)>0){ G.player.hasSilentShoes=true; owned.shoes--; save(); }
  if((owned.radar_up||0)>0){ G.player.hasRadar=true; owned.radar_up--; save(); }
  if((owned.map_up||0)>0){ G.player.hasMapUp=true; owned.map_up--; save(); }

  // Active items
  G.player.activeItems=[];
  for(const cat of ['items','consumables']){
    for(const si of SHOP_DATA[cat].filter(s=>s.active)){
      const cnt=owned[si.id]||0;
      if(cnt>0) G.player.activeItems.push({...si,remaining:cnt});
    }
  }

  // Teachers
  G.teachers=[];
  const tCfgs=[
    {emoji:'👩‍🏫',color:'#ef9a9a',speed:1.5,fovDist:TILE*5},
    {emoji:'👨‍🏫',color:'#90caf9',speed:1.6,fovDist:TILE*5},
    {emoji:'👩‍💼',color:'#ce93d8',speed:1.7,fovDist:TILE*5.5},
    {emoji:'👨‍💼',color:'#80cbc4',speed:1.8,fovDist:TILE*6},
    {emoji:'💂',  color:'#ffb74d',speed:2.0,fovDist:TILE*6.5},
  ];
  if(cfg.boss) tCfgs.push({emoji:'🧑‍⚖️',color:'#f44336',speed:2.6,fovDist:TILE*7.5,fovAngle:Math.PI*.55,isBoss:true});

  const sm=st.stealthMod*TILE;
  for(let i=0;i<Math.min(cfg.teachers,floorTiles.length);i++){
    let sp=floorTiles[ri(0,floorTiles.length-1)];
    for(let a=0;a<30;a++){ sp=floorTiles[ri(0,floorTiles.length-1)]; if(dist(sp.x,sp.y,pStart.x,pStart.y)>TILE*9) break; }
    const tc=tCfgs[i%tCfgs.length];
    if(!cfg.sec&&tc.emoji==='💂') continue;
    if(!cfg.boss&&tc.isBoss) continue;
    const t=new Teacher(sp.x,sp.y,{...tc,fovDist:Math.max(TILE*2,tc.fovDist-sm)});
    const nWP=ri(4,8);
    for(let w=0;w<nWP;w++) t.patrol.push(floorTiles[ri(0,floorTiles.length-1)]);
    G.teachers.push(t);
  }

  // CCTVs
  G.cctvs=[];
  if(cfg.hasCCTV){
    const pts=[];
    for(let y=2;y<cfg.h-2;y+=6) for(let x=2;x<cfg.w-2;x+=6){
      if(G.map.tiles[y]&&G.map.tiles[y][x]===0) pts.push({x:x*TILE+TILE/2,y:y*TILE+TILE/2});
    }
    for(let i=0;i<Math.min(4+id,pts.length);i++) G.cctvs.push(new CCTV(pts[i].x,pts[i].y,Math.random()*TWO_PI));
  }

  // Event
  G.doubleEvent=Math.random()<.2;
  el('hud-event').classList.toggle('hidden',!G.doubleEvent);

  G.cam.x=G.player.x-canvas.width/2;
  G.cam.y=G.player.y-canvas.height/2;
  stopBGM(); startBGM(false);
  updateHUD(); updateInvHUD(); updateActiveItemsHUD();
}

// ────────────────────────────────────────────
// COLLISION
// ────────────────────────────────────────────
function solid(t){ return t===1||t===2||t===4||t===5||t===6||t===9||t===10; }
function getTile(tx,ty){
  if(!G.map) return 1;
  const{tiles,W,H}=G.map;
  if(tx<0||ty<0||tx>=W||ty>=H) return 1;
  return tiles[ty][tx];
}
function move(ent,dx,dy,r=13){
  const steps=4,sx=dx/steps,sy=dy/steps;
  for(let s=0;s<steps;s++){
    const nx=ent.x+sx;
    const lx=Math.floor((nx-r)/TILE),rx2=Math.floor((nx+r)/TILE);
    const ty1=Math.floor((ent.y-r)/TILE),ty2=Math.floor((ent.y+r)/TILE);
    if(!(solid(getTile(lx,ty1))||solid(getTile(lx,ty2))||solid(getTile(rx2,ty1))||solid(getTile(rx2,ty2)))) ent.x=nx;
    const ny=ent.y+sy;
    const bx1=Math.floor((ent.x-r)/TILE),bx2=Math.floor((ent.x+r)/TILE);
    const ty1y=Math.floor((ny-r)/TILE),ty2y=Math.floor((ny+r)/TILE);
    if(!(solid(getTile(bx1,ty1y))||solid(getTile(bx2,ty1y))||solid(getTile(bx1,ty2y))||solid(getTile(bx2,ty2y)))) ent.y=ny;
  }
}

// ────────────────────────────────────────────
// LINE OF SIGHT
// ────────────────────────────────────────────
function hasLOS(ax,ay,bx,by){
  for(let i=1;i<20;i++){
    const t=i/20;
    if(getTile(Math.floor((ax+(bx-ax)*t)/TILE),Math.floor((ay+(by-ay)*t)/TILE))===1) return false;
  }
  return true;
}
function canSee(sx,sy,face,half,fd,px,py){
  if(dist(sx,sy,px,py)>fd) return false;
  if(!inFOV(face,half,angle(sx,sy,px,py))) return false;
  return hasLOS(sx,sy,px,py);
}

// ────────────────────────────────────────────
// ITEM USE (Q)
// ────────────────────────────────────────────
function useItem(){
  const p=G.player;
  if(!p.activeItems.length){ toast('Tidak ada item aktif','#aaa'); return; }
  const slot=p.activeItems[0];
  if(!slot||slot.remaining<=0){ p.activeItems.shift(); updateActiveItemsHUD(); return; }
  sfxUse();
  if(slot.id==='energy'){ p.stamina=p.maxStamina; floatReward(p.x,p.y,'⚡ Stamina Penuh!','#00d2ff'); }
  else if(slot.id==='smoke'){ activateSmoke(); }
  else if(slot.id==='teleport'){ doTeleport(); }
  else if(slot.id==='invis'){ activateInvis(); }
  else if(slot.id==='magnet'){ doMagnet(); }
  slot.remaining--;
  S.ownedItems[slot.id]=Math.max(0,(S.ownedItems[slot.id]||0)-1);
  save();
  if(slot.remaining<=0) p.activeItems.shift();
  updateActiveItemsHUD();
}
function activateSmoke(){
  G.player.smokeActive=true; G.player.smokeTimer=5;
  toast('💨 Smoke Bomb! Guru kehilangan jejakmu!','#9c27b0');
  for(const t of G.teachers) if(t.state==='chase'){t.state='patrol';t.alertTimer=0;}
  for(let i=0;i<12;i++) spawnParticle(G.player.x,G.player.y,{color:'rgba(200,200,200,.7)',size:rnd(5,12),vy:rnd(-2,.5),vx:rnd(-2,2),life:1.5,gravity:.01});
}
function activateInvis(){
  G.player.invisible=true; G.player.invisTimer=8;
  floatReward(G.player.x,G.player.y,'👻 Invisible!','#9c27b0');
}
function doTeleport(){
  const ft=G.map.floorTiles;
  if(!ft.length) return;
  let dest;
  for(let i=0;i<30;i++){ dest=ft[ri(0,ft.length-1)]; if(dist(dest.x,dest.y,G.player.x,G.player.y)>TILE*6) break; }
  if(dest){ G.player.x=dest.x; G.player.y=dest.y; }
  for(let i=0;i<10;i++) spawnParticle(G.player.x,G.player.y,{color:'#a855f7',size:rnd(3,8),vy:rnd(-3,-1),vx:rnd(-2,2),life:.8});
  toast('🌀 Teleport!','#a855f7');
}
function doMagnet(){
  let got=0;
  for(const c of G.map.coins){
    if(!c.collected&&dist(G.player.x,G.player.y,c.x,c.y)<TILE*6){
      c.collected=true;
      const val=c.rare?c.value*3:c.value;
      const earned=G.doubleEvent?val*2:val;
      G.sessionCoins+=earned;
      got+=earned;
      spawnCoinParticles(c.x,c.y);
    }
  }
  floatReward(G.player.x,G.player.y,`🧲 +${got} koin!`,'#ffd700');
}

// ────────────────────────────────────────────
// INTERACT (E)
// ────────────────────────────────────────────
function interact(){
  const p=G.player, map=G.map;
  if(p.hiding){ p.hiding=false;p.hideSpot=null;p.animState='idle';toast('Keluar persembunyian','#aaa');return; }
  // Hide
  for(const spot of map.hides){
    if(dist(p.x,p.y,spot.x,spot.y)<TILE*1.2){
      p.hiding=true;p.hideSpot=spot;p.x=spot.x;p.y=spot.y;p.animState='idle';
      sfxHide();toast('🫥 Bersembunyi...','#9c27b0');return;
    }
  }
  // Secret passage
  for(const sec of map.secrets){
    if(dist(p.x,p.y,sec.x,sec.y)<TILE*1.2){
      p.x=sec.destX;p.y=sec.destY;
      toast('🕳️ Jalur Rahasia!','#00d2ff');
      for(let i=0;i<8;i++) spawnParticle(p.x,p.y,{color:'#00d2ff',size:rnd(3,7),vy:rnd(-3,-1),vx:rnd(-2,2),life:.8});
      return;
    }
  }
  // Chest
  for(const ch of map.chests){
    if(!ch.opened&&dist(p.x,p.y,ch.x,ch.y)<TILE*1.2){
      ch.opened=true;
      const r=ch.reward;
      G.sessionCoins+=r;
      addCoins(r);
      floatReward(ch.x,ch.y,`🎁 +${r} Koin!`,'#ffd700');
      for(let i=0;i<12;i++) spawnParticle(ch.x,ch.y,{color:ri(0,1)?'#ffd700':'#ff4757',size:rnd(3,8),vy:rnd(-4,-1),vx:rnd(-3,3),life:1});
      return;
    }
  }
  // Door
  for(let y=0;y<map.H;y++) for(let x=0;x<map.W;x++){
    if(map.tiles[y][x]===2){
      const tx=x*TILE+TILE/2,ty=y*TILE+TILE/2;
      if(dist(p.x,p.y,tx,ty)<TILE*1.3){
        if(p.hasItem('class_key')){ map.tiles[y][x]=3;sfxHide();toast('🔑 Pintu Terbuka!','#2ed573'); }
        else { toast('🔒 Butuh Kunci Kelas!','#f44336'); triggerAlarm('Mencoba paksa pintu!'); }
        return;
      }
    }
  }
  toast('Tidak ada yang bisa dilakukan','#888');
}

// ────────────────────────────────────────────
// GAME LOOP
// ────────────────────────────────────────────
let lastT=0;
function loop(ts){
  if(G.state!=='playing') return;
  const dt=Math.min((ts-lastT)/(1000/FPS),3);
  lastT=ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function update(dt){
  const p=G.player;
  if(p.caught||p.won) return;

  // Timer
  G.timerF+=dt;
  if(G.timerF>=1){G.timerF-=1;G.timer=Math.max(0,G.timer-1);}
  if(G.timer<=0){doGameOver('Waktu habis! Bel berbunyi!');return;}

  // Alarm
  updateAlarm(dt);

  // Grass / light phase
  G.grassPhase+=dt*.8; G.lightPhase+=dt*1.2;

  // Smoke
  if(p.smokeActive){ p.smokeTimer-=dt; if(p.smokeTimer<=0){p.smokeActive=false;} }
  // Invis
  if(p.invisible){ p.invisTimer-=dt; if(p.invisTimer<=0){p.invisible=false;toast('Invisibility habis','#888');} }

  // Combo timer
  if(p.combo>0){ p.comboTimer-=dt; if(p.comboTimer<=0){p.combo=0;G.comboMult=1;updateComboHUD();} }

  // BGM
  const tense=G.chasing||G.timer<30||alarm.active;
  if(tense!==G.tense&&!alarm.active){ G.tense=tense; startBGM(tense); }

  const st=getStats();

  // ── Player movement ──
  if(!p.hiding){
    const k=G.keys;
    let dx=0,dy=0;
    if(k['ArrowLeft'] ||k['a']||k['A']) dx-=1;
    if(k['ArrowRight']||k['d']||k['D']) dx+=1;
    if(k['ArrowUp']   ||k['w']||k['W']) dy-=1;
    if(k['ArrowDown'] ||k['s']||k['S']) dy+=1;
    const moving=dx||dy;
    p.running=(k['Shift'])&&p.stamina>0&&moving;
    p.sneaking=(k['Control'])&&moving&&!p.running;
    if(p.running) p.stamina=Math.max(0,p.stamina-BASE.drain*dt);
    else if(!moving) p.stamina=Math.min(p.maxStamina,p.stamina+BASE.regen*dt);
    if(p.stamina===0) p.running=false;
    const spd=(p.running?st.runSpeed:p.sneaking?st.walkSpeed*.5:st.walkSpeed)*dt;
    if(moving){
      const len=Math.hypot(dx,dy);
      dx=dx/len*spd; dy=dy/len*spd;
      p.facing=angle(0,0,dx,dy);
      p.stepTimer+=dt;
      const si=p.running?.22:p.sneaking?.6:.42;
      if(p.stepTimer>=si){ p.stepTimer=0; sfxStep(p.hasSilentShoes); if(p.running) spawnDust(p.x,p.y+16); }
      p.walkAnim+=dt*(p.running?11:p.sneaking?3:5);
      p.walkFrame=Math.floor(p.walkAnim)%8;
      p.animState=p.running?'run':p.sneaking?'sneak':'walk';
      p.stepDust+=dt; if(p.stepDust>.15&&p.running){p.stepDust=0;spawnDust(p.x+rnd(-6,6),p.y+14);}
    } else {
      p.animState='idle'; p.walkFrame=0;
    }
    move(p,dx,dy,13);
  }

  // Keys
  if(G.keys['e']||G.keys['E']){G.keys['e']=G.keys['E']=false;interact();}
  if(G.keys['q']||G.keys['Q']){G.keys['q']=G.keys['Q']=false;useItem();}

  // Pet follows
  if(p.hasPet){
    const pet=p.pet;
    pet.targetX=p.x-Math.cos(p.facing)*30;
    pet.targetY=p.y-Math.sin(p.facing)*30;
    pet.x=lerp(pet.x,pet.targetX,.08);
    pet.y=lerp(pet.y,pet.targetY,.08);
    pet.frameTimer+=dt; if(pet.frameTimer>.2){pet.frameTimer=0;pet.frame=(pet.frame+1)%4;}
  }

  // Exit
  const ep=G.map.exitPos;
  if(!p.hiding&&dist(p.x,p.y,ep.x,ep.y)<TILE*.7){
    if(p.hasItem('gate_key')){ doWin(); return; }
    else toast('🗝️ Butuh Kunci Gerbang!','#f39c12');
  }

  // Coins
  for(const c of G.map.coins){
    if(!c.collected&&dist(p.x,p.y,c.x,c.y)<TILE*.65){
      c.collected=true;
      const base=c.rare?c.value*3:c.value;
      const mult=G.doubleEvent?2:1;
      const earned=base*mult*G.comboMult;
      G.sessionCoins+=Math.round(earned);
      // Combo
      p.combo=Math.min(p.combo+1,10);
      p.comboTimer=2;
      G.comboMult=1+Math.min(p.combo*.15,.9);
      sfxCoin();
      spawnCoinParticles(c.x,c.y);
      floatReward(c.x,c.y-20,`+${Math.round(earned)}🪙${G.comboMult>1?` ×${G.comboMult.toFixed(1)}`:''}`,'#ffd700');
      updateComboHUD();
      if(p.combo>=5) unlockAch('combo5');
      S.stats.maxCombo=Math.max(S.stats.maxCombo||0,p.combo);
      S.stats.maxCombo>=5&&unlockAch('combo5');
    }
    c.spin+=dt*2.5;
  }

  // Items on map
  for(const item of G.map.items){
    if(!item.collected&&dist(p.x,p.y,item.x,item.y)<TILE*.65){
      item.collected=true;
      if(item.type==='energy_drink'){ p.stamina=p.maxStamina;toast('🥤 Stamina Penuh!','#00d2ff'); }
      else{ const ok=p.addItem(item.type); if(ok){toast(`Got: ${ITEM_NAMES[item.type]||item.type}!`,'#1e90ff');S.stats.itemsGot=(S.stats.itemsGot||0)+1;} }
      sfxCoin(); updateInvHUD();
    }
  }

  // NPCs (they just walk around)
  for(const npc of G.map.npcs) updateNPC(npc,dt);

  // CCTV
  G.chasing=false;
  for(const cctv of G.cctvs){
    cctv.sweep+=.007*cctv.dir*dt*60;
    if(Math.abs(normA(cctv.sweep-cctv.angle))>Math.PI*.5) cctv.dir*=-1;
    const spotted=!p.hiding&&!p.smokeActive&&!p.invisible&&
      canSee(cctv.x,cctv.y,cctv.sweep,cctv.fovA,cctv.fovD,p.x,p.y);
    if(spotted){
      cctv.alerted=true;
      triggerAlarm('Kena CCTV!');
      let mn=Infinity,near=null;
      for(const t of G.teachers){const d=dist(t.x,t.y,p.x,p.y);if(d<mn){mn=d;near=t;}}
      if(near&&near.state==='patrol'){near.state='alerted';near.lastSeenX=p.x;near.lastSeenY=p.y;near.alertTimer=5;near.exclamTimer=1.5;sfxAlert();}
    } else cctv.alerted=false;
  }

  // Teachers
  for(const t of G.teachers){ updateTeacher(t,dt); if(t.state==='chase') G.chasing=true; }

  // Camera smooth follow
  G.cam.x=lerp(G.cam.x,p.x-canvas.width/2,.1);
  G.cam.y=lerp(G.cam.y,p.y-canvas.height/2,.1);

  updateParticles(dt);
  updateHUD();
  drawMiniMap();
}

const ITEM_NAMES={gate_key:'🗝️ Kunci Gerbang',class_key:'🔑 Kunci Kelas',access_card:'💳 Kartu Akses',school_map:'🗺️ Peta',energy_drink:'🥤 Energi'};

function updateNPC(npc,dt){
  if(npc.wait>0){npc.wait-=dt;return;}
  const wp=npc.patrol[npc.patrolIdx];
  if(!wp) return;
  const dx=wp.x-npc.x,dy=wp.y-npc.y,d=Math.hypot(dx,dy);
  if(d<4){npc.patrolIdx=(npc.patrolIdx+1)%npc.patrol.length;npc.wait=rnd(.5,2);}
  else{npc.facing=angle(0,0,dx,dy);move(npc,dx/d*BASE.walk*.8*dt,dy/d*BASE.walk*.8*dt,11);}
  npc.walkAnim+=dt*4;npc.walkFrame=Math.floor(npc.walkAnim)%8;
}

function updateTeacher(t,dt){
  if(t.exclamTimer>0) t.exclamTimer-=dt;
  const p=G.player;
  const blocked=p.hiding||p.smokeActive||p.invisible;
  const sees=!blocked&&canSee(t.x,t.y,t.facing,t.fovAngle,t.fovDist,p.x,p.y);
  if(sees&&t.state!=='chase'){
    t.state='alerted';t.alertTimer=6;t.lastSeenX=p.x;t.lastSeenY=p.y;t.exclamTimer=1.5;
    sfxAlert();showAlert('⚠ GURU MELIHATMU!');G.nearCaught++;
  }
  if(t.state==='alerted'&&sees){t.state='chase';t.alertTimer=10;}
  if(t.state==='chase'){
    if(!sees){t.alertTimer-=dt;if(t.alertTimer<=0){t.state='patrol';t.alertTimer=0;}}
    else{t.lastSeenX=p.x;t.lastSeenY=p.y;}
    const dx=t.lastSeenX-t.x,dy=t.lastSeenY-t.y,d=Math.hypot(dx,dy);
    if(d>2){t.facing=angle(0,0,dx,dy);move(t,dx/d*t.speed*dt*1.5,dy/d*t.speed*dt*1.5,11);}
    if(!blocked&&dist(t.x,t.y,p.x,p.y)<TILE*.5){
      if(p.smokeActive){t.state='patrol';}
      else{p.animState='caught';spawnCatchParticles(p.x,p.y);screenShake();doGameOver('Guru berhasil menangkapmu!');return;}
    }
  } else if(t.state==='alerted'){
    t.alertTimer-=dt; if(t.alertTimer<=0)t.state='patrol';
    const dx=t.lastSeenX-t.x,dy=t.lastSeenY-t.y,d=Math.hypot(dx,dy);
    if(d>TILE){t.facing=angle(0,0,dx,dy);move(t,dx/d*t.speed*dt,dy/d*t.speed*dt,11);}
  } else {
    if(!t.patrol.length)return;
    if(t.pWait>0){t.pWait-=dt;return;}
    const wp=t.patrol[t.pIdx];
    const dx=wp.x-t.x,dy=wp.y-t.y,d=Math.hypot(dx,dy);
    if(d<4){t.pIdx=(t.pIdx+1)%t.patrol.length;t.pWait=rnd(.3,1.2);}
    else{t.facing=angle(0,0,dx,dy);move(t,dx/d*t.speed*dt,dy/d*t.speed*dt,11);}
  }
  t.walkAnim+=dt*(t.state==='chase'?11:5);
  t.walkFrame=Math.floor(t.walkAnim)%8;
}

// ────────────────────────────────────────────
// WIN / LOSE
// ────────────────────────────────────────────
function doGameOver(reason){
  G.state='gameover'; G.player.caught=true;
  stopBGM();stopAlarmSFX();sfxLose();
  S.stats.deaths=(S.stats.deaths||0)+1;
  const partialCoins=Math.floor(G.sessionCoins*.3);
  if(partialCoins>0){addCoins(partialCoins);addXP(G.sessionCoins*2);}
  save();
  el('go-reason').textContent=reason;
  el('go-stats').innerHTML=`<div class="stats-grid">
    <div class="stat-item"><div class="stat-val">${fmtTime(Math.floor((Date.now()-G.startTime)/1000))}</div><div class="stat-lbl">Waktu</div></div>
    <div class="stat-item"><div class="stat-val">${G.player.inventory.length}</div><div class="stat-lbl">Item</div></div>
    <div class="stat-item"><div class="stat-val">🪙${partialCoins}</div><div class="stat-lbl">Koin (30%)</div></div>
  </div>`;
  showScreen('gameover');
}

function doWin(){
  G.state='win'; G.player.won=true;
  G.player.animState='victory';
  stopBGM();stopAlarmSFX();sfxWin();
  const elapsed=Math.floor((Date.now()-G.startTime)/1000);
  const perfect=G.nearCaught===0;
  const allItems=G.map.items.every(i=>i.collected);
  const base=G.levelCfg.duration-elapsed;
  const itemBonus=G.player.inventory.length*50;
  const perfBonus=perfect?250:0;
  G.score=Math.max(0,base*12+itemBonus+perfBonus);
  // Rewards
  const coinReward=Math.round(G.level*35+Math.max(10,80-elapsed*.3));
  const totalCoins=G.sessionCoins+coinReward;
  const xpReward=Math.round(G.level*40+base*3);
  const finalCoins=addCoins(totalCoins);
  addXP(xpReward);
  // Update stats
  S.stats.wins=(S.stats.wins||0)+1;
  if(perfect)S.stats.perfectRuns=(S.stats.perfectRuns||0)+1;
  if(elapsed<=60)S.stats.speedWins=(S.stats.speedWins||0)+1;
  const prev=S.bestScores[G.level]||0;
  if(G.score>prev)S.bestScores[G.level]=G.score;
  const next=G.level+1;
  if(next<=LEVELS.length&&!S.unlockedLevels.includes(next))S.unlockedLevels.push(next);
  S.currentLevel=Math.max(S.currentLevel,G.level);
  save();
  // Achievements
  if(G.level===1)unlockAch('first');
  if(elapsed<=60)unlockAch('speed60');
  if(perfect)unlockAch('ghost');
  if(allItems)unlockAch('collector');
  if(S.currentLevel>=LEVELS.length)unlockAch('master');
  // Missions progress
  updateMissionProgress();
  // Confetti!
  spawnConfetti();
  el('win-stats').innerHTML=`<div class="stats-grid">
    <div class="stat-item"><div class="stat-val">${G.score}</div><div class="stat-lbl">Skor</div></div>
    <div class="stat-item"><div class="stat-val">${fmtTime(elapsed)}</div><div class="stat-lbl">Waktu</div></div>
    <div class="stat-item"><div class="stat-val">${G.player.inventory.length}</div><div class="stat-lbl">Item</div></div>
    <div class="stat-item"><div class="stat-val">${G.nearCaught}</div><div class="stat-lbl">Hampir Kena</div></div>
  </div>`;
  el('win-rewards').innerHTML=`
    <div class="reward-row"><span class="reward-name">🪙 Koin Diperoleh</span><span class="reward-val">+${finalCoins}</span></div>
    <div class="reward-row"><span class="reward-name">✨ XP Diperoleh</span><span class="reward-val">+${xpReward}</span></div>
    ${perfect?'<div class="reward-row"><span class="reward-name">👻 Perfect Bonus</span><span class="reward-val">+250</span></div>':''}
  `;
  el('win-new-unlock').textContent=next<=LEVELS.length?`🔓 Level ${next} Terbuka!`:'';
  const nb=el('btn-next-level');
  if(next>LEVELS.length){nb.textContent='🏆 Selesai!';nb.disabled=true;}
  else{nb.textContent=`▶ Level ${next}`;nb.disabled=false;}
  showScreen('win');
  // After win, show lucky spin!
  setTimeout(()=>showLuckySpin(),1800);
}

// ────────────────────────────────────────────
// RENDERING — HD CANVAS
// ────────────────────────────────────────────
const canvas=el('game-canvas');
const ctx=canvas.getContext('2d');
function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
window.addEventListener('resize',resize);resize();

function draw(){
  if(!G.map||!G.player) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cx=Math.round(G.cam.x), cy=Math.round(G.cam.y);

  // Background
  ctx.fillStyle='#1a2a1a';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const{tiles,W,H}=G.map;
  const x0=Math.max(0,Math.floor(cx/TILE)-1);
  const x1=Math.min(W,Math.ceil((cx+canvas.width)/TILE)+1);
  const y0=Math.max(0,Math.floor(cy/TILE)-1);
  const y1=Math.min(H,Math.ceil((cy+canvas.height)/TILE)+1);

  // Alarm tint
  const aTint=alarm.active?(Math.sin(Date.now()/200)+1)*.5*.15:0;

  // Tiles
  for(let ty=y0;ty<y1;ty++) for(let tx=x0;tx<x1;tx++) drawTile(ctx,tiles[ty][tx],tx*TILE-cx,ty*TILE-cy,aTint,tx,ty);

  // Grass animation on floor tiles (border strip)
  drawGrass(ctx,x0,x1,y0,y1,tiles,cx,cy);

  // FOV cones
  ctx.save();
  for(const t of G.teachers){
    const sx=t.x-cx,sy=t.y-cy;
    if(sx<-200||sx>canvas.width+200||sy<-200||sy>canvas.height+200) continue;
    const col=t.state==='chase'?'rgba(255,71,87,.2)':t.state==='alerted'?'rgba(255,215,0,.15)':'rgba(255,230,100,.08)';
    drawFOV(ctx,sx,sy,t.facing,t.fovAngle,t.fovDist,col,t.isBoss);
  }
  for(const c of G.cctvs) drawFOV(ctx,c.x-cx,c.y-cy,c.sweep,c.fovA,c.fovD,c.alerted?'rgba(255,71,87,.22)':'rgba(0,210,255,.1)',false);
  ctx.restore();

  // Coins
  for(const c of G.map.coins){
    if(c.collected) continue;
    const sx=c.x-cx,sy=c.y-cy;
    if(sx<-30||sx>canvas.width+30||sy<-30||sy>canvas.height+30) continue;
    drawCoin(ctx,sx,sy,c.rare,c.spin);
  }

  // Chests
  for(const ch of G.map.chests){
    if(ch.opened) continue;
    const sx=ch.x-cx,sy=ch.y-cy;
    ctx.save();
    ctx.shadowBlur=12;ctx.shadowColor='#ffd700';
    ctx.font='26px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const bob=Math.sin(Date.now()/400)*3;
    ctx.fillText('🎁',sx,sy+bob);
    ctx.restore();
  }

  // Map items
  for(const item of G.map.items){
    if(item.collected) continue;
    const sx=item.x-cx,sy=item.y-cy;
    if(sx<-50||sx>canvas.width+50||sy<-50||sy>canvas.height+50) continue;
    const bob=Math.sin(Date.now()/380+item.x)*3;
    ctx.save();ctx.shadowBlur=14;ctx.shadowColor='#4fc3f7';
    ctx.font='24px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(ITEM_EMOJIS[item.type]||'?',sx,sy+bob);
    ctx.restore();
  }

  // Secret passages
  for(const s of G.map.secrets){
    const sx=s.x-cx,sy=s.y-cy;
    ctx.save();ctx.shadowBlur=16;ctx.shadowColor='#00d2ff';
    ctx.font='22px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const bob=Math.sin(Date.now()/300)*3;
    ctx.fillText('🕳️',sx,sy+bob);
    ctx.restore();
  }

  // CCTVs
  for(const c of G.cctvs){
    const sx=c.x-cx,sy=c.y-cy;
    ctx.save();ctx.translate(sx,sy);
    // Camera body
    ctx.fillStyle=c.alerted?'#f44336':'#263238';
    roundRect(ctx,-9,-9,18,18,4);ctx.fill();
    ctx.fillStyle=c.alerted?'#ff8a65':'#00bcd4';
    ctx.beginPath();ctx.arc(0,0,5,0,TWO_PI);ctx.fill();
    if(c.alerted){ctx.strokeStyle='#f44336';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,10,0,TWO_PI);ctx.stroke();}
    ctx.restore();
  }

  // NPCs
  for(const npc of G.map.npcs) drawNPC(ctx,npc,cx,cy);

  // Teachers
  for(const t of G.teachers){
    const sx=t.x-cx,sy=t.y-cy;
    if(sx<-60||sx>canvas.width+60||sy<-60||sy>canvas.height+60) continue;
    drawTeacher(ctx,t,sx,sy);
  }

  // Player
  const p=G.player;
  const psx=p.x-cx, psy=p.y-cy;
  if(!p.hiding){
    if(p.hasPet) drawPet(ctx,p.pet.x-cx,p.pet.y-cy);
    drawPlayer(ctx,p,psx,psy);
  } else {
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.globalAlpha=.3;drawPlayer(ctx,p,psx,psy);ctx.restore();
    ctx.fillStyle='#a855f7';
    ctx.font="bold 14px 'Nunito',sans-serif";
    ctx.textAlign='center';ctx.fillText('🫥 BERSEMBUNYI — tekan E untuk keluar',canvas.width/2,canvas.height/2+90);
  }

  // Invisible tint
  if(p.invisible){
    ctx.save();
    ctx.globalAlpha=.15+Math.sin(Date.now()/150)*.08;
    ctx.fillStyle='#a855f7';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();
    // Timer bar
    const pct=p.invisTimer/8;
    ctx.fillStyle='rgba(168,85,247,.5)';ctx.fillRect(0,canvas.height-4,canvas.width*pct,4);
  }

  // Particles
  drawParticles(ctx,cx,cy);

  // Light effect on exit
  const{exitPos}=G.map;
  const esx=exitPos.x-cx,esy=exitPos.y-cy;
  const exitAlpha=.3+Math.sin(Date.now()/400)*.2;
  const grad=ctx.createRadialGradient(esx,esy,0,esx,esy,TILE*2.5);
  grad.addColorStop(0,`rgba(255,215,0,${exitAlpha})`);
  grad.addColorStop(1,'rgba(255,215,0,0)');
  ctx.fillStyle=grad;ctx.beginPath();ctx.arc(esx,esy,TILE*2.5,0,TWO_PI);ctx.fill();
}

const ITEM_EMOJIS={gate_key:'🗝️',class_key:'🔑',access_card:'💳',school_map:'🗺️',energy_drink:'🥤'};

function drawTile(ctx,t,sx,sy,aTint,tx,ty){
  const alt=(tx+ty)%2===0;
  if(t===0){
    ctx.fillStyle=alt?'#2d5a27':'#2f6229';
    ctx.fillRect(sx,sy,TILE,TILE);
    if(aTint>0){ctx.fillStyle=`rgba(180,20,20,${aTint})`;ctx.fillRect(sx,sy,TILE,TILE);}
    // subtle floor lines
    ctx.strokeStyle='rgba(0,0,0,.1)';ctx.lineWidth=.5;ctx.strokeRect(sx,sy,TILE,TILE);
  } else if(t===1){
    // Wall with 3D top
    const wc=alt?'#1e1e30':'#22223a';
    ctx.fillStyle=wc;ctx.fillRect(sx,sy,TILE,TILE);
    ctx.fillStyle=alt?'#2a2a44':'#2e2e4e';ctx.fillRect(sx,sy,TILE,Math.round(TILE*.3));
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(sx,sy+Math.round(TILE*.3),TILE,2);
  } else if(t===2){ // door closed
    ctx.fillStyle='#6d4c41';ctx.fillRect(sx+2,sy+2,TILE-4,TILE-4);
    ctx.fillStyle='#a1887f';ctx.fillRect(sx+5,sy+5,TILE-10,TILE-10);
    ctx.fillStyle='#ffd700';ctx.beginPath();ctx.arc(sx+TILE*.72,sy+TILE*.5,4,0,TWO_PI);ctx.fill();
    // lock icon
    ctx.font='12px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🔒',sx+TILE/2,sy+TILE*.65);
  } else if(t===3){ // door open
    ctx.fillStyle='#3e2723';ctx.fillRect(sx,sy,TILE,TILE);
    ctx.fillStyle='rgba(100,200,100,.12)';ctx.fillRect(sx,sy,TILE,TILE);
  } else if(t===4){ // locker
    ctx.fillStyle='#546e7a';ctx.fillRect(sx+3,sy+3,TILE-6,TILE-6);
    ctx.strokeStyle='#78909c';ctx.lineWidth=1.5;ctx.strokeRect(sx+4,sy+4,TILE-8,TILE-8);
    ctx.strokeStyle='#546e7a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx+TILE/2,sy+5);ctx.lineTo(sx+TILE/2,sy+TILE-5);ctx.stroke();
    ctx.fillStyle='#cfd8dc';ctx.beginPath();ctx.arc(sx+TILE-11,sy+TILE/2,3.5,0,TWO_PI);ctx.fill();
  } else if(t===5){ // desk
    ctx.fillStyle='#795548';ctx.fillRect(sx+3,sy+3,TILE-6,TILE-6);
    ctx.fillStyle='#8d6e63';ctx.fillRect(sx+4,sy+4,TILE-8,TILE*.4);
    ctx.strokeStyle='#a1887f';ctx.lineWidth=1;ctx.strokeRect(sx+3,sy+3,TILE-6,TILE-6);
  } else if(t===6){ // toilet
    ctx.fillStyle='#37474f';ctx.fillRect(sx+2,sy+2,TILE-4,TILE-4);
    ctx.fillStyle='#eceff1';ctx.beginPath();ctx.ellipse(sx+TILE/2,sy+TILE/2,TILE*.3,TILE*.34,0,0,TWO_PI);ctx.fill();
  } else if(t===7){ // exit
    ctx.fillStyle='#1b5e20';ctx.fillRect(sx,sy,TILE,TILE);
    const pulse=(Math.sin(Date.now()/280)+1)/2;
    ctx.fillStyle=`rgba(76,175,80,${.2+pulse*.3})`;ctx.fillRect(sx,sy,TILE,TILE);
    ctx.font=`${TILE*.65}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('🚪',sx+TILE/2,sy+TILE/2);
  } else if(t===9){ // plant
    ctx.fillStyle='#2e7d32';ctx.fillRect(sx+8,sy+8,TILE-16,TILE-16);
    ctx.font=`${TILE*.65}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('🪴',sx+TILE/2,sy+TILE/2);
  } else if(t===10){ // poster
    ctx.fillStyle='#fff9c4';ctx.fillRect(sx+5,sy+5,TILE-10,TILE-10);
    ctx.strokeStyle='#f57f17';ctx.lineWidth=2;ctx.strokeRect(sx+5,sy+5,TILE-10,TILE-10);
    ctx.font='10px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='#f57f17';ctx.fillText('📢',sx+TILE/2,sy+TILE/2);
  } else if(t===11){ // secret
    ctx.fillStyle=alt?'#2d5a27':'#2f6229';ctx.fillRect(sx,sy,TILE,TILE);
    const glow=(Math.sin(Date.now()/400)+1)/2;
    ctx.fillStyle=`rgba(0,210,255,${.1+glow*.15})`;ctx.fillRect(sx,sy,TILE,TILE);
  }
}

function drawGrass(ctx,x0,x1,y0,y1,tiles,cx,cy){
  // Simple animated grass sprites on floor edges near walls
  for(let ty=y0;ty<y1;ty++) for(let tx=x0;tx<x1;tx++){
    if(tiles[ty][tx]!==0) continue;
    if(tiles[Math.max(0,ty-1)]&&tiles[Math.max(0,ty-1)][tx]===1){
      const sx=tx*TILE-cx,sy=ty*TILE-cy;
      const wave=Math.sin(G.grassPhase+tx*.7)*.8;
      ctx.save();ctx.globalAlpha=.5;
      ctx.fillStyle='#4caf50';
      for(let i=0;i<3;i++){
        const bx=sx+6+i*12,by=sy+2;
        ctx.beginPath();ctx.moveTo(bx,by+8);
        ctx.quadraticCurveTo(bx+wave+2,by+3,bx+3+wave,by);
        ctx.quadraticCurveTo(bx+6,by+3,bx+4,by+8);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

function drawFOV(ctx,sx,sy,facing,half,fd,col,isBoss){
  ctx.beginPath();ctx.moveTo(sx,sy);
  const steps=isBoss?30:20;
  for(let i=0;i<=steps;i++){
    const a=facing-half+(half*2)*(i/steps);
    ctx.lineTo(sx+Math.cos(a)*fd,sy+Math.sin(a)*fd);
  }
  ctx.closePath();ctx.fillStyle=col;ctx.fill();
  if(isBoss){ctx.strokeStyle='rgba(255,71,87,.3)';ctx.lineWidth=2;ctx.stroke();}
}

function drawCoin(ctx,sx,sy,rare,spin){
  const bob=Math.sin(Date.now()/350)*3;
  ctx.save();
  if(rare){ctx.shadowBlur=18;ctx.shadowColor='#ffd700';}
  else{ctx.shadowBlur=8;ctx.shadowColor='rgba(255,215,0,.5)';}
  ctx.translate(sx,sy+bob);
  // Spinning coin using x scale
  const scaleX=Math.cos(spin);
  ctx.scale(Math.abs(scaleX)<.05?.05:scaleX,1);
  ctx.fillStyle=rare?'#ff9800':'#ffd700';
  ctx.beginPath();ctx.arc(0,0,rare?9:7,0,TWO_PI);ctx.fill();
  if(Math.abs(scaleX)>.3){
    ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.arc(-2,-2,rare?4:3,0,TWO_PI);ctx.fill();
  }
  ctx.restore();
}

function drawPlayer(ctx,p,sx,sy){
  ctx.save();ctx.translate(sx,sy);
  // Invisible effect
  if(p.invisible) ctx.globalAlpha=.35;

  // Shadow
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,16,12,4,0,0,TWO_PI);ctx.fill();

  // Walk/idle bob
  const frame=p.walkFrame;
  const legOff=p.animState==='walk'||p.animState==='run'||p.animState==='sneak'?Math.sin(frame*.8)*3:0;
  const bodyBob=p.animState==='idle'?Math.sin(Date.now()/800)*.8:0;

  ctx.translate(0,bodyBob);

  // Legs
  const legColor=p.skin.color+'cc';
  // Left leg
  ctx.fillStyle=legColor;
  roundRect(ctx,-7,4,6,10,3);
  ctx.save();ctx.translate(-4,4);
  ctx.rotate(legOff*.12);
  ctx.fillRect(0,0,5,10);
  ctx.restore();
  // Right leg
  ctx.save();ctx.translate(2,4);
  ctx.rotate(-legOff*.12);
  ctx.fillStyle=legColor;ctx.fillRect(0,0,5,10);
  ctx.restore();

  // Body
  const bodyGrad=ctx.createLinearGradient(-10,-5,10,12);
  bodyGrad.addColorStop(0,p.running?'#ff5722':p.animState==='sneak'?'#9c27b0':p.skin.color);
  bodyGrad.addColorStop(1,p.running?'#bf360c':p.animState==='sneak'?'#6a1b9a':p.skin.color+'aa');
  ctx.fillStyle=bodyGrad;
  roundRect(ctx,-10,-5,20,18,5);ctx.fill();

  // Backpack
  ctx.fillStyle='#1565c0';
  roundRect(ctx,8,-8,9,14,3);ctx.fill();
  ctx.fillStyle='#1976d2';ctx.fillRect(9,-5,7,2);ctx.fillRect(9,0,7,2);

  // Head
  const headGrad=ctx.createRadialGradient(-2,-17,2,-2,-17,10);
  headGrad.addColorStop(0,'#ffccbc');
  headGrad.addColorStop(1,'#ffab91');
  ctx.fillStyle=headGrad;
  roundRect(ctx,-9,-22,18,18,7);ctx.fill();

  // Hair
  ctx.fillStyle=p.skin.id==='default'?'#4e342e':p.skin.id==='nerd'?'#1a237e':p.skin.id==='ninja'?'#111':'#4e342e';
  ctx.fillRect(-9,-22,18,6);
  roundRect(ctx,-9,-22,18,6,7);ctx.fill();

  // Eyes
  const eyeAng=p.facing;
  const ex=Math.cos(eyeAng)*2.5,ey=Math.sin(eyeAng)*2.5;
  ctx.fillStyle='#212121';
  ctx.beginPath();ctx.arc(-3.5+ex,-14+ey,2.5,0,TWO_PI);ctx.fill();
  ctx.beginPath();ctx.arc(3.5+ex,-14+ey,2.5,0,TWO_PI);ctx.fill();
  // Eye shine
  ctx.fillStyle='rgba(255,255,255,.6)';
  ctx.beginPath();ctx.arc(-2.5+ex,-15+ey,1,0,TWO_PI);ctx.fill();
  ctx.beginPath();ctx.arc(4.5+ex,-15+ey,1,0,TWO_PI);ctx.fill();

  // Skin emoji override
  if(p.skin.id!=='default'){
    ctx.font='13px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.skin.emoji,0,-13);
  }

  // Victory animation
  if(p.animState==='victory'){
    const varm=Math.sin(Date.now()/200)*30;
    ctx.fillStyle=p.skin.color;
    ctx.save();ctx.translate(-11,-3);ctx.rotate((-30+varm)*Math.PI/180);ctx.fillRect(-2,-8,5,10);ctx.restore();
    ctx.save();ctx.translate(11,-3);ctx.rotate((30-varm)*Math.PI/180);ctx.fillRect(-3,-8,5,10);ctx.restore();
  }

  ctx.restore();
}

function drawTeacher(ctx,t,sx,sy){
  ctx.save();ctx.translate(sx,sy);
  // Exclamation mark
  if(t.exclamTimer>0){
    ctx.globalAlpha=Math.min(1,t.exclamTimer);
    ctx.font="bold 22px 'Press Start 2P',monospace";
    ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillStyle=t.state==='chase'?'#f44336':'#ffd700';
    const sy2=-28+Math.sin(Date.now()/120)*3;
    ctx.fillText('!',0,sy2);
    ctx.globalAlpha=1;
  }
  const frame=t.walkFrame;
  const legOff=Math.sin(frame*.8)*3;
  const bodyBob=t.state!=='patrol'?0:Math.sin(t.walkAnim*.8)*.5;
  ctx.translate(0,bodyBob);
  // Shadow
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,16,11,4,0,0,TWO_PI);ctx.fill();
  // Legs
  ctx.fillStyle='#78909c';
  ctx.save();ctx.translate(-4,4);ctx.rotate(legOff*.1);ctx.fillRect(0,0,5,10);ctx.restore();
  ctx.save();ctx.translate(2,4);ctx.rotate(-legOff*.1);ctx.fillRect(0,0,5,10);ctx.restore();
  // Body
  const bc=alarm.active&&t.state==='chase'?'#b71c1c':t.color;
  ctx.fillStyle=bc;roundRect(ctx,-10,-5,20,18,5);ctx.fill();
  // Head
  ctx.fillStyle='#ffccbc';roundRect(ctx,-8,-22,16,17,6);ctx.fill();
  // Emoji
  ctx.font='15px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.emoji,0,-13.5);
  // Chase ring
  if(t.state==='chase'){
    ctx.strokeStyle=alarm.active?'#ff1744':'#f44336';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.arc(0,0,19+Math.sin(Date.now()/90)*3,0,TWO_PI);ctx.stroke();
  }
  // Boss crown
  if(t.isBoss){
    ctx.font='14px serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('👑',0,-24);
  }
  ctx.restore();
}

function drawNPC(ctx,npc,cx,cy){
  const sx=npc.x-cx,sy=npc.y-cy;
  if(sx<-40||sx>canvas.width+40||sy<-40||sy>canvas.height+40) return;
  ctx.save();ctx.translate(sx,sy);
  const bob=Math.sin(npc.walkAnim*.7)*1.5;
  ctx.translate(0,bob);
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(0,14,10,3,0,0,TWO_PI);ctx.fill();
  ctx.fillStyle=npc.skin.color+'bb';roundRect(ctx,-9,-5,18,16,4);ctx.fill();
  ctx.fillStyle='#ffccbc';roundRect(ctx,-7,-20,14,15,5);ctx.fill();
  ctx.font='12px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(npc.skin.emoji,0,-13);
  ctx.restore();
}

function drawPet(ctx,sx,sy){
  ctx.save();ctx.translate(sx,sy);
  const bob=Math.sin(Date.now()/400)*3;
  ctx.translate(0,bob);
  ctx.font='18px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🐱',0,0);
  ctx.restore();
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}

// ────────────────────────────────────────────
// MINIMAP
// ────────────────────────────────────────────
const mmC=el('mini-map'),mctx=mmC.getContext('2d');
function drawMiniMap(){
  if(!G.map||!G.player) return;
  const{tiles,W,H}=G.map;
  const mw=mmC.width,mh=mmC.height;
  const tw=mw/W,th=mh/H;
  mctx.clearRect(0,0,mw,mh);
  mctx.fillStyle='#0d0d1a';mctx.fillRect(0,0,mw,mh);
  for(let ty=0;ty<H;ty++) for(let tx=0;tx<W;tx++){
    const t=tiles[ty][tx];
    mctx.fillStyle=t===1?'#1a1a2e':t===7?'#ffd700':t===2?'#8b4513':t===11?'#00d2ff':'#2d5a27';
    mctx.fillRect(tx*tw,ty*th,tw,th);
  }
  for(const c of G.map.coins||[]){ if(!c.collected){mctx.fillStyle=c.rare?'#ff9800':'#ffd700';mctx.fillRect(c.x/TILE*tw-.8,c.y/TILE*th-.8,1.6,1.6);} }
  for(const item of G.map.items){ if(!item.collected){mctx.fillStyle='#4fc3f7';mctx.fillRect(item.x/TILE*tw-1,item.y/TILE*th-1,2,2);} }
  if(G.player.hasMapUp){
    for(const t of G.teachers){mctx.fillStyle=t.state==='chase'?'#f44336':'#ff8a65';mctx.fillRect(t.x/TILE*tw-1.5,t.y/TILE*th-1.5,3,3);}
  }
  const p=G.player;
  mctx.fillStyle='#4caf50';mctx.beginPath();mctx.arc(p.x/TILE*tw,p.y/TILE*th,3,0,TWO_PI);mctx.fill();
}

// ────────────────────────────────────────────
// HUD UPDATES
// ────────────────────────────────────────────
function updateHUD(){
  const p=G.player;if(!p)return;
  el('hud-timer').textContent=fmtTime(G.timer);
  el('hud-timer').classList.toggle('danger',G.timer<30);
  el('hud-stamina').style.width=(p.stamina/p.maxStamina*100)+'%';
  const xpPct=(S.xp/xpNeeded(S.playerLevel)*100)+'%';
  el('hud-xp').style.width=xpPct;
  el('hud-level-txt').textContent=S.playerLevel;
  el('hud-level-badge').textContent=`LVL ${G.level}`;
  el('hud-coins').textContent=G.sessionCoins;
  el('pause-coins-earned').textContent=G.sessionCoins;
}
function updateInvHUD(){
  const bar=el('inv-hud');if(!bar||!G.player)return;
  bar.innerHTML='';
  for(const t of G.player.inventory){
    const d=document.createElement('div');
    d.className='inv-slot';d.title=ITEM_NAMES[t]||t;d.textContent=ITEM_EMOJIS[t]||'?';
    bar.appendChild(d);
  }
}
function updateActiveItemsHUD(){
  const bar=el('active-items-hud');if(!bar||!G.player)return;
  bar.innerHTML='';
  for(const slot of G.player.activeItems){
    if(slot.remaining<=0)continue;
    const d=document.createElement('div');
    d.className='ai-slot';d.title=slot.name;
    d.innerHTML=`${slot.emoji}<span class="ai-count">${slot.remaining}</span>`;
    bar.appendChild(d);
  }
}
function updateComboHUD(){
  const p=G.player;if(!p)return;
  const el2=el('hud-combo');
  if(p.combo>=2){el2.classList.remove('hidden');el('combo-val').textContent=p.combo;}
  else el2.classList.add('hidden');
  S.stats.maxCombo=Math.max(S.stats.maxCombo||0,p.combo);
}
let alertTid=null;
function showAlert(msg){
  const e=el('hud-alert');e.textContent=msg;e.classList.remove('hidden');
  if(alertTid)clearTimeout(alertTid);
  alertTid=setTimeout(()=>e.classList.add('hidden'),2500);
}
function fmtTime(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');}

// ────────────────────────────────────────────
// TOAST
// ────────────────────────────────────────────
function toast(msg,color='#fff'){
  const d=document.createElement('div');
  d.className='toast';d.textContent=msg;d.style.borderLeft=`3px solid ${color}`;
  el('toast-container').appendChild(d);
  setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),300);},2000);
}
function floatReward(wx,wy,msg,color){
  if(!G.map) return;
  const sx=wx-G.cam.x,sy=wy-G.cam.y;
  const d=document.createElement('div');
  d.className='float-reward';d.textContent=msg;d.style.color=color;
  d.style.left=clamp(sx,10,window.innerWidth-150)+'px';
  d.style.top=clamp(sy,60,window.innerHeight-60)+'px';
  el('float-reward-container').appendChild(d);
  setTimeout(()=>d.remove(),1200);
}

// ────────────────────────────────────────────
// SCREEN SHAKE
// ────────────────────────────────────────────
function screenShake(){
  const w=el('game-wrap');
  w.classList.remove('shake');
  void w.offsetWidth;
  w.classList.add('shake');
  setTimeout(()=>w.classList.remove('shake'),350);
}

// ────────────────────────────────────────────
// CONFETTI
// ────────────────────────────────────────────
function spawnConfetti(){
  const c=el('confetti-container');c.innerHTML='';
  const colors=['#ffd700','#ff4757','#2ed573','#1e90ff','#a855f7','#ff6b35'];
  for(let i=0;i<80;i++){
    const p=document.createElement('div');
    p.className='confetti-piece';
    p.style.cssText=`left:${Math.random()*100}%;background:${colors[i%colors.length]};animation-duration:${rnd(.8,2)}s;animation-delay:${rnd(0,.8)}s;width:${ri(6,14)}px;height:${ri(6,14)}px;border-radius:${Math.random()<.5?'50%':'2px'};`;
    c.appendChild(p);
  }
  setTimeout(()=>c.innerHTML='',3000);
}

// ────────────────────────────────────────────
// LUCKY SPIN
// ────────────────────────────────────────────
let spinAngle=0,spinning=false,spinWon=false;
function showLuckySpin(){
  if(spinWon) return;
  spinWon=false;
  spinAngle=0;
  el('spin-result').classList.add('hidden');
  el('btn-spin').disabled=false;
  drawSpinWheel();
  showScreen('spin');
}
function drawSpinWheel(angle=0){
  const c=el('spin-canvas'),ctx2=c.getContext('2d');
  const n=SPIN_PRIZES.length,r=c.width/2,arc=TWO_PI/n;
  ctx2.clearRect(0,0,c.width,c.height);
  for(let i=0;i<n;i++){
    const a=angle+i*arc;
    ctx2.beginPath();ctx2.moveTo(r,r);ctx2.arc(r,r,r-3,a,a+arc);ctx2.closePath();
    ctx2.fillStyle=SPIN_PRIZES[i].color;ctx2.fill();
    ctx2.strokeStyle='rgba(0,0,0,.3)';ctx2.lineWidth=2;ctx2.stroke();
    ctx2.save();ctx2.translate(r,r);ctx2.rotate(a+arc/2);
    ctx2.textAlign='right';ctx2.textBaseline='middle';
    ctx2.fillStyle='#fff';ctx2.font='bold 12px Nunito,sans-serif';
    ctx2.fillText(SPIN_PRIZES[i].label,r-10,0);
    ctx2.restore();
  }
  // Center
  ctx2.beginPath();ctx2.arc(r,r,20,0,TWO_PI);ctx2.fillStyle='#1e1e3a';ctx2.fill();
  ctx2.strokeStyle='rgba(255,255,255,.3)';ctx2.lineWidth=2;ctx2.stroke();
}
function doSpin(){
  if(spinning) return;
  spinning=true;
  el('btn-spin').disabled=true;
  sfxSpin();
  const totalRot=rnd(8,14)*TWO_PI+rnd(0,TWO_PI);
  let start=null,dur=3000+rnd(0,1000);
  function anim(ts){
    if(!start) start=ts;
    const prog=Math.min((ts-start)/dur,1);
    const ease=1-Math.pow(1-prog,3);
    const cur=totalRot*ease;
    spinAngle=cur%TWO_PI;
    drawSpinWheel(spinAngle);
    sfxSpin();
    if(prog<1){ requestAnimationFrame(anim); }
    else{
      spinning=false; spinWon=true;
      const n=SPIN_PRIZES.length, arc=TWO_PI/n;
      const idx=Math.floor(((TWO_PI-spinAngle%(TWO_PI))/(arc))%n);
      const prize=SPIN_PRIZES[idx]||SPIN_PRIZES[0];
      if(prize.type==='coins'){ addCoins(prize.val); toast(`🪙 +${prize.val} koin!`,'#ffd700'); }
      else if(prize.type==='gems'){ S.gems=(S.gems||0)+prize.val; save(); toast(`💎 +${prize.val} gem!`,'#a855f7'); }
      else if(prize.type==='item'){ S.ownedItems[prize.val]=(S.ownedItems[prize.val]||0)+1; save(); toast(`Got: ${prize.label}!`,'#2ed573'); }
      else if(prize.type==='bonus'){ addCoins(G.sessionCoins); toast('🎁 Bonus x2 Koin!','#ff6b35'); }
      el('spin-result').textContent=`🎉 Kamu dapat: ${prize.label}!`;
      el('spin-result').classList.remove('hidden');
      sfxWin();
    }
  }
  requestAnimationFrame(anim);
}

// ────────────────────────────────────────────
// SCREEN MANAGEMENT
// ────────────────────────────────────────────
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id==='screen-'+id));
  const inGame=(id==='game');
  el('hud').style.display=inGame?'flex':'none';
  el('ctrl-hint').style.display=inGame?'block':'none';
  el('radar-wrap').style.display=inGame&&G.player?.hasRadar?'block':'none';
}
function el(id){return document.getElementById(id);}

// ────────────────────────────────────────────
// UI BUILDERS
// ────────────────────────────────────────────
function buildLevelSelect(){
  const wrap=el('world-select');wrap.innerHTML='';
  const group=document.createElement('div');group.className='world-group';
  const h3=document.createElement('h3');h3.textContent='🏫 Dunia Sekolah';group.appendChild(h3);
  const grid=document.createElement('div');grid.className='levels-grid';
  for(const lvl of LEVELS){
    const unlocked=S.unlockedLevels.includes(lvl.id);
    const isNew=unlocked&&!S.bestScores[lvl.id];
    const card=document.createElement('div');
    card.className=`lv-card ${unlocked?'unlocked':'locked'} ${lvl.id===G.level?'current':''}`;
    const best=S.bestScores[lvl.id];
    const stars=best?(best>2000?'⭐⭐⭐':best>1000?'⭐⭐':'⭐'):'';
    card.innerHTML=unlocked
      ?`${isNew?'<div class="lv-new">NEW</div>':''}<div class="lv-num">${lvl.id}</div><div class="lv-name">${lvl.name}</div><div class="lv-stars">${stars}</div>${best?`<div class="lv-best">Best: ${best}</div>`:''}`
      :`<div class="lv-lock">🔒</div><div class="lv-name">${lvl.name}</div>`;
    if(unlocked) card.onclick=()=>startGame(lvl.id);
    grid.appendChild(card);
  }
  group.appendChild(grid);wrap.appendChild(group);
}

function buildShop(tab='items'){
  const content=el('shop-content');content.innerHTML='';
  el('shop-coins').textContent=S.coins||0;
  const items=SHOP_DATA[tab]||SHOP_DATA.items;
  const grid=document.createElement('div');grid.className='shop-grid';
  for(const item of items){
    const owned=S.ownedItems[item.id]||0;
    const canBuy=owned<item.max&&S.coins>=(item.price||0);
    const card=document.createElement('div');
    card.className=`shop-card ${owned>0?'owned':''}`;
    card.innerHTML=`
      <div class="sc-head"><span class="sc-emoji">${item.emoji}</span><div><div class="sc-title">${item.name}</div><div class="sc-type">${item.active?'Aktif (Q)':'Pasif'}</div></div></div>
      <div class="sc-desc">${item.desc}</div>
      <div class="sc-foot">
        <span class="sc-price">🪙${item.price}</span>
        ${owned>=item.max?`<span class="sc-owned-badge">✓ ${owned}/${item.max}</span>`
          :`<button class="btn-buy" data-id="${item.id}" ${canBuy?'':'disabled'}>Beli ${owned>0?`(${owned})`:''}  </button>`}
      </div>`;
    grid.appendChild(card);
  }
  grid.querySelectorAll('.btn-buy').forEach(b=>b.onclick=()=>{
    const si=[...SHOP_DATA.items,...SHOP_DATA.consumables].find(s=>s.id===b.dataset.id);
    if(!si||S.coins<si.price){toast('🪙 Koin tidak cukup!','#f44336');return;}
    S.coins-=si.price;
    S.ownedItems[si.id]=(S.ownedItems[si.id]||0)+1;
    S.shopBuys=(S.shopBuys||0)+1;save();
    sfxBuy();toast(`${si.emoji} ${si.name} dibeli!`,'#2ed573');
    if(S.shopBuys>=10)unlockAch('shopper');
    buildShop(tab);el('shop-coins').textContent=S.coins;refreshMenuCoins();
  });
  content.appendChild(grid);
}

function buildUpgrades(){
  const content=el('upgrade-content');content.innerHTML='';
  el('upgrade-coins').textContent=S.coins||0;
  const list=document.createElement('div');list.className='upgrade-list';
  for(const def of UPGRADES_DATA){
    const lvl=S.upgrades[def.id]||0;
    const maxed=lvl>=def.max;
    const cost=maxed?0:upgCost(def,lvl);
    const pct=(lvl/def.max*100)+'%';
    const canBuy=!maxed&&S.coins>=cost;
    const card=document.createElement('div');card.className='ug-card';
    card.innerHTML=`<span class="ug-emoji">${def.emoji}</span>
      <div class="ug-info">
        <div class="ug-title">${def.name}</div>
        <div class="ug-desc">${def.desc}</div>
        <div class="ug-bar-wrap"><div class="ug-bar" style="width:${pct}"></div></div>
        <div class="ug-lvl">Lv ${lvl}/${def.max}</div>
      </div>
      <div class="ug-right">
        ${maxed?`<span class="ug-maxed">MAXED!</span>`:`<span class="ug-cost">🪙${cost}</span><button class="btn-upgrade-buy" data-id="${def.id}" ${canBuy?'':'disabled'}>Upgrade</button>`}
      </div>`;
    list.appendChild(card);
  }
  list.querySelectorAll('.btn-upgrade-buy').forEach(b=>b.onclick=()=>{
    const def=UPGRADES_DATA.find(d=>d.id===b.dataset.id);
    if(!def)return;
    const lvl=S.upgrades[def.id]||0;if(lvl>=def.max)return;
    const cost=upgCost(def,lvl);
    if(S.coins<cost){toast('🪙 Koin tidak cukup!','#f44336');return;}
    S.coins-=cost;S.upgrades[def.id]=lvl+1;save();sfxBuy();
    toast(`${def.emoji} ${def.name} → Lv${lvl+1}!`,'#2ed573');
    if((S.upgrades[def.id]||0)>=def.max)unlockAch('upgrader');
    buildUpgrades();el('upgrade-coins').textContent=S.coins;refreshMenuCoins();
  });
  content.appendChild(list);
}

function buildMissions(){
  const content=el('missions-content');content.innerHTML='';
  const list=document.createElement('div');list.className='mission-list';
  for(const m of MISSIONS_DATA){
    const prog=S.stats[m.stat]||0;
    const done=prog>=m.goal;
    const claimed=S.missionsClaimed&&S.missionsClaimed.includes(m.id);
    const card=document.createElement('div');
    card.className=`mission-card ${claimed?'completed':''}`;
    const progPct=Math.min(100,prog/m.goal*100)+'%';
    card.innerHTML=`<span class="mi-icon">${m.icon}</span>
      <div class="mi-info">
        <div class="mi-title">${m.title}</div>
        <div class="mi-desc">${m.desc}</div>
        <div class="mi-prog-wrap"><div class="mi-prog-bar" style="width:${progPct}"></div></div>
        <div style="font-size:10px;color:#888;margin-top:3px">${Math.min(prog,m.goal)}/${m.goal}</div>
      </div>
      <div>
        <div class="mi-reward">${m.rewardType==='gems'?'💎':'🪙'}${m.reward}</div>
        ${done&&!claimed?`<button class="btn-claim" data-id="${m.id}" style="margin-top:6px">Klaim!</button>`:''}
        ${claimed?'<span style="font-size:12px;color:#2ed573">✓</span>':''}
      </div>`;
    list.appendChild(card);
  }
  list.querySelectorAll('.btn-claim').forEach(b=>b.onclick=()=>{
    const m=MISSIONS_DATA.find(x=>x.id===b.dataset.id);if(!m)return;
    if(!S.missionsClaimed)S.missionsClaimed=[];
    S.missionsClaimed.push(m.id);
    if(m.rewardType==='gems'){S.gems=(S.gems||0)+m.reward;toast(`💎 +${m.reward} gem!`,'#a855f7');}
    else{addCoins(m.reward);toast(`🪙 +${m.reward} koin!`,'#ffd700');}
    save();sfxWin();buildMissions();refreshMenuCoins();
  });
  content.appendChild(list);
}

function buildAchievements(){
  const content=el('ach-content');content.innerHTML='';
  const grid=document.createElement('div');grid.className='ach-grid';
  for(const a of ACHIEVEMENTS_DATA){
    const done=S.achievements.includes(a.id);
    const card=document.createElement('div');
    card.className=`ach-card ${done?'unlocked':'locked'}`;
    card.innerHTML=`<div class="ach-icon">${done?a.icon:'❓'}</div>
      <div class="ach-name">${done?a.name:'???'}</div>
      <div class="ach-desc">${done?a.desc:'Belum terbuka'}</div>
      ${done?'<div class="ach-check">✓</div>':''}`;
    grid.appendChild(card);
  }
  content.appendChild(grid);
}

function buildRanking(){
  const content=el('rank-content');content.innerHTML='';
  // Fake leaderboard + player
  const fakeNames=['RioSantoso','MayaDevita','BudiPrakoso','SitiRahayu','AndiKurnia','RahmaWati','DoniHarun','YunitaS'];
  const list=document.createElement('div');list.className='rank-list';
  const playerScore=Object.values(S.bestScores).reduce((a,b)=>a+b,0)||0;
  const fakeScores=fakeNames.map((n,i)=>({name:n,score:Math.floor(playerScore*(1.1-i*.05))+ri(100,500)}));
  fakeScores.sort((a,b)=>b.score-a.score);
  // Insert player
  const playerEntry={name:'🧑 Kamu',score:playerScore,me:true};
  let inserted=false;
  const all=[];
  for(const f of fakeScores){all.push(f);}
  all.push(playerEntry);all.sort((a,b)=>b.score-a.score);
  all.slice(0,10).forEach((e,i)=>{
    const row=document.createElement('div');
    row.className=`rank-item ${e.me?'me':''}`;
    const medals=['🥇','🥈','🥉'];
    row.innerHTML=`<span class="rank-num">${medals[i]||i+1}</span><span class="rank-name">${e.name}</span><span class="rank-score">${e.score}</span>`;
    list.appendChild(row);
  });
  content.appendChild(list);
}

function buildSkins(){
  const content=el('skins-content');content.innerHTML='';
  const grid=document.createElement('div');grid.className='skins-grid';
  for(const sk of SKINS_DATA){
    const unlocked=sk.unlockLvl<=S.playerLevel;
    const card=document.createElement('div');
    card.className=`skin-card ${unlocked?'':'locked'} ${sk.id===S.activeSkin?'active':''}`;
    card.innerHTML=`<div class="skin-emoji">${sk.emoji}</div><div class="skin-name">${sk.name}</div><div class="skin-req">${unlocked?'':'Lv '+sk.unlockLvl+' diperlukan'}</div>`;
    if(unlocked) card.onclick=()=>{S.activeSkin=sk.id;save();buildSkins();toast(`${sk.emoji} Skin: ${sk.name} dipilih!`,'#a855f7');};
    grid.appendChild(card);
  }
  content.appendChild(grid);
}

function buildSettings(){
  const content=el('settings-content');content.innerHTML='';
  const list=document.createElement('div');list.className='settings-list';
  const opts=[{k:'sound',label:'🔊 Sound Effect'},{k:'music',label:'🎵 Musik BGM'},{k:'particles',label:'✨ Partikel'},{k:'vibration',label:'📳 Getaran (Mobile)'}];
  for(const o of opts){
    const row=document.createElement('div');row.className='setting-row';
    const tog=document.createElement('div');
    tog.className=`toggle ${S.settings[o.k]?'on':''}`;
    tog.onclick=()=>{S.settings[o.k]=!S.settings[o.k];save();tog.classList.toggle('on',S.settings[o.k]);};
    row.innerHTML=`<span class="setting-label">${o.label}</span>`;
    row.appendChild(tog);list.appendChild(row);
  }
  content.appendChild(list);
}

function updateMissionProgress(){
  // Called after a win to check mission progress
  save();
}

function refreshMenuCoins(){
  el('menu-coins').textContent=S.coins||0;
  el('menu-gems').textContent=S.gems||0;
  const xpPct=(S.xp/xpNeeded(S.playerLevel)*100);
  el('menu-xp-bar').style.width=xpPct+'%';
  el('menu-player-level').textContent=S.playerLevel;
  el('menu-level-sub').textContent=`Level ${S.currentLevel||1}`;
}

// ────────────────────────────────────────────
// DAILY BONUS
// ────────────────────────────────────────────
function checkDailyBonus(){
  const now=Date.now();
  const last=S.dailyLastClaim||0;
  const oneDayMs=86400000;
  const canClaim=now-last>oneDayMs;
  el('daily-bonus').style.display=canClaim?'flex':'none';
  el('btn-daily').textContent=`Klaim 🪙${100+S.dailyStreak*20}`;
}
el('btn-daily').onclick=()=>{
  const reward=100+(S.dailyStreak||0)*20;
  S.dailyLastClaim=Date.now();
  S.dailyStreak=(S.dailyStreak||0)+1;
  addCoins(reward);save();
  toast(`🎁 Bonus Harian! +${reward} koin!`,'#ffd700');
  el('daily-bonus').style.display='none';
  refreshMenuCoins();
  if((S.dailyStreak||0)>=7) unlockAch('daily7');
  sfxWin();
};

// ────────────────────────────────────────────
// MENU PARTICLES (background animation)
// ────────────────────────────────────────────
function initMenuParticles(){
  const c=el('menu-particles-canvas'),ctx2=c.getContext('2d');
  c.width=window.innerWidth;c.height=window.innerHeight;
  const pts=[];
  for(let i=0;i<60;i++) pts.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*2+.5,vx:rnd(-.3,.3),vy:rnd(-.3,.3),a:Math.random()});
  function animate(){
    c.width=window.innerWidth;c.height=window.innerHeight;
    ctx2.fillStyle='rgba(13,13,26,.95)';ctx2.fillRect(0,0,c.width,c.height);
    for(const p of pts){
      p.x=(p.x+p.vx+c.width)%c.width;p.y=(p.y+p.vy+c.height)%c.height;p.a+=.01;
      ctx2.globalAlpha=.3+Math.sin(p.a)*.2;
      ctx2.fillStyle='#ffd700';ctx2.beginPath();ctx2.arc(p.x,p.y,p.r,0,TWO_PI);ctx2.fill();
    }
    ctx2.globalAlpha=1;
    if(document.getElementById('screen-menu').classList.contains('active')) requestAnimationFrame(animate);
  }
  animate();
}

// ────────────────────────────────────────────
// GAME FLOW
// ────────────────────────────────────────────
function startGame(lvlId){
  initAudio();resumeAudio();
  G.level=lvlId;
  showScreen('game');
  initLevel(lvlId);
  G.state='playing';
  lastT=performance.now();
  requestAnimationFrame(loop);
  spinWon=false;
}

function resumeGame(){
  G.state='playing';showScreen('game');
  startBGM(G.tense||alarm.active);if(alarm.active)startAlarmSFX();
  lastT=performance.now();requestAnimationFrame(loop);
}

// ────────────────────────────────────────────
// INPUT
// ────────────────────────────────────────────
window.addEventListener('keydown',e=>{
  G.keys[e.key]=true;
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){
    if(G.state==='playing'){G.state='pause';stopBGM();stopAlarmSFX();showScreen('pause');}
    else if(G.state==='pause') resumeGame();
  }
  if(e.key==='m'||e.key==='M'){
    if(G.state==='playing'){ buildMissions(); G.state='pause'; stopBGM(); showScreen('missions'); }
  }
});
window.addEventListener('keyup',e=>G.keys[e.key]=false);

// Mobile touch controls
let touchStart=null;
window.addEventListener('touchstart',e=>{ const t=e.touches[0]; touchStart={x:t.clientX,y:t.clientY}; },{passive:true});
window.addEventListener('touchmove',e=>{
  if(!touchStart||G.state!=='playing') return;
  const t=e.touches[0];
  const dx=t.clientX-touchStart.x, dy=t.clientY-touchStart.y;
  const dead=12;
  G.keys['ArrowLeft']=dx<-dead; G.keys['ArrowRight']=dx>dead;
  G.keys['ArrowUp']=dy<-dead;   G.keys['ArrowDown']=dy>dead;
},{passive:true});
window.addEventListener('touchend',()=>{
  ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].forEach(k=>G.keys[k]=false);
  touchStart=null;
});

// ────────────────────────────────────────────
// BUTTON BINDINGS
// ────────────────────────────────────────────
el('btn-play').onclick=()=>startGame(S.currentLevel||1);
el('btn-levels').onclick=()=>{buildLevelSelect();showScreen('levels');};
el('btn-shop').onclick=()=>{buildShop('items');showScreen('shop');};
el('btn-upgrade').onclick=()=>{buildUpgrades();showScreen('upgrade');};
el('btn-missions').onclick=()=>{buildMissions();showScreen('missions');};
el('btn-achievements').onclick=()=>{buildAchievements();showScreen('achievements');};
el('btn-rank').onclick=()=>{buildRanking();showScreen('rank');};
el('btn-skins').onclick=()=>{buildSkins();showScreen('skins');};
el('btn-settings').onclick=()=>{buildSettings();showScreen('settings');};

el('btn-back-levels').onclick   =()=>showScreen('menu');
el('btn-back-shop').onclick     =()=>showScreen('menu');
el('btn-back-upgrade').onclick  =()=>showScreen('menu');
el('btn-back-missions').onclick =()=>showScreen('menu');
el('btn-back-ach').onclick      =()=>showScreen('menu');
el('btn-back-rank').onclick     =()=>showScreen('menu');
el('btn-back-skins').onclick    =()=>showScreen('menu');
el('btn-back-settings').onclick =()=>showScreen('menu');

// Shop tabs
document.querySelectorAll('.stab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.stab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');buildShop(t.dataset.tab);
});

el('btn-resume').onclick    =resumeGame;
el('btn-restart').onclick   =()=>startGame(G.level);
el('btn-pause-menu').onclick=()=>{stopBGM();stopAlarmSFX();G.state='menu';showScreen('menu');initMenuParticles();};
el('btn-retry').onclick     =()=>startGame(G.level);
el('btn-go-menu').onclick   =()=>{stopBGM();showScreen('menu');initMenuParticles();};
el('btn-next-level').onclick=()=>{const n=G.level+1;if(n<=LEVELS.length&&S.unlockedLevels.includes(n))startGame(n);else showScreen('menu');};
el('btn-win-replay').onclick=()=>startGame(G.level);
el('btn-win-menu').onclick  =()=>{stopBGM();showScreen('menu');initMenuParticles();};

el('btn-spin').onclick      =doSpin;
el('btn-spin-skip').onclick =()=>showScreen('menu');

// ────────────────────────────────────────────
// LOADING & BOOT
// ────────────────────────────────────────────
function fakeLoad(){
  const bar=el('load-bar'),txt=el('load-text');
  const msgs=['Memuat peta sekolah...','Memanggil guru patroli...','Menyiapkan koin...','Mengisi stamina...','Siap!'];
  let progress=0;
  const iv=setInterval(()=>{
    progress+=ri(8,18);if(progress>100)progress=100;
    bar.style.width=progress+'%';
    txt.textContent=msgs[Math.floor(progress/25)]||'Siap!';
    if(progress>=100){
      clearInterval(iv);
      setTimeout(()=>{
        el('loading-screen').style.opacity='0';
        el('loading-screen').style.transition='opacity .5s';
        setTimeout(()=>{el('loading-screen').style.display='none';},500);
      },400);
    }
  },120);
}

(function boot(){
  loadSave();
  refreshMenuCoins();
  checkDailyBonus();
  showScreen('menu');
  el('hud').style.display='none';
  el('ctrl-hint').style.display='none';
  el('radar-wrap').style.display='none';
  fakeLoad();
  setTimeout(initMenuParticles,600);
})();
