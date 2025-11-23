# RAG Index

## Description

Dossier contenant les **index vectoriels et embeddings** générés par le système RAG de Prolex.

## Contenu

- Index FAISS (.faiss)
- Fichiers d'embeddings (.jsonl, .npy)
- Vector stores (.bin)
- Métadonnées d'indexation

## Naming Convention

Les fichiers dans ce dossier suivent ces patterns :
- `index_<source>_<date>.faiss` - Index FAISS
- `embeddings_<source>.jsonl` - Embeddings JSON Lines
- `vector_store_<timestamp>.bin` - Vector store binaire
- `metadata_<index>.json` - Métadonnées associées

## Exemples

```
index_prolex_v4_20251123.faiss
embeddings_tools_catalog.jsonl
vector_store_20251123_143022.bin
metadata_prolex_v4.json
```

## Workflow

1. **Génération** : AnythingLLM scanne `/rag/sources/` et génère les index
2. **Stockage** : Les fichiers d'index sont placés ici
3. **Interrogation** : Prolex interroge ces index lors des requêtes RAG
4. **Mise à jour** : Réindexation périodique (quotidienne ou à la demande)

## Important

⚠️ **NE PAS modifier manuellement** les fichiers d'index :
- Générés automatiquement par AnythingLLM
- Modification manuelle = corruption possible
- Régénérer l'index plutôt que de modifier

⚠️ **Git Ignore** : Ce dossier devrait être dans `.gitignore` :
- Fichiers binaires volumineux
- Générés automatiquement
- Spécifiques à chaque environnement (local vs VPS)

## Taille et Performance

- **Surveiller la taille** : Les index peuvent devenir volumineux
- **Nettoyage régulier** : Supprimer les anciens index
- **Backup** : Sauvegarder les index de production

## Voir Aussi

- `/rag/sources/` - Fichiers sources indexés
- `/config/prolex_config.yml` - Configuration RAG
- AnythingLLM documentation
