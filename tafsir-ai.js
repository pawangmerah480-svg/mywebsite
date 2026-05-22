// ==================== tafsir-ai.js ====================
// Database tafsir singkat untuk ayat-ayat populer
// Dalam versi premium, ini bisa diperluas dengan API tafsir, namun untuk demo menggunakan data lokal

const tafsirDatabase = {
  // Surah Al-Fatihah
  "1:1": {
    summary: "Basmalah adalah ayat pembuka setiap surah (kecuali At-Taubah). Mengandung makna memohon pertolongan kepada Allah Yang Maha Pengasih dan Maha Penyayang.",
    lessons: ["Awali setiap aktivitas dengan menyebut nama Allah", "Rasakan kasih sayang Allah dalam setiap langkah"],
    relevance: "Mengingatkan kita untuk selalu bersandar kepada Allah dalam segala hal."
  },
  "1:2": {
    summary: "Segala puji hanya milik Allah, Rabb (Tuhan, Pemilik, Pengatur) seluruh alam semesta.",
    lessons: ["Hanya Allah yang layak dipuji secara mutlak", "Allah adalah pemelihara alam semesta"],
    relevance: "Melatih rasa syukur atas nikmat Allah."
  },
  "1:5": {
    summary: "Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami memohon pertolongan.",
    lessons: ["Ibadah murni hanya untuk Allah", "Berserah diri sepenuhnya kepada Allah"],
    relevance: "Inti dari tauhid dan tawakal."
  },
  // Ayat Kursi
  "2:255": {
    summary: "Ayat Kursi menjelaskan keagungan Allah, bahwa Dia Maha Hidup, Maha Berdiri Sendiri, tidak mengantuk dan tidak tidur. Milik-Nya segala yang di langit dan di bumi.",
    lessons: ["Allah Maha Kuasa atas segalanya", "Tidak ada yang dapat memberi syafaat tanpa izin-Nya"],
    relevance: "Dibaca setelah sholat untuk perlindungan sepanjang hari."
  },
  // Surah Al-Ikhlas
  "112:1": {
    summary: "Allah adalah Tuhan yang Maha Esa, tidak ada sekutu bagi-Nya.",
    lessons: ["Keesaan Allah adalah fondasi iman", "Tolak segala bentuk syirik"],
    relevance: "Setara dengan sepertiga Al-Qur'an dalam keutamaannya."
  },
  "112:2": {
    summary: "Allah adalah tempat bergantung segala sesuatu, semua makhluk membutuhkan-Nya.",
    lessons: ["Hanya Allah yang tidak membutuhkan apapun", "Kita selalu butuh pertolongan Allah"],
    relevance: "Mengajarkan sikap rendah hati dan tawakal."
  },
  "112:3": {
    summary: "Allah tidak beranak dan tidak diperanakkan. Ini menolak konsep trinitas dan keturunan ilahi.",
    lessons: ["Allah Maha Suci dari memiliki anak", "Allah Maha Kekal tanpa awal dan akhir"],
    relevance: "Memperkuat keyakinan tauhid."
  },
  "112:4": {
    summary: "Tidak ada satu pun yang setara atau sebanding dengan Allah.",
    lessons: ["Allah Maha Esa dalam zat, sifat, dan perbuatan-Nya", "Segala sesuatu selain-Nya adalah makhluk"],
    relevance: "Landasan akidah yang benar."
  },
  // Surah Ar-Rahman
  "55:1-4": {
    summary: "Allah Yang Maha Pemurah mengajarkan Al-Qur'an, menciptakan manusia, dan mengajarinya pandai berbicara.",
    lessons: ["Al-Qur'an adalah rahmat terbesar", "Manusia diberi keistimewaan akal dan bahasa"],
    relevance: "Menyadarkan kita akan nikmat Allah yang tak terhitung."
  },
  // Surah Al-Mulk
  "67:1-2": {
    summary: "Maha Suci Allah yang di tangan-Nya segala kerajaan, Dia menciptakan hidup dan mati untuk menguji siapa yang terbaik amalnya.",
    lessons: ["Hidup adalah ujian", "Setiap amal akan dinilai"],
    relevance: "Surah ini memberi perlindungan dari siksa kubur."
  }
};

// Default tafsir jika tidak ditemukan
const defaultTafsir = {
  summary: "Ayat ini mengandung petunjuk dan hikmah bagi orang-orang yang beriman. Renungkan maknanya dan amalkan dalam kehidupan sehari-hari.",
  lessons: ["Mempelajari Al-Qur'an adalah ibadah", "Setiap ayat memiliki pesan mendalam", "Amalkan ilmu yang didapat"],
  relevance: "Al-Qur'an adalah petunjuk bagi seluruh umat manusia."
};

/**
 * Mendapatkan tafsir singkat untuk ayat tertentu
 * @param {number|string} surah - Nomor surah atau nama surah
 * @param {number} ayat - Nomor ayat
 * @returns {Object} Objek tafsir dengan properti summary, lessons, relevance
 */
function getTafsir(surah, ayat) {
  const key = `${surah}:${ayat}`;
  if (tafsirDatabase[key]) {
    return tafsirDatabase[key];
  }
  // Cek rentang ayat (misal 55:1-4)
  for (let rangeKey in tafsirDatabase) {
    if (rangeKey.includes('-')) {
      const [start, end] = rangeKey.split(':')[1].split('-');
      const surahKey = rangeKey.split(':')[0];
      if (surahKey == surah && ayat >= parseInt(start) && ayat <= parseInt(end)) {
        return tafsirDatabase[rangeKey];
      }
    }
  }
  // Fallback ke tafsir generik berdasarkan surah populer
  const popularSurahs = {
    1: "Surah Al-Fatihah adalah pembuka Al-Qur'an yang wajib dibaca dalam sholat. Mengandung pujian, permohonan, dan petunjuk.",
    2: "Surah Al-Baqarah adalah surah terpanjang. Berisi hukum-hukum, kisah, dan petunjuk hidup.",
    36: "Surah Yasin sering disebut jantung Al-Qur'an. Berisi penguatan iman dan peringatan hari kiamat.",
    67: "Surah Al-Mulk memberi perlindungan dari siksa kubur. Membacanya setiap malam dianjurkan.",
    112: "Surah Al-Ikhlas setara dengan sepertiga Al-Qur'an. Menegaskan keesaan Allah."
  };
  if (popularSurahs[surah]) {
    return {
      summary: popularSurahs[surah],
      lessons: ["Renungkan makna dan terapkan dalam hidup", "Jadikan Al-Qur'an sebagai pedoman utama"],
      relevance: "Al-Qur'an adalah rahmat dan petunjuk."
    };
  }
  return defaultTafsir;
}

/**
 * Mendapatkan tafsir berdasarkan teks pencarian (untuk AI search)
 * @param {string} keyword - Kata kunci
 * @returns {Array} Array rekomendasi tafsir
 */
function searchTafsirByKeyword(keyword) {
  const results = [];
  const lowerKeyword = keyword.toLowerCase();
  for (let [key, value] of Object.entries(tafsirDatabase)) {
    if (value.summary.toLowerCase().includes(lowerKeyword) || 
        value.lessons.some(l => l.toLowerCase().includes(lowerKeyword))) {
      results.push({ key, ...value });
    }
  }
  return results.slice(0, 5);
}

// Ekspor ke global
window.getTafsir = getTafsir;
window.searchTafsirByKeyword = searchTafsirByKeyword;