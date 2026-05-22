// ==================== theme.js ====================
// Definisi tema premium
const themes = {
  emerald: {
    name: 'Emerald Night',
    vars: {
      '--accent': '#10b981',
      '--accent-glow': 'rgba(16,185,129,0.4)',
      '--bg-primary': '#0a0f1a',
      '--card-bg': 'rgba(18,25,40,0.75)',
      '--gradient-bg': 'radial-gradient(circle at 20% 30%, rgba(16,185,129,0.15), transparent 70%)',
      '--border-glass': 'rgba(255,255,255,0.08)'
    }
  },
  gold: {
    name: 'Gold Luxury',
    vars: {
      '--accent': '#f59e0b',
      '--accent-glow': 'rgba(245,158,11,0.4)',
      '--bg-primary': '#0c0a0a',
      '--card-bg': 'rgba(30,25,20,0.8)',
      '--gradient-bg': 'radial-gradient(circle at 70% 20%, rgba(245,158,11,0.15), transparent 70%)',
      '--border-glass': 'rgba(255,255,255,0.1)'
    }
  },
  royal: {
    name: 'Royal Blue',
    vars: {
      '--accent': '#3b82f6',
      '--accent-glow': 'rgba(59,130,246,0.4)',
      '--bg-primary': '#0a0c1a',
      '--card-bg': 'rgba(25,30,50,0.75)',
      '--gradient-bg': 'radial-gradient(circle at 80% 50%, rgba(59,130,246,0.15), transparent 70%)',
      '--border-glass': 'rgba(255,255,255,0.08)'
    }
  },
  amoled: {
    name: 'Pure AMOLED',
    vars: {
      '--accent': '#10b981',
      '--accent-glow': 'rgba(16,185,129,0.2)',
      '--bg-primary': '#000000',
      '--card-bg': 'rgba(10,10,10,0.85)',
      '--gradient-bg': 'none',
      '--border-glass': 'rgba(255,255,255,0.05)'
    }
  },
  sunset: {
    name: 'Sunset Islamic',
    vars: {
      '--accent': '#ec4899',
      '--accent-glow': 'rgba(236,72,153,0.4)',
      '--bg-primary': '#1a0b1a',
      '--card-bg': 'rgba(40,20,40,0.75)',
      '--gradient-bg': 'radial-gradient(circle at 30% 80%, rgba(236,72,153,0.2), rgba(249,115,22,0.1))',
      '--border-glass': 'rgba(255,255,255,0.08)'
    }
  }
};

/**
 * Terapkan tema ke seluruh halaman
 * @param {string} themeName - Nama tema (emerald, gold, royal, amoled, sunset)
 */
function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;
  const root = document.documentElement;
  for (let [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  localStorage.setItem('activeTheme', themeName);
  
  // Update background gradient jika ada
  const animatedBg = document.querySelector('.animated-bg');
  if (animatedBg && theme.vars['--gradient-bg'] !== 'none') {
    animatedBg.style.background = theme.vars['--gradient-bg'];
  } else if (animatedBg) {
    animatedBg.style.background = '#000';
  }
  
  // Tampilkan notifikasi jika diperlukan
  if (typeof showNotification === 'function') {
    showNotification(`Tema ${theme.name} diterapkan`);
  }
}

/**
 * Inisialisasi theme selector (modal dan tombol)
 */
function initThemeSelector() {
  const savedTheme = localStorage.getItem('activeTheme') || 'emerald';
  applyTheme(savedTheme);
  
  // Cari tombol openThemeSelector (bisa di sidebar)
  const openBtn = document.getElementById('openThemeSelector');
  const modal = document.getElementById('themeModal');
  if (!openBtn || !modal) return;
  
  openBtn.onclick = () => {
    modal.style.display = 'flex';
  };
  
  const closeModal = modal.querySelector('.close-modal, .theme-close');
  if (closeModal) closeModal.onclick = () => modal.style.display = 'none';
  
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
  
  // Pasang event listener ke theme cards
  const themeCards = document.querySelectorAll('.theme-card');
  themeCards.forEach(card => {
    card.onclick = () => {
      const theme = card.dataset.theme;
      if (theme && themes[theme]) {
        applyTheme(theme);
        modal.style.display = 'none';
      }
    };
  });
}

// Ekspor ke global
window.applyTheme = applyTheme;
window.initThemeSelector = initThemeSelector;