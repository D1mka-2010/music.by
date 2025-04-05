// Простой Service Worker для уведомлений
self.addEventListener('install', event => {
      self.skipWaiting();
  });
  
  self.addEventListener('activate', event => {
      clients.claim();
  });
  
  self.addEventListener('message', event => {
      if (event.data.type === 'PLAYING') {
          self.registration.showNotification('Сейчас играет', {
              body: `${event.data.title} - ${event.data.artist}`,
              icon: 'https://via.placeholder.com/48/1db954/ffffff?text=MP',
              vibrate: [200, 100, 200]
          });
      }
  });