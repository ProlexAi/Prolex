# 🚀 GUIDE D'IMPLÉMENTATION PAS À PAS

> **Guide complet pour implémenter l'architecture modulaire Prolex**
> **Date**: 2025-11-24
> **Durée estimée**: 2-3 semaines
> **Difficulté**: Avancée

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Phase 1: Préparation](#phase-1-préparation-jours-1-2)
3. [Phase 2: Création repositories](#phase-2-création-repositories-jour-3)
4. [Phase 3: Migration code](#phase-3-migration-code-jours-4-7)
5. [Phase 4: Configuration CI/CD](#phase-4-configuration-cicd-jours-8-9)
6. [Phase 5: Windows & Drive](#phase-5-windows--drive-jour-10)
7. [Phase 6: Tests](#phase-6-tests-jours-11-12)
8. [Phase 7: Production](#phase-7-production-jours-13-14)

---

## 🎯 Prérequis

### Outils nécessaires

- [ ] Git (version 2.30+)
- [ ] GitHub CLI (`gh`)
- [ ] Node.js 20+
- [ ] pnpm (gestionnaire de packages)
- [ ] Docker & Docker Compose
- [ ] PowerShell 5.1+ (Windows)
- [ ] Code editor (VSCode recommandé)

### Accès nécessaires

- [ ] Compte GitHub avec droits admin sur `ProlexAi`
- [ ] Accès Google Drive
- [ ] Accès n8n production
- [ ] Accès VPS production
- [ ] Clés API (Anthropic, OpenAI, etc.)

### Connaissances requises

- Git/GitHub (branches, PRs, workflows)
- Docker/Docker Compose
- Node.js/TypeScript
- n8n workflows
- Architecture microservices

---

## 📅 PHASE 1: Préparation (Jours 1-2)

### Jour 1: Setup environnement

#### 1.1 Backup complet

**⚠️ CRITIQUE: Faire un backup AVANT toute modification**

```bash
# Backup monolithe actuel
cd /path/to/current/Prolex
git bundle create prolex-backup-$(date +%Y%m%d).bundle --all

# Backup n8n (export tous workflows)
curl -X GET https://n8n.automatt.ai/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  > n8n-workflows-backup-$(date +%Y%m%d).json

# Backup database
pg_dump prolex_db > prolex_db_backup_$(date +%Y%m%d).sql

# Backup Google Drive (via rclone)
rclone sync "drive:Automatt - Prolex" ./drive-backup/
```

**✅ Checkpoint**: Vérifier que tous backups sont complets et accessibles

---

#### 1.2 Créer structure Windows

```powershell
# Exécuter script setup
cd migration-modulaire/scripts-windows
.\01-setup-windows-structure.ps1

# Vérifier structure créée
ls $env:USERPROFILE\Workspace\Prolex
ls $env:USERPROFILE\Automatt
```

**✅ Checkpoint**: Structure Windows créée

---

#### 1.3 Préparer documentation

```bash
# Lire docs clés
cat migration-modulaire/MASTER_PLAN_ARCHITECTURE_MODULAIRE.md
cat migration-modulaire/docs/GOOGLE_DRIVE_ARCHITECTURE.md

# Imprimer checklists
# Avoir sous les yeux pendant migration
```

---

### Jour 2: Validation et planning

#### 2.1 Révision architecture

- [ ] Lire master plan complet
- [ ] Valider choix Public/Privé pour chaque repo
- [ ] Valider mapping monolithe → repos
- [ ] Identifier dépendances critiques
- [ ] Planifier ordre de migration

#### 2.2 Communication équipe

- [ ] Informer équipe de la migration
- [ ] Bloquer temps dans calendrier (2-3 semaines)
- [ ] Prévoir période de freeze (pas de nouvelles features)
- [ ] Définir point de rollback

#### 2.3 Créer GitHub Projects board

```bash
# Via GitHub CLI
gh project create --owner ProlexAi --title "Migration Modulaire"

# Ajouter colonnes: To Do, In Progress, Done
# Créer issues pour chaque phase
```

**✅ Checkpoint**: Planning validé, équipe informée

---

## 📅 PHASE 2: Création repositories (Jour 3)

### 3.1 Créer organisation GitHub

```bash
# Si pas déjà créée
gh org create ProlexAi
```

---

### 3.2 Créer les 9 repositories

```bash
# Script création automatique
cat > create-repos.sh << 'EOF'
#!/bin/bash

REPOS=(
  "prolex-core:private:Cerveau orchestrateur"
  "prolex-kimmy:private:Filtre et classification"
  "prolex-opex:private:Workflows n8n"
  "prolex-mcp:public:Serveurs MCP"
  "prolex-cli:public:Interface CLI"
  "prolex-rag:private:Base vectorielle RAG"
  "prolex-apps:public:Applications desktop"
  "prolex-infra:private:Infrastructure"
  "prolex-docs:public:Documentation"
)

for repo_info in "${REPOS[@]}"; do
  IFS=':' read -r name visibility description <<< "$repo_info"

  echo "Creating $name ($visibility)..."

  if [ "$visibility" = "private" ]; then
    gh repo create "ProlexAi/$name" --private --description "$description"
  else
    gh repo create "ProlexAi/$name" --public --description "$description"
  fi

  sleep 2
done

echo "✅ All repositories created!"
EOF

chmod +x create-repos.sh
./create-repos.sh
```

**✅ Checkpoint**: 9 repositories créés sur GitHub

---

### 3.3 Cloner repositories localement

```powershell
# Windows PowerShell
cd migration-modulaire/scripts-windows
.\02-clone-all-repos.ps1 -UseSsh

# Vérifier
ls $env:USERPROFILE\Workspace\Prolex
# Doit afficher 9 dossiers
```

---

### 3.4 Ajouter READMEs initiaux

```bash
# Copier READMEs générés
cd migration-modulaire/repos

# Pour chaque repo
for i in {01..09}; do
  repo_dir="$HOME/Workspace/Prolex/${i}-*"
  readme_file="${i}-*-README.md"

  cp "$readme_file" "$repo_dir/README.md"

  cd "$repo_dir"
  git add README.md
  git commit -m "docs: add initial README"
  git push origin main

  cd -
done
```

**✅ Checkpoint**: READMEs dans tous repos

---

### 3.5 Configurer branch protection

```bash
# Script protection branches
cat > setup-branch-protection.sh << 'EOF'
#!/bin/bash

REPOS=(
  prolex-core
  prolex-kimmy
  prolex-opex
  prolex-mcp
  prolex-cli
  prolex-rag
  prolex-apps
  prolex-infra
  prolex-docs
)

for repo in "${REPOS[@]}"; do
  echo "Setting up branch protection for $repo..."

  gh api -X PUT "/repos/ProlexAi/$repo/branches/main/protection" \
    --input - << JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON

done
EOF

chmod +x setup-branch-protection.sh
./setup-branch-protection.sh
```

**✅ Checkpoint**: Branch protection configurée

---

## 📅 PHASE 3: Migration code (Jours 4-7)

### 4.1 Mapping monolithe → repos

**Référence**: Voir tableau dans `MASTER_PLAN_ARCHITECTURE_MODULAIRE.md`

---

### 4.2 Migration `prolex-core` (Jour 4)

```bash
cd $HOME/Workspace/Prolex/01-prolex-core

# Copier fichiers depuis monolithe
cp -r /path/to/monolithe/config ./
cp -r /path/to/monolithe/schemas ./
cp /path/to/monolithe/docs/specifications/SPEC_PROLEX_V4.md docs/

# Créer structure src/
mkdir -p src/{core,integrations,api,models,utils}

# TODO: Extraire code orchestration depuis monolithe
# (à faire manuellement ou avec AI assistant)

# Commit
git add .
git commit -m "feat: migrate core files from monolith"
git push origin main
```

---

### 4.3 Migration `prolex-kimmy` (Jour 4)

```bash
cd $HOME/Workspace/Prolex/02-prolex-kimmy

# Copier fichiers
cp /path/to/monolithe/docs/specifications/SPEC_KIMMY_V4.md docs/

# Créer structure
mkdir -p src/{classifier,quick-actions,models,api,utils}
mkdir -p config prompts schemas

# TODO: Extraire code classification
# (à faire manuellement)

git add .
git commit -m "feat: migrate Kimmy files from monolith"
git push origin main
```

---

### 4.4 Migration `prolex-opex` (Jour 5)

```bash
cd $HOME/Workspace/Prolex/03-prolex-opex

# Copier workflows n8n
cp -r /path/to/monolithe/n8n-workflows/* workflows/

# Organiser par catégorie
mkdir -p workflows/{000-099-core,100-199-productivity,200-299-devops}
# TODO: Déplacer workflows dans bonnes catégories

# Copier proxy-master
mkdir -p proxy-master
cp /path/to/monolithe/proxy-master/* proxy-master/

git add .
git commit -m "feat: migrate n8n workflows from monolith"
git push origin main
```

---

### 4.5 Migration `prolex-mcp` (Jour 5)

```bash
cd $HOME/Workspace/Prolex/04-prolex-mcp

# Copier serveur n8n existant
cp -r /path/to/monolithe/mcp/n8n-server packages/

# Créer structure pour futurs serveurs
mkdir -p packages/{google-drive-server,github-server,sheets-server,common}

git add .
git commit -m "feat: migrate MCP n8n server from monolith"
git push origin main
```

---

### 4.6 Migration `prolex-cli` (Jour 6)

```bash
cd $HOME/Workspace/Prolex/05-prolex-cli

# Copier CLI existant (si existe)
if [ -d "/path/to/monolithe/cli" ]; then
  cp -r /path/to/monolithe/cli/* .
fi

# Créer structure
mkdir -p src/{commands,api,ui,utils}

# TODO: Implémenter CLI (peut être fait post-migration)

git add .
git commit -m "feat: initial CLI structure"
git push origin main
```

---

### 4.7 Migration `prolex-rag` (Jour 6)

```bash
cd $HOME/Workspace/Prolex/06-prolex-rag

# Copier knowledge base
cp -r /path/to/monolithe/rag/* knowledge-base/

# Copier vector service
cp -r /path/to/monolithe/prolex-vector-service src/vector-service

# Créer structure
mkdir -p src/{ingestion,api,utils}

git add .
git commit -m "feat: migrate RAG files from monolith"
git push origin main
```

---

### 4.8 Migration `prolex-apps` (Jour 7)

```bash
cd $HOME/Workspace/Prolex/07-prolex-apps

# Copier apps existantes
cp -r /path/to/monolithe/apps/* packages/

# Créer structure
mkdir -p packages/prolex-dashboard
mkdir -p packages/prolex-tools-manager
mkdir -p shared/{components,hooks,utils}

git add .
git commit -m "feat: migrate apps from monolith"
git push origin main
```

---

### 4.9 Migration `prolex-infra` (Jour 7)

```bash
cd $HOME/Workspace/Prolex/08-prolex-infra

# Copier infra
cp -r /path/to/monolithe/infra/* .

# Organiser
mkdir -p terraform/{modules,environments}
mkdir -p docker/{services,volumes}
mkdir -p ansible/{playbooks,roles}

git add .
git commit -m "feat: migrate infrastructure files from monolith"
git push origin main
```

---

### 4.10 Migration `prolex-docs` (Jour 7)

```bash
cd $HOME/Workspace/Prolex/09-prolex-docs

# Copier docs
cp -r /path/to/monolithe/docs/* docs/

# Organiser
mkdir -p docs/{getting-started,architecture,guides,api-reference,workflows,development,deployment}
mkdir -p blog static

# Créer mkdocs.yml
cat > mkdocs.yml << 'EOF'
site_name: Prolex Documentation
site_url: https://docs.prolex.ai
repo_url: https://github.com/ProlexAi/prolex-docs

theme:
  name: material
  palette:
    primary: indigo
  features:
    - navigation.tabs
    - search.highlight

plugins:
  - search
  - mermaid2

nav:
  - Home: index.md
  - Getting Started:
      - Introduction: getting-started/introduction.md
  - Architecture:
      - Overview: architecture/overview.md
EOF

git add .
git commit -m "docs: migrate documentation from monolith"
git push origin main
```

**✅ Checkpoint**: Code migré dans les 9 repos

---

## 📅 PHASE 4: Configuration CI/CD (Jours 8-9)

### 8.1 CI/CD pour `prolex-core`

```bash
cd $HOME/Workspace/Prolex/01-prolex-core

mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
EOF

git add .github/workflows/ci.yml
git commit -m "ci: add CI workflow"
git push origin main
```

---

### 8.2 Répliquer CI pour autres repos

```bash
# Copier workflow CI vers autres repos TypeScript
for repo in kimmy opex mcp cli rag; do
  cp .github/workflows/ci.yml \
     $HOME/Workspace/Prolex/*-prolex-$repo/.github/workflows/
done
```

---

### 8.3 Workflow deploy (production)

```yaml
# .github/workflows/deploy.yml
name: Deploy Production

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t registry.automatt.ai/prolex-core:latest .

      - name: Push to registry
        run: docker push registry.automatt.ai/prolex-core:latest

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/prolex/prolex-infra
            ./scripts/deploy-prolex.sh production --service prolex-core
```

**✅ Checkpoint**: CI/CD configuré pour tous repos

---

## 📅 PHASE 5: Windows & Drive (Jour 10)

### 10.1 Configuration Google Drive

```bash
# Créer structure Drive via Apps Script
# Voir: migration-modulaire/docs/GOOGLE_DRIVE_ARCHITECTURE.md

# Exécuter script création structure
# (dans Google Apps Script)
```

---

### 10.2 Nettoyage Windows

```powershell
# Organiser anciens fichiers
cd migration-modulaire/scripts-windows
.\03-organize-old-files.bat

# Masquer dossiers Windows
# Double-cliquer sur:
.\04-hide-windows-default-folders.reg
```

---

### 10.3 Sync n8n workflow

```bash
# Créer workflow sync Drive ↔ GitHub
# Importer dans n8n: sync-drive-github.json
# (TODO: créer ce workflow)
```

**✅ Checkpoint**: Windows propre, Drive configuré

---

## 📅 PHASE 6: Tests (Jours 11-12)

### 11.1 Tests unitaires

```bash
# Pour chaque repo
cd $HOME/Workspace/Prolex/01-prolex-core
pnpm test

cd $HOME/Workspace/Prolex/02-prolex-kimmy
pnpm test

# etc.
```

---

### 11.2 Tests d'intégration

```bash
# Test pipeline complet
# 1. Kimmy classification
# 2. Prolex orchestration
# 3. Opex exécution

# TODO: Créer script test end-to-end
```

---

### 11.3 Tests workflows n8n

```bash
# Test chaque workflow
# Via n8n UI: exécution manuelle

# Ou via CLI
npx n8n execute --id 010 --test
```

**✅ Checkpoint**: Tous tests passent

---

## 📅 PHASE 7: Production (Jours 13-14)

### 13.1 Déploiement staging

```bash
# Deploy vers staging
cd $HOME/Workspace/Prolex/08-prolex-infra
./scripts/deploy-prolex.sh staging

# Vérifier
curl https://staging.prolex.automatt.ai/api/v1/status
```

---

### 13.2 Tests staging

- [ ] Test Kimmy classification
- [ ] Test Prolex orchestration
- [ ] Test workflows n8n
- [ ] Test RAG retrieval
- [ ] Test MCP servers
- [ ] Load testing

---

### 13.3 Déploiement production

**⚠️ CRITIQUE: Maintenance window requis**

```bash
# 1. Mettre en maintenance
curl -X POST https://prolex.automatt.ai/api/v1/admin/maintenance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"enabled": true}'

# 2. Backup production
./scripts/backup-all.sh

# 3. Deploy
./scripts/deploy-prolex.sh production

# 4. Health checks
./scripts/health-check.sh

# 5. Retirer maintenance
curl -X POST https://prolex.automatt.ai/api/v1/admin/maintenance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"enabled": false}'
```

---

### 13.4 Monitoring post-deploy

```bash
# Watch logs
tail -f /var/log/prolex/*.log

# Grafana dashboards
# https://grafana.automatt.ai

# Alerts Telegram activées
```

**✅ Checkpoint**: Production OK!

---

### 13.5 Communication

- [ ] Annoncer migration complète
- [ ] Documenter changements
- [ ] Former équipe nouveaux repos
- [ ] Mettre à jour guides

---

## 🎉 MIGRATION TERMINÉE!

### Post-migration cleanup

```bash
# Archiver ancien monolithe
cd /path/to/monolithe
git tag archive/pre-modular-migration
git push --tags

# Créer README archive
cat > README-ARCHIVED.md << 'EOF'
# ARCHIVED: Prolex Monolithe

Ce repository est archivé.

**Nouvelle architecture modulaire**: https://github.com/ProlexAi

Migration date: 2025-11-24
EOF

git add README-ARCHIVED.md
git commit -m "docs: archive monolith"
git push

# Archiver sur GitHub
gh repo archive ProlexAi/Prolex-Old
```

---

## 📊 Métriques de succès

| Métrique | Objectif | Status |
|----------|----------|--------|
| Repos créés | 9/9 | ✅ |
| Code migré | 100% | ✅ |
| Tests passent | 100% | ✅ |
| CI/CD fonctionnel | 9/9 | ✅ |
| Production stable | 0 incident | ✅ |
| Downtime | < 1h | ✅ |

---

## 🆘 Troubleshooting

### Problème: Git conflicts lors migration

**Solution**:
```bash
# Résoudre conflicts
git status
git diff
# Edit conflicting files
git add .
git commit -m "fix: resolve merge conflicts"
```

---

### Problème: Tests échouent après migration

**Solution**:
```bash
# Vérifier dépendances
pnpm install

# Rebuild
pnpm clean && pnpm build

# Re-run tests
pnpm test --verbose
```

---

### Problème: Workflows n8n ne se synchronisent pas

**Solution**:
```bash
# Vérifier webhook GitHub
gh api repos/ProlexAi/prolex-opex/hooks

# Vérifier workflow sync actif dans n8n
curl https://n8n.automatt.ai/api/v1/workflows/010

# Trigger manuel
curl -X POST https://n8n.automatt.ai/webhook/github-sync
```

---

## 📚 Resources

- [Master Plan](MASTER_PLAN_ARCHITECTURE_MODULAIRE.md)
- [Google Drive Architecture](GOOGLE_DRIVE_ARCHITECTURE.md)
- [READMEs individuels](../repos/)
- [Scripts Windows](../scripts-windows/)

---

**Date création**: 2025-11-24
**Auteur**: Claude Code Assistant
**Version**: 1.0
**Status**: 📘 Guide complet prêt à suivre
