'use strict';
/* ═══════════════════════════════════════════
   Fish It Gileg v7 · game.js
   All game data + logic
═══════════════════════════════════════════ */

/* ══════════════════ GAME DATA ══════════════════ */
const RODS = [
  {id:'bamboo',  n:'Bamboo Rod',    i:'🎋', maxKg:8,   cost:0,     xm:1,   rb:{},                    d:'Rod pemula ringan'},
  {id:'iron',    n:'Iron Rod',      i:'🔩', maxKg:20,  cost:700,   xm:1.2, rb:{Uncommon:3},           d:'+3% Uncommon'},
  {id:'carbon',  n:'Carbon Rod',    i:'⚡', maxKg:55,  cost:2200,  xm:1.5, rb:{Rare:4,Epic:2},        d:'+4% Rare, +2% Epic'},
  {id:'titanium',n:'Titanium Rod',  i:'🌙', maxKg:130, cost:7500,  xm:2,   rb:{Legendary:4},          d:'+4% Legendary'},
  {id:'mythic',  n:'Mythic Rod',    i:'🌈', maxKg:420, cost:0,     xm:3,   rb:{Mythic:6,Legendary:3}, d:'+6% Mythic', craft:true},
];
const BAITS = [
  {id:'worm',    n:'Worm Bait',     i:'🪱', wMin:3500,wMax:5500, cost:0,    rb:{},                     d:'Ikan umum biasa'},
  {id:'shrimp',  n:'Shrimp Bait',   i:'🦐', wMin:2500,wMax:4000, cost:150,  rb:{Uncommon:5},            d:'+5% Uncommon'},
  {id:'bread',   n:'Bread Bait',    i:'🍞', wMin:2000,wMax:3500, cost:400,  rb:{Rare:4},               d:'+4% Rare'},
  {id:'golden',  n:'Golden Bait',   i:'✨', wMin:1500,wMax:2800, cost:1200, rb:{Rare:4,Epic:3,Legendary:2},d:'+4/3/2%'},
  {id:'mythic_b',n:'Mythic Bait',   i:'🌈', wMin:800, wMax:1800, cost:4500, rb:{Legendary:5,Mythic:4},  d:'+5%Leg +4%Myth'},
];
// Feature #15: Rod Skins
const SKINS = [
  {id:'golden_sk',   n:'Golden Rod Skin',    i:'🌟', glow:'rgba(255,215,0,.6)',  cost:800,  from:'shop',    d:'Kilau emas mewah'},
  {id:'neon_sk',     n:'Neon Rod Skin',      i:'💜', glow:'rgba(180,0,255,.6)',  cost:1200, from:'shop',    d:'Neon electric purple'},
  {id:'dragon_sk',   n:'Dragon Rod Skin',    i:'🔥', glow:'rgba(255,60,0,.7)',   cost:0,    from:'event',   d:'Api naga perkasa'},
  {id:'ocean_sk',    n:'Ocean Spirit Skin',  i:'🌊', glow:'rgba(0,200,255,.6)', cost:0,    from:'chest',   d:'Jiwa samudra'},
  {id:'rainbow_sk',  n:'Rainbow Skin',       i:'🌈', glow:'rgba(255,80,200,.6)',cost:3000, from:'shop',    d:'Pelangi berwarna'},
];
// Feature #11: Maps with progression
const MAPS = [
  {id:'river',  n:'River',        e:'🌊', d:'Sungai jernih',      bg:'linear-gradient(180deg,#006bb5,#004080)',  water:'#0099dd', req:1,  bn:{Common:12},                   bl:'+12% Common'},
  {id:'lake',   n:'Lake',         e:'🏝', d:'Danau tenang',       bg:'linear-gradient(180deg,#2a5c7a,#103040)',  water:'#1177aa', req:5,  bn:{Uncommon:6,Rare:3},          bl:'+6%Un +3%Rare'},
  {id:'ocean',  n:'Ocean',        e:'🌏', d:'Lautan luas',        bg:'linear-gradient(180deg,#003366,#001a33)',  water:'#0055aa', req:10, bn:{Rare:6,Epic:3},               bl:'+6%Ra +3%Epic'},
  {id:'deepsea',n:'Deep Sea',     e:'🌑', d:'Palung misterius',   bg:'linear-gradient(180deg,#1a0050,#0a0030)',  water:'#220066', req:18, bn:{Epic:5,Legendary:4,Mythic:2}, bl:'+5%Ep +4%Leg'},
  {id:'arctic', n:'Arctic Ocean', e:'❄️', d:'Samudra Arctic',     bg:'linear-gradient(180deg,#1a4a6a,#0d2035)',  water:'#33aacc', req:25, bn:{Legendary:5,Mythic:6},        bl:'+5%Leg +6%Myth'},
];
// Feature #12: Weathers (improved)
const WEATHERS = [
  {id:'sunny',  n:'☀️ Cerah',    ico:'☀️', vfx:'✨ Cuaca cerah!',        rb:{Common:5},                      dur:6},
  {id:'cloudy', n:'⛅ Mendung',  ico:'⛅', vfx:'☁️ Mendung tiba...',     rb:{Uncommon:4,Rare:2},             dur:5},
  {id:'rain',   n:'🌧️ Hujan',   ico:'🌧️', vfx:'🌧️ Hujan! Ikan aktif!', rb:{Rare:4,Uncommon:3},             dur:4},
  {id:'storm',  n:'⛈️ Badai',   ico:'⛈️', vfx:'⛈️ BADAI! Ikan besar!', rb:{Epic:5,Legendary:3},            dur:3},
  {id:'night',  n:'🌙 Malam',   ico:'🌙', vfx:'🌙 Gelap... ikan langka!',rb:{Epic:4,Legendary:4,Mythic:2},  dur:5},
  {id:'fog',    n:'🌫️ Kabut',   ico:'🌫️', vfx:'🌫️ Kabut misterius...',  rb:{Rare:3,Epic:3,Legendary:2},    dur:4},
];
// Feature #16: Mutation types
const MUTATIONS = [
  {id:'golden',   n:'Golden',     mul:3.0,  sfx:'✨ GOLDEN! Harga 3x!',   glow:'#ffd700', prob:.04},
  {id:'ghost',    n:'Ghost',      mul:2.0,  sfx:'👻 GHOST! Misterius!',    glow:'#aaddff', prob:.05},
  {id:'rainbow',  n:'Rainbow',    mul:4.0,  sfx:'🌈 RAINBOW! Luar biasa!', glow:'#ff00ff', prob:.02},
  {id:'crystal',  n:'Crystal',    mul:2.5,  sfx:'💎 CRYSTAL! Berkilau!',   glow:'#00ffdd', prob:.03},
];
// Feature #20: Secret legendary fish
const SECRET_FISH = [
  {id:'kraken_f',   n:'The Kraken',        i:'🐙', rar:'Mythic',    minRod:'carbon',  bv:12000, prob:.004},
  {id:'leviathan',  n:'Leviathan',          i:'🐋', rar:'Mythic',    minRod:'titanium',bv:18000, prob:.002},
  {id:'goldragon',  n:'Golden Dragon Fish', i:'🐉', rar:'Mythic',    minRod:'mythic',  bv:25000, prob:.001},
];
const FISH = {
  Common:   [{id:'doge',  n:'Dogecoin',     i:'🐟',bv:28},{id:'shib',  n:'Shiba Inu',    i:'🐟',bv:22},{id:'ada',  n:'Cardano',     i:'🐟',bv:32},{id:'matic',n:'Polygon',      i:'🐟',bv:27},{id:'bbri', n:'BRI Stock',    i:'🐟',bv:40},{id:'tlkm', n:'Telkom',       i:'🐟',bv:36}],
  Uncommon: [{id:'sol',   n:'Solana',       i:'🐠',bv:85},{id:'dot',   n:'Polkadot',     i:'🐠',bv:80},{id:'avax', n:'Avalanche',   i:'🐠',bv:90},{id:'link', n:'Chainlink',    i:'🐠',bv:83},{id:'bbca', n:'BCA Stock',    i:'🐠',bv:105},{id:'bmri', n:'Mandiri',      i:'🐠',bv:100}],
  Rare:     [{id:'bnb',   n:'Binance BNB',  i:'🐡',bv:200},{id:'ltc',  n:'Litecoin',     i:'🐡',bv:185},{id:'xrp',  n:'XRP',          i:'🐡',bv:215},{id:'asii', n:'Astra Stock',  i:'🐡',bv:250},{id:'atom', n:'Cosmos',       i:'🐡',bv:195}],
  Epic:     [{id:'eth',   n:'Ethereum',     i:'🐙',bv:500},{id:'eur',  n:'EUR/USD',      i:'🐙',bv:530},{id:'indf', n:'Indofood',     i:'🐙',bv:550},{id:'ggrm', n:'Gudang Garam',  i:'🐙',bv:570}],
  Legendary:[{id:'btc',   n:'Bitcoin',      i:'🐋',bv:1400},{id:'ebt', n:'ETH/BTC',      i:'🐋',bv:1300},{id:'idx', n:'IDX Composite', i:'🐋',bv:1500}],
  Mythic:   [{id:'sat',   n:'Satoshi',      i:'🐉',bv:4500},{id:'qbt', n:'Quantum BTC',  i:'🐉',bv:5500},{id:'gmw', n:'Market Whale',  i:'🐉',bv:7000},{id:'idxd',n:'IDX Dragon',   i:'🐉',bv:7500}],
};
const WR = {Common:[.5,2],Uncommon:[1,5],Rare:[3,15],Epic:[10,50],Legendary:[30,150],Mythic:[100,300]};
const RM = {Common:1,Uncommon:1.5,Rare:2.5,Epic:4,Legendary:8,Mythic:20};
const BASE_RATES = {Common:55,Uncommon:20,Rare:12,Epic:7,Legendary:4,Mythic:2};
const EVENTS_DATA = [
  {n:'🌟 Golden Rush',   d:'Ikan emas lebih sering muncul!',    rb:{Rare:10,Epic:5,Legendary:3}},
  {n:'💀 Phantom Night', d:'Hantu laut berkeliaran!',            rb:{Epic:8,Legendary:5,Mythic:2}},
  {n:'🌊 Tide Surge',    d:'Ombak besar - ikan besar muncul!',  rb:{Legendary:5,Epic:5}},
  {n:'🦑 Deep Creature', d:'Makhluk laut dalam terlihat!',       rb:{Epic:6,Legendary:4,Mythic:3}},
];
const BOSSES_D = [
  {n:'KRAKEN',      i:'🐙', rw:{coins:3000,gems:8,frags:8},  hp:8,  d:'Gurita raksasa!'},
  {n:'GIANT TUNA',  i:'🐋', rw:{coins:2000,gems:5,frags:5},  hp:6,  d:'Tuna terbesar!'},
  {n:'PHANTOM SHARK',i:'🦈',rw:{coins:4000,gems:10,frags:12},hp:10, d:'Hiu hantu!'},
  {n:'SEA DRAGON',  i:'🐉', rw:{coins:6000,gems:15,frags:20},hp:15, d:'Naga laut!'},
];
const CHESTS_D = [
  {t:'wood',   n:'Peti Kayu',  i:'📦',rw:()=>({coins:150+~~(Math.random()*150),bait:'worm',bq:3})},
  {t:'silver', n:'Peti Perak', i:'🎁',rw:()=>({coins:350+~~(Math.random()*250),gems:1,bait:'golden',bq:1})},
  {t:'gold',   n:'Peti Emas',  i:'🏆',rw:()=>({coins:900+~~(Math.random()*600),gems:2,frags:4})},
  {t:'mythic', n:'Peti Mythic',i:'🌈',rw:()=>({coins:2200+~~(Math.random()*1800),gems:5,frags:10})},
];
// Feature #17: Mystery Bottle messages
const BOTTLES = [
  {msg:'⚓ "Berlayarlah ke timur..."', rw:()=>({coins:200})},
  {msg:'💌 "Aku ditunggu di dermaga barat..."', rw:()=>({coins:500,gems:1})},
  {msg:'🗺️ "Harta karun ada di koordinat X!"', rw:()=>({coins:1000,frags:3})},
  {msg:'🔮 "Ikan emas menunggu yang sabar..."', rw:()=>({bait:'golden',bq:2})},
  {msg:'💎 "Temukan Mythic di palung tergelap..."', rw:()=>({gems:3,frags:2})},
  {msg:'⚗️ "Ramuan kuno dari ahli alkemi laut."', rw:()=>({bait:'mythic_b',bq:1})},
];
const DR_REWARDS = [
  {day:1, ico:'💰', r:'100 Coin',      c(){G.coins+=100;}},
  {day:2, ico:'💰', r:'200 Coin',      c(){G.coins+=200;}},
  {day:3, ico:'🦐', r:'Shrimp x3',    c(){addBait('shrimp',3);}},
  {day:4, ico:'💰', r:'400 Coin',      c(){G.coins+=400;}},
  {day:5, ico:'💎', r:'1 Diamond',     c(){G.gems+=1;}},
  {day:6, ico:'✨', r:'Golden x2',     c(){addBait('golden',2);}},
  {day:7, ico:'🌈', r:'800💰 + 3💎',  c(){G.coins+=800;G.gems+=3;}},
];
const SKILLS_D = [
  {id:'luck',  n:'Luck',        i:'🍀', d:'Peluang ikan langka +2% per level',    max:5, cp:300},
  {id:'str',   n:'Strength',    i:'💪', d:'Max rod +12kg per level',              max:5, cp:400},
  {id:'speed', n:'Speed',       i:'⚡', d:'Waktu tunggu lebih cepat',             max:5, cp:350},
  {id:'detect',n:'Detection',   i:'👁️', d:'Bayangan ikan langka tampil di air',   max:3, cp:500},
  {id:'combo', n:'Combo Bonus', i:'🔥', d:'Combo bonus +5% per level',            max:5, cp:450},
  {id:'xpb',   n:'Scholar',     i:'📚', d:'XP lebih banyak +15% per level',       max:3, cp:600},
  {id:'coinb', n:'Merchant',    i:'💰', d:'Coin lebih banyak +10% per level',     max:3, cp:700},
];
const PETS_D = [
  {id:'otter',   n:'Otter',          i:'🦦', bn:{},                    cm:1.1, xm:1,   d:'Coin +10%',           cost:1000},
  {id:'seagull', n:'Seagull',        i:'🦅', bn:{Rare:3},              cm:1,   xm:1,   d:'Peringatan ikan langka', cost:2000},
  {id:'catfish', n:'Catfish Spirit', i:'🐈', bn:{Rare:2,Epic:2},       cm:1,   xm:1.1, d:'+Luck, XP+10%',       cost:3500},
  {id:'dragon',  n:'Crypto Dragon',  i:'🐉', bn:{Legendary:3,Mythic:2},cm:1,   xm:1,   d:'+3%Leg +2%Myth',      cost:10000},
];
const TRADES = [
  {id:'t1',f:'5x Common',   ft:'Common',   fq:5, to:'Golden Bait',   tt:'bait',  tid:'golden',  tq:1, cd:0},
  {id:'t2',f:'3x Rare',     ft:'Rare',     fq:3, to:'Mythic Bait',   tt:'bait',  tid:'mythic_b',tq:1, cd:30000},
  {id:'t3',f:'2x Epic',     ft:'Epic',     fq:2, to:'3 Frags',       tt:'frags', tq:3,           cd:60000},
  {id:'t4',f:'1x Legendary',ft:'Legendary',fq:1, to:'5 Frags',       tt:'frags', tq:5,           cd:120000},
  {id:'t5',f:'3x Mythic',   ft:'Mythic',   fq:3, to:'Mythic Rod',    tt:'rod',   tid:'mythic',   tq:1, cd:300000},
];
const COIN_TRADES = [
  {id:'c1',cost:100,  it:'Worm Bait x3',   tt:'bait', tid:'worm',    q:3},
  {id:'c2',cost:400,  it:'Golden Bait',     tt:'bait', tid:'golden',  q:1},
  {id:'c3',cost:1000, it:'Mythic Bait',     tt:'bait', tid:'mythic_b',q:1},
  {id:'c4',cost:200,  it:'2 Frags',         tt:'frags',               q:2},
  {id:'c5',cost:600,  it:'6 Frags',         tt:'frags',               q:6},
];
const FUSIONS = [
  {id:'f1',rf:'Common',   n:3, rt:'Uncommon'},
  {id:'f2',rf:'Uncommon', n:3, rt:'Rare'},
  {id:'f3',rf:'Rare',     n:3, rt:'Epic'},
  {id:'f4',rf:'Epic',     n:2, rt:'Legendary'},
];
const GACHA_P = {
  basic:   [{w:45,t:'bait',id:'worm',   q:3,n:'3x Worm',    i:'🪱'},{w:30,t:'bait',id:'shrimp', q:2,n:'2x Shrimp', i:'🦐'},{w:15,t:'frags',q:2,n:'2 Frags',   i:'🔩'},{w:8,t:'coins',q:300, n:'300💰',       i:'💰'},{w:2,t:'bait',id:'golden',q:1,n:'Golden Bait',i:'✨'}],
  premium: [{w:35,t:'bait',id:'golden', q:2,n:'2x Golden',  i:'✨'},{w:25,t:'frags',q:5,n:'5 Frags',   i:'🔩'},{w:20,t:'bait',id:'mythic_b',q:1,n:'Mythic Bait', i:'🌈'},{w:12,t:'coins',q:800, n:'800💰',       i:'💰'},{w:8,t:'gems',q:2,n:'2 Gems',    i:'💎'}],
  gem:     [{w:30,t:'bait',id:'mythic_b',q:2,n:'2x Mythic',i:'🌈'},{w:28,t:'frags',q:8,n:'8 Frags',   i:'🔩'},{w:20,t:'gems',q:3,n:'3 Gems',    i:'💎'},{w:15,t:'coins',q:2000,n:'2000💰',      i:'💰'},{w:7,t:'fish',n:'Rare Fish!',i:'🐡'}],
};
const ACHIEVEMENTS = [
  {id:'a1', n:'First Cast',    i:'🎣', d:'Tangkap ikan pertama',      ty:'total',  tg:1,    rw:{coins:100}},
  {id:'a2', n:'100 Tangkap',   i:'💯', d:'Total 100 ikan',            ty:'total',  tg:100,  rw:{coins:1000,gems:3}},
  {id:'a3', n:'Combo x5',      i:'🔥', d:'Combo 5 berturut',          ty:'combo',  tg:5,    rw:{coins:500,gems:1}},
  {id:'a4', n:'Combo x10',     i:'⚡', d:'Combo 10 berturut!',        ty:'combo',  tg:10,   rw:{coins:2000,gems:5}},
  {id:'a5', n:'Monster Fish',  i:'🏆', d:'Tangkap ikan 100kg+',       ty:'heavy',  tg:100,  rw:{coins:3000,gems:5}},
  {id:'a6', n:'Mythic Rod',    i:'🌈', d:'Miliki Mythic Rod',         ty:'rod',    tg:'mythic',rw:{gems:10}},
  {id:'a7', n:'Mythic Legend', i:'🐉', d:'Tangkap 5 Mythic',         ty:'mythic', tg:5,    rw:{coins:10000,gems:20}},
  {id:'a8', n:'Daily 7 Days',  i:'📅', d:'Login 7 hari berturut',     ty:'login',  tg:7,    rw:{gems:7,coins:700}},
  {id:'a9', n:'Millionaire',   i:'💸', d:'Kumpulkan 10000 coin',      ty:'earnC',  tg:10000,rw:{gems:5}},
  {id:'a10',n:'Boss Slayer',   i:'⚔️', d:'Kalahkan 3 Boss',           ty:'bosses', tg:3,    rw:{coins:5000,gems:8}},
  {id:'a11',n:'Mutation!',     i:'✨', d:'Tangkap ikan mutasi',        ty:'mut',    tg:1,    rw:{coins:800,gems:2}},
  {id:'a12',n:'Map Explorer',  i:'🗺️', d:'Unlock 3 lokasi baru',      ty:'maps',   tg:3,    rw:{coins:1500,gems:3}},
  {id:'a13',n:'Tournament Win',i:'🥇', d:'Menang turnamen',           ty:'tournW', tg:1,    rw:{gems:10,coins:3000}},
  {id:'a14',n:'Secret Fish',   i:'🌑', d:'Tangkap ikan rahasia',      ty:'secret', tg:1,    rw:{coins:20000,gems:30}},
];
const LB_NPC = [
  {n:'Gileg Pro',    catch:280,coin:52000,heavy:290,boss:6},
  {n:'Sultan Mancing',catch:210,coin:61000,heavy:305,boss:9},
  {n:'Ikan Legend',  catch:175,coin:38000,heavy:220,boss:4},
  {n:'CryptoFisher', catch:145,coin:29000,heavy:185,boss:3},
  {n:'MythicHunter', catch:95, coin:22000,heavy:155,boss:2},
];
const XPT = [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6200,7600,9200,11000,13200,15700,18500,21600,25000,30000,40000,55000];
const BOOK_REWARDS = [
  {cat:'Common',   need:6,  rw:{coins:300},  claimed:false},
  {cat:'Uncommon', need:6,  rw:{coins:600},  claimed:false},
  {cat:'Rare',     need:5,  rw:{gems:3,coins:500}, claimed:false},
  {cat:'Epic',     need:4,  rw:{gems:5,coins:1000},claimed:false},
  {cat:'Legendary',need:3,  rw:{gems:10,coins:3000},claimed:false},
  {cat:'Mythic',   need:4,  rw:{gems:20,coins:8000},claimed:false},
  {cat:'Secret',   need:3,  rw:{gems:30,coins:20000},claimed:false},
];

/* ══════════════════ STATE ══════════════════ */
let G = {
  playerName:'Gileg', coins:0, gems:0, xp:0, level:1, rodFragments:0,
  rodId:'bamboo', baitId:'worm', activeSkin:null, ownedSkins:[],
  ownedRods:['bamboo'], ownedBaits:{worm:999},
  activePet:null, ownedPets:[],
  boosters:{}, skills:{points:0}, inventory:{}, mutationCaught:{},
  tradeCDs:{}, dailyClaimed:{}, drLastDate:null, loginStreak:0,
  currentMap:'river', currentSpot:'shallow',
  weatherId:'sunny', weatherEnd:0,
  activeEvent:null, eventEnd:0, dayTime:'day',
  combo:0, bestCombo:0,
  totalCaught:0, totalCoins:0, legendaryCount:0, mythicCount:0,
  heaviestCatch:0, bossKills:0, exchanges:0, mutCount:0, secretCount:0,
  tournWins:0, mapsUnlocked:['river'],
  bookRewardsClaimed:{}, sfx:true,
  mgHold:false, // shared hold state
};
function saveG(){try{localStorage.setItem('figv7',JSON.stringify(G));}catch(e){}}
function loadG(){try{const s=localStorage.getItem('figv7');if(s){const d=JSON.parse(s);Object.assign(G,d);}}catch(e){}}

/* ══════════════════ CANVAS / SCENE ══════════════════ */
const WORLD_SCALE = 2.4;
let scene = null, viewX = 0;

class FishScene {
  constructor(cv){
    this.cv=cv; this.ctx=cv.getContext('2d');
    this.W=0; this.H=0; this.wW=0; this.t=0;
    this.waterY=0; this.bobber={vis:false,biting:false,x:0,y:0,rpl:0};
    this.flyBob={active:false,x:0,y:0};
    this.fishes=[]; this.fx=[]; this.uwPlants=[]; this.bubbles=[];
    this.spawnTimer=null; this.running=false;
    this.onBite=null; this.onCastDone=null;
  }
  resize(W,H){
    const dpr=window.devicePixelRatio||1;
    this.W=W; this.H=H; this.wW=W*WORLD_SCALE;
    this.cv.width=this.wW*dpr; this.cv.height=H*dpr;
    this.cv.style.width=this.wW+'px'; this.cv.style.height=H+'px';
    this.ctx.scale(dpr,dpr);
    this.waterY=H*.52;
    this._buildUWPlants();
    this._buildSpotOverlay();
  }
  _buildUWPlants(){
    this.uwPlants=[];
    for(let i=0;i<14;i++){
      this.uwPlants.push({x:Math.random()*this.wW, h:18+Math.random()*30, ph:Math.random()*6, col:i%3===0?'#1a6a2a':i%3===1?'#2a8a3a':'#0d4a1a'});
    }
  }
  _buildSpotOverlay(){
    const cont=document.getElementById('spot-overlay');if(!cont)return;
    const ww=document.getElementById('world-wrap');const wwW=ww?ww.clientWidth:320;
    cont.innerHTML='';
    const SPOTS=[
      {id:'shallow',n:'🌿 Shallow',  fx:.12},
      {id:'deep',   n:'🌊 Deep',     fx:.38},
      {id:'rocky',  n:'🪨 Rock',     fx:.62},
      {id:'current',n:'💨 Current',  fx:.84},
    ];
    SPOTS.forEach(sp=>{
      const el=document.createElement('div');
      el.className='spot-pill'+(G.currentSpot===sp.id?' sel':'');
      el.textContent=sp.n; el.style.left=(sp.fx*this.wW-44)+'px'; el.style.top='8px';
      el.style.position='absolute'; el.style.pointerEvents='none';
      cont.appendChild(el);
    });
  }
  start(){if(this.running)return;this.running=true;this._loop();}
  stop(){this.running=false;}
  _loop(){if(!this.running)return;this.t+=.016;this._draw();requestAnimationFrame(()=>this._loop());}

  // Map-aware spot detection
  spotAt(vx){
    const SPOTS=[{id:'shallow',fx:.12},{id:'deep',fx:.38},{id:'rocky',fx:.62},{id:'current',fx:.84}];
    const f=(vx+this.W*.5)/this.wW;
    return SPOTS.reduce((b,s)=>Math.abs(s.fx-f)<Math.abs(b.fx-f)?s:b,SPOTS[0]);
  }

  doCast(){
    this.fishes=[]; this.fx=[]; this.bobber.vis=false; this.bobber.biting=false;
    clearInterval(this.spawnTimer);
    const sp=this.spotAt(viewX); G.currentSpot=sp.id; this._buildSpotOverlay();
    const bx=viewX+this.W*(.18+Math.random()*.35);
    const sx=viewX+this.W*.84, sy=this.waterY*.3;
    const ey=this.waterY, dur=700, t0=performance.now();
    this.flyBob={active:true,x:sx,y:sy};
    const fly=now=>{
      const p=Math.min((now-t0)/dur,1), ep=p<.5?2*p*p:-1+(4-2*p)*p;
      this.flyBob.x=sx+(bx-sx)*ep; this.flyBob.y=sy+(ey-sy)*ep-Math.sin(p*Math.PI)*70;
      if(p<1){requestAnimationFrame(fly);return;}
      this.flyBob.active=false; this.bobber.vis=true; this.bobber.x=bx; this.bobber.y=ey; this.bobber.rpl=1;
      this._splash(bx,ey,14); playSFX('splash');
      if(this.onCastDone)this.onCastDone();
    };
    requestAnimationFrame(fly); playSFX('cast');
  }

  _startSpawnLoop(){
    clearInterval(this.spawnTimer);
    const bait=BAITS.find(b=>b.id===G.baitId)||BAITS[0];
    const skSpeed=1-Math.min((G.skills.speed||0)*.08,.4);
    const wt=(bait.wMin+Math.random()*(bait.wMax-bait.wMin))*skSpeed;
    let n=0;
    this.spawnTimer=setInterval(()=>{
      this._spawnAmbFish(); n++;
      if(n===1+~~(Math.random()*2)){
        setTimeout(()=>{if(this.onBite&&phase==='wait')this.onBite();},wt);
      }
      if(n>=5)clearInterval(this.spawnTimer);
    },900+Math.random()*600);
    this._spawnAmbFish();
  }

  doCatch(){
    this._splash(this.bobber.x,this.waterY,24); this._bubs(this.bobber.x,this.waterY,12);
    this.bobber.vis=false; this.bobber.biting=false;
    this.fishes=[]; clearInterval(this.spawnTimer); playSFX('catch');
  }
  doReset(){
    clearInterval(this.spawnTimer); this.fishes=[]; this.fx=[];
    this.bobber.vis=false; this.bobber.biting=false; this.flyBob.active=false;
  }
  doFishJump(ico){
    const x=this.bobber.x,wy=this.waterY;
    let vy=-9, vx=(Math.random()-.5)*3;
    const f={x,y:wy,vy,vx,ico,sz:30,glow:true,dead:false,isJ:true};
    this.fishes.push(f);
    let s=0;
    const go=()=>{s++;f.vy+=.55;f.y+=f.vy;f.x+=f.vx;
      if(s<5)this._splash(f.x,wy,4);
      if(f.y>this.H+40||s>50)f.dead=true; else requestAnimationFrame(go);};
    requestAnimationFrame(go);
  }
  doSecretFlash(){
    // Screen shake + light effect for secret fish
    const el=document.getElementById('secret-alert');
    if(el){el.classList.remove('hidden');setTimeout(()=>el.classList.add('hidden'),2500);}
    doShake(4);
    // Lightning flash
    for(let i=0;i<3;i++){
      this.fx.push({tp:'flash',x:this.bobber.x||this.wW/2,y:this.waterY,r:80+i*30,life:1-i*.3,rg:false,vx:0,vy:0,col:'rgba(200,100,255,.4)'});
    }
  }

  _draw(){
    const ctx=this.ctx, W=this.wW, H=this.H, wy=this.waterY;
    // Sky gradient (map-aware)
    const map=MAPS.find(m=>m.id===G.currentMap)||MAPS[0];
    const skyG=ctx.createLinearGradient(0,0,0,wy);
    if(G.dayTime==='night'){skyG.addColorStop(0,'#020818');skyG.addColorStop(1,'#041230');}
    else{const c1=map.id==='arctic'?'#aaccff':map.id==='deepsea'?'#220040':'#55aacc';
      skyG.addColorStop(0,c1);skyG.addColorStop(1,'#cceefc');}
    ctx.fillStyle=skyG; ctx.fillRect(0,0,W,wy);

    // Water gradient
    const waterG=ctx.createLinearGradient(0,wy,0,H);
    waterG.addColorStop(0,map.water||'#0099dd');
    waterG.addColorStop(.5,'#003388'); waterG.addColorStop(1,'#001122');
    ctx.fillStyle=waterG; ctx.fillRect(0,wy,W,H-wy);

    // Night overlay
    if(G.dayTime==='night'){ctx.save();ctx.globalAlpha=.42;ctx.fillStyle='#000022';ctx.fillRect(0,0,W,H);ctx.restore();}

    // Celestial body
    if(G.dayTime==='night'){
      ctx.save();ctx.beginPath();ctx.arc(W*.08,wy*.2,16,0,Math.PI*2);
      ctx.fillStyle='#eeeeff';ctx.shadowBlur=20;ctx.shadowColor='#8888ff';ctx.fill();ctx.restore();
      // Stars
      ctx.fillStyle='rgba(255,255,220,.65)';
      for(let i=0;i<20;i++){const sx=(W*.02+i*W*.048)%W,sy=((i*53+7)%(wy*.75));ctx.beginPath();ctx.arc(sx,sy,1,0,Math.PI*2);ctx.fill();}
    }else{
      ctx.save();ctx.beginPath();ctx.arc(W*.07,wy*.2,22,0,Math.PI*2);
      ctx.fillStyle=map.id==='arctic'?'#ddeeff':'#ffee44';
      ctx.shadowBlur=32;ctx.shadowColor=map.id==='arctic'?'rgba(200,220,255,.7)':'rgba(255,220,0,.7)';ctx.fill();ctx.restore();
    }

    this._drawClouds(ctx,W,wy);
    this._drawDecor(ctx,W,H,wy);
    this._drawWaves(ctx,W,wy);
    this._drawUWLife(ctx,W,H,wy);

    // Fish
    this.fishes=this.fishes.filter(f=>!f.dead);
    this.fishes.forEach(f=>{
      if(!f.isJ){f.x+=f.vx;f.y+=Math.sin(this.t*f.fr+f.ph)*f.amp;if(f.x>W+80||f.x<-80)f.dead=true;}
      if(!f.dead)this._drawFish(ctx,f);
    });

    // FX
    this.fx=this.fx.filter(e=>e.life>0);
    this.fx.forEach(e=>{e.life-=.025;if(e.rg&&e.r)e.r+=.8;e.x+=e.vx||0;e.y+=e.vy||0;if(e.tp==='p')e.vy+=.06;if(e.tp==='b')e.vy-=.04;this._drawFX(ctx,e);});

    // Rod
    const rx=viewX+this.W*.84;
    this._drawRod(ctx,rx,wy);

    // Line
    if(this.bobber.vis){
      const by=this.bobber.biting?wy+9+Math.sin(this.t*6)*4:wy+Math.sin(this.t*2.5)*3;
      ctx.beginPath();ctx.moveTo(rx,wy*.28);ctx.lineTo(this.bobber.x,by);
      ctx.strokeStyle=this.bobber.biting?'rgba(255,130,0,.92)':'rgba(255,255,255,.5)';
      ctx.lineWidth=this.bobber.biting?2.5:1.2;ctx.stroke();
    }
    if(this.flyBob.active)this._drawBobber(ctx,this.flyBob.x,this.flyBob.y);
    if(this.bobber.vis){
      const by=this.bobber.biting?wy+9+Math.sin(this.t*6)*4:wy+Math.sin(this.t*2.5)*3;
      this._drawBobber(ctx,this.bobber.x,by);
      if(this.bobber.rpl>0){this.bobber.rpl-=.018;this._drawRipple(ctx,this.bobber.x,wy,this.bobber.rpl*28,this.bobber.rpl*.5);}
    }
    // Skin glow on rod
    const skin=SKINS.find(s=>s.id===G.activeSkin);
    if(skin){ctx.save();ctx.shadowBlur=18;ctx.shadowColor=skin.glow;ctx.strokeStyle=skin.glow;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(rx,wy*.28);ctx.lineTo(rx,wy*.28-38);ctx.stroke();ctx.restore();}
  }

  _drawClouds(ctx,W,wy){
    [[W*.05,wy*.28],[W*.28,wy*.17],[W*.55,wy*.31],[W*.82,wy*.14]].forEach(([cx,cy],i)=>{
      const ox=Math.sin(this.t*.065+i)*W*.045;
      ctx.save();ctx.globalAlpha=G.weatherId==='fog'?.7:.45;
      ctx.fillStyle=G.dayTime==='night'?'rgba(180,180,230,.55)':G.weatherId==='storm'?'#667':'#fff';
      const x=cx+ox;ctx.beginPath();ctx.arc(x,cy,12,0,Math.PI*2);ctx.arc(x+14,cy-3,9,0,Math.PI*2);ctx.arc(x+27,cy,11,0,Math.PI*2);ctx.fill();ctx.restore();
    });
  }
  _drawDecor(ctx,W,H,wy){
    // Trees
    [[W*.04,wy],[W*.18,wy],[W*.92,wy],[W*1.18,wy]].forEach(([x,y])=>{
      ctx.fillStyle='#6B3A1F';ctx.fillRect(x-3,y-18,6,18);
      ctx.beginPath();ctx.arc(x,y-22,13,0,Math.PI*2);ctx.fillStyle='#2d6e2d';ctx.fill();
      ctx.beginPath();ctx.arc(x,y-32,9,0,Math.PI*2);ctx.fillStyle='#3a8a3a';ctx.fill();
    });
    // Rocks
    [[W*.62,wy+4],[W*.66,wy+2],[W*.70,wy+5]].forEach(([x,y])=>{
      ctx.beginPath();ctx.ellipse(x,y,13,7,0,0,Math.PI*2);ctx.fillStyle='#778';ctx.fill();
      ctx.beginPath();ctx.ellipse(x,y-2,11,5,0,0,Math.PI*2);ctx.fillStyle='#aab';ctx.fill();
    });
    // Duck
    const dx=W*.14+Math.sin(this.t*.32)*W*.02;
    ctx.font='14px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🦆',dx,wy-6);
    // Log
    const lx=(W*.42+this.t*6)%(W*.6)+W*.12;
    ctx.save();ctx.translate(lx,wy+Math.sin(this.t*.8)*2);ctx.fillStyle='#7B4B2A';ctx.fillRect(-22,-4,44,8);ctx.restore();
    // Turtle
    const tx=W*.56+Math.sin(this.t*.22)*W*.03;
    ctx.fillText('🐢',tx,wy-4);
  }
  _drawWaves(ctx,W,wy){
    ctx.beginPath();ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;
    for(let x=0;x<=W;x+=3){const y=wy+Math.sin(x*.022+this.t*2)*3+Math.sin(x*.05+this.t*1.5)*1.5;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.stroke();
    // Second wave
    ctx.beginPath();ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;
    for(let x=0;x<=W;x+=4){const y=wy+3+Math.sin(x*.032+this.t*1.8)*2;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.stroke();
  }
  _drawUWLife(ctx,W,H,wy){
    // Seaweed (Feature #19: Underwater Life)
    this.uwPlants.forEach((p,i)=>{
      const sw=Math.sin(this.t*1.4+p.ph)*8;
      ctx.beginPath();ctx.moveTo(p.x,H);ctx.quadraticCurveTo(p.x+sw,H-p.h*.5,p.x+sw*1.5,H-p.h);
      ctx.strokeStyle=p.col;ctx.lineWidth=3.5;ctx.lineCap='round';ctx.stroke();
      ctx.beginPath();ctx.arc(p.x+sw*1.5,H-p.h,4,0,Math.PI*2);ctx.fillStyle='#2a8a3a';ctx.fill();
    });
    // Bubbles (Feature #19)
    if(Math.random()<.04){
      this.fx.push({tp:'b',x:Math.random()*W,y:H,vy:-(0.4+Math.random()*.6),vx:(Math.random()-.5)*.3,r:2+Math.random()*3,life:1,rg:false});
    }
    // Deep sea glow
    if(G.currentMap==='deepsea'){
      ctx.save();ctx.globalAlpha=.08;
      const grd=ctx.createRadialGradient(this.bobber.x||W/2,wy+20,5,this.bobber.x||W/2,wy+20,80);
      grd.addColorStop(0,'rgba(120,0,200,.4)');grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd;ctx.fillRect(0,wy,W,H-wy);ctx.restore();
    }
  }
  _drawRod(ctx,rx,wy){
    ctx.beginPath();ctx.moveTo(rx,wy*.28-38);ctx.lineTo(rx,wy*.28);
    const rg=ctx.createLinearGradient(rx,wy*.28-38,rx,wy*.28);rg.addColorStop(0,'#5c2a0f');rg.addColorStop(1,'#C8A060');
    ctx.strokeStyle=rg;ctx.lineWidth=4.5;ctx.lineCap='round';ctx.stroke();
  }
  _drawBobber(ctx,x,y){
    ctx.beginPath();ctx.arc(x,y-4,6,Math.PI,0);ctx.fillStyle=this.bobber.biting?'#ff7700':'#e74c3c';ctx.fill();
    ctx.beginPath();ctx.arc(x,y+2,6,0,Math.PI);ctx.fillStyle='#fff';ctx.fill();
    ctx.fillStyle='#555';ctx.fillRect(x-6,y-1,12,2);
    if(this.bobber.biting){ctx.save();ctx.shadowBlur=16;ctx.shadowColor='#ff6600';ctx.beginPath();ctx.arc(x,y-1,7,0,Math.PI*2);ctx.strokeStyle='rgba(255,130,0,.65)';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();}
  }
  _drawRipple(ctx,x,y,r,a){if(r<1)return;ctx.beginPath();ctx.arc(x,y+2,r,0,Math.PI*2);ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=1.5;ctx.stroke();}
  _drawFish(ctx,f){
    ctx.save();ctx.translate(f.x,f.y);
    if(f.vx<0||f.isJ)ctx.scale(-1,1);
    if(f.glow||f.mut){ctx.shadowBlur=f.mut?22:(f.rarity==='Mythic'?20:f.rarity==='Legendary'?14:7);ctx.shadowColor=f.mutCol||f.gc||'#ffe144';}
    if(f.mut==='ghost')ctx.globalAlpha=.5;
    if(f.mut==='rainbow'){const t=Date.now()/400;ctx.shadowColor=`hsl(${~~(t*60)%360},100%,60%)`;}
    ctx.font=`${f.sz||17}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(f.ico||'🐟',0,0);
    ctx.restore();
  }
  _drawFX(ctx,e){
    if(e.life<=0)return;ctx.save();ctx.globalAlpha=Math.max(0,e.life);
    if(e.tp==='p'){ctx.beginPath();ctx.arc(e.x,e.y,Math.max(.1,e.r),0,Math.PI*2);ctx.fillStyle=e.col||'#7fd8f8';ctx.fill();}
    else if(e.tp==='b'){ctx.beginPath();ctx.arc(e.x,e.y,Math.max(.1,e.r),0,Math.PI*2);ctx.strokeStyle='rgba(180,220,255,.7)';ctx.lineWidth=1;ctx.stroke();}
    else if(e.tp==='s'){ctx.beginPath();ctx.arc(e.x,e.y,Math.max(.1,e.r),0,Math.PI*2);ctx.fillStyle='rgba(130,200,255,.5)';ctx.fill();}
    else if(e.tp==='flash'){ctx.beginPath();ctx.arc(e.x,e.y,Math.max(.1,e.r),0,Math.PI*2);ctx.fillStyle=e.col||'rgba(200,100,255,.3)';ctx.fill();}
    ctx.restore();
  }
  _splash(x,y,n=12){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*3;this.fx.push({tp:'p',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2.8,r:1.5+Math.random()*2.5,life:.7+Math.random()*.35,col:'#7fd8f8'});}}
  _bubs(x,y,n=6){for(let i=0;i<n;i++)this.fx.push({tp:'b',x:x+(Math.random()-.5)*20,y:y+5,vy:-(0.3+Math.random()*.55),vx:(Math.random()-.5)*.2,r:2+Math.random()*3.5,life:.85+Math.random()*.4,rg:false});}
  _spawnAmbFish(){
    const go=Math.random()>.5,sp=(.4+Math.random()*.9)*(go?1:-1);
    const rar=['Common','Uncommon','Rare'][~~(Math.random()*3)];
    const imap={Common:'🐟',Uncommon:'🐠',Rare:'🐡'};
    const gc={Common:'#aaddff',Uncommon:'#4499ff',Rare:'#aa55ff'};
    this.fishes.push({x:go?-50:this.wW+50,y:this.waterY+16+Math.random()*(this.H-this.waterY-32),vx:sp,fr:1+Math.random()*2,ph:Math.random()*6,amp:1.5+Math.random()*2.2,ico:imap[rar],sz:14+Math.random()*9,glow:rar==='Rare',gc:gc[rar],rarity:rar,dead:false});
  }
  spawnGlowFish(ico,rar,col){
    const go=Math.random()>.5,sp=(.8+Math.random()*.9)*(go?1:-1);
    this.fishes.push({x:go?-60:this.wW+60,y:this.waterY+8,vx:sp,fr:2.8,ph:0,amp:.6,ico,sz:22,glow:true,gc:col||'#ffe144',rarity:rar,dead:false});
  }
}

/* ══════════════════ RATES & UTILS ══════════════════ */
function calcRates(){
  const r={...BASE_RATES};
  const rod=RODS.find(x=>x.id===G.rodId)||RODS[0];
  const bait=BAITS.find(b=>b.id===G.baitId)||BAITS[0];
  const map=MAPS.find(m=>m.id===G.currentMap)||MAPS[0];
  const sp=_spotRates();
  const pet=G.activePet?PETS_D.find(p=>p.id===G.activePet):null;
  const wt=WEATHERS.find(w=>w.id===G.weatherId)||WEATHERS[0];
  const sk=(G.skills.luck||0)*2;
  const lv=G.level;const lb=lv>=25?12:lv>=21?10:lv>=15?7:lv>=10?5:lv>=6?3:0;
  r.Common=Math.max(0,r.Common-lb-sk);r.Rare+=lb*.4+sk*.3;r.Epic+=lb*.3+sk*.2;r.Legendary+=lb*.2+sk*.1;r.Mythic+=lb*.1;
  applyB(r,rod.rb||{});applyB(r,bait.rb||{});if(pet)applyB(r,pet.bn||{});
  applyNoRed(r,map.bn||{});applyNoRed(r,sp||{});applyNoRed(r,wt.rb||{});
  if(G.activeEvent&&Date.now()<G.eventEnd){const ev=EVENTS_DATA.find(e=>e.n===G.activeEvent);if(ev)applyNoRed(r,ev.rb||{});}
  const tot=Object.values(r).reduce((a,b)=>a+b,0)||1;
  const n={};for(const[k,v]of Object.entries(r))n[k]=(v/tot)*100;return n;
}
function _spotRates(){
  const SPOT_RB={
    shallow:{Common:15}, deep:{Rare:5,Epic:3}, rocky:{Rare:8,Epic:4}, current:{Legendary:4,Mythic:2}
  };return SPOT_RB[G.currentSpot]||{};}
function applyB(r,b){for(const[k,v]of Object.entries(b)){r[k]=(r[k]||0)+v;r.Common=Math.max(0,r.Common-v);}}
function applyNoRed(r,b){for(const[k,v]of Object.entries(b))r[k]=(r[k]||0)+v;}
function pickRar(){
  const rt=calcRates();let roll=Math.random()*100,cum=0;
  for(const rr of['Mythic','Legendary','Epic','Rare','Uncommon','Common']){cum+=rt[rr]||0;if(roll<=cum)return rr;}
  return 'Common';
}
function pickFish(rar){const p=FISH[rar];return p[~~(Math.random()*p.length)];}
function rollWt(rar){const[mn,mx]=WR[rar];return+(mn+Math.random()*(mx-mn)).toFixed(1);}
function sizeLabel(kg){return kg<2?'Kecil':kg<10?'Sedang':kg<50?'Besar':'Monster';}
function calcCoinValue(fish,rar,wt,mutation){
  const[mn,mx]=WR[rar];const wf=1+(wt-mn)/(mx-mn+.01);
  const pet=G.activePet?PETS_D.find(p=>p.id===G.activePet):null;
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
  const cm=(pet?pet.cm:1)*((G.skills.coinb||0)*.1+1)*(G.boosters.coin2>0?2:1);
  const mutMul=mutation?MUTATIONS.find(m=>m.id===mutation)?.mul||1:1;
  return ~~(fish.bv*wf*RM[rar]*cm*.25*mutMul*rod.xm);
}
function tryMutation(rar){
  if(rar==='Common'&&Math.random()>.3)return null;
  for(const m of MUTATIONS){if(Math.random()<m.prob)return m.id;}
  return null;
}
function checkSecretFish(rar){
  if(rar!=='Mythic')return null;
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
  const rodOrder=['bamboo','iron','carbon','titanium','mythic'];
  for(const sf of SECRET_FISH){
    const minIdx=rodOrder.indexOf(sf.minRod),curIdx=rodOrder.indexOf(rod.id);
    if(curIdx>=minIdx&&Math.random()<sf.prob)return sf;
  }
  return null;
}
function countR(rar){return Object.entries(G.inventory).reduce((s,[id,inv])=>{const f=FISH[rar]?.find(x=>x.id===id);return f?s+(typeof inv==='object'?inv.count:inv)||0:s;},0);}
function removeR(rar,n){let rem=n;for(const f of(FISH[rar]||[])){if(rem<=0)break;const inv=G.inventory[f.id];if(!inv)continue;const c=typeof inv==='object'?inv.count:inv;const take=Math.min(rem,c);if(typeof G.inventory[f.id]==='object')G.inventory[f.id].count-=take;else G.inventory[f.id]-=take;if((typeof G.inventory[f.id]==='object'?G.inventory[f.id].count:G.inventory[f.id])<=0)delete G.inventory[f.id];rem-=take;}}
function addBait(id,q){G.ownedBaits[id]=(G.ownedBaits[id]||0)+q;}
function fmt(n){n=Math.floor(n||0);if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return''+n;}

/* ══════════════════ FISHING STATE MACHINE ══════════════════ */
const PHASES=['idle','cast','wait','bite','reel','chest','chest-open','bottle','bottle-open','boss','break','miss','result','tourn-active'];
let phase='idle', pending=null, biteTimer=null, biteInt=null;
let mgInt=null, mgCursor=50, mgCatchPct=0, mgFishDir=1, mgFishPwr=0, mgOutTime=0, mgZL=22, mgZW=56;
let _waitArcIv=null;

function setPhase(ph){
  phase=ph;
  PHASES.forEach(p=>{
    const id=p.replace(/-/g,'-');
    const el=document.getElementById('st-'+id);if(!el)return;
    if(p===ph){el.classList.remove('hidden');el.classList.add('active');}
    else{el.classList.add('hidden');el.classList.remove('active');}
  });
}
function resetToIdle(){if(scene)scene.doReset();setTxt('res-bonus','');setPhase('idle');}

function doCast(){
  if(phase!=='idle')return;
  setPhase('cast');
  if(!scene)return;
  scene.onCastDone=()=>{
    setPhase('wait');_startWaitArc();scene._startSpawnLoop();
    setTimeout(()=>{if(phase==='wait')checkRareSpawn();},5000+Math.random()*5000);
  };
  scene.onBite=onBite;
  scene.doCast();
}
function doCancel(){
  clearTimeout(biteTimer);clearInterval(biteInt);clearInterval(mgInt);
  _stopWaitArc();if(scene)scene.doReset();setPhase('idle');
}
function onBite(){
  if(phase!=='wait')return;_stopWaitArc();
  const roll=Math.random();
  // Treasure chest 8%, Bottle 5%
  if(roll<.08){pending={type:'chest'};_biteSetup();showRN('📦 Peti Harta!','📦');return;}
  if(roll<.13){pending={type:'bottle'};_biteSetup();showRN('🍾 Botol Misterius!','🍾');return;}
  const rar=pickRar();
  // Check secret fish first
  const secret=checkSecretFish(rar);
  if(secret){
    pending={type:'secret',fish:secret,rar:secret.rar,wt:rollWt(secret.rar)*2};
    _biteSetup();
    setTxt('secret-ico',secret.i);setTxt('secret-txt',secret.n+' TERDETEKSI!');
    const sa=document.getElementById('secret-alert');if(sa)sa.classList.remove('hidden');
    setTimeout(()=>{const sa2=document.getElementById('secret-alert');if(sa2)sa2.classList.add('hidden');},2500);
    if(scene){scene.doSecretFlash();scene.spawnGlowFish(secret.i,'Mythic','rgba(200,0,200,.8)');}
    setTxt('msec-i',secret.i);setTxt('msec-t',secret.n+' TERDETEKSI!');setTxt('msec-d','Rod '+RODS.find(r=>r.id===G.rodId)?.n+' dapat menangkapnya!');
    openModal('mod-secret');showRN(secret.i+' '+secret.n+'!','🌑');return;
  }
  const fish=pickFish(rar),wt=rollWt(rar);
  const mutation=tryMutation(rar);
  pending={type:'fish',rar,fish,wt,mutation};
  if(scene){const gc={Rare:'#aa55ff',Epic:'#ffaa00',Legendary:'#ff3344',Mythic:'#ff44ff'};if(rar!=='Common'&&rar!=='Uncommon')scene.spawnGlowFish(fish.i,rar,gc[rar]);}
  _biteSetup();
  const rarIcons={Rare:'🌟',Epic:'🔥',Legendary:'⭐',Mythic:'🌈'};
  if(['Rare','Epic','Legendary','Mythic'].includes(rar))showRN(fish.i+' '+rar+': '+fish.n+'!',rarIcons[rar]||'✨');
  if(mutation)showRN('✨ MUTASI: '+fish.n+'!','✨');
  if(mutation){const mh=document.getElementById('mutation-hint');if(mh)mh.classList.remove('hidden');}
}
function _biteSetup(){
  setPhase('bite');if(scene){scene.bobber.biting=true;scene.bobber.rpl=1.2;}
  playSFX('bite');_startBiteCD();biteTimer=setTimeout(onMiss,3400);
}
function doPull(){
  if(phase!=='bite')return;
  clearTimeout(biteTimer);clearInterval(biteInt);
  if(scene)scene.bobber.biting=false;
  const pt=pending?.type;
  if(pt==='chest'){pending=null;setPhase('chest');_showChest();return;}
  if(pt==='bottle'){pending=null;setPhase('bottle');return;}
  if(pt==='boss'){setPhase('boss');_startBoss();return;}
  if(pt==='secret'){
    const{fish,rar,wt}=pending;const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
    const strB=(G.skills.str||0)*12;
    if(wt>rod.maxKg+strB){setPhase('break');setTxt('break-sub',fish.n+' terlalu kuat! Rod '+rod.n+'!');if(scene)scene.doReset();G.combo=0;pending=null;return;}
    reelPct_=0;setPhase('reel');_setupMG(fish,rar,wt,null);return;
  }
  const{rar,fish,wt,mutation}=pending;
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];const strB=(G.skills.str||0)*12;
  if(wt>rod.maxKg+strB){setPhase('break');setTxt('break-sub',fish.n+' '+wt+'kg > max '+(rod.maxKg+strB)+'kg');if(scene)scene.doReset();playSFX('break');G.combo=0;pending=null;return;}
  _setupMG(fish,rar,wt,mutation);
}
let reelPct_=0;
function _setupMG(fish,rar,wt,mutation){
  setPhase('reel');const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];const strB=(G.skills.str||0)*12;
  const ratio=wt/(rod.maxKg+strB+.01);
  setTxt('mg-ico',fish.i||fish.ico);setTxt('mg-wt',wt+'kg');
  const rr=document.getElementById('mg-rar');if(rr){rr.textContent=rar.toUpperCase();rr.className='mg-rar rar-'+rar;}
  const mh=document.getElementById('mutation-hint');if(mh)mh.classList.toggle('hidden',!mutation);
  reelPct_=0;mgCursor=50;mgCatchPct=0;mgOutTime=0;mgFishDir=1;
  mgFishPwr=.7+ratio*2.5;mgZW=Math.max(20,58-ratio*32);mgZL=Math.max(6,50-mgZW/2);
  const gz=document.getElementById('mg-zone');if(gz){gz.style.left=mgZL+'%';gz.style.width=mgZW+'%';}
  const dl=document.getElementById('mg-dl'),dr=document.getElementById('mg-dr');
  if(dl)dl.style.width=mgZL+'%';if(dr)dr.style.width=(100-mgZL-mgZW)+'%';
  clearInterval(mgInt);mgInt=setInterval(_mgTick,40);playSFX('reel');
}
function _mgTick(){
  if(!mgInt||phase!=='reel'){clearInterval(mgInt);return;}
  const pull=mgFishPwr*(Math.random()<.016?-mgFishDir:mgFishDir)*(1+Math.random()*.5);
  mgCursor+=pull;if(Math.random()<.018)mgFishDir*=-1;
  if(G.mgHold){mgCursor+=(50-mgCursor)*.18;playSFX('reel');}
  mgCursor=Math.max(0,Math.min(100,mgCursor));
  const inZ=mgCursor>=mgZL&&mgCursor<=(mgZL+mgZW);
  const gainMul=1+(G.skills.speed||0)*.05;
  if(inZ){mgCatchPct=Math.min(100,mgCatchPct+(G.mgHold?2.8*gainMul:.55));mgOutTime=0;setTxt('mg-tension','');}
  else{mgCatchPct=Math.max(0,mgCatchPct-2.6);mgOutTime+=40;const pct=(mgCursor<mgZL?mgZL-mgCursor:mgCursor-(mgZL+mgZW))/mgZL;setTxt('mg-tension',pct>.7?'⚠️ TALI HAMPIR PUTUS!':pct>.3?'⚡ Jaga kursornya!':'');}
  const cur=document.getElementById('mg-cursor');if(cur)cur.style.left=(mgCursor-3.5)+'%';
  const pf=document.getElementById('mg-pf');if(pf)pf.style.width=mgCatchPct+'%';
  setTxt('mg-pct',~~mgCatchPct+'%');
  if(mgCatchPct>=100){clearInterval(mgInt);mgInt=null;setTimeout(onCatch,100);}
  if(mgOutTime>=2800){clearInterval(mgInt);mgInt=null;setTxt('break-sub','Tali putus! Ikan kabur!');if(scene)scene.doReset();G.combo=0;pending=null;setPhase('break');}
}
function onMiss(){if(phase!=='bite')return;clearInterval(biteInt);clearInterval(mgInt);if(scene){scene.bobber.biting=false;scene.doReset();}G.combo=0;pending=null;setPhase('miss');playSFX('miss');}
function onCatch(){
  if(!pending?.fish&&!pending?.type==='fish'){}
  if(!pending)return;
  const{rar,fish,wt,mutation,type}=pending||{};
  if(!fish)return;
  pending=null;clearInterval(mgInt);mgInt=null;
  const isSecret=type==='secret';
  const val=calcCoinValue(fish,rar,wt,mutation);
  const xpBase={Common:10,Uncommon:22,Rare:45,Epic:90,Legendary:220,Mythic:550};
  const pet=G.activePet?PETS_D.find(p=>p.id===G.activePet):null;
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
  const xm=(pet?pet.xm:1)*((G.skills.xpb||0)*.15+1)*(G.boosters.xp2>0?2:1);
  const xp=~~((xpBase[rar]||10)*xm*(isSecret?5:1));
  const gems=rar==='Epic'?1:rar==='Legendary'?3:rar==='Mythic'?(isSecret?25:10):0;
  const frags=rar==='Rare'?1:rar==='Epic'?2:rar==='Legendary'?3:rar==='Mythic'?(isSecret?15:5):0;
  const fishId=fish.id||fish.n;
  G.inventory[fishId]=G.inventory[fishId]||{count:0,totalWeight:0,maxWt:0};
  G.inventory[fishId].count++;G.inventory[fishId].totalWeight=+(G.inventory[fishId].totalWeight+(wt||0)).toFixed(1);
  G.inventory[fishId].maxWt=Math.max(G.inventory[fishId].maxWt||0,wt||0);
  if(mutation){G.mutationCaught[fishId+'_'+mutation]=(G.mutationCaught[fishId+'_'+mutation]||0)+1;}
  G.totalCaught++;G.coins+=val;G.gems+=gems;G.rodFragments+=frags;G.totalCoins+=val;
  if(G.boosters.xp2>0)G.boosters.xp2--;if(G.boosters.coin2>0)G.boosters.coin2--;
  if(rar==='Legendary'||rar==='Mythic')G.legendaryCount++;if(rar==='Mythic')G.mythicCount++;
  if(wt>G.heaviestCatch)G.heaviestCatch=+wt;
  if(mutation)G.mutCount=(G.mutCount||0)+1;if(isSecret)G.secretCount=(G.secretCount||0)+1;
  G.combo++;if(G.combo>G.bestCombo)G.bestCombo=G.combo;
  // Tournament tracking
  if(tournActive&&wt>tournBestWt){tournBestWt=wt;tournBestFish=fish.i+' '+fish.n+' ('+wt+'kg)';setTxt('tourn-best',tournBestFish);}
  // Combo bonus
  const comboBonusMul=1+(G.skills.combo||0)*.05;
  const cBonus=G.combo>=10?~~(val*.5*comboBonusMul):G.combo>=5?~~(val*.2*comboBonusMul):G.combo>=3?~~(val*.1*comboBonusMul):0;
  if(cBonus>0){G.coins+=cBonus;}
  addXP(xp);checkAchs();
  if(scene){scene.doFishJump(fish.i||fish.ico);setTimeout(()=>{scene.doCatch();doShake();},300);}
  _showResult(fish,rar,wt,val,xp,gems,frags,mutation,cBonus,isSecret);updateHUD();saveG();
}

/* ══════════════════ TREASURE CHEST ══════════════════ */
let _curChest=null;
function _showChest(){
  const tier=Math.random()<.05?3:Math.random()<.2?2:Math.random()<.4?1:0;
  _curChest=CHESTS_D[tier];
  setTxt('chest-ico',_curChest.i);setTxt('chest-title',_curChest.n+'!');setTxt('chest-glow','✨ '+_curChest.n+' dari laut! ✨');
  if(scene){scene._splash(scene.bobber.x||scene.wW/2,scene.waterY,22);scene.bobber.vis=false;}
  doShake();playSFX('catch');
}
function openChest(){
  if(!_curChest)return;const rwd=_curChest.rw();
  G.coins+=rwd.coins||0;G.gems+=rwd.gems||0;G.rodFragments+=rwd.frags||0;
  if(rwd.bait)addBait(rwd.bait,rwd.bq||1);
  const oi=document.getElementById('chest-open-ico');if(oi){oi.textContent=_curChest.i;oi.style.animation='none';void oi.offsetWidth;oi.style.animation='openPop .5s cubic-bezier(.34,1.56,.64,1)';}
  setTxt('chest-open-title',_curChest.n+' Dibuka!');
  const chips=[];if(rwd.coins)chips.push('💰 +'+rwd.coins);if(rwd.gems)chips.push('💎 +'+rwd.gems);if(rwd.frags)chips.push('🔩 +'+rwd.frags);if(rwd.bait)chips.push(BAITS.find(b=>b.id===rwd.bait)?.i+' x'+(rwd.bq||1));
  // Chance for ocean skin from chest
  if(Math.random()<.15&&!G.ownedSkins.includes('ocean_sk')){G.ownedSkins.push('ocean_sk');chips.push('🌊 Ocean Skin!');}
  document.getElementById('chest-rwds').innerHTML=chips.map(c=>'<span class="crwd">'+c+'</span>').join('');
  setPhase('chest-open');playSFX('levelup');_spawnSparks('Legendary');updateHUD();saveG();
}
/* ══════════════════ MYSTERY BOTTLE (#17) ══════════════════ */
function openBottle(){
  const b=BOTTLES[~~(Math.random()*BOTTLES.length)];const rwd=b.rw();
  G.coins+=rwd.coins||0;G.gems+=rwd.gems||0;G.rodFragments+=rwd.frags||0;
  if(rwd.bait)addBait(rwd.bait,rwd.bq||1);
  // Chance for dragon skin
  if(Math.random()<.05&&!G.ownedSkins.includes('dragon_sk')){G.ownedSkins.push('dragon_sk');;}
  const oi=document.getElementById('bottle-open-ico');if(oi){oi.textContent='📜';oi.style.animation='none';void oi.offsetWidth;oi.style.animation='openPop .5s cubic-bezier(.34,1.56,.64,1)';}
  setTxt('bottle-open-title','Pesan Ditemukan!');setTxt('bottle-msg',b.msg);
  const chips=[];if(rwd.coins)chips.push('💰 +'+rwd.coins);if(rwd.gems)chips.push('💎 +'+rwd.gems);if(rwd.frags)chips.push('🔩 +'+rwd.frags);if(rwd.bait)chips.push(BAITS.find(b2=>b2.id===rwd.bait)?.i+' x'+(rwd.bq||1));
  document.getElementById('bottle-rwds').innerHTML=chips.map(c=>'<span class="crwd">'+c+'</span>').join('');
  setPhase('bottle-open');playSFX('catch');updateHUD();saveG();
}
/* ══════════════════ BOSS FISH ══════════════════ */
let bossData=null,bossHp=0,bossCooldown=0;
function triggerBoss(){
  const now=Date.now();if(now<bossCooldown||phase!=='wait')return;bossCooldown=now+7*60000;
  bossData=BOSSES_D[~~(Math.random()*BOSSES_D.length)];
  pending={type:'boss'};_stopWaitArc();setPhase('bite');
  if(scene){scene.bobber.biting=true;scene.bobber.rpl=2;}
  playSFX('break');doShake();doShake();_startBiteCD();biteTimer=setTimeout(onMiss,4800);
  setTxt('mboss-i',bossData.i);setTxt('mboss-t','⚠️ '+bossData.n+' MUNCUL!');setTxt('mboss-d',bossData.d+' — Tarik segera!');
  openModal('mod-boss');showRN(bossData.i+' BOSS: '+bossData.n+'!','⚠️');
}
function _startBoss(){
  bossHp=bossData.hp;setTxt('boss-ico',bossData.i);setTxt('boss-title','🔥 '+bossData.n+'!');setTxt('boss-sub',bossData.d);
  const r=bossData.rw;const br=document.getElementById('boss-rwds');
  if(br)br.innerHTML=['💰 '+r.coins,'💎 '+r.gems,'🔩 '+r.frags].map(t=>'<span class="brwd">'+t+'</span>').join('');
  const bh=document.getElementById('boss-hp-f');if(bh)bh.style.width='100%';
  setTxt('boss-hp-txt',bossHp+'/'+bossData.hp);
  if(scene){scene.bobber.vis=false;scene._splash(scene.bobber.x||scene.wW/2,scene.waterY,28);}playSFX('break');
}
function hitBoss(){
  if(!bossData||phase!=='boss')return;bossHp--;
  const pct=Math.max(0,bossHp/bossData.hp*100);
  const bh=document.getElementById('boss-hp-f');if(bh)bh.style.width=pct+'%';
  setTxt('boss-hp-txt',bossHp+'/'+bossData.hp);playSFX('reel');doShake();
  if(scene)scene._splash(scene.bobber.x||scene.wW/2,scene.waterY,10);
  setTxt('boss-sub',bossHp>0?'HP: '+bossHp+'❗':'💀 DIKALAHKAN!');
  if(bossHp<=0){
    const r=bossData.rw;G.coins+=r.coins;G.gems+=r.gems;G.rodFragments+=r.frags;
    G.legendaryCount++;G.mythicCount++;G.totalCaught++;G.bossKills=(G.bossKills||0)+1;
    G.combo++;if(G.combo>G.bestCombo)G.bestCombo=G.combo;
    const f=FISH.Mythic[~~(Math.random()*FISH.Mythic.length)];
    G.inventory[f.id]=G.inventory[f.id]||{count:0,totalWeight:0,maxWt:0};
    G.inventory[f.id].count++;G.inventory[f.id].totalWeight+=300;
    addXP(500);checkAchs();
    _showResult({i:bossData.i,n:bossData.n},'Mythic',999,r.coins,500,r.gems,r.frags,null,0,false,true);
    if(scene){scene.doFishJump(bossData.i);setTimeout(()=>{scene.doCatch();doShake();},300);}
    doShake();_spawnSparks('Mythic');updateHUD();saveG();bossData=null;
  }
}

/* ══════════════════ RARE SPAWN ══════════════════ */
let _rareCD=0;
function checkRareSpawn(){
  if(Date.now()<_rareCD||phase!=='wait')return;
  if(Math.random()>.07)return;_rareCD=Date.now()+55000;
  const rars=['Rare','Epic','Legendary','Mythic'],w=[60,25,12,3];let roll=Math.random()*100,cum=0,rar='Rare';
  for(let i=0;i<rars.length;i++){cum+=w[i];if(roll<=cum){rar=rars[i];break;}}
  const fish=pickFish(rar);const icons={Rare:'🌟',Epic:'🔥',Legendary:'⭐',Mythic:'🌈'};
  showRN(fish.i+' '+rar+' terdeteksi!',icons[rar]||'✨');
  if(scene)scene.spawnGlowFish(fish.i,rar);
}

/* ══════════════════ WAIT ARC ══════════════════ */
function _startWaitArc(){
  const arc=document.getElementById('wring-arc');if(arc)arc.style.strokeDashoffset='176';
  clearInterval(_waitArcIv);let prog=0;
  const bait=BAITS.find(b=>b.id===G.baitId)||BAITS[0];
  const sk=1-Math.min((G.skills.speed||0)*.08,.4);
  const avg=(bait.wMin+bait.wMax)/2*sk;const step=176/(avg/50);
  _waitArcIv=setInterval(()=>{prog=Math.min(prog+step,176);const a=document.getElementById('wring-arc');if(a)a.style.strokeDashoffset=176-prog;if(prog>=176)clearInterval(_waitArcIv);},50);
}
function _stopWaitArc(){clearInterval(_waitArcIv);const arc=document.getElementById('wring-arc');if(arc)arc.style.strokeDashoffset='176';}
function _startBiteCD(){
  const s=Date.now();clearInterval(biteInt);
  biteInt=setInterval(()=>{const p=Math.max(0,100-((Date.now()-s)/3400)*100);const e=document.getElementById('bite-bar');if(e)e.style.width=p+'%';if(p<=0)clearInterval(biteInt);},40);
}

/* ══════════════════ RESULT DISPLAY ══════════════════ */
function _showResult(fish,rar,wt,coins,xp,gems,frags,mutation,cBonus,isSecret,isBoss){
  setPhase('result');
  const card=document.getElementById('result-card');if(card)card.className='result-card rc-'+rar;
  setTxt('res-ico',fish.i||fish.ico);
  const rr=document.getElementById('res-rar');if(rr){rr.textContent=isBoss?'BOSS DEFEATED!':(isSecret?'SECRET CATCH!':rar.toUpperCase());rr.className='res-rar rar-'+rar;}
  setTxt('res-sz',sizeLabel(wt));setTxt('res-kg',wt+'kg');setTxt('res-name',fish.n||fish.name);
  const mutEl=document.getElementById('res-mut');if(mutEl)mutEl.classList.toggle('hidden',!mutation);
  const mutTEl=document.getElementById('res-mut-type');if(mutTEl){mutTEl.textContent=mutation?'✨ '+MUTATIONS.find(m=>m.id===mutation)?.n+' Mutation!':'';mutTEl.classList.toggle('hidden',!mutation);}
  setTxt('res-coin','+'+fmt(coins)+'💰');setTxt('res-xp','+'+xp+'XP');
  let extra='';if(gems>0)extra+='💎+'+gems+' ';if(frags>0)extra+='🔩+'+frags;setTxt('res-extra',extra);
  let bonus='';if(cBonus>0)bonus='🔥 COMBO x'+G.combo+'! +'+fmt(cBonus)+'💰';else if(rar==='Mythic')bonus='🌈 MYTHIC!';else if(isSecret)bonus='🌑 SECRET FISH!';else if(isBoss)bonus='⚔️ BOSS DEFEATED!';else if(wt>=50)bonus='🏆 MONSTER!';
  setTxt('res-bonus',bonus);_spawnSparks(rar);
}

/* ══════════════════ XP / LEVEL ══════════════════ */
function addXP(a){
  G.xp+=a;let lv=false;
  while(G.level<XPT.length-1&&G.xp>=XPT[G.level]){G.level++;lv=true;G.skills.points=(G.skills.points||0)+1;}
  if(lv){setTxt('mlvl-t','🎉 Level '+G.level+'!');setTxt('mlvl-b','+'+(G.level>=20?'12':G.level>=10?'6':G.level>=5?'3':0)+'% bonus rates! +1 Skill Point!');openModal('mod-lvl');playSFX('levelup');}
  updateHUD();
}
function xpPct(){const c=XPT[G.level-1]||0,n=XPT[G.level]||XPT[XPT.length-1];return Math.min(((G.xp-c)/(n-c))*100,100);}

/* ══════════════════ HUD ══════════════════ */
function updateHUD(){
  setTxt('pb-name',G.playerName);setTxt('pb-lv','Lv.'+G.level);setTxt('pb-xt',fmt(G.xp)+'xp');
  setTxt('h-coin',fmt(G.coins));setTxt('h-gem',G.gems);setTxt('h-frag',G.rodFragments);
  const xf=document.getElementById('pb-xpf');if(xf)xf.style.width=xpPct()+'%';
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];const strB=(G.skills.str||0)*12;
  setTxt('is-rod',rod.i+' '+rod.n);
  const bait=BAITS.find(b=>b.id===G.baitId)||BAITS[0];setTxt('is-bait',bait.i+' '+bait.n);
  setTxt('is-maxkg','Max '+(rod.maxKg+strB)+'kg');
  const skin=SKINS.find(s=>s.id===G.activeSkin);setTxt('is-skin',skin?skin.i+' '+skin.n:'');
  setTxt('qs-tc',G.totalCaught);setTxt('qs-cb',G.bestCombo);setTxt('qs-lg',G.legendaryCount);setTxt('qs-str',G.loginStreak||0);
  setTxt('wx-combo',G.combo>1?'🔥×'+G.combo:'');
  setTxt('sh-bal','💰 '+fmt(G.coins));setTxt('sk-pts',(G.skills.points||0)+' pt');
  const map=MAPS.find(m=>m.id===G.currentMap)||MAPS[0];setTxt('wx-map',map.e+' '+map.n);setTxt('map-badge',map.n);
  // Daily dot
  const dd=document.getElementById('fn-dot');if(dd)dd.style.display=_canClaimDR()?'flex':'none';
}

/* ══════════════════ WEATHER (#12) ══════════════════ */
let _wxTimer=null;
function updateWeather(){
  const now=Date.now();
  if(now>G.weatherEnd){
    const ws=WEATHERS.filter(w=>w.id!==G.weatherId);G.weatherId=ws[~~(Math.random()*ws.length)].id;
    G.weatherEnd=now+(WEATHERS.find(w=>w.id===G.weatherId)?.dur||5)*60000;
    const w=WEATHERS.find(x=>x.id===G.weatherId);if(w){const vfx=document.getElementById('wx-vfx');if(vfx){vfx.textContent=w.vfx;vfx.classList.remove('show');void vfx.offsetWidth;vfx.classList.add('show');}}
    _updateRain();
  }
  G.dayTime=(now%(8*60000))<4*60000?'day':'night';
  const w=WEATHERS.find(x=>x.id===G.weatherId)||WEATHERS[0];
  setTxt('wx-ico',w.ico);setTxt('wx-name',w.n.replace(/^[^\s]+\s/,''));
  // Event
  if(now>G.eventEnd&&Math.random()<.12){
    const ev=EVENTS_DATA[~~(Math.random()*EVENTS_DATA.length)];G.activeEvent=ev.n;G.eventEnd=now+3*60000;
    setTxt('wx-event',ev.n.split(' ')[0]);setTxt('mev-i',ev.n.split(' ')[0]);setTxt('mev-t',ev.n);setTxt('mev-d',ev.d);openModal('mod-event');
  }else if(now>G.eventEnd){G.activeEvent=null;setTxt('wx-event','');}
}
function _updateRain(){
  const rc=document.getElementById('cv-rain');if(!rc)return;
  const isRain=['rain','storm'].includes(G.weatherId);rc.classList.toggle('hidden',!isRain);
  if(!isRain)return;
  const rCtx=rc.getContext('2d');const W=rc.width=window.innerWidth;const H=rc.height=200;
  const drops=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,l:8+Math.random()*14,sp:4+Math.random()*6}));
  let rainR;const rainLoop=()=>{rCtx.clearRect(0,0,W,H);rCtx.strokeStyle='rgba(174,214,241,.45)';rCtx.lineWidth=1;drops.forEach(d=>{rCtx.beginPath();rCtx.moveTo(d.x,d.y);rCtx.lineTo(d.x-3,d.y+d.l);rCtx.stroke();d.y+=d.sp;if(d.y>H){d.y=-20;d.x=Math.random()*W;}});if(['rain','storm'].includes(G.weatherId))rainR=requestAnimationFrame(rainLoop);};rainR=requestAnimationFrame(rainLoop);
}

/* ══════════════════ TOURNAMENT (#13) ══════════════════ */
let tournActive=false,tournTimer=null,tournEnd=0,tournBestWt=0,tournBestFish='-';
const TOURN_NPCS=[{n:'Bot Alpha',wt:12+Math.random()*30},{n:'Bot Beta',wt:8+Math.random()*25},{n:'Bot Gamma',wt:5+Math.random()*20}];
function startTournament(){
  if(tournActive)return;tournActive=true;tournBestWt=0;tournBestFish='-';
  const dur=180000;tournEnd=Date.now()+dur;
  setTxt('tourn-badge','🔴 LIVE');setTxt('tourn-best','-');
  setPhase('tourn-active');
  document.getElementById('btn-tourn-cast')?.addEventListener('click',()=>{setPhase('idle');switchTab('fish');},{once:true});
  tournTimer=setInterval(()=>{
    const rem=Math.max(0,tournEnd-Date.now());const m=~~(rem/60000),s=~~(rem%60000/1000);
    setTxt('tourn-timer',m+':'+String(s).padStart(2,'0'));
    if(rem<=0){clearInterval(tournTimer);endTournament();}
  },500);
}
function endTournament(){
  tournActive=false;setTxt('tourn-badge','Ended');
  // Build final leaderboard
  const all=[{n:G.playerName+' (Kamu)',wt:tournBestWt,isMe:true},...TOURN_NPCS];
  all.sort((a,b)=>b.wt-a.wt);
  const rank=all.findIndex(x=>x.isMe)+1;
  const prizes=[{coins:3000,gems:10},{coins:1500,gems:5},{coins:700,gems:2}];
  const prize=prizes[Math.min(rank-1,2)]||{coins:100,gems:0};
  G.coins+=prize.coins;G.gems+=prize.gems;
  if(rank===1){G.tournWins=(G.tournWins||0)+1;checkAchs();}
  setTxt('mte-sub',['🥇 1st!','🥈 2nd!','🥉 3rd!'][rank-1]||'Ranking #'+rank);
  const body=document.getElementById('mte-body');
  if(body)body.innerHTML=all.slice(0,4).map((e,i)=>`<div class="tr-row"><span>${['🥇','🥈','🥉','4️⃣'][i]} ${e.n}</span><span>${e.wt.toFixed(1)}kg</span></div>`).join('')
    +`<div class="tr-row"><span>Reward</span><span>+${prize.coins}💰 +${prize.gems}💎</span></div>`;
  openModal('mod-tourn-end');updateHUD();saveG();resetToIdle();
}

/* ══════════════════ SHOP (#6 Rods, #7 Baits, #15 Skins) ══════════════════ */
function renderShop(panel='rods'){
  updateHUD();
  if(panel==='rods'){
    const g=document.getElementById('sp-rods');if(!g)return;
    g.innerHTML='<p class="sp-hint">Rod lebih baik = kapasitas berat ↑ + bonus rarity!</p><div class="shop-grid">'+
      RODS.map(rod=>{const ow=G.ownedRods.includes(rod.id),eq=G.rodId===rod.id;
        const pr=rod.craft?'🔩 20 Frags':rod.cost?'💰 '+fmt(rod.cost):'Gratis';
        return`<div class="sh-card ${eq?'equipped':ow?'owned':''}">
          ${eq?'<div class="sh-badge">⚡ AKTIF</div>':ow?'<div class="sh-badge">✓ Punya</div>':rod.craft?'<div class="sh-badge">🔨 Craft</div>':''}
          <div class="sh-ico">${rod.i}</div><div class="sh-name">${rod.n}</div><div class="sh-desc">${rod.d}</div>
          <div class="sh-stat">Max ${rod.maxKg}kg | XP×${rod.xm}</div><div class="sh-price">${pr}</div>
          <button class="btn-sh ${eq?'btn-equipped':ow?'btn-equip':'btn-buy'}" data-rod="${rod.id}" ${eq?'disabled':''}>${eq?'Equipped':ow?'Pasang':rod.craft?'Craft':'Beli'}</button>
        </div>`}).join('')+'</div>';
    g.querySelectorAll('[data-rod]').forEach(b=>b.addEventListener('click',()=>buyRod(b.dataset.rod)));
  }else if(panel==='baits'){
    const g=document.getElementById('sp-baits');if(!g)return;
    g.innerHTML='<p class="sp-hint">Umpan berbeda menarik ikan berbeda!</p><div class="shop-grid">'+
      BAITS.map(b=>{const qty=G.ownedBaits[b.id]||0,eq=G.baitId===b.id;
        return`<div class="sh-card ${eq?'equipped':''}">
          ${eq?'<div class="sh-badge">✓ Aktif</div>':''}
          <div class="sh-ico">${b.i}</div><div class="sh-name">${b.n}</div><div class="sh-desc">${b.d}</div>
          <div class="sh-stat">Punya: ${qty>99?'∞':qty}</div><div class="sh-price">${b.cost?'💰 '+b.cost:'-'}</div>
          <button class="btn-sh ${eq?'btn-equipped':'btn-buy'}" data-bait="${b.id}" ${eq&&!b.cost?'disabled':''}>${eq?'Aktif':b.cost?'Beli':'Pasang'}</button>
        </div>`}).join('')+'</div>';
    g.querySelectorAll('[data-bait]').forEach(b=>b.addEventListener('click',()=>buyBait(b.dataset.bait)));
  }else if(panel==='skins'){
    // Feature #15: Skin system
    const g=document.getElementById('sp-skins');if(!g)return;
    g.innerHTML='<p class="sp-hint">Skin mengubah tampilan rod (tidak mempengaruhi stats)!</p><div class="shop-grid">'+
      SKINS.map(sk=>{const ow=G.ownedSkins.includes(sk.id),act=G.activeSkin===sk.id;
        const pr=sk.cost>0?'💰 '+sk.cost:sk.from==='chest'?'🎁 Dari Peti':sk.from==='event'?'🌟 Event':'Gratis';
        return`<div class="sh-card ${act?'equipped sel':ow?'owned':''}">
          ${act?'<div class="sh-badge">⚡ ON</div>':ow?'<div class="sh-badge">✓ Punya</div>':''}
          <div class="sh-ico">${sk.i}</div><div class="sh-name">${sk.n}</div><div class="sh-desc">${sk.d}</div>
          <div class="sh-skin-preview" style="color:${sk.glow}">● Glow: ${sk.glow.replace('rgba(','').split(',')[0]+','+(sk.glow.split(',')[1]||'')}</div>
          <div class="sh-price">${pr}</div>
          <button class="btn-sh ${act?'btn-equipped':ow?'btn-equip':'btn-buy'}" data-skin="${sk.id}" ${act?'disabled':sk.cost>0&&!ow?'':''}>${act?'Aktif':ow?'Pasang':sk.cost>0?'Beli':'N/A'}</button>
        </div>`}).join('')+'</div>';
    g.querySelectorAll('[data-skin]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{
      const sk=SKINS.find(s=>s.id===b.dataset.skin);if(!sk)return;
      if(G.activeSkin===sk.id){G.activeSkin=null;showToast('Skin dilepas');renderShop('skins');saveG();return;}
      if(G.ownedSkins.includes(sk.id)){G.activeSkin=sk.id;showToast(sk.i+' '+sk.n+' aktif!');renderShop('skins');saveG();return;}
      if(sk.cost>0&&G.coins>=sk.cost){G.coins-=sk.cost;G.ownedSkins.push(sk.id);G.activeSkin=sk.id;showToast('🎨 '+sk.n+' dibeli!');updateHUD();renderShop('skins');saveG();}
      else if(sk.cost===0)showToast('Skin ini didapat dari '+sk.from);
      else showToast('💸 Butuh '+sk.cost+'💰');
    }));
  }else if(panel==='spec'){
    const g=document.getElementById('sp-spec');if(!g)return;
    const specs=[{id:'xp2',n:'XP ×2',i:'⭐',d:'XP ganda 10 tangkap',cost:500,ef:'xp2',q:10},{id:'coin2',n:'Coin ×2',i:'💰',d:'Coin ganda 10 tangkap',cost:800,ef:'coin2',q:10},{id:'lure',n:'Fast Lure',i:'⚡',d:'Lure 40% lebih cepat',cost:300,ef:'lure',q:1}];
    g.innerHTML='<p class="sp-hint">Item boost sementara untuk mempercepat grinding!</p><div class="shop-grid">'+specs.map(sp=>{const a=G.boosters[sp.ef]>0;return`<div class="sh-card ${a?'equipped':''}"><div class="sh-ico">${sp.i}</div><div class="sh-name">${sp.n}</div><div class="sh-desc">${sp.d}</div><div class="sh-price">💰 ${sp.cost}</div><div class="sh-stat">${a?'🔥 Aktif: '+G.boosters[sp.ef]:''}</div><button class="btn-sh btn-buy" data-sp="${sp.id}" data-cost="${sp.cost}" data-ef="${sp.ef}" data-q="${sp.q}">Beli</button></div>`;}).join('')+'</div>';
    g.querySelectorAll('[data-sp]').forEach(b=>b.addEventListener('click',()=>{const c=+b.dataset.cost;if(G.coins<c){showToast('💸 Butuh '+c+'💰');return;}G.coins-=c;G.boosters[b.dataset.ef]=(G.boosters[b.dataset.ef]||0)+(+b.dataset.q);showToast('🔥 Aktif!');updateHUD();renderShop('spec');saveG();}));
  }
}
function buyRod(id){
  const rod=RODS.find(r=>r.id===id);if(!rod)return;
  if(G.ownedRods.includes(id)){G.rodId=id;checkAchs();showToast('⚡ '+rod.n+' dipasang!');updateHUD();renderShop('rods');saveG();return;}
  if(rod.craft){if(G.rodFragments<20){showToast('🔩 Butuh 20 Frags!');return;}G.rodFragments-=20;G.ownedRods.push(id);G.rodId=id;checkAchs();showToast('🌈 Mythic Rod dibuat!');updateHUD();renderShop('rods');saveG();return;}
  if(G.coins<rod.cost){showToast('💸 Butuh '+fmt(rod.cost)+'💰');return;}
  G.coins-=rod.cost;G.ownedRods.push(id);G.rodId=id;checkAchs();showToast('⬆️ '+rod.n+' dibeli!');updateHUD();renderShop('rods');saveG();
}
function buyBait(id){
  const bait=BAITS.find(b=>b.id===id);if(!bait)return;
  if(!bait.cost){G.baitId=id;showToast(bait.i+' '+bait.n+' aktif!');renderShop('baits');saveG();return;}
  if(G.coins<bait.cost){showToast('💸 Butuh '+bait.cost+'💰');return;}
  G.coins-=bait.cost;addBait(id,1);G.baitId=id;showToast(bait.i+' Dibeli!');updateHUD();renderShop('baits');saveG();
}

/* ══════════════════ AQUARIUM ══════════════════ */
function renderAquarium(filt='all'){
  const allFish=Object.entries(G.inventory).flatMap(([id,inv])=>{
    const c=typeof inv==='object'?inv.count:inv;const tw=typeof inv==='object'?inv.totalWeight:0;
    const mwt=typeof inv==='object'?inv.maxWt:0;
    for(const[rar,arr]of Object.entries(FISH)){const f=arr.find(x=>x.id===id);if(f)return[{f,rar,c,tw,mwt}];}
    // Check secret fish
    for(const sf of SECRET_FISH){if(sf.id===id)return[{f:sf,rar:'Mythic',c,tw,mwt}];}
    return[];
  }).filter(x=>x.c>0);
  const muts=Object.keys(G.mutationCaught||{});
  const shown=filt==='all'?allFish:filt==='mutation'?allFish.filter(x=>muts.some(m=>m.startsWith(x.f.id))):allFish.filter(x=>x.rar===filt);
  const uniqueRars=new Set(allFish.map(x=>x.rar));setTxt('aq-badge',allFish.length+' spesies');
  const st=document.getElementById('aq-summary');
  if(st)st.innerHTML=`<div class="aq-stat"><span class="v">${G.totalCaught}</span><span class="l">Total</span></div><div class="aq-stat"><span class="v">${G.heaviestCatch}kg</span><span class="l">Terberat</span></div><div class="aq-stat"><span class="v">${G.legendaryCount}</span><span class="l">Legend+</span></div>`;
  const gd=document.getElementById('aq-grid');if(!gd)return;
  if(!shown.length){gd.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:rgba(255,255,255,.3)">🎣 Mulai mancing untuk mengisi koleksi!</div>';return;}
  const hasMuts=id=>muts.some(m=>m.startsWith(id));
  gd.innerHTML=shown.map(({f,rar,c,tw,mwt})=>`<div class="aq-card ${hasMuts(f.id)?'new':''}">
    <div class="aq-i">${f.i}</div>
    <div class="aq-n">${f.n||f.name}</div>
    <div class="aq-cnt">×${c}</div>
    <div class="aq-kg">Max ${mwt}kg</div>
    <div class="aq-rar rar-${rar}">${rar}</div>
    ${hasMuts(f.id)?'<div class="aq-mut">✨ Mutasi!</div>':''}
  </div>`).join('');
}

/* ══════════════════ COLLECTION BOOK (#14) ══════════════════ */
function renderBook(cat='all'){
  const cats=['all','Common','Uncommon','Rare','Epic','Legendary','Mythic'];
  const bc=document.getElementById('book-cats');if(bc)bc.innerHTML=cats.map(c=>`<button class="book-cat ${c===cat?'active':''}" data-bc="${c}">${c==='all'?'Semua':c}</button>`).join('');
  bc?.querySelectorAll('[data-bc]').forEach(b=>b.addEventListener('click',()=>renderBook(b.dataset.bc)));
  const allFish=Object.entries(FISH).flatMap(([rar,arr])=>arr.map(f=>({f,rar})));
  const secretFish=SECRET_FISH.map(sf=>({f:sf,rar:'Mythic'}));
  const all=[...allFish,...secretFish];
  const shown=cat==='all'?all:all.filter(x=>x.rar===cat);
  const caught=all.filter(x=>G.inventory[x.f.id]?.count>0||G.inventory[x.f.id]>0).length;
  setTxt('book-badge',caught+'/'+all.length);
  const gd=document.getElementById('book-grid');if(!gd)return;
  gd.innerHTML=shown.map(({f,rar})=>{
    const inv=G.inventory[f.id];const c=typeof inv==='object'?inv?.count:inv;const caught2=c>0;
    return`<div class="book-entry ${caught2?'caught':'uncaught'}">
      <div class="be-ico">${f.i}</div>
      <div class="be-n">${caught2?f.n||f.name:'?????'}</div>
      <div class="be-rar rar-${rar}">${rar}</div>
      ${caught2?`<div class="be-info">×${c}</div><div class="be-price">💰 ${f.bv||'?'}</div>`:''}
    </div>`;
  }).join('');
  // Rewards section
  const br=document.getElementById('book-rewards');if(!br)return;
  br.innerHTML='<div class="br-title">📖 Completion Rewards</div><div class="br-list">'+
    BOOK_REWARDS.map(bkr=>{
      const fishInCat=allFish.filter(x=>x.rar===bkr.cat);
      const caughtInCat=fishInCat.filter(x=>(G.inventory[x.f.id]?.count||G.inventory[x.f.id]||0)>0).length;
      const done=caughtInCat>=bkr.need;const claimed=G.bookRewardsClaimed[bkr.cat];
      const rws=(bkr.rw.coins?'+'+bkr.rw.coins+'💰 ':'')+(bkr.rw.gems?'+'+bkr.rw.gems+'💎':'');
      return`<div class="br-item"><span class="bri-check">${claimed?'✅':done?'🎁':'⬜'}</span>
        <div class="bri-info"><div class="bri-n">${bkr.cat} Collection (${caughtInCat}/${bkr.need})</div><div class="bri-d">Tangkap semua ${bkr.cat}</div></div>
        <div class="bri-rw">${rws}</div>
        ${done&&!claimed?`<button class="btn-bri-claim" data-bcat="${bkr.cat}">Klaim!</button>`:''}
      </div>`;
    }).join('')+'</div>';
  br.querySelectorAll('[data-bcat]').forEach(btn=>btn.addEventListener('click',()=>{
    const bkr=BOOK_REWARDS.find(x=>x.cat===btn.dataset.bcat);if(!bkr||G.bookRewardsClaimed[bkr.cat])return;
    G.bookRewardsClaimed[bkr.cat]=true;G.coins+=bkr.rw.coins||0;G.gems+=bkr.rw.gems||0;
    showToast('📖 '+bkr.cat+' Complete! '+(bkr.rw.coins?'+'+bkr.rw.coins+'💰 ':'')+(bkr.rw.gems?'+'+bkr.rw.gems+'💎':''));
    updateHUD();renderBook(cat);saveG();
  }));
}

/* ══════════════════ MAP (#11) ══════════════════ */
function renderMap(){
  const g=document.getElementById('map-grid');if(!g)return;
  g.innerHTML=MAPS.map(m=>{
    const unlocked=G.mapsUnlocked.includes(m.id)||G.level>=m.req;
    const selected=G.currentMap===m.id;
    if(unlocked&&!G.mapsUnlocked.includes(m.id))G.mapsUnlocked.push(m.id);
    return`<div class="map-card ${selected?'selected':''}${unlocked?'':' locked'}" data-map="${m.id}" style="background:${m.bg}">
      <div class="mc-ico">${m.e}</div>
      <div class="mc-name">${m.n}</div>
      <div class="mc-desc">${m.d}</div>
      <div class="mc-bonus">${m.bl}</div>
      ${unlocked?'':'<div class="mc-req">🔓 Req: Lv.'+m.req+'</div>'}
    </div>`;
  }).join('');
  g.querySelectorAll('[data-map]:not(.locked)').forEach(c=>c.addEventListener('click',()=>{
    G.currentMap=c.dataset.map;const m=MAPS.find(x=>x.id===c.dataset.map);
    if(!G.mapsUnlocked.includes(m.id))G.mapsUnlocked.push(m.id);
    checkAchs();showToast('🗺️ Pindah ke '+m.n+'!');renderMap();updateHUD();saveG();
  }));
}

/* ══════════════════ DAILY REWARD ══════════════════ */
function _canClaimDR(){const today=new Date().toDateString();return G.drLastDate!==today;}
function renderDailyReward(){
  const streak=G.loginStreak||1;setTxt('dr-streak','🔥 Login Streak: '+streak+' Hari');setTxt('dr-badge','Hari '+streak);
  const cal=document.getElementById('dr-calendar');if(cal){
    cal.innerHTML=DR_REWARDS.map(r=>{const past=streak>r.day,isToday=streak===r.day;
      return`<div class="dr-day ${past?'past':isToday?'today':'future'}"><div class="dr-day-n">D${r.day}</div><div class="dr-day-ico">${past?'✅':r.ico}</div><div class="dr-day-rwd">${r.r}</div></div>`;}).join('');}
  const can=_canClaimDR();const btn=document.getElementById('btn-dr-claim');
  if(btn){btn.disabled=!can;btn.textContent=can?'🎁 Klaim Hari '+streak+'!':'✓ Sudah diklaim';}
  setTxt('dr-note',can?'Klaim reward harianmu!':'Kembali besok untuk reward berikutnya!');
}
function claimDR(){
  if(!_canClaimDR())return;const today=new Date().toDateString();
  const rw=DR_REWARDS[Math.min((G.loginStreak||1)-1,DR_REWARDS.length-1)];rw.c();
  G.drLastDate=today;showToast('📅 Daily reward hari '+G.loginStreak+'! '+rw.r+'!');playSFX('levelup');
  checkAchs();updateHUD();renderDailyReward();saveG();
}

/* ══════════════════ EXCHANGE ══════════════════ */
function renderExchange(){renderTrade();renderCoin();renderFusion();renderDailyEx();renderFrags();}
function renderTrade(){
  const g=document.getElementById('ep-trade');if(!g)return;
  g.innerHTML='<div class="ex-grid">'+TRADES.map(tr=>{const have=countR(tr.ft);const ok=have>=tr.fq;const cd=G.tradeCDs[tr.id]||0;const rem=Math.max(0,cd+tr.cd-Date.now());
    return`<div class="ex-card"><div class="ex-from">${tr.f}</div><div class="ex-have">Punya: ${have}</div><div class="ex-arr">→</div><div class="ex-to">${tr.to}</div>${rem>0?'<div class="ex-cd">⏰ '+Math.ceil(rem/1000)+'s</div>':''}
    <button class="btn-trade" data-tid="${tr.id}" ${(!ok||rem>0)?'disabled':''}>${rem>0?'CD...':'Tukar'}</button></div>`;}).join('')+'</div>';
  g.querySelectorAll('[data-tid]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{
    const tr=TRADES.find(x=>x.id===b.dataset.tid);if(!tr)return;
    removeR(tr.ft,tr.fq);if(tr.tt==='bait')addBait(tr.tid,tr.tq);if(tr.tt==='frags')G.rodFragments+=tr.tq;if(tr.tt==='rod'&&!G.ownedRods.includes(tr.tid))G.ownedRods.push(tr.tid);
    G.tradeCDs[tr.id]=Date.now();G.exchanges=(G.exchanges||0)+1;showToast('✅ '+tr.to+'!');checkAchs();updateHUD();renderTrade();saveG();
  }));
}
function renderCoin(){
  const g=document.getElementById('ep-coin');if(!g)return;
  g.innerHTML='<div class="ex-grid">'+COIN_TRADES.map(ct=>`<div class="ex-card"><div class="ex-from">💰 ${ct.cost}</div><div class="ex-arr">→</div><div class="ex-to">${ct.it}</div><button class="btn-trade" data-cid="${ct.id}" ${G.coins<ct.cost?'disabled':''}>Tukar</button></div>`).join('')+'</div>';
  g.querySelectorAll('[data-cid]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{
    const ct=COIN_TRADES.find(x=>x.id===b.dataset.cid);if(!ct||G.coins<ct.cost)return;G.coins-=ct.cost;
    if(ct.tt==='bait')addBait(ct.tid,ct.q);if(ct.tt==='frags')G.rodFragments+=ct.q;
    G.exchanges=(G.exchanges||0)+1;showToast('✅ '+ct.it+'!');updateHUD();renderCoin();saveG();
  }));
}
function renderGacha(){
  const g=document.getElementById('ep-gacha');if(!g)return;
  g.innerHTML=`<div class="gacha-wrap"><div class="gacha-ani" id="g-ani">🎁</div><div class="gacha-title">Mystery Gacha!</div>
    <div class="gacha-btns">
      <button class="btn-gacha" data-gt="basic"   data-cost="300"  data-cur="coins">🎁 Basic<br><small>300💰</small></button>
      <button class="btn-gacha" data-gt="premium"  data-cost="1000" data-cur="coins">✨ Premium<br><small>1000💰</small></button>
      <button class="btn-gacha" data-gt="gem"      data-cost="3"    data-cur="gems">💎 Gem Box<br><small>3💎</small></button>
    </div><div id="g-res"></div></div>`;
  g.querySelectorAll('[data-gt]').forEach(b=>b.addEventListener('click',()=>{
    const tier=b.dataset.gt,cost=+b.dataset.cost,cur=b.dataset.cur;
    if(cur==='gems'&&G.gems<cost){showToast('💎 Kurang!');return;}if(cur==='coins'&&G.coins<cost){showToast('💸 Kurang!');return;}
    if(cur==='gems')G.gems-=cost;else G.coins-=cost;
    const pool=GACHA_P[tier],tot=pool.reduce((a,x)=>a+x.w,0);let roll=Math.random()*tot,prize=pool[pool.length-1];
    for(const p of pool){roll-=p.w;if(roll<=0){prize=p;break;}}
    if(prize.t==='bait')addBait(prize.id,prize.q);if(prize.t==='frags')G.rodFragments+=prize.q;if(prize.t==='coins')G.coins+=prize.q;if(prize.t==='gems')G.gems+=prize.q;
    if(prize.t==='fish'){const f=pickFish('Rare'),w=rollWt('Rare');G.inventory[f.id]=G.inventory[f.id]||{count:0,totalWeight:0,maxWt:0};G.inventory[f.id].count++;G.inventory[f.id].totalWeight+=w;}
    const ai=document.getElementById('g-ani');if(ai){ai.textContent='🎉';ai.style.animation='none';void ai.offsetWidth;ai.style.animation='gaFloat 2s ease-in-out infinite';}
    document.getElementById('g-res').innerHTML=`<div class="gacha-result"><div class="gr-ico">${prize.i}</div><div class="gr-name">${prize.n}</div></div>`;
    G.exchanges=(G.exchanges||0)+1;playSFX('catch');updateHUD();saveG();
  }));
}
function renderFusion(){
  const g=document.getElementById('ep-fusion');if(!g)return;
  g.innerHTML='<div class="ex-grid">'+FUSIONS.map(fu=>{const h=countR(fu.rf),ok=h>=fu.n;
    return`<div class="ex-card"><div class="ex-from">${fu.n}× ${fu.rf}</div><div class="ex-have">Punya: ${h}</div><div class="ex-arr">→</div><div class="ex-to">1× ${fu.rt}</div>
    <button class="btn-trade" data-fid="${fu.id}" ${!ok?'disabled':''}>${ok?'🔀 Fuse!':'Kurang'}</button></div>`;}).join('')+'</div>';
  g.querySelectorAll('[data-fid]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{
    const fu=FUSIONS.find(x=>x.id===b.dataset.fid);if(!fu||countR(fu.rf)<fu.n)return;
    removeR(fu.rf,fu.n);const nf=pickFish(fu.rt),w=rollWt(fu.rt);
    G.inventory[nf.id]=G.inventory[nf.id]||{count:0,totalWeight:0,maxWt:0};G.inventory[nf.id].count++;G.inventory[nf.id].totalWeight+=w;
    G.totalCaught++;G.exchanges=(G.exchanges||0)+1;playSFX('catch');showToast('🔀 Dapat '+nf.i+' '+nf.n+'!');checkAchs();updateHUD();renderFusion();saveG();
  }));
}
function renderDailyEx(){
  const g=document.getElementById('ep-daily');if(!g)return;const td=new Date().toDateString();const cl=G.dailyClaimed[td]||{};
  const deals=[{id:'d1',f:'10× Common',ft:'Common',fq:10,to:'350💰',tt:'coins',tq:350},{id:'d2',f:'5 Frags',ft:'frags',fq:5,to:'Golden x1',tt:'bait',tid:'golden',tq:1},{id:'d3',f:'1 Gem',ft:'gems',fq:1,to:'600💰',tt:'coins',tq:600}];
  const now=new Date(),mid=new Date(now);mid.setHours(24,0,0,0);const rem=mid-now;const h=~~(rem/3600000),m=~~(rem%3600000/60000),s=~~(rem%60000/1000);
  g.innerHTML='<div class="ex-grid">'+deals.map(d=>{const done=cl[d.id];return`<div class="ex-card"><div class="ex-from">${d.f}</div><div class="ex-arr">→</div><div class="ex-to">${d.to}</div>${done?'<div class="ex-cd">✓ Claimed</div>':''}
    <button class="btn-trade" data-did="${d.id}" data-ft="${d.ft}" data-fq="${d.fq}" data-tt="${d.tt}" data-tid="${d.tid||''}" data-tq="${d.tq}" ${done?'disabled':''}>${done?'Done':'Ambil!'}</button></div>`;}).join('')+'</div>'+`<p style="text-align:center;font-size:.68rem;color:rgba(255,255,255,.3);padding:8px">⏰ Reset: ${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}</p>`;
  g.querySelectorAll('.btn-trade:not([disabled])').forEach(b=>b.addEventListener('click',()=>{
    const{did,ft,fq,tt,tid,tq}=b.dataset;const td2=new Date().toDateString();if(!G.dailyClaimed[td2])G.dailyClaimed[td2]={};
    if(ft==='Common'&&countR('Common')<+fq){showToast('Ikan kurang!');return;}if(ft==='frags'&&G.rodFragments<+fq){showToast('Fragment kurang!');return;}if(ft==='gems'&&G.gems<+fq){showToast('Gem kurang!');return;}
    if(ft==='Common')removeR('Common',+fq);if(ft==='frags')G.rodFragments-=+fq;if(ft==='gems')G.gems-=+fq;
    if(tt==='coins')G.coins+=+tq;if(tt==='bait')addBait(tid,+tq);G.dailyClaimed[td2][did]=true;
    G.exchanges=(G.exchanges||0)+1;showToast('✅ Daily claimed!');updateHUD();renderDailyEx();saveG();
  }));
}
function renderFrags(){
  const g=document.getElementById('ep-frags');if(!g)return;const frs=[{cost:10,rw:'Carbon Rod',ty:'rod',rid:'carbon'},{cost:20,rw:'Mythic Rod',ty:'rod',rid:'mythic'},{cost:5,rw:'1× Golden',ty:'bait',rid:'golden'}];
  g.innerHTML='<p style="text-align:center;font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:8px">🔩 Punya: '+G.rodFragments+' Frags</p><div class="ex-grid">'+frs.map(fr=>`<div class="ex-card"><div class="ex-from">🔩 ${fr.cost} Frags</div><div class="ex-arr">→</div><div class="ex-to">${fr.rw}</div><button class="btn-trade" data-frck="${fr.cost}_${fr.ty}_${fr.rid}" ${G.rodFragments<fr.cost?'disabled':''}>Tukar</button></div>`).join('')+'</div>';
  g.querySelectorAll('[data-frck]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{
    const[cost,ty,rid]=b.dataset.frck.split('_');if(G.rodFragments<+cost){return;}G.rodFragments-=+cost;
    if(ty==='rod'&&!G.ownedRods.includes(rid))G.ownedRods.push(rid);if(ty==='bait')addBait(rid,1);
    showToast('✅ '+ty+'!');updateHUD();renderFrags();saveG();
  }));
}

/* ══════════════════ LEADERBOARD ══════════════════ */
function renderLB(cat='catch'){
  const medals=['🥇','🥈','🥉'];const me={n:G.playerName+' (Kamu)',catch:G.totalCaught,coin:G.coins,heavy:G.heaviestCatch,boss:G.bossKills||0,isMe:true};
  const all=[...LB_NPC,me].sort((a,b)=>b[cat]-a[cat]);
  document.getElementById('lb-list').innerHTML=all.slice(0,8).map((e,i)=>{
    const val=cat==='catch'?e.catch+'🐟':cat==='coin'?fmt(e.coin)+'💰':cat==='heavy'?e.heavy+'kg':e.boss+'⚔️';
    return`<div class="lb-row ${e.isMe?'me':''}">
      <span class="lb-rank lb-r${i+1}">${medals[i]||'#'+(i+1)}</span>
      <span class="lb-ava">🎣</span>
      <div class="lb-info"><div class="lb-name">${e.n}</div><div class="lb-sub">Rank #${i+1}</div></div>
      <span class="lb-val">${val}</span>
    </div>`;}).join('');
}

/* ══════════════════ ACHIEVEMENTS ══════════════════ */
function checkAchs(){
  ACHIEVEMENTS.forEach(a=>{if(G.achDone?.[a.id])return;let pass=false;
    if(a.ty==='total')pass=G.totalCaught>=a.tg;if(a.ty==='combo')pass=G.bestCombo>=a.tg;
    if(a.ty==='heavy')pass=G.heaviestCatch>=a.tg;if(a.ty==='mythic')pass=G.mythicCount>=a.tg;
    if(a.ty==='rod')pass=G.ownedRods.includes(a.tg);if(a.ty==='login')pass=(G.loginStreak||0)>=a.tg;
    if(a.ty==='earnC')pass=G.totalCoins>=a.tg;if(a.ty==='bosses')pass=(G.bossKills||0)>=a.tg;
    if(a.ty==='mut')pass=(G.mutCount||0)>=a.tg;if(a.ty==='maps')pass=(G.mapsUnlocked||[]).length>=a.tg;
    if(a.ty==='tournW')pass=(G.tournWins||0)>=a.tg;if(a.ty==='secret')pass=(G.secretCount||0)>=a.tg;
    if(pass){if(!G.achDone)G.achDone={};G.achDone[a.id]=true;if(a.rw.coins)G.coins+=a.rw.coins;if(a.rw.gems)G.gems+=a.rw.gems;
      setTimeout(()=>{setTxt('mach-i',a.i);setTxt('mach-n',a.n);setTxt('mach-r',(a.rw.coins?'+'+a.rw.coins+'💰 ':'')+(a.rw.gems?'+'+a.rw.gems+'💎':''));openModal('mod-ach');},700);
      updateHUD();save