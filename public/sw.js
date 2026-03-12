// public/sw.js

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    // Customize how the notification looks on the user's phone
    const options = {
      body: data.body || "You have a new message from Amelia.",
      icon: '/icon-192x192.png', // Update this to match your app's actual icon path
      badge: '/badge.png',       // Optional: A small monochrome icon for Android status bar
      vibrate: [200, 100, 200, 100, 200], // A distinct vibration pattern for medical alerts
      data: {
        url: data.url || '/' // Where to take the user when they click the notification
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Amelia MedTech", options)
    );
  }
});

// Handle what happens when the user taps the notification
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Close the pop-up
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // If they already have the app open, focus that tab
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // If the app is closed, open it
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});