# RAG Sources

## Description

Dossier contenant les **fichiers sources bruts** pour le système RAG (Retrieval-Augmented Generation) de Prolex.

## Contenu

- Documents de connaissance (.txt, .md, .pdf, .docx)
- Documentations techniques
- Guides et procédures
- Toute information à indexer pour le RAG

## Naming Convention

Les fichiers dans ce dossier doivent suivre ces patterns :
- `rag_<sujet>.md` - Document RAG général
- `source_rag_<nom>.txt` - Source spécifique
- `doc_rag_<thème>.pdf` - Documentation PDF
- `knowledge_<domaine>.md` - Base de connaissance

## Exemples

```
rag_rules_v4.md
source_rag_tools_catalog.txt
doc_rag_architecture_n8n.pdf
knowledge_client_workflows.md
```

## Workflow

1. **Ajout** : Placer les fichiers sources ici (manuellement ou via orchestrateur)
2. **Indexation** : Le système AnythingLLM scanne ce dossier
3. **Vectorisation** : Les embeddings sont générés et stockés dans `rag/index/`
4. **Utilisation** : Prolex interroge le RAG lors du raisonnement

## Important

⚠️ Ne **jamais** modifier directement les fichiers ici sans :
1. Vérifier qu'ils ne sont pas déjà indexés
2. Relancer l'indexation après modification
3. Versionner avec Git

✅ Ce dossier est **versionné** dans Git (source de vérité)

## Voir Aussi

- `/rag/index/` - Index vectoriels générés
- `/rag/context/` - Contextes système
- `/rag/rules/` - Règles Prolex
- `/rag/tools/` - Catalogue outils
