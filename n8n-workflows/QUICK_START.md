# 🚀 Démarrage Rapide - GitHub → n8n Sync

Ce guide te permet de configurer la synchronisation en **15 minutes**.

---

## ✅ Checklist de configuration

### 1️⃣ Démarrer n8n (2 min)

```bash
# Avec Docker (recommandé)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_API_KEY=my-secret-api-key-change-me \
  -e N8N_BASE_URL=http://localhost:5678 \
  -e WEBHOOK_URL=http://localhost:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Ouvrir : http://localhost:5678
```

⚠️ **Change `my-secret-api-key-change-me` par une vraie clé sécurisée !**

---

### 2️⃣ Importer le workflow (3 min)

1. Dans n8n, clique sur **"Add workflow"**
2. Clique sur **"Import from File"** ou **"Import from URL"**
3. Colle le contenu de `010_sync-github-to-n8n.json`
4. Clique sur **"Import"**
5. Le workflow "GitHub to n8n Sync" apparaît

---

### 3️⃣ Configurer les credentials (5 min)

#### A) GitHub API

1. Va sur https://github.com/settings/tokens/new
2. Crée un token avec le scope `repo`
3. Copie le token
4. Dans n8n → **Settings** → **Credentials** → **New**
5. Choisis **"GitHub API"**
6. Colle le token
7. Nomme-le `GitHub API` (ID: `github-creds`)

#### B) Google Sheets

1. Dans n8n → **Settings** → **Credentials** → **New**
2. Choisis **"Google Sheets OAuth2 API"**
3. Suis le flow OAuth
4. Nomme-le `Google Sheets OAuth2` (ID: `google-sheets-creds`)

---

### 4️⃣ Exposer le webhook (3 min)

Si tu es **en local**, tu dois exposer n8n sur internet :

```bash
# Installer ngrok
brew install ngrok  # macOS
# ou télécharger : https://ngrok.com/download

# Créer un tunnel
ngrok http 5678

# Copier l'URL publique affichée (ex: https://abc123.ngrok.io)
```

Si tu es **en production** (serveur avec IP publique) :
- Utilise directement ton URL : `https://ton-domaine.com`

---

### 5️⃣ Configurer le webhook GitHub (2 min)

1. Va sur https://github.com/ProlexAi/Prolex/settings/hooks
2. Clique sur **"Add webhook"**
3. Renseigne :
   - **Payload URL** : `https://abc123.ngrok.io/webhook/github-sync`
   - **Content type** : `application/json`
   - **Events** : "Just the push event"
   - **Active** : ✅
4. Clique sur **"Add webhook"**

---

### 6️⃣ Activer le workflow (1 min)

1. Dans n8n, ouvre le workflow "GitHub to n8n Sync"
2. Clique sur **"Active"** (toggle en haut à droite)
3. ✅ Le workflow est maintenant en écoute !

---

## 🧪 Test rapide

### Créer un workflow de test

```bash
# Créer un nouveau fichier
cat > n8n-workflows/999_test.json << 'EOF'
{
  "name": "Test Sync",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 1
            }
          ]
        }
      },
      "id": "schedule",
      "name": "Every Hour",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 300]
    }
  ],
  "connections": {},
  "settings": {
    "executionOrder": "v1"
  }
}
EOF

# Commit et push
git add n8n-workflows/999_test.json
git commit -m "test: add test workflow"
git push origin main
```

### Vérifier que ça marche

1. **Dans n8n** : Le workflow "Test Sync" doit apparaître (attends 2-3 secondes)
2. **Dans Google Sheets** : Une ligne doit être ajoutée avec `status = success`

### Nettoyer

```bash
git rm n8n-workflows/999_test.json
git commit -m "test: remove test workflow"
git push origin main

# Le workflow sera désactivé dans n8n
```

---

## 🎯 C'est tout !

Tu es maintenant prêt à gérer tes workflows n8n depuis GitHub !

### Prochaines étapes

- Lis le [README complet](README.md) pour comprendre les détails
- Explore le workflow `020_example-hello-world.json` comme exemple
- Crée tes propres workflows dans `n8n-workflows/`

### En cas de problème

1. Vérifie les logs dans Google Sheets (colonne `error_message`)
2. Vérifie les exécutions dans n8n (onglet "Executions")
3. Vérifie le webhook GitHub (Recent Deliveries)

---

**Bon sync ! 🚀**
