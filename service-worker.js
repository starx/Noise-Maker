const BP = '.'; // BASE PATH // If PWA is served from a subfolder then update this
const CACHE_NAME = 'noise-generator-cache-v1';
const urlsToCache = [
  // `${BP}/`,
  `${BP}/index.html`,
  `${BP}/ui.html`,
  `${BP}/manifest.json`,
  `${BP}/icons/icon-96.png`,
  `${BP}/icons/icon-192.png`,
  `${BP}/icons/icon-512.png`,
  `${BP}/css/style.css`,
  `${BP}/js/app.js`,
  `${BP}/js/noise.js`,
  `${BP}/js/presets.js`,
  `${BP}/js/white-noise-processor.js`,
  `${BP}/js/pink-noise-processor.js`,
  `${BP}/js/brown-noise-processor.js`,
  `${BP}/vendor/framework7-bundle.min.css`,
  `${BP}/vendor/framework7-bundle.min.js`,
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
      .catch(() => {
        // Optional fallback if both cache and network fail
        if (event.request.destination === 'document') {
          return caches.match('offline.html');
        } else {
          console.error(`Failed to fetch: ${event.request}`)
        }
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});