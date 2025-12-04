# 📐 RULES

> Règles, conventions et standards du projet

## Contenu

Ce dossier contient les règles et standards à suivre dans l'écosystème Prolex V5.

### Catégories de règles

#### Conventions de code
- Style TypeScript/JavaScript
- Nommage (variables, fonctions, fichiers)
- Organisation des imports
- Documentation inline

#### Standards Git
- Messages de commit
- Nommage des branches
- Workflow PR
- Versioning sémantique

#### Standards d'architecture
- Organisation des repos
- Structure des dossiers
- Gestion des dépendances
- Patterns à utiliser

#### Règles de sécurité
- Gestion des secrets
- Validation des entrées
- Rate limiting
- Logging et audit

### Documents existants

- `../rag/rules/` - Règles système pour l'IA
- `../config/autonomy.yml` - Règles d'autonomie

### Standards de commit

Format : `<type>(<scope>): <subject>`

**Types** :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `refactor` : Refactorisation
- `test` : Tests
- `chore` : Maintenance

**Exemples** :
- `feat(mcp): add Gmail tools`
- `docs(architecture): update V5 specs`
- `fix(core): resolve validation error`

### Standards de nommage

#### Branches
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `archi/*` : Modifications d'architecture
- `docs/*` : Modifications de documentation

#### Fichiers
- TypeScript : PascalCase pour classes, camelCase pour fichiers
- Markdown : UPPERCASE pour docs principaux, lowercase pour sous-docs
- Configuration : kebab-case.yml ou snake_case.json

---

**Dernière mise à jour** : 2025-12-04
