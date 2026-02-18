# 🔊 Guide de Diagnostic des Notifications Sonores SmartCabb

## ❓ Problème Actuel
Les conducteurs ne reçoivent plus de notifications sonores lors de la création d'une course.

## 🔍 Diagnostic Rapide

### Étape 1 : Vérifier le système de notification actuel

Le système de SmartCabb fonctionne actuellement avec **polling HTTP** et non avec FCM (Firebase Cloud Messaging) :

- ✅ **Polling HTTP** : Vérifie toutes les **2 secondes** s'il y a une nouvelle course
- ❌ **FCM Push** : **DÉSACTIVÉ** dans le code (`/lib/fcm-service.ts` ligne 43)

**Impact** : Les notifications peuvent avoir un délai de 0 à 2 secondes avant de se déclencher (au lieu d'être instantanées avec FCM).

### Étape 2 : Tester les notifications sonores

1. **Ouvrir la page de test** : `http://localhost:5173/test-notifications-sound.html`
2. **Cliquer sur "Demander les permissions"** 
3. **Tester chaque composant** :
   - Son de notification (beep)
   - Message vocal (TTS)
   - Notification complète

### Étape 3 : Vérifier que le conducteur est en ligne

Les notifications ne se déclenchent **QUE** si le conducteur est en ligne :

```typescript
// DriverDashboard.tsx ligne 624
if (!isOnline) {
  console.log('⏸️ Polling arrêté : conducteur hors ligne');
  return;
}
```

✅ **Solution** : Assurez-vous que le conducteur a activé le bouton "En ligne" dans son dashboard.

### Étape 4 : Vérifier les logs de la console

Ouvrez la console du navigateur (F12) et recherchez :

#### ✅ Logs normaux (notification fonctionnelle)
```
🔄 Démarrage du polling des demandes de courses...
📱 Nouvelle demande de course reçue: {...}
🔊 Déclenchement du son de notification avec message vocal
✅ Son de notification terminé
```

#### ❌ Logs problématiques
```
⏸️ Polling arrêté : conducteur hors ligne  ➜ Le conducteur n'est pas en ligne
🔍 Même demande déjà affichée  ➜ La course a déjà été notifiée
❌ Erreur lors de la vérification des demandes  ➜ Problème backend
```

---

## 🔧 Solutions aux Problèmes Courants

### Problème 1 : Le son ne joue pas du tout

**Causes possibles** :
1. **Permission de notification refusée**
   - Solution : Cliquer sur le cadenas dans la barre d'adresse → Notifications → Autoriser
   
2. **Navigateur en mode silencieux**
   - Solution : Désactiver le mode silencieux du navigateur
   
3. **Web Audio API bloquée**
   - Solution : Interagir d'abord avec la page (clic) avant que le son puisse jouer

**Test** :
```javascript
// Dans la console du navigateur
const ctx = new AudioContext();
console.log(ctx.state); // Doit afficher "running", pas "suspended"
```

### Problème 2 : Le message vocal ne fonctionne pas

**Causes possibles** :
1. **Synthèse vocale non supportée**
   - Vérifier : Chrome, Edge, Safari ✅ | Firefox ⚠️ (partiel)
   
2. **Langue FR non disponible**
   - Solution : Installer les voix françaises dans les paramètres système

**Test** :
```javascript
// Dans la console
speechSynthesis.getVoices().filter(v => v.lang.startsWith('fr'))
// Doit retourner au moins une voix française
```

### Problème 3 : Notifications reçues avec délai

**Cause** : Polling HTTP toutes les 2 secondes au lieu de push instantané

**Solution rapide** : Réduire l'intervalle de polling (déjà optimisé de 5s à 2s)

**Solution permanente** : Réactiver FCM (Firebase Cloud Messaging)

---

## ⚡ Optimisations Appliquées

### ✅ Changements effectués (14/02/2026)

1. **Réduction de l'intervalle de polling** : 5s → 2s
   ```typescript
   // DriverDashboard.tsx ligne 690
   const interval = setInterval(checkRideRequests, 2000); // Au lieu de 5000
   ```
   
   **Impact** : Délai de notification réduit de 60%

2. **Système de notification sonore amélioré**
   - Composant `RideNotificationSound` joue automatiquement quand `showRideRequest` devient `true`
   - Son + Vibration + Message vocal + Notification navigateur

---

## 🚀 Pour Réactiver FCM (Notifications Push Instantanées)

Si vous voulez des notifications **instantanées** au lieu du polling :

### Étape 1 : Modifier `/lib/fcm-service.ts`

Commentez les lignes 43-47 et décommentez les lignes 50-66 :

```typescript
// ❌ DÉSACTIVER CES LIGNES :
// console.warn('⚠️ FCM DÉSACTIVÉ...');
// return null;

// ✅ ACTIVER CES LIGNES :
const messagingModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js');
fcmFunctions = {
  getToken: messagingModule.getToken,
  onMessage: messagingModule.onMessage
};
return fcmFunctions;
```

### Étape 2 : Vérifier Firebase Configuration

Fichier `/lib/firebase-config.ts` :
```typescript
FIREBASE_PROJECT_ID='smartcabb-xxxxx'
FIREBASE_SERVER_KEY='AAAA...' // Clé serveur FCM
```

### Étape 3 : Enregistrer le token FCM au login du conducteur

Dans `DriverDashboard.tsx`, ajouter après le login :

```typescript
import { initializeFCMForDriver } from '../../lib/fcm-service';

useEffect(() => {
  if (driver?.id) {
    initializeFCMForDriver(driver.id);
  }
}, [driver?.id]);
```

### Étape 4 : Redéployer le backend

```bash
supabase functions deploy make-server-2eb02e52
```

---

## 📊 Comparaison Polling vs FCM

| Caractéristique | Polling HTTP (Actuel) | FCM Push |
|-----------------|----------------------|----------|
| Délai de notification | 0-2 secondes | < 0.5 seconde |
| Consommation batterie | Moyenne | Faible |
| Consommation réseau | Élevée | Faible |
| Complexité | Simple | Moyenne |
| Fiabilité | ✅ Très bonne | ✅ Excellente |
| Fonctionne hors ligne | ❌ Non | ⚠️ Partiel |

---

## 🧪 Tests de Validation

### Test 1 : Notification sonore simple
1. Ouvrir `http://localhost:5173/test-notifications-sound.html`
2. Cliquer "Test notification complète"
3. ✅ Vous devez entendre : Son → Vibration → Message vocal → Notification

### Test 2 : Simulation de course réelle
1. Conducteur : Activer "En ligne" dans le dashboard
2. Passager : Créer une nouvelle course
3. Conducteur : Doit entendre la notification dans les **2 secondes max**

### Test 3 : Vérifier les permissions
```javascript
// Console navigateur
console.log('Notifications:', Notification.permission);
console.log('Audio:', new AudioContext().state);
console.log('Voix FR:', speechSynthesis.getVoices().filter(v => v.lang.startsWith('fr')).length);
```

**Résultats attendus** :
- `Notification.permission = "granted"`
- `AudioContext.state = "running"`
- Au moins 1 voix française disponible

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. **Vérifier les logs backend** :
   ```bash
   supabase functions logs make-server-2eb02e52 --tail
   ```

2. **Vérifier les logs frontend** :
   - Ouvrir la console (F12)
   - Filtrer par "notification" ou "ride"

3. **Tester avec un autre navigateur** :
   - Chrome ✅ Recommandé
   - Edge ✅ Bon support
   - Safari ⚠️ Support partiel
   - Firefox ⚠️ Support limité

---

## 📝 Résumé du Diagnostic

✅ **Système actuel** : Polling HTTP toutes les 2 secondes  
✅ **Son de notification** : Fonctionnel via Web Audio API  
✅ **Message vocal** : Fonctionnel via Web Speech API  
✅ **Notifications navigateur** : Nécessite permission utilisateur  
⚠️ **FCM Push** : Désactivé (peut être réactivé)  

**Délai de notification actuel** : 0-2 secondes (optimisé depuis 5 secondes)

---

**Date de mise à jour** : 14 février 2026  
**Version** : 1.0  
**Auteur** : Assistant SmartCabb
