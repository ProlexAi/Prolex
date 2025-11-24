# 📁 Architecture Google Drive - Alignée 1:1 avec GitHub

> **Structure complète Google Drive pour Prolex**
> **Date**: 2025-11-24
> **Version**: 1.0
> **Alignement**: 1:1 avec les 9 repositories GitHub

---

## 🎯 Objectifs

1. **Synchronisation**: Alignement parfait avec structure GitHub
2. **Accessibilité**: Documents facilement accessibles depuis Drive
3. **Backup**: Sauvegarde automatique des documents importants
4. **Collaboration**: Partage facilité avec équipe
5. **Automatisation**: Sync automatique via n8n + MCP Drive

---

## 🗂️ Structure complète

```
📁 Automatt - Prolex (Dossier racine Google Drive)
│
├── 📁 01 - Prolex-Core/
│   ├── 📁 Docs/
│   │   ├── Architecture-Core.md
│   │   ├── API-Reference.md
│   │   └── Decision-Engine-Specs.md
│   ├── 📁 Schemas/
│   │   ├── kimmy-payload.schema.json
│   │   ├── prolex-output.schema.json
│   │   └── context.schema.json
│   ├── 📁 Configs/
│   │   ├── autonomy-levels.yml
│   │   ├── system.yml
│   │   └── tools-permissions.yml
│   └── 📁 Logs/
│       ├── Critical-Incidents/
│       └── Performance-Logs/
│
├── 📁 02 - Prolex-Kimmy/
│   ├── 📁 Docs/
│   │   ├── Specification-Kimmy-v4.md
│   │   └── Intent-Classification-Guide.md
│   ├── 📁 Prompts/
│   │   ├── system-prompt-kimmy.md
│   │   ├── intent-classification.md
│   │   └── complexity-evaluation.md
│   ├── 📁 Training-Data/
│   │   ├── intent-examples.json
│   │   └── complexity-examples.json
│   └── 📁 Metrics/
│       └── classification-accuracy.xlsx
│
├── 📁 03 - Prolex-Opex/
│   ├── 📁 Workflows/
│   │   ├── 000-Core/
│   │   ├── 100-Productivity/
│   │   ├── 200-DevOps/
│   │   ├── 300-Clients/
│   │   └── README-Workflows.md
│   ├── 📁 Docs/
│   │   ├── Specification-Opex-v4.md
│   │   ├── Proxy-Master-Guide.md
│   │   └── Workflow-Conventions.md
│   ├── 📁 Execution-Logs/
│   │   ├── Daily/
│   │   └── Weekly/
│   └── 📁 Backup-Workflows/
│       ├── Daily-Backups/
│       └── Weekly-Backups/
│
├── 📁 04 - Prolex-MCP/
│   ├── 📁 Docs/
│   │   ├── MCP-Servers-Overview.md
│   │   ├── n8n-Server-Guide.md
│   │   ├── Drive-Server-Guide.md
│   │   └── GitHub-Server-Guide.md
│   ├── 📁 Examples/
│   │   ├── n8n-usage-examples.md
│   │   ├── drive-usage-examples.md
│   │   └── claude-desktop-config.json
│   └── 📁 Schemas/
│       └── mcp-tool-definitions/
│
├── 📁 05 - Prolex-CLI/
│   ├── 📁 Docs/
│   │   ├── CLI-Commands-Reference.md
│   │   └── User-Guide.md
│   ├── 📁 User-Guides/
│   │   ├── Getting-Started.md
│   │   ├── Advanced-Usage.md
│   │   └── Troubleshooting.md
│   └── 📁 Screenshots/
│       └── cli-examples/
│
├── 📁 06 - Prolex-RAG/
│   ├── 📁 Knowledge-Base/
│   │   ├── 📁 Tools/
│   │   │   └── tools.yml                    # 30+ outils
│   │   ├── 📁 Rules/
│   │   │   ├── 01_REGLES_PRINCIPALES.md
│   │   │   └── 02_VARIABLES_ET_CONTEXTE.md
│   │   ├── 📁 Examples/
│   │   │   ├── lead-example.json
│   │   │   └── workflow-examples.json
│   │   ├── 📁 Prompts/
│   │   │   ├── System-Prompts/
│   │   │   └── Task-Prompts/
│   │   └── 📁 Contexts/
│   │       ├── Project-Automatt.md
│   │       └── Technical-Specs/
│   ├── 📁 Embeddings-Backups/
│   │   ├── Monthly/
│   │   └── Weekly/
│   ├── 📁 Docs/
│   │   ├── RAG-Architecture.md
│   │   └── Ingestion-Pipeline.md
│   └── 📁 Metrics/
│       └── retrieval-accuracy.xlsx
│
├── 📁 07 - Prolex-Apps/
│   ├── 📁 Docs/
│   │   ├── Atmtt-Viewer-Guide.md
│   │   ├── Dashboard-Guide.md
│   │   └── Tools-Manager-Guide.md
│   ├── 📁 Screenshots/
│   │   ├── atmtt-viewer/
│   │   ├── dashboard/
│   │   └── tools-manager/
│   ├── 📁 Releases/
│   │   ├── Windows/
│   │   └── macOS/
│   └── 📁 User-Feedback/
│
├── 📁 08 - Prolex-Infra/
│   ├── 📁 Docs/
│   │   ├── VPS-Setup-Guide.md
│   │   ├── Deployment-Guide.md
│   │   ├── Backup-Restore-Guide.md
│   │   └── Monitoring-Guide.md
│   ├── 📁 Architecture-Diagrams/
│   │   ├── infrastructure-overview.png
│   │   ├── docker-compose-diagram.png
│   │   └── network-topology.png
│   ├── 📁 Deployment-Logs/
│   │   ├── Production/
│   │   └── Staging/
│   └── 📁 Configs-Backup/
│       ├── traefik/
│       ├── nginx/
│       └── docker-compose/
│
├── 📁 09 - Prolex-Docs/
│   ├── 📁 Public-Docs/
│   │   ├── Getting-Started/
│   │   ├── Architecture/
│   │   ├── Guides/
│   │   └── API-Reference/
│   ├── 📁 Internal-Docs/
│   │   ├── Team-Processes/
│   │   └── Meeting-Notes/
│   └── 📁 Blog-Drafts/
│       └── release-notes/
│
├── 📁 Contextes/                                # Contextes IA
│   ├── 📁 Contextes-Copilot/
│   │   ├── copilot-instructions-core.md
│   │   ├── copilot-instructions-kimmy.md
│   │   └── copilot-instructions-opex.md
│   ├── 📁 Contextes-Claude/
│   │   ├── claude-instructions-prolex.md
│   │   └── claude-mcp-config.json
│   └── 📁 Contextes-Prolex/
│       ├── system-context.md
│       └── project-context.md
│
├── 📁 Logs-Importants/                          # Logs critiques
│   ├── 📁 Incidents/
│   │   ├── 2025-11-24-auth-failure.md
│   │   └── incident-template.md
│   ├── 📁 Deployments/
│   │   ├── 2025-11-24-production-deploy.md
│   │   └── deployment-checklist.md
│   └── 📁 Performance/
│       └── performance-issues.xlsx
│
├── 📁 Schemas-Architecture/                     # Schémas centralisés
│   ├── 📁 JSON-Schemas/
│   │   ├── All-Schemas.zip
│   │   └── schema-index.md
│   ├── 📁 Architecture-Diagrams/
│   │   ├── prolex-architecture-v4.png
│   │   ├── data-flow-diagram.png
│   │   └── deployment-architecture.png
│   └── 📁 Flow-Charts/
│       ├── kimmy-to-opex-flow.png
│       └── decision-engine-flow.png
│
├── 📁 Prompts/                                  # Bibliothèque prompts
│   ├── 📁 System-Prompts/
│   │   ├── prolex-system-prompt.md
│   │   ├── kimmy-system-prompt.md
│   │   └── copilot-system-prompt.md
│   ├── 📁 Task-Prompts/
│   │   ├── task-create-prompt.md
│   │   ├── workflow-design-prompt.md
│   │   └── code-help-prompt.md
│   └── 📁 Templates/
│       ├── prompt-template-tool.md
│       └── prompt-template-workflow.md
│
└── 📁 Workflows-Backup/                         # Backup workflows n8n
    ├── 📁 Daily/
    │   └── 2025-11-24/
    ├── 📁 Weekly/
    │   └── 2025-W47/
    └── 📁 Monthly/
        └── 2025-11/
```

---

## 🔄 Synchronisation automatique

### Workflow n8n: `sync-drive-github.json`

**Déclencheur**: Modification fichier dans Drive

**Actions**:
1. Google Drive Watch (webhook)
2. Détection fichier modifié
3. Download fichier depuis Drive
4. Déterminer repo GitHub correspondant (mapping)
5. Commit vers GitHub
6. Notification Telegram

**Mapping Drive → GitHub**:

| Dossier Drive | Repository GitHub | Branche |
|---------------|-------------------|---------|
| `01 - Prolex-Core/Docs/` | `prolex-core/docs/` | `main` |
| `02 - Prolex-Kimmy/Prompts/` | `prolex-kimmy/prompts/` | `main` |
| `03 - Prolex-Opex/Workflows/` | `prolex-opex/workflows/` | `main` |
| `06 - Prolex-RAG/Knowledge-Base/` | `prolex-rag/knowledge-base/` | `main` |
| etc. | ... | ... |

---

### MCP Google Drive Server

**Tools disponibles**:

```typescript
// Search files
await mcp.call("google_drive_search", {
  query: "name contains 'Architecture'",
  folder: "01 - Prolex-Core"
});

// Read file
await mcp.call("google_drive_read", {
  fileId: "1abc..."
});

// Create file
await mcp.call("google_drive_create", {
  name: "New-Doc.md",
  content: "...",
  folder: "01 - Prolex-Core/Docs"
});

// Update file
await mcp.call("google_drive_update", {
  fileId: "1abc...",
  content: "..."
});
```

---

## 📥 Migration initiale

### Étape 1: Créer structure Drive

**Script Google Apps Script**:

```javascript
// Create-Drive-Structure.gs
function createProlexStructure() {
  const rootFolderName = "Automatt - Prolex";

  // Create root folder
  const rootFolder = DriveApp.createFolder(rootFolderName);

  // Create structure
  const structure = {
    "01 - Prolex-Core": ["Docs", "Schemas", "Configs", "Logs"],
    "02 - Prolex-Kimmy": ["Docs", "Prompts", "Training-Data", "Metrics"],
    "03 - Prolex-Opex": ["Workflows", "Docs", "Execution-Logs", "Backup-Workflows"],
    // ... etc
  };

  for (const [folderName, subFolders] of Object.entries(structure)) {
    const folder = rootFolder.createFolder(folderName);

    subFolders.forEach(subFolder => {
      folder.createFolder(subFolder);
    });
  }

  Logger.log("Structure créée: " + rootFolder.getUrl());
}
```

---

### Étape 2: Migrer documents existants

**Plan migration**:

1. **Identifier documents actuels** dans Drive
2. **Mapper vers nouvelle structure**
3. **Déplacer (ou copier)** vers nouveaux dossiers
4. **Valider** que rien n'est perdu
5. **Archiver** ancienne structure

**Script PowerShell local**:

```powershell
# Sync-LocalToDrive.ps1
# Upload documents locaux vers Drive

$mapping = @{
    "C:\Users\...\docs\architecture\" = "01 - Prolex-Core/Docs/"
    "C:\Users\...\rag\tools\" = "06 - Prolex-RAG/Knowledge-Base/Tools/"
    # ...
}

foreach ($local in $mapping.Keys) {
    $drivePath = $mapping[$local]

    # Upload via rclone ou Drive API
    rclone copy $local "drive:Automatt - Prolex/$drivePath"
}
```

---

### Étape 3: Configurer synchronisation

**n8n workflow**: `sync-drive-github.json`

**Configuration**:
1. Créer webhook Google Drive
2. Mapper dossiers Drive → repos GitHub
3. Configurer authentification (OAuth2)
4. Tester sync avec fichier test
5. Activer workflow

---

## 🔐 Permissions et partage

### Structure permissions

| Dossier | Permissions |
|---------|------------|
| **Racine** (`Automatt - Prolex`) | Matthieu (propriétaire) |
| **Docs publiques** (`09 - Prolex-Docs/Public-Docs`) | Équipe (lecture) |
| **Docs internes** (`09 - Prolex-Docs/Internal-Docs`) | Équipe (édition) |
| **Configs** (tous) | Matthieu seul (lecture/écriture) |
| **Logs** (tous) | Équipe (lecture), système (écriture) |

### Partage par dossier

```javascript
// Share-Folders.gs
function shareFolders() {
  const publicDocsFolder = DriveApp.getFolderById("...");

  // Partager avec équipe (lecture seule)
  publicDocsFolder.addViewer("team@automatt.ai");

  // Partager docs internes (édition)
  const internalDocsFolder = DriveApp.getFolderById("...");
  internalDocsFolder.addEditor("team@automatt.ai");
}
```

---

## 📊 Monitoring et maintenance

### Métriques à surveiller

1. **Taille totale Drive**: < 15 GB (plan gratuit)
2. **Nombre de fichiers**: ~ 5000-10000
3. **Sync errors**: 0
4. **Fichiers orphelins**: 0
5. **Duplicatas**: 0

### Maintenance mensuelle

- [ ] Nettoyer fichiers obsolètes
- [ ] Compresser logs anciens
- [ ] Valider backups
- [ ] Vérifier permissions
- [ ] Auditer synchronisation

---

## 🛠️ Outils recommandés

### 1. rclone (Sync local ↔ Drive)

```bash
# Install
choco install rclone

# Configure
rclone config

# Sync
rclone sync "C:\Users\...\Prolex" "drive:Automatt - Prolex"
```

---

### 2. Google Drive Desktop (App officielle)

- Sync automatique bidirectionnel
- Accès hors-ligne
- Streaming files (économie espace disque)

**Configuration**:
- Stream tous fichiers (ne pas synchroniser localement)
- Seulement dossiers importants en local

---

### 3. Apps Script (Automatisation Drive)

- Création structure automatique
- Nettoyage périodique
- Reports automatiques
- Sharing automation

---

## 📚 Documentation complémentaire

- [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)
- [rclone Docs](https://rclone.org/docs/)
- [Apps Script](https://developers.google.com/apps-script)

---

## ✅ Checklist implémentation

- [ ] Créer dossier racine "Automatt - Prolex"
- [ ] Exécuter script création structure
- [ ] Migrer documents existants
- [ ] Configurer MCP Google Drive
- [ ] Créer workflow n8n sync Drive ↔ GitHub
- [ ] Tester synchronisation (upload test file)
- [ ] Configurer permissions équipe
- [ ] Installer rclone local (optionnel)
- [ ] Installer Google Drive Desktop (optionnel)
- [ ] Documenter workflow sync pour équipe

---

**Date création**: 2025-11-24
**Auteur**: Claude Code Assistant
**Version**: 1.0
**Status**: 🚧 À implémenter
