/**
 * 🔥 DIAGNOSTIC FCM - SmartCabb
 * 
 * Composant de diagnostic pour tester Firebase Cloud Messaging
 * Affiche les informations de configuration et permet de tester l'enregistrement
 * 
 * @version 1.0.0
 * @date 2026-02-28
 */

import { useState, useEffect } from 'react';
import { toast } from '../../lib/toast';
import { 
  registerDriverFCMToken, 
  isDriverFCMTokenRegistered,
  forceRefreshDriverFCMToken 
} from '../../lib/fcm-driver';

interface FCMDiagnosticProps {
  driverId: string;
  driverName?: string;
}

export function FCMDiagnostic({ driverId, driverName }: FCMDiagnosticProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Ajouter un log
  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${emoji} ${message}`, ...prev].slice(0, 50));
    console.log(`[FCM Diagnostic] ${message}`);
  };

  // Vérifier l'état initial
  useEffect(() => {
    addLog('Initialisation du diagnostic FCM', 'info');
    
    // Vérifier le support des notifications
    if (!('Notification' in window)) {
      addLog('❌ Les notifications ne sont pas supportées par ce navigateur', 'error');
      return;
    }
    
    addLog(`Navigateur: ${navigator.userAgent}`, 'info');
    addLog(`Origine: ${window.location.origin}`, 'info');
    addLog(`Protocol: ${window.location.protocol}`, 'info');
    
    // Vérifier la permission
    const permission = Notification.permission;
    setNotificationPermission(permission);
    addLog(`Permission notifications: ${permission}`, permission === 'granted' ? 'success' : 'warning');
    
    // Vérifier si déjà enregistré
    const registered = isDriverFCMTokenRegistered(driverId);
    setIsRegistered(registered);
    addLog(
      registered 
        ? 'Token FCM déjà enregistré (cache local)' 
        : 'Aucun token FCM enregistré',
      registered ? 'success' : 'warning'
    );

    // Vérifier le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          addLog(`${registrations.length} Service Worker(s) enregistré(s)`, 'success');
          registrations.forEach((reg, i) => {
            addLog(`  SW ${i + 1}: ${reg.scope}`, 'info');
          });
        } else {
          addLog('Aucun Service Worker enregistré', 'warning');
        }
      });
    } else {
      addLog('Service Workers non supportés', 'error');
    }
  }, [driverId]);

  // Tester l'enregistrement FCM
  const handleTestRegistration = async () => {
    setIsLoading(true);
    addLog('🚀 Début du test d\'enregistrement FCM...', 'info');
    
    try {
      const success = await registerDriverFCMToken(driverId);
      
      if (success) {
        addLog('✅ Enregistrement FCM réussi !', 'success');
        setIsRegistered(true);
        toast.success('FCM activé avec succès ! 🎉');
      } else {
        addLog('❌ Échec de l\'enregistrement FCM', 'error');
        toast.error('Échec de l\'activation FCM');
      }
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`, 'error');
      toast.error('Erreur lors du test FCM');
    } finally {
      setIsLoading(false);
    }
  };

  // Forcer le rafraîchissement
  const handleForceRefresh = async () => {
    setIsLoading(true);
    addLog('🔄 Rafraîchissement forcé du token FCM...', 'info');
    
    try {
      const success = await forceRefreshDriverFCMToken(driverId);
      
      if (success) {
        addLog('✅ Token rafraîchi avec succès !', 'success');
        setIsRegistered(true);
        toast.success('Token FCM rafraîchi ! 🔄');
      } else {
        addLog('❌ Échec du rafraîchissement', 'error');
        toast.error('Échec du rafraîchissement');
      }
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`, 'error');
      toast.error('Erreur lors du rafraîchissement');
    } finally {
      setIsLoading(false);
    }
  };

  // Demander la permission
  const handleRequestPermission = async () => {
    addLog('📱 Demande de permission pour les notifications...', 'info');
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        addLog('✅ Permission accordée !', 'success');
        toast.success('Permission accordée ! Vous pouvez maintenant tester FCM');
      } else if (permission === 'denied') {
        addLog('❌ Permission refusée', 'error');
        toast.error('Permission refusée - Vérifiez les paramètres de votre navigateur');
      } else {
        addLog('⚠️ Permission ignorée', 'warning');
      }
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`, 'error');
    }
  };

  // Tester une notification locale
  const handleTestLocalNotification = () => {
    addLog('🔔 Test de notification locale...', 'info');
    
    if (Notification.permission !== 'granted') {
      addLog('❌ Permission non accordée', 'error');
      toast.error('Vous devez d\'abord accorder la permission');
      return;
    }
    
    try {
      new Notification('SmartCabb - Test FCM', {
        body: 'Ceci est une notification de test pour vérifier que tout fonctionne ! 🎉',
        icon: '/logo-smartcabb.png',
        badge: '/badge-smartcabb.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        tag: 'test-notification'
      });
      
      addLog('✅ Notification locale affichée', 'success');
      toast.success('Notification de test envoyée !');
    } catch (error: any) {
      addLog(`❌ Erreur notification: ${error.message}`, 'error');
      toast.error('Erreur lors de l\'affichage de la notification');
    }
  };

  // Effacer les logs
  const handleClearLogs = () => {
    setLogs([]);
    addLog('Logs effacés', 'info');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 max-h-96 overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            🔥 Diagnostic FCM
          </h3>
          <button
            onClick={handleClearLogs}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Effacer logs
          </button>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Conducteur</div>
            <div className="font-medium">{driverName || driverId.substring(0, 8)}</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Permission</div>
            <div className={`font-medium ${
              notificationPermission === 'granted' ? 'text-green-600' :
              notificationPermission === 'denied' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {notificationPermission === 'granted' ? '✅ Accordée' :
               notificationPermission === 'denied' ? '❌ Refusée' :
               '⚠️ En attente'}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Statut FCM</div>
            <div className={`font-medium ${isRegistered ? 'text-green-600' : 'text-gray-600'}`}>
              {isRegistered ? '✅ Enregistré' : '⚪ Non enregistré'}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Environnement</div>
            <div className="font-medium text-xs">
              {window.location.origin === 'null' ? '🧪 Dev (Figma)' : '🌐 Production'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium"
            >
              📱 Demander Permission
            </button>
          )}
          
          <button
            onClick={handleTestRegistration}
            disabled={isLoading || notificationPermission !== 'granted'}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 text-sm font-medium"
          >
            {isLoading ? '⏳ Test...' : '🔥 Tester FCM'}
          </button>
          
          <button
            onClick={handleForceRefresh}
            disabled={isLoading}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 text-sm font-medium"
          >
            🔄 Rafraîchir Token
          </button>
          
          <button
            onClick={handleTestLocalNotification}
            disabled={notificationPermission !== 'granted'}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 text-sm font-medium"
          >
            🔔 Test Notification
          </button>
        </div>

        {/* Logs */}
        <div className="bg-black text-green-400 p-3 rounded-lg font-mono text-xs max-h-48 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-4">Aucun log pour le moment</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
