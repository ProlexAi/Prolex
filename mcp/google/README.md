# MCP Google Workspace Server v1.0.0

> **Intégration complète Google Workspace pour Prolex via Model Context Protocol**

Serveur MCP fournissant 18 outils pour interagir avec Google Workspace (Sheets, Drive, Calendar, Gmail, Tasks).

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Services & Tools](#services--tools)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Utilisation](#utilisation)
6. [Exemples](#exemples)
7. [Sécurité](#sécurité)

---

## 🎯 Vue d'ensemble

Ce serveur MCP permet aux agents IA (Prolex, Claude) d'interagir avec les services Google Workspace:

| Service | Tools | Fonctionnalités |
|---------|-------|-----------------|
| **Sheets** | 4 | Lecture, écriture, ajout, création de feuilles |
| **Drive** | 3 | Liste, upload, suppression de fichiers |
| **Calendar** | 3 | Liste, création, suppression d'événements |
| **Gmail** | 3 | Liste, envoi, lecture d'emails |
| **Tasks** | 3 | Liste, création, complétion de tâches |

**Total**: 18 tools MCP

---

## 🛠️ Services & Tools

### 📊 Google Sheets (4 tools)

| Tool | Description | Paramètres |
|------|-------------|------------|
| `sheets_read` | Lire des données | spreadsheetId, range |
| `sheets_write` | Écrire/écraser des données | spreadsheetId, range, values |
| `sheets_append` | Ajouter des lignes | spreadsheetId, range, values |
| `sheets_create` | Créer une nouvelle feuille | spreadsheetId, sheetTitle |

### 📁 Google Drive (3 tools)

| Tool | Description | Paramètres |
|------|-------------|------------|
| `drive_list` | Lister fichiers | query, folderId, maxResults |
| `drive_upload` | Upload un fichier | filename, content, folderId, mimeType |
| `drive_delete` | Supprimer un fichier | fileId |

### 📅 Google Calendar (3 tools)

| Tool | Description | Paramètres |
|------|-------------|------------|
| `calendar_list_events` | Lister événements | calendarId, timeMin, timeMax, maxResults |
| `calendar_create_event` | Créer un événement | summary, startDateTime, endDateTime, description, location, attendees |
| `calendar_delete_event` | Supprimer un événement | eventId, calendarId |

### 📧 Gmail (3 tools)

| Tool | Description | Paramètres |
|------|-------------|------------|
| `gmail_list` | Lister emails | query, maxResults |
| `gmail_send` | Envoyer un email | to, subject, body, cc, isHtml |
| `gmail_read` | Lire un email | messageId |

### ✅ Google Tasks (3 tools)

| Tool | Description | Paramètres |
|------|-------------|------------|
| `tasks_list` | Lister tâches | taskListId, showCompleted, maxResults |
| `tasks_create` | Créer une tâche | title, notes, due, taskListId |
| `tasks_complete` | Marquer comme complété | taskId, taskListId |

---

## 📦 Installation

```bash
# Se placer dans le répertoire MCP Google
cd mcp/google

# Installer les dépendances
npm install

# Compiler TypeScript
npm run build
```

**Dépendances principales**:
- `@modelcontextprotocol/sdk` (MCP SDK)
- `googleapis` (Google APIs Client)
- `google-auth-library` (Authentification)
- `zod` (Validation des schémas)

---

## ⚙️ Configuration

### 1. Créer un Service Account Google

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet (ou utiliser existant)
3. Activer les APIs nécessaires:
   - Google Sheets API
   - Google Drive API
   - Google Calendar API
   - Gmail API
   - Google Tasks API
4. Créer un Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Nom: `prolex-google-workspace`
   - Rôle: `Editor` ou rôles spécifiques selon besoins
5. Créer une clé JSON:
   - Actions → Manage keys → Add Key → Create new key → JSON
   - Télécharger le fichier JSON

### 2. Configurer les variables d'environnement

Créer un fichier `.env` dans `mcp/google/`:

```bash
# Contenu complet du fichier JSON du Service Account
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

⚠️ **IMPORTANT**: Le fichier JSON doit être sur une seule ligne, entre guillemets simples.

### 3. Donner accès au Service Account

Pour que le Service Account puisse accéder à vos ressources Google, vous devez lui donner explicitement accès:

**Google Sheets**:
- Partager le spreadsheet avec l'email du Service Account (trouvé dans le JSON: `client_email`)
- Donner les permissions `Editor` ou `Viewer` selon les besoins

**Google Drive**:
- Partager les dossiers/fichiers avec l'email du Service Account

**Gmail** (pour envoi):
- Activer "Domain-wide Delegation" dans le Service Account
- Configurer OAuth Scopes dans Admin Console

**Google Calendar**:
- Partager le calendrier avec le Service Account

---

## 🚀 Utilisation

### Démarrage du serveur

```bash
# Mode production
npm start

# Mode développement (rebuild auto)
npm run dev
```

### Configuration MCP (Claude Desktop)

Ajouter dans `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/home/user/Prolex/mcp/google/dist/index.js"],
      "env": {
        "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS": "{...}"
      }
    }
  }
}
```

---

## 💡 Exemples

### Exemple 1: Lire un Google Sheet

```typescript
{
  "tool": "sheets_read",
  "arguments": {
    "spreadsheetId": "1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk",
    "range": "SystemJournal!A1:E100"
  }
}
```

**Résultat**:
```json
{
  "success": true,
  "spreadsheetId": "1xEEt...",
  "range": "SystemJournal!A1:E100",
  "rowCount": 100,
  "columnCount": 5,
  "values": [
    ["timestamp", "agent", "action", "status", "details"],
    ["2025-11-23T10:00:00Z", "prolex", "task_create", "success", "{}"],
    ...
  ]
}
```

### Exemple 2: Envoyer un email Gmail

```typescript
{
  "tool": "gmail_send",
  "arguments": {
    "to": "matthieu@automatt.ai",
    "subject": "Rapport quotidien Prolex",
    "body": "Bonjour Matthieu,\n\nVoici le rapport quotidien...\n\nCordialement,\nProlex",
    "isHtml": false
  }
}
```

**Résultat**:
```json
{
  "success": true,
  "message": "✅ Email envoyé: \"Rapport quotidien Prolex\"",
  "messageId": "18c3a4b5e6f7g8h9"
}
```

### Exemple 3: Créer un événement Calendar

```typescript
{
  "tool": "calendar_create_event",
  "arguments": {
    "summary": "Réunion Prolex v5",
    "description": "Discussion architecture future",
    "startDateTime": "2025-11-24T14:00:00+01:00",
    "endDateTime": "2025-11-24T15:00:00+01:00",
    "location": "Zoom",
    "attendees": ["matthieu@automatt.ai"]
  }
}
```

**Résultat**:
```json
{
  "success": true,
  "message": "✅ Événement \"Réunion Prolex v5\" créé",
  "eventId": "abc123def456"
}
```

### Exemple 4: Uploader un fichier sur Drive

```typescript
{
  "tool": "drive_upload",
  "arguments": {
    "filename": "backup_logs.json",
    "content": "{\"logs\": [...]}",
    "folderId": "1A2B3C4D5E6F7G8H9",
    "mimeType": "application/json"
  }
}
```

**Résultat**:
```json
{
  "success": true,
  "message": "✅ Fichier \"backup_logs.json\" uploadé",
  "fileId": "xyz789abc123",
  "webViewLink": "https://drive.google.com/file/d/xyz789abc123/view"
}
```

### Exemple 5: Créer une tâche Google Tasks

```typescript
{
  "tool": "tasks_create",
  "arguments": {
    "title": "Réviser architecture Prolex v5",
    "notes": "Préparer specs détaillées pour LogRAG",
    "due": "2025-11-30T23:59:59Z"
  }
}
```

**Résultat**:
```json
{
  "success": true,
  "message": "✅ Tâche \"Réviser architecture Prolex v5\" créée",
  "taskId": "task_abc123"
}
```

---

## 🔒 Sécurité

### Bonnes pratiques

✅ **DO**:
- Utiliser un Service Account dédié par environnement (dev/staging/prod)
- Donner uniquement les permissions nécessaires (principe du moindre privilège)
- Stocker les credentials dans des variables d'environnement (jamais dans Git)
- Activer l'audit logging dans Google Cloud Console
- Renouveler les clés régulièrement (tous les 90 jours)

❌ **DON'T**:
- Ne jamais committer le fichier JSON du Service Account
- Ne pas donner `Owner` comme rôle (trop de permissions)
- Ne pas partager les credentials entre environnements
- Ne pas désactiver les logs d'audit

### Permissions Google Cloud

**Scopes OAuth minimum requis**:
- `https://www.googleapis.com/auth/spreadsheets` (Sheets: lecture/écriture)
- `https://www.googleapis.com/auth/drive` (Drive: complet)
- `https://www.googleapis.com/auth/calendar` (Calendar: complet)
- `https://www.googleapis.com/auth/gmail.send` (Gmail: envoi uniquement)
- `https://www.googleapis.com/auth/gmail.readonly` (Gmail: lecture)
- `https://www.googleapis.com/auth/tasks` (Tasks: complet)

### Rate Limiting

Google APIs ont des quotas par défaut:

| API | Quota par jour | Quota par minute |
|-----|----------------|------------------|
| Sheets | 500 requests/100s/user | Illimité |
| Drive | 1,000,000,000 queries/day | 1,000 queries/100s/user |
| Calendar | 1,000,000 queries/day | 500 queries/100s/user |
| Gmail | 1,000,000,000 quota units/day | Variable |
| Tasks | 50,000 requests/day | 600 requests/minute |

Le serveur MCP ne gère pas automatiquement le rate limiting. Il est recommandé d'implémenter un système de retry avec exponential backoff.

---

## 🐛 Troubleshooting

### Erreur: "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS not set"

**Solution**: Vérifier que la variable d'environnement est bien définie dans `.env` et que le fichier est chargé (présence de `dotenv/config`).

### Erreur: "Error: invalid_grant" (authentification échouée)

**Causes possibles**:
1. La clé privée (`private_key`) est mal formatée
2. Le Service Account a été supprimé
3. L'heure système est désynchronisée

**Solution**: Régénérer une nouvelle clé JSON pour le Service Account.

### Erreur: "The caller does not have permission"

**Solution**: Vérifier que:
1. Les APIs sont activées dans Google Cloud Console
2. Le Service Account a les permissions nécessaires sur les ressources
3. Les ressources (Sheets, Drive, Calendar) sont partagées avec l'email du Service Account

---

## 📚 Références

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Drive API](https://developers.google.com/drive/api)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Gmail API](https://developers.google.com/gmail/api)
- [Google Tasks API](https://developers.google.com/tasks/reference/rest)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)

---

**Maintenu par**: Backend Team Prolex
**Version**: 1.0.0
**Date**: 2025-11-23
**Status**: ✅ Production Ready
