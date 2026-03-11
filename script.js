// script.js - dengan animasi dan UI baru

// ==================== DATA IKAN (sama seperti sebelumnya) ====================
const FISH_DB = { /* ... */ }; // (isi dari kode sebelumnya, tidak diubah)
const BASE_RATES = { /* ... */ };
const ROD_BONUS = { /* ... */ };
const PET_BONUS = { /* ... */ };
const MAP_BONUS = { /* ... */ };
const ROD_STRENGTH = { 1:5, 2:15, 3:30, 4:60, 5:200 };

// ==================== STATE GAME ====================
let coin = 250;
let gem = 5;
let playerLevel = 7;
let inventory = [];
let ownedPets = ['Lucky Koi'];
let equippedPet = 'Lucky Koi';
let rodLevel = 1;
let baitLevel = 1;
let netLevel = 1;
let missions = [ /* ... */ ];
let sound = true;
let music = true;

// Variabel memancing
let castingTimer = null, approachTimer = null, biteTimer = null, struggleInterval = null;
let isCasting = false;
let currentMapForFishing = 'Crypto Sea';
let currentFish = null;
let currentFishWeight = 0;
let struggleProgress = 50;

// ==================== FUNGSI BANTU ====================
function getRodName() { /* ... */ }
function getRodMaxWeight() { return ROD_STRENGTH[rodLevel] || 5; }
function calculateFinalChances(mapName) { /* ... */ }
function getRandomFishByChances(chances) { /* ... */ }
function generateWeight(fish) { return fish.weightMin + Math.random() * (fish.weightMax - fish.weightMin); }
function calculatePrice(fish, weight) { return Math.floor(fish.basePrice * weight); }

function refreshUI() {
    document.getElementById('coinAmount').innerText = coin;
    document.getElementById('gemAmount').innerText = gem;
    document.getElementById('playerLevel').innerText = playerLevel;
    document.getElementById('rodLevel').innerText = rodLevel;
    document.getElementById('baitLevel').innerText = baitLevel;
    document.getElementById('netLevel').innerText = netLevel;
    // Update tampilan lainnya jika perlu
}

// ==================== ANIMASI ====================
function showSplash() {
    const splash = document.getElementById('splash');
    splash.style.opacity = '1';
    splash.style.animation = 'none';
    splash.offsetHeight;
    splash.style.animation = 'splash 0.3s ease-out';
    setTimeout(() => splash.style.opacity = '0', 300);

    const ripple = document.getElementById('ripple');
    ripple.style.opacity = '1';
    ripple.style.animation = 'none';
    ripple.offsetHeight;
    ripple.style.animation = 'rippleEffect 1s ease-out';
    setTimeout(() => ripple.style.opacity = '0', 1000);
}

function setFishingLineDepth(depthPercent) {
    // depthPercent 0-100 (0 di atas, 100 di bawah air)
    const line = document.getElementById('fishingLine');
    const hook = document.getElementById('fishingHook');
    const areaHeight = document.querySelector('.water-scene').clientHeight;
    const lineHeight = (depthPercent / 100) * areaHeight * 0.6; // maks 60% area
    line.style.height = lineHeight + 'px';
    hook.style.top = (20 + lineHeight) + 'px';
}

function moveFish(leftPercent) {
    const fish = document.getElementById('fishAnimation');
    fish.style.left = leftPercent + '%';
}

function resetFish() {
    moveFish(-20);
}

// ==================== LOGIKA MEMANCING ====================
function startFishing() {
    if (isCasting) return;
    cancelAllFishing();

    currentMapForFishing = document.getElementById('mapSelect').value;

    // Animasi pancing turun
    setFishingLineDepth(80); // turun ke dalam air
    playSound('cast');
    showSplash();

    document.getElementById('fishingStatus').innerText = '🎣 Kail dilempar...';
    document.getElementById('castButton').disabled = true;
    document.getElementById('castButton').style.opacity = '0.5';
    document.getElementById('reelButton').style.display = 'none';
    document.getElementById('strengthBarContainer').style.display = 'none';
    document.getElementById('fishingResult').innerHTML = '';

    isCasting = true;

    // Tahap 1: ikan mulai berenang (setelah 1 detik)
    castingTimer = setTimeout(() => {
        document.getElementById('fishingStatus').innerText = '🐟 Ikan mendekat...';
        // Animasi ikan berenang dari kiri ke kanan
        moveFish(20);
        setTimeout(() => moveFish(40), 500);
        setTimeout(() => moveFish(60), 1000);
        approachFish();
    }, 1000);
}

function approachFish() {
    // Kemungkinan ikan menggigit atau lewat
    const willBite = Math.random() < 0.7; // 70% menggigit

    approachTimer = setTimeout(() => {
        if (willBite) {
            fishBite();
        } else {
            // Ikan lewat
            document.getElementById('fishingStatus').innerText = 'Ikan pergi...';
            playSound('fishPass');
            moveFish(80);
            setTimeout(() => {
                resetFish();
                // Coba lagi dengan ikan lain
                if (Math.random() < 0.5) {
                    document.getElementById('fishingStatus').innerText = 'Ikan lain datang...';
                    moveFish(20);
                    approachFish();
                } else {
                    document.getElementById('fishingStatus').innerText = 'Sepi... coba lagi.';
                    cancelFishingSequence();
                }
            }, 1500);
        }
    }, 2000);
}

function fishBite() {
    // Dapatkan ikan berdasarkan chances
    const chances = calculateFinalChances(currentMapForFishing);
    const fishTemplate = getRandomFishByChances(chances);
    const weight = generateWeight(fishTemplate);
    const price = calculatePrice(fishTemplate, weight);

    currentFish = { ...fishTemplate, weight, value: price };

    document.getElementById('fishingStatus').innerHTML = `❗ ${currentFish.emoji} ${currentFish.name} menggigit! Tarik!`;
    playSound('bite');
    showSplash();

    // Tampilkan tombol tarik dan bar kekuatan
    document.getElementById('reelButton').style.display = 'block';
    document.getElementById('strengthBarContainer').style.display = 'block';
    struggleProgress = 50;
    document.getElementById('strengthBarFill').style.width = '50%';

    // Animasi ikan menggigit (sedikit getar)
    moveFish(50); // di tengah

    // Mulai struggle
    startStruggle();
}

function startStruggle() {
    const maxWeight = getRodMaxWeight();
    if (currentFish.weight > maxWeight) {
        document.getElementById('fishingStatus').innerText = '💔 Pancing tidak kuat! Ikan kabur!';
        playSound('lineBreak');
        cancelFishingSequence();
        return;
    }

    struggleInterval = setInterval(() => {
        struggleProgress -= Math.random() * 8 + 2;
        if (struggleProgress < 0) struggleProgress = 0;
        document.getElementById('strengthBarFill').style.width = struggleProgress + '%';

        if (struggleProgress <= 0) {
            clearInterval(struggleInterval);
            document.getElementById('fishingStatus').innerText = '💨 Ikan kabur!';
            playSound('escape');
            cancelFishingSequence();
        }

        // Efek shake jika ikan besar
        if (currentFish.weight > 20) {
            document.querySelector('.water-scene').style.animation = 'shake 0.1s infinite';
            setTimeout(() => {
                document.querySelector('.water-scene').style.animation = '';
            }, 300);
        }
    }, 300);
}

function reelFish() {
    if (!isCasting || !currentFish) return;

    struggleProgress += Math.random() * 15 + 5;
    if (struggleProgress > 100) struggleProgress = 100;
    document.getElementById('strengthBarFill').style.width = struggleProgress + '%';
    playSound('reel');

    // Animasi pancing naik sedikit
    setFishingLineDepth(70); // naik sedikit

    if (struggleProgress >= 100) {
        clearInterval(struggleInterval);
        catchFish();
    }
}

function catchFish() {
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

    document.getElementById('fishingResult').innerHTML = `✨ Dapat ${currentFish.emoji} ${currentFish.name}<br>💰 ${currentFish.value} (${currentFish.weight.toFixed(1)} kg) ✨`;

    if (inventory.length % 10 === 0) {
        playerLevel++;
        document.getElementById('fishingResult').innerHTML += '<br>🎉 LEVEL UP!';
    }

    coin += 2;
    playSound('catch');
    showSplash();

    // Animasi ikan terangkat
    setFishingLineDepth(20); // naik ke atas
    moveFish(50);
    setTimeout(() => {
        resetFish();
        setFishingLineDepth(0);
    }, 500);

    refreshUI();
    cancelFishingSequence();
}

function cancelFishingSequence() {
    if (castingTimer) clearTimeout(castingTimer);
    if (approachTimer) clearTimeout(approachTimer);
    if (biteTimer) clearTimeout(biteTimer);
    if (struggleInterval) clearInterval(struggleInterval);

    document.getElementById('castButton').disabled = false;
    document.getElementById('castButton').style.opacity = '1';
    document.getElementById('reelButton').style.display = 'none';
    document.getElementById('strengthBarContainer').style.display = 'none';
    document.getElementById('fishingStatus').innerText = '';

    setFishingLineDepth(0);
    resetFish();

    isCasting = false;
    currentFish = null;
}

function cancelAllFishing() {
    cancelFishingSequence();
}

// ==================== SOUND ====================
function playSound(effect) {
    if (!sound) return;
    console.log(`🔊 ${effect}`);
    // Implementasi audio bisa ditambahkan di sini
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

// ==================== VIEW HANDLER ====================
function showView(viewName) {
    const container = document.getElementById('viewContainer');
    const title = document.getElementById('viewTitle');
    const content = document.getElementById('viewContent');
    container.classList.remove('hidden');

    if (viewName === 'aquarium') {
        title.innerText = '🐠 Aquarium';
        renderInventoryInView();
    } else if (viewName === 'market') {
        title.innerText = '💱 Market';
        renderMarketInView();
    } else if (viewName === 'missions') {
        title.innerText = '🎯 Missions';
        renderMissionsInView();
    } else if (viewName === 'pets') {
        title.innerText = '🐟 Pets';
        renderPetsInView();
    } else if (viewName === 'settings') {
        title.innerText = '⚙️ Settings';
        renderSettingsInView();
    }
}

function renderInventoryInView() {
    let html = '<div class="inventory-grid">';
    inventory.forEach((fish, idx) => {
        html += `<div class="fish-card rarity-${fish.rarity}">${fish.emoji} ${fish.name}<br>💰${fish.value} (${fish.weight.toFixed(1)} kg)</div>`;
    });
    html += '</div>';
    document.getElementById('viewContent').innerHTML = html || '<p>Kosong</p>';
}

function renderMarketInView() {
    let html = '<div class="inventory-grid">';
    inventory.forEach((fish, idx) => {
        html += `<div class="fish-card rarity-${fish.rarity}" data-index="${idx}">${fish.emoji} ${fish.name}<br>Jual 💰${Math.floor(fish.value*0.7)}</div>`;
    });
    html += '</div>';
    document.getElementById('viewContent').innerHTML = html || '<p>Kosong</p>';
    // Tambah event listener jual
    document.querySelectorAll('#viewContent .fish-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const index = card.dataset.index;
            if (inventory[index]) {
                coin += Math.floor(inventory[index].value * 0.7);
                inventory.splice(index, 1);
                refreshUI();
                renderMarketInView();
                playSound('splash');
            }
        });
    });
}

function renderMissionsInView() {
    let html = '<div class="mission-list">';
    missions.forEach(m => {
        if (m.completed) {
            html += `<div class="mission-item">✅ ${m.desc} (Selesai)</div>`;
        } else {
            html += `<div class="mission-item">
                <span>${m.desc} [${m.progress}/${m.required}]</span>
                <button class="claim-mission" data-id="${m.id}">💰 ${m.reward}</button>
            </div>`;
        }
    });
    html += '</div>';
    document.getElementById('viewContent').innerHTML = html;
    document.querySelectorAll('.claim-mission').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const mission = missions.find(m => m.id === id);
            if (mission && mission.progress >= mission.required && !mission.completed) {
                coin += mission.reward;
                mission.completed = true;
                gem += 1;
                refreshUI();
                renderMissionsInView();
                playSound('splash');
            } else {
                alert('Belum selesai');
            }
        });
    });
}

function renderPetsInView() {
    let html = '<div class="pets-grid">';
    ownedPets.forEach(pet => {
        html += `<div class="fish-card rarity-legendary">🐟 ${pet}</div>`;
    });
    html += '</div><select id="equipPetSelect">';
    html += '<option value="none">None</option>';
    ownedPets.forEach(pet => {
        html += `<option value="${pet}" ${equippedPet === pet ? 'selected' : ''}>${pet}</option>`;
    });
    html += '</select><button id="equipPetBtn">Equip</button>';
    document.getElementById('viewContent').innerHTML = html;
    document.getElementById('equipPetBtn').addEventListener('click', () => {
        const select = document.getElementById('equipPetSelect');
        equippedPet = select.value === 'none' ? null : select.value;
        refreshUI();
    });
}

function renderSettingsInView() {
    document.getElementById('viewContent').innerHTML = `
        <div class="setting-item">
            <span>🔊 Sound</span>
            <button id="toggleSound">${sound ? 'On' : 'Off'}</button>
        </div>
        <div class="setting-item">
            <span>🎵 Music</span>
            <button id="toggleMusic">${music ? 'On' : 'Off'}</button>
        </div>
        <div class="setting-item">
            <span>🔄 Reset Progress</span>
            <button id="resetProgress" class="danger-btn">Reset</button>
        </div>
    `;
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
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    refreshUI();

    document.getElementById('castButton').addEventListener('click', startFishing);
    document.getElementById('reelButton').addEventListener('click', reelFish);

    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = btn.dataset.view;
            showView(view);
        });
    });

    document.querySelectorAll('.upgrade-icon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.upgrade;
            buyUpgrade(type);
        });
    });

    document.querySelector('.close-view').addEventListener('click', () => {
        document.getElementById('viewContainer').classList.add('hidden');
    });

    // Tutup view jika klik di luar (opsional)
    window.addEventListener('click', (e) => {
        const container = document.getElementById('viewContainer');
        if (!container.contains(e.target) && !e.target.classList.contains('icon-btn')) {
            container.classList.add('hidden');
        }
    });
});