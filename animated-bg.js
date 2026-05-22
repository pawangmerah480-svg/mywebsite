// ==================== animated-bg.js ====================
// Membuat background animasi dengan bulan, bintang, partikel, dan aurora

let particleInterval = null;
let starCount = 0;

/**
 * Inisialisasi background animasi
 * Membuat elemen div.animated-bg jika belum ada, lalu menambahkan efek
 */
function initAnimatedBackground() {
  // Cek apakah sudah ada
  let bgDiv = document.querySelector('.animated-bg');
  if (!bgDiv) {
    bgDiv = document.createElement('div');
    bgDiv.className = 'animated-bg';
    document.body.prepend(bgDiv);
  }
  
  // Tambahkan aurora jika belum ada
  if (!bgDiv.querySelector('.aurora')) {
    const aurora = document.createElement('div');
    aurora.className = 'aurora';
    bgDiv.appendChild(aurora);
  }
  
  // Tambahkan bulan jika belum ada
  if (!bgDiv.querySelector('.moon')) {
    const moon = document.createElement('div');
    moon.className = 'moon';
    bgDiv.appendChild(moon);
  }
  
  // Tambahkan geometric pattern jika belum ada
  if (!bgDiv.querySelector('.geometric-overlay')) {
    const geometric = document.createElement('div');
    geometric.className = 'geometric-overlay';
    bgDiv.appendChild(geometric);
  }
  
  // Hapus bintang dan partikel lama jika ada, lalu buat ulang
  const oldStars = bgDiv.querySelectorAll('.star');
  oldStars.forEach(s => s.remove());
  const oldParticles = bgDiv.querySelectorAll('.particle');
  oldParticles.forEach(p => p.remove());
  
  // Generate bintang
  generateStars(bgDiv, 150);
  
  // Generate partikel berkelanjutan
  if (particleInterval) clearInterval(particleInterval);
  particleInterval = setInterval(() => {
    generateParticle(bgDiv);
  }, 800);
  
  // Efek parallax mouse pada bulan
  initMouseParallax(bgDiv);
}

/**
 * Generate bintang dengan posisi acak
 */
function generateStars(container, count) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 5 + 's';
    star.style.animationDuration = 3 + Math.random() * 4 + 's';
    container.appendChild(star);
  }
  starCount = count;
}

/**
 * Generate satu partikel cahaya yang melayang
 */
function generateParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  const size = Math.random() * 6 + 2;
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  particle.style.left = Math.random() * 100 + '%';
  particle.style.animationDuration = Math.random() * 8 + 6 + 's';
  particle.style.animationDelay = Math.random() * 3 + 's';
  container.appendChild(particle);
  // Hapus setelah animasi selesai
  setTimeout(() => {
    if (particle.parentNode) particle.remove();
  }, 14000);
}

/**
 * Efek parallax: bulan bergerak mengikuti gerakan mouse
 */
function initMouseParallax(container) {
  const moon = container.querySelector('.moon');
  if (!moon) return;
  
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 20;
    const y = (e.clientY / window.innerHeight) * 20;
    moon.style.transform = `translate(${x}px, ${y}px)`;
  });
  
  // Untuk sentuhan di mobile, gunakan accelerometer sederhana? Tidak perlu terlalu kompleks
  // Alternatif: gerakan mengikuti tilt (opsional)
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      const gamma = e.gamma; // -90 to 90 (kiri-kanan)
      const beta = e.beta;   // -90 to 90 (depan-belakang)
      if (gamma && beta) {
        const x = gamma / 5;
        const y = beta / 5;
        moon.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  }
}

/**
 * Hentikan semua animasi (bersihkan interval)
 */
function stopAnimatedBackground() {
  if (particleInterval) clearInterval(particleInterval);
  particleInterval = null;
}

// Ekspor fungsi ke global
window.initAnimatedBackground = initAnimatedBackground;
window.stopAnimatedBackground = stopAnimatedBackground;