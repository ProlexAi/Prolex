# Contextes Système

## Description

Dossier contenant les **contextes système et prompts** pour les différents composants de Prolex (Kimmy, Prolex, Opex).

## Contenu

- Prompts système pour les LLMs
- Instructions de comportement
- Contextes de raisonnement
- Templates de réponses

## Naming Convention

Les fichiers dans ce dossier suivent ces patterns :
- `contexte_<composant>_v<version>.md` - Contexte principal
- `system_prompt_<composant>.txt` - Prompt système
- `instruction_<action>.json` - Instructions JSON
- `template_<type>.md` - Template de réponse

## Exemples

```
contexte_prolex_v4.md
system_prompt_kimmy_filter.txt
instruction_opex_validation.json
template_response_error.md
```

## Structure Recommandée

### Pour Prolex
```
contexte_prolex_v4.md
- Rôle et responsabilités
- Outils disponibles
- Règles de raisonnement
- Format de sortie (ProlexOutput)
```

### Pour Kimmy
```
system_prompt_kimmy_v4.txt
- Rôle de filtrage
- Classification d'intents
- Évaluation de complexité
- Format de sortie (KimmyPayload)
```

### Pour Opex
```
instruction_opex_execution.json
- Validation via Proxy Master
- Exécution workflows
- Logging SystemJournal
- Gestion erreurs
```

## Workflow

1. **Édition** : Modifier les contextes ici (versionné Git)
2. **Validation** : Tester avec le composant concerné
3. **Déploiement** : Push Git → sync automatique vers n8n/MCP
4. **Monitoring** : Vérifier le comportement post-déploiement

## Bonnes Pratiques

✅ **Versioning** :
- Inclure la version dans le nom de fichier
- Dater les changements majeurs
- Conserver les anciennes versions (Git history)

✅ **Documentation** :
- Expliquer chaque section du contexte
- Donner des exemples
- Documenter les changements (changelog)

✅ **Testing** :
- Tester en staging avant production
- Valider avec des cas réels
- Monitorer les premiers usages

## Important

⚠️ **Impact critique** : Ces fichiers contrôlent le comportement des LLMs
⚠️ **Toujours tester** avant de déployer en production
⚠️ **Backup** : Garder les versions qui fonctionnent

## Voir Aussi

- `/rag/rules/` - Règles principales Prolex
- `/config/prolex_config.yml` - Configuration Prolex
- `/docs/specifications/` - Spécifications des composants
