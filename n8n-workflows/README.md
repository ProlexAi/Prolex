# 🔄 Synchronisation GitHub → n8n

Ce dossier contient les workflows n8n qui sont automatiquement synchronisés depuis GitHub vers votre instance n8n locale.

## 📋 Principe de fonctionnement

**GitHub est la source de vérité** : tous les workflows sont définis dans ce dossier et automatiquement déployés dans n8n.

Quand tu push sur la branche `main` :
1. GitHub envoie un webhook à n8n
2. Le workflow `GitHub to n8n Sync` détecte les fichiers modifiés dans `n8n-workflows/`
3. Pour chaque fichier `.json` :
   - **Ajouté** → créé dans n8n
   - **Modifié** → mis à jour dans n8n
   - **Supprimé** → désactivé dans n8n (pas supprimé)
4. Chaque action est loggée dans Google Sheets

---

## 📦 Workflows disponibles

| Fichier | Nom du workflow | Description | Documentation |
|---------|-----------------|-------------|---------------|
| `010_sync-github-to-n8n.json` | GitHub to n8n Sync | Synchronisation automatique des workflows depuis GitHub vers n8n | Voir ci-dessous |
| `020_example-hello-world.json` | Example Hello World | Exemple simple de workflow avec schedule quotidien | - |
| `030_github-dev-log-to-sheets.json` | GitHub Dev Log → Sheets | Enregistre automatiquement tous les commits dans Google Sheets pour créer un journal de développement | [GITHUB_DEV_LOG_SETUP.md](./GITHUB_DEV_LOG_SETUP.md) |

---

## 🚀 Configuration initiale (à faire UNE fois)

### Étape 1 : Préparer l'environnement n8n

1. **Démarrer n8n localement** :
   ```bash
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -e N8N_API_KEY=votre-cle-api-secrete \
     -e N8N_BASE_URL=http://localhost:5678 \
     -e WEBHOOK_URL=http://localhost:5678 \
     n8nio/n8n
   ```

2. **Générer une clé API n8n** :
   - Crée une clé API forte (ex: `n8n_api_key_xyz123abc456def789`)
   - Utilise cette clé dans la variable d'environnement `N8N_API_KEY`

3. **Vérifier l'accès** :
   - Ouvre http://localhost:5678 dans ton navigateur
   - Tu dois voir l'interface n8n

### Étape 2 : Importer le workflow de synchronisation

1. **Copier le workflow** :
   - Ouvre le fichier `n8n-workflows/010_sync-github-to-n8n.json`
   - Copie tout le contenu

2. **Importer dans n8n** :
   - Dans n8n, clique sur "Add workflow" → "Import from File"
   - Colle le contenu JSON
   - Clique sur "Import"

3. **Le workflow apparaît** : tu verras "GitHub to n8n Sync" dans ta liste

### Étape 3 : Configurer les credentials

Le workflow a besoin de 3 credentials :

#### A) **GitHub API**
1. Dans n8n, va dans **Settings** → **Credentials** → **New**
2. Cherche "GitHub"
3. Choisis **"GitHub API"**
4. Renseigne :
   - **Type** : Personal Access Token
   - **Access Token** : [Créer un token GitHub](https://github.com/settings/tokens/new)
     - Scopes requis : `repo` (full control of private repositories)
   - **Name** : `GitHub API`
5. Sauvegarde avec l'ID : `github-creds`

#### B) **Google Sheets OAuth2**
1. Dans n8n, va dans **Settings** → **Credentials** → **New**
2. Cherche "Google Sheets"
3. Choisis **"Google Sheets OAuth2 API"**
4. Suis le flow OAuth pour autoriser n8n à accéder à tes Google Sheets
5. Sauvegarde avec l'ID : `google-sheets-creds`

#### C) **Variables d'environnement n8n**
Assure-toi que ton instance n8n a ces variables :
```bash
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=votre-cle-api-secrete
```

### Étape 4 : Activer le webhook

1. **Ouvrir le workflow "GitHub to n8n Sync"**
2. **Cliquer sur le nœud "GitHub Push Webhook"**
3. **Copier l'URL du webhook** :
   - Format : `http://localhost:5678/webhook/github-sync`
   - ⚠️ **Important** : Si tu es en local, tu dois exposer ton URL avec ngrok ou un tunnel similaire

4. **Exposer le webhook localement (si nécessaire)** :
   ```bash
   # Installer ngrok si pas déjà fait
   brew install ngrok  # macOS
   # ou télécharger depuis https://ngrok.com/

   # Créer un tunnel vers ton n8n local
   ngrok http 5678

   # Copier l'URL publique (ex: https://abc123.ngrok.io)
   # L'URL du webhook devient : https://abc123.ngrok.io/webhook/github-sync
   ```

5. **Configurer le webhook GitHub** :
   - Va sur https://github.com/ProlexAi/Prolex/settings/hooks
   - Clique sur **"Add webhook"**
   - Renseigne :
     - **Payload URL** : `https://abc123.ngrok.io/webhook/github-sync` (ou ton URL publique)
     - **Content type** : `application/json`
     - **Secret** : (optionnel pour l'instant)
     - **Events** : Sélectionne "Just the push event"
     - **Active** : ✅
   - Clique sur **"Add webhook"**

6. **Activer le workflow dans n8n** :
   - Dans n8n, ouvre le workflow "GitHub to n8n Sync"
   - Clique sur **"Active"** (toggle en haut à droite)
   - Le workflow est maintenant en écoute !

### Étape 5 : Préparer Google Sheets

1. **Ouvrir la feuille de logs** :
   - URL : https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk/edit

2. **Vérifier l'onglet "events"** :
   - L'onglet doit exister
   - La ligne 1 doit contenir les en-têtes EXACTS :
     ```
     A: timestamp_utc
     B: repo
     C: branch
     D: commit_sha
     E: actor
     F: file_path
     G: change_type
     H: action_taken
     I: workflow_id
     J: workflow_name
     K: trigger_origin
     L: status
     M: error_message
     N: source_file_version
     ```

3. **Si l'onglet n'existe pas** :
   - Crée un nouvel onglet nommé `events`
   - Copie-colle la ligne d'en-têtes ci-dessus

---

## 🧪 Test pas à pas

Maintenant que tout est configuré, testons le système !

### Test 1 : Créer un nouveau workflow simple

1. **Créer un fichier de test** :
   ```bash
   cd /chemin/vers/Prolex
   ```

2. **Créer `n8n-workflows/020_test-workflow.json`** :
   ```json
   {
     "name": "Test Workflow",
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
         "id": "test-schedule",
         "name": "Every Hour",
         "type": "n8n-nodes-base.scheduleTrigger",
         "typeVersion": 1.2,
         "position": [240, 300]
       },
       {
         "parameters": {
           "mode": "raw",
           "jsonOutput": "{ \"message\": \"Hello from Test Workflow!\" }"
         },
         "id": "test-data",
         "name": "Return Data",
         "type": "n8n-nodes-base.set",
         "typeVersion": 3.4,
         "position": [460, 300]
       }
     ],
     "connections": {
       "Every Hour": {
         "main": [
           [
             {
               "node": "Return Data",
               "type": "main",
               "index": 0
             }
           ]
         ]
       }
     },
     "settings": {
       "executionOrder": "v1"
     }
   }
   ```

3. **Commit et push** :
   ```bash
   git add n8n-workflows/020_test-workflow.json
   git commit -m "test: add test workflow for sync"
   git push origin main
   ```

4. **Observer dans n8n** :
   - Va dans n8n → Workflows
   - Attends 2-3 secondes
   - Tu devrais voir apparaître **"Test Workflow"** !

5. **Vérifier Google Sheets** :
   - Ouvre la feuille de logs
   - Une nouvelle ligne doit apparaître avec :
     - `change_type` = `added`
     - `action_taken` = `create`
     - `status` = `success`
     - `workflow_name` = `Test Workflow`

### Test 2 : Modifier le workflow

1. **Modifier le fichier** :
   - Ouvre `n8n-workflows/020_test-workflow.json`
   - Change `"Hello from Test Workflow!"` en `"Updated message!"`

2. **Commit et push** :
   ```bash
   git add n8n-workflows/020_test-workflow.json
   git commit -m "test: update test workflow message"
   git push origin main
   ```

3. **Observer dans n8n** :
   - Ouvre le workflow "Test Workflow"
   - Vérifie que le message a changé

4. **Vérifier Google Sheets** :
   - Une nouvelle ligne avec :
     - `change_type` = `modified`
     - `action_taken` = `update`
     - `status` = `success`

### Test 3 : Supprimer le workflow

1. **Supprimer le fichier** :
   ```bash
   git rm n8n-workflows/020_test-workflow.json
   git commit -m "test: remove test workflow"
   git push origin main
   ```

2. **Observer dans n8n** :
   - Le workflow "Test Workflow" est maintenant **désactivé** (pas supprimé)
   - Il apparaît avec le toggle "Active" sur OFF

3. **Vérifier Google Sheets** :
   - Une nouvelle ligne avec :
     - `change_type` = `removed`
     - `action_taken` = `disable`
     - `status` = `success`

---

## 🐛 Dépannage

### Le workflow ne se déclenche pas

1. **Vérifier que le workflow "GitHub to n8n Sync" est actif** :
   - Dans n8n, vérifie que le toggle "Active" est ON

2. **Vérifier le webhook GitHub** :
   - Va sur https://github.com/ProlexAi/Prolex/settings/hooks
   - Clique sur ton webhook
   - Vérifie les "Recent Deliveries"
   - Si erreur 4xx/5xx, vérifie l'URL et que ngrok tourne

3. **Vérifier les logs n8n** :
   - Dans n8n, ouvre le workflow "GitHub to n8n Sync"
   - Clique sur "Executions" (barre latérale)
   - Tu verras l'historique des exécutions

### Erreur "N8N_API_KEY not configured"

- Assure-toi que la variable d'environnement `N8N_API_KEY` est définie dans ton instance n8n
- Redémarre n8n après avoir ajouté la variable

### Erreur Google Sheets

- Vérifie que les credentials Google Sheets sont bien configurées
- Vérifie que l'onglet `events` existe avec les bons en-têtes

### Erreur "Failed to create/update workflow"

- Vérifie que le JSON du workflow est valide
- Vérifie que le champ `name` existe et est unique
- Vérifie que les champs `nodes` et `connections` sont présents

---

## 📝 Conventions pour les fichiers JSON

### Structure minimale requise

Chaque fichier dans `n8n-workflows/*.json` doit contenir :

```json
{
  "name": "Nom Unique du Workflow",
  "nodes": [ /* ... */ ],
  "connections": { /* ... */ },
  "settings": {
    "executionOrder": "v1"
  }
}
```

### Règles de nommage

- **Nom du fichier** : `XXX_description-du-workflow.json`
  - `XXX` = numéro (ex: 010, 020, 030...) pour l'ordre
  - `description-du-workflow` = description en kebab-case
  - Exemple : `030_send-email-notifications.json`

- **Champ `name`** dans le JSON :
  - Doit être **unique** et **stable**
  - C'est la clé utilisée pour identifier le workflow dans n8n
  - Exemple : `"name": "Send Email Notifications"`

### Ne PAS inclure dans le JSON

- ❌ `id` au niveau racine (sera généré par n8n)
- ❌ `createdAt`, `updatedAt` (gérés par n8n)
- ❌ Données sensibles (tokens, passwords)

---

## 🔐 Sécurité

### Credentials

- **Ne JAMAIS commiter de tokens/passwords dans les workflows**
- Utilise les credentials n8n (référencées par ID)
- Utilise les variables d'environnement pour les secrets

### Webhook

- En production, active le "Secret" dans les webhooks GitHub
- Valide la signature dans le workflow n8n (ajout futur)

### API n8n

- Protège ta clé API `N8N_API_KEY`
- Ne l'expose jamais dans les commits ou logs

---

## 📚 Ressources

- [Documentation n8n](https://docs.n8n.io/)
- [API n8n](https://docs.n8n.io/api/)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

## 🆘 Support

En cas de problème :
1. Consulte les logs dans Google Sheets (colonne `error_message`)
2. Vérifie les exécutions dans n8n (onglet "Executions")
3. Vérifie les "Recent Deliveries" du webhook GitHub
4. Ouvre une issue sur le repo avec les détails de l'erreur

---

**Bon sync ! 🚀**
