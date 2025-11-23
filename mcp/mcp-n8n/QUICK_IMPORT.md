# Import Rapide du Workflow de Maintenance

## 🚀 Import en 3 étapes

### Étape 1 : Configurer les credentials n8n

Éditez le fichier `.env` :

```bash
cd /home/user/Prolex/mcp/n8n-server
nano .env
```

Modifiez ces deux lignes :

```bash
N8N_BASE_URL=http://localhost:5678    # Remplacez par votre URL n8n
N8N_API_KEY=your-api-key-here         # Remplacez par votre clé API
```

**Comment obtenir votre clé API n8n :**
1. Ouvrez n8n dans votre navigateur
2. Allez dans **Settings** → **API**
3. Cliquez sur **Create API Key** ou copiez une clé existante
4. Collez la clé dans le fichier `.env`

### Étape 2 : Lancer l'import

```bash
cd /home/user/Prolex/mcp/n8n-server
./import-maintenance-workflow.sh
```

### Étape 3 : Vérifier dans n8n

1. Ouvrez n8n : http://localhost:5678 (ou votre URL)
2. Allez dans **Workflows**
3. Cherchez `050_daily_full_maintenance_prolex_v4`
4. Vérifiez que le workflow est **ACTIF** (toggle vert)

---

## 🔍 Vérification manuelle

### Voir le workflow dans n8n

```bash
curl -H "X-N8N-API-KEY: your-api-key" \
     http://localhost:5678/api/v1/workflows | jq '.data[] | select(.name | contains("maintenance"))'
```

### Tester le workflow manuellement (optionnel)

1. Ouvrez le workflow dans n8n
2. Cliquez sur **Execute Workflow**
3. Vérifiez les logs de chaque étape

### Voir le log de maintenance

```bash
cat /opt/Prolex/mcp/n8n-server/DAILY_MAINTENANCE_LOG.txt
```

---

## 📅 Planification

**Le workflow s'exécute automatiquement :**
- **Heure :** Tous les jours à **4h00 du matin**
- **Cron :** `0 4 * * *`
- **Timezone :** Heure locale du serveur

---

## 🛠️ En cas de problème

### Problème : "Cannot connect to n8n"

```bash
# Vérifiez que n8n est démarré
curl http://localhost:5678/healthz

# Si n8n n'est pas démarré, démarrez-le
pm2 list
pm2 start n8n
```

### Problème : "Invalid API key"

```bash
# Vérifiez votre clé API dans .env
cat .env | grep N8N_API_KEY

# Créez une nouvelle clé dans n8n → Settings → API
```

### Problème : "Workflow already exists"

C'est normal ! Le script met à jour le workflow existant automatiquement.

---

## 📁 Fichiers créés

```
/home/user/Prolex/
├── n8n-workflows/
│   └── 050_daily_full_maintenance_prolex_v4.json    # Workflow JSON
├── mcp/n8n-server/
│   ├── .env                                          # Configuration (à éditer)
│   ├── import-maintenance-workflow.sh                # Script d'import (exécutable)
│   ├── scripts/
│   │   ├── import-workflow-direct.ts                 # Import TypeScript
│   │   ├── import-maintenance-workflow.ts            # Import via MCP
│   │   └── IMPORT_README.md                          # Documentation détaillée
│   └── QUICK_IMPORT.md                               # Ce fichier
```

---

## 🎯 Maintenance effectuée quotidiennement

Le workflow effectue **automatiquement** :

1. ✅ `git fetch --all && git reset --hard origin/main`
2. ✅ `npm ci --only=production`
3. ✅ `npm run build`
4. ✅ `pm2 restart mcp-n8n-server --update-env`
5. ✅ `pm2 save`
6. ✅ `curl -f http://localhost:5678/health` (health check)
7. ✅ Écriture du log de maintenance avec timestamp

**Aucune intervention humaine requise !**
