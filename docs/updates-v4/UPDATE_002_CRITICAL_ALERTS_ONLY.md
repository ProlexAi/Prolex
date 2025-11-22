# UPDATE 002 — Workflow 005 : Plus de bruit, seulement les alertes critiques

**Date** : 22 novembre 2025
**Workflow** : `005_critical-alerts-only.json`
**Statut** : ✅ Prêt à activer

---

## 📋 Résumé

Le workflow **005 - Alertes critiques seulement (niveau 4)** est le **filtre intelligent** qui décide quelles actions de Prolex méritent une alerte Telegram à Matthieu, et lesquelles peuvent être exécutées en silence.

**Résultat** : Tu passes de **15-20 notifications/jour** à **1-3 alertes critiques/jour**.

---

## 🎯 Fonctionnement

### Architecture du workflow

```
Webhook → Est-ce critique ? → OUI → Formater message → Telegram → SystemJournal → Réponse
                            → NON → Réponse (silence)
```

### Webhook d'entrée

- **URL** : `https://n8n.automatt.ai/webhook/critical-alert`
- **Méthode** : POST
- **Appelé par** : Tous les workflows sensibles (factures, RAG, n8n, Git, backups)

### Critères de criticité

Le workflow envoie une alerte Telegram **uniquement si** :

| Critère | Condition | Exemple |
|---------|-----------|---------|
| 💰 **Facture élevée** | `amount > 5000` | Facture client de 7500 € |
| 📝 **Modification règles RAG** | `path.includes('rag/rules/')` | Edition de `rag/rules/01_REGLES_PRINCIPALES.md` |
| 🔧 **Nouveau workflow** | `newWorkflow == true` | Création workflow `310_client_onboarding.json` |
| 💾 **Restauration backup** | `backupRestore == true` | Restauration backup du 21/11/2025 |
| 🔀 **Git sur main** | `gitMainBranch == true` | Push sur branch `main` en production |

**Tout le reste** = exécution silencieuse (pas d'alerte).

---

## 📊 Exemples d'alertes envoyées

### Exemple 1 : Facture élevée (7500 €)

**Payload entrant** :
```json
{
  "amount": 7500,
  "client_id": "CLI_001",
  "invoice_id": "INV_2025_042",
  "message": "Facture mensuelle client Acme Corp",
  "workflow_id": "310"
}
```

**Message Telegram** :
```
💰 PROLEX NIVEAU 4 - FACTURE ÉLEVÉE CRÉÉE

Montant : **7500 €**
Client : CLI_001

Message : Facture mensuelle client Acme Corp

📅 22/11/2025 14:30
🔗 Workflow : 310
```

---

### Exemple 2 : Modification règles RAG

**Payload entrant** :
```json
{
  "path": "rag/rules/01_REGLES_PRINCIPALES.md",
  "git_operation": "commit",
  "commit_sha": "a3f2d1b",
  "message": "Ajout règle pour gestion erreurs API",
  "workflow_id": "600"
}
```

**Message Telegram** :
```
📝 PROLEX NIVEAU 4 - MODIFICATION RÈGLES RAG

Fichier : rag/rules/01_REGLES_PRINCIPALES.md

Message : Ajout règle pour gestion erreurs API

📅 22/11/2025 15:45
🔗 Workflow : 600
```

---

### Exemple 3 : Nouveau workflow créé

**Payload entrant** :
```json
{
  "newWorkflow": true,
  "workflow_name": "Client Onboarding v2",
  "workflow_id": "350",
  "message": "Workflow pour automatiser onboarding nouveaux clients",
  "workflow_id": "610"
}
```

**Message Telegram** :
```
🔧 PROLEX NIVEAU 4 - NOUVEAU WORKFLOW CRÉÉ

Nom : Client Onboarding v2
ID : 350

Message : Workflow pour automatiser onboarding nouveaux clients

📅 22/11/2025 16:20
🔗 Workflow : 610
```

---

## 🔗 Intégration dans les autres workflows

Ce workflow est appelé par **TOUS les workflows sensibles** à la fin de leur exécution via un nœud **HTTP Request** ou **Execute Workflow**.

### Méthode 1 : HTTP Request (recommandé)

Ajouter ce nœud à la fin des workflows sensibles :

```json
{
  "parameters": {
    "url": "https://n8n.automatt.ai/webhook/critical-alert",
    "method": "POST",
    "bodyParametersJson": "={{ JSON.stringify({\n  amount: $json.amount,\n  client_id: $json.client_id,\n  message: 'Facture créée automatiquement',\n  workflow_id: '310'\n}) }}"
  },
  "name": "Vérifier si alerte critique",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3
}
```

### Méthode 2 : Execute Workflow

```json
{
  "parameters": {
    "workflowId": "5",
    "fieldsUi": {
      "values": [
        {
          "name": "amount",
          "value": "={{ $json.amount }}"
        },
        {
          "name": "client_id",
          "value": "={{ $json.client_id }}"
        }
      ]
    }
  },
  "name": "Vérifier si alerte critique",
  "type": "n8n-nodes-base.executeWorkflow",
  "typeVersion": 1
}
```

---

## 📈 Réduction du bruit

### Avant niveau 4 (15-20 notifications/jour)

- ✅ Facture 150 € créée → **Notification**
- ✅ Facture 300 € créée → **Notification**
- ✅ Facture 1200 € créée → **Notification**
- ✅ Tâche créée → **Notification**
- ✅ Workflow testé → **Notification**
- ✅ Log ajouté → **Notification**
- ✅ Rapport généré → **Notification**
- ... (15-20x par jour)

### Après niveau 4 (1-3 alertes critiques/jour)

- ❌ Facture 150 € créée → **Silence**
- ❌ Facture 300 € créée → **Silence**
- ❌ Facture 1200 € créée → **Silence**
- ✅ **Facture 7500 € créée** → **ALERTE**
- ❌ Tâche créée → **Silence**
- ❌ Workflow testé → **Silence**
- ❌ Log ajouté → **Silence**
- ❌ Rapport généré → **Silence**
- ✅ **Nouveau workflow créé** → **ALERTE**
- ✅ **Règle RAG modifiée** → **ALERTE**

**Résultat** : 92% de réduction du bruit.

---

## 🛠️ Configuration

### ID Telegram

Modifier l'ID Telegram dans le nœud "Alerte Telegram Matthieu" :

```json
{
  "parameters": {
    "chatId": "123456789",  // ← Remplacer par ton vrai ID Telegram
    "text": "={{ $json.message }}",
    "additionalFields": {
      "parse_mode": "Markdown"
    }
  }
}
```

**Obtenir ton ID Telegram** :
1. Ouvrir Telegram
2. Rechercher le bot `@userinfobot`
3. Envoyer `/start`
4. Le bot te renvoie ton ID (ex : `123456789`)

### Credentials Telegram

Le workflow utilise les credentials Telegram `Telegram Automatt` (ID `1`).

Vérifier dans n8n :
1. **Settings** → **Credentials**
2. Chercher **Telegram Automatt**
3. S'assurer que le bot token est configuré

---

## ✅ Activation du workflow

### Étape 1 : Importer dans n8n

Le workflow sera automatiquement importé dans n8n via le workflow **010_sync-github-to-n8n** après le push Git.

### Étape 2 : Activer le workflow

```bash
# Via n8n UI
1. Ouvrir n8n → Workflows
2. Chercher "005 - Alertes critiques seulement"
3. Cliquer sur le bouton "Inactive" pour l'activer

# OU via API
curl -X PATCH http://localhost:5678/api/v1/workflows/5 \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"active": true}'
```

### Étape 3 : Tester l'alerte

```bash
# Test avec facture élevée
curl -X POST https://n8n.automatt.ai/webhook/critical-alert \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 6000,
    "client_id": "TEST",
    "message": "Test alerte niveau 4",
    "workflow_id": "999"
  }'

# Tu dois recevoir l'alerte Telegram dans les 2 secondes
```

---

## 📊 Monitoring

### Vérifier les logs

Les alertes envoyées sont loggées dans **SystemJournal** :

- **Google Sheets** : [SystemJournal](https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk)
- **Onglet** : `events`
- **Filtre** : `action = CRITICAL_ALERT_SENT`

### Exemple de log

```json
{
  "timestamp": "2025-11-22T14:30:00Z",
  "agent": "Prolex",
  "autonomy_level": 4,
  "action": "CRITICAL_ALERT_SENT",
  "details": {
    "amount": 7500,
    "client_id": "CLI_001"
  },
  "alert_sent": true,
  "telegram_status": "success"
}
```

---

## 🚨 Dépannage

### Problème : Aucune alerte reçue

**Causes possibles** :
1. ID Telegram incorrect dans le workflow
2. Bot Telegram non configuré
3. Workflow inactif dans n8n
4. Webhook URL incorrecte

**Solution** :
```bash
# Vérifier que le workflow est actif
curl http://localhost:5678/api/v1/workflows/5 \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '.active'

# Vérifier les credentials Telegram
# n8n UI → Settings → Credentials → Telegram Automatt

# Tester manuellement le bot
# Telegram → Envoyer message au bot → Vérifier réponse
```

### Problème : Trop d'alertes reçues

**Causes possibles** :
1. Seuil `amount > 5000` trop bas
2. Workflows non-critiques appellent ce workflow
3. Erreurs répétées déclenchent des alertes

**Solution** :
```bash
# Augmenter le seuil dans le nœud "Est-ce critique ?"
# Changer : amount > 5000
# Par : amount > 10000

# Vérifier quels workflows appellent critical-alert
grep -r "critical-alert" n8n-workflows/*.json
```

---

## 📞 Support

**Questions ou problèmes ?**

- **Maintainer** : Matthieu (Automatt.ai)
- **Email** : matthieu@automatt.ai
- **Workflow ID** : 005
- **Docs** : [INDEX_PROLEX.md](../../INDEX_PROLEX.md)

---

**Dernière mise à jour** : 22 novembre 2025
**Auteur** : Matthieu via Claude Code
**Statut** : Prêt à activer ✅
