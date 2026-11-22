/* Service worker sederhana: hanya menyimpan cangkang aplikasi (halaman + ikon) dari GitHub.
   Permintaan ke script.google.com tidak pernah disentuh, jadi data selalu terbaru.
   Naikkan angka VERSI setiap kali index.html diperbarui agar HP mengambil versi baru. */
const VERSI = 'npdc-v5';
const CANGKANG = ['./', 'index.html', 'icon-192.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => Promise.all(CANGKANG.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res && res.ok) { const salin = res.clone(); caches.open(VERSI).then(c => c.put(r, salin)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
