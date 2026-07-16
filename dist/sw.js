self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    title: data.title || 'Zaphir',
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    tag: data.tag,
    data: data.data,
    requireInteraction: data.tag === 'new-order', // Reste jusqu'au clic
    actions: data.tag === 'new-order' ? [
      { action: 'accept', title: '✅ Voir' },
      { action: 'dismiss', title: 'Plus tard' },
    ] : [],
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, focus
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
