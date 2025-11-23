# Inbox - Unknown Files

## Description

Dossier **temporaire** pour les fichiers qui n'ont pas pu être classifiés automatiquement par l'orchestrateur de contexte.

## Rôle

C'est le **fallback** du système de routage :
- Fichier reçu par l'orchestrateur
- Aucune catégorie ne correspond
- → Placé ici temporairement
- → Notification envoyée via webhook

## Workflow

1. **Fichier arrive** → Orchestrateur analyse
2. **Aucun match** → Placé dans `inbox/unknown/`
3. **Webhook** → Notification n8n : `automatt_unknown_file`
4. **Humain intervient** :
   - Examine le fichier
   - Décide de la catégorie appropriée
   - Déplace manuellement ou met à jour les règles de routing
5. **Cleanup** → Inbox vidée régulièrement

## Notifications

Chaque fichier placé ici génère une notification webhook :

```json
{
  "event": "unknown_file",
  "fileName": "mystery_document.pdf",
  "filePath": "inbox/unknown/mystery_document.pdf",
  "timestamp": "2025-11-23T10:00:00Z",
  "reason": "No matching category found",
  "metadata": {
    "size": 1024000,
    "extension": ".pdf",
    "mimeType": "application/pdf"
  }
}
```

## Actions Possibles

### Option 1 : Déplacement manuel
```bash
# Examiner le fichier
cat inbox/unknown/mystery_file.txt

# Décider de la catégorie
mv inbox/unknown/mystery_file.txt rag/sources/
```

### Option 2 : Mise à jour du routing
```json
// Dans config/context-routing.json
{
  "categories": {
    "nouvelle_categorie": {
      "localPath": "nouveau/dossier/",
      "match": {
        "nameContains": ["mystery_"]
      }
    }
  }
}
```

### Option 3 : Suppression
```bash
# Si le fichier est inutile/spam
rm inbox/unknown/spam_file.xyz
```

## Nettoyage Automatique

Workflow n8n recommandé :
- Cron : Tous les jours à 2h du matin
- Vérifier l'ancienneté des fichiers
- Archiver > 7 jours
- Supprimer > 30 jours

## Monitoring

### Métriques à surveiller
- Nombre de fichiers unknown par jour
- Types de fichiers non reconnus
- Patterns récurrents → Ajouter de nouvelles catégories

### Alertes
- ⚠️ > 10 fichiers unknown/jour → Revoir les règles de routing
- ⚠️ Même type de fichier récurrent → Créer une nouvelle catégorie

## Important

⚠️ **Ce dossier ne doit JAMAIS être plein**
- C'est un buffer temporaire
- Traiter régulièrement
- Améliorer le routing pour réduire les unknown

✅ **Feedback loop**
- Analyser les fichiers ici
- Améliorer `context-routing.json`
- Réduire progressivement les unknown

## Voir Aussi

- `/config/context-routing.json` - Configuration du routage
- Webhook n8n : `automatt_unknown_file`
- `/logs/tech/` - Logs de l'orchestrateur
