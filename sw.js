// ==================== sw.js ====================
// Service Worker untuk PWA - caching dan offline support

const CACHE_NAME = 'quran-premium-v1';
const OFFLINE_URL = '/offline.html';

// Daftar asset yang perlu di-cache
const urlsToCache = [
  '/',
  '/index.html',
  '/surah.html',
  '/bookmark.html',
  '/juz.html',
  '/community.html',
  '/voice-search.html',
  '/quiz.html',
  '/smart-recommendation.html',
  '/story-generator.html',
  '/ramadan.html',
  '/progress.html',
  '/ai-search.html',
  '/share-ayat.html',
  '/style.css',
  '/script.js',
  '/data.js',
  '/theme.js',
  '/focus-mode.js',
  '/tafsir-ai.js',
  '/animated-bg.js',
  '/manifest.json',
  '/offline.html',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Amiri+Quran&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

// Install event: cache assets
self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[SW] Gagal caching:', err))
  );
  // Force activation
  self.skipWaiting();
});

// Activate event: hapus cache lama
self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Menghapus cache lama:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch event: serving from cache, fallback to network, lalu offline page
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Skip cross-origin requests yang tidak penting
  if (!requestUrl.origin || requestUrl.origin === self.location.origin) {
    // Untuk request API, gunakan network first
    if (requestUrl.pathname.includes('/api/') || requestUrl.hostname.includes('aladhan.com') || requestUrl.hostname.includes('nominatim.openstreetmap.org')) {
      event.respondWith(
        fetch(event.request)
          .then(response => response)
          .catch(() => {
            return new Response(JSON.stringify({ error: 'Offline - tidak dapat mengambil data' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          })
      );
      return;
    }
    
    // Untuk asset statis: cache first, fallback network
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(fetchResponse => {
              // Cache clone untuk digunakan nanti
              if (fetchResponse && fetchResponse.status === 200) {
                const responseToCache = fetchResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return fetchResponse;
            })
            .catch(() => {
              // Jika request halaman HTML dan offline, tampilkan halaman offline
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match(OFFLINE_URL);
              }
              return new Response('Konten tidak tersedia offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'text/plain' })
              });
            });
        })
    );
  } else {
    // Untuk request eksternal, network first, tidak perlu di-cache
    event.respondWith(fetch(event.request).catch(() => {
      return new Response('Gagal memuat sumber daya eksternal', { status: 503 });
    }));
  }
});

// Background sync (opsional untuk notifikasi)
self.addEventListener('sync', event => {
  if (event.tag === 'quran-sync') {
    console.log('[SW] Sync event dipicu');
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Simulasi sinkronisasi data (bisa untuk bookmark atau progress)
  // Di sini bisa implementasi IndexedDB sync jika diperlukan
  return Promise.resolve();
}