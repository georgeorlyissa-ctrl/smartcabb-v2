/**
 * 🔥 SYSTÈME FCM POUR DRIVERS - SmartCabb
 * 
 * ⚠️ VERSION SÉCURISÉE : Aucune clé Firebase exposée
 * Toutes les opérations FCM passent par le backend
 * 
 * @version 3.0.0 - SÉCURISÉ
 * @date 2026-02-26
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from './toast';

/**
 * 📱 Enregistrer le token FCM via le backend
 * 
 * Le backend gère Firebase avec FIREBASE_SERVER_KEY (env variable)
 */
export async function registerDriverFCMToken(driverId: string): Promise<boolean> {
  try {
    console.log('📱 Demande d\'enregistrement FCM pour driver:', driverId);

    // Vérifier la permission des notifications
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications non supportées par ce navigateur');
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('⚠️ Permission notifications refusée par l\'utilisateur');
      toast.error('Notifications refusées. Activez-les dans les paramètres du navigateur.');
      return false;
    }

    console.log('✅ Permission notifications accordée');

    // ✅ APPEL BACKEND : Le backend gère Firebase avec les clés sécurisées
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/fcm-register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

    const result = await response.json();

    if (!result.success) {
      console.error('❌ Erreur backend FCM:', result.error);
      toast.error('Erreur activation notifications');
      return false;
    }

    console.log('✅ Token FCM enregistré:', result.tokenPreview);
    
    // Sauvegarder dans localStorage (cache 7 jours)
    const registrationData = {
      registered: true,
      registeredAt: Date.now(),
      driverId
    };
    localStorage.setItem(`fcm_registered_${driverId}`, JSON.stringify(registrationData));

    toast.success('Notifications activées ! Vous recevrez les demandes de course.');

    // Configurer l'écoute des notifications
    setupNotificationListener();

    return true;
  } catch (error) {
    console.error('❌ Erreur enregistrement FCM:', error);
    toast.error('Erreur activation notifications');
    return false;
  }
}

/**
 * 🔊 Écouter les notifications push (Service Worker)
 */
function setupNotificationListener() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker non supporté');
    return;
  }

  console.log('👂 Configuration écoute notifications...');

  // Écouter les messages du Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('📨 Message du Service Worker:', event.data);

    if (event.data?.type === 'RIDE_REQUEST') {
      const { title, body, rideId } = event.data;

      // Afficher un toast
      toast.success(`${title}\n${body}`, {
        duration: 15000,
        action: {
          label: 'Voir',
          onClick: () => {
            console.log('📍 Affichage demande:', rideId);
            // Le DriverDashboard écoute l'événement custom
            window.dispatchEvent(new CustomEvent('new-ride-request', {
              detail: { rideId }
            }));
          }
        }
      });

      // Son de notification
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZTA0OVqzn77BdGAg+ltryxnMpBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBSd8yvHajT0KFl237OeiUhELTKXh8bllHAU2jdXzzn0vBQ==');
        audio.play().catch(() => {});
      } catch (e) {
        // Son non disponible
      }

      // Émettre événement pour le Dashboard
      window.dispatchEvent(new CustomEvent('fcm-notification', {
        detail: event.data
      }));
    }
  });
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
      console.log('⏰ Enregistrement FCM expiré (> 7 jours)');
      localStorage.removeItem(`fcm_registered_${driverId}`);
      return false;
    }

    console.log('✅ FCM enregistré (il y a', Math.floor(age / 1000 / 60 / 60), 'heures)');
    return true;
  } catch (error) {
    console.error('❌ Erreur vérification cache FCM:', error);
    return false;
  }
}

/**
 * 🗑️ Désenregistrer FCM (déconnexion)
 */
export async function unregisterDriverFCMToken(driverId: string): Promise<boolean> {
  try {
    console.log('🗑️ Désenregistrement FCM driver:', driverId);

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/fcm-unregister`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log('✅ FCM désenregistré du backend');
    }

    // Supprimer du cache local
    localStorage.removeItem(`fcm_registered_${driverId}`);

    return true;
  } catch (error) {
    console.error('❌ Erreur désenregistrement FCM:', error);
    return false;
  }
}

/**
 * 🔄 Forcer le ré-enregistrement FCM
 */
export async function forceRefreshDriverFCMToken(driverId: string): Promise<boolean> {
  console.log('🔄 Force refresh FCM...');
  
  // Supprimer le cache
  localStorage.removeItem(`fcm_registered_${driverId}`);
  
  // Ré-enregistrer
  return await registerDriverFCMToken(driverId);
}
