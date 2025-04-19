const CACHE_NAME = 'noise-generator-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/ui.html',
  '/manifest.json',
  '/icons/icon-96.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/css/style.css',
  '/js/app.js',
  '/js/noise.js',
  '/js/presets.js',
  '/js/white-noise-processor.js',
  '/js/pink-noise-processor.js',
  '/js/brown-noise-processor.js',
  'https://cdn.jsdelivr.net/npm/framework7@8/framework7-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/framework7@8/framework7-bundle.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});