// ==================== data.js ====================
// API endpoint untuk Quran (equran.id)
const API_BASE = "https://equran.id/api/v2";

// Cache untuk menyimpan data surah dan ayat
let cachedSurahList = null;
let cachedSurahDetails = {};

/**
 * Fetch semua daftar surah
 * @returns {Promise<Array>} daftar surah
 */
async function fetchAllSurah() {
  if (cachedSurahList) return cachedSurahList;
  try {
    const response = await fetch(`${API_BASE}/surat`);
    const data = await response.json();
    cachedSurahList = data.data;
    return cachedSurahList;
  } catch (error) {
    console.error("Gagal memuat daftar surah:", error);
    return [];
  }
}

/**
 * Fetch detail surah berdasarkan nomor
 * @param {number} nomor - Nomor surah (1-114)
 * @returns {Promise<Object>} detail surah
 */
async function fetchSurahDetail(nomor) {
  if (cachedSurahDetails[nomor]) return cachedSurahDetails[nomor];
  try {
    const response = await fetch(`${API_BASE}/surat/${nomor}`);
    const data = await response.json();
    cachedSurahDetails[nomor] = data.data;
    return data.data;
  } catch (error) {
    console.error(`Gagal memuat surah ${nomor}:`, error);
    return null;
  }
}

/**
 * Fetch detail juz berdasarkan nomor juz (1-30)
 * @param {number} juzNumber - Nomor juz
 * @returns {Promise<Object>} detail juz
 */
async function fetchJuzDetail(juzNumber) {
  try {
    const response = await fetch(`${API_BASE}/juz/${juzNumber}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Gagal memuat juz ${juzNumber}:`, error);
    return { surat_start: { nomor: 1 }, surat_end: { nomor: 1 } };
  }
}

/**
 * Fetch audio murottal untuk surah tertentu
 * @param {number} surahNumber - Nomor surah
 * @param {string} qori - Kode qori (default '01')
 * @returns {Promise<string|null>} URL audio
 */
async function fetchSurahAudio(surahNumber, qori = '01') {
  // EQuran.id menyediakan audio per ayat, bukan per surah.
  // Kita akan mengambil dari ayat pertama sebagai contoh.
  try {
    const detail = await fetchSurahDetail(surahNumber);
    if (detail && detail.verses && detail.verses[0] && detail.verses[0].audio) {
      return detail.verses[0].audio.url;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Global helper untuk menampilkan notifikasi
 * @param {string} message - Pesan notifikasi
 */
function showNotification(message) {
  let notif = document.createElement('div');
  notif.className = 'notification';
  notif.innerText = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

/**
 * Global helper untuk menyimpan bookmark
 * @param {number} surahId
 * @param {number} ayatNum
 * @param {string} arabText
 * @param {string} translation
 * @param {string} surahName
 */
function saveBookmark(surahId, ayatNum, arabText, translation, surahName) {
  let bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
  const exists = bookmarks.find(b => b.surah == surahId && b.ayat == ayatNum);
  if (!exists) {
    bookmarks.push({ surah: surahId, ayat: ayatNum, arab: arabText, translation, surahName, date: Date.now() });
    localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
    showNotification('✅ Ayat ditambahkan ke bookmark!');
  } else {
    showNotification('⚠️ Sudah ada di bookmark');
  }
}

/**
 * Global helper untuk menyimpan last read
 * @param {number} surahId
 * @param {number} ayatNum
 * @param {string} surahName
 */
function saveLastRead(surahId, ayatNum, surahName) {
  localStorage.setItem('last_read', JSON.stringify({ surah: surahId, ayat: ayatNum, surahName, date: Date.now() }));
}

// Ekspor fungsi ke global (agar bisa diakses dari halaman lain)
window.fetchAllSurah = fetchAllSurah;
window.fetchSurahDetail = fetchSurahDetail;
window.fetchJuzDetail = fetchJuzDetail;
window.fetchSurahAudio = fetchSurahAudio;
window.showNotification = showNotification;
window.saveBookmark = saveBookmark;
window.saveLastRead = saveLastRead;