// ==================== GLOBAL VARIABLES ====================
let currentAudio = null;
let currentAyatIndex = 0;
let currentSurahAyatList = [];
let repeatMode = "none"; // 'none', 'one'
let repeatSurah = false;
let prayerInterval = null;
let allSurahData = [];
let currentSurahId = null;

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", async () => {
  // Load external modules (didefinisikan di file terpisah)
  if (typeof initAnimatedBackground === 'function') initAnimatedBackground();
  if (typeof initThemeSelector === 'function') initThemeSelector();
  if (typeof initFocusMode === 'function') initFocusMode();
  
  // Core features
  initTheme();
  initNavbarSidebar();
  await loadStats();
  await loadSurahList();
  initSearchRealtime();
  initFilters();
  initLastReadSystem();
  initTasbih();
  initPrayerTimes();
  initHijriDate();
  initStartReading();
  initFloatingPlayerControls();
  
  // PWA Install prompt
  initPWAInstall();
});

// ==================== THEME SYSTEM ====================
function initTheme() {
  const theme = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("light", theme === "light");
  document.querySelectorAll("#themeToggle").forEach(btn => {
    if (btn) btn.addEventListener("click", () => {
      document.body.classList.toggle("light");
      localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
    });
  });
}

// ==================== NAVBAR & SIDEBAR ====================
function initNavbarSidebar() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (menuToggle) {
    menuToggle.onclick = () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    };
    const closeSidebar = document.getElementById("closeSidebar");
    if (closeSidebar) closeSidebar.onclick = () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    };
    if (overlay) overlay.onclick = () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    };
  }
  
  // Search toggle
  const searchToggle = document.getElementById("searchToggle");
  const searchBar = document.getElementById("searchBar");
  if (searchToggle) {
    searchToggle.onclick = () => searchBar.classList.toggle("active");
    const clearSearch = document.getElementById("clearSearch");
    if (clearSearch) clearSearch.addEventListener("click", () => {
      document.getElementById("searchInput").value = "";
      document.getElementById("searchResults").innerHTML = "";
    });
  }
  
  // Scroll effect navbar
  window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
}

// ==================== STATISTICS COUNTER ====================
async function loadStats() {
  const surah = await fetchAllSurah();
  const totalAyat = surah.reduce((sum, s) => sum + s.numberOfVerses, 0);
  animateNumber("totalSurah", surah.length);
  animateNumber("totalAyat", totalAyat);
  animateNumber("totalJuz", 30);
}

function animateNumber(id, target) {
  let current = 0;
  const el = document.getElementById(id);
  if (!el) return;
  const increment = target / 50;
  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.innerText = target;
      clearInterval(interval);
    } else {
      el.innerText = Math.floor(current);
    }
  }, 20);
}

// ==================== SURAH LIST ====================
async function loadSurahList(filter = "all", search = "") {
  const grid = document.getElementById("surahGrid");
  if (!grid) return;
  grid.innerHTML = '<div class="skeleton-loader"></div>';
  let list = await fetchAllSurah();
  allSurahData = list;
  if (filter !== "all") list = list.filter(s => s.revelation.id === filter);
  if (search) list = list.filter(s => s.name.transliteration.id.toLowerCase().includes(search) || s.name.translation.id.toLowerCase().includes(search) || s.number.toString() === search);
  
  grid.innerHTML = "";
  list.forEach(surah => {
    const card = document.createElement("div");
    card.className = "surah-card glass fade-up";
    card.innerHTML = `
      <div class="surah-number">${surah.number}. ${surah.revelation.text}</div>
      <div class="surah-name-ar">${surah.name.short}</div>
      <div class="surah-name-latin">${surah.name.transliteration.id}</div>
      <div class="surah-footer">
        <span>${surah.name.translation.id}</span>
        <span><i class="fas fa-verse"></i> ${surah.numberOfVerses} Ayat</span>
      </div>
    `;
    card.onclick = () => {
      window.location.href = `surah.html?surah=${surah.number}`;
    };
    grid.appendChild(card);
  });
}

function initFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const searchVal = document.getElementById("searchInput")?.value || "";
      loadSurahList(btn.dataset.filter, searchVal);
    });
  });
}

// ==================== SEARCH REALTIME PREMIUM ====================
function initSearchRealtime() {
  const input = document.getElementById("searchInput");
  const resultsDiv = document.getElementById("searchResults");
  if (!input) return;
  
  input.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      resultsDiv.innerHTML = "";
      return;
    }
    const surahs = await fetchAllSurah();
    const filtered = surahs.filter(s => 
      s.name.transliteration.id.toLowerCase().includes(query) ||
      s.name.translation.id.toLowerCase().includes(query) ||
      s.number.toString() === query
    ).slice(0, 8);
    
    if (filtered.length === 0) {
      resultsDiv.innerHTML = '<div class="search-result-item">Tidak ditemukan</div>';
      return;
    }
    
    resultsDiv.innerHTML = filtered.map(s => `
      <div class="search-result-item glass" data-surah="${s.number}">
        <strong>${s.number}. ${s.name.transliteration.id}</strong> - ${s.name.translation.id}
      </div>
    `).join("");
    
    document.querySelectorAll(".search-result-item").forEach(el => {
      el.onclick = () => {
        window.location.href = `surah.html?surah=${el.dataset.surah}`;
      };
    });
  });
}

// ==================== LAST READ SYSTEM ====================
function initLastReadSystem() {
  const lastRead = JSON.parse(localStorage.getItem("last_read"));
  const section = document.getElementById("lastReadSection");
  if (lastRead && lastRead.surah && lastRead.ayat) {
    section.style.display = "block";
    document.getElementById("lastReadInfo").innerHTML = `${lastRead.surahName || `Surah ${lastRead.surah}`}, Ayat ${lastRead.ayat}`;
    document.getElementById("continueReadingBtn").onclick = () => {
      window.location.href = `surah.html?surah=${lastRead.surah}#ayat-${lastRead.ayat}`;
    };
    document.getElementById("closeLastRead").onclick = () => section.style.display = "none";
  }
  
  const lastReadBtn = document.getElementById("lastReadBtn");
  if (lastReadBtn) {
    lastReadBtn.onclick = () => {
      const last = JSON.parse(localStorage.getItem("last_read"));
      if (last) window.location.href = `surah.html?surah=${last.surah}#ayat-${last.ayat}`;
      else showNotification("Belum ada riwayat bacaan");
    };
  }
}

function saveLastRead(surahId, ayatNum, surahName) {
  localStorage.setItem("last_read", JSON.stringify({ surah: surahId, ayat: ayatNum, surahName, date: Date.now() }));
}

// ==================== PRAYER TIMES REALTIME ====================
async function getPrayerTimes(lat, lon) {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lon}&method=2`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 200) {
      const timings = data.data.timings;
      document.getElementById("subuh").innerText = timings.Fajr;
      document.getElementById("dzuhur").innerText = timings.Dhuhr;
      document.getElementById("ashar").innerText = timings.Asr;
      document.getElementById("maghrib").innerText = timings.Maghrib;
      document.getElementById("isya").innerText = timings.Isha;
      startCountdown(timings);
    }
  } catch (error) {
    console.error("Gagal mengambil jadwal sholat");
  }
}

function getUserLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        getPrayerTimes(lat, lon);
        reverseGeocode(lat, lon);
      },
      () => {
        getPrayerTimes(-6.200000, 106.816666);
        document.getElementById("cityName").innerText = "Jakarta (Default)";
      }
    );
  } else {
    getPrayerTimes(-6.200000, 106.816666);
    document.getElementById("cityName").innerText = "Jakarta (Default)";
  }
}

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.village || "Lokasi Anda";
    document.getElementById("cityName").innerText = city;
    const prayerShort = document.getElementById("prayerShort");
    if (prayerShort) prayerShort.innerHTML = `📍 ${city}`;
  } catch (e) {
    document.getElementById("cityName").innerText = "Lokasi Anda";
  }
}

function startCountdown(timings) {
  if (prayerInterval) clearInterval(prayerInterval);
  const prayerOrder = [
    { name: "Subuh", time: timings.Fajr },
    { name: "Dzuhur", time: timings.Dhuhr },
    { name: "Ashar", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isya", time: timings.Isha }
  ];
  
  prayerInterval = setInterval(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    let nextPrayer = null;
    for (let p of prayerOrder) {
      if (currentTime < p.time) {
        nextPrayer = p;
        break;
      }
    }
    if (!nextPrayer) nextPrayer = prayerOrder[0];
    document.getElementById("nextPrayerName").innerText = nextPrayer.name;
    
    const target = new Date();
    const [hours, minutes] = nextPrayer.time.split(':');
    target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    if (currentTime > nextPrayer.time) target.setDate(target.getDate() + 1);
    
    const diff = target - now;
    if (diff <= 0) {
      document.getElementById("countdownTimer").innerText = "00:00:00";
      return;
    }
    const hoursLeft = Math.floor(diff / 3600000);
    const minsLeft = Math.floor((diff % 3600000) / 60000);
    const secsLeft = Math.floor((diff % 60000) / 1000);
    document.getElementById("countdownTimer").innerHTML = `${hoursLeft.toString().padStart(2,'0')}:${minsLeft.toString().padStart(2,'0')}:${secsLeft.toString().padStart(2,'0')}`;
  }, 1000);
}

function initPrayerTimes() {
  getUserLocation();
}

// ==================== HIJRI DATE ====================
async function initHijriDate() {
  const hijriEl = document.getElementById("hijriDate");
  if (!hijriEl) return;
  try {
    const res = await fetch("https://api.aladhan.com/v1/gToH?date=" + new Date().toISOString().split('T')[0]);
    const data = await res.json();
    hijriEl.innerText = `${data.data.hijri.day} ${data.data.hijri.month.en} ${data.data.hijri.year}`;
  } catch (e) {
    hijriEl.innerText = "Kalender Hijriyah";
  }
}

// ==================== TASBIH DIGITAL ====================
function initTasbih() {
  const modal = document.getElementById("tasbihModal");
  const openBtn = document.getElementById("tasbihBtn");
  const closeBtn = modal?.querySelector(".close-modal");
  let count = 0;
  
  if (openBtn) openBtn.onclick = () => modal.style.display = "flex";
  if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
  
  const addBtn = document.getElementById("addTasbih");
  const resetBtn = document.getElementById("resetTasbih");
  const countSpan = document.getElementById("tasbihCount");
  
  if (addBtn) addBtn.onclick = () => {
    count++;
    countSpan.innerText = count;
  };
  if (resetBtn) resetBtn.onclick = () => {
    count = 0;
    countSpan.innerText = count;
  };
}

// ==================== START READING BUTTON ====================
function initStartReading() {
  const startBtn = document.getElementById("startReadingBtn");
  if (startBtn) {
    startBtn.onclick = () => {
      window.location.href = "surah.html?surah=1";
    };
  }
}

// ==================== FLOATING AUDIO PLAYER ====================
function initAudioPlayer(ayatList, surahName) {
  currentSurahAyatList = ayatList;
  const player = document.getElementById("floatingPlayer");
  player.style.display = "block";
  
  const playBtn = document.getElementById("playPauseBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const repeatOneBtn = document.getElementById("repeatBtn");
  const repeatSurahBtn = document.getElementById("repeatSurahBtn");
  const progressFill = document.getElementById("progressBarFill");
  const currentTimeSpan = document.getElementById("currentTime");
  const durationSpan = document.getElementById("duration");
  const closeBtn = document.getElementById("closePlayerBtn");
  
  function loadAudio(index) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    const ayat = currentSurahAyatList[index];
    if (!ayat || !ayat.audio) return;
    currentAudio = new Audio(ayat.audio);
    currentAudio.addEventListener("timeupdate", () => {
      const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
      progressFill.style.width = `${percent}%`;
      currentTimeSpan.innerText = formatTime(currentAudio.currentTime);
    });
    currentAudio.addEventListener("loadedmetadata", () => {
      durationSpan.innerText = formatTime(currentAudio.duration);
    });
    currentAudio.addEventListener("ended", () => {
      if (repeatMode === "one") {
        playAyatAtIndex(currentAyatIndex);
      } else if (repeatSurah) {
        if (currentAyatIndex + 1 < currentSurahAyatList.length) playAyatAtIndex(currentAyatIndex + 1);
        else playAyatAtIndex(0);
      } else {
        if (currentAyatIndex + 1 < currentSurahAyatList.length) playAyatAtIndex(currentAyatIndex + 1);
      }
    });
    currentAudio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    document.getElementById("playerSurahName").innerText = surahName;
    document.getElementById("playerAyatNumber").innerText = `Ayat ${ayat.nomorAyat}`;
    // Activate equalizer
    const eq = document.getElementById("equalizer");
    if (eq) eq.style.opacity = "1";
  }
  
  function playAyatAtIndex(index) {
    currentAyatIndex = index;
    loadAudio(index);
  }
  
  playBtn.onclick = () => {
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else if (currentAudio && currentAudio.paused) {
      currentAudio.play();
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else if (currentSurahAyatList.length) {
      playAyatAtIndex(0);
    }
  };
  
  prevBtn.onclick = () => {
    if (currentAyatIndex > 0) playAyatAtIndex(currentAyatIndex - 1);
  };
  nextBtn.onclick = () => {
    if (currentAyatIndex + 1 < currentSurahAyatList.length) playAyatAtIndex(currentAyatIndex + 1);
  };
  repeatOneBtn.onclick = () => {
    repeatMode = repeatMode === "one" ? "none" : "one";
    repeatOneBtn.style.color = repeatMode === "one" ? "var(--emerald)" : "";
    showNotification(repeatMode === "one" ? "Repeat satu ayat aktif" : "Repeat satu ayat nonaktif");
  };
  repeatSurahBtn.onclick = () => {
    repeatSurah = !repeatSurah;
    repeatSurahBtn.style.color = repeatSurah ? "var(--emerald)" : "";
    showNotification(repeatSurah ? "Repeat seluruh surah aktif" : "Repeat seluruh surah nonaktif");
  };
  closeBtn.onclick = () => {
    if (currentAudio) currentAudio.pause();
    player.style.display = "none";
    currentAudio = null;
  };
}

function formatTime(secs) {
  if (isNaN(secs)) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function initFloatingPlayerControls() {
  // Dummy, actual controls bound in initAudioPlayer
}

// ==================== BOOKMARK SYSTEM ====================
function saveBookmark(surahId, ayatNum, arabText, translation, surahName) {
  let bookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
  const exists = bookmarks.find(b => b.surah == surahId && b.ayat == ayatNum);
  if (!exists) {
    bookmarks.push({ surah: surahId, ayat: ayatNum, arab: arabText, translation, surahName, date: Date.now() });
    localStorage.setItem("quran_bookmarks", JSON.stringify(bookmarks));
    showNotification("✅ Ayat ditambahkan ke bookmark!");
  } else {
    showNotification("⚠️ Sudah ada di bookmark");
  }
}

function showNotification(msg) {
  let notif = document.createElement("div");
  notif.className = "notification";
  notif.innerText = msg;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

// ==================== PWA INSTALL PROMPT ====================
function initPWAInstall() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBanner = document.createElement('div');
    installBanner.className = 'install-banner glass';
    installBanner.innerHTML = `<span>📱 Install Aplikasi</span><button id="installBtn">Install</button>`;
    document.body.appendChild(installBanner);
    document.getElementById('installBtn').onclick = () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => installBanner.remove());
    };
  });
}

// ==================== EXPORT FUNCTIONS FOR OTHER PAGES ====================
window.saveLastRead = saveLastRead;
window.saveBookmark = saveBookmark;
window.showNotification = showNotification;
window.initAudioPlayer = initAudioPlayer;