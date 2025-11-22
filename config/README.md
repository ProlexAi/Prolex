# Configuration / config

Ce répertoire contient les fichiers de configuration comportementale pour les agents IA du système Automatt.ai.

## Fichiers

### kimmy_config.yml

Configuration de **Kimmy**, le filtre d'entrée intelligent.

**Rôle** : Analyser les demandes utilisateur, classifier les intentions, extraire les paramètres et décider de l'escalade vers Prolex.

**Paramètres clés** :
- Mode d'opération (safe / quick_actions)
- Liste des intents reconnus
- Seuils de confiance pour les décisions
- Mots-clés sensibles déclenchant l'escalade
- Configuration des quick actions

### prolex_config.yml

Configuration de **Prolex**, le cerveau orchestrateur.

**Rôle** : Planifier les actions, choisir les outils appropriés, orchestrer l'exécution via n8n et garantir la sécurité.

**Paramètres clés** :
- Niveau d'autonomie (0 à 3)
- Outils autorisés par niveau
- Outils sensibles nécessitant confirmation
- Processus d'infrastructure (N8N_SYNC_GITHUB_WORKFLOWS)
- Limites de planification

## Documentation

Pour plus de détails sur l'architecture v4 et l'utilisation de ces configurations, consulter :
- [docs/00_INTEGRATION_V4_KIMMY_PROLEX.md](../docs/00_INTEGRATION_V4_KIMMY_PROLEX.md)

## Modification

Ces fichiers YAML peuvent être édités directement pour ajuster le comportement des agents sans modifier le code.

**Attention** : Toute modification doit être testée et validée avant déploiement en production.
