/**
 * 🔥 SYSTÈME FCM POUR DRIVERS - SmartCabb
 * 
 * ⚠️ VERSION HYBRID : Client génère token + Backend envoie notifications
 * Config Firebase publique nécessaire pour Web Push (Safe)
 * 
 * @version 4.2.0 - PRODUCTION READY (Imports dynamiques)
 * @date 2026-02-28
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from './toast';

// Types Firebase
type Messaging = any;

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
const VAPID_KEY = "BDHm-w7od6Q7PP8y_vCv3TxuQiocDUyH3X6sg1zxQfm_KhCSFJnHtcVP4yekIOWUiJ6vHvO06yaXXnyp0i_1Muc";

// Instance Firebase (singleton)
let messaging: Messaging | null = null;
let firebaseModules: any = null;

/**
 * Charger les modules Firebase dynamiquement (évite erreurs build)
 */
async function loadFirebaseModules() {
  if (firebaseModules) return firebaseModules;
  if (typeof window === 'undefined') return null;

  try {
    const [appModule, messagingModule] = await Promise.all([
      import('firebase/app'),
      import('firebase/messaging')
    ]);

    firebaseModules = {
      initializeApp: appModule.initializeApp,
      getApp: appModule.getApp,
      getApps: appModule.getApps,
      getMessaging: messagingModule.getMessaging,
      getToken: messagingModule.getToken,
      onMessage: messagingModule.onMessage
    };

    return firebaseModules;
  } catch (error) {
    console.error('❌ Erreur chargement Firebase:', error);
    return null;
  }
}

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

    // Charger les modules Firebase
    const modules = await loadFirebaseModules();
    if (!modules) {
      console.warn('⚠️ Firebase modules non disponibles');
      return null;
    }

    // 1️⃣ Enregistrer le Service Worker AVANT d'initialiser Firebase
    if ('serviceWorker' in navigator) {
      try {
        // 🔍 Vérifier si on est en dev (Figma Make, null origin, etc.)
        const isDev = window.location.protocol === 'null:' || 
                      window.location.hostname === 'null' ||
                      window.location.origin === 'null';
        
        if (isDev) {
          console.warn('⚠️ [FCM] Environnement de dev détecté - Service Worker désactivé');
          console.log('💡 [FCM] Les notifications foreground fonctionneront quand même');
          // Ne pas essayer d'enregistrer le SW en dev, passer directement à l'init Firebase
        } else {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          console.log('✅ Service Worker enregistré:', registration.scope);
          
          // Attendre que le Service Worker soit activé
          if (registration.installing) {
            await new Promise<void>((resolve) => {
              registration.installing!.addEventListener('statechange', (e) => {
                if ((e.target as ServiceWorker).state === 'activated') {
                  resolve();
                }
              });
            });
          }
          
          // Envoyer la config au Service Worker
          if (registration.active) {
            registration.active.postMessage({
              type: 'INIT_FIREBASE',
              config: firebaseConfig
            });
            console.log('✅ [FCM] Config Firebase envoyée au Service Worker');
          }
        }
      } catch (swError) {
        console.warn('⚠️ Service Worker non disponible:', swError);
        console.log('💡 Notifications foreground uniquement');
        // Continuer quand même pour les notifications foreground
      }
    }

    // 2️⃣ Initialiser Firebase App (singleton)
    let app;
    if (modules.getApps().length === 0) {
      app = modules.initializeApp(firebaseConfig);
      console.log('✅ Firebase App initialisée');
    } else {
      app = modules.getApp();
      console.log('✅ Firebase App déjà initialisée');
    }

    // 3️⃣ Initialiser Messaging
    messaging = modules.getMessaging(app);
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
      toast.error('Votre navigateur ne supporte pas les notifications');
      return null;
    }

    // Demander permission
    console.log('🔔 Demande de permission pour les notifications...');
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('⚠️ Permission notifications refusée');
      toast.error('Vous devez autoriser les notifications pour recevoir les demandes de course');
      return null;
    }
    
    console.log('✅ Permission notifications accordée');

    // Initialiser Firebase Messaging
    const messagingInstance = await initializeFirebaseMessaging();
    if (!messagingInstance) {
      console.error('❌ Firebase Messaging non disponible');
      toast.error('Erreur d\'initialisation Firebase - Contactez le support');
      return null;
    }

    // Charger les modules
    const modules = await loadFirebaseModules();
    if (!modules) {
      console.error('❌ Firebase modules non disponibles');
      return null;
    }

    // Obtenir le token FCM
    console.log('🔑 Génération du token FCM...');
    
    try {
      const token = await modules.getToken(messagingInstance, { vapidKey: VAPID_KEY });

      if (token) {
        console.log('✅ Token FCM obtenu:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.warn('⚠️ Impossible d\'obtenir le token FCM');
        toast.warning('Token FCM non généré - Les notifications en arrière-plan ne fonctionneront pas');
        return null;
      }
    } catch (tokenError: any) {
      console.error('❌ Erreur génération token FCM:', tokenError);
      
      // En dev (Figma Make), le token peut ne pas être généré mais on peut quand même continuer
      if (window.location.origin === 'null' || window.location.protocol === 'null:') {
        console.warn('⚠️ [FCM] Mode dev - Génération d\'un token factice');
        // ✅ FIX: Ne pas afficher de toast car c'est normal en dev
        console.info('ℹ️ Mode développement - Notifications foreground uniquement');
        // Retourner un token factice pour le dev
        return 'dev-token-' + Date.now();
      }
      
      // ✅ FIX: Logger seulement, ne pas afficher d'erreur à l'utilisateur
      console.warn('⚠️ [FCM] Impossible de générer le token - Les notifications push ne fonctionneront pas');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Erreur obtention token FCM:', error);
    // ✅ FIX: Logger seulement, ne pas afficher d'erreur à l'utilisateur
    console.warn('⚠️ [FCM] Erreur:', error.message || 'Impossible d\'obtenir le token FCM');
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
      console.warn('⚠️ [FCM] Impossible d\'obtenir le token - Les notifications ne fonctionneront pas');
      // ✅ FIX: Ne pas afficher d'erreur à l'utilisateur, c'est optionnel
      return false;
    }

    console.log('✅ [FCM] Token obtenu, envoi au backend...');

    // 2. Envoyer le VRAI token au backend pour sauvegarde
    try {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FCM] Erreur HTTP:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        console.error('❌ [FCM] Erreur backend:', result.error);
        toast.error('Erreur lors de l\'enregistrement du token');
        return false;
      }

      console.log('✅ [FCM] Token enregistré dans le backend');
    } catch (fetchError: any) {
      console.error('❌ [FCM] Erreur communication backend:', fetchError);
      
      // En mode dev, continuer quand même
      if (fcmToken.startsWith('dev-token-')) {
        console.warn('⚠️ [FCM] Mode dev - Pas d\'enregistrement backend');
        toast.info('Mode développement - Notifications locales uniquement');
      } else {
        toast.error('Erreur de connexion au serveur: ' + fetchError.message);
        return false;
      }
    }
    
    // 3. Sauvegarder dans localStorage (cache 7 jours)
    const registrationData = {
      registered: true,
      registeredAt: Date.now(),
      driverId,
      tokenPreview: fcmToken.substring(0, 20)
    };
    localStorage.setItem(`fcm_registered_${driverId}`, JSON.stringify(registrationData));

    toast.success('Notifications activées avec succès ! 🔔');

    // 4. Configurer l'écoute des notifications foreground
    setupDriverForegroundListener();

    return true;
  } catch (error: any) {
    console.error('❌ [FCM] Erreur enregistrement:', error);
    toast.error('Erreur: ' + (error.message || 'Activation des notifications impossible'));
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

    const modules = await loadFirebaseModules();
    if (!modules) return;

    console.log('👂 [FCM] Écoute des notifications foreground...');

    modules.onMessage(messagingInstance, (payload: any) => {
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
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZTA0OVqzn77BdGAg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBQ==');
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
