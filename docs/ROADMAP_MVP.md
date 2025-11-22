# 🗓️ Roadmap MVP Prolex v4

> **Dernière mise à jour** : 22 novembre 2025
> **Objectif** : Planning de déploiement du MVP v4 et versions ultérieures

---

## 🎯 Objectifs du MVP v4.0

**Date cible de lancement** : 30 novembre 2025

**Définition du succès** :
- ✅ Kimmy filtre et structure correctement 5 types d'intents de base
- ✅ Prolex génère des plans valides pour les 4 types de réponses
- ✅ 4 workflows Opex core opérationnels
- ✅ SystemJournal trace toutes les actions
- ✅ Mode dégradé fonctionnel si n8n down
- ✅ n8n-sandbox isolé pour les tests

**Critère d'acceptation** :
> "Un utilisateur interne peut demander la création d'une tâche, consulter un document, et obtenir l'état du système, avec traçabilité complète dans SystemJournal"

---

## 📅 Phase 1 - Fondations (Novembre 2025)

**Semaine du 18-24 novembre 2025** : Documentation et architecture

| Tâche | Statut | Responsable | Date |
|-------|--------|-------------|------|
| Rédaction SPEC_KIMMY_V4.md | ✅ Terminé | Équipe | 18/11 |
| Rédaction SPEC_PROLEX_V4.md | ✅ Terminé | Équipe | 18/11 |
| Rédaction SPEC_OPEX_V4.md | ✅ Terminé | Équipe | 19/11 |
| Rédaction ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md | ✅ Terminé | Équipe | 20/11 |
| Centralisation des schémas (schemas/) | ✅ Terminé | Équipe | 22/11 |
| Création du README système | ✅ Terminé | Équipe | 22/11 |

**Semaine du 25 novembre - 1er décembre 2025** : Implémentation MVP

| Tâche | Statut | Priorité | Date cible |
|-------|--------|----------|-----------|
| Implémentation workflow 400_10_LOG_APPEND_SYSTEMJOURNAL | ⏳ En cours | CRITIQUE | 23/11 |
| Implémentation workflow 100_20_TASK_LIST | ⏳ En cours | HAUTE | 24/11 |
| Implémentation workflow 100_10_TASK_CREATE | ⏳ En cours | HAUTE | 25/11 |
| Implémentation workflow 600_10_PROXY_MASTER | ⏳ En cours | CRITIQUE | 26/11 |
| Mise en place n8n-sandbox | ⏳ En cours | HAUTE | 27/11 |
| Tests d'intégration Kimmy → Prolex → Opex | ⏳ À faire | CRITIQUE | 28/11 |
| Documentation utilisateur finale | ⏳ À faire | MOYENNE | 29/11 |
| Validation MVP interne | ⏳ À faire | CRITIQUE | 30/11 |

---

## 📅 Phase 2 - Stabilisation et premiers utilisateurs (Décembre 2025)

**Objectif** : Stabiliser le MVP et onboarder 1-2 utilisateurs internes

**Semaine du 2-8 décembre 2025** : Stabilisation

| Tâche | Statut | Priorité |
|-------|--------|----------|
| Corrections de bugs MVP | ⏳ À faire | HAUTE |
| Optimisation des prompts Kimmy/Prolex | ⏳ À faire | MOYENNE |
| Monitoring des coûts LLM | ⏳ À faire | HAUTE |
| Documentation des erreurs fréquentes | ⏳ À faire | MOYENNE |

**Semaine du 9-15 décembre 2025** : Onboarding utilisateurs

| Tâche | Statut | Priorité |
|-------|--------|----------|
| Formation utilisateur 1 (interne) | ⏳ À faire | HAUTE |
| Formation utilisateur 2 (interne) | ⏳ À faire | HAUTE |
| Collecte de feedback | ⏳ À faire | HAUTE |
| Ajustements basés sur feedback | ⏳ À faire | HAUTE |

**Semaine du 16-22 décembre 2025** : Extensions v4.1

| Tâche | Statut | Priorité |
|-------|--------|----------|
| Ajout workflow 100_30_TASK_UPDATE | ⏳ À faire | MOYENNE |
| Ajout workflow 200_10_GITHUB_ISSUE_CREATE | ⏳ À faire | MOYENNE |
| Ajout workflow 300_10_CLIENT_INFO_GET | ⏳ À faire | MOYENNE |
| Implémentation validation clickable (600_20) | ⏳ À faire | HAUTE |

---

## 📅 Phase 3 - Expansion clients pilotes (Janvier-Février 2026)

**Objectif** : Onboarder 2-3 clients pilotes et affiner l'offre commerciale

**Janvier 2026** : Préparation commerciale

| Tâche | Statut | Priorité |
|-------|--------|----------|
| Finalisation GUIDE_CLIENTS.md | ⏳ À faire | HAUTE |
| Création de matériel de démonstration | ⏳ À faire | HAUTE |
| Mise en place de la facturation usage-based | ⏳ À faire | HAUTE |
| Onboarding client pilote 1 | ⏳ À faire | CRITIQUE |
| Onboarding client pilote 2 | ⏳ À faire | CRITIQUE |

**Février 2026** : Feedback et ajustements

| Tâche | Statut | Priorité |
|-------|--------|----------|
| Collecte feedback clients pilotes | ⏳ À faire | CRITIQUE |
| Ajustements produit basés sur feedback | ⏳ À faire | HAUTE |
| Optimisation des coûts d'infrastructure | ⏳ À faire | HAUTE |
| Préparation v4.2 avec fonctionnalités clients | ⏳ À faire | MOYENNE |

---

## 📅 Phase 4 - Fonctionnalités avancées (Mars-Avril 2026)

**Objectif** : Atteindre le niveau d'autonomie 3 et les fonctionnalités avancées

**Mars 2026** : Niveau d'autonomie 3

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Validation renforcée | Système de validation multi-niveaux pour actions critiques | HAUTE |
| Rollback automatique | Mécanisme de rollback pour actions réversibles | HAUTE |
| Audit trail complet | Logs détaillés et immuables pour toutes les actions niveau 3 | CRITIQUE |
| Workflow 400_30_BACKUP_RUN | Lancement de backups automatiques | MOYENNE |
| Workflow 600_40_N8N_WORKFLOW_PROMOTE | Promotion sandbox → prod avec validation | HAUTE |

**Avril 2026** : Reporting et analytics

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Dashboard d'analytics | Visualisation des métriques d'usage | MOYENNE |
| Rapports automatiques | Génération de rapports quotidiens/hebdomadaires | MOYENNE |
| Cost explorer | Analyse détaillée des coûts LLM par utilisateur/client | HAUTE |
| Optimisations IA | Fine-tuning basé sur les données collectées | BASSE |

---

## 📅 Phase 5 - Vision long terme (Q2-Q3 2026)

**Objectif** : Fonctionnalités avancées et marketplace

| Fonctionnalité | Description | Timeline |
|----------------|-------------|----------|
| Marketplace Opex | Catalogue public de workflows | Q2 2026 |
| Multi-agents | Plusieurs instances de Prolex spécialisées | Q2 2026 |
| Apprentissage continu | Amélioration automatique basée sur SystemJournal | Q3 2026 |
| API publique | Exposition d'API pour développeurs tiers | Q3 2026 |
| Mobile app | Application mobile pour validation et monitoring | Q3 2026 |

---

## 📊 Métriques de succès

### MVP v4.0 (Fin novembre 2025)

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Taux de succès des requêtes | > 90% | Requêtes traitées sans erreur / Total |
| Temps de réponse moyen | < 5s | Temps entre requête utilisateur et réponse |
| Coût par requête | < $0.02 | Coût LLM moyen par requête |
| Disponibilité | > 95% | Uptime du système |

### v4.1 (Fin décembre 2025)

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Utilisateurs actifs | 5-10 | Utilisateurs ayant fait > 10 requêtes |
| Workflows utilisés | 7+ | Nombre de workflows différents appelés |
| Taux de satisfaction | > 80% | Feedback utilisateurs |
| Bugs critiques | 0 | Bugs bloquants non résolus |

### v4.2 (Fin février 2026)

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Clients pilotes | 2-3 | Clients payants actifs |
| Revenus mensuels | > $500 | MRR (Monthly Recurring Revenue) |
| Coût par client | < $100 | Coût d'infrastructure + LLM par client |
| NPS (Net Promoter Score) | > 40 | Score de recommandation |

---

## 🚧 Risques et mitigation

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Dépassement coûts LLM | MOYENNE | HAUTE | Monitoring en temps réel + alertes + optimisations |
| Complexité technique sous-estimée | HAUTE | HAUTE | Scope MVP strict + focus sur 4 workflows core |
| Problèmes de scalabilité n8n | MOYENNE | MOYENNE | Architecture sandbox + monitoring ressources |
| Feedback négatif utilisateurs | MOYENNE | HAUTE | Onboarding progressif + support réactif |
| Indisponibilité APIs externes | BASSE | HAUTE | Mode dégradé + fallback local |

---

## 📝 Notes de version

### v4.0 (MVP) - 30 novembre 2025
- Kimmy : Filtrage intelligent avec 5 intents de base
- Prolex : Orchestration avec 4 types de réponses
- Opex : 4 workflows core opérationnels
- Infrastructure : n8n-sandbox isolé
- Sécurité : Mode dégradé + SystemJournal

### v4.1 - 31 décembre 2025
- 3 workflows additionnels (TASK_UPDATE, GITHUB_ISSUE_CREATE, CLIENT_INFO_GET)
- Validation clickable pour actions à risque
- Optimisations coûts LLM
- Amélioration UX basée sur feedback

### v4.2 - 28 février 2026
- Onboarding clients pilotes
- Reporting et analytics
- Facturation usage-based
- Fonctionnalités clients avancées

---

**Responsable roadmap** : Équipe Prolex
**Fréquence de mise à jour** : Hebdomadaire pendant Phase 1-2, Mensuelle ensuite
**Dernière revue** : 22 novembre 2025
