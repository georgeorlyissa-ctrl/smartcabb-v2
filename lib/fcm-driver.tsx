/**
 * 🔥 SYSTÈME FCM POUR DRIVERS - SmartCabb
 * 
 * ⚠️ VERSION HYBRID : Client génère token + Backend envoie notifications
 * Config Firebase publique nécessaire pour Web Push (Safe)
 * 
 * @version 4.1.0 - PRODUCTION READY (Firebase npm)
 * @date 2026-02-26
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from './toast';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

// 🔥 CONFIG FIREBASE PUBLIQUE (Safe - nécessaire pour Web Push)
// Note: Cette config est publique et DOIT être côté client pour les notifications push
const firebaseConfig = {
  apiKey: "AIzaSyBaQo0fy37kfP5qLCsEHhVY44Ah3PpCbEw",
  authDomain: "smartcabb.firebaseapp.com",
  projectId: "smartcabb",
  storageBucket: "smartcabb.firebasestorage.app",
  messagingSenderId: "396618257088",
  appId: "1:396618257088:web:f97c8aa8a239072ec82cf7",
  measurementId: "G-PQZC05N17H"
};

// VAPID Key publique (Safe - utilisée uniquement côté client)
const VAPID_KEY = "BM8KqZ1xH9YJ_VT3x9WvYxGxX8KZ9YpXxZ1xH9YJ_VT3x9WvYxGxX8KZ9YpXxZ1xH9YJ_VT3x9WvYxGxX8KZ9Yp";

// Instance Firebase (singleton)
let messaging: Messaging | null = null;

/**
 * 🔥 Initialiser Firebase Messaging
 */
async function initializeFirebaseMessaging(): Promise<Messaging | null> {
  if (messaging) return messaging;

  try {
    // Vérifier si on est dans un environnement browser
    if (typeof window === 'undefined') {
      console.warn('⚠️ Firebase Messaging nécessite un environnement browser');
      return null;
    }

    // Initialiser Firebase App (singleton)
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase App initialisée');
    } else {
      app = getApp();
      console.log('✅ Firebase App déjà initialisée');
    }

    // Initialiser Messaging
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialisé');

    return messaging;
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
    return null;
  }
}

/**
 * 🔑 Obtenir le token FCM du navigateur
 */
async function getDriverFCMTokenFromBrowser(): Promise<string | null> {
  try {
    // Vérifier support des notifications
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications non supportées');
      return null;
    }

    // Demander permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Permission notifications refusée');
      return null;
    }

    // Initialiser Firebase Messaging
    const messagingInstance = await initializeFirebaseMessaging();
    if (!messagingInstance) {
      console.error('❌ Firebase Messaging non disponible');
      return null;
    }

    // Obtenir le token FCM
    console.log('🔑 Génération du token FCM...');
    const token = await getToken(messagingInstance, { vapidKey: VAPID_KEY });

    if (token) {
      console.log('✅ Token FCM obtenu:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('⚠️ Impossible d\'obtenir le token FCM');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur obtention token FCM:', error);
    return null;
  }
}

/**
 * 📱 Enregistrer le token FCM (Frontend génère + Backend sauvegarde)
 */
export async function registerDriverFCMToken(driverId: string): Promise<boolean> {
  try {
    console.log('📱 [FCM] Enregistrement pour driver:', driverId);

    // 1. Obtenir le token FCM du navigateur
    const fcmToken = await getDriverFCMTokenFromBrowser();
    
    if (!fcmToken) {
      console.error('❌ [FCM] Impossible d\'obtenir le token');
      toast.error('Notifications non disponibles');
      return false;
    }

    console.log('✅ [FCM] Token obtenu, envoi au backend...');

    // 2. Envoyer le VRAI token au backend pour sauvegarde
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/fcm-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ fcmToken })
      }
    );

    const result = await response.json();

    if (!result.success) {
      console.error('❌ [FCM] Erreur backend:', result.error);
      toast.error('Erreur activation notifications');
      return false;
    }

    console.log('✅ [FCM] Token enregistré dans le backend');
    
    // 3. Sauvegarder dans localStorage (cache 7 jours)
    const registrationData = {
      registered: true,
      registeredAt: Date.now(),
      driverId,
      tokenPreview: fcmToken.substring(0, 20)
    };
    localStorage.setItem(`fcm_registered_${driverId}`, JSON.stringify(registrationData));

    toast.success('Notifications activées ! 🔔');

    // 4. Configurer l'écoute des notifications foreground
    setupDriverForegroundListener();

    return true;
  } catch (error) {
    console.error('❌ [FCM] Erreur enregistrement:', error);
    toast.error('Erreur activation notifications');
    return false;
  }
}

/**
 * 🔊 Écouter les notifications en foreground (app ouverte)
 */
async function setupDriverForegroundListener() {
  try {
    const messagingInstance = await initializeFirebaseMessaging();
    if (!messagingInstance) return;

    console.log('👂 [FCM] Écoute des notifications foreground...');

    onMessage(messagingInstance, (payload: any) => {
      console.log('📨 [FCM] Notification reçue (foreground):', payload);

      const notification = payload.notification;
      const data = payload.data;

      if (notification) {
        // Afficher un toast
        toast.success(`${notification.title}\n${notification.body}`, {
          duration: 15000,
          action: {
            label: 'Voir',
            onClick: () => {
              console.log('📍 Affichage demande de course');
              window.dispatchEvent(new CustomEvent('new-ride-request', {
                detail: { rideId: data?.rideId }
              }));
            }
          }
        });

        // Son de notification
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZTA0OVqzn77BdGAg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBQ==');
          audio.play().catch(() => {});
        } catch (e) {
          // Son non disponible
        }

        // Émettre événement custom
        window.dispatchEvent(new CustomEvent('fcm-notification', {
          detail: { notification, data }
        }));
      }
    });

    console.log('✅ [FCM] Listener foreground configuré');
  } catch (error) {
    console.error('❌ [FCM] Erreur setup listener:', error);
  }
}

/**
 * ✅ Vérifier si FCM est enregistré (cache local)
 */
export function isDriverFCMTokenRegistered(driverId: string): boolean {
  try {
    const cached = localStorage.getItem(`fcm_registered_${driverId}`);
    
    if (!cached) {
      return false;
    }

    const data = JSON.parse(cached);
    const age = Date.now() - data.registeredAt;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours

    if (age > maxAge) {
      console.log('⏰ [FCM] Enregistrement expiré (> 7 jours)');
      localStorage.removeItem(`fcm_registered_${driverId}`);
      return false;
    }

    console.log('✅ [FCM] Enregistré (il y a', Math.floor(age / 1000 / 60 / 60), 'heures)');
    return true;
  } catch (error) {
    console.error('❌ [FCM] Erreur vérification cache:', error);
    return false;
  }
}

/**
 * 🗑️ Désenregistrer FCM (déconnexion)
 */
export async function unregisterDriverFCMToken(driverId: string): Promise<boolean> {
  try {
    console.log('🗑️ [FCM] Désenregistrement driver:', driverId);

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/fcm-token`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log('✅ [FCM] Désenregistré du backend');
    }

    // Supprimer du cache local
    localStorage.removeItem(`fcm_registered_${driverId}`);

    return true;
  } catch (error) {
    console.error('❌ [FCM] Erreur désenregistrement:', error);
    return false;
  }
}

/**
 * 🔄 Forcer le ré-enregistrement FCM
 */
export async function forceRefreshDriverFCMToken(driverId: string): Promise<boolean> {
  console.log('🔄 [FCM] Force refresh...');
  
  // Supprimer le cache
  localStorage.removeItem(`fcm_registered_${driverId}`);
  
  // Ré-enregistrer
  return await registerDriverFCMToken(driverId);
}
