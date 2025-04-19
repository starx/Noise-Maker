const getApp = () => {
  return new Framework7({
      root: '#app',
      name: 'Ambiance & Noise Generator',
      theme: 'auto',
      routes: [
        {
          path: '/',
          url: 'ui.html',
          on: {
            pageAfterIn() {
              if (!document.querySelector('script[src="/js/noise.js"]')) {
                const script = document.createElement('script');
                script.src = '/js/noise.js';
                document.body.appendChild(script);
              }

            }
          }
        },
        {
          path: '/about',
          url: 'about.html'
        }
      ]
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();

      if (!reg) {
        const newReg = await navigator.serviceWorker.register('/js/service-worker.js');
        console.log('[SW] Registered new service worker:', newReg);
      } else {
        console.log('[SW] Service worker already registered.');
        reg.update(); // Trigger check for updated file
      }

      // Optional: alert when a new SW is installed and waiting
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] New service worker activated.');
      });

    } catch (err) {
      console.warn('[SW] Registration failed:', err);
    }
  });
}
