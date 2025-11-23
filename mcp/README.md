# 🎯 MCP Servers Prolex - Serveurs Model Context Protocol

> **Collection complète de serveurs MCP pour automatisation et gestion financière**
> Clientèle française 🇫🇷 | Version 1.0.0

---

## 📋 Vue d'ensemble

Ce répertoire contient **3 serveurs MCP** spécialisés pour Prolex AI :

| MCP | Description | Status | Tools |
|-----|-------------|--------|-------|
| **n8n-server** | Gestion workflows n8n | ✅ Production | 17 tools |
| **google-workspace-server** | Google Sheets/Docs/Drive | ✅ Production | 12 tools |
| **finance** | Paiements, Comptabilité, Crypto | 🚧 En développement | 9 tools |

**Total : 38 tools disponibles**

---

## 🏗️ Structure

```
mcp/
├── n8n-server/                    # MCP n8n (workflows automation)
│   ├── src/
│   │   ├── core/                  # Client n8n, retry, cache
│   │   ├── security/              # Autonomie, CASH protection
│   │   ├── selfheal/              # Auto-réparation
│   │   ├── tools/                 # 17 tools MCP
│   │   └── types/                 # Types TypeScript
│   ├── package.json
│   └── README.md
│
├── google-workspace-server/       # MCP Google Workspace
│   ├── src/
│   │   ├── clients/               # Sheets, Docs, Drive
│   │   ├── tools/                 # 12 tools MCP
│   │   └── auth/                  # Google OAuth
│   ├── package.json
│   └── README.md
│
├── finance/                       # MCP Finance (nouveau)
│   ├── src/
│   │   ├── clients/               # Stripe, Crypto, Banque
│   │   ├── tools/                 # 9 tools MCP (25 prévus)
│   │   │   ├── paiements/         # 5 tools
│   │   │   └── crypto/            # 4 tools
│   │   └── types/                 # Types finance
│   ├── package.json
│   └── README.md
│
└── README.md                      # Ce fichier
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
cd mcp/n8n-server
npm install
npm run build

# MCP Google Workspace
cd ../google-workspace-server
npm install
npm run build

# MCP Finance
cd ../finance
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

### Usage

```bash
npm run dev
# ou
npm start
```

---

## 📂 MCP Google Workspace - Sheets, Docs, Drive

### Fonctionnalités

- ✅ Google Sheets (lecture/écriture/création)
- ✅ Google Docs (lecture/création/modification)
- ✅ Google Drive (upload/download/organisation)
- ✅ Cache intelligent
- ✅ Logs SystemJournal

### 12 Tools disponibles

**Google Sheets (4 tools)**
1. `read_sheet` - Lire des données
2. `write_sheet` - Écrire des données
3. `append_sheet` - Ajouter des lignes
4. `create_spreadsheet` - Créer un tableur

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

### Configuration

```env
# .env
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-key.json
SYSTEM_JOURNAL_SPREADSHEET_ID=your_sheet_id
CACHE_ENABLED=true
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

**À venir (16 tools)**
- Comptabilité (5 tools)
- Banque (4 tools)
- Budget (4 tools)
- Analytics (3 tools)

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
cd mcp/n8n-server
npm install
npm run build

# Rebuild Google MCP
cd ../google-workspace-server
npm install
npm run build

# Restart services
pm2 restart mcp-n8n
pm2 restart mcp-google
```

### MCP Finance (Local uniquement)

Le MCP Finance reste **en local** pour l'instant :

```bash
# Local seulement
cd mcp/finance
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
  "agent": "MCP_N8N",
  "action": "trigger_workflow",
  "workflowId": "123",
  "correlationId": "n8n_1732356000_abc123",
  "status": "success"
}
```

---

## 🧪 Tests

```bash
# Tester un MCP
cd mcp/n8n-server
npm test
npm run test:coverage

# Linting
npm run lint
```

---

## 📝 Développement

### Ajouter un nouveau tool

1. Créer le fichier dans `src/tools/`
2. Définir le schéma Zod
3. Implémenter la fonction
4. Exporter depuis `src/tools/index.ts`
5. Enregistrer dans `src/server.ts`
6. Tester

### Pattern de tool

```typescript
import { z } from 'zod';
import type { MCPToolResponse } from '../types/index.js';

export const MonToolSchema = z.object({
  param: z.string().describe('Description'),
});

export async function monTool(
  args: z.infer<typeof MonToolSchema>
): Promise<MCPToolResponse> {
  try {
    // Logique
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ succes: true })
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Erreur: ${(error as Error).message}`
      }],
      isError: true
    };
  }
}
```

---

## 🤝 Support

- **Auteur** : ProlexAi
- **Email** : matthieu@automatt.ai
- **Clientèle** : 🇫🇷 Française
- **Documentation** : Voir README de chaque MCP

---

## 📜 Roadmap

### v1.1 (Q1 2025)
- [ ] Compléter MCP Finance (16 tools restants)
- [ ] Ajouter webhooks Stripe
- [ ] Intégrer Plaid (banque)

### v1.2 (Q2 2025)
- [ ] MCP Slack (communication)
- [ ] MCP Notion (knowledge base)
- [ ] MCP Calendar (agenda)

### v2.0 (Q3 2025)
- [ ] Commercialisation MCP n8n & Google
- [ ] Marketplace MCP
- [ ] Documentation publique

---

## 📜 Licence

MIT

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-11-23
**Total tools** : 38 (17 n8n + 12 Google + 9 Finance)
