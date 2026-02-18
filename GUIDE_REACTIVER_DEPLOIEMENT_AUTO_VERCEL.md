# 🔄 RÉACTIVER LE DÉPLOIEMENT AUTOMATIQUE VERCEL

**Date:** 4 février 2026  
**Projet:** SmartCabb  
**Problème:** Vercel ne déploie plus automatiquement après les commits GitHub

---

## 📋 ÉTAPES DE RÉSOLUTION

### ÉTAPE 1: Vérifier les paramètres du projet Vercel

1. **Aller sur Vercel Dashboard**
   - URL: https://vercel.com/george-orly-isas-projects/smart-cabb
   - Cliquer sur votre projet "smart-cabb"

2. **Accéder aux Settings**
   - Cliquer sur l'onglet **"Settings"** (Paramètres)
   - Dans le menu de gauche, cliquer sur **"Git"**

3. **Vérifier la connexion Git**
   - Regarder si le repository GitHub est bien connecté
   - Vous devriez voir: `georgeorlyisas/smartcabb` ou similaire
   - Si "Disconnected" ou "Non connecté" apparaît → Passer à l'ÉTAPE 2

---

### ÉTAPE 2: Vérifier les branches de déploiement

**Dans Settings → Git:**

1. **Production Branch** (Branche de production)
   - Doit être: `main` ou `master`
   - Si vide ou incorrect, le corriger

2. **Ignored Build Step** (Étape de build ignorée)
   - Doit être vide ou désactivé
   - Si actif, cliquer sur "Edit" et désactiver

3. **Deploy Hooks** (Webhooks de déploiement)
   - Vérifier qu'aucun filtre n'est actif qui bloquerait les déploiements

---

### ÉTAPE 3: Reconnecter le repository GitHub

**Si la connexion Git est rompue:**

1. **Dans Settings → Git**
   - Cliquer sur **"Disconnect"** (si encore connecté partiellement)
   - Confirmer la déconnexion

2. **Reconnecter**
   - Cliquer sur **"Connect Git Repository"**
   - Sélectionner **"GitHub"**
   - Autoriser l'accès à votre compte GitHub
   - Sélectionner le repository **"smartcabb"**
   - Cliquer sur **"Connect"**

3. **Configurer les paramètres**
   - Production Branch: `main` (ou votre branche principale)
   - Cocher ✅ **"Automatically deploy new commits"**

---

### ÉTAPE 4: Vérifier les webhooks GitHub

**Sur GitHub.com:**

1. **Aller sur votre repository**
   - https://github.com/georgeorlyisas/smartcabb

2. **Accéder aux Settings du repository**
   - Cliquer sur **"Settings"** (en haut à droite)

3. **Vérifier les Webhooks**
   - Dans le menu de gauche, cliquer sur **"Webhooks"**
   - Vous devriez voir un webhook Vercel avec:
     - URL: `https://api.vercel.com/v1/integrations/deploy/...`
     - Content type: `application/json`
     - SSL verification: Activé ✅
     - Recent Deliveries: Des requêtes récentes avec statut 200

4. **Si le webhook Vercel est absent ou en erreur:**
   - Supprimer l'ancien webhook (si présent)
   - Retourner sur Vercel et reconnecter le repository (ÉTAPE 3)

---

### ÉTAPE 5: Vérifier les permissions GitHub

**Sur GitHub.com:**

1. **Aller dans vos Settings personnels**
   - Cliquer sur votre photo de profil → Settings

2. **Applications installées**
   - Dans le menu de gauche: **"Applications"** → **"Installed GitHub Apps"**
   - Chercher **"Vercel"**

3. **Vérifier les permissions Vercel**
   - Cliquer sur **"Configure"** à côté de Vercel
   - Vérifier que **"Repository access"** inclut bien "smartcabb"
   - Si nécessaire, sélectionner "All repositories" ou ajouter "smartcabb"
   - Cliquer sur **"Save"**

---

### ÉTAPE 6: Forcer un nouveau déploiement

**Après avoir tout configuré:**

1. **Option A: Depuis Vercel Dashboard**
   - Aller sur l'onglet **"Deployments"**
   - Cliquer sur le dernier déploiement
   - Cliquer sur les 3 points **"..."** → **"Redeploy"**
   - Confirmer

2. **Option B: Depuis GitHub**
   - Faire une petite modification (ex: ajouter un espace dans README.md)
   - Commit et push:
     ```bash
     git add .
     git commit -m "test: trigger vercel deployment"
     git push origin main
     ```
   - Attendre 10-20 secondes
   - Vérifier sur Vercel si un nouveau déploiement démarre

---

## 🔍 DIAGNOSTIC DES PROBLÈMES COURANTS

### ❌ Problème 1: "No new deployments"
**Cause:** Vercel ne reçoit pas les webhooks de GitHub  
**Solution:** 
- Vérifier l'ÉTAPE 4 (Webhooks GitHub)
- Reconnecter le repository (ÉTAPE 3)

### ❌ Problème 2: "Build failed" ou "Cancelled"
**Cause:** Erreurs de build ou conflits  
**Solution:**
- Vérifier les logs du dernier build
- Corriger les erreurs dans le code
- Push une nouvelle version

### ❌ Problème 3: "Skipped build"
**Cause:** Ignored Build Step activé  
**Solution:**
- Aller dans Settings → Git
- Désactiver "Ignored Build Step"

### ❌ Problème 4: "Missing permissions"
**Cause:** Vercel n'a pas accès au repository  
**Solution:**
- Vérifier l'ÉTAPE 5 (Permissions GitHub)
- Réautoriser Vercel

---

## ✅ TEST FINAL

Après avoir suivi les étapes:

1. **Créer un commit test:**
   ```bash
   # Modifier un fichier quelconque
   echo "# Test deploy" >> README.md
   git add README.md
   git commit -m "test: automatic deployment"
   git push origin main
   ```

2. **Vérifier sur Vercel:**
   - Aller sur https://vercel.com/george-orly-isas-projects/smart-cabb/deployments
   - Un nouveau déploiement devrait apparaître en quelques secondes
   - Statut: "Building..." puis "Ready"

3. **Si ça fonctionne:**
   - ✅ Déploiement automatique réactivé !
   - Vous pouvez continuer à travailler normalement

4. **Si ça ne fonctionne toujours pas:**
   - Contacter le support Vercel
   - Ou envisager de recréer le projet Vercel

---

## 🎯 RÉSUMÉ RAPIDE

**Checklist de vérification:**

- [ ] Repository GitHub bien connecté dans Vercel Settings → Git
- [ ] Production Branch = `main` (ou votre branche principale)
- [ ] "Automatically deploy new commits" activé ✅
- [ ] Webhook Vercel présent dans GitHub Settings → Webhooks
- [ ] Vercel app autorisée dans GitHub Settings → Applications
- [ ] Repository "smartcabb" accessible par Vercel
- [ ] Aucun "Ignored Build Step" activé
- [ ] Test de commit effectué et déploiement lancé

---

## 📞 SI PROBLÈME PERSISTE

**Option 1: Support Vercel**
- https://vercel.com/support
- Expliquer: "GitHub webhooks not triggering automatic deployments"

**Option 2: Recréer le projet**
- Supprimer le projet actuel sur Vercel
- Créer un nouveau projet
- Connecter le repository GitHub
- Reconfigurer les environment variables

---

**Version:** Guide v1.0  
**Date:** 4 février 2026  
**Statut:** Guide complet de dépannage
