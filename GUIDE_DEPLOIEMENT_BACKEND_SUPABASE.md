# 🚀 Guide de Déploiement du Backend SmartCabb sur Supabase

## 🔍 Diagnostic du Problème

**Problème identifié** : Le backend SmartCabb n'est pas déployé sur Supabase.

### Architecture actuelle

```
Frontend (Vercel) ✅
└── smartcabb.com
    └── Variables d'env configurées ✅

Backend (Supabase) ❌ NON DÉPLOYÉ
└── Edge Function manquante
    └── URL attendue : https://zaerjqchzqmcxqblkfkg.supabase.co/functions/v1/make-server-2eb02e52/*
```

### Pourquoi le backend est "down" ?

Lorsque vous avez :
1. ✅ Réinitialisé le repository GitHub
2. ✅ Créé un nouveau projet Vercel
3. ✅ Configuré les variables d'environnement Vercel

Vous avez **uniquement déployé le frontend**. Le backend (Supabase Edge Function) n'a jamais été déployé, donc toutes les requêtes API échouent avec "Failed to fetch".

---

## ⚠️ ÉTAPE CRITIQUE : Restructurer le Dossier Backend

**Actuellement** :
```
/supabase/functions/server/        ❌ Incorrect
├── index.tsx
├── admin-routes.tsx
├── driver-routes.tsx
└── ... (autres fichiers)
```

**Structure requise pour Supabase CLI** :
```
/supabase/functions/make-server-2eb02e52/    ✅ Correct
├── index.tsx
├── admin-routes.tsx
├── driver-routes.tsx
└── ... (autres fichiers)
```

### 1️⃣ Renommer le dossier

**Sur macOS/Linux** :
```bash
cd /chemin/vers/smartcabb
mv supabase/functions/server supabase/functions/make-server-2eb02e52
```

**Sur Windows (PowerShell)** :
```powershell
cd C:\chemin\vers\smartcabb
Rename-Item -Path "supabase\functions\server" -NewName "make-server-2eb02e52"
```

**Sur Windows (CMD)** :
```cmd
cd C:\chemin\vers\smartcabb
move supabase\functions\server supabase\functions\make-server-2eb02e52
```

---

## 🛠️ Installation de Supabase CLI

### macOS
```bash
brew install supabase/tap/supabase
```

### Windows (via Scoop)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Linux
```bash
brew install supabase/tap/supabase
```

### Alternative (NPM - toutes plateformes)
```bash
npm install -g supabase
```

### Vérifier l'installation
```bash
supabase --version
```

---

## 🔐 Authentification et Liaison du Projet

### 1️⃣ Se connecter à Supabase
```bash
cd /chemin/vers/smartcabb
supabase login
```

Cette commande ouvre votre navigateur pour l'authentification.

### 2️⃣ Lier le projet local à Supabase
```bash
supabase link --project-ref zaerjqchzqmcxqblkfkg
```

Si demandé, entrez votre **mot de passe de base de données**.

---

## 🚀 Déployer le Backend

### Déployer la fonction Edge
```bash
supabase functions deploy make-server-2eb02e52
```

### Sortie attendue
```
Deploying Function make-server-2eb02e52 (project ref: zaerjqchzqmcxqblkfkg)
✓ Deployed Function make-server-2eb02e52 in 3s
https://zaerjqchzqmcxqblkfkg.supabase.co/functions/v1/make-server-2eb02e52
```

---

## 🔑 Configurer les Variables d'Environnement (Secrets)

Le backend utilise des **secrets** Supabase (équivalent des variables d'environnement).

### Secrets requis pour SmartCabb

#### 1. **Africa's Talking (SMS)**
```bash
supabase secrets set AFRICAS_TALKING_USERNAME=votre_username
supabase secrets set AFRICAS_TALKING_API_KEY=votre_api_key
```

#### 2. **Flutterwave (Paiements Mobile Money)**
```bash
supabase secrets set FLUTTERWAVE_SECRET_KEY=votre_secret_key
```

#### 3. **SendGrid (Emails)**
```bash
supabase secrets set SENDGRID_API_KEY=votre_api_key
```

#### 4. **Google Maps (Géolocalisation serveur)**
```bash
supabase secrets set GOOGLE_MAPS_SERVER_API_KEY=votre_api_key
```

#### 5. **Mapbox (Cartes)**
```bash
supabase secrets set MAPBOX_API_KEY=votre_api_key
```

#### 6. **Firebase Cloud Messaging (Notifications Push)**
```bash
supabase secrets set FIREBASE_PROJECT_ID=votre_project_id
supabase secrets set FIREBASE_SERVER_KEY=votre_server_key
```

### Configurer tous les secrets en une fois

Créez un fichier `.env.supabase` à la racine du projet :

```bash
# .env.supabase - Secrets backend Supabase
AFRICAS_TALKING_USERNAME=votre_username
AFRICAS_TALKING_API_KEY=votre_api_key
FLUTTERWAVE_SECRET_KEY=votre_secret_key
SENDGRID_API_KEY=votre_api_key
GOOGLE_MAPS_SERVER_API_KEY=votre_api_key
MAPBOX_API_KEY=votre_api_key
FIREBASE_PROJECT_ID=votre_project_id
FIREBASE_SERVER_KEY=votre_server_key
```

Puis appliquez tous les secrets :

```bash
# Lire et appliquer tous les secrets
supabase secrets set --env-file .env.supabase
```

**⚠️ IMPORTANT** : Ajoutez `.env.supabase` à `.gitignore` pour ne pas exposer vos clés :

```bash
echo ".env.supabase" >> .gitignore
```

---

## ✅ Vérifier le Déploiement

### 1. Tester le endpoint Health Check
```bash
curl https://zaerjqchzqmcxqblkfkg.supabase.co/functions/v1/make-server-2eb02e52/health
```

**Réponse attendue** :
```json
{"status":"ok"}
```

### 2. Tester depuis le frontend

Ouvrez `https://smartcabb.com` et essayez de :
- ✅ Créer un compte admin
- ✅ Se connecter
- ✅ Accéder au dashboard

Les erreurs "Failed to fetch" devraient disparaître.

---

## 🔄 Redéployer Après Modifications

### Après avoir modifié le code backend

1. **Commit vos changements** :
```bash
git add supabase/functions/make-server-2eb02e52/
git commit -m "fix: update backend logic"
git push origin main
```

2. **Redéployer sur Supabase** :
```bash
supabase functions deploy make-server-2eb02e52
```

**Note** : Vercel redéploie automatiquement le frontend, mais **le backend doit être redéployé manuellement** via Supabase CLI.

---

## 🐛 Dépannage

### Erreur : "Function not found"

**Cause** : Le dossier n'a pas été renommé correctement.

**Solution** :
```bash
# Vérifier la structure
ls -la supabase/functions/

# Doit afficher :
# make-server-2eb02e52/
```

### Erreur : "Missing secrets"

**Cause** : Les secrets ne sont pas configurés sur Supabase.

**Solution** : Configurez les secrets comme indiqué dans la section "Configurer les Variables d'Environnement".

### Erreur : "Project not linked"

**Cause** : Le projet local n'est pas lié à Supabase.

**Solution** :
```bash
supabase link --project-ref zaerjqchzqmcxqblkfkg
```

### Erreur CORS

**Cause** : L'origine n'est pas autorisée dans le backend.

**Solution** : Vérifiez que `smartcabb.com` est dans la liste CORS dans `/supabase/functions/make-server-2eb02e52/index.tsx` :

```typescript
cors({
  origin: [
    "https://smartcabb.com", 
    "https://www.smartcabb.com", 
    "http://localhost:3000"
  ],
  // ...
})
```

---

## 📊 Architecture Complète après Déploiement

```
┌─────────────────────────────────────────────┐
│  Frontend (Vercel)                          │
│  https://smartcabb.com                      │
│                                             │
│  Variables d'env (VITE_*) configurées      │
└─────────────────┬───────────────────────────┘
                  │
                  │ fetch()
                  │
                  v
┌─────────────────────────────────────────────┐
│  Backend (Supabase Edge Function)           │
│  https://zaerjqchzqmcxqblkfkg.supabase.co  │
│  /functions/v1/make-server-2eb02e52/*      │
│                                             │
│  Secrets backend configurés                 │
└─────────────────┬───────────────────────────┘
                  │
                  │ SQL + RPC
                  │
                  v
┌─────────────────────────────────────────────┐
│  Database (Supabase PostgreSQL)             │
│  Table kv_store_2eb02e52                   │
│  Auth, Storage, Realtime                   │
└─────────────────────────────────────────────┘
```

---

## 🎯 Checklist Finale

Avant de considérer le backend comme "opérationnel" :

- [ ] Dossier renommé : `/supabase/functions/make-server-2eb02e52/`
- [ ] Supabase CLI installé et authentifié
- [ ] Projet lié : `supabase link --project-ref zaerjqchzqmcxqblkfkg`
- [ ] Backend déployé : `supabase functions deploy make-server-2eb02e52`
- [ ] Secrets configurés (au moins 8 variables)
- [ ] Health check répond : `curl .../health` → `{"status":"ok"}`
- [ ] Frontend peut créer un compte admin
- [ ] Frontend peut se connecter au dashboard

---

## 📞 Support

Si le backend ne fonctionne toujours pas après ces étapes :

1. **Vérifier les logs Supabase** :
   ```bash
   supabase functions logs make-server-2eb02e52
   ```

2. **Vérifier les secrets** :
   ```bash
   supabase secrets list
   ```

3. **Vérifier la configuration frontend** (variables VITE_*) dans Vercel

---

## 🔗 Ressources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Supabase Secrets Management](https://supabase.com/docs/guides/functions/secrets)

---

**Créé le** : 5 février 2026  
**Projet** : SmartCabb  
**Auteur** : Assistant IA Figma Make
