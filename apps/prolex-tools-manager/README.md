# 🛠️ Prolex Tools Manager

**Panneau de contrôle centralisé** pour gérer tous les outils et applications Prolex.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/Electron-28.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Fonctionnalités

- 📱 **Gestion centralisée** : Tous vos outils Prolex au même endroit
- 📦 **Installation automatique** : Installez tous les outils en un clic
- ▶️ **Lancement rapide** : Démarrez n'importe quel outil instantanément
- 🔄 **Actualisation en temps réel** : Statut des outils mis à jour automatiquement
- 🎯 **Filtres par catégorie** : Applications, outils, ou tout afficher
- 📊 **Statistiques** : Vue d'ensemble de vos outils installés
- 🎨 **Interface moderne** : Design sombre et épuré
- 🪟 **Intégration Windows** : Support des outils Windows (registre, etc.)

---

## 📋 Outils gérés

### Applications (📱)

| Outil | Description | Actions |
|-------|-------------|---------|
| **AtmttViewer** | Visualiseur et éditeur Markdown | Install, Start, Build |
| **Docker Panel** | Panneau de contrôle Docker | Install, Start, Build |
| **Prolex Run Logger** | Logger centralisé | Install, Start, Dev |
| **Web Scraper** | Scraping web | Install, Start, Dev |

### Outils (🔧)

| Outil | Description | Actions |
|-------|-------------|---------|
| **Windows Registry Tools** | Masquer/restaurer dossiers Windows | Hide, Restore, Docs |
| **Filter Workflows** | Filtrage workflows n8n | Execute |

---

## 📦 Installation

### Prérequis

- [Node.js](https://nodejs.org/) version 16 ou supérieure
- npm (inclus avec Node.js)
- Windows 10/11 (recommandé)

### Installation rapide

```bash
cd apps/prolex-tools-manager
npm install
npm start
```

### Installation complète (depuis la racine)

Utilisez le script d'installation automatique :

```bash
# Depuis la racine du projet Prolex
.\install-tools.bat
```

Ce script va :
1. Installer le Tools Manager
2. Installer tous les outils disponibles
3. Lancer le Tools Manager

---

## 🚀 Utilisation

### Lancement

```bash
npm start
```

Ou utilisez le raccourci créé sur votre bureau (si installé via `install-tools.bat`).

### Interface

L'application se compose de :

1. **Header** : Logo, bouton actualiser, bouton "Tout installer"
2. **Tabs** : Filtres par catégorie (Tout, Applications, Outils)
3. **Grille d'outils** : Cartes pour chaque outil avec actions disponibles
4. **Barre de statut** : Messages et statistiques

### Actions disponibles

Pour chaque outil, selon son type :

- **📦 Installer** : Installe les dépendances (`npm install`)
- **▶️ Démarrer** : Lance l'outil (`npm start`)
- **🔧 Dev** : Lance en mode développement (`npm run dev`)
- **🏗️ Build** : Compile l'outil (`npm run build`)
- **📁 Ouvrir** : Ouvre le dossier de l'outil
- **📖 Docs** : Ouvre la documentation

#### Actions spécifiques Windows Registry Tools

- **🙈 Masquer dossiers** : Exécute `hide-default-folders.reg`
- **👁️ Restaurer dossiers** : Exécute `restore-default-folders.reg`

### Boutons globaux

- **🔄 Actualiser** : Recharge la liste des outils et leur statut
- **📦 Tout installer** : Installe automatiquement tous les outils non installés

---

## ⚙️ Configuration

Le Tools Manager détecte automatiquement les outils dans :

- `apps/` : Applications Electron et Node.js
- `tools/` : Scripts et utilitaires

### Ajouter un nouvel outil

Pour ajouter un nouvel outil au gestionnaire :

1. **Créez le dossier** dans `apps/` ou `tools/`

2. **Modifiez `main.js`** : Ajoutez l'outil à la liste dans le handler `get-tools` :

```javascript
{
  id: 'mon-outil',
  name: 'Mon Outil',
  category: 'app', // ou 'tool'
  description: 'Description de mon outil',
  path: path.join(appsDir, 'mon-outil'),
  icon: '🎯',
  hasNodeModules: false,
  commands: {
    install: 'npm install',
    start: 'npm start'
  }
}
```

3. **Relancez le Tools Manager**

---

## 🏗️ Architecture

```
prolex-tools-manager/
  ├── package.json          # Dépendances et scripts
  ├── main.js               # Processus principal Electron
  ├── src/
  │   ├── index.html        # Interface HTML
  │   ├── styles.css        # Styles CSS
  │   └── renderer.js       # Logique frontend
  └── README.md             # Ce fichier
```

### Composants principaux

- **main.js** : Processus principal
  - Détection des outils
  - Gestion des commandes (install, start, etc.)
  - Communication IPC avec le renderer
  - Ouverture de fichiers/dossiers

- **renderer.js** : Interface utilisateur
  - Affichage des outils
  - Filtrage par catégorie
  - Gestion des actions
  - Mise à jour du statut

- **styles.css** : Design moderne
  - Thème sombre
  - Layout responsive
  - Animations fluides

---

## 📦 Compilation

### Créer un exécutable Windows

```bash
npm run build
```

L'exécutable sera généré dans `dist/`.

### Distribution

Pour distribuer le Tools Manager :

1. Compilez avec `npm run build`
2. L'installateur sera dans `dist/Prolex Tools Manager Setup.exe`
3. Distribuez cet installateur

---

## 🔧 Développement

### Mode développement

```bash
npm run dev
```

Cela ouvre les DevTools automatiquement.

### Modification du code

1. Modifiez les fichiers dans `src/` ou `main.js`
2. Relancez avec `npm start`
3. Les changements sont pris en compte

---

## 🛠️ Dépannage

### L'application ne démarre pas

- Vérifiez Node.js : `node --version`
- Réinstallez les dépendances : `npm install`
- Vérifiez les logs dans la console

### Un outil n'apparaît pas

- Vérifiez que le dossier existe
- Vérifiez que l'outil est ajouté dans `main.js`
- Cliquez sur "🔄 Actualiser"

### Les boutons sont désactivés

- Les boutons Start/Dev/Build sont désactivés si l'outil n'est pas installé
- Cliquez d'abord sur "📦 Installer"

### L'installation échoue

- Vérifiez votre connexion Internet
- Vérifiez que npm fonctionne : `npm --version`
- Essayez d'installer manuellement dans le dossier de l'outil

---

## 📊 Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+R` | Actualiser (à implémenter) |
| `F5` | Recharger l'application |
| `Ctrl+Shift+I` | Ouvrir DevTools |

---

## 🎯 Fonctionnalités futures

- [ ] Mise à jour automatique des outils
- [ ] Gestion des versions
- [ ] Logs d'exécution intégrés
- [ ] Notifications système
- [ ] Raccourcis clavier personnalisables
- [ ] Thème clair/sombre configurable
- [ ] Export/import de configuration
- [ ] Gestion des favoris

---

## 📄 Licence

MIT License - © 2025 Matthieu - Automatt.ai

---

## 🤝 Contribution

Ce projet fait partie de l'écosystème Prolex. Pour contribuer :

1. Fork le repository
2. Créez une branche feature
3. Commitez vos changements
4. Ouvrez une Pull Request

---

## 📞 Support

Pour toute question ou problème :
- **Email** : matthieu@automatt.ai
- **GitHub** : [ProlexAi/Prolex](https://github.com/ProlexAi/Prolex)
- **Documentation** : [INDEX_PROLEX.md](../../INDEX_PROLEX.md)

---

**Fait avec ❤️ par Matthieu - Automatt.ai**
