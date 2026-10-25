/* ميزان — offline cache for the laptop (installed web app) */
const CACHE = 'mizan-v3';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'css/app.css', 'vendor/fonts.css', 'vendor/chart.umd.min.js',
  'js/core.js', 'js/plan-data.js', 'js/exdb.js', 'js/medkb.js', 'js/programs.js', 'js/foods.js', 'js/nutrition.js', 'js/health.js', 'js/prayer.js', 'js/adhkar.js', 'js/worship.js', 'js/notify.js', 'js/life.js', 'js/shop-data.js', 'js/shop-brands.js', 'js/stores.js', 'js/shop.js', 'js/money.js', 'js/care.js', 'js/habits.js', 'js/islamic.js', 'js/nasheed.js', 'js/library.js', 'js/news.js', 'js/games.js', 'js/chess.js', 'js/women.js', 'js/wizard.js', 'js/kb.js', 'js/tools.js', 'js/trips.js', 'js/app.js',
  'data/quran.json', 'data/adhans.json', 'data/nasheeds.json', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const fresh = /\.(html|js|css|json|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/');
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; }).catch(() => hit);
    return fresh ? net.then(r => r || hit) : (hit || net);
  }));
});
