# Exemples Prolex

Ce dossier contient des exemples concrets d'utilisation du système Prolex v4.

## Structure

Les exemples sont organisés par type d'usage :

- **task_management/** - Exemples de gestion de tâches (création, mise à jour)
- **workflow_design/** - Exemples de design et déploiement de workflows n8n
- **client_interactions/** - Exemples d'interactions avec les clients
- **multi_step_plans/** - Exemples de plans multi-étapes complexes

## Format des exemples

Chaque exemple contient :

1. **Contexte** : Description du besoin utilisateur
2. **Payload Kimmy** : Le KimmyPayload JSON généré par Kimmy
3. **Raisonnement Prolex** : Comment Prolex analyse la demande
4. **Output Prolex** : Le ProlexOutput JSON produit
5. **Résultat** : Ce qui est exécuté par Opex

## Utilisation

Ces exemples servent de référence pour :

- Le RAG de Prolex (base de connaissance)
- La documentation client
- Les tests d'intégration
- La formation de nouveaux utilisateurs

## Contribution

Pour ajouter un nouvel exemple :

1. Créer un dossier avec le nom de l'exemple
2. Ajouter un fichier `example.md` avec la structure ci-dessus
3. Inclure les fichiers JSON (kimmy_payload.json, prolex_output.json)
4. Documenter le résultat attendu
