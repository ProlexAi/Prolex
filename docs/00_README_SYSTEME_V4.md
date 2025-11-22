# 🎯 Prolex v4 - README Système (START HERE)

> **Date de création** : 22 novembre 2025
> **Objectif** : Point d'entrée unique pour comprendre l'architecture, l'état actuel et la roadmap du système Prolex v4

---

## 📊 Vue d'ensemble du système

### Flux général

```
Utilisateur
    ↓
Kimmy (Filtre & Structuration)
    ↓
Prolex (Planification & Orchestration IA)
    ↓
Opex/n8n (Exécution des workflows)
    ↓
Résultat → SystemJournal → Utilisateur
```

---

## 🔍 Statut des composants (v4.0)

| Composant | Statut | Rôle | Priorité MVP | Fichier de référence |
|-----------|--------|------|--------------|---------------------|
| **Kimmy** (workflow/prompt) | ⏳ En cours | Filtre et structuration des requêtes utilisateur | ⚡ HAUTE | `SPEC_KIMMY_V4.md` |
| **Prolex** (orchestrateur LLM) | ⏳ En cours | Cerveau IA & plans multi-outils | ⚡ HAUTE | `SPEC_PROLEX_V4.md` |
| **Opex/n8n core** | ✅ En place | Exécution des workflows stables | ⚡ HAUTE | `SPEC_OPEX_V4.md` |
| **MCP n8n** | ✅ En place | Pont entre Prolex et n8n | ⚡ HAUTE | `ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md` |
| **MCP Google** (Sheets/Drive) | ⏳ À créer | Interactions docs & logs | 🔶 MOYENNE | `SPEC_OPEX_V4.md` |
| **SystemJournal** | ✅ En place | Mémoire système centralisée | ⚡ HAUTE | `schemas/system_journal.schema.json` |
| **n8n-sandbox** | ⏳ À créer | Isolation workflows auto-générés | ⚡ HAUTE | `infra/vps-prod/docker-compose.yml` |
| **Marketplace / Multi-agents** | 💡 Vision v5+ | Écosystème étendu | 🟢 BASSE | `ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md` (section Vision) |

**Légende** :
- ✅ **En place** : Opérationnel en production
- ⏳ **En cours** : Spécification complète, implémentation en cours
- 💡 **Vision** : Fonctionnalité future (v5+), non prioritaire pour MVP

---

## 📖 Qui doit lire quoi ?

### 👨‍💻 Pour les développeurs / intégrateurs

**Parcours recommandé** :
1. ✅ Ce fichier (`00_README_SYSTEME_V4.md`) - Vue d'ensemble
2. 📐 `ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md` - Architecture détaillée
3. 🎭 `SPEC_KIMMY_V4.md` - Spécification du filtre intelligent
4. 🧠 `SPEC_PROLEX_V4.md` - Spécification de l'orchestrateur IA
5. ⚙️ `SPEC_OPEX_V4.md` - Catalogue des workflows d'exécution
6. 📋 `schemas/` - Définitions JSON Schema et YAML de référence

### 👔 Pour le pilotage business / stratégique

**Parcours recommandé** :
1. ✅ Ce fichier (`00_README_SYSTEME_V4.md`) - Vue d'ensemble
2. 📘 `GUIDE_CLIENTS.md` - Positionnement commercial et packs
3. 🔎 `ANALYSE_CRITIQUE_V4.md` - Points forts et risques identifiés
4. 🗓️ `ROADMAP_MVP.md` - Planning de déploiement

---

## ⚠️ Problèmes identifiés et résolus

Pour un suivi détaillé des problèmes critiques, de leur résolution et des actions menées :

👉 **Voir** : `docs/PROBLEMES_RESOLUS.md`

**Synthèse des risques majeurs traités** :
1. ✅ Confusion documentaire (réel/vision) → Résolu par centralisation des schémas
2. ✅ Redondance des définitions → Résolu par `schemas/` unique
3. ⏳ SPOF n8n → En cours (n8n-sandbox + mode dégradé)
4. ⏳ Sécurité auto-génération workflows → En cours (sandbox + validation humaine)
5. ⏳ Parsing JSON fragile → En cours (résolution robuste dans Proxy Master)

---

## 🎯 MVP v4.0 - Définition du Minimum Viable

### Critères de succès pour le lancement MVP

**Kimmy** :
- ✅ Support de 5 intents de base (voir `schemas/intents/kimmy_intents.yml`)
- ✅ Mode autonomie limité à 0-1 (pas d'actions high-risk directes)
- ✅ Sortie conforme à `schemas/kimmy_payload.schema.json`
- ✅ Journalisation dans SystemJournal

**Prolex** :
- ✅ Support des 4 types de ProlexOutput (answer, tool_call, multi_tool_plan, clarification)
- ✅ 5-7 outils activés (TASK_CREATE, TASK_LIST, DOC_SEARCH, WEB_SEARCH, LOG_APPEND)
- ✅ Niveau d'autonomie max = 2
- ✅ Validation JSON stricte
- ✅ Mode dégradé si n8n down

**Opex** :
- ✅ 4 workflows core opérationnels :
  - `100_10_TASK_CREATE`
  - `100_20_TASK_LIST`
  - `400_10_LOG_APPEND_SYSTEMJOURNAL`
  - `600_10_PROXY_MASTER`

---

## 🔗 Liens vers ressources clés

- **Schémas centralisés** : `schemas/`
  - `kimmy_payload.schema.json`
  - `prolex_output.schema.json`
  - `system_journal.schema.json`
  - `intents/kimmy_intents.yml`
  - `autonomy_levels.yml`

- **Configuration** : `config/`
  - `opex_workflows.yml` (workflows core vs later)
  - `kimmy_config.yml` (routing LLM, optimisations)

- **Infrastructure** : `infra/vps-prod/`
  - `docker-compose.yml` (n8n-core + n8n-sandbox)

- **Workflows n8n** : `n8n-workflows/`
  - Core workflows exportés en JSON

---

## 🚀 Prochaines étapes (Quick Start)

1. **Pour démarrer le développement** :
   ```bash
   # Lire ce fichier (déjà fait ✅)
   # Lire ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md
   # Consulter les schemas/ pour les contrats de données
   # Consulter config/opex_workflows.yml pour les workflows prioritaires
   ```

2. **Pour implémenter un nouveau workflow Opex** :
   - Vérifier qu'il est dans la liste `core_workflows` de `config/opex_workflows.yml`
   - Suivre la structure définie dans `SPEC_OPEX_V4.md`
   - Exporter en JSON et placer dans `n8n-workflows/`

3. **Pour modifier les intents Kimmy** :
   - Éditer `schemas/intents/kimmy_intents.yml`
   - Mettre à jour le prompt de Kimmy si nécessaire
   - Ne PAS dupliquer la liste dans les specs

---

## 📞 Support et questions

- **Documentation manquante ou incohérente ?** → Ouvrir une issue GitHub avec le label `documentation`
- **Question architecture ?** → Consulter d'abord `ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md`
- **Problème de schéma JSON ?** → Vérifier les fichiers dans `schemas/`

---

**Dernière mise à jour** : 22 novembre 2025
**Version du document** : 1.0.0
