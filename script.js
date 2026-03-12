'use strict';
/* ═══════════════════════════════════════════════════
   Fish It Gileg v9 · script.js
   Complete game logic — all 20 features
═══════════════════════════════════════════════════ */

/* ═══ DATA ═══ */
const MAPS = [
  {id:'river',   n:'River',         e:'🌊', d:'Sungai jernih',     bg:['#006090','#003366'],  wc:'#0099cc', req:1,  bn:{Common:12},                  lbl:'+12% Common'},
  {id:'lake',    n:'Lake',          e:'🏞', d:'Danau tenang',      bg:['#2a5c7a','#103040'],  wc:'#1177aa', req:5,  bn:{Uncommon:6,Rare:3},          lbl:'+6%Un +3%Ra'},
  {id:'ocean',   n:'Ocean',         e:'🌏', d:'Lautan luas',       bg:['#003366','#001a33'],  wc:'#0055aa', req:10, bn:{Rare:6,Epic:3},              lbl:'+6%Ra +3%Ep'},
  {id:'deepsea', n:'Deep Sea',      e:'🌑', d:'Palung misterius',  bg:['#1a0050','#0a0030'],  wc:'#220066', req:18, bn:{Epic:5,Legendary:4,Mythic:2},lbl:'+5%Ep +4%Leg'},
  {id:'arctic',  n:'Arctic Ocean',  e:'❄️', d:'Samudra Arctic',    bg:['#1a4a6a','#0d2035'],  wc:'#33aacc', req:25, bn:{Legendary:5,Mythic:6},       lbl:'+5%Leg +6%My'},
];
const WEATHERS = [
  {id:'sunny', n:'Cerah',  i:'☀️', rb:{Common:5},              dur:6},
  {id:'cloudy',n:'Mendung',i:'⛅', rb:{Uncommon:4,Rare:2},    dur:5},
  {id:'rain',  n:'Hujan',  i:'🌧️', rb:{Rare:4,Uncommon:3},    dur:4},
  {id:'storm', n:'Badai',  i:'⛈️', rb:{Epic:5,Legendary:3},   dur:3},
  {id:'night', n:'Malam',  i:'🌙', rb:{Epic:4,Legendary:4,Mythic:2},dur:5},
  {id:'fog',   n:'Kabut',  i:'🌫️', rb:{Rare:3,Epic:3},        dur:4},
];
const FISH = {
  Common:   [{id:'doge',  n:'Dogecoin',     i:'🐟',bv:28},{id:'shib',n:'Shiba Fish',   i:'🐟',bv:22},{id:'ada', n:'Cardano',    i:'🐟',bv:32},{id:'matic',n:'Polygon',    i:'🐟',bv:27},{id:'bbri',n:'BRI Stock',  i:'🐟',bv:40}],
  Uncommon: [{id:'sol',   n:'Solana',       i:'🐠',bv:85},{id:'dot', n:'Polkadot',     i:'🐠',bv:80},{id:'avax',n:'Avalanche',  i:'🐠',bv:90},{id:'link', n:'Chainlink',  i:'🐠',bv:83},{id:'bbca',n:'BCA Stock',  i:'🐠',bv:105}],
  Rare:     [{id:'bnb',   n:'Binance BNB',  i:'🐡',bv:200},{id:'ltc',n:'Litecoin',     i:'🐡',bv:185},{id:'xrp', n:'XRP',        i:'🐡',bv:215},{id:'asii', n:'Astra Stock', i:'🐡',bv:250}],
  Epic:     [{id:'eth',   n:'Ethereum',     i:'🐙',bv:500},{id:'eur',n:'EUR/USD',      i:'🐙',bv:530},{id:'indf',n:'Indofood',   i:'🐙',bv:550}],
  Legendary:[{id:'btc',   n:'Bitcoin',      i:'🐋',bv:1400},{id:'ebt',n:'ETH/BTC',    i:'🐋',bv:1300},{id:'idx',n:'IDX Index',  i:'🐋',bv:1500}],
  Mythic:   [{id:'sat',   n:'Satoshi',      i:'🐉',bv:4500},{id:'qbt',n:'Quantum BTC', i:'🐉',bv:5500},{id:'gmw',n:'Market Whale',i:'🐉',bv:7000}],
};
// Feature #20: Secret fish
const SECRET_FISH = [
  {id:'kraken_f',  n:'The Kraken',       i:'🐙', bv:12000, rodReq:'carbon',   prob:.004},
  {id:'leviathan', n:'Leviathan',         i:'🐋', bv:18000, rodReq:'titanium',  prob:.002},
  {id:'goldragon', n:'Golden Dragon Fish',i:'🐉', bv:25000, rodReq:'mythic',    prob:.001},
];
// Feature #16: Mutations
const MUTATIONS = [
  {id:'golden',  n:'Golden',  mul:3.0, prob:.04, glow:'#FFD700'},
  {id:'ghost',   n:'Ghost',   mul:2.0, prob:.05, glow:'#aaddff'},
  {id:'rainbow', n:'Rainbow', mul:4.0, prob:.02, glow:'#ff00ff'},
  {id:'crystal', n:'Crystal', mul:2.5, prob:.03, glow:'#00ffdd'},
];
const RODS = [
  {id:'bamboo',   n:'Bamboo Rod',    i:'🎋', maxKg:8,   cost:0,    rb:{},                 d:'Rod pemula'},
  {id:'iron',     n:'Iron Rod',      i:'🔩', maxKg:20,  cost:700,  rb:{Uncommon:3},       d:'+3% Uncommon'},
  {id:'carbon',   n:'Carbon Rod',    i:'⚡', maxKg:55,  cost:2200, rb:{Rare:4,Epic:2},    d:'+4%Ra +2%Ep'},
  {id:'titanium', n:'Titanium Rod',  i:'🌙', maxKg:130, cost:7500, rb:{Legendary:4},      d:'+4% Legendary'},
  {id:'mythic',   n:'Mythic Rod',    i:'🌈', maxKg:420, cost:0,    rb:{Mythic:6,Legendary:3},d:'Craft: 20 Frags', craft:true},
];
const BAITS = [
  {id:'worm',   n:'Worm Bait',  i:'🪱', wMin:3500,wMax:5500,cost:0,   rb:{},            d:'Ikan umum'},
  {id:'shrimp', n:'Shrimp',    i:'🦐', wMin:2500,wMax:4000,cost:150, rb:{Uncommon:5},  d:'+5% Uncommon'},
  {id:'bread',  n:'Bread',     i:'🍞', wMin:2000,wMax:3500,cost:400, rb:{Rare:4},       d:'+4% Rare'},
  {id:'golden', n:'Golden',    i:'✨', wMin:1500,wMax:2800,cost:1200,rb:{Rare:4,Epic:3,Legendary:2},d:'+Rare+Epic+Leg'},
  {id:'mythic_b',n:'Mythic',   i:'🌈', wMin:800,wMax:1800, cost:4500,rb:{Legendary:5,Mythic:4},d:'+5%Leg +4%Myth'},
];
// Feature #15: Skins
const SKINS = [
  {id:'golden_sk', n:'Golden Skin',    i:'⭐', glow:'rgba(255,215,0,.7)',   cost:800,  src:'shop'},
  {id:'neon_sk',   n:'Neon Skin',      i:'💜', glow:'rgba(180,0,255,.7)',   cost:1200, src:'shop'},
  {id:'dragon_sk', n:'Dragon Skin',    i:'🔥', glow:'rgba(255,60,0,.8)',    cost:0,    src:'event'},
  {id:'ocean_sk',  n:'Ocean Skin',     i:'🌊', glow:'rgba(0,200,255,.7)',   cost:0,    src:'chest'},
  {id:'rainbow_sk',n:'Rainbow Skin',   i:'🌈', glow:'rgba(255,80,200,.7)', cost:3000, src:'shop'},
];
const SKILLS_DATA = [
  {id:'luck',  n:'Luck',       i:'🍀', d:'Rare+2%/lv',  max:5, cp:300},
  {id:'str',   n:'Strength',   i:'💪', d:'+12kg/lv',    max:5, cp:400},
  {id:'speed', n:'Speed',      i:'⚡', d:'Wait -8%/lv', max:5, cp:350},
  {id:'combo', n:'Combo Boost',i:'🔥', d:'+5%/lv',      max:5, cp:450},
  {id:'xpb',   n:'Scholar',    i:'📚', d:'XP+15%/lv',   max:3, cp:600},
  {id:'coinb', n:'Merchant',   i:'💰', d:'Coin+10%/lv', max:3, cp:700},
  {id:'detect',n:'Detection',  i:'👁️', d:'Rare shadow',  max:3, cp:500},
];
const PETS_DATA = [
  {id:'otter',   n:'Otter',          i:'🦦', cm:1.1, xm:1,   d:'Coin +10%',         cost:1000, bn:{}},
  {id:'seagull', n:'Seagull',        i:'🦅', cm:1,   xm:1,   d:'Rare alert',         cost:2000, bn:{Rare:3}},
  {id:'catfish', n:'Catfish Spirit', i:'🐈', cm:1,   xm:1.1, d:'Luck+XP',            cost:3500, bn:{Rare:2,Epic:2}},
  {id:'dragon',  n:'Crypto Dragon',  i:'🐉', cm:1,   xm:1,   d:'+Leg+Myth',          cost:10000,bn:{Legendary:3,Mythic:2}},
];
const BOSSES = [
  {n:'KRAKEN',      i:'🐙', rw:{coins:3000,gems:8,frags:8},  hp:8,  d:'Gurita raksasa!'},
  {n:'GIANT TUNA',  i:'🐋', rw:{coins:2000,gems:5,frags:5},  hp:6,  d:'Tuna terbesar!'},
  {n:'PHANTOM SHARK',i:'🦈',rw:{coins:4000,gems:10,frags:12},hp:10, d:'Hiu hantu!'},
  {n:'SEA DRAGON',  i:'🐉', rw:{coins:6000,gems:15,frags:20},hp:15, d:'Naga laut!'},
];
const CHESTS = [
  {n:'Peti Kayu',  i:'📦', rw:()=>({coins:150+~~(Math.random()*150),bait:'worm',bq:3})},
  {n:'Peti Perak', i:'🎁', rw:()=>({coins:350+~~(Math.random()*250),gems:1,bait:'golden',bq:1})},
  {n:'Peti Emas',  i:'🏆', rw:()=>({coins:900+~~(Math.random()*600),gems:2,frags:4})},
  {n:'Peti Mythic',i:'🌈', rw:()=>({coins:2200+~~(Math.random()*1800),gems:5,frags:10})},
];
// Feature #17: Bottles
const BOTTLES = [
  {msg:'⚓ "Berlayarlah ke timur..."', rw:()=>({coins:200})},
  {msg:'💌 "Aku menunggu di dermaga..."', rw:()=>({coins:500,gems:1})},
  {msg:'🗺️ "Harta ada di koordinat X!"', rw:()=>({coins:1000,frags:3})},
  {msg:'🔮 "Ikan emas menunggu yang sabar..."', rw:()=>({bait:'golden',bq:2})},
  {msg:'💎 "Temukan Mythic di palung tergelap..."', rw:()=>({gems:3,frags:2})},
];
const DAILY_REWARDS = [
  {d:1, i:'💰', t:'100 Coin',   fn(){G.coins+=100;}},
  {d:2, i:'💰', t:'200 Coin',   fn(){G.coins+=200;}},
  {d:3, i:'🦐', t:'Shrimp×3',  fn(){addBait('shrimp',3);}},
  {d:4, i:'💰', t:'400 Coin',   fn(){G.coins+=400;}},
  {d:5, i:'💎', t:'1 Diamond',  fn(){G.gems+=1;}},
  {d:6, i:'✨', t:'Golden×2',  fn(){addBait('golden',2);}},
  {d:7, i:'🌈', t:'800💰+3💎', fn(){G.coins+=800;G.gems+=3;}},
];
const ACHIEVEMENTS = [
  {id:'a1', n:'First Catch',   i:'🎣', d:'Tangkap ikan pertama', ty:'total',  tg:1,    rw:{coins:100}},
  {id:'a2', n:'100 Tangkap',   i:'💯', d:'Total 100 ikan',       ty:'total',  tg:100,  rw:{coins:1000,gems:3}},
  {id:'a3', n:'Combo ×5',      i:'🔥', d:'Combo 5 berturut',     ty:'combo',  tg:5,    rw:{coins:500,gems:1}},
  {id:'a4', n:'Combo ×10',     i:'⚡', d:'Combo 10 berturut',    ty:'combo',  tg:10,   rw:{coins:2000,gems:5}},
  {id:'a5', n:'Monster Fish',  i:'🏆', d:'Tangkap 100kg+',       ty:'heavy',  tg:100,  rw:{coins:3000,gems:5}},
  {id:'a6', n:'Boss Slayer',   i:'⚔️', d:'Kalahkan 3 Boss',      ty:'bosses', tg:3,    rw:{coins:5000,gems:8}},
  {id:'a7', n:'Mythic Hunter', i:'🐉', d:'Tangkap 5 Mythic',     ty:'mythic', tg:5,    rw:{coins:10000,gems:20}},
  {id:'a8', n:'Daily 7',       i:'📅', d:'Login 7 hari streak',  ty:'login',  tg:7,    rw:{gems:7,coins:700}},
  {id:'a9', n:'Millionaire',   i:'💸', d:'Kumpulkan 10000 coin', ty:'totalC', tg:10000,rw:{gems:5}},
  {id:'a10',n:'Mutation!',     i:'✨', d:'Tangkap ikan mutasi',   ty:'mut',    tg:1,    rw:{coins:800,gems:2}},
  {id:'a11',n:'Map Explorer',  i:'🗺️', d:'Unlock 3 lokasi',      ty:'maps',   tg:3,    rw:{coins:1500,gems:3}},
  {id:'a12',n:'Tourn Winner',  i:'🥇', d:'Menang turnamen',      ty:'tournW', tg:1,    rw:{gems:10,coins:3000}},
  {id:'a13',n:'Secret Fish',   i:'🌑', d:'Tangkap ikan rahasia',  ty:'secret', tg:1,    rw:{coins:20000,gems:30}},
];
const WR = {Common:[.5,2],Uncommon:[1,5],Rare:[3,15],Epic:[10,50],Legendary:[30,150],Mythic:[100,300]};
const RM = {Common:1,Uncommon:1.5,Rare:2.5,Epic:4,Legendary:8,Mythic:20};
const BASE_RATES = {Common:55,Uncommon:20,Rare:12,Epic:7,Legendary:4,Mythic:2};
const XP_TABLE = [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6500,8000,10000,12500,15500,19000,23000,28000,35000,45000,58000,75000];
const LB_NPC = [
  {n:'Gileg Pro',     catch:280,coin:52000,heavy:290,boss:6},
  {n:'Sultan Mancing',catch:210,coin:61000,heavy:305,boss:9},
  {n:'CryptoFisher',  catch:175,coin:38000,heavy:220,boss:4},
  {n:'MythicHunter',  catch:95, coin:22000,heavy:155,boss:2},
];
const EVENTS_DATA = [
  {n:'🌟 Golden Rush',   d:'Ikan langka lebih sering!',   rb:{Rare:10,Epic:5,Legendary:3}},
  {n:'💀 Phantom Night', d:'Hantu laut berkeliaran!',      rb:{Epic:8,Legendary:5,Mythic:2}},
  {n:'🌊 Tide Surge',    d:'Ombak besar datang!',          rb:{Legendary:5,Epic:5}},
  {n:'🦑 Deep Creature', d:'Makhluk dalam terlihat!',      rb:{Epic:6,Legendary:4,Mythic:3}},
];
const BOOK_REWARDS = [
  {cat:'Common',    need:5, rw:{coins:300},        claimed:false},
  {cat:'Uncommon',  need:5, rw:{coins:600},         claimed:false},
  {cat:'Rare',      need:4, rw:{gems:3,coins:500},  claimed:false},
  {cat:'Epic',      need:3, rw:{gems:5,coins:1000}, claimed:false},
  {cat:'Legendary', need:3, rw:{gems:10,coins:3000},claimed:false},
  {cat:'Mythic',    need:3, rw:{gems:20,coins:8000},claimed:false},
];

/* ═══ STATE ═══ */
let G = {
  name:'Gileg', coins:200, gems:0, xp:0, level:1, frags:0,
  rodId:'bamboo', baitId:'worm', activeSkin:null,
  ownedRods:['bamboo'], ownedBaits:{worm:999}, ownedSkins:[], ownedPets:[],
  activePet:null,
  skills:{pts:0}, boosters:{},
  inventory:{}, mutCaught:{},
  tradeCDs:{}, dailyClaimed:{}, drLastDate:null, loginStreak:0,
  mapId:'river', spot:'shallow',
  weatherId:'sunny', weatherEnd:0,
  activeEvent:null, eventEnd:0,
  combo:0, bestCombo:0,
  totalCaught:0, totalCoins:0,
  legendaryCount:0, mythicCount:0,
  heaviest:0, bossKills:0,
  mutCount:0, secretCount:0, tournWins:0,
  mapsUnlocked:['river'],
  achDone:{}, bookClaimed:{},
  hold:false,
};
const save = () => { try { localStorage.setItem('fig9', JSON.stringify(G)); } catch(e){} };
const load = () => { try { const d=localStorage.getItem('fig9'); if(d) Object.assign(G, JSON.parse(d)); } catch(e){} };

/* ═══ UTILITIES ═══ */
const $ = id => document.getElementById(id);
const setText = (id,v) => { const e=$(id); if(e) e.textContent=v; };
const fmt = n => { n=Math.floor(n||0); if(n>=1e6)return(n/1e6).toFixed(1)+'M'; if(n>=1e3)return(n/1e3).toFixed(1)+'K'; return''+n; };
const rand = (a,b) => a + Math.random()*(b-a);
const pick = arr => arr[~~(Math.random()*arr.length)];

function showNotif(icon, text, dur=3000) {
  const n=$('notif'); $('notif-icon').textContent=icon; $('notif-text').textContent=text;
  n.classList.remove('hidden'); void n.offsetWidth; n.classList.add('show');
  clearTimeout(n._t); n._t=setTimeout(()=>n.classList.remove('show'),dur);
}
let _toastT;
function toast(msg, dur=2200) {
  const t=$('toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(_toastT); _toastT=setTimeout(()=>t.classList.remove('show'),dur);
}
function openModal(id) { $(id)?.classList.remove('hidden'); }
function closeModal(id){ $(id)?.classList.add('hidden'); }
function sfx(type) {
  if(!G.sfx && $('tog-sfx') && !$('tog-sfx').checked) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    const types = {
      cast:[440,.05,.2,'sine'],bite:[880,.1,.3,'sawtooth'],
      reel:[330,.05,.08,'square'],catch:[660,.15,.4,'sine'],
      levelup:[880,.2,.6,'sine'],break:[220,.1,.3,'sawtooth'],miss:[180,.1,.25,'sawtooth'],
    };
    const [freq,vol,dur,wave] = types[type]||[440,.1,.2,'sine'];
    o.type=wave; o.frequency.setValueAtTime(freq, ctx.currentTime);
    if(type==='catch'||type==='levelup') o.frequency.exponentialRampToValueAtTime(freq*1.5, ctx.currentTime+dur*.5);
    g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+dur);
    o.start(); o.stop(ctx.currentTime+dur);
  } catch(e){}
}
function shake(n=3) {
  const el=$('world-wrap'); if(!el) return;
  el.style.transform=`translateX(${n}px)`; setTimeout(()=>el.style.transform=`translateX(-${n}px)`,80);
  setTimeout(()=>el.style.transform='',160);
}
function spawnSparks(rar) {
  const el=$('sparks'); if(!el) return;
  const colors={Common:'#4ade80',Uncommon:'#60a5fa',Rare:'#c084fc',Epic:'#fb923c',Legendary:'#f87171',Mythic:'#f472b6'};
  const col=colors[rar]||'#FFD700';
  for(let i=0;i<16;i++){
    const s=document.createElement('div'); s.className='spk';
    const ang=Math.random()*Math.PI*2, dist=40+Math.random()*60;
    s.style.cssText=`width:${3+Math.random()*4}px;height:${3+Math.random()*4}px;background:${col};top:50%;left:50%;--sx:${Math.cos(ang)*dist}px;--sy:${Math.sin(ang)*dist}px;animation-delay:${Math.random()*.2}s`;
    el.appendChild(s); setTimeout(()=>s.remove(),1000);
  }
}

/* ═══ RATES ═══ */
function calcRates() {
  const r={...BASE_RATES};
  const rod = RODS.find(x=>x.id===G.rodId)||RODS[0];
  const bait= BAITS.find(b=>b.id===G.baitId)||BAITS[0];
  const map = MAPS.find(m=>m.id===G.mapId)||MAPS[0];
  const pet = G.activePet ? PETS_DATA.find(p=>p.id===G.activePet) : null;
  const wx  = WEATHERS.find(w=>w.id===G.weatherId)||WEATHERS[0];
  const sk  = (G.skills.luck||0)*2;
  const lv  = G.level;
  const lb  = lv>=25?12:lv>=21?10:lv>=15?7:lv>=10?5:lv>=6?3:0;
  r.Common  = Math.max(0,r.Common-lb-sk);
  r.Rare   += lb*.4+sk*.3; r.Epic+=lb*.3+sk*.2; r.Legendary+=lb*.2+sk*.1; r.Mythic+=lb*.1;
  const applyB = (bonus,reduce=true) => { for(const[k,v]of Object.entries(bonus)){r[k]=(r[k]||0)+v; if(reduce)r.Common=Math.max(0,r.Common-v);} };
  applyB(rod.rb||{}); applyB(bait.rb||{}); if(pet)applyB(pet.bn||{});
  applyB(map.bn||{},false); applyB(wx.rb||{},false);
  if(G.activeEvent&&Date.now()<G.eventEnd){
    const ev=EVENTS_DATA.find(e=>e.n===G.activeEvent); if(ev)applyB(ev.rb||{},false);
  }
  const tot=Object.values(r).reduce((a,b)=>a+b,0)||1;
  const n={}; for(const[k,v]of Object.entries(r))n[k]=(v/tot)*100;
  return n;
}
function pickRar() {
  const rt=calcRates(); let roll=Math.random()*100,cum=0;
  for(const rr of['Mythic','Legendary','Epic','Rare','Uncommon','Common']){cum+=rt[rr]||0;if(roll<=cum)return rr;}
  return 'Common';
}
function pickFish(rar){ return pick(FISH[rar]); }
function rollWt(rar){ const[mn,mx]=WR[rar]; return+(mn+Math.random()*(mx-mn)).toFixed(1); }
function sizeLabel(kg){ return kg<2?'Kecil':kg<10?'Sedang':kg<50?'Besar':'Monster'; }
function calcCoin(fish,rar,wt,mutation){
  const[mn,mx]=WR[rar]; const wf=1+(wt-mn)/(mx-mn+.01);
  const pet=G.activePet?PETS_DATA.find(p=>p.id===G.activePet):null;
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
  const cm=(pet?pet.cm:1)*((G.skills.coinb||0)*.1+1)*(G.boosters.coin2>0?2:1);
  const mm=mutation?MUTATIONS.find(m=>m.id===mutation)?.mul||1:1;
  return ~~(fish.bv*wf*RM[rar]*cm*.25*mm*rod.xm);
}
function tryMutation(rar){ for(const m of MUTATIONS){if(Math.random()<m.prob+(rar!=='Common'?.02:0))return m.id;} return null; }
function checkSecret(rar){
  if(rar!=='Mythic')return null;
  const order=['bamboo','iron','carbon','titanium','mythic'];
  const ci=order.indexOf(G.rodId);
  for(const sf of SECRET_FISH){const ri=order.indexOf(sf.rodReq);if(ci>=ri&&Math.random()<sf.prob)return sf;}
  return null;
}
function addBait(id,q){ G.ownedBaits[id]=(G.ownedBaits[id]||0)+q; }
function countR(rar){ return Object.entries(G.inventory).reduce((s,[id,inv])=>{const f=FISH[rar]?.find(x=>x.id===id);return f?s+(inv?.count||inv||0):s;},0); }
function removeR(rar,n){ let r=n; for(const f of(FISH[rar]||[])){if(r<=0)break;const inv=G.inventory[f.id];if(!inv)continue;const c=inv?.count||inv||0;const t=Math.min(r,c);if(typeof inv==='object')G.inventory[f.id].count-=t;else G.inventory[f.id]-=t;if((G.inventory[f.id]?.count||G.inventory[f.id]||0)<=0)delete G.inventory[f.id];r-=t;} }

/* ═══ XP / LEVEL ═══ */
function addXP(a) {
  G.xp+=a; let leveled=false;
  while(G.level<XP_TABLE.length-1&&G.xp>=XP_TABLE[G.level]){G.level++;leveled=true;G.skills.pts=(G.skills.pts||0)+1;}
  if(leveled){
    setText('ml-sub','🎉 Level '+G.level+'!'); setText('ml-body','+1 Skill Point! Buka lokasi baru!');
    openModal('mod-levelup'); sfx('levelup');
    MAPS.forEach(m=>{if(G.level>=m.req&&!G.mapsUnlocked.includes(m.id)){G.mapsUnlocked.push(m.id);toast('🗺️ Lokasi '+m.n+' terbuka!');}});
  }
  updateHUD();
}
function xpPct(){ const c=XP_TABLE[G.level-1]||0,n=XP_TABLE[G.level]||XP_TABLE[XP_TABLE.length-1]; return Math.min(((G.xp-c)/(n-c))*100,100); }

/* ═══ HUD ═══ */
function updateHUD() {
  setText('pb-name', G.name);
  setText('xp-txt', 'Lv.'+G.level);
  const xf=$('xp-fill'); if(xf) xf.style.width=xpPct()+'%';
  setText('h-coin', fmt(G.coins));
  setText('h-gem', G.gems);
  setText('h-frag', G.frags);
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
  const bait=BAITS.find(b=>b.id===G.baitId)||BAITS[0];
  const str=(G.skills.str||0)*12;
  setText('gs-rod', rod.i+' '+rod.n);
  setText('gs-bait', bait.i+' '+bait.n);
  setText('gs-max', 'Max '+(rod.maxKg+str)+'kg');
  const skin=SKINS.find(s=>s.id===G.activeSkin);
  setText('gs-skin', skin?skin.i+' '+skin.n:'');
  setText('st-catch', G.totalCaught);
  setText('st-combo', G.bestCombo);
  setText('st-legend', G.legendaryCount);
  setText('st-streak', G.loginStreak||0);
  setText('ib-combo', G.combo>1?'🔥×'+G.combo:'');
  const map=MAPS.find(m=>m.id===G.mapId)||MAPS[0];
  setText('ib-map', map.e+' '+map.n);
  setText('map-badge', map.n);
  setText('sk-pts', (G.skills.pts||0)+' pt');
  setText('sh-coin', '💰 '+fmt(G.coins));
  // daily dot
  const dd=$('daily-dot'); if(dd) dd.style.display=canClaimDR()?'block':'none';
}

/* ═══ CANVAS SCENE ═══ */
const WORLD_W_MULT = 2.2;
let cv, ctx, worldW, worldH, viewX=0, waterY=0;
let scene_t=0, scene_running=false;
let fishArr=[], fxArr=[], plants=[], bubbles=[];
let bobber={vis:false,biting:false,x:0,y:0};
let flyBob={active:false,x:0,y:0};
let spawnIv=null;
let onCastDone=null, onBite=null;
let rainCv, rainCtx, rainDrops=[], rainAnim;

function initCanvas() {
  cv=$('cv'); ctx=cv.getContext('2d');
  rainCv=$('rain-cv');
  rainCtx=rainCv.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize',resizeCanvas);
  buildPlants();
  scene_running=true;
  requestAnimationFrame(sceneLoop);
}
function resizeCanvas() {
  const wrap=$('world-wrap'); if(!wrap)return;
  worldH=wrap.clientHeight;
  worldW=wrap.clientWidth*WORLD_W_MULT;
  const dpr=devicePixelRatio||1;
  cv.style.width=worldW+'px'; cv.style.height=worldH+'px';
  cv.width=worldW*dpr; cv.height=worldH*dpr;
  ctx.scale(dpr,dpr);
  rainCv.style.width=wrap.clientWidth+'px'; rainCv.style.height=worldH+'px';
  rainCv.width=wrap.clientWidth*dpr; rainCv.height=worldH*dpr;
  rainCtx.scale(dpr,dpr);
  waterY=worldH*.53;
  const inner=$('world-inner'); if(inner){inner.style.width=worldW+'px';inner.style.height=worldH+'px';}
  buildPlants();
}
function buildPlants() {
  plants=[];
  for(let i=0;i<14;i++) plants.push({x:rand(0,worldW),h:18+Math.random()*32,ph:Math.random()*6,col:i%3===0?'#1a6a2a':i%3===1?'#2a8a3a':'#0d4a1a'});
}
function sceneLoop(ts) {
  if(!scene_running)return;
  scene_t+=.016; drawScene(); requestAnimationFrame(sceneLoop);
}
function drawScene() {
  if(!ctx||!worldW)return;
  const m=MAPS.find(m=>m.id===G.mapId)||MAPS[0];
  const t=scene_t;
  ctx.clearRect(0,0,worldW,worldH);
  // Sky
  const skG=ctx.createLinearGradient(0,0,0,waterY);
  if(G.wxId==='night'||G.dayTime==='night'){skG.addColorStop(0,'#020818');skG.addColorStop(1,'#041230');}
  else{const s=m.id==='arctic'?'#88ccee':m.id==='deepsea'?'#220040':'#55aacc';skG.addColorStop(0,s);skG.addColorStop(1,'#cce8fc');}
  ctx.fillStyle=skG; ctx.fillRect(0,0,worldW,waterY);
  // Sun / moon
  if(G.weatherId==='night'){
    ctx.save();ctx.beginPath();ctx.arc(worldW*.07,waterY*.22,16,0,Math.PI*2);ctx.fillStyle='#ddeeff';ctx.shadowBlur=22;ctx.shadowColor='#8888ff';ctx.fill();ctx.restore();
    for(let i=0;i<20;i++){ctx.fillStyle='rgba(255,255,200,.7)';ctx.beginPath();ctx.arc((i*57)%worldW,((i*41)%(waterY*.75)),1,0,Math.PI*2);ctx.fill();}
  } else {
    ctx.save();ctx.beginPath();ctx.arc(worldW*.08,waterY*.22,22+Math.sin(t*.5)*3,0,Math.PI*2);ctx.fillStyle='#FFE144';ctx.shadowBlur=34;ctx.shadowColor='rgba(255,220,0,.7)';ctx.fill();ctx.restore();
  }
  // Clouds
  [[worldW*.08,waterY*.28,1],[worldW*.3,waterY*.17,1.2],[worldW*.58,waterY*.31,.9],[worldW*.84,waterY*.14,1.1]].forEach(([cx,cy,sc],i)=>{
    const ox=Math.sin(t*.06+i)*worldW*.04;
    ctx.save();ctx.globalAlpha=G.weatherId==='fog'?.65:.4;
    ctx.fillStyle=G.weatherId==='storm'?'#667':'#fff';
    ctx.beginPath();const x=cx+ox;ctx.arc(x,cy,13*sc,0,Math.PI*2);ctx.arc(x+16*sc,cy-4*sc,10*sc,0,Math.PI*2);ctx.arc(x+30*sc,cy,12*sc,0,Math.PI*2);ctx.fill();ctx.restore();
  });
  // Trees
  [[worldW*.03,waterY],[worldW*.16,waterY],[worldW*.96,waterY],[worldW*1.2,waterY]].forEach(([x,y])=>{
    ctx.fillStyle='#6B3A1F';ctx.fillRect(x-3,y-18,6,18);ctx.beginPath();ctx.arc(x,y-23,13,0,Math.PI*2);ctx.fillStyle='#2d6e2d';ctx.fill();ctx.beginPath();ctx.arc(x,y-34,9,0,Math.PI*2);ctx.fillStyle='#3a8a3a';ctx.fill();
  });
  // Duck & log
  ctx.font='14px serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('🦆',worldW*.15+Math.sin(t*.3)*worldW*.02,waterY-6);
  const lx=(worldW*.4+t*5)%(worldW*.65)+worldW*.12;
  ctx.save();ctx.translate(lx,waterY+Math.sin(t*.7)*2);ctx.fillStyle='#7B4B2A';ctx.fillRect(-22,-4,44,8);ctx.restore();
  // Water gradient
  const wG=ctx.createLinearGradient(0,waterY,0,worldH);
  wG.addColorStop(0,m.wc||'#0099cc');wG.addColorStop(.5,'#003388');wG.addColorStop(1,'#001122');
  ctx.fillStyle=wG;ctx.fillRect(0,waterY,worldW,worldH-waterY);
  // Waves
  ctx.beginPath();ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;
  for(let x=0;x<=worldW;x+=3){const wy=waterY+Math.sin(x*.022+t*2)*3+Math.sin(x*.05+t*1.4)*1.5;x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);}ctx.stroke();
  ctx.beginPath();ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=1;
  for(let x=0;x<=worldW;x+=4){const wy=waterY+4+Math.sin(x*.03+t*1.8)*2;x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);}ctx.stroke();
  // Underwater plants (Feature #19)
  plants.forEach(p=>{
    const sw=Math.sin(t*1.3+p.ph)*8;
    ctx.beginPath();ctx.moveTo(p.x,worldH);ctx.quadraticCurveTo(p.x+sw,worldH-p.h*.5,p.x+sw*1.5,worldH-p.h);
    ctx.strokeStyle=p.col;ctx.lineWidth=3.5;ctx.lineCap='round';ctx.stroke();
    ctx.beginPath();ctx.arc(p.x+sw*1.5,worldH-p.h,4,0,Math.PI*2);ctx.fillStyle='#2a8a3a';ctx.fill();
  });
  // Bubbles UW (Feature #19)
  if(Math.random()<.03) fxArr.push({tp:'bubble',x:rand(0,worldW),y:worldH,vy:-(0.4+Math.random()*.6),vx:(Math.random()-.5)*.3,r:2+Math.random()*3,life:1});
  // Swim fish (Feature #19 + #2)
  fishArr=fishArr.filter(f=>!f.dead);
  fishArr.forEach(f=>{
    if(!f.isJump){f.x+=f.vx;f.y+=Math.sin(t*f.fr+f.ph)*f.amp;if(f.x>worldW+80||f.x<-80)f.dead=true;}
    else{f.vy+=.55;f.y+=f.vy;f.x+=f.vx;if(f.y>worldH+50||scene_t-f.birth>3)f.dead=true;}
    if(!f.dead)drawFish(f);
  });
  // FX
  fxArr=fxArr.filter(e=>e.life>0);
  fxArr.forEach(e=>{
    e.life-=.025;e.x+=(e.vx||0);e.y+=(e.vy||0);if(e.tp==='particle')e.vy+=.05;if(e.tp==='bubble')e.vy-=.02;
    ctx.save();ctx.globalAlpha=Math.max(0,e.life);
    if(e.tp==='particle'){ctx.beginPath();ctx.arc(e.x,e.y,Math.max(.1,e.r),0,Math.PI*2);ctx.fillStyle=e.col||'#7fd8f8';ctx.fill();}
    else if(e.tp==='bubble'){ctx.beginPath();ctx.arc(e.x,e.y,Math.max(.1,e.r),0,Math.PI*2);ctx.strokeStyle='rgba(180,230,255,.6)';ctx.lineWidth=1;ctx.stroke();}
    else if(e.tp==='flash'){ctx.beginPath();ctx.arc(e.x,e.y,Math.max(.1,e.r*e.life*2),0,Math.PI*2);ctx.fillStyle=e.col;ctx.fill();}
    ctx.restore();
  });
  // Rod
  const rx=viewX+worldW*.82/WORLD_W_MULT;
  ctx.beginPath();ctx.moveTo(rx,waterY*.28-38);ctx.lineTo(rx,waterY*.28);
  const rG=ctx.createLinearGradient(rx,waterY*.28-38,rx,waterY*.28);rG.addColorStop(0,'#5c2a0f');rG.addColorStop(1,'#C8A060');
  ctx.strokeStyle=rG;ctx.lineWidth=4.5;ctx.lineCap='round';ctx.stroke();
  // Skin glow
  const skin=SKINS.find(s=>s.id===G.activeSkin);
  if(skin){ctx.save();ctx.shadowBlur=18;ctx.shadowColor=skin.glow;ctx.strokeStyle=skin.glow;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(rx,waterY*.28-38);ctx.lineTo(rx,waterY*.28);ctx.stroke();ctx.restore();}
  // Line + bobber
  if(bobber.vis||flyBob.active){
    const bx=bobber.vis?bobber.x:flyBob.x;const by_raw=bobber.vis?(bobber.biting?waterY+8+Math.sin(t*6)*4:waterY+Math.sin(t*2.5)*3):flyBob.y;
    ctx.beginPath();ctx.moveTo(rx,waterY*.28);ctx.lineTo(bx,by_raw);
    ctx.strokeStyle=bobber.biting?'rgba(255,120,0,.9)':'rgba(255,255,255,.45)';ctx.lineWidth=bobber.biting?2.5:1.3;ctx.stroke();
    drawBobber(bx,by_raw);
  }
}
function drawFish(f) {
  ctx.save();ctx.translate(f.x,f.y);if(f.vx<0)ctx.scale(-1,1);
  if(f.glow){ctx.shadowBlur=f.rar==='Mythic'?24:f.rar==='Legendary'?16:8;ctx.shadowColor=f.gc||'#FFE144';}
  if(f.mut==='ghost')ctx.globalAlpha=.5;
  ctx.font=`${f.sz}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(f.ico,0,0);
  ctx.restore();
}
function drawBobber(x,y) {
  ctx.beginPath();ctx.arc(x,y-4,6,Math.PI,0);ctx.fillStyle=bobber.biting?'#f97316':'#ef4444';ctx.fill();
  ctx.beginPath();ctx.arc(x,y+2,6,0,Math.PI);ctx.fillStyle='#fff';ctx.fill();
  ctx.fillStyle='#444';ctx.fillRect(x-6,y-1,12,2);
  if(bobber.biting){ctx.save();ctx.shadowBlur=18;ctx.shadowColor='#f97316';ctx.beginPath();ctx.arc(x,y-1,8,0,Math.PI*2);ctx.strokeStyle='rgba(255,130,0,.6)';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();}
}
function splash(x,y,n=12) {
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*3;fxArr.push({tp:'particle',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2.8,r:2+Math.random()*3,life:.7+Math.random()*.3,col:'#7fd8f8'});}
}
function spawnAmbFish() {
  const go=Math.random()>.5;const sp=(.4+Math.random()*.9)*(go?1:-1);
  const rars=['Common','Uncommon','Rare'],w=[60,28,12];let r=Math.random()*100,cum=0,rar='Common';
  for(let i=0;i<rars.length;i++){cum+=w[i];if(r<=cum){rar=rars[i];break;}}
  const icons={Common:'🐟',Uncommon:'🐠',Rare:'🐡'};const gc={Common:'#aaffee',Uncommon:'#4499ff',Rare:'#aa55ff'};
  fishArr.push({x:go?-50:worldW+50,y:waterY+18+Math.random()*(worldH-waterY-36),vx:sp,fr:1+Math.random()*2,ph:Math.random()*6,amp:1.5+Math.random()*2,ico:icons[rar],sz:14+Math.random()*10,glow:rar==='Rare',gc:gc[rar],rar});
}
function spawnGlowFish(ico,rar,col) {
  const go=Math.random()>.5;fishArr.push({x:go?-60:worldW+60,y:waterY+10,vx:(.8+Math.random()*.9)*(go?1:-1),fr:2.8,ph:0,amp:.7,ico,sz:22,glow:true,gc:col||'#FFE144',rar});
}
function doFishJump(ico) {
  fishArr.push({x:bobber.x||worldW/2,y:waterY,vy:-9,vx:(Math.random()-.5)*3,ico,sz:28,isJump:true,birth:scene_t,glow:true,gc:'#FFD700',dead:false});
}
function initRain() {
  rainDrops=Array.from({length:80},()=>({x:rand(0,rainCv.width/devicePixelRatio),y:rand(0,worldH),l:8+Math.random()*14,sp:4+Math.random()*6}));
  cancelAnimationFrame(rainAnim);
  function loop(){
    rainCtx.clearRect(0,0,rainCv.width,rainCv.height);
    rainCtx.strokeStyle='rgba(170,210,240,.45)';rainCtx.lineWidth=1;
    rainDrops.forEach(d=>{rainCtx.beginPath();rainCtx.moveTo(d.x,d.y);rainCtx.lineTo(d.x-3,d.y+d.l);rainCtx.stroke();d.y+=d.sp;if(d.y>worldH){d.y=-20;d.x=rand(0,rainCv.width/devicePixelRatio);}});
    if(['rain','storm'].includes(G.weatherId)) rainAnim=requestAnimationFrame(loop);
  }
  loop();
}

/* ═══ STATE MACHINE ═══ */
const STATES=['idle','cast','wait','bite','reel','chest','chest-open','bottle','bottle-open','boss','break','miss','result','tourn'];
let state='idle', pendingCatch=null, biteTimer=null, biteIv=null;
let mgIv=null, mgCursor=50, mgCatch=0, mgDir=1, mgOutT=0, mgZL=22, mgZW=56, mgFishPwr=1;
let waitArcIv=null;

function setState(s) {
  state=s;
  STATES.forEach(id=>{
    const el=$('s-'+id); if(!el)return;
    el.classList.toggle('active', id===s);
    el.classList.toggle('hidden', id!==s);
  });
}
function resetState() { if(cv)resetScene(); setState('idle'); }

function doResetScene(){
  clearInterval(spawnIv); clearInterval(mgIv); clearTimeout(biteTimer); clearInterval(biteIv);
  fishArr=[]; fxArr=[]; bobber.vis=false; bobber.biting=false; flyBob.active=false; pendingCatch=null;
}
function resetScene(){ doResetScene(); }

/* CAST */
function doCast() {
  if(state!=='idle')return;
  setState('cast'); sfx('cast');
  const bx=viewX+worldW*.18+Math.random()*worldW*.3;
  const sx=viewX+worldW*.8, sy=waterY*.3;
  const dur=650, t0=performance.now();
  flyBob={active:true,x:sx,y:sy};
  function fly(now){
    const p=Math.min((now-t0)/dur,1),ep=p<.5?2*p*p:-1+(4-2*p)*p;
    flyBob.x=sx+(bx-sx)*ep; flyBob.y=sy+(waterY-sy)*ep-Math.sin(p*Math.PI)*65;
    if(p<1){requestAnimationFrame(fly);return;}
    flyBob.active=false; bobber.vis=true; bobber.x=bx; bobber.y=waterY;
    splash(bx,waterY,14); sfx('reel');
    setState('wait'); startWaitArc();
    clearInterval(spawnIv);spawnIv=setInterval(()=>{spawnAmbFish();},900+Math.random()*500);
    const bait=BAITS.find(b=>b.id===G.baitId)||BAITS[0];
    const sk=1-Math.min((G.skills.speed||0)*.08,.4);
    const wt=(bait.wMin+Math.random()*(bait.wMax-bait.wMin))*sk;
    setTimeout(()=>{if(state==='wait')triggerBite();},wt);
    setTimeout(()=>{if(state==='wait')checkRareSpawn();},5000+Math.random()*5000);
    if(onCastDone)onCastDone();
  }
  requestAnimationFrame(fly);
}

/* WAIT ARC */
function startWaitArc(){
  const arc=$('ring-arc'); if(arc)arc.style.strokeDashoffset='214';
  clearInterval(waitArcIv); let prog=0;
  const bait=BAITS.find(b=>b.id===G.baitId)||BAITS[0];
  const sk=1-Math.min((G.skills.speed||0)*.08,.4);
  const avg=(bait.wMin+bait.wMax)/2*sk;
  waitArcIv=setInterval(()=>{prog=Math.min(prog+214/(avg/50),214);const a=$('ring-arc');if(a)a.style.strokeDashoffset=214-prog;if(prog>=214)clearInterval(waitArcIv);},50);
}
function stopWaitArc(){clearInterval(waitArcIv);const a=$('ring-arc');if(a)a.style.strokeDashoffset='214';}

/* BITE */
function triggerBite() {
  if(state!=='wait')return;
  stopWaitArc(); clearInterval(spawnIv);
  const roll=Math.random();
  if(roll<.08){pendingCatch={type:'chest'};setBite();}
  else if(roll<.13){pendingCatch={type:'bottle'};setBite();}
  else {
    const rar=pickRar();
    const secret=checkSecret(rar);
    if(secret){
      pendingCatch={type:'secret',fish:secret,rar:'Mythic',wt:rollWt('Mythic')*2};
      setBite(); sfx('bite');
      $('secret-flash')?.classList.remove('hidden');
      setTimeout(()=>$('secret-flash')?.classList.add('hidden'),2500);
      shake(5); spawnGlowFish(secret.i,'Mythic','rgba(200,0,200,.8)');
      setText('ms-icon',secret.i); setText('ms-title',secret.n+' TERDETEKSI!');setText('ms-desc','Gunakan rod terbaik!');
      openModal('mod-secret'); showNotif('🌑',secret.n+' TERDETEKSI!');
    } else {
      const fish=pickFish(rar); const wt=rollWt(rar); const mutation=tryMutation(rar);
      pendingCatch={type:'fish',rar,fish,wt,mutation};
      if(['Rare','Epic','Legendary','Mythic'].includes(rar)){
        const gcol={Rare:'#c084fc',Epic:'#fb923c',Legendary:'#f87171',Mythic:'#f472b6'};
        spawnGlowFish(fish.i,rar,gcol[rar]);
        const rIco={Rare:'🌟',Epic:'🔥',Legendary:'⭐',Mythic:'🌈'};
        showNotif(rIco[rar]||'✨',rar+': '+fish.n+'!');
      }
      if(mutation){showNotif('✨','MUTASI: '+fish.n+'!');const md=$('mut-detected');if(md)md.classList.remove('hidden');}
      else{const md=$('mut-detected');if(md)md.classList.add('hidden');}
      setBite();
    }
  }
}
function setBite(){
  setState('bite'); bobber.biting=true; bobber.y=waterY+5; sfx('bite');
  const s=Date.now(); biteTimer=setTimeout(()=>{if(state==='bite')missState();},3500);
  clearInterval(biteIv); biteIv=setInterval(()=>{const p=Math.max(0,100-((Date.now()-s)/3500)*100);const e=$('bite-fill');if(e)e.style.width=p+'%';if(p<=0)clearInterval(biteIv);},40);
}

/* PULL */
function doPull(){
  if(state!=='bite')return;
  clearTimeout(biteTimer);clearInterval(biteIv);bobber.biting=false;
  const pt=pendingCatch?.type;
  if(pt==='chest'){setState('chest');setText('chest-icon',pick(CHESTS).i);pendingCatch={type:'chest',chest:pick(CHESTS)};return;}
  if(pt==='bottle'){setState('bottle');return;}
  if(pt==='boss'){setState('boss');startBoss();return;}
  if(!pendingCatch)return;
  const{fish,rar,wt,mutation}=pendingCatch;
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];const str=(G.skills.str||0)*12;
  if(wt>rod.maxKg+str){
    setState('break');setText('break-msg',(fish.n||'Ikan')+' '+wt+'kg > max '+(rod.maxKg+str)+'kg!');
    resetScene();sfx('break');G.combo=0;pendingCatch=null;return;
  }
  startReel(fish,rar,wt,mutation);
}

/* REEL MINI GAME */
function startReel(fish,rar,wt,mutation){
  setState('reel');const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];const str=(G.skills.str||0)*12;
  const ratio=wt/(rod.maxKg+str+.01);
  setText('mg-icon',fish.i||fish.ico);setText('mg-weight',wt+'kg');
  const rb=$('mg-rarity');if(rb){rb.textContent=rar.toUpperCase();rb.className='rarity-badge rar-'+rar;}
  mgCursor=50;mgCatch=0;mgOutT=0;mgDir=1;
  mgFishPwr=.7+ratio*2.4;mgZW=Math.max(20,58-ratio*30);mgZL=Math.max(6,50-mgZW/2);
  const zone=$('tz-zone'),dl=$('tz-left'),dr=$('tz-right');
  if(zone){zone.style.left=mgZL+'%';zone.style.width=mgZW+'%';}
  if(dl)dl.style.width=mgZL+'%';if(dr)dr.style.width=(100-mgZL-mgZW)+'%';
  mgCatch=0;clearInterval(mgIv);mgIv=setInterval(mgTick,40);sfx('reel');
}
function mgTick(){
  if(state!=='reel'){clearInterval(mgIv);return;}
  mgCursor+=mgFishPwr*(mgDir)*(1+Math.random()*.5);
  if(Math.random()<.018)mgDir*=-1;
  if(G.hold){mgCursor+=(50-mgCursor)*.18;}
  mgCursor=Math.max(0,Math.min(100,mgCursor));
  const inZ=mgCursor>=mgZL&&mgCursor<=(mgZL+mgZW);
  const spd=1+(G.skills.speed||0)*.04;
  if(inZ){mgCatch=Math.min(100,mgCatch+(G.hold?2.8*spd:.5));mgOutT=0;setText('tension-msg','');}
  else{mgCatch=Math.max(0,mgCatch-2.5);mgOutT+=40;const pct=(mgCursor<mgZL?mgZL-mgCursor:mgCursor-(mgZL+mgZW))/mgZL;setText('tension-msg',pct>.7?'⚠️ TALI HAMPIR PUTUS!':pct>.3?'⚡ Jaga cursor!':'');}
  const cur=$('tz-cursor');if(cur)cur.style.left=(mgCursor-3.5)+'%';
  const pf=$('cp-fill');if(pf)pf.style.width=mgCatch+'%';
  setText('cp-pct',~~mgCatch+'%');
  if(mgCatch>=100){clearInterval(mgIv);mgIv=null;setTimeout(catchFish,80);}
  if(mgOutT>=2800){clearInterval(mgIv);mgIv=null;setState('break');setText('break-msg','Tali putus! Ikan kabur!');resetScene();G.combo=0;pendingCatch=null;sfx('break');}
}
function setHold(v){ G.hold=v; const b=$('btn-hold');if(b)b.classList.toggle('active',v); }
function missState(){if(state!=='bite')return;clearInterval(biteIv);bobber.biting=false;resetScene();G.combo=0;pendingCatch=null;setState('miss');sfx('miss');}

/* CATCH FISH */
function catchFish(){
  if(!pendingCatch)return;
  const{fish,rar,wt,mutation,type}=pendingCatch; pendingCatch=null;
  clearInterval(mgIv); const isSecret=type==='secret';
  const coins=calcCoin(fish,rar,wt,mutation);
  const xpMap={Common:10,Uncommon:22,Rare:45,Epic:90,Legendary:220,Mythic:550};
  const pet=G.activePet?PETS_DATA.find(p=>p.id===G.activePet):null;
  const xm=(pet?pet.xm:1)*((G.skills.xpb||0)*.15+1)*(G.boosters.xp2>0?2:1);
  const xp=~~((xpMap[rar]||10)*xm*(isSecret?5:1));
  const gems=rar==='Epic'?1:rar==='Legendary'?3:rar==='Mythic'?10:0;
  const frags=rar==='Rare'?1:rar==='Epic'?2:rar==='Legendary'?3:rar==='Mythic'?5:0;
  const fid=fish.id||fish.n;
  G.inventory[fid]=G.inventory[fid]||{count:0,totalWeight:0,maxWt:0};
  G.inventory[fid].count++;G.inventory[fid].totalWeight=+((G.inventory[fid].totalWeight||0)+(wt||0)).toFixed(1);
  G.inventory[fid].maxWt=Math.max(G.inventory[fid].maxWt||0,wt||0);
  if(mutation)G.mutCaught[fid+'_'+mutation]=(G.mutCaught[fid+'_'+mutation]||0)+1;
  G.totalCaught++;G.coins+=coins;G.gems+=gems;G.frags+=frags;G.totalCoins+=coins;
  if(G.boosters.xp2>0)G.boosters.xp2--;if(G.boosters.coin2>0)G.boosters.coin2--;
  if(rar==='Legendary'||rar==='Mythic')G.legendaryCount++;if(rar==='Mythic')G.mythicCount++;
  if(wt>G.heaviest)G.heaviest=+wt;if(mutation)G.mutCount++;if(isSecret)G.secretCount++;
  G.combo++;if(G.combo>G.bestCombo)G.bestCombo=G.combo;
  if(tournActive&&wt>tournBest){tournBest=wt;tournBestFish=fish.i+' '+fish.n+' ('+wt+'kg)';setText('tl-best',tournBestFish);}
  const combMul=1+(G.skills.combo||0)*.05;
  const cBonus=G.combo>=10?~~(coins*.5*combMul):G.combo>=5?~~(coins*.2*combMul):G.combo>=3?~~(coins*.1*combMul):0;
  if(cBonus>0)G.coins+=cBonus;
  addXP(xp); checkAchs(); doFishJump(fish.i);
  setTimeout(()=>{bobber.vis=false;splash(bobber.x,waterY,18);sfx('catch');},250);
  showResult(fish,rar,wt,coins,xp,gems,frags,mutation,cBonus,isSecret);
  updateHUD();save();
}
function showResult(fish,rar,wt,coins,xp,gems,frags,mutation,cBonus,isSecret){
  setState('result');
  const card=$('result-card');if(card)card.className='result-card rc-'+rar;
  setText('r-icon',fish.i||fish.ico);
  const rb=$('r-rarity');if(rb){rb.textContent=isSecret?'SECRET!':rar.toUpperCase();rb.className='rarity-badge rar-'+rar;}
  setText('r-size',sizeLabel(wt));setText('r-kg',wt+'kg');setText('r-name',fish.n||fish.name);
  const rm=$('r-mut');if(rm)rm.classList.toggle('hidden',!mutation);
  const rmt=$('r-mut-type');if(rmt){rmt.textContent=mutation?'✨ '+MUTATIONS.find(m=>m.id===mutation)?.n+' Fish!':'';rmt.classList.toggle('hidden',!mutation);}
  setText('r-coin','+'+fmt(coins)+'💰');setText('r-xp','+'+xp+'XP');
  let extra='';if(gems)extra+='💎+'+gems+' ';if(frags)extra+='🔩+'+frags;setText('r-extra',extra);
  let bonus='';if(cBonus>0)bonus='🔥 COMBO ×'+G.combo+' +'+fmt(cBonus)+'💰';else if(isSecret)bonus='🌑 SECRET FISH!';else if(rar==='Mythic')bonus='🌈 MYTHIC RARE!';else if(wt>=50)bonus='🏆 MONSTER FISH!';
  setText('r-bonus',bonus);spawnSparks(rar);
}

/* CHEST (#17 treasure) */
let _chest=null;
function openChestUI(){
  const tier=Math.random()<.05?3:Math.random()<.2?2:Math.random()<.4?1:0;
  _chest=CHESTS[tier];setText('chest-icon',_chest.i);setText('chest-title',_chest.n+'!');
  bobber.vis=false;splash(bobber.x,waterY,20);shake();sfx('catch');
  setState('chest');
}
function doOpenChest(){
  if(!_chest)return;const rwd=_chest.rw();
  G.coins+=rwd.coins||0;G.gems+=rwd.gems||0;G.frags+=rwd.frags||0;
  if(rwd.bait)addBait(rwd.bait,rwd.bq||1);
  if(Math.random()<.15&&!G.ownedSkins.includes('ocean_sk'))G.ownedSkins.push('ocean_sk');
  const oi=$('chest-result-icon');if(oi){oi.textContent=_chest.i;oi.style.animation='none';void oi.offsetWidth;oi.style.animation='popIn .5s cubic-bezier(.34,1.56,.64,1)';}
  setText('chest-result-title',_chest.n+' Dibuka!');
  const chips=[];if(rwd.coins)chips.push('+'+rwd.coins+'💰');if(rwd.gems)chips.push('+'+rwd.gems+'💎');if(rwd.frags)chips.push('+'+rwd.frags+'🔩');if(rwd.bait)chips.push(BAITS.find(b=>b.id===rwd.bait)?.i+'×'+(rwd.bq||1));
  $('chest-rewards').innerHTML=chips.map(c=>'<span class="rwchip">'+c+'</span>').join('');
  setState('chest-open');sfx('levelup');updateHUD();save();
}
function doOpenBottle(){
  const b=pick(BOTTLES);const rwd=b.rw();
  G.coins+=rwd.coins||0;G.gems+=rwd.gems||0;G.frags+=rwd.frags||0;
  if(rwd.bait)addBait(rwd.bait,rwd.bq||1);
  setText('bottle-msg',b.msg);
  const chips=[];if(rwd.coins)chips.push('+'+rwd.coins+'💰');if(rwd.gems)chips.push('+'+rwd.gems+'💎');if(rwd.frags)chips.push('+'+rwd.frags+'🔩');if(rwd.bait)chips.push(BAITS.find(b2=>b2.id===rwd.bait)?.i);
  $('bottle-rewards').innerHTML=chips.map(c=>'<span class="rwchip">'+c+'</span>').join('');
  setState('bottle-open');sfx('catch');updateHUD();save();
}

/* BOSS */
let bossData=null,bossHp=0,bossCooldown=0;
function triggerBossEvent(){
  const now=Date.now();if(now<bossCooldown||state!=='wait')return;bossCooldown=now+7*60000;
  bossData=pick(BOSSES);pendingCatch={type:'boss'};
  stopWaitArc();setBite();sfx('break');shake(4);
  setText('mb-icon',bossData.i);setText('mb-title','⚠️ '+bossData.n+' MUNCUL!');setText('mb-desc',bossData.d);
  openModal('mod-boss-warn');showNotif('⚠️','BOSS: '+bossData.n+'!');
}
function startBoss(){
  bossHp=bossData.hp;setText('boss-icon',bossData.i);setText('boss-title','⚔️ '+bossData.n);setText('boss-desc',bossData.d);
  const r=bossData.rw;
  $('boss-loot').innerHTML=['💰'+r.coins,'💎'+r.gems,'🔩'+r.frags].map(t=>'<span class="boss-chip">'+t+'</span>').join('');
  const hf=$('boss-hp-fill');if(hf)hf.style.width='100%';setText('boss-hp-txt',bossHp+'/'+bossData.hp);
  bobber.vis=false;splash(bobber.x,waterY,24);sfx('break');
}
function hitBoss(){
  if(!bossData||state!=='boss')return;
  bossHp--;const pct=Math.max(0,bossHp/bossData.hp*100);
  const hf=$('boss-hp-fill');if(hf)hf.style.width=pct+'%';setText('boss-hp-txt',bossHp+'/'+bossData.hp);
  sfx('reel');shake();
  if(bossHp<=0){
    const r=bossData.rw;G.coins+=r.coins;G.gems+=r.gems;G.frags+=r.frags;
    G.legendaryCount++;G.mythicCount++;G.totalCaught++;G.bossKills=(G.bossKills||0)+1;
    const f=pick(FISH.Mythic);G.inventory[f.id]=G.inventory[f.id]||{count:0,totalWeight:0,maxWt:0};G.inventory[f.id].count++;G.inventory[f.id].totalWeight+=300;
    addXP(500);G.combo++;if(G.combo>G.bestCombo)G.bestCombo=G.combo;checkAchs();
    doFishJump(bossData.i);setTimeout(()=>{splash(bobber.x,waterY,30);},300);
    showResult({i:bossData.i,n:bossData.n,id:bossData.n},'Mythic',999,r.coins,500,r.gems,r.frags,null,0,false);
    spawnSparks('Mythic');updateHUD();save();bossData=null;
  }
}

/* RARE SPAWN */
let _rareCD=0;
function checkRareSpawn(){
  if(Date.now()<_rareCD||state!=='wait')return;if(Math.random()>.07)return;
  _rareCD=Date.now()+55000;
  const rars=['Rare','Epic','Legendary','Mythic'],w=[60,25,12,3];let r=Math.random()*100,c=0,rar='Rare';
  for(let i=0;i<rars.length;i++){c+=w[i];if(r<=c){rar=rars[i];break;}}
  const fish=pickFish(rar);const gcol={Rare:'#c084fc',Epic:'#fb923c',Legendary:'#f87171',Mythic:'#f472b6'};
  spawnGlowFish(fish.i,rar,gcol[rar]);
  const ico={Rare:'🌟',Epic:'🔥',Legendary:'⭐',Mythic:'🌈'};showNotif(ico[rar]||'✨',rar+' '+fish.n+' terlihat!');
}

/* WEATHER (#12) */
let _wxTimer;
function updateWeather(){
  const now=Date.now();
  if(now>G.weatherEnd){
    const ws=WEATHERS.filter(w=>w.id!==G.weatherId);const nw=pick(ws);G.weatherId=nw.id;
    G.weatherEnd=now+nw.dur*60000;
    const vfx=$('weather-vfx');if(vfx){vfx.textContent=nw.i+' '+nw.n+'!';vfx.classList.remove('hidden');setTimeout(()=>vfx.classList.add('hidden'),2500);}
    const rc=$('rain-cv');const isR=['rain','storm'].includes(nw.id);
    if(rc)rc.classList.toggle('hidden',!isR);if(isR)initRain();else cancelAnimationFrame(rainAnim);
  }
  G.dayTime=Date.now()%(8*60000)<4*60000?'day':'night';
  const w=WEATHERS.find(x=>x.id===G.weatherId)||WEATHERS[0];
  setText('ib-weather',w.i+' '+w.n);
  if(now>G.eventEnd&&Math.random()<.12){
    const ev=pick(EVENTS_DATA);G.activeEvent=ev.n;G.eventEnd=now+3*60000;
    setText('ib-event',ev.n.split(' ')[0]);setText('mev-icon',ev.n.split(' ')[0]);setText('mev-title',ev.n);setText('mev-desc',ev.d);openModal('mod-event');
  }else if(now>G.eventEnd){G.activeEvent=null;setText('ib-event','');}
}

/* TOURNAMENT (#13) */
let tournActive=false,tournTimer=null,tournEnd=0,tournBest=0,tournBestFish='-';
const TOURN_NPCS=[{n:'Bot Alpha',wt:12+Math.random()*30},{n:'Bot Beta',wt:8+Math.random()*25},{n:'Bot Gamma',wt:5+Math.random()*20}];
function renderTournTab(){
  const ti=$('tourn-info');if(!ti)return;
  if(tournActive){ti.innerHTML='<div style="text-align:center;padding:20px;font-size:.85rem;color:var(--teal)">Turnamen Berlangsung! Pergi ke tab Pancing.</div>';return;}
  ti.innerHTML=`<div class="ti-header"><div class="ti-icon">🏆</div><div><div class="ti-title">Fishing Tournament</div><div class="ti-desc">Tangkap ikan terberat dalam 3 menit!</div></div></div>
    <div class="ti-rules">⏱️ Durasi: 3 menit<br>🎯 Goal: Ikan terberat menang<br>🏅 Reward: Coin + Diamond</div>
    <div class="ti-prizes"><div class="ti-prize">🥇 1st: 3000💰 + 10💎</div><div class="ti-prize">🥈 2nd: 1500💰 + 5💎</div><div class="ti-prize">🥉 3rd: 700💰 + 2💎</div></div>
    <button class="start-tourn-btn" id="btn-start-tourn">🚀 Mulai Turnamen!</button>`;
  $('btn-start-tourn')?.addEventListener('click',startTournament);
  const tlb=$('tourn-lb');if(tlb)tlb.innerHTML='';
}
function startTournament(){
  tournActive=true;tournBest=0;tournBestFish='-';setText('tl-best','-');
  setText('tourn-badge','🔴 LIVE');
  tournEnd=Date.now()+180000;
  renderTournTab();
  tournTimer=setInterval(()=>{
    const rem=Math.max(0,tournEnd-Date.now());const m=~~(rem/60000),s=~~(rem%60000/1000);
    setText('tl-timer',m+':'+String(s).padStart(2,'0'));
    if(rem<=0){clearInterval(tournTimer);endTournament();}
  },500);
  switchTab('fish');setState('tourn');
}
function endTournament(){
  tournActive=false;setText('tourn-badge','Ended');
  const all=[{n:G.name+' (Kamu)',wt:tournBest,isMe:true},...TOURN_NPCS].sort((a,b)=>b.wt-a.wt);
  const rank=all.findIndex(x=>x.isMe)+1;
  const prizes=[{coins:3000,gems:10},{coins:1500,gems:5},{coins:700,gems:2}];
  const prize=prizes[Math.min(rank-1,2)]||{coins:100,gems:0};
  G.coins+=prize.coins;G.gems+=prize.gems;if(rank===1)G.tournWins=(G.tournWins||0)+1;checkAchs();
  setText('mte-sub',['🥇 1st Place!','🥈 2nd Place!','🥉 3rd Place!'][rank-1]||'Rank #'+rank);
  const mb=$('mte-body');if(mb)mb.innerHTML=all.slice(0,4).map((e,i)=>`<div class="mte-row"><span>${['🥇','🥈','🥉','4️⃣'][i]} ${e.n}</span><span>${e.wt.toFixed(1)}kg</span></div>`).join('')+`<div class="mte-row"><span>Hadiahmu</span><span>+${prize.coins}💰 +${prize.gems}💎</span></div>`;
  openModal('mod-tourn-end');updateHUD();save();resetState();
}

/* DAILY REWARD */
const canClaimDR = () => G.drLastDate !== new Date().toDateString();
function renderDailyTab(){
  const streak=G.loginStreak||1;setText('dr-streak','🔥 Login Streak: '+streak+' Hari');
  const cal=$('dr-calendar');if(cal){cal.innerHTML=DAILY_REWARDS.map(r=>{const past=streak>r.d,isToday=streak===r.d;return`<div class="dr-day ${past?'past':isToday?'today':'future'}"><div class="dr-day-n">D${r.d}</div><div class="dr-day-ico">${past?'✅':r.i}</div><div class="dr-day-txt">${r.t}</div></div>`;}).join('');}
  const can=canClaimDR();const btn=$('btn-dr-claim');
  if(btn){btn.disabled=!can;btn.textContent=can?'🎁 Klaim Hari ke-'+streak+'!':'✓ Sudah Diklaim';}
  setText('dr-note',can?'Klaim reward harianmu!':'Kembali besok!');
}
function claimDR(){
  if(!canClaimDR())return;
  const rw=DAILY_REWARDS[Math.min((G.loginStreak||1)-1,DAILY_REWARDS.length-1)];rw.fn();
  G.drLastDate=new Date().toDateString();toast('📅 Reward Hari '+G.loginStreak+': '+rw.t+'!');sfx('levelup');
  checkAchs();updateHUD();renderDailyTab();save();
}

/* ACHIEVEMENTS */
function checkAchs(){
  ACHIEVEMENTS.forEach(a=>{
    if(G.achDone?.[a.id])return;let pass=false;
    if(a.ty==='total')pass=G.totalCaught>=a.tg;if(a.ty==='combo')pass=G.bestCombo>=a.tg;
    if(a.ty==='heavy')pass=G.heaviest>=a.tg;if(a.ty==='mythic')pass=G.mythicCount>=a.tg;
    if(a.ty==='bosses')pass=(G.bossKills||0)>=a.tg;if(a.ty==='login')pass=(G.loginStreak||0)>=a.tg;
    if(a.ty==='totalC')pass=G.totalCoins>=a.tg;if(a.ty==='mut')pass=(G.mutCount||0)>=a.tg;
    if(a.ty==='maps')pass=(G.mapsUnlocked||[]).length>=a.tg;if(a.ty==='tournW')pass=(G.tournWins||0)>=a.tg;
    if(a.ty==='secret')pass=(G.secretCount||0)>=a.tg;
    if(pass){if(!G.achDone)G.achDone={};G.achDone[a.id]=true;if(a.rw.coins)G.coins+=a.rw.coins;if(a.rw.gems)G.gems+=a.rw.gems;
      setTimeout(()=>{setText('ma-icon',a.i);setText('ma-name',a.n);setText('ma-reward',(a.rw.coins?'+'+a.rw.coins+'💰 ':'')+(a.rw.gems?'+'+a.rw.gems+'💎':''));openModal('mod-ach');},600);
      updateHUD();save();}
  });
}

/* ═══ RENDER FUNCTIONS ═══ */
/* SHOP */
function renderShop(sp='rods'){
  setText('sh-coin','💰 '+fmt(G.coins));
  if(sp==='rods'){
    $('sp-rods').innerHTML='<p class="sp-hint">Rod lebih kuat = bisa tangkap ikan lebih berat!</p><div class="shop-grid">'+
      RODS.map(rod=>{const ow=G.ownedRods.includes(rod.id),eq=G.rodId===rod.id;const pr=rod.craft?'🔩 20 Frags':rod.cost?'💰 '+fmt(rod.cost):'Gratis';
        return`<div class="sh-card ${eq?'equipped':ow?'owned':''}">
          ${eq?'<div class="sh-badge">⚡ AKTIF</div>':ow?'<div class="sh-badge">✓ Punya</div>':rod.craft?'<div class="sh-badge">🔨 Craft</div>':''}
          <div class="sh-icon">${rod.i}</div><div class="sh-name">${rod.n}</div>
          <div class="sh-desc">${rod.d}</div><div class="sh-stat">Max ${rod.maxKg}kg</div><div class="sh-price">${pr}</div>
          <button class="sh-btn ${eq?'active-btn':ow?'equip':'buy'}" data-rod="${rod.id}" ${eq?'disabled':''}>${eq?'Equipped':ow?'Pasang':rod.craft?'Craft':'Beli'}</button>
        </div>`;}).join('')+'</div>';
    $('sp-rods').querySelectorAll('[data-rod]').forEach(b=>b.addEventListener('click',()=>buyRod(b.dataset.rod)));
  }else if(sp==='baits'){
    $('sp-baits').innerHTML='<p class="sp-hint">Umpan berbeda menarik ikan berbeda!</p><div class="shop-grid">'+
      BAITS.map(bait=>{const qty=G.ownedBaits[bait.id]||0,eq=G.baitId===bait.id;
        return`<div class="sh-card ${eq?'equipped':''}">
          ${eq?'<div class="sh-badge">✓ Aktif</div>':''}
          <div class="sh-icon">${bait.i}</div><div class="sh-name">${bait.n}</div>
          <div class="sh-desc">${bait.d}</div><div class="sh-stat">Punya: ${qty>99?'∞':qty}</div><div class="sh-price">${bait.cost?'💰 '+bait.cost:'Gratis'}</div>
          <button class="sh-btn ${eq?'active-btn':'buy'}" data-bait="${bait.id}" ${eq&&!bait.cost?'disabled':''}>${eq?'Aktif':bait.cost?'Beli':'Pasang'}</button>
        </div>`;}).join('')+'</div>';
    $('sp-baits').querySelectorAll('[data-bait]').forEach(b=>b.addEventListener('click',()=>buyBait(b.dataset.bait)));
  }else if(sp==='skins'){
    // Feature #15
    $('sp-skins').innerHTML='<p class="sp-hint">Skin = tampilan berbeda! Tidak mempengaruhi kekuatan.</p><div class="shop-grid">'+
      SKINS.map(sk=>{const ow=G.ownedSkins.includes(sk.id),act=G.activeSkin===sk.id;
        const pr=sk.cost>0?'💰 '+sk.cost:sk.src==='chest'?'🎁 Dari Peti':sk.src==='event'?'🌟 Event':'Spesial';
        return`<div class="sh-card ${act?'equipped':ow?'owned':''}">
          ${act?'<div class="sh-badge">⚡ ON</div>':ow?'<div class="sh-badge">✓ Punya</div>':''}
          <div class="sh-icon">${sk.i}</div><div class="sh-name">${sk.n}</div><div class="sh-desc">Glow: ${sk.glow}</div>
          <div class="sh-skin-glow" style="color:${sk.glow}">●●● Glow Effect</div><div class="sh-price">${pr}</div>
          <button class="sh-btn ${act?'active-btn':ow?'equip':sk.cost>0?'buy':'active-btn'}" data-skin="${sk.id}">${act?'Aktif':ow?'Pasang':sk.cost>0?'Beli':'N/A'}</button>
        </div>`;}).join('')+'</div>';
    $('sp-skins').querySelectorAll('[data-skin]').forEach(b=>b.addEventListener('click',()=>{
      const sk=SKINS.find(s=>s.id===b.dataset.skin);if(!sk)return;
      if(G.activeSkin===sk.id){G.activeSkin=null;toast('Skin dilepas');renderShop('skins');save();return;}
      if(G.ownedSkins.includes(sk.id)){G.activeSkin=sk.id;toast(sk.i+' '+sk.n+' aktif!');renderShop('skins');save();return;}
      if(sk.cost>0){if(G.coins<sk.cost){toast('💸 Butuh '+sk.cost+'💰');return;}G.coins-=sk.cost;G.ownedSkins.push(sk.id);G.activeSkin=sk.id;toast('🎨 '+sk.n+' dibeli!');updateHUD();renderShop('skins');save();}
      else toast('Skin ini dari '+sk.src);
    }));
  }else if(sp==='boost'){
    const boosts=[{id:'xp2',n:'XP ×2',i:'⭐',d:'XP ganda 10 tangkap',cost:500,ef:'xp2',q:10},{id:'c2',n:'Coin ×2',i:'💰',d:'Coin ganda 10 tangkap',cost:800,ef:'coin2',q:10}];
    $('sp-boost').innerHTML='<p class="sp-hint">Boost sementara untuk grinding lebih cepat!</p><div class="shop-grid">'+boosts.map(b=>{const act=G.boosters[b.ef]>0;return`<div class="sh-card ${act?'equipped':''}"><div class="sh-icon">${b.i}</div><div class="sh-name">${b.n}</div><div class="sh-desc">${b.d}</div><div class="sh-stat">${act?'🔥 Aktif: '+G.boosters[b.ef]:''}</div><div class="sh-price">💰 ${b.cost}</div><button class="sh-btn buy" data-b="${b.ef}" data-q="${b.q}" data-c="${b.cost}">Beli</button></div>`;}).join('')+'</div>';
    $('sp-boost').querySelectorAll('[data-b]').forEach(btn=>btn.addEventListener('click',()=>{const c=+btn.dataset.c;if(G.coins<c){toast('💸 Kurang!');return;}G.coins-=c;G.boosters[btn.dataset.b]=(G.boosters[btn.dataset.b]||0)+(+btn.dataset.q);toast('🔥 Boost aktif!');updateHUD();renderShop('boost');save();}));
  }
}
function buyRod(id){
  const rod=RODS.find(r=>r.id===id);if(!rod)return;
  if(G.ownedRods.includes(id)){G.rodId=id;checkAchs();toast('⚡ '+rod.n+' dipasang!');updateHUD();renderShop('rods');save();return;}
  if(rod.craft){if(G.frags<20){toast('🔩 Butuh 20 Frags!');return;}G.frags-=20;G.ownedRods.push(id);G.rodId=id;checkAchs();toast('🌈 Mythic Rod dibuat!');updateHUD();renderShop('rods');save();return;}
  if(G.coins<rod.cost){toast('💸 Butuh '+fmt(rod.cost)+'💰');return;}
  G.coins-=rod.cost;G.ownedRods.push(id);G.rodId=id;checkAchs();toast('⬆️ '+rod.n+' dibeli!');updateHUD();renderShop('rods');save();
}
function buyBait(id){
  const b=BAITS.find(x=>x.id===id);if(!b)return;
  if(!b.cost){G.baitId=id;toast(b.i+' '+b.n+' aktif!');renderShop('baits');save();return;}
  if(G.coins<b.cost){toast('💸 Butuh '+b.cost+'💰');return;}
  G.coins-=b.cost;addBait(id,1);G.baitId=id;toast(b.i+' Dibeli!');updateHUD();renderShop('baits');save();
}

/* COLLECTION */
function renderCollection(filt='all'){
  const allCaught=Object.entries(G.inventory).flatMap(([id,inv])=>{
    const c=inv?.count||inv||0;if(!c)return[];const tw=inv?.totalWeight||0;const mw=inv?.maxWt||0;
    for(const[rar,arr]of Object.entries(FISH)){const f=arr.find(x=>x.id===id);if(f)return[{f,rar,c,tw,mw}];}
    for(const sf of SECRET_FISH){if(sf.id===id)return[{f:sf,rar:'Mythic',c,tw,mw}];}return[];
  }).filter(x=>x.c>0);
  setText('coll-badge',allCaught.length+' spesies');
  const muts=Object.keys(G.mutCaught||{});
  const shown=filt==='all'?allCaught:filt==='mut'?allCaught.filter(x=>muts.some(m=>m.startsWith(x.f.id))):allCaught.filter(x=>x.rar===filt);
  const sumEl=$('coll-summary');if(sumEl)sumEl.innerHTML=`<div class="cs-stat"><span class="v">${G.totalCaught}</span><span class="l">Total Tangkap</span></div><div class="cs-stat"><span class="v">${G.heaviest}kg</span><span class="l">Terberat</span></div><div class="cs-stat"><span class="v">${G.legendaryCount}</span><span class="l">Legend+</span></div>`;
  const filt2=$('coll-filters');if(filt2){filt2.innerHTML=['all','Common','Uncommon','Rare','Epic','Legendary','Mythic','mut'].map(f=>`<button class="filt-btn ${f===filt?'active':''}" data-f="${f}">${f==='all'?'Semua':f==='mut'?'✨Mut':f}</button>`).join('');filt2.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>renderCollection(b.dataset.f)));}
  const grid=$('coll-grid');if(!grid)return;
  if(!shown.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:rgba(255,255,255,.3)">🎣 Mulai mancing untuk mengisi koleksi!</div>';return;}
  grid.innerHTML=shown.map(({f,rar,c,mw})=>`<div class="fc">
    <div class="fi">${f.i}</div><div class="fn2">${f.n||f.name}</div>
    <div class="fcnt">×${c}</div><div class="fkg">Max ${mw}kg</div>
    <div class="frar rar-${rar}">${rar}</div>
    ${muts.some(m=>m.startsWith(f.id))?'<div class="fmut">✨ Mutasi!</div>':''}
  </div>`).join('');
}

/* CODEX (#14) */
function renderCodex(cat='all'){
  const allFish=Object.entries(FISH).flatMap(([rar,arr])=>arr.map(f=>({f,rar}))).concat(SECRET_FISH.map(sf=>({f:sf,rar:'Mythic'})));
  const caught=allFish.filter(({f})=>(G.inventory[f.id]?.count||G.inventory[f.id]||0)>0).length;
  setText('codex-badge',caught+'/'+allFish.length);
  const cats=$('codex-cats');if(cats){cats.innerHTML=['all','Common','Uncommon','Rare','Epic','Legendary','Mythic'].map(c=>`<button class="filt-btn ${c===cat?'active':''}" data-bc="${c}">${c==='all'?'Semua':c}</button>`).join('');cats.querySelectorAll('[data-bc]').forEach(b=>b.addEventListener('click',()=>renderCodex(b.dataset.bc)));}
  const shown=cat==='all'?allFish:allFish.filter(x=>x.rar===cat);
  const grid=$('codex-grid');if(!grid)return;
  grid.innerHTML=shown.map(({f,rar})=>{const c=(G.inventory[f.id]?.count||G.inventory[f.id]||0)>0;return`<div class="ce ${c?'caught':'unknown'}"><div class="ci">${f.i}</div><div class="cn">${c?f.n||f.name:'?????'}</div><div class="crar rar-${rar}">${rar}</div>${c?`<div class="cprice">💰${f.bv||'?'}</div>`:''}</div>`;}).join('');
  const rwEl=$('codex-rewards');if(!rwEl)return;
  rwEl.innerHTML='<div class="cr-title">📖 Completion Rewards</div><div class="cr-items">'+BOOK_REWARDS.map(bkr=>{const fi=allFish.filter(x=>x.rar===bkr.cat);const cgt=fi.filter(({f})=>(G.inventory[f.id]?.count||G.inventory[f.id]||0)>0).length;const done=cgt>=bkr.need;const claimed=G.bookClaimed[bkr.cat];const rws=(bkr.rw.coins?'+'+bkr.rw.coins+'💰 ':'')+(bkr.rw.gems?'+'+bkr.rw.gems+'💎':'');return`<div class="cr-item"><span class="cri-chk">${claimed?'✅':done?'🎁':'⬜'}</span><div class="cri-info"><div class="cri-n">${bkr.cat} (${cgt}/${bkr.need})</div><div class="cri-d">Tangkap semua ${bkr.cat}</div></div><div class="cri-rw">${rws}</div>${done&&!claimed?`<button class="claim-rw-btn" data-bcat="${bkr.cat}">Klaim!</button>`:''}</div>`;}).join('')+'</div>';
  rwEl.querySelectorAll('[data-bcat]').forEach(btn=>btn.addEventListener('click',()=>{const bkr=BOOK_REWARDS.find(x=>x.cat===btn.dataset.bcat);if(!bkr||G.bookClaimed[bkr.cat])return;G.bookClaimed[bkr.cat]=true;G.coins+=bkr.rw.coins||0;G.gems+=bkr.rw.gems||0;toast('📖 '+bkr.cat+' Complete! '+((bkr.rw.coins?'+'+bkr.rw.coins+'💰 ':'')+(bkr.rw.gems?'+'+bkr.rw.gems+'💎':'')));updateHUD();renderCodex(cat);save();}));
}

/* MAP (#11) */
function renderMap(){
  const g=$('map-grid');if(!g)return;
  g.innerHTML=MAPS.map(m=>{const unlocked=G.mapsUnlocked.includes(m.id)||G.level>=m.req;const sel=G.mapId===m.id;if(unlocked&&!G.mapsUnlocked.includes(m.id))G.mapsUnlocked.push(m.id);
    return`<div class="map-card ${sel?'selected':''}${unlocked?'':' locked'}" data-map="${m.id}" style="background:linear-gradient(135deg,${m.bg[0]},${m.bg[1]})">
      <div class="mc-icon">${m.e}</div><div class="mc-name">${m.n}</div><div class="mc-desc">${m.d}</div>
      <div class="mc-bonus">${m.lbl}</div>${unlocked?'':'<div class="mc-req">🔓 Req: Lv.'+m.req+'</div>'}
    </div>`;}).join('');
  g.querySelectorAll('[data-map]:not(.locked)').forEach(c=>c.addEventListener('click',()=>{G.mapId=c.dataset.map;if(!G.mapsUnlocked.includes(G.mapId))G.mapsUnlocked.push(G.mapId);checkAchs();const m=MAPS.find(x=>x.id===G.mapId);toast('🗺️ Pindah ke '+m.n+'!');renderMap();updateHUD();save();}));
}

/* SKILLS (#18) */
function renderSkills(){
  setText('sk-pts',(G.skills.pts||0)+' pt');
  const g=$('skill-grid');if(!g)return;
  g.innerHTML=SKILLS_DATA.map(sk=>{const lv=G.skills[sk.id]||0;const maxed=lv>=sk.max;const hasPts=(G.skills.pts||0)>0;const cp=sk.cp*(lv+1);return`<div class="sk-card">
    <div class="sk-icon">${sk.i}</div><div class="sk-name">${sk.n}</div><div class="sk-desc">${sk.d}</div>
    <div class="sk-level">Lv.${lv}/${sk.max}</div><div class="sk-bar-bg"><div class="sk-bar-f" style="width:${lv/sk.max*100}%"></div></div>
    <button class="sk-btn" data-sk="${sk.id}" ${maxed||!hasPts?'disabled':''}>${maxed?'MAXED':hasPts?'Upgrade (1pt)':'Butuh Pt'}</button>
  </div>`;}).join('');
  g.querySelectorAll('[data-sk]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.sk;if((G.skills.pts||0)<=0)return;const sk=SKILLS_DATA.find(s=>s.id===id);if(!sk)return;const lv=G.skills[id]||0;if(lv>=sk.max)return;G.skills.pts--;G.skills[id]=(G.skills[id]||0)+1;toast('⚡ '+sk.n+' Lv.'+(G.skills[id])+'!');updateHUD();renderSkills();save();
  }));
}

/* PETS */
function renderPets(){
  const g=$('pet-grid');if(!g)return;
  g.innerHTML=PETS_DATA.map(p=>{const ow=G.ownedPets.includes(p.id),act=G.activePet===p.id;return`<div class="pet-card ${act?'active':ow?'owned':''}">
    <div class="pet-icon">${p.i}</div><div class="pet-name">${p.n}</div><div class="pet-bonus">${p.d}</div>
    <div class="pet-status ${act?'ps-active':ow?'ps-owned':'ps-locked'}">${act?'⚡ Aktif':ow?'✓ Punya':'🔒'}</div>
    <button class="pet-btn sh-btn ${act?'active-btn':ow?'equip':'buy'}" data-pet="${p.id}" data-cost="${p.cost}">${act?'Aktif':ow?'Pasang':'💰 '+fmt(p.cost)}</button>
  </div>`;}).join('');
  g.querySelectorAll('[data-pet]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.pet;const p=PETS_DATA.find(x=>x.id===id);if(!p)return;
    if(G.activePet===id){G.activePet=null;setText('pet-badge','-');toast(p.i+' dilepas');renderPets();save();return;}
    if(G.ownedPets.includes(id)){G.activePet=id;setText('pet-badge',p.i+' '+p.n);toast(p.i+' '+p.n+' aktif!');renderPets();save();return;}
    if(G.coins<p.cost){toast('💸 Butuh '+fmt(p.cost)+'💰');return;}
    G.coins-=p.cost;G.ownedPets.push(id);G.activePet=id;setText('pet-badge',p.i+' '+p.n);toast(p.i+' '+p.n+' dibeli!');updateHUD();renderPets();save();
  }));
}

/* EXCHANGE */
const TRADES_DATA=[
  {id:'t1',from:'5× Common',ft:'Common',fq:5,to:'Golden Bait',tt:'bait',tid:'golden',tq:1,cd:0},
  {id:'t2',from:'3× Rare',ft:'Rare',fq:3,to:'Mythic Bait',tt:'bait',tid:'mythic_b',tq:1,cd:30000},
  {id:'t3',from:'2× Epic',ft:'Epic',fq:2,to:'3 Frags',tt:'frags',tq:3,cd:60000},
  {id:'t4',from:'1× Legendary',ft:'Legendary',fq:1,to:'5 Frags',tt:'frags',tq:5,cd:120000},
];
const GACHA_POOLS={
  basic:[{w:45,t:'bait',id:'worm',q:3,n:'3× Worm',i:'🪱'},{w:30,t:'bait',id:'shrimp',q:2,n:'2× Shrimp',i:'🦐'},{w:15,t:'frags',q:2,n:'2 Frags',i:'🔩'},{w:8,t:'coins',q:300,n:'300💰',i:'💰'},{w:2,t:'bait',id:'golden',q:1,n:'Golden Bait',i:'✨'}],
  premium:[{w:35,t:'bait',id:'golden',q:2,n:'2× Golden',i:'✨'},{w:25,t:'frags',q:5,n:'5 Frags',i:'🔩'},{w:20,t:'bait',id:'mythic_b',q:1,n:'Mythic Bait',i:'🌈'},{w:12,t:'coins',q:800,n:'800💰',i:'💰'},{w:8,t:'gems',q:2,n:'2 Gems',i:'💎'}],
};
function renderExchange(ep='trade'){
  if(ep==='trade'){
    $('ep-trade').innerHTML='<div class="ex-grid">'+TRADES_DATA.map(tr=>{const have=countR(tr.ft);const ok=have>=tr.fq;const cd=G.tradeCDs?.[tr.id]||0;const rem=Math.max(0,cd+tr.cd-Date.now());return`<div class="ex-card"><div class="ex-from">${tr.from}</div><div class="ex-have">Punya: ${have}</div><div class="ex-arr">→</div><div class="ex-to">${tr.to}</div>${rem>0?`<div class="ex-cd">⏰ ${Math.ceil(rem/1000)}s</div>`:''}
      <button class="trade-btn" data-tid="${tr.id}" ${!ok||rem>0?'disabled':''}>${rem>0?'CD...':'Tukar'}</button></div>`;}).join('')+'</div>';
    $('ep-trade').querySelectorAll('[data-tid]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{const tr=TRADES_DATA.find(x=>x.id===b.dataset.tid);if(!tr)return;removeR(tr.ft,tr.fq);if(tr.tt==='bait')addBait(tr.tid,tr.tq);if(tr.tt==='frags')G.frags+=tr.tq;if(!G.tradeCDs)G.tradeCDs={};G.tradeCDs[tr.id]=Date.now();toast('✅ '+tr.to+'!');updateHUD();renderExchange('trade');save();}));
  }else if(ep==='coin'){
    const deals=[{cost:100,to:'Worm×3',tt:'bait',tid:'worm',q:3},{cost:400,to:'Golden×1',tt:'bait',tid:'golden',q:1},{cost:200,to:'2 Frags',tt:'frags',q:2}];
    $('ep-coin').innerHTML='<div class="ex-grid">'+deals.map((d,i)=>`<div class="ex-card"><div class="ex-from">💰 ${d.cost}</div><div class="ex-arr">→</div><div class="ex-to">${d.to}</div><button class="trade-btn" data-ci="${i}" ${G.coins<d.cost?'disabled':''}>Tukar</button></div>`).join('')+'</div>';
    $('ep-coin').querySelectorAll('[data-ci]').forEach(b=>b.addEventListener('click',()=>{const d=deals[+b.dataset.ci];if(G.coins<d.cost)return;G.coins-=d.cost;if(d.tt==='bait')addBait(d.tid,d.q);if(d.tt==='frags')G.frags+=d.q;toast('✅ '+d.to+'!');updateHUD();renderExchange('coin');save();}));
  }else if(ep==='gacha'){
    $('ep-gacha').innerHTML=`<div class="gacha-wrap"><div class="gacha-icon">🎁</div><div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#FFE144">Mystery Gacha!</div>
      <div class="gacha-btns"><button class="gacha-btn" data-gt="basic" data-cost="300" data-cur="coins">🎁 Basic<br><small>300💰</small></button><button class="gacha-btn" data-gt="premium" data-cost="1000" data-cur="coins">✨ Premium<br><small>1000💰</small></button><button class="gacha-btn" data-gt="premium" data-cost="3" data-cur="gems">💎 Gem Box<br><small>3💎</small></button></div>
      <div id="gacha-res"></div></div>`;
    $('ep-gacha').querySelectorAll('[data-gt]').forEach(b=>b.addEventListener('click',()=>{
      const tier=b.dataset.gt,cost=+b.dataset.cost,cur=b.dataset.cur;
      if(cur==='gems'&&G.gems<cost){toast('💎 Kurang!');return;}if(cur==='coins'&&G.coins<cost){toast('💸 Kurang!');return;}
      if(cur==='gems')G.gems-=cost;else G.coins-=cost;
      const pool=GACHA_POOLS[tier]||GACHA_POOLS.basic,tot=pool.reduce((a,x)=>a+x.w,0);let r=Math.random()*tot,prize=pool[pool.length-1];
      for(const p of pool){r-=p.w;if(r<=0){prize=p;break;}}
      if(prize.t==='bait')addBait(prize.id,prize.q);if(prize.t==='frags')G.frags+=prize.q;if(prize.t==='coins')G.coins+=prize.q;if(prize.t==='gems')G.gems+=prize.q;
      $('gacha-res').innerHTML=`<div class="gacha-result" style="margin-top:10px"><div style="font-size:2.5rem">${prize.i}</div><div style="font-weight:900;font-size:.9rem">${prize.n}</div></div>`;
      sfx('catch');updateHUD();save();
    }));
  }else if(ep==='fusion'){
    const fusions=[{rf:'Common',n:3,rt:'Uncommon'},{rf:'Uncommon',n:3,rt:'Rare'},{rf:'Rare',n:3,rt:'Epic'},{rf:'Epic',n:2,rt:'Legendary'}];
    $('ep-fusion').innerHTML='<div class="ex-grid">'+fusions.map((fu,i)=>{const h=countR(fu.rf);return`<div class="ex-card"><div class="ex-from">${fu.n}× ${fu.rf}</div><div class="ex-have">Punya: ${h}</div><div class="ex-arr">→</div><div class="ex-to">1× ${fu.rt}</div><button class="trade-btn" data-fi="${i}" ${h<fu.n?'disabled':''}>${h>=fu.n?'🔀 Fuse!':'Kurang'}</button></div>`;}).join('')+'</div>';
    $('ep-fusion').querySelectorAll('[data-fi]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{const fu=fusions[+b.dataset.fi];if(countR(fu.rf)<fu.n)return;removeR(fu.rf,fu.n);const nf=pickFish(fu.rt),w=rollWt(fu.rt);G.inventory[nf.id]=G.inventory[nf.id]||{count:0,totalWeight:0,maxWt:0};G.inventory[nf.id].count++;G.inventory[nf.id].totalWeight+=w;G.totalCaught++;sfx('catch');toast('🔀 Dapat '+nf.i+' '+nf.n+'!');checkAchs();updateHUD();renderExchange('fusion');save();}));
  }else if(ep==='fragments'){
    const deals=[{cost:10,to:'Carbon Rod',tt:'rod',rid:'carbon'},{cost:20,to:'Mythic Rod',tt:'rod',rid:'mythic'},{cost:5,to:'Golden×1',tt:'bait',rid:'golden'}];
    $('ep-fragments').innerHTML=`<p style="text-align:center;font-size:.75rem;color:#94a3b8;margin-bottom:10px">🔩 Punya: ${G.frags} Frags</p><div class="ex-grid">`+deals.map((d,i)=>`<div class="ex-card"><div class="ex-from">🔩 ${d.cost} Frags</div><div class="ex-arr">→</div><div class="ex-to">${d.to}</div><button class="trade-btn" data-di="${i}" ${G.frags<d.cost?'disabled':''}>Tukar</button></div>`).join('')+'</div>';
    $('ep-fragments').querySelectorAll('[data-di]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{const d=deals[+b.dataset.di];if(G.frags<d.cost)return;G.frags-=d.cost;if(d.tt==='rod'&&!G.ownedRods.includes(d.rid))G.ownedRods.push(d.rid);if(d.tt==='bait')addBait(d.rid,1);toast('✅ '+d.to+'!');updateHUD();renderExchange('fragments');save();}));
  }
}

/* LEADERBOARD */
function renderLB(cat='catch'){
  const me={n:G.name+' (Kamu)',catch:G.totalCaught,coin:G.coins,heavy:G.heaviest,boss:G.bossKills||0,isMe:true};
  const all=[...LB_NPC,me].sort((a,b)=>b[cat]-a[cat]);
  const medals=['🥇','🥈','🥉'];
  $('lb-list').innerHTML=all.slice(0,6).map((e,i)=>{const val=cat==='catch'?e.catch+'🐟':cat==='coin'?fmt(e.coin)+'💰':cat==='heavy'?e.heavy+'kg':e.boss+'⚔️';return`<div class="lb-row ${e.isMe?'me':''}"><span class="lb-rank">${medals[i]||'#'+(i+1)}</span><div class="lb-info"><div class="lb-name">${e.n}</div><div class="lb-sub">Rank #${i+1}</div></div><span class="lb-val">${val}</span></div>`;}).join('');
}

/* ACHIEVEMENTS */
function renderAch(){
  const done=Object.keys(G.achDone||{}).length;setText('ach-badge',done+'/'+ACHIEVEMENTS.length);
  $('ach-grid').innerHTML=ACHIEVEMENTS.map(a=>{const isDone=G.achDone?.[a.id];return`<div class="ach-card ${isDone?'done':''}"><div class="ach-icon">${a.i}</div><div class="ach-name">${a.n}</div><div class="ach-desc">${a.d}</div><div class="ach-rwd">${a.rw.coins?'+'+a.rw.coins+'💰 ':''}${a.rw.gems?'+'+a.rw.gems+'💎':''}</div><div class="ach-bar-bg"><div class="ach-bar-f" style="width:${isDone?100:0}%"></div></div></div>`;}).join('');
}

/* SETTINGS */
function renderSettings(){
  $('nm-inp').value=G.name;
  $('tog-sfx').checked=G.sfx!==false;
  $('stat-detail').innerHTML=`Tangkap Total: ${G.totalCaught}<br>Coin Total: ${fmt(G.totalCoins)}<br>Terberat: ${G.heaviest}kg<br>Legendary+: ${G.legendaryCount}<br>Boss Kill: ${G.bossKills||0}<br>Mutasi: ${G.mutCount||0}<br>Login Streak: ${G.loginStreak||0}`;
}

/* TABS */
function switchTab(id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.add('hidden'));
  document.querySelectorAll('.fn').forEach(b=>{b.classList.toggle('active',b.dataset.tab===id);});
  const t=$('tab-'+id);if(t)t.classList.remove('hidden');
  // Render on open
  if(id==='collection')renderCollection();
  if(id==='codex')renderCodex();
  if(id==='shop')renderShop('rods');
  if(id==='exchange')renderExchange('trade');
  if(id==='maps')renderMap();
  if(id==='tournament')renderTournTab();
  if(id==='skills')renderSkills();
  if(id==='pets')renderPets();
  if(id==='daily')renderDailyTab();
  if(id==='leaderboard')renderLB('catch');
  if(id==='achievements')renderAch();
  if(id==='settings')renderSettings();
}

/* SPLASH CANVAS */
function initSplashCanvas(){
  const sc=$('sp-canvas');if(!sc)return;
  const sctx=sc.getContext('2d');
  function rsz(){sc.width=window.innerWidth;sc.height=window.innerHeight;}rsz();window.addEventListener('resize',rsz);
  let t=0;const fish=Array.from({length:8},()=>({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight*.7+window.innerHeight*.3,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*.5,ico:['🐟','🐠','🐡'][~~(Math.random()*3)],sz:16+Math.random()*14}));
  function loop(){t+=.016;sctx.clearRect(0,0,sc.width,sc.height);
    const bg=sctx.createLinearGradient(0,0,0,sc.height);bg.addColorStop(0,'#001433');bg.addColorStop(.5,'#003366');bg.addColorStop(1,'#0066aa');sctx.fillStyle=bg;sctx.fillRect(0,0,sc.width,sc.height);
    // Stars
    for(let i=0;i<25;i++){sctx.fillStyle='rgba(255,255,220,.7)';sctx.beginPath();sctx.arc((i*67+3)%sc.width,(i*41+7)%(sc.height*.45),1,0,Math.PI*2);sctx.fill();}
    // Waves
    sctx.beginPath();sctx.strokeStyle='rgba(0,150,255,.25)';sctx.lineWidth=3;for(let x=0;x<=sc.width;x+=4){const wy=sc.height*.62+Math.sin(x*.02+t*1.5)*18;x===0?sctx.moveTo(x,wy):sctx.lineTo(x,wy);}sctx.stroke();
    sctx.fillStyle='rgba(0,50,120,.5)';sctx.beginPath();for(let x=0;x<=sc.width;x+=4){const wy=sc.height*.64+Math.sin(x*.025+t*1.3)*14;x===0?sctx.moveTo(x,wy):sctx.lineTo(x,wy);}sctx.lineTo(sc.width,sc.height);sctx.lineTo(0,sc.height);sctx.fill();
    // Fish
    fish.forEach(f=>{f.x+=f.vx;f.y+=Math.sin(t*1.5+f.x*.01)*f.vy;if(f.x>sc.width+40)f.x=-40;if(f.x<-40)f.x=sc.width+40;sctx.save();sctx.translate(f.x,f.y);if(f.vx<0)sctx.scale(-1,1);sctx.font=`${f.sz}px serif`;sctx.textAlign='center';sctx.textBaseline='middle';sctx.fillText(f.ico,0,0);sctx.restore();});
    requestAnimationFrame(loop);}loop();
}

/* WORLD SCROLL */
function initWorldScroll(){
  const wrap=$('world-wrap');if(!wrap)return;
  let isDragging=false,sx=0,svx=0,maxVX=0;
  const updateView=()=>{maxVX=worldW-wrap.clientWidth;viewX=Math.max(0,Math.min(viewX,maxVX));const inner=$('world-inner');if(inner)inner.style.transform=`translateX(-${viewX}px)`;};
  wrap.addEventListener('mousedown',e=>{isDragging=true;sx=e.clientX+viewX;});
  wrap.addEventListener('mousemove',e=>{if(!isDragging)return;viewX=Math.max(0,Math.min(sx-e.clientX,maxVX));updateView();});
  wrap.addEventListener('mouseup',()=>isDragging=false);
  wrap.addEventListener('touchstart',e=>{isDragging=true;sx=e.touches[0].clientX+viewX;},{passive:true});
  wrap.addEventListener('touchmove',e=>{if(!isDragging)return;viewX=Math.max(0,Math.min(sx-e.touches[0].clientX,maxVX));updateView();},{passive:true});
  wrap.addEventListener('touchend',()=>isDragging=false);
}

/* BOSS TIMER */
setInterval(()=>{if(Math.random()<.03)triggerBossEvent();},60000);

/* ═══ INIT ═══ */
window.addEventListener('DOMContentLoaded',()=>{
  initSplashCanvas();
  $('btn-start')?.addEventListener('click',()=>{
    load();
    // Check daily login
    if(canClaimDR()){const today=new Date().toDateString();G.drLastDate=today;G.loginStreak=(G.loginStreak||0)+1;if(G.loginStreak>7)G.loginStreak=1;const rw=DAILY_REWARDS[Math.min(G.loginStreak-1,DAILY_REWARDS.length-1)];setText('mdl-sub','Hari ke-'+G.loginStreak);setText('mdl-body',rw.t+'!');const dots=$('mdl-dots');if(dots)dots.innerHTML=DAILY_REWARDS.map((_,i)=>`<span class="sd ${i<G.loginStreak?'done':''}">${i+1}</span>`).join('');openModal('mod-daily-login');}
    $('splash').style.opacity='0';$('splash').style.transition='opacity .5s';setTimeout(()=>$('splash').classList.add('hidden'),500);$('game').classList.remove('hidden');
    initCanvas();initWorldScroll();updateHUD();updateWeather();
    setInterval(updateWeather,30000);
    if(!$('game').dataset.init){$('game').dataset.init='1';
      // Nav
      document.querySelectorAll('.fn').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
      // Subtabs — shop
      document.querySelectorAll('.stab[data-sp]').forEach(b=>{b.addEventListener('click',()=>{b.parentElement.querySelectorAll('.stab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.sp').forEach(p=>p.classList.add('hidden'));$('sp-'+b.dataset.sp)?.classList.remove('hidden');renderShop(b.dataset.sp);});});
      // Subtabs — exchange
      document.querySelectorAll('.stab[data-ep]').forEach(b=>{b.addEventListener('click',()=>{b.parentElement.querySelectorAll('.stab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.ep').forEach(p=>p.classList.add('hidden'));$('ep-'+b.dataset.ep)?.classList.remove('hidden');renderExchange(b.dataset.ep);});});
      // Subtabs — lb
      document.querySelectorAll('.stab[data-lb]').forEach(b=>{b.addEventListener('click',()=>{b.parentElement.querySelectorAll('.stab').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderLB(b.dataset.lb);});});
      // Buttons
      $('btn-cast')?.addEventListener('click',doCast);
      $('btn-cancel')?.addEventListener('click',()=>{doResetScene();setState('idle');});
      $('btn-pull')?.addEventListener('click',doPull);
      $('btn-chest')?.addEventListener('click',doOpenChest);
      $('btn-chest-cont')?.addEventListener('click',resetState);
      $('btn-bottle')?.addEventListener('click',doOpenBottle);
      $('btn-bottle-cont')?.addEventListener('click',resetState);
      $('btn-boss')?.addEventListener('click',hitBoss);
      $('btn-break')?.addEventListener('click',resetState);
      $('btn-miss')?.addEventListener('click',resetState);
      $('btn-again')?.addEventListener('click',resetState);
      $('btn-tourn-cast')?.addEventListener('click',()=>{setState('idle');switchTab('fish');});
      $('btn-dr-claim')?.addEventListener('click',claimDR);
      $('btn-mdl-ok')?.addEventListener('click',()=>{closeModal('mod-daily-login');});
      $('btn-reset')?.addEventListener('click',()=>openModal('mod-reset'));
      $('btn-reset-yes')?.addEventListener('click',()=>{localStorage.removeItem('fig9');location.reload();});
      $('tog-sfx')?.addEventListener('change',e=>{G.sfx=e.target.checked;save();});
      $('nm-inp')?.addEventListener('change',e=>{G.name=e.target.value||'Gileg';setText('pb-name',G.name);save();});
      // Chest auto-trigger from bite
      const origOpenChest=openChestUI;
      // Override trigger for chest from bite
    }
    save();
  });
  // Handle chest from bite state
  document.addEventListener('click',e=>{
    if(e.target.closest('#s-bite')&&state==='bite'&&pendingCatch?.type==='chest'){
      // handled by doPull
    }
  });
});
