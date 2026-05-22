// ==================== focus-mode.js ====================
let focusActive = false;
let autoScrollInterval = null;
let hideControlsTimeout = null;
let intersectionObserver = null;

/**
 * Inisialisasi mode fokus pada halaman detail surah
 * Tombol dengan id "focusModeToggle" akan memicu mode ini
 */
function initFocusMode() {
  const toggleBtn = document.getElementById('focusModeToggle');
  if (!toggleBtn) return;
  
  toggleBtn.addEventListener('click', () => {
    focusActive = !focusActive;
    document.body.classList.toggle('focus-mode', focusActive);
    
    if (focusActive) {
      enableFocusMode();
    } else {
      disableFocusMode();
    }
  });
  
  // Keyboard shortcut: tekan 'f' untuk toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      if (toggleBtn) toggleBtn.click();
    }
  });
  
  // Gesture swipe (mobile) - sederhana: swipe up/down untuk scroll
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  });
  document.addEventListener('touchmove', (e) => {
    if (!focusActive) return;
    const touchEndY = e.touches[0].clientY;
    const diff = touchStartY - touchEndY;
    if (Math.abs(diff) > 30) {
      window.scrollBy({ top: diff > 0 ? 100 : -100, behavior: 'smooth' });
      touchStartY = touchEndY;
    }
  });
}

/**
 * Aktifkan mode fokus: sembunyikan kontrol, highlight ayat aktif, auto hide UI
 */
function enableFocusMode() {
  // Buat floating controls
  let controls = document.querySelector('.focus-controls');
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'focus-controls glass';
    controls.innerHTML = `
      <button id="exitFocusBtn" class="focus-btn"><i class="fas fa-compress"></i></button>
      <button id="scrollUpBtn" class="focus-btn"><i class="fas fa-arrow-up"></i></button>
      <button id="scrollDownBtn" class="focus-btn"><i class="fas fa-arrow-down"></i></button>
      <button id="autoScrollBtn" class="focus-btn"><i class="fas fa-play"></i></button>
      <button id="increaseFontBtn" class="focus-btn"><i class="fas fa-plus"></i></button>
      <button id="decreaseFontBtn" class="focus-btn"><i class="fas fa-minus"></i></button>
    `;
    document.body.appendChild(controls);
    
    // Event listeners
    document.getElementById('exitFocusBtn').onclick = () => document.getElementById('focusModeToggle')?.click();
    document.getElementById('scrollUpBtn').onclick = () => window.scrollBy({ top: -200, behavior: 'smooth' });
    document.getElementById('scrollDownBtn').onclick = () => window.scrollBy({ top: 200, behavior: 'smooth' });
    
    let autoScrollActive = false;
    const autoBtn = document.getElementById('autoScrollBtn');
    autoBtn.onclick = () => {
      autoScrollActive = !autoScrollActive;
      if (autoScrollActive) {
        autoScrollInterval = setInterval(() => {
          window.scrollBy({ top: 50, behavior: 'smooth' });
        }, 3000);
        autoBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        clearInterval(autoScrollInterval);
        autoBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    };
    
    // Font size adjustment untuk teks Arab di ayat aktif
    let currentFontSize = 2.2; // rem
    const incBtn = document.getElementById('increaseFontBtn');
    const decBtn = document.getElementById('decreaseFontBtn');
    incBtn.onclick = () => {
      currentFontSize = Math.min(currentFontSize + 0.2, 3.5);
      document.querySelectorAll('.focus-mode .arabic').forEach(el => {
        el.style.fontSize = currentFontSize + 'rem';
      });
    };
    decBtn.onclick = () => {
      currentFontSize = Math.max(currentFontSize - 0.2, 1.5);
      document.querySelectorAll('.focus-mode .arabic').forEach(el => {
        el.style.fontSize = currentFontSize + 'rem';
      });
    };
  }
  
  // Auto-hide controls setelah 2 detik tidak bergerak
  const showControls = () => {
    const ctrl = document.querySelector('.focus-controls');
    if (ctrl) ctrl.style.opacity = '1';
    if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
      if (document.querySelector('.focus-controls')) {
        document.querySelector('.focus-controls').style.opacity = '0';
      }
    }, 2000);
  };
  
  window.addEventListener('mousemove', showControls);
  window.addEventListener('scroll', showControls);
  window.addEventListener('touchstart', showControls);
  showControls();
  
  // Highlight ayat yang sedang aktif berdasarkan viewport
  if (intersectionObserver) intersectionObserver.disconnect();
  intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        document.querySelectorAll('.ayat-card').forEach(card => card.classList.remove('active-ayat'));
        entry.target.classList.add('active-ayat');
        // Optional: simpan posisi last read otomatis
        const ayatNum = entry.target.querySelector('.ayat-number')?.innerText.split(' ')[1];
        const surahId = new URLSearchParams(window.location.search).get('surah');
        const surahName = document.getElementById('surahName')?.innerText;
        if (ayatNum && surahId && typeof saveLastRead === 'function') {
          saveLastRead(surahId, ayatNum, surahName);
        }
      }
    });
  }, { threshold: 0.6 });
  
  document.querySelectorAll('.ayat-card').forEach(card => {
    intersectionObserver.observe(card);
  });
  
  // Tambahkan kelas untuk styling aktif
  document.body.classList.add('focus-mode-active');
}

/**
 * Nonaktifkan mode fokus
 */
function disableFocusMode() {
  const controls = document.querySelector('.focus-controls');
  if (controls) controls.remove();
  if (autoScrollInterval) clearInterval(autoScrollInterval);
  if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
  if (intersectionObserver) intersectionObserver.disconnect();
  window.removeEventListener('mousemove', () => {});
  window.removeEventListener('scroll', () => {});
  window.removeEventListener('touchstart', () => {});
  document.body.classList.remove('focus-mode-active');
  // Reset font size arabic
  document.querySelectorAll('.focus-mode .arabic').forEach(el => {
    el.style.fontSize = '';
  });
  document.querySelectorAll('.ayat-card').forEach(card => card.classList.remove('active-ayat'));
}

// Ekspor fungsi ke global
window.initFocusMode = initFocusMode;
window.enableFocusMode = enableFocusMode;
window.disableFocusMode = disableFocusMode;