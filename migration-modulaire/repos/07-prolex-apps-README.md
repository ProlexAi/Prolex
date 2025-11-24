# 🖥️ Prolex Apps

> **Applications desktop Electron/Node pour Prolex**
> **Repository**: `ProlexAi/prolex-apps`
> **Visibilité**: 🔓 PUBLIC
> **Langage principal**: TypeScript + React

---

## 🎯 Vue d'ensemble

**Prolex Apps** regroupe les applications desktop:
- **Atmtt Viewer**: Visualisateur de workflows n8n
- **Prolex Dashboard**: Dashboard monitoring Prolex
- **Prolex Tools Manager**: Gestionnaire outils Windows
- Et futures applications...

**Technologies**: Electron + React + TypeScript

---

## 🎭 Rôle et responsabilités

### Responsabilités principales

1. **Applications Electron**: Build multi-plateforme (Windows/Mac/Linux)
2. **Interfaces utilisateur**: React + Material-UI/Ant Design
3. **Intégrations**: API Prolex Core, n8n, Drive
4. **Auto-update**: Mises à jour automatiques
5. **Packaging**: Binaires distribués via GitHub Releases

---

## 🧠 Pour les IA développeurs

### Quoi coder ici

- [x] **Atmtt Viewer** (`packages/atmtt-viewer/`) ✅ EXISTANT
  - Visualisation workflows n8n
  - Graphe de nodes
  - Exécution tests
  - Export images

- [x] **Prolex Dashboard** (`packages/prolex-dashboard/`) 🆕
  - Monitoring temps réel
  - Graphiques métriques (requests, costs, success rate)
  - Gestion workflows (activer/désactiver)
  - Configuration autonomy levels
  - Logs SystemJournal

- [x] **Prolex Tools Manager** (`packages/prolex-tools-manager/`) 🆕
  - Gestionnaire outils Windows
  - Scripts automatisation
  - Nettoyage système
  - Customization Windows

- [x] **Code partagé** (`shared/`)
  - Composants UI réutilisables
  - Hooks React
  - Utils (API clients, formatters)

### Où coder

```
packages/
├── atmtt-viewer/              ✅ Existant
│   ├── electron/
│   │   ├── main.ts            # Process principal
│   │   └── preload.ts         # Preload script
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── WorkflowGraph.tsx
│   │   │   ├── NodeDetails.tsx
│   │   │   └── ExecutionPanel.tsx
│   │   └── services/
│   │       └── n8nService.ts
│   ├── public/
│   ├── package.json
│   └── electron-builder.yml
│
├── prolex-dashboard/          🆕 À créer
│   ├── electron/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx  # Métriques temps réel
│   │   │   ├── Workflows.tsx  # Gestion workflows
│   │   │   ├── Logs.tsx       # SystemJournal
│   │   │   └── Config.tsx     # Configuration
│   │   └── components/
│   │       ├── MetricsChart.tsx
│   │       ├── WorkflowList.tsx
│   │       └── LogViewer.tsx
│   └── package.json
│
├── prolex-tools-manager/      🆕 À créer
│   └── ...
│
└── shared/                    # Code partagé
    ├── components/
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   └── Modal.tsx
    ├── hooks/
    │   ├── useAPI.ts
    │   └── useWebSocket.ts
    └── utils/
        ├── apiClient.ts
        └── formatters.ts
```

### Comment coder

**Stack**:
- **Electron**: Framework desktop
- **React**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool (fast HMR)
- **Material-UI** ou **Ant Design**: Component library
- **Recharts**: Graphiques
- **Electron Builder**: Packaging

**Architecture Electron**:
```
┌──────────────────────────────────────┐
│ Main Process (Node.js)               │
│ - Window management                  │
│ - System access                      │
│ - IPC communication                  │
└────────────┬─────────────────────────┘
             │ IPC
┌────────────▼─────────────────────────┐
│ Renderer Process (Chromium)          │
│ - React app                          │
│ - UI rendering                       │
│ - API calls (via preload)            │
└──────────────────────────────────────┘
```

**IPC Communication**:
```typescript
// electron/main.ts
ipcMain.handle('get-workflows', async () => {
  const workflows = await n8nClient.getWorkflows();
  return workflows;
});

// src/services/electronAPI.ts
export const electronAPI = {
  getWorkflows: () => ipcRenderer.invoke('get-workflows')
};

// src/components/WorkflowList.tsx
const workflows = await electronAPI.getWorkflows();
```

---

## 📦 Applications

### 1. Atmtt Viewer ✅

**Description**: Visualisateur de workflows n8n

**Features**:
- 📊 Graphe interactif de workflows
- 🔍 Détails de chaque node
- ▶️ Exécution de tests
- 📸 Export images (PNG, SVG)
- 🔄 Reload automatique

**Screenshots**:
![Atmtt Viewer](docs/screenshots/atmtt-viewer.png)

**Installation**:
```bash
cd packages/atmtt-viewer
pnpm install
pnpm dev  # Development mode
pnpm build  # Build app
pnpm package  # Package .exe/.dmg/.AppImage
```

---

### 2. Prolex Dashboard 🆕

**Description**: Dashboard de monitoring Prolex

**Features**:
- 📈 Métriques temps réel (requests, costs, latency)
- 🔧 Gestion workflows (activer/désactiver, tester)
- 📜 Logs SystemJournal (recherche, filtres)
- ⚙️ Configuration (autonomy levels, API keys)
- 🚨 Alertes (errors, high costs)
- 📊 Rapports (daily/weekly analytics)

**Pages**:
1. **Dashboard**: Overview + métriques
2. **Workflows**: Liste workflows + contrôles
3. **Logs**: Viewer SystemJournal
4. **Config**: Settings Prolex

**Technologie**:
- React + TypeScript
- Recharts (graphiques)
- WebSocket (live updates)
- Material-UI

---

### 3. Prolex Tools Manager 🆕

**Description**: Gestionnaire d'outils Windows

**Features**:
- 🧹 Nettoyage système (temp files, caches)
- 🗂️ Organisation automatique dossiers
- 🎨 Customization Windows (registry tweaks)
- 📝 Scripts automatisation
- 🔒 Backup/restore configs

**Use cases**:
- Nettoyage automatique Desktop
- Masquage dossiers par défaut Windows
- Organisation workspace dev

---

## 🛠️ Développement

### Setup monorepo

```bash
git clone git@github.com:ProlexAi/prolex-apps.git
cd prolex-apps
pnpm install  # Install toutes dépendances

# Dev mode (hot reload)
pnpm --filter atmtt-viewer dev
pnpm --filter prolex-dashboard dev

# Build
pnpm build  # Build toutes apps

# Package
pnpm --filter atmtt-viewer package
```

---

### Créer nouvelle app

```bash
# Script de création
pnpm run create:app my-new-app

# Structure créée:
# packages/my-new-app/
#   ├── electron/
#   ├── src/
#   ├── public/
#   ├── package.json
#   └── electron-builder.yml

cd packages/my-new-app
pnpm dev
```

---

## 🧪 Tests

```bash
# Tests unitaires (React)
pnpm test

# Tests E2E (Playwright)
pnpm test:e2e

# App spécifique
pnpm --filter atmtt-viewer test
```

---

## 📦 Build & Release

### Build multi-plateforme

```bash
# Windows
pnpm --filter atmtt-viewer package:win

# macOS
pnpm --filter atmtt-viewer package:mac

# Linux
pnpm --filter atmtt-viewer package:linux

# All platforms
pnpm --filter atmtt-viewer package:all
```

### Electron Builder config

```yaml
# electron-builder.yml
appId: ai.automatt.atmttviewer
productName: Atmtt Viewer
directories:
  output: dist
  buildResources: build

win:
  target:
    - nsis
    - portable
  icon: build/icon.ico

mac:
  target:
    - dmg
    - zip
  icon: build/icon.icns
  category: public.app-category.developer-tools

linux:
  target:
    - AppImage
    - deb
  icon: build/icon.png
  category: Development
```

---

### Auto-update

```typescript
// electron/main.ts
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    message: 'Une mise à jour est disponible'
  });
});

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});
```

---

### GitHub Release

```bash
# Tag version
npm version patch  # ou minor/major

# Push tag
git push --tags

# GitHub Action build & release automatique
# Artifacts: .exe, .dmg, .AppImage uploadés sur release
```

---

## 🎨 UI/UX Guidelines

### Design system

- **Colors**: Material Design palette
- **Typography**: Roboto, Inter
- **Icons**: Material Icons
- **Spacing**: 8px grid
- **Components**: Material-UI

### Accessibilité

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Font scaling

---

## 📚 Documentation

- [Architecture Electron](docs/ELECTRON_ARCHITECTURE.md)
- [Build Guide](docs/BUILDING.md)
- [UI Components](docs/COMPONENTS.md)
- [Contributing](docs/CONTRIBUTING.md)

---

## 🔗 Liens utiles

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Electron Builder](https://www.electron.build/)
- [Material-UI](https://mui.com/)

---

## 📄 License

MIT License - Open Source

Voir [LICENSE](LICENSE)
