// script.js - dengan animasi memancing, berat ikan, dan sistem tarik

// ==================== DATA IKAN DENGAN BERAT ====================
const FISH_DB = {
    common: [
        { name: 'Dogecoin (DOGE)', emoji: '🐟', rarity: 'common', basePrice: 10, weightMin: 0.5, weightMax: 2 },
        { name: 'Shiba Inu (SHIB)', emoji: '🐟', rarity: 'common', basePrice: 12, weightMin: 0.5, weightMax: 2.5 },
        { name: 'Cardano (ADA)', emoji: '🐟', rarity: 'common', basePrice: 15, weightMin: 1, weightMax: 3 },
        { name: 'Polygon (MATIC)', emoji: '🐟', rarity: 'common', basePrice: 14, weightMin: 1, weightMax: 2.8 },
        { name: 'USD/IDR', emoji: '🐟', rarity: 'common', basePrice: 8, weightMin: 0.3, weightMax: 1.5 },
        { name: 'EUR/USD', emoji: '🐟', rarity: 'common', basePrice: 11, weightMin: 0.4, weightMax: 1.8 },
        { name: 'BBRI', emoji: '🐟', rarity: 'common', basePrice: 9, weightMin: 0.6, weightMax: 2 },
        { name: 'TLKM', emoji: '🐟', rarity: 'common', basePrice: 9, weightMin: 0.6, weightMax: 2 }
    ],
    uncommon: [
        { name: 'Solana (SOL)', emoji: '🐠', rarity: 'uncommon', basePrice: 28, weightMin: 2, weightMax: 5 },
        { name: 'Polkadot (DOT)', emoji: '🐠', rarity: 'uncommon', basePrice: 26, weightMin: 2, weightMax: 5.5 },
        { name: 'Avalanche (AVAX)', emoji: '🐠', rarity: 'uncommon', basePrice: 30, weightMin: 2.5, weightMax: 6 },
        { name: 'Chainlink (LINK)', emoji: '🐠', rarity: 'uncommon', basePrice: 22, weightMin: 1.8, weightMax: 4.5 },
        { name: 'GBP/USD', emoji: '🐠', rarity: 'uncommon', basePrice: 18, weightMin: 1.2, weightMax: 3.5 },
        { name: 'USD/JPY', emoji: '🐠', rarity: 'uncommon', basePrice: 17, weightMin: 1.2, weightMax: 3.2 },
        { name: 'BBCA', emoji: '🐠', rarity: 'uncommon', basePrice: 20, weightMin: 1.5, weightMax: 4 },
        { name: 'BMRI', emoji: '🐠', rarity: 'uncommon', basePrice: 21, weightMin: 1.6, weightMax: 4.2 }
    ],
    rare: [
        { name: 'Binance Coin (BNB)', emoji: '🐡', rarity: 'rare', basePrice: 45, weightMin: 5, weightMax: 12 },
        { name: 'Litecoin (LTC)', emoji: '🐡', rarity: 'rare', basePrice: 42, weightMin: 4.5, weightMax: 10 },
        { name: 'Cosmos (ATOM)', emoji: '🐡', rarity: 'rare', basePrice: 40, weightMin: 4, weightMax: 9 },
        { name: 'XRP', emoji: '🐡', rarity: 'rare', basePrice: 38, weightMin: 3.5, weightMax: 8 },
        { name: 'AUD/USD', emoji: '🐡', rarity: 'rare', basePrice: 32, weightMin: 3, weightMax: 7 },
        { name: 'USD/CHF', emoji: '🐡', rarity: 'rare', basePrice: 33, weightMin: 3.2, weightMax: 7.5 },
        { name: 'ASII', emoji: '🐡', rarity: 'rare', basePrice: 35, weightMin: 3.5, weightMax: 8 },
        { name: 'UNVR', emoji: '🐡', rarity: 'rare', basePrice: 37, weightMin: 3.8, weightMax: 8.5 }
    ],
    epic: [
        { name: 'Ethereum (ETH)', emoji: '🐙', rarity: 'epic', basePrice: 75, weightMin: 10, weightMax: 25 },
        { name: 'Ripple (XRP)', emoji: '🐙', rarity: 'epic', basePrice: 68, weightMin: 9, weightMax: 22 },
        { name: 'EUR/JPY', emoji: '🐙', rarity: 'epic', basePrice: 55, weightMin: 7, weightMax: 18 },
        { name: 'GBP/JPY', emoji: '🐙', rarity: 'epic', basePrice: 58, weightMin: 7.5, weightMax: 19 },
        { name: 'INDF', emoji: '🐙', rarity: 'epic', basePrice: 62, weightMin: 8, weightMax: 20 },
        { name: 'GGRM', emoji: '🐙', rarity: 'epic', basePrice: 65, weightMin: 8.5, weightMax: 21 }
    ],
    legendary: [
        { name: 'Bitcoin (BTC)', emoji: '🐋', rarity: 'legendary', basePrice: 200, weightMin: 30, weightMax: 70 },
        { name: 'ETH/BTC', emoji: '🐋', rarity: 'legendary', basePrice: 180, weightMin: 25, weightMax: 60 },
        { name: 'USD/CAD', emoji: '🐋', rarity: 'legendary', basePrice: 95, weightMin: 15, weightMax: 35 },
        { name: 'BBNI', emoji: '🐋', rarity: 'legendary', basePrice: 110, weightMin: 18, weightMax: 40 }
    ],
    mythic: [
        { name: 'Satoshi Coin', emoji: '🐉', rarity: 'mythic', basePrice: 500, weightMin: 80, weightMax: 200 },
        { name: 'Quantum Bitcoin', emoji: '🐉', rarity: 'mythic', basePrice: 550, weightMin: 90, weightMax: 220 },
        { name: 'Global Market Whale', emoji: '🐉', rarity: 'mythic', basePrice: 600, weightMin: 100, weightMax: 250 },
        { name: 'IDX Dragon Asset', emoji: '🐉', rarity: 'mythic', basePrice: 480, weightMin: 70, weightMax: 180 }
    ]
};

// Base drop rate (dalam %)
const BASE_RATES = {
    common: 55,
    uncommon: 20,
    rare: 12,
    epic: 7,
    legendary: 4,
    mythic: 2
};

// Bonus level
function getLevelBonus(level) {
    if (level >= 31) return 10;
    if (level >= 21) return 6;
    if (level >= 11) return 4;
    if (level >= 6) return 2;
    return 0;
}

// Bonus rod
const ROD_BONUS = {
    'Basic Rod': { rare:0, epic:0, legendary:0, mythic:0 },
    'Trader Rod': { rare:2, epic:0, legendary:0, mythic:0 },
    'Sultan Rod': { rare:0, epic:3, legendary:0, mythic:0 },
    'Whale Rod': { rare:0, epic:0, legendary:3, mythic:0 },
    'God Rod': { rare:0, epic:0, legendary:0, mythic:4 }
};

// Bonus pet
const PET_BONUS = {
    'none': { rare:0, epic:0, legendary:0, mythic:0 },
    'Lucky Koi': { rare:2, epic:0, legendary:0, mythic:0 },
    'Smart Octopus': { rare:0, epic:2, legendary:0, mythic:0 }, 
    'Treasure Puffer': { rare:0, epic:0, legendary:2, mythic:0 },
    'Crypto Dragon': { rare:0, epic:0, legendary:0, mythic:3 }
};

// Bonus map
const MAP_BONUS = {
    'River Market': { common:10, rare:0, epic:0, legendary:0, mythic:0 },
    'Forex Ocean': { common:0, rare:5, epic:0, legendary:0, mythic:0 },
    'Crypto Sea': { common:0, rare:0, epic:5, legendary:0, mythic:0 },
    'Whale Abyss': { common:0, rare:0, epic:0, legendary:5, mythic:0 },
    'Mythic Trench': { common:0, rare:0, epic:0, legendary:0, mythic:3 }
};

// Kekuatan pancing berdasarkan level (kg)
const ROD_STRENGTH = {
    1: 5,   // Basic Rod
    2: 15,  // Trader Rod
    3: 30,  // Sultan Rod
    4: 60,  // Whale Rod
    5: 200  // God Rod
};

// ==================== STATE GAME ====================
let coin = 250;
let gem = 5;
let playerLevel = 7; // mulai level 7
let inventory = [];
let ownedPets = ['Lucky Koi'];
let equippedPet = 'Lucky Koi';
let rodLevel = 1;
let baitLevel = 1;
let netLevel = 1;
let missions = [
    { id:1, desc:'Tangkap 3 Dogecoin', target:'Dogecoin (DOGE)', required:3, progress:0, reward:50, completed:false },
    { id:2, desc:'Tangkap 2 Forex pair', target:'Forex', required:2, progress:0, reward:80, completed:false },
    { id:3, desc:'Tangkap 1 Legendary', target:'legendary', required:1, progress:0, reward:200, completed:false }
];
let sound = true;
let music = true;

// Variabel untuk sistem memancing dua tahap + animasi
let castingTimer = null;
let approachTimer = null;
let biteTimer = null;
let struggleInterval = null;
let isCasting = false;
let currentMapForFishing = 'Crypto Sea';
let currentFish = null; // ikan yang sedang dipancing
let currentFishWeight = 0;
let struggleProgress = 50; // 0-100
let fishEscaped = false;

// ==================== HELPER FUNCTIONS ====================
function getRodName() {
    const rods = ['Basic Rod', 'Trader Rod', 'Sultan Rod', 'Whale Rod', 'God Rod'];
    return rods[rodLevel-1] || 'Basic Rod';
}

function getRodMaxWeight() {
    return ROD_STRENGTH[rodLevel] || 5;
}

function calculateFinalChances(mapName) {
    let final = { ...BASE_RATES };
    const levelBonus = getLevelBonus(playerLevel);
    const rod = ROD_BONUS[getRodName()];
    const pet = PET_BONUS[equippedPet] || PET_BONUS.none;
    const map = MAP_BONUS[mapName] || {};

    final.rare += levelBonus + (rod.rare || 0) + (pet.rare || 0) + (map.rare || 0);
    final.epic += (rod.epic || 0) + (pet.epic || 0) + (map.epic || 0);
    final.legendary += (rod.legendary || 0) + (pet.legendary || 0) + (map.legendary || 0);
    final.mythic += (rod.mythic || 0) + (pet.mythic || 0) + (map.mythic || 0);
    
    final.common += (map.common || 0);
    
    let totalBonus = (final.rare - BASE_RATES.rare) + (final.epic - BASE_RATES.epic) + 
                     (final.legendary - BASE_RATES.legendary) + (final.mythic - BASE_RATES.mythic);
    final.common = Math.max(5, final.common - totalBonus);

    let total = final.common + final.uncommon + final.rare + final.epic + final.legendary + final.mythic;
    if (total !== 100) {
        final.common += (100 - total);
    }
    return final;
}

function getRandomFishByChances(chances) {
    let r = Math.random() * 100;
    let cumulative = 0;
    const rarities = ['common','uncommon','rare','epic','legendary','mythic'];
    for (let rar of rarities) {
        cumulative += chances[rar];
        if (r < cumulative) {
            let arr = FISH_DB[rar];
            return arr[Math.floor(Math.random() * arr.length)];
        }
    }
    return FISH_DB.common[0];
}

// Generate berat acak untuk ikan
function generateWeight(fish) {
    return fish.weightMin + Math.random() * (fish.weightMax - fish.weightMin);
}

// Hitung harga berdasarkan berat dan base price
function calculatePrice(fish, weight) {
    return Math.floor(fish.basePrice * weight);
}

// Update tampilan resource
function refreshUI() {
    document.getElementById('coinAmount').innerText = coin;
    document.getElementById('gemAmount').innerText = gem;
    document.getElementById('playerLevel').innerText = playerLevel;
    document.getElementById('currentRod').innerText = getRodName();
    document.getElementById('rodStrength').innerText = getRodMaxWeight();
    document.getElementById('currentPet').innerText = equippedPet || 'None';
    document.getElementById('rodLevel').innerText = rodLevel;
    document.getElementById('baitLevel').innerText = baitLevel;
    document.getElementById('netLevel').innerText = netLevel;
    renderInventory();
    renderMarket();
    renderMissions();
    renderPets();
}

// ==================== RENDER FUNCTIONS ====================
function renderInventory() {
    const container = document.getElementById('inventoryList');
    if (!container) return;
    if (inventory.length === 0) { container.innerHTML = '<p>Aquarium kosong. Memancing dulu!</p>'; return; }
    let html = '';
    inventory.forEach((fish, idx) => {
        html += `<div class="fish-card rarity-${fish.rarity}" data-index="${idx}">${fish.emoji} ${fish.name}<br>💰${fish.value} (${fish.weight.toFixed(1)} kg)</div>`;
    });
    container.innerHTML = html;
}

function renderMarket() {
    const container = document.getElementById('marketInventory');
    if (!container) return;
    if (inventory.length === 0) { container.innerHTML = '<p>Tidak ada ikan dijual. Tangkap ikan dulu.</p>'; return; }
    let html = '';
    inventory.forEach((fish, idx) => {
        html += `<div class="fish-card rarity-${fish.rarity}" data-index="${idx}">${fish.emoji} ${fish.name}<br>💰${Math.floor(fish.value*0.7)} (jual)</div>`;
    });
    container.innerHTML = html;
    document.querySelectorAll('#marketInventory .fish-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const index = card.dataset.index;
            sellFish(index);
        });
    });
}

function sellFish(index) {
    if (inventory[index]) {
        let fish = inventory[index];
        coin += Math.floor(fish.value * 0.7);
        inventory.splice(index, 1);
        refreshUI();
        playSound('splash');
    }
}

function renderMissions() {
    const container = document.getElementById('missionList');
    if (!container) return;
    let html = '';
    missions.forEach((m, idx) => {
        if (m.completed) {
            html += `<div class="mission-item">✅ ${m.desc} (Selesai)</div>`;
        } else {
            html += `<div class="mission-item">
                <span>${m.desc} [${m.progress}/${m.required}]</span>
                <button class="claim-mission" data-id="${m.id}">💰 ${m.reward}</button>
            </div>`;
        }
    });
    container.innerHTML = html;
    document.querySelectorAll('.claim-mission').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            claimMission(id);
        });
    });
}

function claimMission(id) {
    let mission = missions.find(m => m.id === id);
    if (!mission || mission.completed) return;
    if (mission.progress >= mission.required) {
        coin += mission.reward;
        mission.completed = true;
        gem += 1;
        refreshUI();
        playSound('splash');
    } else {
        alert('Progress mission belum cukup');
    }
}

function renderPets() {
    const select = document.getElementById('equipPetSelect');
    const container = document.getElementById('petsCollection');
    if (!select || !container) return;
    let options = '<option value="none">None</option>';
    let gridHtml = '';
    ownedPets.forEach(pet => {
        options += `<option value="${pet}" ${equippedPet === pet ? 'selected' : ''}>${pet}</option>`;
        gridHtml += `<div class="fish-card rarity-legendary">🐟 ${pet}</div>`;
    });
    select.innerHTML = options;
    container.innerHTML = gridHtml || '<p>Belum punya peliharaan. Selesaikan misi.</p>';
}

// ==================== SOUND EFFECT (simulasi) ====================
function playSound(effect) {
    if (!sound) return;
    console.log(`🔊 ${effect} sound`);
    // Di sini bisa ditambahkan implementasi audio sungguhan jika diinginkan
}

// ==================== ANIMASI ====================
function showSplash() {
    const splash = document.getElementById('splash');
    splash.style.opacity = '1';
    splash.style.animation = 'none';
    splash.offsetHeight; // trigger reflow
    splash.style.animation = 'splash 0.3s ease-out';
    setTimeout(() => { splash.style.opacity = '0'; }, 300);
}

function moveFishAnimation(left) {
    const fishAnim = document.getElementById('fishAnimation');
    fishAnim.style.left = left;
}

function resetFishAnimation() {
    const fishAnim = document.getElementById('fishAnimation');
    fishAnim.style.left = '-50px';
}

// ==================== FISHING SEQUENCE ====================
function startFishing() {
    if (isCasting) return;

    cancelAllFishing(); // bersihkan semua timer

    currentMapForFishing = document.getElementById('mapSelect').value;

    const castBtn = document.getElementById('castButton');
    const reelBtn = document.getElementById('reelButton');
    const statusDiv = document.getElementById('fishingStatus');
    const strengthBarContainer = document.getElementById('strengthBarContainer');
    const resultDiv = document.getElementById('fishingResult');

    castBtn.disabled = true;
    castBtn.style.opacity = '0.5';
    reelBtn.style.display = 'none';
    strengthBarContainer.style.display = 'none';
    resultDiv.innerHTML = '';
    statusDiv.innerText = '🎣 Melempar pancing...';

    playSound('cast');
    showSplash();
    moveFishAnimation('20%'); // animasi pancing masuk air

    isCasting = true;

    // Tahap 1: Menunggu ikan mendekat (setelah 1-2 detik)
    castingTimer = setTimeout(() => {
        statusDiv.innerText = 'Menunggu ikan mendekat...';
        // Mulai pendekatan ikan
        approachFish();
    }, 1500);
}

function approachFish() {
    // Animasi ikan berenang mendekat
    moveFishAnimation('60%');
    playSound('fishApproach');

    const statusDiv = document.getElementById('fishingStatus');
    statusDiv.innerText = '🐟 Seekor ikan mendekat...';

    // Kemungkinan ikan menggigit atau lewat (70% menggigit)
    const willBite = Math.random() < 0.7;

    approachTimer = setTimeout(() => {
        if (willBite) {
            fishBite();
        } else {
            // Ikan lewat, coba lagi dengan ikan lain (maks 3 kali)
            statusDiv.innerText = 'Ikan pergi... menunggu ikan lain...';
            playSound('fishPass');
            resetFishAnimation();
            // Cek kesempatan lagi
            if (Math.random() < 0.5) { // 50% kesempatan ikan lain datang
                approachTimer = setTimeout(() => {
                    approachFish();
                }, 2000);
            } else {
                // Tidak ada ikan, umpan diam
                statusDiv.innerText = 'Tidak ada ikan... coba lagi.';
                cancelFishingSequence();
            }
        }
    }, 2000);
}

function fishBite() {
    // Dapatkan ikan berdasarkan chances
    const chances = calculateFinalChances(currentMapForFishing);
    const fishTemplate = getRandomFishByChances(chances);
    const weight = generateWeight(fishTemplate);
    const price = calculatePrice(fishTemplate, weight);

    currentFish = {
        ...fishTemplate,
        weight: weight,
        value: price
    };

    const statusDiv = document.getElementById('fishingStatus');
    const reelBtn = document.getElementById('reelButton');
    const strengthBarContainer = document.getElementById('strengthBarContainer');

    statusDiv.innerText = `❗ ${currentFish.emoji} ${currentFish.name} (${currentFish.rarity}) menggigit! Tarik sekarang! ❗`;
    playSound('bite');
    showSplash();

    // Tampilkan tombol tarik dan bar kekuatan
    reelBtn.style.display = 'block';
    strengthBarContainer.style.display = 'block';
    struggleProgress = 50;
    document.getElementById('strengthBarFill').style.width = '50%';

    // Mulai struggle (ikan melawan)
    startStruggle();
}

function startStruggle() {
    // Jika berat ikan melebihi kekuatan pancing, langsung putus
    const maxWeight = getRodMaxWeight();
    if (currentFish.weight > maxWeight) {
        // Pancing tidak kuat
        document.getElementById('fishingStatus').innerText = '💔 Pancing tidak kuat! Ikan kabur!';
        playSound('lineBreak');
        cancelFishingSequence();
        return;
    }

    // Interval perjuangan: setiap 0.3 detik, progress berkurang (ikan melawan)
    struggleInterval = setInterval(() => {
        // Kurangi progress (ikan menarik)
        struggleProgress -= Math.random() * 8 + 2; // 2-10%
        if (struggleProgress < 0) struggleProgress = 0;
        document.getElementById('strengthBarFill').style.width = struggleProgress + '%';

        // Jika progress habis, ikan kabur
        if (struggleProgress <= 0) {
            clearInterval(struggleInterval);
            document.getElementById('fishingStatus').innerText = '💨 Ikan kabur!';
            playSound('escape');
            cancelFishingSequence();
        }

        // Efek shake jika ikan besar
        if (currentFish.weight > 20) {
            document.querySelector('.fishing-area').style.animation = 'shake 0.1s infinite';
            setTimeout(() => {
                document.querySelector('.fishing-area').style.animation = '';
            }, 300);
        }
    }, 300);
}

function reelFish() {
    if (!isCasting || !currentFish) return;

    // Tambah progress saat pemain menarik
    struggleProgress += Math.random() * 15 + 5; // 5-20%
    if (struggleProgress > 100) struggleProgress = 100;
    document.getElementById('strengthBarFill').style.width = struggleProgress + '%';

    playSound('reel');

    // Jika progress mencapai 100%, ikan berhasil ditangkap
    if (struggleProgress >= 100) {
        clearInterval(struggleInterval);
        catchFish();
    }
}

function catchFish() {
    // Ikan berhasil ditangkap
    const quantity = 1 + (netLevel > 3 ? 1 : 0);
    for (let i = 0; i < quantity; i++) {
        inventory.push({ 
            name: currentFish.name, 
            rarity: currentFish.rarity, 
            value: currentFish.value, 
            emoji: currentFish.emoji,
            weight: currentFish.weight
        });
    }

    // Update mission
    missions.forEach(m => {
        if (m.completed) return;
        if (m.target === 'Dogecoin (DOGE)' && currentFish.name.includes('Dogecoin')) m.progress += quantity;
        if (m.target === 'Forex' && (currentFish.name.includes('/') && !currentFish.name.includes('BTC'))) m.progress += quantity;
        if (m.target === 'legendary' && currentFish.rarity === 'legendary') m.progress += quantity;
    });

    document.getElementById('fishingResult').innerHTML = `✨ Mendapatkan ${currentFish.emoji} ${currentFish.name} (${currentFish.rarity})<br>💰 ${currentFish.value} coin (${currentFish.weight.toFixed(1)} kg) ✨`;

    // Level up sederhana
    if (inventory.length % 10 === 0) {
        playerLevel++;
        document.getElementById('fishingResult').innerHTML += '<br>🎉 LEVEL UP! 🎉';
    }

    coin += 2; // bonus kecil
    playSound('catch');
    showSplash();

    refreshUI();
    cancelFishingSequence();
}

function cancelFishingSequence() {
    // Bersihkan semua timer dan interval
    if (castingTimer) clearTimeout(castingTimer);
    if (approachTimer) clearTimeout(approachTimer);
    if (biteTimer) clearTimeout(biteTimer);
    if (struggleInterval) clearInterval(struggleInterval);

    const castBtn = document.getElementById('castButton');
    const reelBtn = document.getElementById('reelButton');
    const statusDiv = document.getElementById('fishingStatus');
    const strengthBarContainer = document.getElementById('strengthBarContainer');

    castBtn.disabled = false;
    castBtn.style.opacity = '1';
    reelBtn.style.display = 'none';
    strengthBarContainer.style.display = 'none';
    statusDiv.innerText = '';
    resetFishAnimation();

    isCasting = false;
    currentFish = null;
}

function cancelAllFishing() {
    cancelFishingSequence();
}

// ==================== UPGRADE ====================
function buyUpgrade(type) {
    if (type === 'rod' && rodLevel < 5 && coin >= rodLevel * 100) {
        coin -= rodLevel * 100;
        rodLevel++;
    } else if (type === 'bait' && baitLevel < 5 && coin >= 80 + (baitLevel-1)*30) {
        coin -= (80 + (baitLevel-1)*30);
        baitLevel++;
    } else if (type === 'net' && netLevel < 5 && coin >= 120 + (netLevel-1)*40) {
        coin -= (120 + (netLevel-1)*40);
        netLevel++;
    } else {
        alert('Coin tidak cukup atau sudah max level');
    }
    refreshUI();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    refreshUI();

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            cancelAllFishing();
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const viewName = btn.dataset.view;
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
            if (viewName === 'fishing') document.querySelector('.fishing-view').classList.add('active-view');
            if (viewName === 'aquarium') document.querySelector('.aquarium-view').classList.add('active-view');
            if (viewName === 'market') document.querySelector('.market-view').classList.add('active-view');
            if (viewName === 'missions') { document.querySelector('.missions-view').classList.add('active-view'); renderMissions(); }
            if (viewName === 'pets') { document.querySelector('.pets-view').classList.add('active-view'); renderPets(); }
            if (viewName === 'settings') document.querySelector('.settings-view').classList.add('active-view');
        });
    });

    document.getElementById('castButton').addEventListener('click', startFishing);
    document.getElementById('reelButton').addEventListener('click', reelFish);

    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.upgrade;
            buyUpgrade(type);
        });
    });

    document.getElementById('toggleSound').addEventListener('click', (e) => {
        sound = !sound;
        e.target.innerText = sound ? 'On' : 'Off';
    });
    document.getElementById('toggleMusic').addEventListener('click', (e) => {
        music = !music;
        e.target.innerText = music ? 'On' : 'Off';
    });
    document.getElementById('resetProgress').addEventListener('click', () => {
        if (confirm('Reset semua progress?')) {
            cancelAllFishing();
            coin = 250; gem = 5; playerLevel = 7; inventory = []; ownedPets = ['Lucky Koi']; equippedPet = 'Lucky Koi';
            rodLevel = 1; baitLevel = 1; netLevel = 1;
            missions.forEach(m => { m.progress = 0; m.completed = false; });
            refreshUI();
            document.getElementById('fishingResult').innerHTML = '';
        }
    });

    document.getElementById('equipPetBtn').addEventListener('click', () => {
        const select = document.getElementById('equipPetSelect');
        const pet = select.value;
        if (pet === 'none') equippedPet = null;
        else equippedPet = pet;
        refreshUI();
    });
});