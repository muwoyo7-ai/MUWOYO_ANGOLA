self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notification';
  const options = {
    body: data.body || '',
    icon: data.icon || '/favicon.ico',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  // You may want to re-subscribe the user here and send the new subscription
  // to your backend. This example just logs the event.
  console.log('pushsubscriptionchange', event);
});
self.addEventListener('push', (event) => {
  const payload = event.data?.json?.() || {};
  const title = payload.title || 'Muwoyo';
  const body = payload.body || '';
  const icon = payload.icon || '/favicon.ico';
  const url = payload.url || '/dashboard';

  const notificationOptions = {
    body,
    icon,
    badge: icon,
    data: { url },
  };

  event.waitUntil(self.registration.showNotification(title, notificationOptions));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE', url });
          return;
        }
      }

      clients.openWindow(url);
    }),
  );
});
