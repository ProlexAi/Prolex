# 🚀 QUICKSTART - Création automatique écosystème Prolex

> **Script FULL AUTO pour créer l'organisation GitHub et les 9 repositories**

---

## ⚡ LANCEMENT ULTRA-RAPIDE

```bash
cd /home/user/Prolex/migration-modulaire/scripts
./create-prolex-ecosystem.sh
```

**C'est tout !** Le script fait TOUT automatiquement ! ✨

---

## 📋 Ce que fait le script

### Étape 1️⃣ : Vérifications (30 secondes)
- ✅ Vérifie Git installé
- ✅ Vérifie GitHub CLI (gh) installé
- ✅ Vérifie authentification GitHub

### Étape 2️⃣ : Organisation GitHub (10 secondes)
- ✅ Crée l'organisation `ProlexAi`
- ✅ (ou utilise l'existante)

### Étape 3️⃣ : Création repositories (1-2 minutes)
- ✅ Crée 9 repositories :
  - `prolex-core` (privé)
  - `prolex-kimmy` (privé)
  - `prolex-opex` (privé)
  - `prolex-mcp` (public)
  - `prolex-cli` (public)
  - `prolex-rag` (privé)
  - `prolex-apps` (public)
  - `prolex-infra` (privé)
  - `prolex-docs` (public)

### Étape 4️⃣ : Clone local (1 minute)
- ✅ Clone les 9 repos dans `~/Workspace/Prolex/`
- ✅ Structure : `01-prolex-core/`, `02-prolex-kimmy/`, etc.

### Étape 5️⃣ : Setup initial (1-2 minutes)
- ✅ Copie les READMEs dans chaque repo
- ✅ Commits initiaux
- ✅ Push vers GitHub

### Étape 6️⃣ : Configuration (30 secondes)
- ✅ Configure branch protection sur `main`

### Étape 7️⃣ : Résumé
- ✅ Affiche tous les liens GitHub
- ✅ Liste la structure locale

---

## ⏱️ Temps total : ~5 minutes

---

## 🎯 Prérequis

### 1. Git installé

```bash
git --version
# Doit afficher: git version 2.x.x
```

Si pas installé : https://git-scm.com/

---

### 2. GitHub CLI (gh) installé

```bash
gh --version
# Doit afficher: gh version 2.x.x
```

**Installation** :

**macOS** :
```bash
brew install gh
```

**Linux (Ubuntu/Debian)** :
```bash
type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
&& sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y
```

**Windows** :
```powershell
choco install gh
# ou
winget install --id GitHub.cli
```

---

### 3. Authentification GitHub

```bash
gh auth login
```

**Suivre les instructions** :
1. Choisir `GitHub.com`
2. Choisir `HTTPS` (ou `SSH` si vous avez une clé)
3. Authentifier via navigateur web
4. Coller le token

**Vérifier** :
```bash
gh auth status
# Doit afficher: Logged in to github.com as <votre-username>
```

---

## 🚀 LANCEMENT

### Option 1 : Mode interactif (recommandé)

```bash
cd /home/user/Prolex/migration-modulaire/scripts
./create-prolex-ecosystem.sh
```

Le script demande confirmation avant de commencer.

---

### Option 2 : Mode automatique (sans confirmation)

```bash
# Ajouter 'y' en input
echo "y" | ./create-prolex-ecosystem.sh
```

---

## 📊 Résultat attendu

### Organisation GitHub créée
```
https://github.com/ProlexAi
```

### 9 repositories créés
```
https://github.com/ProlexAi/prolex-core        🔒 Privé
https://github.com/ProlexAi/prolex-kimmy       🔒 Privé
https://github.com/ProlexAi/prolex-opex        🔒 Privé
https://github.com/ProlexAi/prolex-mcp         🔓 Public
https://github.com/ProlexAi/prolex-cli         🔓 Public
https://github.com/ProlexAi/prolex-rag         🔒 Privé
https://github.com/ProlexAi/prolex-apps        🔓 Public
https://github.com/ProlexAi/prolex-infra       🔒 Privé
https://github.com/ProlexAi/prolex-docs        🔓 Public
```

### Structure locale créée
```
~/Workspace/Prolex/
├── 01-prolex-core/       (cloné + README)
├── 02-prolex-kimmy/      (cloné + README)
├── 03-prolex-opex/       (cloné + README)
├── 04-prolex-mcp/        (cloné + README)
├── 05-prolex-cli/        (cloné + README)
├── 06-prolex-rag/        (cloné + README)
├── 07-prolex-apps/       (cloné + README)
├── 08-prolex-infra/      (cloné + README)
└── 09-prolex-docs/       (cloné + README)
```

---

## 🆘 Dépannage

### Erreur : "gh: command not found"

**Solution** : Installer GitHub CLI (voir section Prérequis)

---

### Erreur : "gh auth status failed"

**Solution** :
```bash
gh auth login
```

---

### Erreur : "Organization already exists"

**Ce n'est pas une erreur !** Le script utilise l'organisation existante.

---

### Erreur : "Repository already exists"

**Ce n'est pas une erreur !** Le script skip les repos existants et continue.

---

### Erreur : "Permission denied"

**Solution** : Vérifier que vous avez les droits de créer des organisations et repos sur GitHub.

Pour créer une organisation, vous devez :
- Avoir un compte GitHub vérifié
- Accepter les Terms of Service
- (Parfois) vérifier votre email

Si impossible de créer l'organisation automatiquement :
1. Créez-la manuellement : https://github.com/organizations/plan
2. Relancez le script (il détectera l'organisation existante)

---

## 📝 Logs

Le script affiche des logs détaillés avec couleurs :
- ✅ **Vert** : Succès
- ⚠️ **Jaune** : Warning (non-bloquant)
- ❌ **Rouge** : Erreur (bloquant)
- ℹ️ **Bleu** : Information

---

## 🎉 Après le script

### Étape suivante : Migration du code

Suivre le guide d'implémentation :
```bash
cat ../docs/IMPLEMENTATION_GUIDE.md
```

**Phases à suivre** :
- Phase 3 : Migration code (Jours 4-7)
- Phase 4 : CI/CD (Jours 8-9)
- Phase 5 : Windows & Drive (Jour 10)
- Phase 6 : Tests (Jours 11-12)
- Phase 7 : Production (Jours 13-14)

---

## 💡 Tips

### Voir tous les repos créés
```bash
gh repo list ProlexAi
```

### Cloner un repo spécifique
```bash
gh repo clone ProlexAi/prolex-core
```

### Voir l'organisation
```bash
gh org view ProlexAi
```

### Inviter des collaborateurs
```bash
gh api -X PUT /orgs/ProlexAi/memberships/USERNAME \
  -f role=admin
```

---

## 📞 Support

Si problème persistant :
1. Vérifier les logs du script
2. Consulter : https://cli.github.com/manual/
3. Vérifier permissions GitHub

---

**Créé par** : Claude Code Assistant
**Date** : 2025-11-24
**Version** : 1.0
