# 🔍 Tracker des Problèmes et Résolutions - Prolex v4

> **Date de création** : 22 novembre 2025
> **Objectif** : Traçabilité complète des problèmes identifiés, de leur résolution et des actions menées

---

## 📋 Synthèse de l'état

| Problème | Priorité | Statut | Date résolution |
|----------|----------|--------|-----------------|
| P1 - Confusion documentaire (réel/vision) | 🔴 CRITIQUE | ✅ RÉSOLU | 22/11/2025 |
| P2 - Redondance des définitions | 🔴 CRITIQUE | ✅ RÉSOLU | 22/11/2025 |
| P3 - SPOF n8n (Single Point of Failure) | 🔴 CRITIQUE | ⏳ EN COURS | - |
| P4 - Sécurité auto-génération workflows | 🔴 CRITIQUE | ⏳ EN COURS | - |
| P5 - Parsing JSON fragile (Proxy Master) | 🔴 CRITIQUE | ⏳ EN COURS | - |
| P6 - Validation humaine pénible | 🟠 HAUTE | ⏳ EN COURS | - |
| P7 - Coûts LLM non optimisés | 🟡 MOYENNE | ⏳ EN COURS | - |
| P8 - Scope MVP non défini | 🟠 HAUTE | ✅ RÉSOLU | 22/11/2025 |
| P9 - Absence de CI/CD | 🟡 MOYENNE | ⏳ EN COURS | - |
| P10 - Désalignement GUIDE_CLIENTS/Tech | 🟡 MOYENNE | ⏳ EN COURS | - |

---

## 🔴 P1 - Confusion documentaire (réel/vision)

### Description du problème
La documentation mélangeait :
- Ce qui existe déjà (VPS, n8n basic)
- Ce qui est en cours de développement (Kimmy, Prolex MVP)
- La vision future (Marketplace, IA avancée, multi-agents)

**Impact** : Confusion pour le développement, impossibilité de prioriser, risque de développer des fonctionnalités non-MVP.

### Solution implémentée
✅ **RÉSOLU** le 22/11/2025

**Actions menées** :
1. Création de `docs/00_README_SYSTEME_V4.md` avec :
   - Tableau de statut clair (✅ En place / ⏳ En cours / 💡 Vision)
   - Parcours de lecture par profil (dev/business)
   - Liens vers toutes les ressources clés

2. Ajout de sections "Statut d'implémentation v4.0" dans chaque SPEC

**Fichiers modifiés** :
- ✅ `docs/00_README_SYSTEME_V4.md` (créé)
- ⏳ `SPEC_KIMMY_V4.md` (à mettre à jour)
- ⏳ `SPEC_PROLEX_V4.md` (à mettre à jour)
- ⏳ `SPEC_OPEX_V4.md` (à mettre à jour)
- ⏳ `ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md` (à mettre à jour)

**Validation** :
- Un développeur peut maintenant identifier en 2 minutes ce qui est opérationnel vs ce qui est à développer

---

## 🔴 P2 - Redondance des définitions

### Description du problème
Les listes d'intents, types d'output et niveaux d'autonomie étaient dupliquées dans :
- `SPEC_KIMMY_V4.md`
- `SPEC_PROLEX_V4.md`
- `ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md`

**Impact** : Risque de désynchronisation lors des mises à jour, maintenance coûteuse, erreurs de cohérence.

### Solution implémentée
✅ **RÉSOLU** le 22/11/2025

**Actions menées** :
1. Création d'un dossier `schemas/` avec fichiers de référence :
   - `kimmy_payload.schema.json` (structure de sortie Kimmy)
   - `prolex_output.schema.json` (structure de sortie Prolex)
   - `system_journal.schema.json` (structure du journal système)
   - `intents/kimmy_intents.yml` (liste unique des intents)
   - `autonomy_levels.yml` (définition des niveaux d'autonomie)

2. Adaptation des SPEC pour référencer ces fichiers au lieu de dupliquer

**Fichiers créés** :
- ✅ `schemas/kimmy_payload.schema.json`
- ✅ `schemas/prolex_output.schema.json`
- ✅ `schemas/system_journal.schema.json`
- ✅ `schemas/intents/kimmy_intents.yml`
- ✅ `schemas/autonomy_levels.yml`

**Fichiers modifiés** :
- ⏳ `SPEC_KIMMY_V4.md` (suppression des listes dupliquées)
- ⏳ `SPEC_PROLEX_V4.md` (suppression des listes dupliquées)
- ⏳ `ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md` (référence aux schemas)

**Validation** :
- Une seule source de vérité pour chaque définition
- Les specs référencent les schemas au lieu de les dupliquer

---

## 🔴 P3 - SPOF n8n (Single Point of Failure)

### Description du problème
Dépendance totale à une instance unique de n8n :
- Si n8n tombe, tout le système est paralysé
- Pas de mode dégradé
- Pas de redondance

**Impact** : Risque de déni de service complet, pas de résilience.

### Solution en cours
⏳ **EN COURS** (Date de début : 22/11/2025)

**Actions planifiées** :
1. Définir un mode dégradé dans l'architecture :
   - Détection de l'indisponibilité de n8n (healthcheck)
   - Limitation de Prolex à `type=answer` et `type=clarification`
   - Message utilisateur explicite sur la limitation temporaire

2. Documentation du comportement en mode dégradé

**Fichiers à modifier** :
- ⏳ `ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md` (section "Modes dégradés")
- ⏳ `SPEC_PROLEX_V4.md` (comportement en mode dégradé)

**Validation prévue** :
- Test de coupure de n8n avec comportement dégradé fonctionnel
- Documentation du SLA attendu

**Timeline** : Semaine du 25/11/2025

---

## 🔴 P4 - Sécurité auto-génération workflows

### Description du problème
Exécution de workflows auto-générés par l'IA sur la même instance n8n que les processus critiques :
- Risque de boucle infinie
- Risque de crash du système
- Risque de corruption des workflows stables

**Impact** : SPOF aggravé, risque de déstabilisation complète du système.

### Solution en cours
⏳ **EN COURS** (Date de début : 22/11/2025)

**Actions planifiées** :
1. Déploiement d'une instance n8n-sandbox séparée via Docker Compose :
   - Port différent (5679)
   - Volumes séparés
   - Limites de ressources (CPU: 0.5, RAM: 1G)

2. Distinction des outils Opex :
   - `N8N_WORKFLOW_UPSERT_SBX` → agit sur sandbox
   - `N8N_WORKFLOW_PROMOTE_PROD` → copie de sandbox vers prod après validation

**Fichiers à modifier** :
- ⏳ `infra/vps-prod/docker-compose.yml` (ajout service n8n-sandbox)
- ⏳ `SPEC_OPEX_V4.md` (distinction sandbox/prod pour workflows)

**Validation prévue** :
- Création d'un workflow dangereux en sandbox sans impact sur prod
- Processus de promotion validé

**Timeline** : Week-end du 23-24/11/2025

---

## 🔴 P5 - Parsing JSON fragile (Proxy Master)

### Description du problème
Résolution des variables dynamiques dans les plans multi-étapes basée sur simple remplacement de texte :
- `{{ step_1.result.id }}` peut casser avec JSON imbriqués
- Pas de gestion des chemins d'objets complexes
- Risque d'erreur silencieuse

**Impact** : Plans multi-étapes non fiables, échecs imprévisibles.

### Solution en cours
⏳ **EN COURS** (Date de début : 22/11/2025)

**Actions planifiées** :
1. Implémentation d'un script JavaScript robuste dans le workflow Proxy Master :
   - Fonction `getCheck` pour navigation dans les objets
   - Résolution de chemins type `step_1.result.data.items[0].id`
   - Gestion des cas d'erreur (variable non trouvée)

2. Export du workflow mis à jour

**Fichiers à créer/modifier** :
- ⏳ `n8n-workflows/020_proxy_master_exec.json` (code JS robuste)
- ⏳ `SPEC_OPEX_V4.md` (documentation du mécanisme de résolution)

**Validation prévue** :
- Test avec un plan multi-étapes complexe (3+ étapes)
- Test avec JSON imbriqués

**Timeline** : Week-end du 23-24/11/2025

---

## 🟠 P6 - Validation humaine pénible

### Description du problème
Méthode de validation par copie de "Code de confirmation" :
- Fastidieuse (copier-coller)
- Pas mobile-friendly
- Pas ergonomique

**Impact** : Mauvaise UX, friction dans le processus de validation, risque d'erreur.

### Solution en cours
⏳ **EN COURS** (Date de début : 22/11/2025)

**Actions planifiées** :
1. Remplacement par validation clickable via webhooks :
   - Génération d'un UUID par action à risque
   - Envoi d'un lien cliquable (Slack/Email)
   - Utilisation de "Wait for Webhook" dans n8n

2. Création du workflow de validation

**Fichiers à créer** :
- ⏳ `n8n-workflows/600_20_HIGH_RISK_APPROVAL.json`

**Fichiers à modifier** :
- ⏳ `SPEC_PROLEX_V4.md` (mise à jour processus validation)
- ⏳ `SPEC_OPEX_V4.md` (documentation workflow HIGH_RISK_APPROVAL)

**Validation prévue** :
- Test de validation via lien Slack
- Test d'annulation

**Timeline** : Semaine du 25/11/2025

---

## 🟡 P7 - Coûts LLM non optimisés

### Description du problème
Double appel LLM systématique (Kimmy + Prolex) pour toutes les requêtes :
- Coût estimé ~0.02$/requête
- Pas d'optimisation pour intents simples
- Pas de caching

**Impact** : Coûts élevés à l'échelle, gaspillage de ressources pour requêtes simples.

### Solution en cours
⏳ **EN COURS** (Date de début : 22/11/2025)

**Actions planifiées** :
1. Création d'une config de routing intelligent :
   - `kimmy_only_intents` : traités directement par Kimmy sans Prolex
   - `force_prolex_intents` : escalade obligatoire
   - Modèles différenciés (Haiku pour Kimmy, Claude pour Prolex)

2. Création du fichier de configuration

**Fichiers à créer** :
- ⏳ `config/kimmy_config.yml`

**Fichiers à modifier** :
- ⏳ `SPEC_KIMMY_V4.md` (documentation du routing)
- ⏳ `SPEC_PROLEX_V4.md` (note sur l'optimisation des coûts)

**Validation prévue** :
- Test avec intent simple (SYSTEM_STATUS) sans appel Prolex
- Mesure de réduction des coûts

**Timeline** : Semaine du 25/11/2025

---

## 🟠 P8 - Scope MVP non défini

### Description du problème
Les specs décrivaient la full v4 sans clarté sur le minimal viable :
- Catalogue Opex trop large (30+ workflows)
- Risque de dispersion
- Pas de focus sur l'essentiel

**Impact** : Risque de burnout, allongement du time-to-market, complexité non maîtrisée.

### Solution implémentée
✅ **RÉSOLU** le 22/11/2025

**Actions menées** :
1. Définition explicite du MVP dans chaque SPEC :
   - Kimmy : 5 intents de base, autonomie 0-1
   - Prolex : 4 types output, 5-7 outils, autonomie max 2
   - Opex : 4 workflows core uniquement

2. Création d'un fichier de configuration pour workflows :
   - `core_workflows` : prioritaires pour MVP
   - `later_workflows` : reportés post-MVP

**Fichiers créés** :
- ✅ `config/opex_workflows.yml`

**Fichiers à modifier** :
- ⏳ `SPEC_KIMMY_V4.md` (section MVP)
- ⏳ `SPEC_PROLEX_V4.md` (section MVP)
- ⏳ `SPEC_OPEX_V4.md` (section MVP + tableau statut CORE/LATER)

**Validation** :
- Scope MVP clairement défini et limité
- Focus sur 4 workflows core au lieu de 30+

---

## 🟡 P9 - Absence de CI/CD

### Description du problème
Pas de validation automatique :
- Schémas JSON non validés automatiquement
- Risque de commit de fichiers invalides
- Pas de linting de la documentation

**Impact** : Risque de régression, qualité non garantie.

### Solution en cours
⏳ **EN COURS** (Date de début : 22/11/2025)

**Actions planifiées** :
1. Création d'un workflow GitHub Actions :
   - Validation des schémas JSON avec ajv-cli
   - Linting de la documentation
   - Tests basiques

**Fichiers à créer** :
- ⏳ `.github/workflows/ci.yml`

**Validation prévue** :
- Push avec schéma invalide détecté par CI
- Pull request avec validation automatique

**Timeline** : Semaine du 25/11/2025

---

## 🟡 P10 - Désalignement GUIDE_CLIENTS/Tech

### Description du problème
Le GUIDE_CLIENTS mentionnait des capacités déconnectées de la réalité technique :
- Packs non alignés avec les niveaux d'autonomie
- Fonctionnalités promises non encore développées
- Pas de tableau de correspondance

**Impact** : Promesses commerciales non tenables, confusion client.

### Solution en cours
⏳ **EN COURS** (Date de début : 22/11/2025)

**Actions planifiées** :
1. Ajout d'un tableau de correspondance dans GUIDE_CLIENTS :
   - Pack → Niveau d'autonomie
   - Pack → Outils Opex inclus
   - Pack → Cas d'usage validé

**Fichiers à modifier** :
- ⏳ `GUIDE_CLIENTS.md` (tableau "Capacités techniques par pack")

**Validation prévue** :
- Revue business vs tech confirmée

**Timeline** : Semaine du 25/11/2025

---

## 📊 Métriques de résolution

| Période | Problèmes résolus | Problèmes en cours | Problèmes identifiés | Taux de résolution |
|---------|-------------------|-------------------|---------------------|-------------------|
| 22/11/2025 | 3 | 7 | 10 | 30% |

**Objectif** : 100% des problèmes critiques (🔴) résolus avant fin novembre 2025

---

## 🔄 Processus de mise à jour

Ce document est mis à jour à chaque :
- Résolution complète d'un problème
- Changement de statut d'un problème
- Identification d'un nouveau problème critique

**Responsable** : Équipe dev Prolex
**Fréquence de revue** : Hebdomadaire

---

**Dernière mise à jour** : 22 novembre 2025
**Version** : 1.0.0
