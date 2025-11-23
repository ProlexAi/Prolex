# 📝 AtmttViewer

**AtmttViewer** est une application de bureau simple et élégante pour Windows qui permet de visualiser, éditer et gérer vos fichiers texte et Markdown.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/Electron-28.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Fonctionnalités

- 📁 **Navigation de fichiers** : Parcourez facilement vos dossiers et fichiers
- 📝 **Support Markdown** : Éditeur et prévisualisation en temps réel pour les fichiers `.md`
- 🔧 **Multi-formats** : Support de `.md`, `.txt`, `.json`, `.yaml`, `.yml`, `.log`
- 💾 **Édition en direct** : Modifiez et sauvegardez vos fichiers directement
- 🔍 **Recherche** : Trouvez rapidement vos fichiers par nom
- ⚙️ **Dossier configurable** : Changez facilement le dossier racine
- 🚀 **Ouverture rapide** : Ouvrez des fichiers directement depuis l'explorateur Windows
- 🎨 **Interface moderne** : Design sombre et épuré

---

## 📦 Installation

### Prérequis

- [Node.js](https://nodejs.org/) version 16 ou supérieure
- npm (inclus avec Node.js)

### Étapes d'installation

1. **Clonez ou téléchargez** le projet dans un dossier `AtmttViewer`

2. **Installez les dépendances** :

   ```bash
   cd AtmttViewer
   npm install
   ```

3. **Lancez l'application** :

   ```bash
   npm start
   ```

---

## 🚀 Utilisation

### Lancement de l'application

```bash
npm start
```

L'application s'ouvre avec :
- **Colonne gauche** : Liste des fichiers dans le dossier configuré
- **Colonne droite** : Éditeur/visualiseur de fichiers

### Navigation

1. **Parcourir les fichiers** : Cliquez sur un fichier dans la liste de gauche
2. **Rechercher** : Utilisez la barre de recherche en haut de la liste
3. **Modifier** : Éditez directement le contenu dans la zone de texte
4. **Enregistrer** : Cliquez sur "💾 Enregistrer" ou utilisez `Ctrl+S`

### Fichiers Markdown (.md)

Pour les fichiers Markdown, vous avez deux modes :

1. **Mode Édition** : Modifiez le contenu Markdown
2. **Mode Aperçu** : Visualisez le rendu HTML

Basculez entre les deux modes avec :
- Le bouton **"👁️ Aperçu"** / **"✏️ Éditer"**
- Le raccourci clavier `Ctrl+P`

---

## ⚙️ Configuration

### Fichier `config.json`

Le fichier `config.json` contient la configuration de l'application :

```json
{
  "rootDir": "C:\\Users\\Matthieu\\Documents\\Docs"
}
```

#### Modifier le dossier racine

**Méthode 1 : Via l'interface**

1. Cliquez sur le bouton **🔄** en haut de la liste de fichiers
2. Sélectionnez le nouveau dossier dans la fenêtre qui s'ouvre
3. La configuration est automatiquement mise à jour

**Méthode 2 : Manuellement**

1. Fermez l'application
2. Ouvrez le fichier `config.json`
3. Modifiez la valeur de `rootDir`
4. Enregistrez et relancez l'application

---

## 🎯 Formats supportés

| Extension | Icône | Fonctionnalités |
|-----------|-------|-----------------|
| `.md` | 📝 | Édition + Prévisualisation Markdown |
| `.txt` | 📄 | Édition texte brut |
| `.json` | 🔧 | Édition avec police monospace |
| `.yaml`, `.yml` | ⚙️ | Édition avec police monospace |
| `.log` | 📋 | Édition avec police monospace |

---

## 🔗 Ouvrir un fichier depuis l'explorateur Windows

### Ouverture directe par ligne de commande

Vous pouvez ouvrir un fichier spécifique en le passant en argument :

```bash
atmttviewer.exe "C:\chemin\vers\fichier.md"
```

**Note** : Le fichier peut se trouver n'importe où, pas nécessairement dans le dossier racine configuré.

### Définir comme programme par défaut (optionnel)

Pour ouvrir automatiquement les fichiers `.md` avec AtmttViewer :

1. **Faites un clic droit** sur un fichier `.md`
2. Sélectionnez **"Ouvrir avec" → "Choisir une autre application"**
3. Cliquez sur **"Plus d'applications"** puis **"Rechercher une autre application sur ce PC"**
4. Naviguez vers `AtmttViewer.exe` (après avoir compilé l'application)
5. Cochez **"Toujours utiliser cette application"**

---

## ⌨️ Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+S` | Enregistrer le fichier actuel |
| `Ctrl+P` | Basculer entre Édition et Aperçu (fichiers .md uniquement) |

---

## 🏗️ Architecture du code

```
AtmttViewer/
  ├── package.json          # Dépendances et scripts npm
  ├── config.json           # Configuration (dossier racine)
  ├── main.js               # Processus principal Electron
  ├── src/
  │   ├── renderer.html     # Interface utilisateur (HTML)
  │   ├── renderer.js       # Logique frontend (JavaScript)
  │   └── styles.css        # Styles CSS
  └── README.md             # Ce fichier
```

### Fichiers principaux

- **`main.js`** : Processus principal Electron
  - Création de la fenêtre
  - Gestion des IPC (communication inter-processus)
  - Lecture/écriture de fichiers
  - Gestion du fichier de configuration

- **`renderer.js`** : Logique frontend
  - Affichage de la liste de fichiers
  - Gestion de l'éditeur
  - Rendu Markdown (via la librairie `marked`)
  - Interaction utilisateur

- **`styles.css`** : Styles de l'interface
  - Layout en 2 colonnes
  - Thème sombre moderne
  - Styles pour le rendu Markdown

---

## 📦 Compilation et distribution

### Créer un exécutable Windows

Pour créer un fichier `.exe` distribuable :

1. **Installez electron-builder** (déjà inclus dans `devDependencies`)

2. **Compilez l'application** :

   ```bash
   npm run build
   ```

3. L'exécutable sera généré dans le dossier `dist/`

### Configuration de la compilation

La configuration de compilation se trouve dans `package.json` sous la clé `build` :

```json
"build": {
  "appId": "com.automatt.atmttviewer",
  "productName": "AtmttViewer",
  "win": {
    "target": "nsis",
    "icon": "build/icon.ico"
  }
}
```

**Note** : Pour ajouter une icône personnalisée, placez un fichier `icon.ico` dans un dossier `build/` à la racine du projet.

---

## 🛠️ Développement

### Structure du projet

- **Frontend** : HTML + CSS + JavaScript (vanilla, sans framework)
- **Backend** : Node.js (via Electron)
- **Rendu Markdown** : Librairie `marked`

### Modification du code

1. **Modifiez les fichiers** dans `src/` ou `main.js`
2. **Relancez l'application** avec `npm start`
3. Les modifications sont prises en compte automatiquement

### Mode développement

Pour activer les DevTools automatiquement, définissez la variable d'environnement :

```bash
set NODE_ENV=development
npm start
```

---

## 🐛 Dépannage

### L'application ne démarre pas

- Vérifiez que Node.js est installé : `node --version`
- Vérifiez que les dépendances sont installées : `npm install`
- Vérifiez les logs dans la console

### Les fichiers ne s'affichent pas

- Vérifiez que le `rootDir` dans `config.json` est valide
- Vérifiez que le dossier contient des fichiers avec les extensions supportées
- Utilisez le bouton 🔄 pour changer de dossier

### L'enregistrement ne fonctionne pas

- Vérifiez que vous avez les permissions d'écriture sur le fichier
- Vérifiez que le fichier n'est pas ouvert dans un autre programme

---

## 📄 Licence

MIT License - © 2025 Matthieu - Automatt.ai

---

## 🤝 Contribution

Ce projet est principalement destiné à un usage personnel, mais les suggestions et améliorations sont les bienvenues !

---

## 📞 Support

Pour toute question ou problème :
- **Email** : matthieu@automatt.ai
- **GitHub** : [ProlexAi/Prolex](https://github.com/ProlexAi/Prolex)

---

**Fait avec ❤️ par Matthieu - Automatt.ai**
