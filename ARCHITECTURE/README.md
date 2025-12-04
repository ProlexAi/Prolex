# 📐 ARCHITECTURE

> Documentation de l'architecture système Prolex V5 (vue publique)

## Contenu

Ce dossier contient la documentation d'architecture **publique** pour l'écosystème Prolex V5.

### Important

Cette documentation représente :
- ✅ L'architecture multi-repos (8 dépôts)
- ✅ Les technologies utilisées (TypeScript, MCP, n8n, etc.)
- ✅ Les intégrations externes (Google, GitHub, n8n)
- ✅ La structure des composants publics

> ⚠️ **Architecture runtime et orchestration** : Le vrai moteur Prolex (runtime, autonomie, orchestration Moi → Kimmy → Prolex → Opex) ainsi que les détails d'implémentation sensibles seront documentés dans **Prolex-Système** (référentiel privé).

### Documents disponibles

Pour le moment, la documentation d'architecture se trouve dans :
- `../docs/architecture/` - Documentation détaillée existante
- `../ARCHITECTURE_COMPLETE_V5.md` - Analyse complète V5 (état actuel)
- `../README.md` - Vue d'ensemble du projet

### Organisation future

Ce dossier sera organisé selon :
- **Vue d'ensemble** : Schémas globaux, diagrammes (version publique)
- **Composants** : Architecture par composant (MCP, Core, Tools, Vector, etc.)
- **Intégrations** : Documentation des intégrations externes
- **Patterns** : Patterns d'architecture utilisés (publics)

### Séparation public/privé

| Aspect | Index-Prolex (public) | Prolex-Système (privé) |
|--------|----------------------|------------------------|
| **Architecture multi-repos** | ✅ Documentée ici | Liens conceptuels |
| **Technologies** | ✅ Stack technique complet | Détails configuration |
| **Composants** | ✅ Description générale | Implémentation runtime |
| **Orchestration** | Vue simplifiée | Logique complète Moi→Kimmy→Prolex→Opex |
| **Autonomie** | Concepts généraux | Règles avancées, garde-fous |
| **Sécurité** | Principes généraux | Détails sensibles |

---

**Dernière mise à jour** : 2025-12-04
