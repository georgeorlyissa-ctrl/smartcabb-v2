# 🚀 Guide de Test Rapide - SmartCabb v3.0

**Date** : 15 février 2026

---

## ⚡ Test en 5 Minutes

### 1️⃣ Tester le Son (1 minute)

```bash
# Ouvrir dans le navigateur
open test-notification-sound-v2.html
```

**Actions** :
1. Cliquer sur **"Tester le Beep"**
2. Vous devez entendre **3 beeps forts** espacés de 800ms
3. ✅ Si vous entendez → Son fonctionne !
4. ❌ Si silence → Vérifier le volume de l'appareil

---

### 2️⃣ Redéployer le Backend (2 minutes)

```bash
# Depuis la racine du projet
supabase functions deploy make-server-2eb02e52
```

**Résultat attendu** :
```
✓ Deploying Function make-server-2eb02e52
✓ Function deployed successfully
```

---

### 3️⃣ Tester le Retry avec 1 Conducteur (2 minutes)

**Configuration** :
- 1 seul conducteur connecté et **en ligne**

**Procédure** :
1. **Passager** : Créer une course
2. **Conducteur** : NE PAS répondre pendant 15s
3. **Observer** : Nouvelle notification après 5s
4. **Conducteur** : NE PAS répondre encore 15s
5. **Observer** : Nouvelle notification après 5s
6. **Conducteur** : Accepter la 3ème notification

**Logs à vérifier** :
```bash
supabase functions logs make-server-2eb02e52 --tail
```

Rechercher :
```
🔄 RETRY AUTOMATIQUE (1/3)
🔄 RETRY AUTOMATIQUE (2/3)
✅ COURSE ACCEPTÉE
```

---

## 🔍 Diagnostic Rapide

### Son Pas Audible ?

**Checklist** :
- [ ] Volume de l'appareil au maximum
- [ ] Pas en mode silencieux
- [ ] Permissions notifications accordées
- [ ] Test dans Chrome/Firefox (pas Safari si problème)

**Solution rapide** :
```html
<!-- Ouvrir test-notification-sound-v2.html -->
<!-- Cliquer sur "Vérifier les Permissions" -->
```

---

### Retry Ne Fonctionne Pas ?

**Vérification** :
```bash
# Logs backend
supabase functions logs make-server-2eb02e52 | grep "RETRY"
```

**Si aucun log "RETRY"** :
- ✅ Vérifier qu'il n'y a qu'**1 seul conducteur** en ligne
- ✅ Vérifier que le conducteur **n'a pas refusé** la course
- ✅ Vérifier le backend déployé : `supabase functions deploy make-server-2eb02e52`

---

## 📊 Tableau de Validation Rapide

| Test | Attendu | Résultat |
|------|---------|----------|
| 🔊 Beep audible (3x) | Oui | ⬜ |
| 🔄 Retry (1 conducteur) | Oui | ⬜ |
| 🚫 Pas de retry (3+ conducteurs) | Non | ⬜ |
| 📱 Notification visuelle | Oui | ⬜ |
| 🗣️ Message vocal | Oui | ⬜ |

---

## 🆘 Aide Rapide

### Problème : "Aucune notification reçue"

1. **Vérifier que le conducteur est EN LIGNE** :
   ```
   Dashboard Conducteur → Switch "En ligne" = ON
   ```

2. **Vérifier le polling** :
   ```
   Console navigateur (F12) → Rechercher "📱 Nouvelle demande"
   ```

3. **Vérifier le backend** :
   ```bash
   supabase functions logs make-server-2eb02e52 | grep "Envoi notification"
   ```

---

### Problème : "Course marquée no_drivers immédiatement"

**Cause** : Pas de conducteur éligible

**Vérification** :
```bash
supabase functions logs make-server-2eb02e52 | grep "éligible"
```

**Logs possibles** :
```
⏭️ Jean Mukendi: HORS LIGNE
⏭️ Marie Kabila: mauvaise catégorie
⏭️ Pierre: PAS DE GPS
❌ Aucun conducteur éligible trouvé
```

**Solution** :
- Mettre au moins 1 conducteur **en ligne**
- Vérifier la **catégorie de véhicule** (standard/confort/premium)
- Vérifier que le **GPS est activé**

---

## 🎯 Commandes Utiles

```bash
# Voir les logs backend en temps réel
supabase functions logs make-server-2eb02e52 --tail

# Filtrer les logs de matching
supabase functions logs make-server-2eb02e52 | grep "MATCHING"

# Filtrer les logs de retry
supabase functions logs make-server-2eb02e52 | grep "RETRY"

# Voir les erreurs uniquement
supabase functions logs make-server-2eb02e52 | grep "❌"

# Redéployer le backend
supabase functions deploy make-server-2eb02e52

# Pousser le frontend sur Vercel (via GitHub)
git add .
git commit -m "Update"
git push origin main
```

---

## ✅ Test Réussi Si...

1. ✅ **Son** : 3 beeps forts audibles
2. ✅ **Retry** : Conducteur reçoit 3 notifications (1 conducteur seul)
3. ✅ **Séquentiel** : Conducteurs reçoivent 1 par 1 (plusieurs conducteurs)
4. ✅ **Acceptation** : Course passe en statut "accepted"
5. ✅ **Timeout** : Passage au suivant après 15s

---

**Durée totale** : ~5 minutes  
**Prérequis** : Supabase CLI installé, accès au projet

**Documentation complète** : `/CORRECTIONS_NOTIFICATION_ET_RETRY.md`
