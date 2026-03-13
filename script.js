'use strict';
/* ═══════════════════════════════════════════
   DEEP HOOK · script.js
   11 Game Systems · Complete Engine
═══════════════════════════════════════════ */

/* ─────────── DATA ─────────── */
const FISH = {
  Common:   [{id:'clown',n:'Clownfish',    i:'🐟',v:5}, {id:'carp', n:'Carp',         i:'🐡',v:6}, {id:'blue', n:'Blue Tang',    i:'🐠',v:7}, {id:'brim', n:'Sea Bream',    i:'🐟',v:5}],
  Uncommon: [{id:'tuna', n:'Tuna',         i:'🐟',v:14},{id:'bass', n:'Sea Bass',      i:'🐠',v:16},{id:'snap', n:'Red Snapper',  i:'🐡',v:18}],
  Rare:     [{id:'salm', n:'King Salmon',  i:'🐠',v:35},{id:'puff', n:'Puffer Fish',   i:'🐡',v:40},{id:'mora', n:'Moray Eel',    i:'🐍',v:38}],
  Epic:     [{id:'shrk', n:'Baby Shark',   i:'🦈',v:85},{id:'sqid', n:'Giant Squid',   i:'🐙',v:90},{id:'mant', n:'Manta Ray',    i:'🦅',v:95}],
  Legendary:[{id:'drag', n:'Dragon Fish',  i:'🐉',v:200},{id:'levi',n:'Sea Leviathan',i:'🌊',v:220}],
  Mythic:   [{id:'krak', n:'Kraken Fish',  i:'🌀',v:500},{id:'godw',n:'God Whale',     i:'🌌',v:600}],
};
const BOSSES = [
  {id:'bkrak',n:'KRAKEN FISH',    i:'🐙',hp:10,rw:{c:750, g:3, x:400},desc:'Gurita raksasa dari kedalaman!'},
  {id:'bgcat',n:'GIANT CATFISH',  i:'🐟',hp:7, rw:{c:550, g:2, x:300},desc:'Lele terbesar yang pernah ada!'},
  {id:'bgwhl',n:'GOLDEN WHALE',   i:'🐳',hp:14,rw:{c:1000,g:5, x:500},desc:'Paus emas mistis!'},
];
const RODS = [
  {id:'basic',n:'Basic Rod',  i:'🎋',maxKg:15, dur:100,cost:0,    rb:{},               desc:'Rod pemula'},
  {id:'iron', n:'Iron Rod',   i:'🔩',maxKg:40, dur:200,cost:600,  rb:{Uncommon:5},     desc:'+5% Uncommon'},
  {id:'carb', n:'Carbon Rod', i:'⚡',maxKg:100,dur:350,cost:2000, rb:{Rare:6,Epic:3},  desc:'+6% Rare'},
  {id:'titan',n:'Titan Rod',  i:'🌙',maxKg:250,dur:500,cost:7000, rb:{Legendary:6},   desc:'+6% Legendary'},
];
const BAITS = [
  {id:'worm', n:'Cacing Tanah',i:'🪱',cost:0,   rb:{Common:15},         desc:'Common lebih sering'},
  {id:'shrmp',n:'Udang Shiny', i:'✨',cost:300,  rb:{Rare:8,Uncommon:5}, desc:'Rare & Uncommon naik'},
  {id:'magic',n:'Magic Bait',  i:'🌟',cost:800,  rb:{Legendary:7,Epic:5},desc:'Legendary & Epic naik!'},
];
const WEATHERS = [
  {id:'sunny',n:'Cerah',  i:'☀️',rb:{}},
  {id:'cloud',n:'Mendung',i:'⛅',rb:{Uncommon:3}},
  {id:'rain', n:'Hujan',  i:'🌧️',rb:{Rare:4}},
  {id:'storm',n:'Badai',  i:'⛈️',rb:{Epic:5,Legendary:3}},
  {id:'night',n:'Malam',  i:'🌙',rb:{Rare:3,Epic:4,Legendary:2}},
];
const MAPS = [
  {id:'river', n:'Sungai',        i:'🌊',rb:{Common:8}},
  {id:'lake',  n:'Danau',         i:'🏞️',rb:{Uncommon:7}},
  {id:'ocean', n:'Lautan',        i:'🌏',rb:{Rare:5,Epic:3}},
  {id:'hidden',n:'Hidden Spot ✦', i:'🏴‍☠️',rb:{Rare:15,Epic:12,Legendary:6},secret:true},
];
const TRASH = [
  {i:'👟',t:'"An old shoe?! Who lost this?!" — Yikes!'},
  {i:'🥫',t:'"A rusty can. At least it\'s clean." — Meh'},
  {i:'🚗',t:'"A CAR TIRE!! How did it get here?!" — LOL'},
  {i:'📦',t:'"Empty box... empty dreams." — Ouch'},
  {i:'🧤',t:'"Someone\'s glove. Please return it." — Weird'},
  {i:'🪑',t:'"A plastic chair! Pool party confirmed?" — 🎉'},
];
const BOTTLES = [
  {msg:'"Bantu aku... aku terjebak di Pulau Pasir Putih sejak 1994..."',rw(){return{c:150};}},
  {msg:'"Harta terpendam di bawah pohon kelapa tua!"',               rw(){return{map:true};}},
  {msg:'"Salam dari Atlantis! Ini sedikit emas kami!"',              rw(){return{c:500,g:1};}},
  {msg:'"Garam laut di sini enak. Beli es krim ya."',                rw(){return{c:80};}},
  {msg:'"Tolong kirim pizza ke: entah di mana. Terima kasih."',      rw(){return{c:200};}},
];
const BASE_RATES = {Common:52,Uncommon:22,Rare:13,Epic:7,Legendary:4,Mythic:2};
const WEIGHT_R = {Common:[.5,3],Uncommon:[2,8],Rare:[5,25],Epic:[15,80],Legendary:[50,200],Mythic:[150,500]};
const PRICES = {Common:5,Uncommon:10,Rare:30,Epic:80,Legendary:200,Mythic:500,Boss:450};
const XPT = [0,100,220,380,590,850,1180,1590,2100,2750,3500];
const ACHS = [
  {id:'a1', n:'First Blood!',   i:'🎣',d:'Tangkap ikan pertama',    c:G=>G.tot>=1},
  {id:'a2', n:'100 Tangkap!',   i:'💯',d:'Total 100 ikan',          c:G=>G.tot>=100},
  {id:'a3', n:'Streak 5!',      i:'🔥',d:'Combo streak 5',          c:G=>G.bestStr>=5},
  {id:'a4', n:'Streak 10!',     i:'⚡',d:'Combo streak 10',         c:G=>G.bestStr>=10},
  {id:'a5', n:'Boss Slayer',    i:'⚔️',d:'Kalahkan boss',            c:G=>G.bosses>=1},
  {id:'a6', n:'Kaya Raya!',     i:'💰',d:'Kumpul 5000 koin',        c:G=>G.earned>=5000},
  {id:'a7', n:'Lucky Man',      i:'⭐',d:'Ikut Lucky Hour',          c:G=>G.lucks>=1},
  {id:'a8', n:'Duelist',        i:'🤝',d:'Main duel pertama',        c:G=>G.duels>=1},
  {id:'a9', n:'Bottle Finder',  i:'🍾',d:'Temukan mystery bottle',   c:G=>G.bottles>=1},
  {id:'a10',n:'Treasure Hunter',i:'🗺️',d:'Temukan treasure map',    c:G=>G.treasures>=1},
  {id:'a11',n:'Monster Fish!',  i:'🏋️',d:'Tangkap ikan 50kg+',      c:G=>G.heaviest>=50},
];

/* ─────────── STATE ─────────── */
const DEF = {
  coins:200,gems:0,xp:0,level:1,name:'Fisher',
  tot:0,earned:0,heaviest:0,combo:0,bestStr:0,
  bosses:0,lucks:0,duels:0,bottles:0,treasures:0,mythics:0,
  rodId:'basic',baitId:'worm',mapId:'river',wxId:'sunny',
  rodDur:{basic:100},ownedRods:['basic'],ownedBaits:{worm:999},
  inv:{},achDone:{},luckyEnd:0,treasureEnd:0,
};
let G = JSON.parse(JSON.stringify(DEF));

const save = () => { try{localStorage.setItem('dh2',JSON.stringify(G));}catch(e){} };
const load = () => {
  try{
    const d=localStorage.getItem('dh2');
    if(d){const p=JSON.parse(d);Object.keys(DEF).forEach(k=>{if(p[k]!==undefined)G[k]=p[k];});}
  }catch(e){}
  if(!G.rodDur)G.rodDur={};
  if(!G.ownedBaits)G.ownedBaits={worm:999};
  if(!G.achDone)G.achDone={};
  if(!G.inv)G.inv={};
};

/* ─────────── UTILS ─────────── */
const $ = id => document.getElementById(id);
const T = (id,v) => { const e=$(id);if(e)e.textContent=v; };
const rnd = n => Math.floor(Math.random()*n);
const pick = a => a[rnd(a.length)];
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const fmt = n => { n=Math.floor(n||0);return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':''+n; };

let _toastT;
function toast(m,d=2400){
  clearTimeout(_toastT);
  const t=$('toast');t.textContent=m;t.classList.add('on');
  _toastT=setTimeout(()=>t.classList.remove('on'),d);
}
let _notifT;
function notif(ico,txt,d=3000){
  clearTimeout(_notifT);
  T('n-ico',ico);T('n-txt',txt);
  const n=$('notif');n.classList.add('on');
  _notifT=setTimeout(()=>n.classList.remove('on'),d);
}
function openM(id){$(id)?.classList.add('on');}
function closeM(id){$(id)?.classList.remove('on');}
function glow(ms=600){const g=$('glow');g.classList.add('on');setTimeout(()=>g.classList.remove('on'),ms);}
function shake(){const el=$('app');el.classList.add('shaking');setTimeout(()=>el.classList.remove('shaking'),380);}
function coinPop(){const c=$('chip-coin');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');}
const sizeLabel = kg => kg<2?'Kecil':kg<8?'Sedang':kg<40?'Besar':'Monster';
const RAR_COL = {Common:'#4ade80',Uncommon:'#60a5fa',Rare:'#c084fc',Epic:'#fb923c',Legendary:'#f87171',Mythic:'#f472b6',Boss:'#ff5c5c'};

/* ─────────── RATES ─────────── */
function calcRates(){
  const r={...BASE_RATES};
  const rod = RODS.find(x=>x.id===G.rodId)||RODS[0];
  const bait= BAITS.find(x=>x.id===G.baitId)||BAITS[0];
  const map = MAPS.find(x=>x.id===G.mapId)||MAPS[0];
  const wx  = WEATHERS.find(x=>x.id===G.wxId)||WEATHERS[0];
  const apply = rb => { for(const[k,v] of Object.entries(rb||{})){r[k]=(r[k]||0)+v;r.Common=Math.max(0,r.Common-v*.4);} };
  apply(rod.rb);apply(bait.rb);apply(map.rb);apply(wx.rb);
  if(G.luckyEnd>Date.now()){r.Rare=(r.Rare||0)*1.5;r.Epic=(r.Epic||0)*1.5;r.Legendary=(r.Legendary||0)*1.3;}
  if(G.combo>=5){r.Rare=(r.Rare||0)+3;r.Common=Math.max(0,r.Common-2);}
  const tot=Object.values(r).reduce((a,b)=>a+b,0)||1;
  for(const k in r)r[k]=r[k]/tot*100;
  return r;
}
function pickRar(){
  const rt=calcRates();let roll=Math.random()*100,cum=0;
  for(const rar of ['Mythic','Legendary','Epic','Rare','Uncommon','Common']){cum+=(rt[rar]||0);if(roll<=cum)return rar;}
  return 'Common';
}
function pickFish(rar){return pick(FISH[rar]||FISH.Common);}
function rollWt(rar){const[a,b]=WEIGHT_R[rar]||[.5,3];return +(a+Math.random()*(b-a)).toFixed(1);}

/* ─────────── HUD ─────────── */
function updateHUD(){
  T('hcoin',fmt(G.coins));T('hgem',G.gems);
  T('mkt-bal',fmt(G.coins));T('sh-bal',fmt(G.coins));
  T('hname',G.name);T('xlv','Lv.'+G.level);
  const cur=XPT[G.level-1]||0,nx=XPT[G.level]||9999;
  const pct=clamp((G.xp-cur)/(nx-cur)*100,0,100);
  const xb=$('xpbar');if(xb)xb.style.width=pct+'%';
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
  const bait=BAITS.find(b=>b.id===G.baitId)||BAITS[0];
  const map=MAPS.find(m=>m.id===G.mapId)||MAPS[0];
  const wx=WEATHERS.find(w=>w.id===G.wxId)||WEATHERS[0];
  T('gb-rod',rod.i+' '+rod.n);T('gb-bait',bait.i+' '+bait.n);
  T('ib-wx',wx.i+' '+wx.n);T('ib-map',map.i+' '+map.n);
  T('ib-combo',G.combo>1?'🔥×'+G.combo:'');
  T('gb-streak',G.combo>=3?'🔥'+G.combo:'');
  T('cast-sub',map.secret?'✨ Hidden Spot Aktif!':G.luckyEnd>Date.now()?'⭐ Lucky Hour!':'Siap memancing!');
  // Durability bar
  const curDur=G.rodDur[G.rodId]??rod.dur;
  const durPct=clamp(curDur/rod.dur*100,0,100);
  const df=$('durbar');if(df){df.style.width=durPct+'%';df.className='dur-bar'+(durPct<30?' low':'');}
  // Idle stats
  T('is-tot',G.tot);T('is-str',G.combo);T('is-best',G.bestStr);T('is-heavy',G.heaviest+'kg');
}
function addXP(a){
  G.xp+=a;let lv=false;
  while(G.level<XPT.length-1&&G.xp>=XPT[G.level]){
    G.level++;lv=true;
    const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
    G.rodDur[G.rodId]=Math.min((G.rodDur[G.rodId]||0)+55,rod.dur);
  }
  if(lv){T('lvup-sub','Level '+G.level+'! Rod sedikit terepair!');openM('m-lvup');}
  updateHUD();
}
function addCoins(a){G.coins+=a;G.earned+=Math.max(0,a);coinPop();updateHUD();checkAch();}
function addGems(a){G.gems+=a;updateHUD();}
function damDur(n=1){
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
  G.rodDur[G.rodId]=clamp((G.rodDur[G.rodId]??rod.dur)-n,0,rod.dur);
}

/* ─────────── ACHIEVEMENTS ─────────── */
function checkAch(){
  ACHS.forEach(a=>{
    if(G.achDone[a.id])return;
    if(a.c(G)){
      G.achDone[a.id]=true;
      T('ach-ico',a.i);T('ach-sub',a.n+' — '+a.d);
      setTimeout(()=>openM('m-ach'),500);
      save();
    }
  });
}

/* ─────────── CANVAS SCENE ─────────── */
let cv,ctx,rcv,rctx,W=0,H=0,wY=0,t=0;
let ambFish=[],particles=[],plants=[];
let bobber={vis:false,bite:false,x:0,y:0};
let flyB={on:false,x:0,y:0};
let rain=[],rainOn=false,rainId=null;

function initCanvas(){
  cv=$('cv');ctx=cv.getContext('2d');
  rcv=$('rain-cv');rctx=rcv.getContext('2d');
  resize();window.addEventListener('resize',resize);
  buildPlants();
  spawnAmbPeriodic();setInterval(spawnAmbPeriodic,1400);
  requestAnimationFrame(loop);
}
function resize(){
  const wr=$('world');W=wr.clientWidth;H=wr.clientHeight;
  const dpr=devicePixelRatio||1;
  [cv,rcv].forEach(c=>{c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';});
  ctx.scale(dpr,dpr);rctx.scale(dpr,dpr);
  wY=H*.56;buildPlants();
}
function buildPlants(){
  plants=Array.from({length:11},()=>({x:Math.random()*W,h:12+Math.random()*26,ph:Math.random()*6,col:['#1a6a2a','#2a8a3a','#0d4a1a'][rnd(3)]}));
}
function spawnAmbPeriodic(){
  if(ambFish.length>=13)return;
  const go=Math.random()>.5;
  const wt=[60,28,12];const rars=['Common','Uncommon','Rare'];
  let r=Math.random()*100,c=0,rar='Common';
  for(let i=0;i<rars.length;i++){c+=wt[i];if(r<=c){rar=rars[i];break;}}
  const ic={Common:'🐟',Uncommon:'🐠',Rare:'🐡'};
  ambFish.push({x:go?-50:W+50,y:wY+10+Math.random()*(H-wY-20),vx:(.3+Math.random()*.9)*(go?1:-1),ph:Math.random()*6,amp:1+Math.random()*2.2,ico:ic[rar]||'🐟',sz:10+rnd(9),rar,dead:false,glow:rar!=='Common'});
}
function loop(){t+=.016;draw();requestAnimationFrame(loop);}
function draw(){
  if(!ctx||W<=0)return;
  ctx.clearRect(0,0,W,H);
  const isNight=G.wxId==='night',isTreasure=G.treasureEnd>Date.now(),isBoss=(state==='boss'),isStorm=G.wxId==='storm';
  // Sky
  const sg=ctx.createLinearGradient(0,0,0,wY);
  if(isNight){sg.addColorStop(0,'#020818');sg.addColorStop(1,'#051a3a');}
  else if(isTreasure){sg.addColorStop(0,'#1a0900');sg.addColorStop(1,'#3a1600');}
  else if(isStorm){sg.addColorStop(0,'#0a1020');sg.addColorStop(1,'#1a2a40');}
  else{sg.addColorStop(0,'#0096c7');sg.addColorStop(1,'#48cae4');}
  ctx.fillStyle=sg;ctx.fillRect(0,0,W,wY);
  // Sun/Moon
  if(isNight){
    ctx.save();ctx.beginPath();ctx.arc(W*.08,wY*.22,14,0,Math.PI*2);ctx.fillStyle='#ddeeff';ctx.shadowBlur=22;ctx.shadowColor='#aaaaff';ctx.fill();ctx.restore();
    for(let i=0;i<20;i++){ctx.fillStyle=`rgba(255,255,210,${.4+Math.sin(i*7+t)*.18})`;ctx.beginPath();ctx.arc((i*71)%W,(i*43)%(wY*.85),1,0,Math.PI*2);ctx.fill();}
  } else {
    ctx.save();ctx.beginPath();ctx.arc(W*.08,wY*.2,18+Math.sin(t*.4)*2.5,0,Math.PI*2);ctx.fillStyle=isTreasure?'#ff8800':'#FFE144';ctx.shadowBlur=32;ctx.shadowColor=isTreasure?'rgba(255,140,0,.6)':'rgba(255,220,0,.5)';ctx.fill();ctx.restore();
  }
  // Clouds
  if(!isTreasure)[[.1,.25,1],[.35,.15,1.1],[.62,.27,.85],[.88,.12,1]].forEach(([cx,cy,sc],i)=>{
    const ox=Math.sin(t*.05+i*.8)*W*.025;
    ctx.save();ctx.globalAlpha=isStorm?.52:.27;ctx.fillStyle=isStorm?'#445':'#fff';
    const x=W*cx+ox;ctx.beginPath();ctx.arc(x,wY*cy,12*sc,0,Math.PI*2);ctx.arc(x+15*sc,wY*cy-3*sc,9*sc,0,Math.PI*2);ctx.arc(x+28*sc,wY*cy,11*sc,0,Math.PI*2);ctx.fill();ctx.restore();
  });
  // Treasure glow
  if(isTreasure){const tg=ctx.createRadialGradient(W*.5,wY,0,W*.5,wY,W*.6);tg.addColorStop(0,'rgba(255,180,0,.2)');tg.addColorStop(1,'transparent');ctx.fillStyle=tg;ctx.fillRect(0,0,W,H);}
  // Shore trees
  [[W*.03,wY],[W*.94,wY]].forEach(([x,y])=>{ctx.fillStyle='#5c2a0f';ctx.fillRect(x-3,y-16,6,16);ctx.beginPath();ctx.arc(x,y-20,12,0,Math.PI*2);ctx.fillStyle='#2d6e2d';ctx.fill();ctx.beginPath();ctx.arc(x,y-32,8,0,Math.PI*2);ctx.fillStyle='#3a8a3a';ctx.fill();});
  // Water
  const wg=ctx.createLinearGradient(0,wY,0,H);
  if(isTreasure){wg.addColorStop(0,'#3a2000');wg.addColorStop(1,'#0a0500');}
  else if(isBoss){wg.addColorStop(0,'#220000');wg.addColorStop(1,'#050000');}
  else{wg.addColorStop(0,'#0096c7');wg.addColorStop(.5,'#023e8a');wg.addColorStop(1,'#03045e');}
  ctx.fillStyle=wg;ctx.fillRect(0,wY,W,H-wY);
  // Wave
  ctx.beginPath();ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;
  for(let x=0;x<=W;x+=3){const wy=wY+Math.sin(x*.022+t*2.2)*3+Math.sin(x*.05+t*1.5)*1.4;x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);}ctx.stroke();
  // Seaweed
  plants.forEach(p=>{const sw=Math.sin(t*1.2+p.ph)*7;ctx.beginPath();ctx.moveTo(p.x,H);ctx.quadraticCurveTo(p.x+sw,H-p.h*.5,p.x+sw*1.4,H-p.h);ctx.strokeStyle=p.col;ctx.lineWidth=3;ctx.lineCap='round';ctx.stroke();ctx.beginPath();ctx.arc(p.x+sw*1.4,H-p.h,4,0,Math.PI*2);ctx.fillStyle='#2a8a3a';ctx.fill();});
  // Bubbles
  if(Math.random()<.026)particles.push({tp:'b',x:Math.random()*W,y:H,vx:(Math.random()-.5)*.3,vy:-(0.3+Math.random()*.6),r:1.5+Math.random()*2.8,life:1});
  // Ambient fish
  ambFish=ambFish.filter(f=>!f.dead);
  ambFish.forEach(f=>{
    f.x+=f.vx;f.y+=Math.sin(t*f.ph*.25+f.ph)*f.amp;
    if(f.x>W+65||f.x<-65)f.dead=true;
    if(!f.dead){ctx.save();ctx.translate(f.x,f.y);if(f.vx<0)ctx.scale(-1,1);ctx.font=`${f.sz}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';if(f.glow){ctx.shadowBlur=10;ctx.shadowColor='rgba(192,132,252,.7)';}ctx.fillText(f.ico,0,0);ctx.restore();}
  });
  // Particles
  particles=particles.filter(e=>e.life>0);
  particles.forEach(e=>{e.life-=.022;e.x+=e.vx;e.y+=e.vy;if(e.tp==='p')e.vy+=.05;
    ctx.save();ctx.globalAlpha=Math.max(0,e.life);
    if(e.tp==='p'){ctx.beginPath();ctx.arc(e.x,e.y,Math.max(.1,e.r),0,Math.PI*2);ctx.fillStyle=e.col||'#7fd8f8';ctx.fill();}
    else{ctx.beginPath();ctx.arc(e.x,e.y,Math.max(.1,e.r),0,Math.PI*2);ctx.strokeStyle='rgba(180,230,255,.5)';ctx.lineWidth=1;ctx.stroke();}
    ctx.restore();
  });
  // Duck
  ctx.font='15px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🦆',W*.2+Math.sin(t*.3)*W*.016,wY-6);
  // Rod
  const rx=W*.83;ctx.beginPath();ctx.moveTo(rx,wY*.2);ctx.lineTo(rx,wY*.28);const rg=ctx.createLinearGradient(rx,wY*.2,rx,wY*.28);rg.addColorStop(0,'#5c2a0f');rg.addColorStop(1,'#C8A060');ctx.strokeStyle=rg;ctx.lineWidth=4;ctx.lineCap='round';ctx.stroke();
  // Fly bobber
  if(flyB.on){ctx.beginPath();ctx.moveTo(rx,wY*.24);ctx.lineTo(flyB.x,flyB.y);ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1.2;ctx.stroke();ctx.font='18px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🎯',flyB.x,flyB.y);}
  // Bobber
  if(bobber.vis){
    const by=bobber.bite?wY+9+Math.sin(t*6.5)*5.5:wY+Math.sin(t*2.5)*3;
    ctx.beginPath();ctx.moveTo(rx,wY*.26);ctx.lineTo(bobber.x,by);ctx.strokeStyle=bobber.bite?'rgba(255,100,0,.85)':'rgba(255,255,255,.3)';ctx.lineWidth=bobber.bite?2.2:1.3;ctx.stroke();
    ctx.beginPath();ctx.arc(bobber.x,by-5,6,Math.PI,0);ctx.fillStyle=bobber.bite?'#f97316':'#ef4444';ctx.fill();
    ctx.beginPath();ctx.arc(bobber.x,by+2,6,0,Math.PI);ctx.fillStyle='#fff';ctx.fill();
    ctx.fillStyle='#444';ctx.fillRect(bobber.x-6,by-1,12,2);
    if(bobber.bite){ctx.save();ctx.shadowBlur=16;ctx.shadowColor='#f97316';ctx.beginPath();ctx.arc(bobber.x,by-1,9,0,Math.PI*2);ctx.strokeStyle='rgba(255,100,0,.5)';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();}
  }
  // Boss glow
  if(isBoss){const bg=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,W*.5);bg.addColorStop(0,'rgba(255,30,0,.1)');bg.addColorStop(1,'transparent');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);}
}
function splash(x,y,n=12){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=1.2+Math.random()*3;particles.push({tp:'p',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2.8,r:1.5+Math.random()*3,life:.65+Math.random()*.3,col:'#7fd8f8'});}}
function fishJump(ico){ambFish.push({x:bobber.x||W*.4,y:wY,vx:(Math.random()-.5)*3,ph:0,amp:0,ico,sz:26,dead:false,glow:true});setTimeout(()=>{const f=ambFish.find(f=>f.glow&&f.sz===26);if(f)f.dead=true;},1200);}
function doSparks(rar){
  const el=$('sparks');if(!el)return;
  const col=RAR_COL[rar]||'#ffd60a';
  for(let i=0;i<20;i++){const s=document.createElement('div');s.className='spk';const a=Math.random()*Math.PI*2,d=40+Math.random()*65;s.style.cssText=`width:${3+rnd(5)}px;height:${3+rnd(5)}px;background:${col};top:50%;left:50%;--sx:${Math.cos(a)*d}px;--sy:${Math.sin(a)*d}px`;el.appendChild(s);setTimeout(()=>s.remove(),900);}
}
// Rain
function startRain(){rainOn=true;$('rain-cv').style.opacity='.5';rain=Array.from({length:62},()=>({x:Math.random()*W,y:Math.random()*H,l:7+Math.random()*13,sp:4+Math.random()*5}));animRain();}
function stopRain(){rainOn=false;$('rain-cv').style.opacity='0';cancelAnimationFrame(rainId);}
function animRain(){if(!rainOn)return;rctx.clearRect(0,0,W,H);rctx.strokeStyle='rgba(155,200,240,.4)';rctx.lineWidth=1;rain.forEach(d=>{rctx.beginPath();rctx.moveTo(d.x,d.y);rctx.lineTo(d.x-2,d.y+d.l);rctx.stroke();d.y+=d.sp;if(d.y>H){d.y=-15;d.x=Math.random()*W;}});rainId=requestAnimationFrame(animRain);}

/* ─────────── WEATHER ─────────── */
function cycleWeather(){
  const others=WEATHERS.filter(w=>w.id!==G.wxId);const nw=pick(others);G.wxId=nw.id;
  ['rain','storm'].includes(nw.id)?startRain():stopRain();
  updateHUD();save();
  setTimeout(cycleWeather,(3+Math.random()*5)*60000);
}

/* ─────────── STATE MACHINE ─────────── */
const STATES=['idle','cast','wait','bite','reel','boss','bottle','bottle-open','trash','result','break','miss'];
let state='idle',pending=null;
let biteT=null,biteIv=null,mgIv=null,waitIv=null,waitProg=0;
let cur=50,catch_=0,dir=1,outT=0,zL=22,zW=56,mgPwr=1.2;
let holding=false,bossData=null,bossHp=0;

function setState(s){
  state=s;
  STATES.forEach(id=>{const e=$('s-'+id);if(e)e.classList.toggle('on',id===s);});
}
function reset(){
  clearTimeout(biteT);clearInterval(biteIv);clearInterval(mgIv);clearInterval(waitIv);
  biteT=null;biteIv=null;mgIv=null;waitIv=null;waitProg=0;
  bobber.vis=false;bobber.bite=false;flyB.on=false;
  pending=null;holding=false;
  const bh=$('btn-hold');if(bh)bh.classList.remove('held');
  $('world-boss')?.classList.replace('wboss-on','wboss-off');
  setState('idle');updateHUD();
}

function holdOn(){holding=true;const b=$('btn-hold');if(b)b.classList.add('held');}
function holdOff(){holding=false;const b=$('btn-hold');if(b)b.classList.remove('held');}

/* ─────────── CAST ─────────── */
function doCast(){
  if(state!=='idle')return;
  setState('cast');
  const bx=W*.08+Math.random()*W*.5;
  const sx=W*.82,sy=H*.26;flyB={on:true,x:sx,y:sy};
  const t0=performance.now(),dur=700;
  (function fly(now){
    const p=clamp((now-t0)/dur,0,1),ease=p<.5?2*p*p:-1+(4-2*p)*p;
    flyB.x=sx+(bx-sx)*ease;flyB.y=sy+(wY-sy)*ease-Math.sin(p*Math.PI)*55;
    if(p<1){requestAnimationFrame(fly);return;}
    flyB.on=false;bobber.vis=true;bobber.x=bx;bobber.y=wY;
    splash(bx,wY,14);setState('wait');startWait(bx);
  })(performance.now());
}
function startWait(){
  waitProg=0;const ring=$('ring');if(ring)ring.style.strokeDashoffset='214';
  waitIv=setInterval(()=>{waitProg=clamp(waitProg+.7,0,100);const r=$('ring');if(r)r.style.strokeDashoffset=(214-waitProg*2.14).toFixed(1);if(waitProg>=100)clearInterval(waitIv);},80);
  // Rare swim-by
  setTimeout(()=>{if(state==='wait'&&Math.random()>.78){const rrs=['Rare','Epic','Legendary'];const rr=pick(rrs);const ff=pickFish(rr);ambFish.push({x:-60,y:wY+18,vx:1.5,ph:2,amp:1,ico:ff.i,sz:20,rar:rr,dead:false,glow:true});notif('🌟',rr+' '+ff.n+' terlihat!');}},1500+Math.random()*2000);
  const waitMs=2200+Math.random()*4200;
  setTimeout(()=>{if(state==='wait')triggerBite();},waitMs);
}
function triggerBite(){
  if(state!=='wait')return;
  clearInterval(waitIv);
  const roll=Math.random();
  if(roll<.035)pending={type:'boss'};
  else if(roll<.075)pending={type:'bottle'};
  else if(roll<.14)pending={type:'trash'};
  else{const rar=pickRar();const fish=pickFish(rar);const wt=rollWt(rar);pending={type:'fish',rar,fish,wt};if(['Rare','Epic','Legendary','Mythic'].includes(rar)){notif({Rare:'🌟',Epic:'🔥',Legendary:'⭐',Mythic:'🌈'}[rar],'Terdeteksi: '+rar+' '+fish.n+'!');}}
  startBite();
}
function startBite(){
  setState('bite');bobber.bite=true;let rem=100;
  clearInterval(biteIv);
  biteIv=setInterval(()=>{rem=clamp(rem-2.8,0,100);const b=$('bite-bar');if(b)b.style.width=rem+'%';if(rem<=0){clearInterval(biteIv);doMiss();}},75);
  biteT=setTimeout(()=>{if(state==='bite')doMiss();},4000);
}
function doPull(){
  if(state!=='bite')return;
  clearTimeout(biteT);clearInterval(biteIv);bobber.bite=false;
  if(pending?.type==='boss'){startBoss();return;}
  if(pending?.type==='bottle'){setState('bottle');return;}
  if(pending?.type==='trash'){showTrash();return;}
  const {rar,fish,wt}=pending||{};if(!fish){reset();return;}
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
  const curDur=G.rodDur[G.rodId]??rod.dur;
  if(wt>rod.maxKg){setState('break');T('break-msg',fish.n+' '+wt+'kg — Max rod '+rod.maxKg+'kg! Upgrade!');G.combo=0;pending=null;updateHUD();return;}
  if(curDur/rod.dur<.15&&wt>rod.maxKg*.3){setState('break');T('break-msg','Rod rusak parah! Repair dulu!');G.combo=0;pending=null;damDur(3);updateHUD();return;}
  startReel(fish,rar,wt);
}
function doMiss(){
  if(state!=='bite')return;
  clearTimeout(biteT);clearInterval(biteIv);
  bobber.bite=false;G.combo=0;pending=null;setState('miss');updateHUD();
}

/* ─────────── REEL ─────────── */
function startReel(fish,rar,wt){
  setState('reel');
  T('reel-ico',fish.i);T('reel-wt',wt+'kg');
  const rb=$('reel-rar');if(rb){rb.textContent=rar.toUpperCase();rb.className='rar-badge '+rar;}
  const rod=RODS.find(r=>r.id===G.rodId)||RODS[0];
  const ratio=clamp(wt/rod.maxKg,0,1);
  cur=50;catch_=0;dir=1;outT=0;
  mgPwr=.65+ratio*2.8;zW=clamp(60-ratio*35,16,60);zL=clamp(50-zW/2,5,45);
  const tz=$('tz-safe'),dl=$('tz-l'),dr=$('tz-r');
  if(tz){tz.style.left=zL+'%';tz.style.width=zW+'%';}
  if(dl)dl.style.width=zL+'%';
  if(dr)dr.style.width=(100-zL-zW)+'%';
  $('prog-bar').style.width='0%';T('prog-pct','0%');T('tmsg','');
  clearInterval(mgIv);
  mgIv=setInterval(()=>{
    if(state!=='reel'){clearInterval(mgIv);return;}
    cur+=mgPwr*dir*(1+Math.random()*.45);
    if(Math.random()<.022)dir*=-1;
    if(holding)cur+=(50-cur)*.19;
    cur=clamp(cur,0,100);
    const inZ=cur>=zL&&cur<=(zL+zW);
    if(inZ){catch_=clamp(catch_+(holding?3:.45),0,100);outT=0;T('tmsg','');}
    else{catch_=clamp(catch_-2.6,0,100);outT+=40;const dist=cur<zL?(zL-cur):(cur-(zL+zW));T('tmsg',dist>9?'⚠️ TALI HAMPIR PUTUS!':dist>4?'⚡ Jaga cursor!':'');}
    const tc=$('tz-cur');if(tc)tc.style.left=(cur-3.5)+'%';
    $('prog-bar').style.width=catch_+'%';T('prog-pct',~~catch_+'%');
    if(catch_>=100){clearInterval(mgIv);setTimeout(()=>completeCatch(fish,rar,wt),80);}
    if(outT>=2800){clearInterval(mgIv);setState('break');T('break-msg','Tali putus! Ikan terlalu liar!');G.combo=0;pending=null;damDur(4);updateHUD();}
  },40);
}

/* ─────────── CATCH ─────────── */
function completeCatch(fish,rar,wt){
  if(!pending)return;pending=null;clearInterval(mgIv);
  damDur(Math.max(1,Math.floor(wt/15)));
  const cMul={Common:1,Uncommon:1.6,Rare:3,Epic:5.5,Legendary:15,Mythic:32};
  const xMul={Common:1,Uncommon:2,Rare:4.5,Epic:9,Legendary:22,Mythic:55};
  let bc=Math.floor(fish.v*(1+wt*.04)*(cMul[rar]||1));
  let bx=Math.floor(10*(xMul[rar]||1)*(1+wt*.02));
  G.combo++;if(G.combo>G.bestStr)G.bestStr=G.combo;
  let bonus=0,bonusTxt='';
  if(G.combo>=10){bonus=Math.floor(bc*.6);bonusTxt='🔥 SUPER STREAK ×'+G.combo+'! +'+fmt(bonus)+'💰!';}
  else if(G.combo>=5){bonus=Math.floor(bc*.25);bonusTxt='🔥 STREAK ×'+G.combo+'! +'+fmt(bonus)+'💰!';}
  else if(G.combo>=3){bonus=Math.floor(bc*.1);bonusTxt='🔥 STREAK ×'+G.combo+'! +'+fmt(bonus)+'💰';}
  if(G.combo>=3){T('streak-msg','🔥 STREAK ×'+G.combo+'!');const sp=$('streak-pop');sp.classList.add('on');setTimeout(()=>sp.classList.remove('on'),1600);}
  let gems=0,gTxt='';
  if(rar==='Epic')gems=1;else if(rar==='Legendary')gems=3;else if(rar==='Mythic')gems=8;
  // Inventory
  const fid=fish.id;
  if(!G.inv[fid])G.inv[fid]={fish,rar,count:0,maxWt:0};
  G.inv[fid].count++;G.inv[fid].maxWt=Math.max(G.inv[fid].maxWt,wt);
  G.tot++;if(wt>G.heaviest)G.heaviest=wt;if(rar==='Mythic')G.mythics++;
  if(duelOn){duelPts.p1++;duelPts.p1kg=Math.max(duelPts.p1kg,wt);updateDuelDisplay();}
  addCoins(bc+bonus);if(gems>0){addGems(gems);gTxt='+'+gems+'💎';}addXP(bx);
  bobber.vis=false;splash(bobber.x,wY,16);setTimeout(()=>fishJump(fish.i),200);
  // Result card
  setState('result');
  T('res-ico',fish.i);T('res-name',fish.n);T('res-size',sizeLabel(wt));T('res-kg',wt+'kg');
  T('rwc','+'+fmt(bc+bonus)+'💰');T('rwx','+'+bx+'XP');T('rwg',gTxt);T('res-bonus',bonusTxt);
  const rr=$('res-rar');if(rr){rr.textContent=rar.toUpperCase();rr.className='rar-badge '+rar;}
  doSparks(rar);checkAch();save();
}

/* ─────────── BOSS (#1) ─────────── */
let bossCD=0;
function initBossSystem(){setInterval(()=>{if(state==='wait'&&G.tot>0&&G.tot%12===0&&Date.now()>bossCD){bossCD=Date.now()+6*60000;spawnBossWarn();}},3000);}
function spawnBossWarn(){
  bossData=pick(BOSSES);bossHp=bossData.hp;
  const wt=$('boss-txt');wt.textContent='⚠️ '+bossData.n+'\nAPPEARED!';wt.classList.add('on');
  glow(2500);shake();
  $('world-boss')?.classList.replace('wboss-off','wboss-on');
  for(let i=0;i<20;i++){const a=Math.random()*Math.PI*2,d=20+Math.random()*60;setTimeout(()=>splash(bobber.x+Math.cos(a)*d,wY+Math.sin(a)*d,3),i*100);}
  setTimeout(()=>wt.classList.remove('on'),2500);
  setTimeout(()=>{
    T('bw-ico',bossData.i);T('bw-ttl','⚠️ '+bossData.n+' MUNCUL!');
    T('bw-sub',bossData.desc+'\nReward: '+bossData.rw.c+'💰 +'+bossData.rw.g+'💎');
    openM('m-boss');
  },500);
}
function startBoss(){
  if(!bossData)bossData=pick(BOSSES);
  closeM('m-boss');bossHp=bossData.hp;
  T('boss-ico',bossData.i);T('boss-name',bossData.n);T('boss-desc',bossData.desc);
  $('hp-bar').style.width='100%';T('hp-txt',bossHp+'/'+bossData.hp);
  bobber.vis=false;splash(bobber.x,wY,22);glow(800);shake();
  $('world-boss')?.classList.replace('wboss-off','wboss-on');
  setState('boss');
}
function hitBoss(){
  if(state!=='boss'||!bossData)return;
  bossHp--;
  const pct=clamp(bossHp/bossData.hp*100,0,100);
  $('hp-bar').style.width=pct+'%';T('hp-txt',bossHp+'/'+bossData.hp);
  shake();glow(300);splash(W*.4+Math.random()*W*.2,wY+20,5);
  if(bossHp<=0){
    const r=bossData.rw;addCoins(r.c);addGems(r.g);addXP(r.x);
    G.combo++;if(G.combo>G.bestStr)G.bestStr=G.combo;G.tot++;G.bosses++;
    const bid='boss_'+bossData.id;if(!G.inv[bid])G.inv[bid]={fish:{id:bid,n:bossData.n,i:bossData.i,v:r.c},rar:'Boss',count:0,maxWt:0};G.inv[bid].count++;
    setState('result');T('res-ico',bossData.i);T('res-name',bossData.n+' Defeated!');T('res-size','BOSS');T('res-kg','∞kg');T('rwc','+'+fmt(r.c)+'💰 +'+r.g+'💎');T('rwx','+'+r.x+'XP');T('rwg','⚔️');T('res-bonus','🏆 Boss dikalahkan! Luar biasa!');
    const rr=$('res-rar');if(rr){rr.textContent='BOSS';rr.className='rar-badge Boss';}
    doSparks('Mythic');$('world-boss')?.classList.replace('wboss-on','wboss-off');
    notif('⚔️',bossData.n+' DIKALAHKAN! +'+fmt(r.c)+'💰!',5000);
    bossData=null;checkAch();save();
  }
}

/* ─────────── BOTTLE (#3) ─────────── */
function openBottle(){
  const b=pick(BOTTLES);const rw=b.rw();const chips=[];
  if(rw.c){G.coins+=rw.c;G.earned+=rw.c;chips.push('+'+rw.c+'💰');}
  if(rw.g){G.gems+=rw.g;chips.push('+'+rw.g+'💎');}
  if(rw.map)showTreasure();
  $('bottle-msg').textContent=b.msg;
  $('bottle-rw').innerHTML=chips.map(c=>'<span class="brw-chip">'+c+'</span>').join('');
  G.bottles++;setState('bottle-open');updateHUD();checkAch();save();
}

/* ─────────── TREASURE MAP (#4) ─────────── */
function showTreasure(){G.treasures++;openM('m-treasure');}
function goTreasure(){
  closeM('m-treasure');G.mapId='hidden';G.treasureEnd=Date.now()+3*60000;
  toast('🏴‍☠️ Hidden Spot aktif! 3 menit!',5000);notif('🗺️','Treasure Spot aktif! Rare & Epic naik!');
  updateHUD();save();
  setTimeout(()=>{if(G.mapId==='hidden'&&G.treasureEnd<=Date.now()+1000){G.mapId='river';updateHUD();toast('🗺️ Treasure Spot berakhir.');}},185000);
}

/* ─────────── TRASH (#9) ─────────── */
function showTrash(){
  const tr=pick(TRASH);T('trash-ico',tr.i);T('trash-sub',tr.t);
  G.combo=0;pending=null;bobber.vis=false;setState('trash');updateHUD();
}

/* ─────────── LUCKY HOUR (#5) ─────────── */
let lkIv=null,lkCd=60;
function startLucky(){
  G.luckyEnd=Date.now()+60000;G.lucks++;lkCd=60;
  $('lucky-bar').style.display='flex';$('lk-fill').style.width='100%';
  openM('m-lucky');toast('⭐ LUCKY HOUR! Rare fish +50%!',5000);
  clearInterval(lkIv);
  lkIv=setInterval(()=>{
    lkCd--;const m=~~(lkCd/60),s=lkCd%60;T('lk-time',m+':'+String(s).padStart(2,'0'));
    $('lk-fill').style.width=(lkCd/60*100)+'%';
    if(lkCd<=0){clearInterval(lkIv);$('lucky-bar').style.display='none';toast('⭐ Lucky Hour selesai!');updateHUD();}
  },1000);
  checkAch();save();updateHUD();
}
setInterval(()=>{if(Math.random()<.016&&G.luckyEnd<Date.now())startLucky();},10000);

/* ─────────── MARKET (#11) ─────────── */
function renderMarket(){
  const el=$('mkt-list');if(!el)return;
  const rows=Object.entries(G.inv).filter(([,v])=>v.count>0);
  if(!rows.length){el.innerHTML='<div class="mkt-empty">🎣 Belum ada ikan!<br><small>Ayo mancing dulu!</small></div>';return;}
  el.innerHTML=rows.map(([id,v])=>{
    const p=PRICES[v.rar]||5;const tot=p*v.count;
    return`<div class="mkt-row"><div class="mi">${v.fish.i}</div><div class="minfo"><div class="mn">${v.fish.n}</div><div class="mp">${p} koin/ekor · Total: ${fmt(tot)}</div><div class="mc">${v.count}× · <span class="rar-badge ${v.rar}" style="font-size:.44rem;padding:1px 6px">${v.rar}</span></div></div><div class="mbtns"><button class="sell-btn s1" data-id="${id}" data-p="${p}">−1<br>💰${p}</button><button class="sell-btn sa" data-id="${id}" data-tot="${tot}">ALL<br>💰${fmt(tot)}</button></div></div>`;
  }).join('');
  el.querySelectorAll('.s1').forEach(b=>b.onclick=()=>{
    const inv=G.inv[b.dataset.id];if(!inv||inv.count<=0)return;
    inv.count--;if(inv.count<=0)delete G.inv[b.dataset.id];
    addCoins(+b.dataset.p);toast('💰 +'+b.dataset.p+' koin!');renderMarket();save();
  });
  el.querySelectorAll('.sa').forEach(b=>b.onclick=()=>{
    const tot=+b.dataset.tot;delete G.inv[b.dataset.id];
    addCoins(tot);toast('💰 Sold All! +'+fmt(tot)+' koin!');renderMarket();save();
  });
}

/* ─────────── CODEX (#7) ─────────── */
function renderCodex(){
  const grid=$('codex-grid');if(!grid)return;
  const all=Object.values(FISH).flat().concat(BOSSES.map(b=>({id:'boss_'+b.id,n:b.n,i:b.i,rar:'Boss'})));
  const tot=all.length,found=all.filter(f=>G.inv[f.id]?.count>0).length;
  T('codex-prog',found+'/'+tot+' ditemukan');
  grid.innerHTML=all.map(fish=>{
    const caught=G.inv[fish.id]?.count>0;
    const rar=Object.entries(FISH).find(([,arr])=>arr.find(f=>f.id===fish.id))?.[0]||'Boss';
    const cnt=G.inv[fish.id]?.count||0;
    return`<div class="cc ${caught?'found':'unk'}"><div class="cc-f">${caught?fish.i:'❓'}</div><div class="cc-n">${caught?fish.n:'?????'}</div><div class="rar-badge ${rar} cc-r" style="font-size:.44rem;padding:1px 4px">${rar}</div>${caught?`<div class="cc-c">×${cnt}</div>`:''}</div>`;
  }).join('');
}

/* ─────────── SHOP (#6, #8) ─────────── */
function renderShop(panel='rods'){
  document.querySelectorAll('.sn').forEach(b=>b.classList.toggle('on',b.dataset.sp===panel));
  ['rods','baits','repair'].forEach(p=>{const e=$('sp-'+p);if(e)e.classList.toggle('hidden',p!==panel);});
  T('sh-bal',fmt(G.coins));
  if(panel==='rods'){
    $('sp-rods').innerHTML=RODS.map(rod=>{
      const own=G.ownedRods.includes(rod.id),act=G.rodId===rod.id;
      const curD=G.rodDur[rod.id]??rod.dur,dPct=clamp(curD/rod.dur*100,0,100);
      const dc=dPct<30?'#ef4444':dPct<60?'#fb923c':'#4ade80';
      return`<div class="sc ${act?'equipped':''}"><div class="sc-ico">${rod.i}</div>${act?'<div class="sc-tag">AKTIF</div>':own?'<div class="sc-tag" style="background:#4ade80;color:#052e10">✓</div>':''}<div class="sc-nm">${rod.n}</div><div class="sc-desc">${rod.desc}</div><div class="sc-stat">Max ${rod.maxKg}kg · Dur ${rod.dur}</div>${own?`<div class="sc-dur">⚙️ ${~~dPct}%<div class="dur-mini-bg"><div class="dur-mini-fill" style="width:${dPct}%;background:${dc}"></div></div></div>`:''}<div class="sc-pr">${rod.cost?'💰 '+fmt(rod.cost):'Gratis'}</div><button class="sc-btn ${act?'active':own?'equip':'buy'}" data-rod="${rod.id}" ${act?'disabled':''}>${act?'Equipped':own?'Pasang':rod.cost?'Beli':'Ambil'}</button></div>`;
    }).join('');
    $('sp-rods').querySelectorAll('[data-rod]').forEach(b=>b.onclick=()=>buyRod(b.dataset.rod));
  }
  else if(panel==='baits'){
    $('sp-baits').innerHTML=BAITS.map(bait=>{
      const qty=G.ownedBaits[bait.id]||0,act=G.baitId===bait.id;
      return`<div class="sc ${act?'equipped':''}"><div class="sc-ico">${bait.i}</div>${act?'<div class="sc-tag">AKTIF</div>':''}<div class="sc-nm">${bait.n}</div><div class="sc-desc">${bait.desc}</div><div class="sc-stat">Stok: ${qty>500?'∞':qty}</div><div class="sc-pr">${bait.cost?'💰 '+fmt(bait.cost):'Gratis'}</div><button class="sc-btn ${act?'active':qty>0?'equip':'buy'}" data-bait="${bait.id}">${act?'Aktif':qty>0?'Pasang':bait.cost?'Beli ×5':'Ambil'}</button></div>`;
    }).join('');
    $('sp-baits').querySelectorAll('[data-bait]').forEach(b=>b.onclick=()=>buyBait(b.dataset.bait));
  }
  else{
    const owned=RODS.filter(r=>G.ownedRods.includes(r.id));
    $('sp-repair').innerHTML='<p style="font-size:.7rem;color:rgba(255,255,255,.28);margin-bottom:8px">Rod lemah = ikan mudah kabur. Repair untuk performa optimal!</p>'+
      owned.map(rod=>{
        const d=G.rodDur[rod.id]??rod.dur,dp=clamp(d/rod.dur*100,0,100),dc=dp<30?'#ef4444':dp<60?'#fb923c':'#4ade80';
        const cost=Math.max(10,~~((rod.dur-d)*.7));const full=d>=rod.dur;
        return`<div class="repair-row"><div class="repair-ico">${rod.i}</div><div class="repair-info"><div class="repair-nm">${rod.n}</div><div class="repair-dr"><span class="repair-pct">${~~dp}%</span><div class="repair-bar-bg"><div class="repair-bar-fill" style="width:${dp}%;background:${dc}"></div></div></div></div><div><div style="font-size:.7rem;font-weight:800;color:var(--gold);margin-bottom:4px">${full?'✓ Full':'💰 '+fmt(cost)}</div><button class="sc-btn ${full?'active':'buy'}" style="background:${full?'':'linear-gradient(135deg,#6d28d9,#a855f7)'};color:#fff" data-rep="${rod.id}" data-cost="${cost}" ${full?'disabled':''}>${full?'Full ✓':'🔧 Repair'}</button></div></div>`;
      }).join('');
    $('sp-repair').querySelectorAll('[data-rep]').forEach(b=>b.onclick=()=>{
      const rid=b.dataset.rep,cost=+b.dataset.cost;
      if(G.coins<cost){toast('💸 Koin tidak cukup!');return;}
      G.coins-=cost;const rod=RODS.find(r=>r.id===rid)||RODS[0];G.rodDur[rid]=rod.dur;
      toast('🔧 '+rod.n+' diperbaiki!');updateHUD();renderShop('repair');save();
    });
  }
}
function buyRod(id){
  const rod=RODS.find(r=>r.id===id);if(!rod)return;
  if(G.ownedRods.includes(id)){G.rodId=id;toast('⚡ '+rod.n+' dipasang!');updateHUD();renderShop('rods');save();return;}
  if(G.coins<rod.cost){toast('💸 Butuh '+fmt(rod.cost)+' koin!');return;}
  G.coins-=rod.cost;G.ownedRods.push(id);G.rodId=id;if(!G.rodDur[id])G.rodDur[id]=rod.dur;
  toast('🎉 '+rod.n+' dibeli!');updateHUD();renderShop('rods');save();
}
function buyBait(id){
  const bait=BAITS.find(b=>b.id===id);if(!bait)return;
  if(!bait.cost){G.baitId=id;toast(bait.i+' aktif!');renderShop('baits');save();return;}
  if(G.ownedBaits[id]>0){G.baitId=id;toast(bait.i+' aktif!');renderShop('baits');save();return;}
  if(G.coins<bait.cost){toast('💸 Butuh '+fmt(bait.cost)+' koin!');return;}
  G.coins-=bait.cost;G.ownedBaits[id]=(G.ownedBaits[id]||0)+5;G.baitId=id;
  toast('🛒 '+bait.n+' ×5 dibeli!');updateHUD();renderShop('baits');save();
}

/* ─────────── DUEL (#2) ─────────── */
let duelOn=false,duelTimer=null,duelCd=60,cpuIv=null;
let duelPts={p1:0,p1kg:0,p2:0,p2kg:0};

function renderDuel(){
  const dc=$('duel-body');if(!dc)return;
  if(!duelOn){
    dc.innerHTML=`<div class="duel-card"><div class="dcard-ttl">⚔️ FISHING DUEL</div><div class="duel-rules">🤝 Kamu vs CPU AI<br>⏱️ Durasi: 60 detik<br>🏆 Menang: Ikan terberat atau terbanyak<br>💰 Winner: +800 koin!</div><div class="duel-scores"><div class="ds-box"><div class="ds-lbl">🎣 Kamu</div><div class="ds-fish">0 ikan</div><div class="ds-kg">0.0 kg</div></div><div class="ds-box"><div class="ds-lbl">🤖 CPU</div><div class="ds-fish" id="dp2c">0 ikan</div><div class="ds-kg" id="dp2k">0.0 kg</div></div></div><button class="duel-start-btn" id="duel-start">⚔️ MULAI DUEL!</button></div>`;
    $('duel-start')?.addEventListener('click',startDuel);
  } else {
    dc.innerHTML=`<div class="duel-card"><div class="dcard-ttl">⚔️ DUEL AKTIF!</div><div class="duel-timer" id="dtimer">1:00</div><div class="duel-scores"><div class="ds-box"><div class="ds-lbl">🎣 Kamu</div><div class="ds-fish" id="dp1c">0 ikan</div><div class="ds-kg" id="dp1k">0.0 kg</div></div><div class="ds-box"><div class="ds-lbl">🤖 CPU</div><div class="ds-fish" id="dp2c">0 ikan</div><div class="ds-kg" id="dp2k">0.0 kg</div></div></div><div class="duel-hint">🎣 Pergi ke tab Mancing dan tangkap ikan!</div></div>`;
    updateDuelDisplay();
  }
}
function startDuel(){
  duelOn=true;duelCd=60;duelPts={p1:0,p1kg:0,p2:0,p2kg:0};G.duels++;checkAch();save();
  renderDuel();toast('⚔️ DUEL MULAI! Mancing cepat!',5000);notif('⚔️','Duel aktif! 60 detik!');
  cpuIv=setInterval(()=>{if(!duelOn){clearInterval(cpuIv);return;}const rar=['Common','Uncommon','Rare'][rnd(3)];const wt=rollWt(rar);duelPts.p2++;duelPts.p2kg=Math.max(duelPts.p2kg,wt);updateDuelDisplay();},8000+Math.random()*5000);
  duelTimer=setInterval(()=>{duelCd--;const m=~~(duelCd/60),s=duelCd%60;T('dtimer',m+':'+String(s).padStart(2,'0'));if(duelCd<=0){clearInterval(duelTimer);clearInterval(cpuIv);endDuel();}},1000);
}
function updateDuelDisplay(){
  const lead=duelPts.p1kg>duelPts.p2kg||duelPts.p1>duelPts.p2;
  T('dp1c',(duelPts.p1||0)+' ikan');const d1=$('dp1k');if(d1){d1.textContent=(duelPts.p1kg||0).toFixed(1)+' kg';d1.className='ds-kg'+(lead&&duelOn?' lead':'');}
  T('dp2c',(duelPts.p2||0)+' ikan');const d2=$('dp2k');if(d2){d2.textContent=(duelPts.p2kg||0).toFixed(1)+' kg';d2.className='ds-kg'+(!lead&&duelOn?' lead':'');}
}
function endDuel(){
  duelOn=false;
  const p1s=duelPts.p1+duelPts.p1kg*.1,p2s=duelPts.p2+duelPts.p2kg*.1;
  const p1w=p1s>p2s;addCoins(p1w?800:150);
  T('de-ico',p1w?'🏆':'😅');T('de-ttl',p1w?'🏆 KAMU MENANG!':'🤖 CPU MENANG!');
  $('de-scores').innerHTML=`<div class="de-grid"><div class="de-box"><div class="de-lbl">🎣 Kamu</div><div class="de-val">${duelPts.p1} ikan<br>${duelPts.p1kg.toFixed(1)}kg</div></div><div class="de-box"><div class="de-lbl">🤖 CPU</div><div class="de-val">${duelPts.p2} ikan<br>${duelPts.p2kg.toFixed(1)}kg</div></div></div>`;
  T('de-sub',(p1w?'Reward: ':'Consolation: ')+'+'+fmt(p1w?800:150)+' koin!');
  openM('m-duel-end');$('de-ok').onclick=()=>{closeM('m-duel-end');renderDuel();};
  renderDuel();save();
}

/* ─────────── TAB SWITCHING ─────────── */
function switchTab(id){
  ['fish','market','codex','shop','duel'].forEach(t=>{$('t-'+t)?.classList.toggle('on',t===id);});
  document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
  if(id==='market')renderMarket();
  if(id==='codex')renderCodex();
  if(id==='shop')renderShop('rods');
  if(id==='duel')renderDuel();
}

/* ─────────── SPLASH CANVAS ─────────── */
function initSplash(){
  const sc=$('splash-cv');if(!sc)return;
  const sctx=sc.getContext('2d');
  const fish=Array.from({length:10},()=>({x:Math.random()*window.innerWidth,y:window.innerHeight*.58+Math.random()*window.innerHeight*.38,vx:(.3+Math.random()*.8)*(Math.random()>.5?1:-1),ico:['🐟','🐠','🐡'][rnd(3)],sz:12+rnd(12)}));
  let st=0;
  function rsz(){sc.width=window.innerWidth;sc.height=window.innerHeight;}rsz();
  window.addEventListener('resize',rsz);
  (function loop(){st+=.016;sctx.clearRect(0,0,sc.width,sc.height);
    sctx.beginPath();sctx.strokeStyle='rgba(0,150,199,.22)';sctx.lineWidth=3;
    for(let x=0;x<=sc.width;x+=4){const wy=sc.height*.62+Math.sin(x*.02+st*1.5)*14;x===0?sctx.moveTo(x,wy):sctx.lineTo(x,wy);}sctx.stroke();
    sctx.fillStyle='rgba(0,50,120,.4)';sctx.beginPath();
    for(let x=0;x<=sc.width;x+=4){const wy=sc.height*.64+Math.sin(x*.025+st*1.3)*11;x===0?sctx.moveTo(x,wy):sctx.lineTo(x,wy);}
    sctx.lineTo(sc.width,sc.height);sctx.lineTo(0,sc.height);sctx.fill();
    fish.forEach(f=>{f.x+=f.vx;if(f.x>sc.width+50)f.x=-50;if(f.x<-50)f.x=sc.width+50;sctx.save();sctx.translate(f.x,f.y);if(f.vx<0)sctx.scale(-1,1);sctx.font=`${f.sz}px serif`;sctx.textAlign='center';sctx.textBaseline='middle';sctx.fillText(f.ico,0,0);sctx.restore();});
    requestAnimationFrame(loop);
  })();
}

/* ─────────── INIT ─────────── */
window.addEventListener('DOMContentLoaded',()=>{
  initSplash();

  $('btn-start').addEventListener('click',()=>{
    load();
    $('splash').style.opacity='0';$('splash').style.transition='opacity .5s';
    setTimeout(()=>$('splash').style.display='none',500);
    $('app').style.display='flex';
    setTimeout(()=>{initCanvas();cycleWeather();updateHUD();initBossSystem();},160);
  });

  // Nav
  document.querySelectorAll('.nb').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
  // Shop subnav
  document.querySelectorAll('.sn').forEach(b=>b.addEventListener('click',()=>renderShop(b.dataset.sp)));

  // Fishing buttons
  $('btn-cast').addEventListener('click',doCast);
  $('btn-pull').addEventListener('click',doPull);
  $('btn-cancel').addEventListener('click',reset);
  $('btn-hit').addEventListener('click',hitBoss);
  $('btn-bottle').addEventListener('click',openBottle);
  $('btn-ab').addEventListener('click',reset);
  $('btn-at').addEventListener('click',reset);
  $('btn-again').addEventListener('click',reset);
  $('btn-keep').addEventListener('click',reset);
  $('btn-brk').addEventListener('click',reset);
  $('btn-mss').addEventListener('click',reset);

  // Boss modal
  $('bw-ok').addEventListener('click',()=>{closeM('m-boss');startBoss();});
  // Treasure modal
  $('tmap-btn').addEventListener('click',goTreasure);

  // Autosave
  setInterval(save,25000);

  // Treasure expiry check
  setInterval(()=>{if(G.treasureEnd>0&&G.treasureEnd<Date.now()&&G.mapId==='hidden'){G.mapId='river';G.treasureEnd=0;updateHUD();toast('🗺️ Treasure Spot berakhir.');}},5000);
});
