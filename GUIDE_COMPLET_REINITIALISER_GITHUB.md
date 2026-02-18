# 🔄 GUIDE COMPLET - RÉINITIALISER GITHUB ET DÉPLOYER

**Date:** 4 février 2026  
**Projet:** SmartCabb v518.3.0  
**Objectif:** Supprimer et recréer le repository GitHub, puis tester le déploiement automatique Vercel

---

## 📋 ÉTAPES COMPLÈTES

### ÉTAPE 1: Créer la structure locale du projet

**Sur votre ordinateur (Windows):**

1. **Créer un dossier pour le projet**
   ```
   Ouvrir l'Explorateur Windows
   Aller dans: C:\Users\VotreNom\Documents\
   Créer un nouveau dossier: "smartcabb"
   ```

2. **Créer la structure de dossiers**
   
   Dans le dossier `smartcabb`, créer ces dossiers:
   ```
   smartcabb/
   ├── components/
   │   ├── admin/
   │   ├── auth/
   │   ├── debug/
   │   ├── driver/
   │   ├── figma/
   │   ├── icons/
   │   ├── passenger/
   │   ├── shared/
   │   ├── test/
   │   └── ui/
   ├── contexts/
   ├── docs/
   ├── guidelines/
   ├── hooks/
   ├── lib/
   │   └── payment-providers/
   ├── pages/
   ├── public/
   ├── scripts/
   ├── styles/
   ├── supabase/
   │   └── functions/
   │       └── server/
   ├── types/
   ├── utils/
   │   └── supabase/
   └── website/
       ├── css/
       ├── images/
       └── js/
   ```

---

### ÉTAPE 2: Copier TOUS les fichiers depuis Figma Make

**JE VAIS VOUS FOURNIR UN FICHIER ZIP/SCRIPT POUR TÉLÉCHARGER TOUT**

Puisqu'il y a plus de 500 fichiers, je vais créer un fichier qui liste TOUS les chemins:

---

### OPTION SIMPLIFIÉE: Utiliser Git Clone (RECOMMANDÉ)

**C'est plus simple que de tout copier manuellement !**

#### A. Cloner le repository existant

1. **Installer Git** (si pas déjà fait)
   - Télécharger: https://git-scm.com/download/win
   - Installer avec les options par défaut

2. **Ouvrir Git Bash** (ou PowerShell)
   ```bash
   cd C:\Users\VotreNom\Documents
   git clone https://github.com/georgeorlyisas/smartcabb.git
   cd smartcabb
   ```

3. **Vous avez maintenant TOUT le projet en local !**

#### B. Supprimer le repository en ligne

1. **Aller sur GitHub**
   - https://github.com/georgeorlyisas/smartcabb

2. **Supprimer le repository**
   - Cliquer sur **"Settings"** (en haut à droite)
   - Descendre en bas jusqu'à **"Danger Zone"**
   - Cliquer sur **"Delete this repository"**
   - Taper: `georgeorlyisas/smartcabb` pour confirmer
   - Cliquer sur **"I understand the consequences, delete this repository"**

#### C. Recréer le repository vide

1. **Sur GitHub, créer un nouveau repository**
   - Aller sur: https://github.com/new
   - Repository name: `smartcabb`
   - Description: "SmartCabb - Application de transport pour la RDC"
   - **PUBLIC** ou **PRIVATE** (votre choix)
   - **NE PAS cocher** "Add a README file"
   - **NE PAS cocher** "Add .gitignore"
   - **NE PAS cocher** "Choose a license"
   - Cliquer sur **"Create repository"**

2. **Copier l'URL du repository**
   - Exemple: `https://github.com/georgeorlyisas/smartcabb.git`

#### D. Push le projet vers le nouveau repository

1. **Dans Git Bash, dans le dossier smartcabb:**

   ```bash
   # Supprimer l'ancien remote
   git remote remove origin
   
   # Ajouter le nouveau remote (remplacer par votre URL)
   git remote add origin https://github.com/georgeorlyisas/smartcabb.git
   
   # Vérifier le statut
   git status
   
   # Ajouter tous les fichiers
   git add .
   
   # Commit avec message
   git commit -m "feat: réinitialisation complète du projet SmartCabb v518.3.0"
   
   # Push vers GitHub
   git push -u origin main
   ```

2. **Si vous avez une erreur "main" n'existe pas:**
   ```bash
   # Créer la branche main
   git branch -M main
   
   # Puis push
   git push -u origin main
   ```

3. **Entrer vos identifiants GitHub** quand demandé

---

### ÉTAPE 3: Vérifier que tout est sur GitHub

1. **Aller sur GitHub**
   - https://github.com/georgeorlyisas/smartcabb

2. **Vérifier que vous voyez:**
   - ✅ Tous les dossiers (components, pages, supabase, etc.)
   - ✅ Les fichiers (package.json, vite.config.ts, etc.)
   - ✅ Le dernier commit: "feat: réinitialisation complète..."

---

### ÉTAPE 4: Reconnecter Vercel au nouveau repository

1. **Aller sur Vercel**
   - https://vercel.com/george-orly-isas-projects

2. **Supprimer l'ancien projet (optionnel)**
   - Cliquer sur le projet "smart-cabb"
   - Settings → General
   - En bas: "Delete Project"
   - Confirmer

3. **Créer un nouveau projet**
   - Cliquer sur **"Add New..." → "Project"**
   - Sélectionner **"Import Git Repository"**
   - Chercher et sélectionner: **"smartcabb"**
   - Cliquer sur **"Import"**

4. **Configurer le projet**
   
   **Framework Preset:** Vite
   
   **Build Settings:**
   - Build Command: `npm run build` (laisser par défaut)
   - Output Directory: `dist` (laisser par défaut)
   - Install Command: `npm install` (laisser par défaut)
   
   **Root Directory:** `./` (laisser par défaut)

5. **Ajouter les Environment Variables**
   
   Cliquer sur **"Environment Variables"** et ajouter:
   
   ```
   SUPABASE_URL = votre_url_supabase
   SUPABASE_ANON_KEY = votre_anon_key
   SUPABASE_SERVICE_ROLE_KEY = votre_service_role_key
   SUPABASE_DB_URL = votre_db_url
   FLUTTERWAVE_SECRET_KEY = votre_flutterwave_key
   AFRICAS_TALKING_API_KEY = votre_africas_talking_key
   AFRICAS_TALKING_USERNAME = votre_username
   SENDGRID_API_KEY = votre_sendgrid_key
   MAPBOX_API_KEY = votre_mapbox_key
   GOOGLE_PLACES_API_KEY = votre_google_key
   FIREBASE_PROJECT_ID = votre_firebase_project_id
   FIREBASE_SERVER_KEY = votre_firebase_server_key
   GOOGLE_MAPS_API_KEY = votre_google_maps_key
   GOOGLE_MAPS_SERVER_API_KEY = votre_google_maps_server_key
   ```

6. **Cliquer sur "Deploy"**
   
   Vercel va:
   - Installer les dépendances
   - Builder le projet
   - Déployer sur smartcabb.com (ou smartcabb.vercel.app)

---

### ÉTAPE 5: Tester le déploiement automatique

1. **Faire une modification test**
   
   Sur votre ordinateur, ouvrir: `smartcabb/README.md`
   
   Ajouter une ligne:
   ```
   ## Test déploiement automatique
   Cette ligne a été ajoutée le 4 février 2026 pour tester le déploiement auto.
   ```

2. **Commit et push**
   
   Dans Git Bash:
   ```bash
   git add README.md
   git commit -m "test: déploiement automatique"
   git push origin main
   ```

3. **Vérifier sur Vercel**
   - Aller sur: https://vercel.com/george-orly-isas-projects/smartcabb/deployments
   - Un nouveau déploiement devrait apparaître en **10-20 secondes**
   - Statut: "Building..." puis "Ready"

4. **Si ça fonctionne:**
   - ✅ **SUCCÈS !** Le déploiement automatique est réactivé !
   - Chaque fois que vous faites un `git push`, Vercel déploiera automatiquement

---

## 🎯 RÉSUMÉ DES COMMANDES

```bash
# 1. Cloner l'ancien repository
git clone https://github.com/georgeorlyisas/smartcabb.git
cd smartcabb

# 2. Supprimer le repository sur GitHub.com (via l'interface web)

# 3. Recréer le repository vide sur GitHub.com (via l'interface web)

# 4. Reconfigurer Git local
git remote remove origin
git remote add origin https://github.com/georgeorlyisas/smartcabb.git

# 5. Push vers le nouveau repository
git add .
git commit -m "feat: réinitialisation complète du projet SmartCabb v518.3.0"
git branch -M main
git push -u origin main

# 6. Tester le déploiement automatique
echo "## Test" >> README.md
git add README.md
git commit -m "test: déploiement automatique"
git push origin main
```

---

## ✅ CHECKLIST FINALE

Après avoir terminé:

- [ ] Repository GitHub supprimé et recréé
- [ ] Projet cloné en local
- [ ] Nouveau repository connecté
- [ ] Code pushé sur GitHub
- [ ] Tous les fichiers visibles sur GitHub
- [ ] Projet Vercel créé et connecté
- [ ] Environment variables configurées
- [ ] Premier déploiement réussi
- [ ] Test de commit effectué
- [ ] Déploiement automatique confirmé ✅

---

## 🚨 EN CAS DE PROBLÈME

### Erreur: "Authentication failed"
**Solution:** Configurer un Personal Access Token
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Cocher "repo"
3. Utiliser ce token comme mot de passe lors du push

### Erreur: "Permission denied"
**Solution:** Vérifier que vous êtes propriétaire du repository

### Erreur: "Build failed" sur Vercel
**Solution:** Vérifier les logs de build et s'assurer que toutes les variables d'environnement sont configurées

---

**Version:** Guide v1.0  
**Date:** 4 février 2026  
**Statut:** Guide complet de réinitialisation
