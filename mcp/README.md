# 🎯 MCP Servers Prolex - Serveurs Model Context Protocol

> **Collection complète et organisée de serveurs MCP pour automatisation intelligente**
> Clientèle française 🇫🇷 | Version 2.0.0 | **4 serveurs optimisés**

---

## 📋 Vue d'ensemble

Ce répertoire contient **4 serveurs MCP** spécialisés pour Prolex AI, organisés selon une **nomenclature cohérente** : `mcp-<service>`

| MCP | Description | Status | Tools |
|-----|-------------|--------|-------|
| **mcp-n8n** | Gestion workflows n8n | ✅ Production | 17 tools |
| **mcp-google** | Google Workspace COMPLET | ✅ Production | 21 tools |
| **mcp-communication** | Multi-canal (Email, SMS, WhatsApp) | 🚧 Dev | 5/15 tools |
| **mcp-finance** | Paiements, Comptabilité, Crypto | 🚧 Dev | 9/25 tools |

**Total : 52 tools disponibles** (67 tools prévus à terme)

---

## 🎯 Nouveautés v2.0

### ✨ Changements Majeurs

1. **Nomenclature Unifiée** : Tous les MCP suivent le pattern `mcp-<service>`
   - ✅ `n8n-server/` → `mcp-n8n/`
   - ✅ `google-workspace-server/` + `google/` → `mcp-google/` (fusionné)
   - ✅ `communication/` → `mcp-communication/`
   - ✅ `finance/` → `mcp-finance/`

2. **Fusion Google** : Les deux serveurs Google ont été fusionnés en un seul `mcp-google` unifié
   - 21 tools (au lieu de 12 ou 18)
   - Tous les services Google Workspace : Sheets, Docs, Drive, Calendar, Gmail, Tasks
   - Meilleur code des deux serveurs
   - Pas de doublons

3. **Organisation Simplifiée** : 4 serveurs au lieu de 5 (élimination des doublons)

---

## 🏗️ Structure

```
mcp/
├── mcp-n8n/                      # MCP n8n (workflows automation)
│   ├── src/
│   │   ├── core/                 # Client n8n, retry, cache
│   │   ├── security/             # Autonomie, CASH protection
│   │   ├── selfheal/             # Auto-réparation
│   │   ├── tools/                # 17 tools MCP
│   │   └── types/                # Types TypeScript
│   ├── package.json
│   └── README.md
│
├── mcp-google/                   # MCP Google Workspace (UNIFIÉ)
│   ├── src/
│   │   ├── clients/              # Sheets, Docs, Drive, Calendar, Gmail, Tasks
│   │   ├── tools/                # 21 tools MCP
│   │   │   ├── sheets/           # 4 tools
│   │   │   ├── docs/             # 4 tools
│   │   │   ├── drive/            # 4 tools
│   │   │   ├── calendar/         # 3 tools
│   │   │   ├── gmail/            # 3 tools
│   │   │   └── tasks/            # 3 tools
│   │   ├── auth/                 # Google OAuth
│   │   └── logging/              # SystemJournal
│   ├── package.json
│   └── README.md
│
├── mcp-communication/            # MCP Communication multi-canal
│   ├── src/
│   │   ├── clients/              # Email, SMS, WhatsApp, Slack, Telegram
│   │   ├── tools/                # 5/15 tools MCP
│   │   │   ├── email/            # 2 tools (Gmail/SMTP)
│   │   │   └── sms/              # 3 tools (Twilio)
│   │   ├── security/             # Validation, rate limiting
│   │   └── types/                # Types communication
│   ├── package.json
│   └── README.md
│
├── mcp-finance/                  # MCP Finance
│   ├── src/
│   │   ├── clients/              # Stripe, Crypto, Banque
│   │   ├── tools/                # 9/25 tools MCP
│   │   │   ├── paiements/        # 5 tools (Stripe)
│   │   │   └── crypto/           # 4 tools (CoinGecko)
│   │   └── types/                # Types finance
│   ├── package.json
│   └── README.md
│
└── README.md                     # Ce fichier
```

---

## 🚀 Installation Rapide

### Prérequis

- Node.js >= 18.0.0
- npm ou yarn
- Credentials (selon MCP utilisé)

### Installation de tous les MCP

```bash
# MCP n8n
cd mcp/mcp-n8n
npm install
npm run build

# MCP Google (unifié)
cd ../mcp-google
npm install
npm run build

# MCP Communication
cd ../mcp-communication
npm install
npm run build

# MCP Finance
cd ../mcp-finance
npm install
npm run build
```

---

## 📦 MCP n8n - Workflows Automation

### Fonctionnalités

- ✅ Gestion complète des workflows n8n
- ✅ Protection CASH workflows (sécurité maximale)
- ✅ Auto-réparation (self-healing)
- ✅ Gestion autonomie (niveaux 0-3)
- ✅ Logs streaming temps réel

### 17 Tools disponibles

**Workflows (11 tools)**
1. `list_workflows` - Lister les workflows
2. `trigger_workflow` - Déclencher un workflow
3. `create_workflow` - Créer un workflow
4. `update_workflow` - Modifier un workflow
5. `delete_workflow` - Supprimer un workflow ⚠️
6. `duplicate_workflow` - Dupliquer un workflow
7. `export_workflow` - Exporter en JSON
8. `import_workflow` - Importer depuis JSON
9. `activate_workflow` - Activer
10. `deactivate_workflow` - Désactiver
11. `self_heal_workflow` - Auto-réparation

**Exécutions (4 tools)**
12. `get_execution` - Détails d'exécution
13. `stop_execution` - Arrêter une exécution
14. `retry_execution` - Relancer une exécution
15. `list_executions` - Lister avec filtres

**Système (2 tools)**
16. `get_system_status` - Statut système
17. `set_autonomy` - Changer niveau autonomie

### Configuration

```env
# .env
N8N_BASE_URL=https://n8n.automatt.ai
N8N_API_KEY=your_api_key
AUTONOMY_LEVEL=2
SYSTEM_JOURNAL_ENABLED=true
```

---

## 📊 MCP Google - Google Workspace COMPLET (NOUVEAU)

### Fonctionnalités

- ✅ Google Sheets (lecture/écriture/création)
- ✅ Google Docs (lecture/création/modification)
- ✅ Google Drive (upload/download/organisation)
- ✅ Google Calendar (événements)
- ✅ Gmail (lecture/envoi)
- ✅ Google Tasks (gestion tâches)
- ✅ Cache intelligent
- ✅ Logs SystemJournal

### 21 Tools disponibles (UNIFIÉ)

**Google Sheets (4 tools)**
1. `sheets_read` - Lire des données
2. `sheets_write` - Écrire des données
3. `sheets_append` - Ajouter des lignes
4. `sheets_create` - Créer une feuille

**Google Docs (4 tools)**
5. `read_doc` - Lire un document
6. `create_doc` - Créer un document
7. `insert_text_doc` - Insérer du texte
8. `update_doc` - Batch update

**Google Drive (4 tools)**
9. `list_drive_files` - Lister fichiers
10. `upload_drive_file` - Upload fichier
11. `download_drive_file` - Télécharger fichier
12. `create_drive_folder` - Créer dossier

**Google Calendar (3 tools)**
13. `calendar_list_events` - Lister événements
14. `calendar_create_event` - Créer événement
15. `calendar_delete_event` - Supprimer événement

**Gmail (3 tools)**
16. `gmail_list` - Lister emails
17. `gmail_send` - Envoyer email
18. `gmail_read` - Lire email

**Google Tasks (3 tools)**
19. `tasks_list` - Lister tâches
20. `tasks_create` - Créer tâche
21. `tasks_complete` - Marquer complétée

### Configuration

```env
# .env
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/google-key.json
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
SYSTEM_JOURNAL_SPREADSHEET_ID=your_sheet_id
CACHE_ENABLED=true
```

---

## 📱 MCP Communication - Multi-Canal Sécurisé

### Fonctionnalités

- 🚧 Email (Gmail/SMTP) - ✅ Implémenté (2 tools)
- 🚧 SMS (Twilio) - ✅ Implémenté (3 tools)
- 🚧 WhatsApp (Twilio) - En développement
- 🚧 Slack - En développement
- 🚧 Telegram - En développement

### 5 Tools disponibles (15 prévus)

**Email (2 tools)**
1. `envoyer_email` - Envoyer avec validation multi-niveau
2. `lire_emails` - Lire emails récents

**SMS (3 tools)**
3. `envoyer_sms` - Envoyer SMS avec whitelist stricte
4. `lire_sms_recus` - Lire SMS reçus
5. `obtenir_statut_sms` - Vérifier statut livraison

### Configuration

```env
# .env
# Gmail
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=xxxxx

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+33xxxxxxxxx

# Sécurité (OBLIGATOIRE en production)
ALLOWED_EMAIL_RECIPIENTS=client@example.com
ALLOWED_PHONE_NUMBERS=+33612345678
RATE_LIMIT_EMAIL_PER_HOUR=50
RATE_LIMIT_SMS_PER_HOUR=20
```

---

## 💰 MCP Finance - Paiements, Comptabilité, Crypto

### Fonctionnalités

- 🚧 Facturation et paiements (Stripe)
- 🚧 Gestion crypto (CoinGecko)
- 🚧 Comptabilité (Google Sheets)
- 🚧 Budget et prévisions
- 🚧 Rapports fiscaux

### 9 Tools disponibles (25 prévus)

**Paiements (5 tools)**
1. `creer_facture` - Créer facture Stripe
2. `envoyer_facture` - Envoyer par email
3. `suivre_paiement` - Suivre statut
4. `rembourser_paiement` - Remboursement
5. `obtenir_statut_paiement` - Statut détaillé

**Crypto (4 tools)**
6. `obtenir_portfolio_crypto` - Valeur portfolio
7. `suivre_prix_crypto` - Prix en temps réel
8. `calculer_gains_crypto` - Gains/pertes
9. `generer_rapport_fiscal_crypto` - Rapport fiscal

### Configuration

```env
# .env
STRIPE_SECRET_KEY=sk_test_xxxxx
COINGECKO_API_KEY=xxxxx
COMPTABILITE_SPREADSHEET_ID=xxxxx
```

---

## 🔄 Déploiement sur VPS

### MCP n8n & Google (Production)

Ces 2 MCP sont **synchronisés automatiquement** sur le VPS :

```bash
# Sur le VPS
cd /opt/prolex
git pull origin main

# Rebuild n8n MCP
cd mcp/mcp-n8n
npm install
npm run build

# Rebuild Google MCP
cd ../mcp-google
npm install
npm run build

# Restart services
pm2 restart mcp-n8n
pm2 restart mcp-google
```

### MCP Communication & Finance (Local uniquement)

Ces MCP restent **en local** pour l'instant :

```bash
# Local seulement
cd mcp/mcp-communication
npm run dev

cd ../mcp-finance
npm run dev
```

---

## 🔒 Sécurité

### Protection CASH Workflows (MCP n8n)

⚠️ **Zone interdite** - Workflows critiques protégés :
- `leadgen`, `proposal`, `invoice`, `stripe`, `relance`, `cash`
- Modification/suppression **bloquée automatiquement**
- Alert Telegram à Matthieu en cas de tentative

### Validation des inputs

- Tous les tools utilisent **Zod** pour validation
- Schémas stricts sur tous les paramètres
- Erreurs claires et explicites

### Secrets

- ❌ **JAMAIS** de secrets dans Git
- ✅ Utiliser `.env` (gitignore)
- ✅ Variables d'environnement sur VPS

---

## 📊 Logging & Traçabilité

Tous les MCP loggent vers :

1. **Console** (Pino pretty)
2. **SystemJournal** (Google Sheets)

Exemple de log :
```json
{
  "timestamp": "2025-11-23T10:00:00Z",
  "agent": "MCP_GOOGLE",
  "action": "sheets_read",
  "spreadsheetId": "1xEE...",
  "correlationId": "google_1732356000_abc123",
  "status": "success"
}
```

---

## 🧪 Tests

```bash
# Tester un MCP
cd mcp/mcp-n8n
npm test
npm run test:coverage

# Linting
npm run lint
```

---

## 📝 Développement

### Convention de Nommage

**Pattern** : `mcp-<service>`

✅ **Exemples valides** :
- `mcp-n8n` - Workflows automation
- `mcp-google` - Google Workspace
- `mcp-communication` - Multi-canal
- `mcp-finance` - Finance

❌ **À éviter** :
- `n8n-server` (suffixe `-server` inutile)
- `google-workspace-server` (trop verbeux)
- `google` (trop générique)

### Ajouter un nouveau MCP

1. Créer le dossier `mcp/mcp-<service>/`
2. Suivre la structure standard (src/, package.json, README.md)
3. Utiliser le pattern de tools existant
4. Documenter dans ce README

---

## 🤝 Support

- **Auteur** : ProlexAi
- **Email** : matthieu@automatt.ai
- **Clientèle** : 🇫🇷 Française
- **Documentation** : Voir README de chaque MCP

---

## 📜 Roadmap

### v2.1 (Q1 2025)
- [ ] Compléter MCP Communication (10 tools restants)
- [ ] Compléter MCP Finance (16 tools restants)
- [ ] Déployer Communication & Finance sur VPS

### v2.2 (Q2 2025)
- [ ] MCP Slack (communication équipe)
- [ ] MCP Notion (knowledge base)
- [ ] MCP DevOps (GitHub, GitLab, Docker)

### v3.0 (Q3 2025)
- [ ] Commercialisation MCP n8n & Google
- [ ] Marketplace MCP
- [ ] Documentation publique

---

## 📜 Licence

MIT

---

**Version** : 2.0.0
**Dernière mise à jour** : 2025-11-23
**Serveurs MCP** : 4 (optimisé de 5 → 4)
**Total tools** : 52 disponibles (67 prévus)
**Changements majeurs** : Fusion Google, nomenclature unifiée
