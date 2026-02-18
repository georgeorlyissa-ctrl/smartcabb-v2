# 📱 Guide d'Activation des Notifications FCM - Conducteurs

**Pour** : Conducteurs SmartCabb  
**Objectif** : Recevoir les notifications de course instantanément  
**Durée** : 2 minutes

---

## 🎯 Pourquoi Activer FCM ?

### Avantages

| Méthode | Délai | Coût | Fiabilité |
|---------|-------|------|-----------|
| **FCM (Recommandé)** | **0.5s** ⚡ | Gratuit | ⭐⭐⭐⭐⭐ |
| SMS | 5-10s | Payant | ⭐⭐⭐⭐☆ |
| Polling | 2-4s | Gratuit | ⭐⭐⭐⭐⭐ |

**FCM = Plus rapide + Gratuit + Plus de courses !** 🚀

---

## 📲 Étapes d'Activation

### Option 1 : App Mobile (Recommandé)

#### 1. Télécharger l'App

**Android** :
- Google Play Store → "SmartCabb Conducteur"
- Installer

**iOS** :
- App Store → "SmartCabb Conducteur"
- Installer

#### 2. Se Connecter

1. Ouvrir l'app
2. Entrer email + mot de passe
3. Cliquer "Connexion"

#### 3. Autoriser les Notifications

**Lors de la première connexion** :
```
[Popup]
"SmartCabb souhaite vous envoyer des notifications"
[Autoriser] [Ne pas autoriser]
```

✅ **Cliquer sur "Autoriser"**

**Si vous avez refusé par erreur** :

**Android** :
1. Paramètres → Apps → SmartCabb
2. Notifications → Activer

**iOS** :
1. Réglages → Notifications → SmartCabb
2. Autoriser les notifications → Activer

#### 4. Vérifier

1. Aller dans l'app SmartCabb
2. Dashboard → Profil
3. Vérifier "Notifications" = ✅ Activées

---

### Option 2 : App Web (Limitée)

**⚠️ Limitations** :
- Fonctionne seulement si navigateur ouvert
- Moins fiable que l'app mobile
- Pas de son en arrière-plan

**Activation** :

1. Ouvrir https://smartcabb.com/driver
2. Se connecter
3. Cliquer "Passer en ligne"
4. Autoriser les notifications quand demandé :
   ```
   [Popup navigateur]
   "smartcabb.com souhaite afficher des notifications"
   [Autoriser] [Bloquer]
   ```
5. Cliquer "Autoriser"

**Navigateurs supportés** :
- ✅ Chrome
- ✅ Firefox
- ✅ Edge
- ⚠️ Safari (limité)

---

## 🧪 Tester les Notifications

### Test Rapide

1. **Passer en ligne** dans l'app
2. **Demander à un collègue** de créer une course de test
3. **Vérifier** que vous recevez :
   - ✅ Notification visuelle
   - ✅ 3 beeps sonores
   - ✅ Message vocal

**Si ça fonctionne** → FCM activé ! 🎉

**Si rien ne se passe** → Voir "Dépannage" ci-dessous

---

## 🐛 Dépannage

### Problème 1 : Pas de Notification

**Vérifications** :

- [ ] **App installée** et **ouverte**
- [ ] **Connecté** avec votre compte
- [ ] **En ligne** (switch activé)
- [ ] **Notifications autorisées** dans les paramètres
- [ ] **Volume du téléphone** non silencieux
- [ ] **Batterie** non en mode économie d'énergie

**Solution** :
1. Fermer complètement l'app
2. Rouvrir
3. Se reconnecter
4. Repasser en ligne

---

### Problème 2 : Notification Mais Pas de Son

**Vérifications** :

- [ ] Volume téléphone au maximum
- [ ] Pas en mode silencieux
- [ ] Son activé dans SmartCabb → Paramètres → Son

**Solution** :
```
App SmartCabb → Menu → Paramètres → Sons
✅ Activer "Son de notification"
```

---

### Problème 3 : Token Non Enregistré

**Symptôme** : Logs backend montrent "Pas de token FCM"

**Solution** :
1. Se déconnecter de l'app
2. Se reconnecter
3. Autoriser à nouveau les notifications
4. Vérifier avec un admin que le token est enregistré

**Commande admin** :
```bash
# Vérifier le token FCM d'un conducteur
supabase functions logs make-server-2eb02e52 | grep "Token FCM" | grep "CONDUCTEUR_ID"
```

---

## 📊 Vérification Admin

### Voir les Conducteurs Sans FCM

```bash
supabase functions logs make-server-2eb02e52 | grep "Pas de token FCM"
```

**Résultat** :
```
⚠️ Pas de token FCM pour ce conducteur: Jean Mukendi (ID: abc123)
⚠️ Pas de token FCM pour ce conducteur: Marie Kabila (ID: def456)
```

**Action** :
1. Contacter Jean et Marie
2. Les guider avec ce document
3. Vérifier à nouveau après activation

---

## ✅ Checklist Conducteur

Avant de commencer votre journée :

- [ ] App SmartCabb installée
- [ ] Notifications autorisées
- [ ] Connecté à mon compte
- [ ] Volume du téléphone au maximum
- [ ] Test notification réussi
- [ ] Prêt à recevoir des courses ! 🚗

---

## 💡 Conseils

### Pour Maximiser les Courses

1. **Garder l'app ouverte** quand en ligne
2. **Activer le son** pour ne pas manquer
3. **Charger le téléphone** (batterie > 20%)
4. **GPS activé** en permanence
5. **Connexion internet** stable (4G/Wi-Fi)

### Économiser la Batterie

**Si l'app consomme trop** :

1. Paramètres → Économie d'énergie → Désactiver pour SmartCabb
2. Autoriser l'app en arrière-plan
3. Désactiver les animations (Paramètres app)

---

## 📞 Support

**Problème persistant ?**

1. **Email** : support@smartcabb.com
2. **Téléphone** : +243 XXX XXX XXX
3. **WhatsApp** : +243 XXX XXX XXX
4. **App** : Menu → Aide → Contacter le support

**Infos à fournir** :
- Votre nom complet
- Numéro de téléphone
- Type de téléphone (Android/iOS)
- Description du problème
- Capture d'écran si possible

---

## 🎯 Résumé

**3 étapes simples** :

1. 📲 **Installer** l'app SmartCabb Conducteur
2. 🔔 **Autoriser** les notifications
3. ✅ **Tester** avec une course

**Résultat** :
- ⚡ Notifications **instantanées** (0.5s)
- 🔊 Son **fort et clair** (3 beeps)
- 💰 Plus de courses = Plus de gains !

---

**Temps total** : 2 minutes  
**Difficulté** : ⭐☆☆☆☆ (Très facile)  
**Impact** : +50% de courses reçues ! 📈

**Bonne route avec SmartCabb !** 🚗💨
