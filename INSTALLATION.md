# 🚀 Guide d'installation - Prolex Tools

Ce guide explique comment installer tous les outils Prolex sur votre PC Windows.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **Node.js 16+** installé
   - Télécharger depuis : https://nodejs.org/
   - Vérifier : Ouvrir PowerShell et taper `node --version`

2. **Git** installé (si pas déjà fait)
   - Télécharger depuis : https://git-scm.com/
   - Vérifier : `git --version`

3. **Repository cloné**
   ```bash
   git clone https://github.com/ProlexAi/Prolex.git
   cd Prolex
   ```

---

## 🎯 Installation automatique (Recommandée)

### Méthode 1 : Installation complète en 1 clic

1. **Ouvrez PowerShell** ou **l'Invite de commandes** en tant qu'administrateur

2. **Naviguez** vers le dossier Prolex :
   ```cmd
   cd C:\Users\Matthieu\Documents\GitHub\Prolex
   ```
   *(Adaptez le chemin selon votre configuration)*

3. **Lancez le script d'installation** :
   ```cmd
   .\install-tools.bat
   ```

4. **Le script va automatiquement** :
   - ✅ Vérifier que Node.js est installé
   - 📦 Installer le Tools Manager
   - 📦 Installer toutes les applications (AtmttViewer, Docker Panel, Run Logger, Web Scraper)
   - 🔗 Créer un raccourci sur votre bureau
   - 🚀 Proposer de lancer le Tools Manager

5. **Suivez les instructions** à l'écran

---

## 🛠️ Installation manuelle (Alternative)

Si vous préférez installer manuellement :

### 1. Installer le Tools Manager

```cmd
cd apps\prolex-tools-manager
npm install
```

### 2. Lancer le Tools Manager

```cmd
npm start
```

### 3. Utiliser le Tools Manager pour installer le reste

Une fois le Tools Manager ouvert :
1. Cliquez sur le bouton **"📦 Tout installer"** en haut à droite
2. Le Tools Manager va installer automatiquement toutes les applications
3. Attendez la fin de l'installation
4. Les boutons "▶️ Démarrer" seront activés pour chaque application

---

## 📱 Lancer les applications

### Via le Tools Manager (Recommandé)

1. **Ouvrez le Tools Manager** :
   - Double-cliquez sur le raccourci bureau "Prolex Tools Manager"
   - OU : `cd apps\prolex-tools-manager && npm start`

2. **Gérez vos outils** :
   - Cliquez sur "▶️ Démarrer" pour lancer une application
   - Cliquez sur "📁 Ouvrir" pour ouvrir le dossier
   - Utilisez les filtres pour voir Apps / Outils séparément

### Via la ligne de commande

Pour lancer une application manuellement :

```cmd
# AtmttViewer
cd apps\atmtt-viewer
npm start

# Docker Panel
cd apps\automatt-docker-panel
npm start

# Prolex Run Logger
cd apps\prolex-run-logger
npm start

# Web Scraper
cd apps\prolex-web-scraper
npm start
```

---

## 🔧 Outils Windows Registry

### Masquer les dossiers par défaut de Windows

1. **Ouvrez l'Explorateur** : `tools\windows-registry\`

2. **Double-cliquez** sur `hide-default-folders.reg`

3. **Cliquez "Oui"** deux fois pour confirmer

4. **Redémarrez l'Explorateur** :
   - `Ctrl+Shift+Esc` → Trouver "Windows Explorer" → Clic droit → Redémarrer
   - OU : Déconnexion/Reconnexion

### Restaurer les dossiers

1. **Double-cliquez** sur `restore-default-folders.reg`
2. Confirmez et redémarrez l'Explorateur

**Plus d'infos** : Voir `tools\windows-registry\README.md`

---

## ✅ Vérification de l'installation

### 1. Vérifier Node.js

```cmd
node --version
npm --version
```

Devrait afficher les versions installées (ex: v18.17.0, 9.6.7)

### 2. Vérifier le Tools Manager

```cmd
cd apps\prolex-tools-manager
npm start
```

Une fenêtre devrait s'ouvrir avec la liste de tous les outils.

### 3. Vérifier les applications

Dans le Tools Manager :
- Toutes les applications devraient avoir le statut "✅ Installé"
- Les boutons "▶️ Démarrer" devraient être actifs (pas grisés)

---

## 🐛 Dépannage

### Problème : "node n'est pas reconnu..."

**Solution** : Node.js n'est pas installé ou pas dans le PATH

1. Installez Node.js depuis https://nodejs.org/
2. Redémarrez PowerShell/CMD
3. Vérifiez : `node --version`

### Problème : "npm install" échoue

**Solutions** :

1. **Vérifiez votre connexion Internet**

2. **Nettoyez le cache npm** :
   ```cmd
   npm cache clean --force
   ```

3. **Supprimez node_modules et réessayez** :
   ```cmd
   rmdir /s /q node_modules
   npm install
   ```

### Problème : Le Tools Manager ne s'ouvre pas

**Solutions** :

1. **Vérifiez les logs dans la console**

2. **Réinstallez les dépendances** :
   ```cmd
   cd apps\prolex-tools-manager
   rmdir /s /q node_modules
   npm install
   npm start
   ```

3. **Vérifiez Electron** :
   ```cmd
   npm list electron
   ```

### Problème : Un outil n'apparaît pas dans le Tools Manager

**Solutions** :

1. **Cliquez sur "🔄 Actualiser"**

2. **Vérifiez que le dossier existe** :
   ```cmd
   dir apps
   dir tools
   ```

3. **Redémarrez le Tools Manager**

### Problème : Les raccourcis Windows Registry ne fonctionnent pas

**Solutions** :

1. **Clic droit** sur le fichier `.reg` → "Ouvrir en tant qu'administrateur"

2. **Vérifiez que UAC (User Account Control) est activé**

3. **Consultez** `tools\windows-registry\README.md` pour le dépannage détaillé

---

## 📚 Ressources supplémentaires

### Documentation

- **Tools Manager** : `apps/prolex-tools-manager/README.md`
- **AtmttViewer** : `apps/atmtt-viewer/README.md`
- **Windows Registry Tools** : `tools/windows-registry/README.md`
- **Documentation principale** : `README.md`
- **Index central** : `INDEX_PROLEX.md`

### Support

- **Email** : matthieu@automatt.ai
- **GitHub Issues** : https://github.com/ProlexAi/Prolex/issues
- **Documentation** : https://github.com/ProlexAi/Prolex

---

## 🎯 Prochaines étapes

Maintenant que tout est installé, vous pouvez :

1. **Explorer le Tools Manager** pour voir tous vos outils
2. **Lancer AtmttViewer** pour éditer des fichiers Markdown
3. **Utiliser les outils Windows Registry** pour personnaliser Windows
4. **Développer avec les autres apps** (Docker Panel, Run Logger, Web Scraper)

---

## 🔄 Mise à jour

Pour mettre à jour tous les outils :

```cmd
# 1. Mettez à jour le code depuis GitHub
git pull

# 2. Relancez l'installation
.\install-tools.bat
```

---

## 📝 Checklist d'installation

Cochez au fur et à mesure :

- [ ] Node.js installé et vérifié
- [ ] Repository cloné localement
- [ ] Script `install-tools.bat` exécuté
- [ ] Tools Manager s'ouvre correctement
- [ ] Toutes les apps affichent "Installé" dans le Tools Manager
- [ ] Raccourci bureau créé
- [ ] Au moins une application testée (ex: AtmttViewer)
- [ ] Outils Windows Registry testés (optionnel)

---

**Installation terminée !** 🎉

Le Tools Manager est maintenant votre hub central pour gérer tous les outils Prolex.

---

**Dernière mise à jour** : 2025-11-23
**Version** : 1.0
**Maintenu par** : Matthieu - Automatt.ai
