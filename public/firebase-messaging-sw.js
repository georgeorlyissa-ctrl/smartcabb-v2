/**
 * 🔔 SERVICE WORKER FIREBASE POUR SMARTCABB
 * 
 * Ce fichier permet de recevoir les notifications push Firebase
 * même quand l'application est fermée ou en arrière-plan.
 * 
 * ⚠️ IMPORTANT : Ce fichier DOIT être à la racine /public/
 * 
 * @version 2.1.0 - Avec gestion erreurs et fallback
 * @date 2026-02-28
 */

// Import Firebase scripts avec gestion d'erreur
try {
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
  console.log('[Service Worker] Scripts Firebase chargés');
} catch (error) {
  console.error('[Service Worker] Erreur chargement Firebase:', error);
}

// 🔑 Configuration Firebase - Sera injectée au runtime depuis l'app
let firebaseConfig = null;
let messaging = null;

// 📨 Écouter les messages de l'app principale pour recevoir la config
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INIT_FIREBASE') {
    console.log('[Service Worker] Configuration Firebase reçue');
    firebaseConfig = event.data.config;
    
    // Initialiser Firebase avec la config reçue
    if (firebaseConfig && firebaseConfig.apiKey) {
      try {
        firebase.initializeApp(firebaseConfig);
        messaging = firebase.messaging();
        console.log('[Service Worker] Firebase initialisé avec succès ✅');
        
        // Configurer le listener de notifications
        setupNotificationListener();
      } catch (error) {
        console.error('[Service Worker] Erreur initialisation Firebase:', error);
      }
    }
  }
});

// 🔔 Configurer le gestionnaire de notifications en arrière-plan
function setupNotificationListener() {
  if (!messaging) {
    console.warn('[Service Worker] Messaging non initialisé');
    return;
  }

  // Gérer les notifications en arrière-plan
  messaging.onBackgroundMessage((payload) => {
    console.log('[Service Worker] Notification reçue en arrière-plan :', payload);

    // Extraire les données
    const notificationTitle = payload.notification?.title || 'SmartCabb';
    const notificationOptions = {
      body: payload.notification?.body || 'Nouvelle notification',
      icon: '/logo-smartcabb.png',
      badge: '/badge-smartcabb.png',
      tag: 'smartcabb-ride-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200], // Vibration plus longue
      silent: false, // ⚠️ IMPORTANT : Ne pas mettre en silence
      // 🔊 SON DE NOTIFICATION - CRITIQUE pour sonner même en arrière-plan
      sound: '/notification-sound.mp3', // Son personnalisé
      data: payload.data || {},
      // Options supplémentaires pour Android/Chrome
      actions: payload.data?.rideId ? [
        {
          action: 'accept',
          title: '✅ Accepter',
          icon: '/icon-accept.png'
        },
        {
          action: 'decline',
          title: '❌ Refuser',
          icon: '/icon-decline.png'
        }
      ] : [],
      // Priorité haute pour notifications importantes
      priority: 'high',
      // Timestamp pour trier les notifications
      timestamp: Date.now()
    };

    // Afficher la notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// 🎯 Gérer les actions sur la notification (Accepter/Refuser)
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification cliquée :', event.notification.tag);
  console.log('[Service Worker] Action cliquée :', event.action);

  event.notification.close();

  // Gérer les actions spécifiques
  if (event.action === 'accept') {
    console.log('✅ Course acceptée depuis la notification');
    // Ouvrir l'app et accepter la course
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('smartcabb.com') && 'focus' in client) {
            // Envoyer un message au client pour accepter la course
            client.postMessage({
              type: 'ACCEPT_RIDE',
              rideId: event.notification.data?.rideId
            });
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/driver-dashboard?action=accept&rideId=' + event.notification.data?.rideId);
        }
      })
    );
  } else if (event.action === 'decline') {
    console.log('❌ Course refusée depuis la notification');
    // Pas besoin d'ouvrir l'app, juste logger
  } else {
    // Clic sur la notification sans action spécifique
    // Ouvrir l'application SmartCabb
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Si une fenêtre SmartCabb est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url.includes('smartcabb.com') && 'focus' in client) {
            return client.focus();
          }
        }

        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow('/driver-dashboard');
        }
      })
    );
  }
});

console.log('[Service Worker] Firebase Messaging Service Worker chargé pour SmartCabb ✅');
