# 📋 RÉSUMÉ CONFIGURATION NIVEAU 4 — Actions immédiates

**Date** : 22 novembre 2025
**Version** : Prolex v4.2
**Durée** : 15 minutes chrono

---

## 🚀 ACTIONS IMMÉDIATES (dans l'ordre)

### 1️⃣ Synchroniser tous les workflows vers n8n (2 min)

```bash
# Option A : Automatique via script (RECOMMANDÉ)
export N8N_API_KEY="ta_cle_api_n8n"
./scripts/sync-all-workflows-to-n8n.sh
```

**OU**

```bash
# Option B : Via webhook GitHub (automatique)
# Rien à faire, le workflow 010 se déclenche automatiquement
# Vérifier dans n8n → Workflows après 1-2 minutes
```

---

### 2️⃣ Obtenir ton ID Telegram (1 min)

1. Ouvrir Telegram
2. Rechercher : `@userinfobot`
3. Envoyer : `/start`
4. **Copier ton ID** (ex: `123456789`)

---

### 3️⃣ Créer bot Telegram Prolex (2 min)

1. Telegram → Rechercher : `@BotFather`
2. Envoyer : `/newbot`
3. Nom : `Prolex Automatt`
4. Username : `prolex_automatt_bot`
5. **Copier le Bot Token** (ex: `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`)

---

### 4️⃣ Configurer Telegram dans n8n (3 min)

1. Ouvrir n8n : http://localhost:5678
2. **Settings** → **Credentials** → **New**
3. Type : **Telegram**
4. Nom : `Telegram Automatt`
5. **Access Token** : coller le Bot Token
6. **Save**

---

### 5️⃣ Configurer workflow 005 (3 min)

1. n8n → **Workflows** → `005 - Alertes critiques seulement`
2. Ouvrir le workflow
3. Nœud **"Alerte Telegram Matthieu"** → cliquer
4. **Chat ID** : remplacer `123456789` par **ton vrai ID Telegram**
5. **Credentials** : sélectionner `Telegram Automatt`
6. **Save** (en haut à droite)
7. **Activer** le workflow (bouton "Inactive" → "Active")

---

### 6️⃣ Tester alerte critique (2 min)

```bash
# Test facture élevée (> 5000 €)
curl -X POST http://localhost:5678/webhook/critical-alert \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 7500,
    "client_id": "TEST",
    "message": "Test activation niveau 4",
    "workflow_id": "999"
  }'
```

**Résultat attendu** : Tu reçois une alerte Telegram dans les 5 secondes ✅

---

### 7️⃣ Vérifier workflows actifs dans n8n (2 min)

Ouvrir n8n → **Workflows** → Vérifier ces workflows sont **ACTIFS** :

| ID | Nom | Statut | Action si inactif |
|----|-----|--------|-------------------|
| **005** | **Alertes critiques seulement** | ✅ **ACTIF** | Cliquer "Inactive" → "Active" |
| **010** | GitHub to n8n Sync | ✅ **ACTIF** | Cliquer "Inactive" → "Active" |
| **012** | Prolex Git Pull | ✅ **ACTIF** | Cliquer "Inactive" → "Active" |
| **020** | Refresh RAG Embeddings | ✅ **ACTIF** | Cliquer "Inactive" → "Active" |
| **030** | GitHub Dev Log to Sheets | ✅ **ACTIF** | Cliquer "Inactive" → "Active" |
| **050** | Daily Full Maintenance | ✅ **ACTIF** | Cliquer "Inactive" → "Active" |

**À SUPPRIMER** :
- `600_20_HIGH_RISK_APPROVAL_EXAMPLE` → Contient "APPROVAL", obsolète pour niveau 4

---

## ⚙️ CONFIGURATIONS À VÉRIFIER

### Variables d'environnement à définir

```bash
# Dans ton terminal ou .bashrc/.zshrc
export N8N_API_KEY="ta_cle_api_n8n"
export N8N_BASE_URL="http://localhost:5678"
export TELEGRAM_BOT_TOKEN="ton_bot_token"
export TELEGRAM_CHAT_ID="ton_user_id"
```

### Credentials n8n à configurer

| Credential | Type | À configurer |
|------------|------|--------------|
| **Telegram Automatt** | Telegram | ✅ Bot Token (étape 3) |
| **Google Sheets Prolex** | Google Sheets | ⚠️ OAuth2 (si pas déjà fait) |
| **Google Drive RAG** | Google Drive | ⚠️ OAuth2 (si pas déjà fait) |
| **n8n API** | HTTP Header Auth | ⚠️ API Key (si pas déjà fait) |

---

## 📊 WORKFLOWS : STATUT ET CONFIGURATION

### Workflows CORE (essentiels, doivent être ACTIFS)

#### 005 - Alertes critiques seulement ⭐ **NOUVEAU**
- **Statut** : ✅ Doit être ACTIF
- **Config** :
  - Nœud "Alerte Telegram" → Chat ID = ton ID Telegram
  - Credentials Telegram = `Telegram Automatt`
- **Test** : Voir étape 6 ci-dessus

#### 010 - GitHub to n8n Sync
- **Statut** : ✅ Doit être ACTIF
- **Config** :
  - Webhook GitHub configuré dans Settings → Webhooks
  - URL : `https://n8n.automatt.ai/webhook/github-to-n8n`
- **Test** :
  ```bash
  curl -X POST http://localhost:5678/api/v1/workflows/010/execute \
    -H "X-N8N-API-KEY: $N8N_API_KEY"
  ```

#### 050 - Daily Full Maintenance
- **Statut** : ✅ Doit être ACTIF
- **Config** :
  - Cron : tous les jours à 3h du matin
  - SystemJournal logging actif
- **Test** : Vérifier dernière exécution dans n8n

---

### Workflows PRODUCTIVITÉ (utiles, activer si besoin)

#### 020 - Refresh RAG Embeddings
- **Statut** : ✅ Actif si tu utilises RAG
- **Config** :
  - Google Drive credentials configurés
  - AnythingLLM URL et API key
- **Test** :
  ```bash
  curl -X POST http://localhost:5678/api/v1/workflows/020/execute \
    -H "X-N8N-API-KEY: $N8N_API_KEY"
  ```

#### 030 - GitHub Dev Log to Sheets
- **Statut** : ✅ Actif si tu veux logs GitHub
- **Config** :
  - Google Sheets credentials
  - URL du spreadsheet SystemJournal
- **Test** : Push un commit sur GitHub, vérifier qu'il apparaît dans Sheets

---

### Workflows EXEMPLES (pas essentiels, peuvent rester inactifs)

#### 020 - Example Hello World
- **Statut** : ⚠️ Inactif (juste un exemple)
- **Action** : Laisser inactif ou supprimer

#### 020 - Proxy Master Exec EXAMPLE
- **Statut** : ⚠️ Inactif (juste un exemple)
- **Action** : Laisser inactif ou supprimer

---

### Workflows OBSOLÈTES (à supprimer)

#### 600_20_HIGH_RISK_APPROVAL_EXAMPLE ❌
- **Raison** : Contient "APPROVAL", incompatible niveau 4
- **Action** : **SUPPRIMER**
  ```bash
  # Via n8n UI
  # Ouvrir workflow → Delete

  # OU via API
  curl -X DELETE "http://localhost:5678/api/v1/workflows/600" \
    -H "X-N8N-API-KEY: $N8N_API_KEY"
  ```

#### 011 - GitHub to n8n Sync v1 ⚠️
- **Raison** : Ancienne version de 010
- **Action** : Désactiver ou supprimer (si 010 fonctionne bien)

---

## 🔐 SÉCURITÉS À VÉRIFIER

### Fichiers interdits de modification

Ces fichiers **ne doivent JAMAIS** être modifiés par Prolex :

```bash
# Vérifier les permissions (lecture seule pour Prolex)
chmod 600 infra/vps-prod/docker-compose.yml
chmod 600 .env
chmod 600 mcp/n8n-server/.env
chmod 600 config/system.yml
```

### Limites quotidiennes configurées

Dans `config/autonomy.yml` :

- **Factures clients** : max 50/jour
- **Backups** : max 10/jour
- **Recherches web** : max 200/jour
- **Workflows clients** : max 100/jour

**Pas de modification nécessaire** sauf si tu veux changer les limites.

---

## 🧪 TESTS DE VALIDATION

### Test 1 : Alerte facture élevée ✅

```bash
curl -X POST http://localhost:5678/webhook/critical-alert \
  -H "Content-Type: application/json" \
  -d '{"amount": 7500, "client_id": "TEST", "message": "Test niveau 4", "workflow_id": "999"}'
```

**Attendu** : Alerte Telegram avec montant 7500 €

---

### Test 2 : Alerte modification RAG ✅

```bash
curl -X POST http://localhost:5678/webhook/critical-alert \
  -H "Content-Type: application/json" \
  -d '{"path": "rag/rules/01_REGLES_PRINCIPALES.md", "message": "Test RAG", "workflow_id": "999"}'
```

**Attendu** : Alerte Telegram "MODIFICATION RÈGLES RAG"

---

### Test 3 : Alerte nouveau workflow ✅

```bash
curl -X POST http://localhost:5678/webhook/critical-alert \
  -H "Content-Type: application/json" \
  -d '{"newWorkflow": true, "workflow_name": "Test v4.2", "workflow_id": "777", "workflow_id": "999"}'
```

**Attendu** : Alerte Telegram "NOUVEAU WORKFLOW CRÉÉ"

---

### Test 4 : Silence pour action non-critique ✅

```bash
curl -X POST http://localhost:5678/webhook/critical-alert \
  -H "Content-Type: application/json" \
  -d '{"amount": 150, "client_id": "TEST", "message": "Petite facture", "workflow_id": "999"}'
```

**Attendu** : **AUCUNE** alerte Telegram (silence = normal ✅)

---

## 📞 DÉPANNAGE RAPIDE

### Problème : Aucune alerte Telegram reçue

**Solutions** :
1. Vérifier ID Telegram dans workflow 005 (étape 5)
2. Vérifier credentials Telegram dans n8n (étape 4)
3. Vérifier que le bot est démarré : Telegram → chercher ton bot → `/start`
4. Tester manuellement le nœud Telegram dans n8n (clic droit → "Execute node")

---

### Problème : Workflow 005 pas visible dans n8n

**Solutions** :
1. Exécuter le script de sync : `./scripts/sync-all-workflows-to-n8n.sh`
2. OU déclencher workflow 010 manuellement dans n8n
3. OU importer manuellement : n8n → Import → sélectionner `005_critical-alerts-only.json`

---

### Problème : Script sync échoue

**Solutions** :
1. Vérifier `N8N_API_KEY` est défini : `echo $N8N_API_KEY`
2. Vérifier n8n est accessible : `curl http://localhost:5678`
3. Vérifier API fonctionne :
   ```bash
   curl -H "X-N8N-API-KEY: $N8N_API_KEY" http://localhost:5678/api/v1/workflows
   ```

---

## ✅ CHECKLIST FINALE

Avant de valider que tout fonctionne :

- [ ] Script `sync-all-workflows-to-n8n.sh` exécuté avec succès
- [ ] ID Telegram obtenu et noté
- [ ] Bot Telegram créé et token sauvegardé
- [ ] Credentials Telegram configurés dans n8n
- [ ] Workflow 005 configuré (Chat ID + Credentials)
- [ ] Workflow 005 activé dans n8n
- [ ] Test alerte facture élevée → ✅ reçue
- [ ] Test alerte modification RAG → ✅ reçue
- [ ] Test alerte nouveau workflow → ✅ reçue
- [ ] Test silence facture normale → ✅ pas d'alerte
- [ ] Workflow 600 (APPROVAL) supprimé
- [ ] Workflows essentiels (010, 020, 030, 050) actifs
- [ ] SystemJournal logs présents
- [ ] Variables d'environnement définies

---

## 🎉 GO-LIVE

Une fois la checklist complète :

```bash
# 1. Commit et push la checklist
git add CONFIG_NIVEAU4_RESUME.md CHECKLIST_ACTIVATION_LEVEL4.md scripts/sync-all-workflows-to-n8n.sh
git commit -m "docs: add level 4 configuration checklists and sync script"
git push

# 2. Créer la Pull Request
# URL : https://github.com/ProlexAi/Prolex/pull/new/claude/prolex-major-updates-019Dd4zTmu7mD2LYirGBVZ1Y

# 3. Merger sur main

# 4. Prolex niveau 4 est actif ! 🚀
```

---

## 📊 MÉTRIQUES DE SUCCÈS (J+7)

Objectifs à vérifier après 1 semaine :

- **Notifications** : Passer de ~20/jour à ~2/jour
- **Temps gagné** : ~3h/jour libérées
- **Factures créées** : X factures auto sans validation
- **Workflows déployés** : Y workflows auto en prod
- **Incidents** : 0 action critique non désirée
- **Alertes pertinentes** : 100% des alertes légitimes

---

**Dernière mise à jour** : 22 novembre 2025
**Durée totale** : 15 minutes chrono ⏱️
**Auteur** : Matthieu via Claude Code
