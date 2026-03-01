/**
 * 🔥 SYSTÈME FCM POUR DRIVERS - SmartCabb
 * 
 * ⚠️ VERSION HYBRID : Client génère token + Backend envoie notifications
 * Config Firebase publique nécessaire pour Web Push (Safe)
 * 
 * @version 4.3.0 - PRODUCTION READY avec credentials correctes
 * @date 2026-03-01
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from './toast';

// Types Firebase
type Messaging = any;

// 🔥 CONFIG FIREBASE PUBLIQUE (Safe - nécessaire pour Web Push)
// Note: Cette config est publique et DOIT être côté client pour les notifications push
const firebaseConfig = {
  apiKey: "AIzaSyC0Kq6QgnfVna4bEWUj0J3VknU0ZHMAaWU",
  authDomain: "smartcabb-bed00.firebaseapp.com",
  projectId: "smartcabb-bed00",
  storageBucket: "smartcabb-bed00.firebasestorage.app",
  messagingSenderId: "855559530237",
  appId: "1:855559530237:web:5ea0fa4232bb08196f4094",
  measurementId: "G-8QY9ZYGC7B"
};

// VAPID Key publique (Safe - utilisée uniquement côté client)
const VAPID_KEY = "BDHm-w7od6Q7PP8y_vCv3TxuQiocDUyH3X6sg1zxQfm_KhCSFJnHtcVP4yekIOWUiJ6vHvO06yaXXnyp0i_1Muc";

// Instance Firebase (singleton)
let messaging: Messaging | null = null;
let firebaseModules: any = null;

/**
 * 📦 Charge les modules Firebase de manière dynamique
 */
async function loadFirebaseModules() {
  if (firebaseModules) {
    return firebaseModules;
  }

  // ⚠️ Ne pas charger pendant le build SSR
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    console.log('📦 Chargement des modules Firebase...');
    
    const [appModule, messagingModule] = await Promise.all([
      import('firebase/app').catch(() => null),
      import('firebase/messaging').catch(() => null)
    ]);

    if (!appModule || !messagingModule) {
      console.warn('⚠️ Modules Firebase non disponibles');
      return null;
    }

    firebaseModules = {
      initializeApp: appModule.initializeApp,
      getApps: appModule.getApps,
      getMessaging: messagingModule.getMessaging,
      getToken: messagingModule.getToken,
      onMessage: messagingModule.onMessage,
      isSupported: messagingModule.isSupported
    };

    console.log('✅ Modules Firebase chargés avec succès');
    return firebaseModules;
  } catch (error) {
    console.error('❌ Erreur chargement Firebase:', error);
    return null;
  }
}

/**
 * 🎯 Initialise Firebase Cloud Messaging
 */
export async function initializeFCM(): Promise<boolean> {
  try {
    // Vérifier le support du navigateur
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker non supporté');
      return false;
    }

    // Charger les modules
    const modules = await loadFirebaseModules();
    if (!modules) {
      console.warn('⚠️ Firebase non disponible');
      return false;
    }

    // Vérifier si FCM est supporté
    const supported = await modules.isSupported();
    if (!supported) {
      console.warn('⚠️ FCM non supporté par ce navigateur');
      return false;
    }

    // 🔍 LOG DE DÉBOGAGE : Vérifier la configuration
    console.log('🔑 Configuration Firebase:', {
      apiKey: firebaseConfig.apiKey.substring(0, 20) + '...',
      projectId: firebaseConfig.projectId,
      messagingSenderId: firebaseConfig.messagingSenderId
    });

    // Initialiser Firebase si nécessaire
    const apps = modules.getApps();
    let app;
    
    if (apps.length > 0) {
      app = apps[0];
      console.log('🔥 Firebase déjà initialisé');
    } else {
      app = modules.initializeApp(firebaseConfig);
      console.log('🔥 Firebase initialisé pour SmartCabb');
      console.log('   projectId:', firebaseConfig.projectId);
      console.log('   messagingSenderId:', firebaseConfig.messagingSenderId);
    }

    // Obtenir l'instance Messaging
    messaging = modules.getMessaging(app);
    console.log('🔔 Firebase Cloud Messaging (FCM) initialisé');

    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation FCM:', error);
    return false;
  }
}

/**
 * 🎫 Obtenir le token FCM
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    // Initialiser FCM si nécessaire
    if (!messaging) {
      const initialized = await initializeFCM();
      if (!initialized) {
        return null;
      }
    }

    // Vérifier les permissions
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Permission de notification refusée');
      toast('Veuillez autoriser les notifications pour recevoir les demandes de course', { type: 'warning' });
      return null;
    }

    // Obtenir le token
    const modules = await loadFirebaseModules();
    if (!modules || !messaging) {
      return null;
    }

    console.log('🎫 Demande de token FCM...');
    console.log('   VAPID Key:', VAPID_KEY.substring(0, 20) + '...');

    const token = await modules.getToken(messaging, {
      vapidKey: VAPID_KEY
    });

    if (token) {
      console.log('✅ Token FCM obtenu:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('⚠️ Aucun token FCM obtenu');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Erreur obtention token FCM:', error);
    
    // Messages d'erreur détaillés
    if (error?.code === 'messaging/permission-blocked') {
      toast('Les notifications sont bloquées. Veuillez les autoriser dans les paramètres du navigateur.', { type: 'error' });
    } else if (error?.message?.includes('API key not valid')) {
      console.error('❌ CLÉ API FIREBASE INVALIDE !');
      console.error('   Vérifiez que la clé API dans firebaseConfig correspond à Firebase Console');
    } else {
      toast('Erreur lors de l\'obtention du token de notification', { type: 'error' });
    }
    
    return null;
  }
}

/**
 * 📨 Sauvegarder le token FCM sur le serveur
 */
export async function saveFCMToken(userId: string, token: string): Promise<boolean> {
  try {
    console.log('💾 Sauvegarde du token FCM sur le serveur...');
    console.log('   User ID:', userId);
    console.log('   Token:', token.substring(0, 20) + '...');

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/fcm/save-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ userId, token })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur serveur lors de la sauvegarde du token:', error);
      return false;
    }

    const data = await response.json();
    console.log('✅ Token FCM sauvegardé sur le serveur:', data);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur sauvegarde token FCM:', error);
    return false;
  }
}

/**
 * 🔔 Écouter les messages FCM en foreground
 */
export async function listenToFCMMessages(onMessageReceived: (payload: any) => void): Promise<void> {
  try {
    // Initialiser FCM si nécessaire
    if (!messaging) {
      const initialized = await initializeFCM();
      if (!initialized) {
        return;
      }
    }

    const modules = await loadFirebaseModules();
    if (!modules || !messaging) {
      return;
    }

    console.log('👂 Écoute des messages FCM en foreground...');

    // Écouter les messages quand l'app est ouverte
    modules.onMessage(messaging, (payload: any) => {
      console.log('📨 Message FCM reçu (foreground):', payload);
      
      // Appeler le callback
      onMessageReceived(payload);

      // Afficher une notification locale
      if (payload.notification) {
        const { title, body, icon } = payload.notification;
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title || 'SmartCabb', {
            body: body || 'Nouvelle notification',
            icon: icon || '/logo.png',
            badge: '/logo.png',
            tag: 'smartcabb-notification',
            requireInteraction: true
          });
        }
      }
    });

    console.log('✅ Listener FCM activé');
  } catch (error) {
    console.error('❌ Erreur listener FCM:', error);
  }
}

/**
 * 🧪 Tester l'envoi d'une notification
 */
export async function testFCMNotification(userId: string): Promise<void> {
  try {
    console.log('🧪 Test d\'envoi de notification FCM...');

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/fcm/test-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ userId })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur test notification:', error);
      toast('Erreur lors du test de notification', { type: 'error' });
      return;
    }

    const data = await response.json();
    console.log('✅ Résultat du test:', data);
    toast('Notification de test envoyée ! Vérifiez votre appareil.', { type: 'success' });
  } catch (error) {
    console.error('❌ Erreur test FCM:', error);
    toast('Erreur lors du test de notification', { type: 'error' });
  }
}

/**
 * 🔍 Diagnostic FCM
 */
export async function diagnoseFCM(): Promise<{
  supported: boolean;
  permission: NotificationPermission | null;
  serviceWorker: boolean;
  firebaseInitialized: boolean;
  token: string | null;
  error: string | null;
}> {
  const result = {
    supported: false,
    permission: null as NotificationPermission | null,
    serviceWorker: false,
    firebaseInitialized: false,
    token: null as string | null,
    error: null as string | null
  };

  try {
    // Vérifier le support du navigateur
    if (typeof window === 'undefined') {
      result.error = 'Not in browser environment';
      return result;
    }

    // Vérifier Service Worker
    result.serviceWorker = 'serviceWorker' in navigator;
    if (!result.serviceWorker) {
      result.error = 'Service Worker not supported';
      return result;
    }

    // Vérifier les modules Firebase
    const modules = await loadFirebaseModules();
    if (!modules) {
      result.error = 'Firebase modules not available';
      return result;
    }

    // Vérifier le support de FCM
    result.supported = await modules.isSupported();
    if (!result.supported) {
      result.error = 'FCM not supported by browser';
      return result;
    }

    // Vérifier les permissions
    if ('Notification' in window) {
      result.permission = Notification.permission;
    }

    // Initialiser Firebase
    const initialized = await initializeFCM();
    result.firebaseInitialized = initialized;

    if (!initialized) {
      result.error = 'Failed to initialize Firebase';
      return result;
    }

    // Obtenir le token (si permissions accordées)
    if (result.permission === 'granted') {
      result.token = await getFCMToken();
    }

    return result;
  } catch (error: any) {
    result.error = error?.message || 'Unknown error';
    return result;
  }
}
