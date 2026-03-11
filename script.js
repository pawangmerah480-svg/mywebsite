// script.js - logika game lengkap dengan sistem memancing dua tahap

// ==================== DATA IKAN (ASSET) ====================
const FISH_DB = {
    common: [
        { name: 'Dogecoin (DOGE)', value: 10, rarity: 'common', emoji: '🐟' },
        { name: 'Shiba Inu (SHIB)', value: 12, rarity: 'common', emoji: '🐟' },
        { name: 'Cardano (ADA)', value: 15, rarity: 'common', emoji: '🐟' },
        { name: 'Polygon (MATIC)', value: 14, rarity: 'common', emoji: '🐟' },
        { name: 'USD/IDR', value: 8, rarity: 'common', emoji: '🐟' },
        { name: 'EUR/USD', value: 11, rarity: 'common', emoji: '🐟' },
        { name: 'BBRI', value: 9, rarity: 'common', emoji: '🐟' },
        { name: 'TLKM', value: 9, rarity: 'common', emoji: '🐟' }
    ],
    uncommon: [
        { name: 'Solana (SOL)', value: 28, rarity: 'uncommon', emoji: '🐠' },
        { name: 'Polkadot (DOT)', value: 26, rarity: 'uncommon', emoji: '🐠' },
        { name: 'Avalanche (AVAX)', value: 30, rarity: 'uncommon', emoji: '🐠' },
        { name: 'Chainlink (LINK)', value: 22, rarity: 'uncommon', emoji: '🐠' },
        { name: 'GBP/USD', value: 18, rarity: 'uncommon', emoji: '🐠' },
        { name: 'USD/JPY', value: 17, rarity: 'uncommon', emoji: '🐠' },
        { name: 'BBCA', value: 20, rarity: 'uncommon', emoji: '🐠' },
        { name: 'BMRI', value: 21, rarity: 'uncommon', emoji: '🐠' }
    ],
    rare: [
        { name: 'Binance Coin (BNB)', value: 45, rarity: 'rare', emoji: '🐡' },
        { name: 'Litecoin (LTC)', value: 42, rarity: 'rare', emoji: '🐡' },
        { name: 'Cosmos (ATOM)', value: 40, rarity: 'rare', emoji: '🐡' },
        { name: 'XRP', value: 38, rarity: 'rare', emoji: '🐡' },
        { name: 'AUD/USD', value: 32, rarity: 'rare', emoji: '🐡' },
        { name: 'USD/CHF', value: 33, rarity: 'rare', emoji: '🐡' },
        { name: 'ASII', value: 35, rarity: 'rare', emoji: '🐡' },
        { name: 'UNVR', value: 37, rarity: 'rare', emoji: '🐡' }
    ],
    epic: [
        { name: 'Ethereum (ETH)', value: 75, rarity: 'epic', emoji: '🐙' },
        { name: 'Ripple (XRP)', value: 68, rarity: 'epic', emoji: '🐙' },
        { name: 'EUR/JPY', value: 55, rarity: 'epic', emoji: '🐙' },
        { name: 'GBP/JPY', value: 58, rarity: 'epic', emoji: '🐙' },
        { name: 'INDF', value: 62, rarity: 'epic', emoji: '🐙' },
        { name: 'GGRM', value: 65, rarity: 'epic', emoji: '🐙' }
    ],
    legendary: [
        { name: 'Bitcoin (BTC)', value: 200, rarity: 'legendary', emoji: '🐋' },
        { name: 'ETH/BTC', value: 180, rarity: 'legendary', emoji: '🐋' },
        { name: 'USD/CAD', value: 95, rarity: 'legendary', emoji: '🐋' },
        { name: 'BBNI', value: 110, rarity: 'legendary', emoji: '🐋' }
    ],
    mythic: [
        { name: 'Satoshi Coin', value: 500, rarity: 'mythic', emoji: '🐉' },
        { name: 'Quantum Bitcoin', value: 550, rarity: 'mythic', emoji: '🐉' },
        { name: 'Global Market Whale', value: 600, rarity: 'mythic', emoji: '🐉' },
        { name: 'IDX Dragon Asset', value: 480, rarity: 'mythic', emoji: '🐉' }
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

// ==================== STATE GAME ====================
let coin = 250;
let gem = 5;
let playerLevel = 7; // mulai level 7 (dapat rare bonus)
let inventory = []; // { name, rarity, value, emoji }
let ownedPets = ['Lucky Koi']; // punya 1 pet awal
let equippedPet = 'Lucky Koi';
let rodLevel = 1; // 1:Basic, 2:Trader, 3:Sultan, 4:Whale, 5:God
let baitLevel = 1;
let netLevel = 1;
let missions = [
    { id:1, desc:'Tangkap 3 Dogecoin', target:'Dogecoin (DOGE)', required:3, progress:0, reward:50, completed:false },
    { id:2, desc:'Tangkap 2 Forex pair', target:'Forex', required:2, progress:0, reward:80, completed:false },
    { id:3, desc:'Tangkap 1 Legendary', target:'legendary', required:1, progress:0, reward:200, completed:false }
];
let sound = true;
let music = true;

// Variabel untuk sistem memancing dua tahap
let castingTimer = null;
let isCasting = false;
let currentMapForFishing = 'Crypto Sea'; // menyimpan map saat casting

// ==================== HELPER FUNCTIONS ====================
function getRodName() {
    const rods = ['Basic Rod', 'Trader Rod', 'Sultan Rod', 'Whale Rod', 'God Rod'];
    return rods[rodLevel-1] || 'Basic Rod';
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

// update tampilan resource
function refreshUI() {
    document.getElementById('coinAmount').innerText = coin;
    document.getElementById('gemAmount').innerText = gem;
    document.getElementById('playerLevel').innerText = playerLevel;
    document.getElementById('currentRod').innerText = `${getRodName()}`;
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
        html += `<div class="fish-card rarity-${fish.rarity}" data-index="${idx}">${fish.emoji} ${fish.name}<br>💰${fish.value}</div>`;
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
        playSplash();
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
        playSplash();
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

// ==================== FISHING CORE DUA TAHAP ====================
function startFishing() {
    if (isCasting) return; // sedang dalam proses casting

    // Simpan map yang dipilih saat casting dimulai
    currentMapForFishing = document.getElementById('mapSelect').value;

    // Nonaktifkan tombol pancing dan sembunyikan (atau ubah tampilan)
    const castBtn = document.getElementById('castButton');
    const reelBtn = document.getElementById('reelButton');
    const statusDiv = document.getElementById('fishingStatus');

    castBtn.disabled = true;
    castBtn.style.opacity = '0.5';
    reelBtn.style.display = 'none'; // pastikan tombol tarik tersembunyi
    statusDiv.innerText = '🎣 Kail dilempar... menunggu ikan...';
    
    isCasting = true;

    // Timer acak 2-5 detik (2000-5000 ms)
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2000-5000
    castingTimer = setTimeout(() => {
        // Ikan menggigit
        statusDiv.innerText = '❗ Ikan menggigit! Tekan TARIK sekarang! ❗';
        reelBtn.style.display = 'block'; // tampilkan tombol tarik
        castBtn.disabled = true; // tetap nonaktif
        // Tidak perlu mengubah isCasting, masih dalam status menunggu tarikan
    }, delay);
}

function reelFish() {
    if (!isCasting) return; // tidak dalam proses memancing

    // Hentikan timer jika masih berjalan (misal pengguna langsung menarik sebelum timer habis? tidak mungkin karena tombol reel baru muncul setelah timer)
    if (castingTimer) {
        clearTimeout(castingTimer);
        castingTimer = null;
    }

    const castBtn = document.getElementById('castButton');
    const reelBtn = document.getElementById('reelButton');
    const statusDiv = document.getElementById('fishingStatus');
    const resultDiv = document.getElementById('fishingResult');

    // Sembunyikan tombol tarik, aktifkan tombol pancing
    reelBtn.style.display = 'none';
    castBtn.disabled = false;
    castBtn.style.opacity = '1';
    statusDiv.innerText = ''; // bersihkan status

    // Dapatkan ikan berdasarkan map yang disimpan saat casting
    const chances = calculateFinalChances(currentMapForFishing);
    const fishCaught = getRandomFishByChances(chances);

    // Tambah ke inventory dengan bonus net level
    let quantity = 1 + (netLevel > 3 ? 1 : 0);
    for (let i = 0; i < quantity; i++) {
        inventory.push({ 
            name: fishCaught.name, 
            rarity: fishCaught.rarity, 
            value: fishCaught.value, 
            emoji: fishCaught.emoji 
        });
    }

    // Update progress mission
    missions.forEach(m => {
        if (m.completed) return;
        if (m.target === 'Dogecoin (DOGE)' && fishCaught.name.includes('Dogecoin')) m.progress += quantity;
        if (m.target === 'Forex' && (fishCaught.name.includes('/') && !fishCaught.name.includes('BTC'))) m.progress += quantity;
        if (m.target === 'legendary' && fishCaught.rarity === 'legendary') m.progress += quantity;
    });

    // Tampilkan hasil
    resultDiv.innerHTML = `✨ Mendapatkan ${fishCaught.emoji} ${fishCaught.name} (${fishCaught.rarity}) ✨<br>💰 Value: ${fishCaught.value}`;

    // Bonus experience dan coin
    if (inventory.length % 10 === 0) {
        playerLevel++;
        resultDiv.innerHTML += '<br>🎉 LEVEL UP! 🎉';
    }
    coin += 2;

    refreshUI();
    playSplash();

    // Reset status casting
    isCasting = false;
}

// Fungsi untuk membatalkan casting jika pindah view (opsional, agar tidak bocor)
function cancelCasting() {
    if (castingTimer) {
        clearTimeout(castingTimer);
        castingTimer = null;
    }
    if (isCasting) {
        const castBtn = document.getElementById('castButton');
        const reelBtn = document.getElementById('reelButton');
        const statusDiv = document.getElementById('fishingStatus');
        castBtn.disabled = false;
        castBtn.style.opacity = '1';
        reelBtn.style.display = 'none';
        statusDiv.innerText = '';
        isCasting = false;
    }
}

function playSplash() {
    if (sound) {
        console.log('💦 SPLASH!');
        // Bisa ditambahkan efek audio jika diinginkan
    }
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
            // Batalkan proses memancing jika sedang casting (agar tidak ganggu)
            cancelCasting();

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

    // Tombol Pancing (CAST)
    document.getElementById('castButton').addEventListener('click', startFishing);

    // Tombol Tarik (REEL)
    document.getElementById('reelButton').addEventListener('click', reelFish);

    // Upgrade buttons
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.upgrade;
            buyUpgrade(type);
        });
    });

    // Settings
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
            cancelCasting(); // batalkan memancing jika sedang proses
            coin = 250; gem = 5; playerLevel = 7; inventory = []; ownedPets = ['Lucky Koi']; equippedPet = 'Lucky Koi';
            rodLevel = 1; baitLevel = 1; netLevel = 1;
            missions.forEach(m => { m.progress = 0; m.completed = false; });
            refreshUI();
            document.getElementById('fishingResult').innerHTML = ''; // bersihkan hasil
        }
    });

    // Equip pet
    document.getElementById('equipPetBtn').addEventListener('click', () => {
        const select = document.getElementById('equipPetSelect');
        const pet = select.value;
        if (pet === 'none') equippedPet = null;
        else equippedPet = pet;
        refreshUI();
    });
});