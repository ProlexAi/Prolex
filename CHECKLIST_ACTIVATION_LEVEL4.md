# 📋 CHECKLIST COMPLÈTE — Activation Prolex Niveau 4

**Date** : 22 novembre 2025
**Version** : Prolex v4.2
**Durée estimée** : 30-45 minutes

---

## 🎯 Vue d'ensemble

Cette checklist couvre **toutes les étapes** pour activer complètement Prolex en autonomie niveau 4, depuis la configuration initiale jusqu'à la vérification finale.

---

## ✅ Partie 1 : Vérifications préalables (5 min)

### 1.1 Vérifier que le code est bien pushé sur GitHub

- [ ] Vérifier que le commit `feat: Prolex v4.2` est sur GitHub
  ```bash
  git log -1 --oneline
  # Doit afficher : 86e94d3 feat: Prolex v4.2 — autonomie niveau 4 permanente + cleanup massif
  ```

- [ ] Vérifier la branche GitHub
  ```bash
  git branch --show-current
  # Doit afficher : claude/prolex-major-updates-019Dd4zTmu7mD2LYirGBVZ1Y
  ```

- [ ] Vérifier sur GitHub que les fichiers sont bien présents :
  - https://github.com/ProlexAi/Prolex/blob/claude/prolex-major-updates-019Dd4zTmu7mD2LYirGBVZ1Y/config/autonomy.yml
  - https://github.com/ProlexAi/Prolex/blob/claude/prolex-major-updates-019Dd4zTmu7mD2LYirGBVZ1Y/n8n-workflows/005_critical-alerts-only.json

### 1.2 Vérifier que n8n est accessible

- [ ] n8n local : http://localhost:5678
  ```bash
  curl -I http://localhost:5678 2>/dev/null | head -1
  # Doit retourner : HTTP/1.1 200 OK
  ```

- [ ] OU n8n production : https://n8n.automatt.ai
  ```bash
  curl -I https://n8n.automatt.ai 2>/dev/null | head -1
  # Doit retourner : HTTP/2 200
  ```

- [ ] Vérifier API n8n accessible
  ```bash
  curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
       http://localhost:5678/api/v1/workflows 2>/dev/null | jq '.data | length'
  # Doit retourner un nombre (ex: 8)
  ```

### 1.3 Vérifier SystemJournal Google Sheets

- [ ] Ouvrir SystemJournal : https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk
- [ ] Vérifier que l'onglet `events` existe
- [ ] Vérifier les derniers logs (doivent être récents)

---

## ⚙️ Partie 2 : Configuration Telegram (10 min)

### 2.1 Obtenir ton ID Telegram

- [ ] Ouvrir Telegram (mobile ou desktop)
- [ ] Rechercher le bot : `@userinfobot`
- [ ] Envoyer `/start` au bot
- [ ] Copier ton **User ID** (ex: `123456789`)
- [ ] **IMPORTANT** : Noter cet ID quelque part

### 2.2 Créer un bot Telegram pour Prolex (si pas déjà fait)

- [ ] Dans Telegram, rechercher : `@BotFather`
- [ ] Envoyer `/newbot`
- [ ] Nom du bot : `Prolex Automatt`
- [ ] Username du bot : `prolex_automatt_bot` (ou similaire)
- [ ] Copier le **Bot Token** (ex: `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`)
- [ ] **IMPORTANT** : Sauvegarder ce token dans un endroit sûr

### 2.3 Configurer les credentials Telegram dans n8n

- [ ] Ouvrir n8n : http://localhost:5678
- [ ] Aller dans **Settings** → **Credentials**
- [ ] Chercher "Telegram" ou créer une nouvelle credential
- [ ] Nom : `Telegram Automatt`
- [ ] **Access Token** : coller le Bot Token de BotFather
- [ ] **Save**

### 2.4 Tester la connexion Telegram

- [ ] Dans Telegram, rechercher ton bot (`@prolex_automatt_bot`)
- [ ] Envoyer `/start` au bot
- [ ] Le bot doit répondre (ou rester silencieux, c'est normal)

---

## 🔧 Partie 3 : Import et configuration workflows n8n (15 min)

### 3.1 Déclencher la synchronisation GitHub → n8n

**Option A : Automatique (recommandé)**

Le workflow `010_sync-github-to-n8n` devrait se déclencher automatiquement via webhook GitHub.

- [ ] Vérifier dans GitHub : **Settings** → **Webhooks**
- [ ] Chercher le webhook pointant vers n8n (URL : `https://n8n.automatt.ai/webhook/github-to-n8n`)
- [ ] Vérifier **Recent Deliveries** → doit montrer un delivery récent (< 5 min)
- [ ] Si delivery réussi (✅ code 200), passer à l'étape suivante
- [ ] Si pas de delivery récent, déclencher manuellement (Option B)

**Option B : Manuel**

Si le webhook n'a pas fonctionné :

```bash
# Déclencher manuellement le workflow 010 via API
curl -X POST http://localhost:5678/api/v1/workflows/010/execute \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3.2 Vérifier que le workflow 005 est importé

- [ ] Ouvrir n8n : http://localhost:5678
- [ ] Aller dans **Workflows**
- [ ] Chercher : `005 - Alertes critiques seulement`
- [ ] Si présent → ✅ continuer
- [ ] Si absent → importer manuellement (voir étape 3.3)

### 3.3 Import manuel du workflow 005 (si nécessaire)

Si le workflow 005 n'a pas été importé automatiquement :

- [ ] Ouvrir n8n : http://localhost:5678
- [ ] Cliquer sur **+** → **Import from File**
- [ ] Sélectionner le fichier : `n8n-workflows/005_critical-alerts-only.json`
- [ ] Cliquer **Import**
- [ ] Le workflow apparaît dans la liste

### 3.4 Configurer le workflow 005

- [ ] Ouvrir le workflow `005 - Alertes critiques seulement` dans n8n
- [ ] Trouver le nœud **"Alerte Telegram Matthieu"**
- [ ] Cliquer sur le nœud pour l'éditer
- [ ] **Chat ID** : remplacer `123456789` par ton vrai User ID Telegram (de l'étape 2.1)
- [ ] **Credentials** : vérifier que `Telegram Automatt` est sélectionné
- [ ] **Parse Mode** : vérifier que `Markdown` est sélectionné
- [ ] Cliquer **Save** (en haut à droite)

### 3.5 Configurer le nœud SystemJournal dans workflow 005

- [ ] Toujours dans le workflow 005
- [ ] Trouver le nœud **"Logger dans SystemJournal"**
- [ ] Vérifier que l'URL est correcte : `https://n8n.automatt.ai/webhook/systemjournal-log`
- [ ] Si l'URL est différente, la corriger
- [ ] Cliquer **Save**

### 3.6 Activer le workflow 005

- [ ] En haut à droite du workflow 005, cliquer sur le bouton **"Inactive"**
- [ ] Le bouton devient **"Active"** (vert)
- [ ] ✅ Workflow 005 est maintenant actif

### 3.7 Lister tous les workflows et vérifier leur statut

- [ ] Ouvrir n8n → **Workflows**
- [ ] Vérifier le statut de chaque workflow :

| ID | Nom | Statif souhaité | Action |
|----|-----|-----------------|--------|
| 005 | Alertes critiques seulement | ✅ **Active** | Activé à l'étape 3.6 |
| 010 | GitHub to n8n Sync | ✅ **Active** | Doit être actif pour sync auto |
| 011 | GitHub to n8n Sync v1 | ⚠️ **Inactive** | Ancienne version, peut être désactivé |
| 012 | Prolex Git Pull | ✅ **Active** | Utile pour sync |
| 020 | Example Hello World | ⚠️ **Inactive** | Juste un exemple |
| 020 | Proxy Master Exec EXAMPLE | ⚠️ **Inactive** | Juste un exemple |
| 020 | Refresh RAG Embeddings | ✅ **Active** | Important pour RAG |
| 030 | GitHub Dev Log to Sheets | ✅ **Active** | Logging important |
| 050 | Daily Full Maintenance | ✅ **Active** | Maintenance quotidienne |
| 600 | HIGH RISK APPROVAL EXAMPLE | ❌ **À SUPPRIMER** | Contient "APPROVAL", obsolète niveau 4 |

### 3.8 Désactiver/Supprimer workflows obsolètes

- [ ] Workflow `600_20_HIGH_RISK_APPROVAL_EXAMPLE` :
  - Ouvrir le workflow dans n8n
  - Cliquer **Delete** (en haut à droite)
  - Confirmer la suppression
  - ✅ Workflow supprimé

- [ ] Workflow `011_sync-github-to-n8n-v1` (ancienne version) :
  - Si actif, le désactiver (cliquer "Active" → "Inactive")
  - OU le supprimer s'il n'est plus utilisé

---

## 🧪 Partie 4 : Tests et validation (10 min)

### 4.1 Test du workflow 005 (Alertes critiques)

**Test 1 : Facture élevée (> 5000 €)**

- [ ] Exécuter la commande :
  ```bash
  curl -X POST http://localhost:5678/webhook/critical-alert \
    -H "Content-Type: application/json" \
    -d '{
      "amount": 7500,
      "client_id": "TEST_001",
      "message": "Test activation niveau 4 - Facture élevée",
      "workflow_id": "999"
    }'
  ```

- [ ] Vérifier que tu reçois une alerte Telegram dans les **5 secondes**
- [ ] Message attendu :
  ```
  💰 PROLEX NIVEAU 4 - FACTURE ÉLEVÉE CRÉÉE

  Montant : **7500 €**
  Client : TEST_001

  Message : Test activation niveau 4 - Facture élevée

  📅 22/11/2025 XX:XX
  🔗 Workflow : 999
  ```

**Test 2 : Modification règles RAG**

- [ ] Exécuter :
  ```bash
  curl -X POST http://localhost:5678/webhook/critical-alert \
    -H "Content-Type: application/json" \
    -d '{
      "path": "rag/rules/01_REGLES_PRINCIPALES.md",
      "message": "Test activation niveau 4 - Modification RAG",
      "workflow_id": "999"
    }'
  ```

- [ ] Vérifier réception alerte Telegram
- [ ] Message attendu : `📝 PROLEX NIVEAU 4 - MODIFICATION RÈGLES RAG`

**Test 3 : Nouveau workflow**

- [ ] Exécuter :
  ```bash
  curl -X POST http://localhost:5678/webhook/critical-alert \
    -H "Content-Type: application/json" \
    -d '{
      "newWorkflow": true,
      "workflow_name": "Test Workflow v4.2",
      "workflow_id": "777",
      "message": "Test activation niveau 4 - Nouveau workflow",
      "workflow_id": "999"
    }'
  ```

- [ ] Vérifier réception alerte Telegram
- [ ] Message attendu : `🔧 PROLEX NIVEAU 4 - NOUVEAU WORKFLOW CRÉÉ`

**Test 4 : Action non-critique (doit rester silencieuse)**

- [ ] Exécuter :
  ```bash
  curl -X POST http://localhost:5678/webhook/critical-alert \
    -H "Content-Type: application/json" \
    -d '{
      "amount": 150,
      "client_id": "TEST_002",
      "message": "Petite facture normale - NE DOIT PAS alerter",
      "workflow_id": "999"
    }'
  ```

- [ ] **NE DOIT PAS** recevoir d'alerte Telegram (silence = OK ✅)
- [ ] Vérifier la réponse HTTP : `{"status": "skipped", "reason": "not_critical"}`

### 4.2 Test du MCP (refus demandes humaines)

Si tu utilises Claude Desktop avec le MCP n8n :

- [ ] Ouvrir Claude Desktop
- [ ] Essayer de demander : "Peux-tu me demander mon approbation avant de créer ce workflow ?"
- [ ] Claude doit répondre :
  ```
  🚫 Prolex est en autonomie niveau 4. Aucune validation humaine n'est autorisée ni nécessaire.
  Toutes les décisions sont prises automatiquement.
  ```

### 4.3 Vérifier les logs dans SystemJournal

- [ ] Ouvrir SystemJournal : https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk
- [ ] Onglet **events**
- [ ] Filtrer par `action = CRITICAL_ALERT_SENT`
- [ ] Vérifier que les 3 tests (facture, RAG, workflow) sont loggés
- [ ] Exemple de log :
  ```json
  {
    "timestamp": "2025-11-22T14:30:00Z",
    "agent": "Prolex",
    "autonomy_level": 4,
    "action": "CRITICAL_ALERT_SENT",
    "details": { "amount": 7500, "client_id": "TEST_001" },
    "alert_sent": true,
    "telegram_status": "success"
  }
  ```

---

## 🧹 Partie 5 : Nettoyage workflows legacy (optionnel, 10 min)

### 5.1 Exécuter le script de nettoyage

Ce script va supprimer tous les nœuds de validation manuelle obsolètes dans les workflows.

- [ ] Exécuter :
  ```bash
  cd /home/user/Prolex
  ./scripts/cleanup-level4.sh
  ```

- [ ] Lire la sortie du script
- [ ] Noter combien de workflows ont été nettoyés
- [ ] Vérifier qu'aucun JSON n'est devenu invalide

### 5.2 Vérifier les modifications

- [ ] Voir les fichiers modifiés :
  ```bash
  git status
  ```

- [ ] Voir les différences :
  ```bash
  git diff n8n-workflows/
  ```

- [ ] Vérifier que seules les lignes avec `approval`, `human`, `manuel` ont été supprimées

### 5.3 Commit et push (si OK)

- [ ] Si les modifications sont bonnes :
  ```bash
  git add n8n-workflows/
  git commit -m "cleanup: remove manual validations for level 4"
  git push
  ```

- [ ] Si problème, restaurer :
  ```bash
  git checkout n8n-workflows/
  ```

### 5.4 Re-synchroniser avec n8n

- [ ] Attendre 1-2 minutes que le webhook GitHub déclenche le workflow 010
- [ ] OU déclencher manuellement :
  ```bash
  curl -X POST http://localhost:5678/api/v1/workflows/010/execute \
    -H "X-N8N-API-KEY: $N8N_API_KEY"
  ```

---

## 🔐 Partie 6 : Configuration sécurité et limites (5 min)

### 6.1 Vérifier les fichiers interdits

Ces fichiers **ne doivent JAMAIS être modifiés** par Prolex niveau 4 :

- [ ] Vérifier dans `config/autonomy.yml` ligne 212-216 :
  ```yaml
  forbidden_file_modifications:
    - "infra/vps-prod/docker-compose.yml"
    - ".env"
    - "mcp/n8n-server/.env"
    - "config/system.yml"
  ```

- [ ] Ces fichiers doivent avoir des permissions restreintes :
  ```bash
  chmod 600 infra/vps-prod/docker-compose.yml
  chmod 600 .env
  chmod 600 mcp/n8n-server/.env
  chmod 600 config/system.yml
  ```

### 6.2 Vérifier les limites quotidiennes

- [ ] Ouvrir `config/autonomy.yml`
- [ ] Vérifier lignes 218-223 :
  ```yaml
  daily_limits:
    BACKUP_RUN: 10
    WEB_SEARCH: 200
    CLIENT_WORKFLOW_RUN: 100
    CLIENT_INVOICE_CREATE: 50
  ```

- [ ] Si tu veux modifier ces limites, éditer le fichier et commit

### 6.3 Configurer les alertes critiques

- [ ] Vérifier `config/autonomy.yml` lignes 203-209 :
  ```yaml
  always_alert_on:
    - AMOUNT_OVER_5000_EUR
    - RAG_RULES_MODIFICATION
    - NEW_WORKFLOW_CREATION
    - BACKUP_RESTORE
    - GIT_OPERATIONS_ON_MAIN_BRANCH
  ```

- [ ] Si tu veux ajouter/retirer des alertes, éditer et commit

---

## 📊 Partie 7 : Monitoring et dashboards (5 min)

### 7.1 Configurer Google Sheets pour monitoring

- [ ] Ouvrir SystemJournal : https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk
- [ ] Créer un nouvel onglet : `level4_dashboard`
- [ ] Ajouter les colonnes :
  - Date
  - Total actions
  - Actions critiques (alertes envoyées)
  - Actions silencieuses (pas d'alerte)
  - Factures créées
  - Workflows déployés
  - Modifications RAG

### 7.2 Créer des filtres de vue

- [ ] Dans l'onglet `events`, créer des filtres :
  - Vue 1 : `autonomy_level = 4`
  - Vue 2 : `action = CRITICAL_ALERT_SENT`
  - Vue 3 : `status = error`

### 7.3 Configurer les notifications Google Sheets (optionnel)

- [ ] Google Sheets → **Tools** → **Notification rules**
- [ ] Créer une règle :
  - Trigger : "Any changes are made"
  - Notify : "matthieu@automatt.ai"
  - Frequency : "Every hour" (ou "Once a day")

---

## ✅ Partie 8 : Validation finale et go-live

### 8.1 Checklist de validation

- [ ] Config `autonomy.yml` : niveau 4 activé ✅
- [ ] Workflow 005 : créé et actif ✅
- [ ] Telegram : bot configuré et testé ✅
- [ ] Alertes critiques : 3 tests réussis ✅
- [ ] MCP : refuse demandes humaines ✅
- [ ] SystemJournal : logs présents ✅
- [ ] Workflows legacy : nettoyés (optionnel) ✅
- [ ] Limites de sécurité : configurées ✅

### 8.2 Test end-to-end complet

Simuler un cas d'usage réel :

- [ ] Scénario : "Créer une facture de 8000 € pour le client ACME Corp"

**Workflow attendu** :
1. Prolex crée la facture automatiquement (niveau 4)
2. Détecte montant > 5000 €
3. Appelle workflow 005
4. Envoie alerte Telegram à Matthieu
5. Logue dans SystemJournal
6. Continue l'exécution sans attendre validation

**Vérifications** :
- [ ] Alerte Telegram reçue ✅
- [ ] Log dans SystemJournal ✅
- [ ] Facture créée dans le système ✅
- [ ] Aucune demande de validation humaine ✅

### 8.3 Documentation finale

- [ ] Créer un document de référence rapide :
  - Fichier : `docs/QUICK_REFERENCE_LEVEL4.md`
  - Contenu : ID Telegram, limites, alertes, commandes utiles

- [ ] Mettre à jour `INDEX_PROLEX.md` :
  - Ajouter lien vers `docs/updates-v4/`
  - Ajouter section "Niveau 4 activé le 22/11/2025"

### 8.4 Communication et go-live

- [ ] Informer l'équipe (si applicable) :
  - Email : "Prolex niveau 4 activé - autonomie complète"
  - Mentionner : alertes critiques seulement

- [ ] Créer une Pull Request pour merger sur `main` :
  - URL : https://github.com/ProlexAi/Prolex/pull/new/claude/prolex-major-updates-019Dd4zTmu7mD2LYirGBVZ1Y
  - Titre : "feat: Prolex v4.2 — Autonomie niveau 4 permanente"
  - Description : copier le résumé du commit

- [ ] Merger la PR après review

- [ ] 🎉 **Prolex v4.2 niveau 4 est officiellement actif !**

---

## 📞 Support et dépannage

### Problèmes fréquents

**Problème 1 : Aucune alerte Telegram reçue**

Solutions :
1. Vérifier ID Telegram dans workflow 005
2. Vérifier credentials Telegram dans n8n
3. Vérifier que le bot est démarré (`/start` dans Telegram)
4. Tester manuellement le nœud Telegram dans n8n

**Problème 2 : Workflow 005 pas importé automatiquement**

Solutions :
1. Vérifier webhook GitHub (Settings → Webhooks)
2. Vérifier exécution workflow 010 dans n8n
3. Importer manuellement le workflow 005

**Problème 3 : Trop d'alertes reçues**

Solutions :
1. Augmenter le seuil dans workflow 005 (ex: `amount > 10000`)
2. Retirer des critères d'alerte dans le nœud "Est-ce critique ?"
3. Temporairement désactiver le workflow 005

**Problème 4 : MCP n'est pas accessible**

Solutions :
1. Vérifier que le MCP est démarré : `cd mcp/n8n-server && npm run dev`
2. Vérifier `.env` : `N8N_BASE_URL` et `N8N_API_KEY`
3. Redémarrer Claude Desktop
4. Vérifier `claude_desktop_config.json`

---

## 📈 Métriques de succès (première semaine)

Objectifs à vérifier après 7 jours :

- [ ] **Réduction notifications** : Passer de ~20/jour à ~2/jour (90% réduction)
- [ ] **Temps gagné** : ~3h/jour libérées pour tâches stratégiques
- [ ] **Factures créées** : X factures créées automatiquement sans validation
- [ ] **Workflows déployés** : Y workflows déployés en prod sans validation
- [ ] **Zéro incident** : Aucune action critique non désirée
- [ ] **Alertes pertinentes** : 100% des alertes reçues étaient légitimes

---

## 🎯 Résumé ultra-rapide (TL;DR)

```bash
# 1. Obtenir ID Telegram
Telegram → @userinfobot → /start → copier ID

# 2. Configurer workflow 005 dans n8n
n8n → 005 - Alertes critiques → nœud Telegram → Chat ID = ton_id → Save → Activer

# 3. Tester alerte
curl -X POST http://localhost:5678/webhook/critical-alert \
  -H "Content-Type: application/json" \
  -d '{"amount": 7500, "client_id": "TEST", "message": "Test niveau 4", "workflow_id": "999"}'

# 4. Vérifier réception Telegram
# Tu dois recevoir l'alerte dans les 5 secondes

# 5. Go-live
Merge PR → main → Prolex niveau 4 actif 🚀
```

---

**Temps total estimé** : 30-45 minutes
**Complexité** : Moyenne
**Prérequis** : n8n accessible, Telegram configuré

**Dernière mise à jour** : 22 novembre 2025
**Auteur** : Matthieu via Claude Code
