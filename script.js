/* ═══════════════════════════════════════════════════════════════════
   CRYPTO BLOCK RUNNER — script.js  v3.0  ULTIMATE EDITION
   ───────────────────────────────────────────────────────────────────
   FITUR LENGKAP:
   ✅ Leaderboard lokal multi-player (localStorage)
   ✅ Input nama pemain
   ✅ Share Score (copy to clipboard → WA/IG ready)
   ✅ Skin system (5 skin unlockable berdasarkan skor)
   ✅ Daily Challenge (berganti tiap hari)
   ✅ Game Over dramatis (slow-mo + kamera zoom)
   ✅ Ghost System (best run replay)
   ✅ Near-Miss Engine (slow-mo + chain bonus)
   ✅ Combo System (multiplier x1→x5 + neon trail)
   ✅ 3 Random Events (Market Crash / Bull Run / Glitch Zone)
   ✅ Adaptive Difficulty (deteksi skill pemain)
   ✅ Coyote Time + Jump Buffer
   ✅ Web Audio synthesized (semua sfx dari nol)
   ✅ Karakter sprite (image_0.png) + fallback neon capsule
   ✅ Dynamic neon light ikut karakter
   ✅ FOV widening saat kecepatan tinggi
   ✅ Camera shake saat crash
   ✅ Mobile support (tap + swipe)

   📁 SETUP KARAKTER:
      Taruh file karakter sebagai  image_0.png
      di folder yang sama dengan index.html
═══════════════════════════════════════════════════════════════════ */
'use strict';

/* ──────────────────────────────────────────────────────────────────
   § 1  CONSTANTS
────────────────────────────────────────────────────────────────── */
const CFG = {
  GRAVITY: -32, JUMP_FORCE: 17, FALL_MULT: 1.75,
  COYOTE: 0.10, JUMP_BUF: 0.10,
  SPRITE_W: 2.4, SPRITE_H: 3.6,
  PLAYER_Z: 0, GROUND_Y: 1.7,
  HIT_HW: 0.52, HIT_HH: 1.30,
  DASH_COST: 5, DASH_CD: 1.5, DASH_DUR: 0.20, DASH_SPD: 2.2,
  SPD_START: 10, SPD_MAX: 32, SPD_RAMP: 0.24,
  SPAWN_Z: -70, DESPAWN_Z: 9,
  TILE_LEN: 10, TILE_CNT: 18, TILE_W: 8,
  NM_GAP: 0.72, SLOWMO_DUR: 0.34, SLOWMO_K: 0.22,
  COMBO_TO: 3.0, COIN_SC: 14,
  EVT_DUR: 18, EVT_MIN: 28, EVT_MAX: 58,
  BG: 0x000810, GROUND: 0x000f22, EDGE: 0x00ffff,
  OBS_A: 0xff0066, OBS_B: 0x9900ff, OBS_C: 0xff6600,
  COIN: 0xffdd00, GHOST: 0x0055ff,
};

/* ──────────────────────────────────────────────────────────────────
   § 2  SKIN DEFINITIONS
   Setiap skin ubah warna neon player + lights
────────────────────────────────────────────────────────────────── */
const SKINS = [
  { id:'default', name:'DEFAULT',  color:0x00ffff, req:0,    locked:false },
  { id:'crimson', name:'CRIMSON',  color:0xff0066, req:500,  locked:true  },
  { id:'volt',    name:'VOLT',     color:0xffdd00, req:1000, locked:true  },
  { id:'phantom', name:'PHANTOM',  color:0x9900ff, req:2000, locked:true  },
  { id:'aurora',  name:'AURORA',   color:0x00ff88, req:4000, locked:true  },
];

/* ──────────────────────────────────────────────────────────────────
   § 3  DAILY CHALLENGES  (rotasi per hari via Date)
────────────────────────────────────────────────────────────────── */
const DAILY_POOL = [
  { id:'jump30',   desc:'Lompat 30 kali dalam satu run',      goal:30,  unit:'lompatan', track:'jumps'    },
  { id:'coin50',   desc:'Kumpulkan 50 koin dalam satu run',   goal:50,  unit:'koin',     track:'coins'    },
  { id:'survive90',desc:'Bertahan 90 detik tanpa mati',       goal:90,  unit:'detik',    track:'alive'    },
  { id:'combo15',  desc:'Capai combo 15x',                    goal:15,  unit:'combo',    track:'maxCombo' },
  { id:'nearmiss5',desc:'Near miss 5 kali dalam satu run',    goal:5,   unit:'near miss',track:'nearMissCount'},
  { id:'nodash60', desc:'Survive 60 detik tanpa pakai dash',  goal:60,  unit:'detik',    track:'noDashTime'},
  { id:'score1500',desc:'Capai skor 1500 dalam satu run',     goal:1500,unit:'pts',      track:'score'    },
];

function getTodayChallenge() {
  const d = new Date();
  const dayIdx = Math.floor(d.getTime() / 86400000) % DAILY_POOL.length;
  return DAILY_POOL[dayIdx];
}

/* ──────────────────────────────────────────────────────────────────
   § 4  PERSISTENT DATA  (localStorage helpers)
────────────────────────────────────────────────────────────────── */
const DB = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// Leaderboard: array of { name, score, skin }
let LEADERBOARD = DB.get('cbr_lb', []);
// Per-player best score  { name: score }
let PLAYER_BESTS = DB.get('cbr_bests', {});
// Unlocked skins per player { name: [skin_ids] }
let UNLOCKED = DB.get('cbr_unlocked', {});
// Current player
let PLAYER_NAME = DB.get('cbr_name', '');
// Selected skin per player
let SKIN_SEL = DB.get('cbr_skin', {});
// Daily progress
let DAILY_DONE = DB.get('cbr_daily', { date:'', done:false });

function saveAll() {
  DB.set('cbr_lb',       LEADERBOARD);
  DB.set('cbr_bests',    PLAYER_BESTS);
  DB.set('cbr_unlocked', UNLOCKED);
  DB.set('cbr_name',     PLAYER_NAME);
  DB.set('cbr_skin',     SKIN_SEL);
  DB.set('cbr_daily',    DAILY_DONE);
}

function getMyUnlocked() {
  return UNLOCKED[PLAYER_NAME] || ['default'];
}

function getActiveSkin() {
  const sel = SKIN_SEL[PLAYER_NAME] || 'default';
  const skin = SKINS.find(s => s.id === sel);
  return skin || SKINS[0];
}

function updateLeaderboard(score) {
  // Update personal best
  const prev = PLAYER_BESTS[PLAYER_NAME] || 0;
  if (score > prev) PLAYER_BESTS[PLAYER_NAME] = score;

  // Upsert into LB
  const idx = LEADERBOARD.findIndex(r => r.name === PLAYER_NAME);
  if (idx >= 0) {
    if (score > LEADERBOARD[idx].score) LEADERBOARD[idx].score = score;
  } else {
    LEADERBOARD.push({ name: PLAYER_NAME, score, skin: getActiveSkin().id });
  }
  // Sort desc, keep top 20
  LEADERBOARD.sort((a, b) => b.score - a.score);
  LEADERBOARD = LEADERBOARD.slice(0, 20);
}

function checkUnlocks(score) {
  const unlocked = getMyUnlocked();
  const newlyUnlocked = [];
  SKINS.forEach(s => {
    if (!s.locked) return;
    if (score >= s.req && !unlocked.includes(s.id)) {
      unlocked.push(s.id);
      newlyUnlocked.push(s.name);
    }
  });
  UNLOCKED[PLAYER_NAME] = unlocked;
  return newlyUnlocked;
}

/* ──────────────────────────────────────────────────────────────────
   § 5  GAME STATE
────────────────────────────────────────────────────────────────── */
const G = {
  phase: 'name',
  score: 0, coins: 0, maxCombo: 1,
  combo: 0, mult: 1, comboTimer: 0,
  speed: CFG.SPD_START, alive: 0, mistakes: 0,
  pY: CFG.GROUND_Y, pVY: 0, grounded: true,
  coyote: 0, jbuf: 0,
  dashCd: 0, dashTimer: 0, dashing: false,
  slowmo: false, slowmoT: 0,
  nearChain: 0, nearMissCount: 0,
  shake: 0,
  event: null, evtTimer: 0, evtNext: rnd(28, 58),
  ghostRec: [], ghostIdx: 0, _milestone: 0,
  // Daily tracking
  jumps: 0, noDashTime: 0, usedDash: false,
  dailyDone: false,
};

/* ──────────────────────────────────────────────────────────────────
   § 6  THREE.JS GLOBALS
────────────────────────────────────────────────────────────────── */
let scene, camera, renderer;
let playerSprite = null, playerNeonL = null, playerGlowL = null;
let ghostMesh    = null;
let groundTiles  = [], buildings  = [], obstacles = [], coins = [], trailDots = [];
let rainDrops    = []; // rain particles for ambience
let obsTimer = 0, obsNext = 2.2, coinTimer = 0;

/* ──────────────────────────────────────────────────────────────────
   § 7  WEB AUDIO  (100% synthesized)
────────────────────────────────────────────────────────────────── */
let AC = null;
function initAudio() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); }

function sfx(type) {
  if (!AC) return;
  const now = AC.currentTime;
  const osc = (f, t='sine') => { const o=AC.createOscillator(); o.type=t; o.frequency.value=f; return o; };
  const gain = v => { const g=AC.createGain(); g.gain.value=v; return g; };
  const ch = (...n) => { for(let i=0;i<n.length-1;i++) n[i].connect(n[i+1]); };
  const noise = (dur, vol) => {
    const len=AC.sampleRate*dur, buf=AC.createBuffer(1,len,AC.sampleRate);
    const d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    const s=AC.createBufferSource(); s.buffer=buf;
    const g=gain(vol); g.gain.exponentialRampToValueAtTime(.001,now+dur);
    ch(s,g,AC.destination); s.start(now); s.stop(now+dur);
  };
  switch(type) {
    case 'coin': {
      const p=900+Math.min(G.combo,28)*42, o=osc(p), g=gain(.28);
      o.frequency.exponentialRampToValueAtTime(p*1.65,now+.13);
      g.gain.exponentialRampToValueAtTime(.001,now+.22);
      ch(o,g,AC.destination); o.start(now); o.stop(now+.22); break;
    }
    case 'jump': {
      const o=osc(200), g=gain(.16);
      o.frequency.exponentialRampToValueAtTime(500,now+.14);
      g.gain.exponentialRampToValueAtTime(.001,now+.14);
      ch(o,g,AC.destination); o.start(now); o.stop(now+.14); break;
    }
    case 'dash': { noise(.18,.42); break; }
    case 'crash': {
      const o=osc(110,'sawtooth'), g=gain(.55);
      o.frequency.exponentialRampToValueAtTime(28,now+.48);
      g.gain.exponentialRampToValueAtTime(.001,now+.48);
      ch(o,g,AC.destination); o.start(now); o.stop(now+.48);
      noise(.14,.5); break;
    }
    case 'nearmiss': {
      const o=osc(720), g=gain(.22);
      o.frequency.exponentialRampToValueAtTime(200,now+.24);
      g.gain.exponentialRampToValueAtTime(.001,now+.24);
      ch(o,g,AC.destination); o.start(now); o.stop(now+.24); break;
    }
    case 'milestone': {
      [440,554,659,880].forEach((f,i)=>{
        const t=now+i*.09, o=osc(f), g=gain(.2);
        g.gain.exponentialRampToValueAtTime(.001,t+.22);
        ch(o,g,AC.destination); o.start(t); o.stop(t+.22);
      }); break;
    }
    case 'unlock': {
      [523,659,784,1047].forEach((f,i)=>{
        const t=now+i*.12, o=osc(f,'triangle'), g=gain(.25);
        g.gain.exponentialRampToValueAtTime(.001,t+.3);
        ch(o,g,AC.destination); o.start(t); o.stop(t+.3);
      }); break;
    }
    case 'daily': {
      [523,784,1047,1568].forEach((f,i)=>{
        const t=now+i*.1, o=osc(f,'sine'), g=gain(.22);
        g.gain.exponentialRampToValueAtTime(.001,t+.35);
        ch(o,g,AC.destination); o.start(t); o.stop(t+.35);
      }); break;
    }
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 8  SCENE + LIGHTING + GROUND + BUILDINGS
────────────────────────────────────────────────────────────────── */
function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CFG.BG);
  scene.fog = new THREE.Fog(CFG.BG, 45, 100);

  camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(0, 6.5, 13);
  camera.lookAt(0, 1.5, 0);

  renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  $('game-container').appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

function setupLighting() {
  scene.add(new THREE.AmbientLight(0x001428, 0.9));
  const dir = new THREE.DirectionalLight(0x3366cc, 1.8);
  dir.position.set(8, 22, -12); dir.castShadow = true;
  dir.shadow.mapSize.set(1024,1024);
  Object.assign(dir.shadow.camera,{left:-22,right:22,top:12,bottom:-6});
  scene.add(dir);
  const nL = new THREE.PointLight(CFG.OBS_A, 2.4, 38); nL.position.set(-11,3,-28); scene.add(nL);
  const nR = new THREE.PointLight(CFG.OBS_B, 2.4, 38); nR.position.set( 11,3,-38); scene.add(nR);

  playerNeonL = new THREE.PointLight(CFG.EDGE, 5, 14);
  playerNeonL.position.set(0, CFG.GROUND_Y+1, 1.4); scene.add(playerNeonL);
  playerGlowL = new THREE.PointLight(0x0044ff, 2.2, 24);
  playerGlowL.position.set(0, CFG.GROUND_Y, 2); scene.add(playerGlowL);
}

function setupGround() {
  const tGeo = new THREE.BoxGeometry(CFG.TILE_W, 0.5, CFG.TILE_LEN);
  const tMat = new THREE.MeshStandardMaterial({
    color:new THREE.Color(CFG.GROUND), emissive:new THREE.Color(0x001a3a), emissiveIntensity:.65,
    roughness:.82, metalness:.18,
  });
  const eGeo = new THREE.EdgesGeometry(tGeo);
  const eMat = new THREE.LineBasicMaterial({color:CFG.EDGE,transparent:true,opacity:.3});
  for (let i=0;i<CFG.TILE_CNT;i++) {
    const tile = new THREE.Mesh(tGeo, tMat);
    tile.position.set(0,-0.25,2-i*CFG.TILE_LEN);
    tile.receiveShadow=true;
    tile.add(new THREE.LineSegments(eGeo,eMat));
    scene.add(tile); groundTiles.push(tile);
  }
}

function setupBackground() {
  const wc = [CFG.EDGE,CFG.OBS_A,CFG.OBS_B,CFG.COIN];
  for (let side=-1;side<=1;side+=2) {
    for (let i=0;i<24;i++) {
      const h=rnd(7,30),w=rnd(3,9),d=rnd(3,7);
      const z=-i*11+rnd(-4,4), x=side*(CFG.TILE_W/2+w/2+rnd(.5,2.8));
      const bld=new THREE.Mesh(
        new THREE.BoxGeometry(w,h,d),
        new THREE.MeshStandardMaterial({color:0x001020,roughness:.95,metalness:.05})
      );
      bld.position.set(x,h/2-.25,z); scene.add(bld); buildings.push(bld);
      for (let j=0;j<Math.floor(rnd(4,14));j++) {
        const c=wc[Math.floor(Math.random()*wc.length)];
        const win=new THREE.Mesh(
          new THREE.PlaneGeometry(rnd(.2,.7),rnd(.2,.55)),
          new THREE.MeshStandardMaterial({color:c,emissive:new THREE.Color(c),emissiveIntensity:2})
        );
        win.position.set(rnd(-w/2+.5,w/2-.5),rnd(-h/2+1,h/2-1),d/2+.01);
        bld.add(win);
      }
    }
  }
}

/* ─ Rain particles for atmosphere ─ */
function setupRain() {
  const mat = new THREE.LineBasicMaterial({color:0x004466,transparent:true,opacity:.35});
  for (let i=0;i<120;i++) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0,0,0), new THREE.Vector3(rnd(-.05,.05),-.8,0)
    ]);
    const drop = new THREE.Line(geo,mat);
    drop.position.set(rnd(-12,12),rnd(0,18),rnd(-80,10));
    drop.userData.spd = rnd(18,32);
    scene.add(drop); rainDrops.push(drop);
  }
}

function updateRain(dt) {
  rainDrops.forEach(d => {
    d.position.y -= d.userData.spd * dt;
    d.position.z += (G.dashing ? G.speed*CFG.DASH_SPD : G.speed) * dt * 0.1;
    if (d.position.y < -2) d.position.y = rnd(14,22);
    if (d.position.z > 12) d.position.z = rnd(-80,-40);
  });
}

/* ──────────────────────────────────────────────────────────────────
   § 9  PLAYER SPRITE  (image_0.png → THREE.Sprite)
────────────────────────────────────────────────────────────────── */
function setupPlayer() {
  const skin = getActiveSkin();

  new THREE.TextureLoader().load(
    'image_0.png',
    (tex) => {
      const mat = new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false, sizeAttenuation:true });
      playerSprite = new THREE.Sprite(mat);
      playerSprite.scale.set(CFG.SPRITE_W, CFG.SPRITE_H, 1);
      playerSprite.position.set(0, G.pY, CFG.PLAYER_Z);
      scene.add(playerSprite);
      console.log('✅ Sprite karakter dimuat dari image_0.png');
    },
    undefined,
    () => {
      console.warn('⚠️  image_0.png tidak ditemukan — pakai capsule fallback.\n   Rename karakter kamu ke image_0.png di folder yang sama.');
      const grp = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({
        color:new THREE.Color(skin.color), emissive:new THREE.Color(skin.color), emissiveIntensity:2.2
      });
      const cyl=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,1.8,12),mat);
      const top=new THREE.Mesh(new THREE.SphereGeometry(.38,12,8),mat); top.position.y=.9;
      const bot=new THREE.Mesh(new THREE.SphereGeometry(.38,12,8),mat); bot.position.y=-.9;
      grp.add(cyl,top,bot); grp.castShadow=true;
      playerSprite=grp; playerSprite.position.set(0,G.pY,CFG.PLAYER_Z);
      scene.add(playerSprite);
    }
  );
}

/* Update skin color on fallback capsule */
function applyActiveSkin() {
  const skin = getActiveSkin();
  playerNeonL.color.setHex(skin.color);
  playerGlowL.color.setHex(skin.color);
  // If using capsule fallback, recolor
  if (playerSprite && playerSprite.isMesh === undefined && playerSprite.children) {
    playerSprite.children.forEach(c => {
      if (c.material) { c.material.color.setHex(skin.color); c.material.emissive.setHex(skin.color); }
    });
  }
  $('skin-name-hud').textContent = skin.name;
  $('skin-name-hud').style.color = '#' + skin.color.toString(16).padStart(6,'0');
}

/* ──────────────────────────────────────────────────────────────────
   § 10  GHOST
────────────────────────────────────────────────────────────────── */
const BEST_GHOST = DB.get('cbr_ghost', []);

function setupGhost() {
  if (ghostMesh) { scene.remove(ghostMesh); ghostMesh=null; }
  if (!BEST_GHOST.length) return;
  ghostMesh = new THREE.Mesh(
    new THREE.BoxGeometry(.9,2.5,.5),
    new THREE.MeshStandardMaterial({
      color:new THREE.Color(CFG.GHOST), emissive:new THREE.Color(0x002288), emissiveIntensity:1.6,
      transparent:true, opacity:.3,
    })
  );
  ghostMesh.position.set(0,CFG.GROUND_Y,.7); scene.add(ghostMesh);
}

/* ──────────────────────────────────────────────────────────────────
   § 11  INPUT
────────────────────────────────────────────────────────────────── */
const keys = {};
let tx0=0;

function setupInput() {
  window.addEventListener('keydown', e => {
    if (keys[e.code]) return; keys[e.code]=true;
    if (e.code==='Space')                                { e.preventDefault(); onJump(); }
    if (e.code==='ShiftLeft'||e.code==='ShiftRight')    { e.preventDefault(); onDash(); }
    if (e.code==='Enter' && G.phase==='name')            { submitName(); }
  });
  window.addEventListener('keyup', e => { keys[e.code]=false; });
  window.addEventListener('touchstart', e => {
    e.preventDefault(); tx0=e.touches[0].clientX; onJump();
  },{passive:false});
  window.addEventListener('touchend', e => {
    if (Math.abs(e.changedTouches[0].clientX-tx0)>55) onDash();
  });
}

function onJump() {
  initAudio();
  if (G.phase==='name')    return;
  if (G.phase==='start')   { startGame(); return; }
  if (G.phase==='over')    { startGame(); return; }
  if (G.phase==='playing') { G.jbuf=CFG.JUMP_BUF; G.jumps++; }
}

function onDash() {
  initAudio();
  if (G.phase!=='playing') return;
  if (G.dashCd>0) return;
  if (G.coins<CFG.DASH_COST) { flashEl('coins-value','#ff0066'); return; }
  G.dashing=true; G.dashTimer=CFG.DASH_DUR; G.dashCd=CFG.DASH_CD;
  G.coins-=CFG.DASH_COST; G.usedDash=true;
  sfx('dash'); feedback('⚡ DASH!','#00ffff');
}

/* ──────────────────────────────────────────────────────────────────
   § 12  PLAYER PHYSICS
────────────────────────────────────────────────────────────────── */
function updatePlayer(dt) {
  if (!playerSprite) return;
  if (!G.grounded) G.coyote-=dt; else G.coyote=CFG.COYOTE;
  if (G.jbuf>0) G.jbuf-=dt;
  if (G.jbuf>0 && G.coyote>0) {
    G.pVY=CFG.JUMP_FORCE; G.grounded=false; G.coyote=0; G.jbuf=0; sfx('jump');
  }
  const gm = G.pVY<0 ? CFG.FALL_MULT : 1.0;
  const glitch = G.event==='glitch' ? .45+Math.abs(Math.sin(G.alive*3))*.85 : 1.0;
  G.pVY += CFG.GRAVITY*gm*glitch*dt;
  G.pY  += G.pVY*dt;
  if (G.pY<=CFG.GROUND_Y) {
    if (!G.grounded && G.pVY<-12) {
      const b=Math.floor(80*G.mult); addScore(b); feedback(`PERFECT LANDING  +${b}`,'#00ffff');
    }
    G.pY=CFG.GROUND_Y; G.pVY=0; G.grounded=true;
  }
  if (G.dashing) { G.dashTimer-=dt; if(G.dashTimer<=0) G.dashing=false; }
  if (G.dashCd>0) G.dashCd-=dt;
  if (!G.usedDash && G.grounded) G.noDashTime+=dt;

  const dispY=G.pY+(G.grounded?Math.sin(G.alive*2.6)*.045:0);
  playerSprite.position.y=dispY;

  /* Move neon lights with player */
  playerNeonL.position.set(0,dispY+.9,1.4);
  playerGlowL.position.set(0,dispY-.2,2.0);
  const boost=Math.min(G.combo*.2,5);
  playerNeonL.intensity = G.dashing?14:5+boost;
  playerGlowL.intensity = 2.2+boost*.45;
  if (!G.dashing) playerNeonL.color.setHex(getActiveSkin().color);
  else            playerNeonL.color.setHex(0xffffff);

  /* Ghost recording */
  if (!G.ghostRec.length || G.alive*20>G.ghostRec.length)
    G.ghostRec.push(parseFloat(G.pY.toFixed(3)));

  /* Ghost playback */
  if (ghostMesh && BEST_GHOST.length) {
    const idx=Math.min(Math.floor(G.ghostIdx),BEST_GHOST.length-1);
    ghostMesh.position.y=BEST_GHOST[idx];
    G.ghostIdx+=20*dt;
    ghostMesh.material.color.setHex(G.ghostRec.length-idx>8?0xff2200:CFG.GHOST);
    ghostMesh.visible=idx<BEST_GHOST.length;
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 13  WORLD SCROLL
────────────────────────────────────────────────────────────────── */
function updateWorld(dt) {
  const spd  = G.dashing ? G.speed*CFG.DASH_SPD : G.speed;
  const move = spd*dt;
  groundTiles.forEach(t => { t.position.z+=move; if(t.position.z>CFG.TILE_LEN+2) t.position.z-=CFG.TILE_CNT*CFG.TILE_LEN; });
  buildings.forEach(b   => { b.position.z+=move; if(b.position.z>24) b.position.z-=260; });

  obsTimer-=dt;
  if (obsTimer<=0) {
    spawnObstacle();
    const s=G.mistakes>5;
    obsTimer=rnd(s?1.3:Math.max(.78,2.1-G.alive*.013), s?2.4:Math.max(1.5,4-G.alive*.02));
    if (Math.random()<.6) coinTimer=0;
  }
  coinTimer-=dt;
  if (coinTimer<=0) { spawnCoins(); coinTimer=rnd(1.1,2.6); }

  for (let i=obstacles.length-1;i>=0;i--) {
    const o=obstacles[i]; o.position.z+=move; o.rotation.y+=dt*.55;
    if (!o.userData.nm && o.position.z>-1 && o.position.z<2) { o.userData.nm=true; tryNearMiss(o); }
    if (o.position.z>CFG.DESPAWN_Z) { scene.remove(o); obstacles.splice(i,1); }
  }
  for (let i=coins.length-1;i>=0;i--) {
    const c=coins[i]; c.position.z+=move; c.rotation.y+=dt*3.5;
    c.position.y=c.userData.by+Math.sin(G.alive*3+i)*.13;
    if (c.position.z>CFG.DESPAWN_Z) {
      if (!c.userData.hit) breakCombo();
      scene.remove(c); coins.splice(i,1);
    }
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 14  OBSTACLE + COIN FACTORY
────────────────────────────────────────────────────────────────── */
function spawnObstacle() {
  const types=['low','tall','wide','float'];
  const w=G.mistakes>5?[.55,.15,.20,.10]:[.30,.25,.25,.20];
  const type=wRnd(types,w);
  let ow,oh,od,oy,col;
  switch(type){
    case'low':  ow=rnd(.9,1.6);oh=rnd(.8,1.4);od=rnd(.8,1.2);oy=oh/2;col=CFG.OBS_A;break;
    case'tall': ow=rnd(.7,1.1);oh=rnd(2.5,4.2);od=rnd(.7,1);oy=oh/2;col=CFG.OBS_B;break;
    case'wide': ow=rnd(2.8,5);oh=rnd(.7,1.1);od=rnd(.7,1);oy=oh/2;col=CFG.OBS_C;break;
    case'float':ow=rnd(1.2,2.2);oh=rnd(.7,1.1);od=rnd(.7,1);oy=rnd(2,3.3);col=CFG.OBS_B;break;
    default:    ow=1;oh=1;od=1;oy=.5;col=CFG.OBS_A;
  }
  const geo=new THREE.BoxGeometry(ow,oh,od);
  const mat=new THREE.MeshStandardMaterial({
    color:new THREE.Color(col),emissive:new THREE.Color(col),emissiveIntensity:1.5,
    roughness:.22,metalness:.78,
  });
  const mesh=new THREE.Mesh(geo,mat);
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.45})));
  const sh=G.event==='bull'?.72:1;
  mesh.scale.set(sh,sh,sh);
  mesh.position.set(0,oy,CFG.SPAWN_Z);
  mesh.castShadow=true;
  mesh.userData={w:ow*sh,h:oh*sh,d:od*sh,nm:false};
  scene.add(mesh); obstacles.push(mesh);
}

function spawnCoins() {
  const arc=Math.random()<.5;
  let cnt=Math.floor(rnd(3,8));
  if (G.event==='bull') cnt=Math.floor(cnt*2.2);
  const by=rnd(1.2,2.7);
  const mat=new THREE.MeshStandardMaterial({
    color:new THREE.Color(CFG.COIN),emissive:new THREE.Color(CFG.COIN),
    emissiveIntensity:2.2,roughness:.08,metalness:1,
  });
  for (let i=0;i<cnt;i++) {
    let x=0,y=by,z;
    if (arc) { const a=(i/(cnt-1||1))*Math.PI; y=by+Math.sin(a)*1.5; x=(i-cnt/2)*.62; z=CFG.SPAWN_Z-2; }
    else { z=CFG.SPAWN_Z-i*2.5; }
    const coin=new THREE.Mesh(new THREE.SphereGeometry(.22,8,6),mat.clone());
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.27,.07,6,12),mat.clone());
    ring.rotation.x=Math.PI/2; coin.add(ring);
    coin.position.set(x,y,z); coin.userData={hit:false,by:y};
    scene.add(coin); coins.push(coin);
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 15  COLLISION
────────────────────────────────────────────────────────────────── */
function checkCollisions() {
  if (!playerSprite || G.phase!=='playing') return;
  const py=G.pY, ph=CFG.HIT_HH;
  for (const o of obstacles) {
    if (!G.dashing &&
        Math.abs(o.position.z)<o.userData.d/2+.35 &&
        Math.abs(o.position.y-py)<o.userData.h/2+ph) { onDie(); return; }
  }
  for (let i=coins.length-1;i>=0;i--) {
    const c=coins[i];
    if (!c.userData.hit && Math.abs(c.position.z)<1.05 && Math.abs(c.position.y-py)<1.55)
      collectCoin(c);
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 16  NEAR-MISS
────────────────────────────────────────────────────────────────── */
function tryNearMiss(obs) {
  if (!playerSprite) return;
  const top=obs.position.y+obs.userData.h/2, bot=G.pY-CFG.HIT_HH, gap=bot-top;
  if (gap>=0 && gap<CFG.NM_GAP) {
    G.nearChain++; G.nearMissCount++;
    const bonus=Math.floor(90*G.mult*Math.min(G.nearChain,5));
    addScore(bonus); sfx('nearmiss');
    feedback(`⚡ NEAR MISS  +${bonus}`,'#ff0066');
    G.slowmo=true; G.slowmoT=CFG.SLOWMO_DUR;
    $('slowmo-overlay').classList.add('active');
    setTimeout(()=>$('slowmo-overlay').classList.remove('active'),360);
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 17  COMBO
────────────────────────────────────────────────────────────────── */
function collectCoin(coin) {
  coin.userData.hit=true;
  G.combo++; G.comboTimer=CFG.COMBO_TO;
  if (G.combo>G.maxCombo) G.maxCombo=G.combo;
  G.mult=G.combo>=20?5:G.combo>=10?4:G.combo>=5?3:G.combo>=3?2:1;
  G.coins++; addScore(CFG.COIN_SC*G.mult); sfx('coin');
  coin.scale.set(1.9,1.9,1.9);
  flashScreen();
  if (G.combo>=3) refreshComboUI();
}

function breakCombo() {
  if (!G.combo) return;
  G.combo=0; G.mult=1; G.nearChain=0;
  $('combo-display').classList.add('hidden');
}

function updateComboTimer(dt) {
  if (G.combo>0) { G.comboTimer-=dt; if(G.comboTimer<=0) breakCombo(); }
}

function refreshComboUI() {
  const d=$('combo-display'), v=$('combo-value');
  d.classList.remove('hidden');
  d.style.animation='none'; void d.offsetWidth; d.style.animation='';
  v.textContent=`x${G.mult}`;
  const pal=['','#fff','#00ffff','#00ffff','#ffdd00','#ff0066'];
  v.style.color=pal[Math.min(G.mult,5)];
}

function flashScreen() {
  const f=$('screen-flash');
  f.classList.add('pop');
  setTimeout(()=>f.classList.remove('pop'),60);
}

/* ──────────────────────────────────────────────────────────────────
   § 18  DAILY CHALLENGE TRACKER
────────────────────────────────────────────────────────────────── */
const TODAY_CH = getTodayChallenge();

function checkDaily() {
  if (G.dailyDone) return;
  const val = G[TODAY_CH.track] || 0;
  const prog = Math.min(val/TODAY_CH.goal, 1);
  // Update in-game HUD bar
  const bar=$('daily-hud-bar');
  if (bar) bar.style.width=(prog*100)+'%';
  const lbl=$('daily-hud-label');
  if (lbl) lbl.textContent=`${Math.min(Math.floor(val),TODAY_CH.goal)}/${TODAY_CH.goal}`;

  if (val >= TODAY_CH.goal) {
    G.dailyDone=true;
    sfx('daily');
    feedback('✅ MISI HARIAN SELESAI!','#00ff88');
    $('daily-banner').classList.remove('hidden');
    $('daily-text').textContent='✅ MISI SELESAI!';
    setTimeout(()=>$('daily-banner').classList.add('hidden'),3000);
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 19  EVENTS
────────────────────────────────────────────────────────────────── */
function updateEvents(dt) {
  G.evtNext-=dt;
  if (G.evtNext<=0 && !G.event) triggerEvent();
  if (G.event) { G.evtTimer-=dt; if(G.evtTimer<=0) endEvent(); }
}

function triggerEvent() {
  const r=Math.random();
  G.event=r<.33?'crash':r<.66?'bull':'glitch';
  G.evtTimer=CFG.EVT_DUR; G.evtNext=rnd(CFG.EVT_MIN,CFG.EVT_MAX);
  switch(G.event){
    case'crash':
      showEvent('🐻 MARKET CRASH!  ×3 REWARD');
      G.speed=Math.min(G.speed*1.38,CFG.SPD_MAX);
      scene.fog.color.setHex(0x1a0008); sfx('milestone'); break;
    case'bull':
      showEvent('🚀 BULL RUN!  COINS EVERYWHERE');
      scene.fog.color.setHex(0x001a00);
      for(let i=0;i<7;i++) setTimeout(spawnCoins,i*380); break;
    case'glitch':
      showEvent('⚡ GLITCH ZONE!  PHYSICS WARPED');
      scene.fog.color.setHex(0x180018);
      $('glitch-overlay').classList.add('active'); break;
  }
}

function endEvent() {
  if (G.event==='glitch') $('glitch-overlay').classList.remove('active');
  G.event=null; G.evtTimer=0; hideEvent(); scene.fog.color.setHex(CFG.BG);
}

/* ──────────────────────────────────────────────────────────────────
   § 20  DIFFICULTY + SCORE
────────────────────────────────────────────────────────────────── */
function addScore(n) { G.score+=Math.floor(n); }

function updateDifficulty(dt) {
  G.speed=Math.min(G.speed+CFG.SPD_RAMP*dt,CFG.SPD_MAX);
  G.alive+=dt;
  addScore(G.speed*dt*.42);
  const ms=Math.floor(G.score/500)*500;
  if (ms>0 && ms!==G._milestone) {
    G._milestone=ms; milestone(`🏅 ${ms} pts!`); sfx('milestone');
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 21  NEON TRAIL
────────────────────────────────────────────────────────────────── */
function updateTrail(dt) {
  if (!playerSprite) return;
  if (G.combo>=5 && G.phase==='playing') {
    const dot=new THREE.Sprite(new THREE.SpriteMaterial({
      color:new THREE.Color().setHSL((G.alive*1.4)%1,1,.6),
      transparent:true,opacity:.78,depthWrite:false,
    }));
    dot.scale.set(.4,.55,1);
    dot.position.copy(playerSprite.position);
    dot.position.z+=rnd(-.25,.25);
    dot.userData={life:.38+Math.random()*.22,max:0};
    dot.userData.max=dot.userData.life;
    scene.add(dot); trailDots.push(dot);
  }
  for (let i=trailDots.length-1;i>=0;i--) {
    const d=trailDots[i]; d.userData.life-=dt;
    const a=Math.max(0,d.userData.life/d.userData.max)*.78;
    d.material.opacity=a; d.scale.set(a*.9,a*1.3,1);
    if (d.userData.life<=0) { scene.remove(d); trailDots.splice(i,1); }
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 22  CAMERA
────────────────────────────────────────────────────────────────── */
function updateCamera(rawDt) {
  const tFOV=70+(G.speed-CFG.SPD_START)*.52;
  camera.fov+=(tFOV-camera.fov)*rawDt*3;
  camera.updateProjectionMatrix();
  if (G.shake>0) {
    G.shake-=rawDt*4.5;
    const sh=Math.max(G.shake,0)*.38;
    camera.position.x=Math.sin(Date.now()*.09)*sh;
    camera.position.y=6.5+Math.cos(Date.now()*.12)*sh;
  } else {
    camera.position.x+=(0-camera.position.x)*rawDt*6;
    camera.position.y+=(6.5-camera.position.y)*rawDt*6;
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 23  HUD
────────────────────────────────────────────────────────────────── */
function updateHUD() {
  if (G.phase!=='playing') return;
  const sv=$('score-value');
  if (sv) { const c=+sv.textContent; sv.textContent=Math.floor(c+(G.score-c)*.18); }
  const myBest=PLAYER_BESTS[PLAYER_NAME]||0;
  $('hs-value').textContent=myBest;
  $('coins-value').textContent=G.coins;

  const pct=G.dashCd>0?((CFG.DASH_CD-G.dashCd)/CFG.DASH_CD)*100:100;
  const fill=$('dash-bar-fill');
  if (fill) { fill.style.width=pct+'%'; pct>=100?fill.classList.remove('empty'):fill.classList.add('empty'); }
  const ds=$('dash-status');
  if (ds) ds.textContent=pct>=100?'READY':`${(Math.ceil(G.dashCd*10)/10)}s`;

  const dw=$('delta-wrap'), dt2=$('delta-text');
  if (myBest>0) {
    dw.classList.remove('hidden');
    if (G.score<myBest) { dt2.textContent=`▲ ${myBest-G.score} pts to BEST`; dt2.style.color=myBest-G.score<400?'#ff0066':'#ffdd00'; }
    else { dt2.textContent='🏆 NEW RECORD!'; dt2.style.color='#ffdd00'; }
  } else dw.classList.add('hidden');

  checkDaily();
}

/* ──────────────────────────────────────────────────────────────────
   § 24  DRAMATIC GAME OVER
────────────────────────────────────────────────────────────────── */
function onDie() {
  if (G.phase!=='playing') return;
  G.phase='over'; G.mistakes++; sfx('crash'); G.shake=1.5;

  /* Dramatic slow-mo zoom before game over screen */
  G.slowmo=true; G.slowmoT=0.9;
  setTimeout(()=>{
    G.slowmo=false;
    showGameOver();
  }, 900);
}

function showGameOver() {
  /* Check new high score */
  const myBest = PLAYER_BESTS[PLAYER_NAME]||0;
  const isNew  = G.score > myBest;

  /* Save data */
  updateLeaderboard(G.score);
  const newlyUnlocked = checkUnlocks(G.score);

  /* Save ghost if personal best */
  if (isNew) DB.set('cbr_ghost', G.ghostRec);

  saveAll();

  /* Daily mark */
  const today=new Date().toDateString();
  if (G.dailyDone) {
    DAILY_DONE={date:today,done:true};
    saveAll();
  }

  /* Show screen */
  showScreen('over');

  /* Populate */
  $('go-player').textContent  = PLAYER_NAME;
  $('go-score').textContent   = G.score;
  $('go-hs').textContent      = Math.max(myBest, G.score);
  $('go-coins').textContent   = G.coins;
  $('go-combo').textContent   = `x${G.maxCombo}`;
  $('go-time').textContent    = `${Math.floor(G.alive)}s`;

  isNew ? $('new-record').classList.remove('hidden') : $('new-record').classList.add('hidden');
  G.dailyDone ? $('daily-complete').classList.remove('hidden') : $('daily-complete').classList.add('hidden');

  if (newlyUnlocked.length>0) {
    $('unlock-notif').classList.remove('hidden');
    $('unlock-text').textContent=`🎨 SKIN BARU TERBUKA: ${newlyUnlocked.join(', ')}`;
    sfx('unlock');
  } else {
    $('unlock-notif').classList.add('hidden');
  }

  renderLB($('lb-modal-list'));
}

/* ──────────────────────────────────────────────────────────────────
   § 25  LEADERBOARD UI
────────────────────────────────────────────────────────────────── */
function renderLB(container) {
  if (!container) return;
  container.innerHTML='';
  if (!LEADERBOARD.length) {
    container.innerHTML='<div style="opacity:.4;font-size:12px;padding:20px">Belum ada skor.</div>';
    return;
  }
  LEADERBOARD.forEach((r,i)=>{
    const row=document.createElement('div');
    row.className='lb-row'+(r.name===PLAYER_NAME?' me':'');
    const rankClass=i===0?'gold':i===1?'silver':i===2?'bronze':'';
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    row.innerHTML=`
      <span class="lb-rank ${rankClass}">${medal||'#'+(i+1)}</span>
      <span class="lb-name">${r.name}${r.name===PLAYER_NAME?' 👈':''}</span>
      <span class="lb-score">${r.score.toLocaleString()}</span>
    `;
    container.appendChild(row);
  });
}

function renderStartLB() {
  renderLB($('leaderboard-list'));
  const myBest=PLAYER_BESTS[PLAYER_NAME]||0;
  const myRank=LEADERBOARD.findIndex(r=>r.name===PLAYER_NAME)+1;
  $('lb-player-badge').innerHTML=`
    <span class="hud-label">PEMAIN</span>&nbsp;
    <span style="color:var(--cyan);font-weight:700">${PLAYER_NAME}</span>
    &nbsp;·&nbsp;
    <span class="hud-label">BEST</span>&nbsp;
    <span style="color:var(--yellow)">${myBest}</span>
    ${myRank>0?`&nbsp;·&nbsp;<span class="hud-label">RANK</span>&nbsp;<span style="color:var(--pink)">#${myRank}</span>`:''}
  `;
}

function showLB() {
  renderLB($('lb-modal-list'));
  $('lb-modal').classList.remove('hidden');
}
function closeLB() { $('lb-modal').classList.add('hidden'); }

/* ──────────────────────────────────────────────────────────────────
   § 26  SKIN PANEL
────────────────────────────────────────────────────────────────── */
function renderSkinPanel() {
  const grid=$('skin-grid');
  if (!grid) return;
  grid.innerHTML='';
  const myUnlocked=getMyUnlocked();
  const activeSkin=getActiveSkin();
  const myBest=PLAYER_BESTS[PLAYER_NAME]||0;

  SKINS.forEach(s=>{
    const isUnlocked=!s.locked||myUnlocked.includes(s.id);
    const btn=document.createElement('button');
    btn.className='skin-btn'+(s.id===activeSkin.id?' active':'')+(isUnlocked?'':' locked');
    btn.textContent=isUnlocked?s.name:`${s.name} (${s.req}pts)`;
    btn.style.borderColor=isUnlocked?'#'+s.color.toString(16).padStart(6,'0'):'';
    if (isUnlocked) {
      btn.onclick=()=>{
        SKIN_SEL[PLAYER_NAME]=s.id; saveAll();
        applyActiveSkin(); renderSkinPanel();
      };
    }
    grid.appendChild(btn);
  });
}

/* ──────────────────────────────────────────────────────────────────
   § 27  DAILY CHALLENGE UI
────────────────────────────────────────────────────────────────── */
function renderDailyUI() {
  const desc=$('daily-desc'), prog=$('daily-prog-bar'), lbl=$('daily-prog-label');
  if (!desc) return;
  const today=new Date().toDateString();
  const done=DAILY_DONE.date===today&&DAILY_DONE.done;
  desc.textContent=TODAY_CH.desc+(done?' ✅':'');
  prog.style.width=done?'100%':'0%';
  lbl.textContent=done?`SELESAI! (${TODAY_CH.goal}/${TODAY_CH.goal} ${TODAY_CH.unit})`:`0/${TODAY_CH.goal} ${TODAY_CH.unit}`;
  $('daily-hud-label').textContent=`0/${TODAY_CH.goal}`;
}

/* ──────────────────────────────────────────────────────────────────
   § 28  SHARE SCORE
────────────────────────────────────────────────────────────────── */
function shareScore() {
  const myBest=PLAYER_BESTS[PLAYER_NAME]||G.score;
  const rank=LEADERBOARD.findIndex(r=>r.name===PLAYER_NAME)+1;
  const text=
`🎮 CRYPTO BLOCK RUNNER
━━━━━━━━━━━━━━━━━━
👤 Player: ${PLAYER_NAME}
🏆 Skor: ${G.score.toLocaleString()}
📊 Best: ${myBest.toLocaleString()}
${rank>0?`🥇 Rank: #${rank} di Leaderboard\n`:''}⚡ Max Combo: x${G.maxCombo}
⏱️ Waktu: ${Math.floor(G.alive)}s
━━━━━━━━━━━━━━━━━━
Bisa ngalahin gue? 🔥
#CryptoBlockRunner #NeonDistrict`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(()=>{
      $('share-copied').classList.remove('hidden');
      setTimeout(()=>$('share-copied').classList.add('hidden'),3000);
    });
  } else {
    // Fallback for older browsers / mobile
    const ta=document.createElement('textarea');
    ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); } catch {}
    document.body.removeChild(ta);
    $('share-copied').classList.remove('hidden');
    setTimeout(()=>$('share-copied').classList.add('hidden'),3000);
  }
}

/* ──────────────────────────────────────────────────────────────────
   § 29  NAME INPUT SCREEN
────────────────────────────────────────────────────────────────── */
function submitName() {
  const input=$('name-input');
  const name=(input.value||'').trim().toUpperCase().replace(/[^A-Z0-9_]/g,'').slice(0,12);
  if (!name) { input.style.borderColor='#ff0066'; setTimeout(()=>input.style.borderColor='',800); return; }
  PLAYER_NAME=name;
  DB.set('cbr_name',PLAYER_NAME);
  if (!UNLOCKED[PLAYER_NAME]) UNLOCKED[PLAYER_NAME]=['default'];
  if (!SKIN_SEL[PLAYER_NAME])  SKIN_SEL[PLAYER_NAME]='default';
  saveAll();
  showScreen('start');
  renderStartLB(); renderSkinPanel(); renderDailyUI(); applyActiveSkin();
}

/* ──────────────────────────────────────────────────────────────────
   § 30  SCREEN MANAGEMENT
────────────────────────────────────────────────────────────────── */
function showScreen(which) {
  ['name-screen','start-screen','gameover-screen','hud',
   'combo-display','event-banner','daily-banner','delta-wrap']
    .forEach(id=>{ const el=$(id); if(el) el.classList.add('hidden'); });

  if      (which==='name')    { $('name-screen').classList.remove('hidden'); setTimeout(()=>$('name-input').focus(),100); }
  else if (which==='start')   { $('start-screen').classList.remove('hidden'); }
  else if (which==='playing') { $('hud').classList.remove('hidden'); }
  else if (which==='over')    { $('gameover-screen').classList.remove('hidden'); }
}

/* ──────────────────────────────────────────────────────────────────
   § 31  SMALL UI HELPERS
────────────────────────────────────────────────────────────────── */
function showEvent(t) { $('event-text').textContent=t; $('event-banner').classList.remove('hidden'); }
function hideEvent()  { $('event-banner').classList.add('hidden'); }

function feedback(text,color) {
  const el=$('center-feedback');
  el.textContent=text; el.style.color=color||'#00ffff'; el.style.opacity='1';
  clearTimeout(el._t); el._t=setTimeout(()=>{ el.style.opacity='0'; },980);
}

function milestone(text) {
  const m=$('milestone-flash');
  m.textContent=text; m.classList.remove('hidden');
  m.style.animation='none'; void m.offsetWidth; m.style.animation='';
  setTimeout(()=>m.classList.add('hidden'),1600);
}

function flashEl(id,color) {
  const el=$(id); el.style.color=color;
  setTimeout(()=>{ el.style.color=''; },420);
}

function $(id) { return document.getElementById(id); }

/* ──────────────────────────────────────────────────────────────────
   § 32  RESET + START
────────────────────────────────────────────────────────────────── */
function resetGame() {
  obstacles.forEach(o=>scene.remove(o)); obstacles=[];
  coins.forEach(c=>scene.remove(c));     coins=[];
  trailDots.forEach(t=>scene.remove(t)); trailDots=[];

  Object.assign(G,{
    phase:'playing', score:0, coins:0,
    combo:0, mult:1, comboTimer:0, maxCombo:1,
    speed:CFG.SPD_START, alive:0, mistakes:0,
    pY:CFG.GROUND_Y, pVY:0, grounded:true,
    coyote:0, jbuf:0,
    dashCd:0, dashTimer:0, dashing:false,
    slowmo:false, slowmoT:0,
    nearChain:0, nearMissCount:0,
    shake:0,
    event:null, evtTimer:0, evtNext:rnd(28,58),
    ghostRec:[], ghostIdx:0, _milestone:0,
    jumps:0, noDashTime:0, usedDash:false, dailyDone:false,
  });

  if (playerSprite) playerSprite.position.set(0,CFG.GROUND_Y,CFG.PLAYER_Z);
  groundTiles.forEach((t,i)=>{ t.position.z=2-i*CFG.TILE_LEN; });

  camera.position.set(0,6.5,13);
  camera.fov=70; camera.updateProjectionMatrix();
  camera.lookAt(0,1.5,0);
  scene.fog.color.setHex(CFG.BG);

  obsTimer=2.2; coinTimer=1.4;
  $('glitch-overlay').classList.remove('active');
  $('slowmo-overlay').classList.remove('active');
  $('share-copied').classList.add('hidden');

  setupGhost(); applyActiveSkin();
}

function startGame() {
  if (!PLAYER_NAME) { showScreen('name'); return; }
  showScreen('playing'); resetGame();
}

/* ──────────────────────────────────────────────────────────────────
   § 33  SLOW MOTION
────────────────────────────────────────────────────────────────── */
function applySlowmo(rawDt) {
  let dt=Math.min(rawDt,.05);
  if (G.slowmo) {
    G.slowmoT-=rawDt;
    if (G.slowmoT<=0) { G.slowmo=false; $('slowmo-overlay').classList.remove('active'); }
    dt*=CFG.SLOWMO_K;
  }
  return dt;
}

/* ──────────────────────────────────────────────────────────────────
   § 34  MAIN LOOP
────────────────────────────────────────────────────────────────── */
let lastTs=0;

function loop(ts) {
  const rawDt=Math.min((ts-lastTs)/1000,.1); lastTs=ts;
  if (G.phase==='playing') {
    const dt=applySlowmo(rawDt);
    updatePlayer(dt);
    updateWorld(dt);
    checkCollisions();
    updateComboTimer(dt);
    updateEvents(dt);
    updateDifficulty(dt);
    updateTrail(dt);
    updateRain(dt);
    updateCamera(rawDt);
    updateHUD();
  }
  renderer.render(scene,camera);
}

/* ──────────────────────────────────────────────────────────────────
   § 35  UTILITIES
────────────────────────────────────────────────────────────────── */
function rnd(a,b){ return a+Math.random()*(b-a); }
function wRnd(items,weights){
  const total=weights.reduce((s,w)=>s+w,0); let r=Math.random()*total;
  for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i];}
  return items[items.length-1];
}

/* ──────────────────────────────────────────────────────────────────
   § 36  BOOT
────────────────────────────────────────────────────────────────── */
(function main() {
  setupScene();
  setupLighting();
  setupGround();
  setupBackground();
  setupRain();
  setupPlayer();
  setupInput();

  /* If name already saved, skip name screen */
  if (PLAYER_NAME) {
    showScreen('start');
    renderStartLB(); renderSkinPanel(); renderDailyUI(); applyActiveSkin();
  } else {
    showScreen('name');
  }

  renderer.setAnimationLoop(loop);

  console.log(`
  ╔══════════════════════════════════════════════╗
  ║  CRYPTO BLOCK RUNNER v3.0 — ULTIMATE ✅      ║
  ╠══════════════════════════════════════════════╣
  ║  SPACE  → Jump    SHIFT → Dash (5💰 gas)     ║
  ║  Mobile → TAP=Jump | SWIPE=Dash              ║
  ╠══════════════════════════════════════════════╣
  ║  FITUR:                                      ║
  ║  ✅ Leaderboard multi-player                 ║
  ║  ✅ Share score (WA/IG ready)                ║
  ║  ✅ 5 Skin unlockable                        ║
  ║  ✅ Daily Challenge (rotasi tiap hari)        ║
  ║  ✅ Ghost system                             ║
  ║  ✅ 3 Random events                          ║
  ║  ✅ Near-miss slow-mo                        ║
  ║  ✅ Hujan neon + atmosphere                  ║
  ╠══════════════════════════════════════════════╣
  ║  📁 Rename karakter kamu → image_0.png       ║
  ║     taruh di folder yang sama                ║
  ╚══════════════════════════════════════════════╝
  `);
})();
