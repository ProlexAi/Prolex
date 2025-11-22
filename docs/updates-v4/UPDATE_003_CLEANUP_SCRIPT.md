# UPDATE 003 — Script de nettoyage massif pour niveau 4

**Date** : 22 novembre 2025
**Script** : `scripts/cleanup-level4.sh`
**Statut** : ✅ Prêt à exécuter

---

## 📋 Résumé

Le script **cleanup-level4.sh** effectue un **nettoyage massif** de tous les workflows et nœuds n8n contenant des validations manuelles obsolètes pour le niveau 4 d'autonomie.

**Objectif** : Supprimer tout le code legacy lié aux validations humaines (approvals, confirmations, wait for Matthieu, etc.).

---

## 🎯 Ce que fait le script

### Étape 1 : Détection des workflows manuels

Recherche tous les workflows JSON contenant :
- `manuel`
- `approval`
- `wait for matthieu`
- `human validation`

**Résultat** : Liste des workflows contenant des validations manuelles obsolètes.

### Étape 2 : Suppression des nœuds obsolètes

Supprime automatiquement toutes les lignes contenant :
- `human_approval`
- `Wait for Matthieu`
- `manual_validation`
- `askHuman`
- `request_confirmation`
- `human_in_the_loop`

**Résultat** : Workflows nettoyés sans validations manuelles.

### Étape 3 : Validation JSON

Vérifie que tous les JSON modifiés sont toujours valides après nettoyage.

**Résultat** :
- JSON valides → Backups supprimés
- JSON invalides → Restauration automatique depuis backup

### Étape 4 : Nettoyage final

Supprime tous les fichiers `.backup` restants après validation.

**Résultat** : Répertoire propre, prêt pour commit Git.

---

## 🚀 Utilisation

### Exécution simple (recommandé)

```bash
# Depuis la racine du repo
./scripts/cleanup-level4.sh
```

### Avec variables d'environnement custom

```bash
# Avec API n8n custom
N8N_API_URL="https://n8n.automatt.ai/api/v1" \
N8N_API_KEY="votre_cle_api" \
./scripts/cleanup-level4.sh
```

### Dry-run (voir sans modifier)

Le script ne propose pas de dry-run, mais vous pouvez faire un backup manuel avant :

```bash
# Backup manuel avant nettoyage
cp -r n8n-workflows n8n-workflows.backup

# Exécuter le script
./scripts/cleanup-level4.sh

# Si problème, restaurer
rm -rf n8n-workflows
mv n8n-workflows.backup n8n-workflows
```

---

## 📊 Exemple de sortie

```
🧹 Nettoyage Prolex niveau 4 en cours...

📁 Répertoire du repo : /home/user/Prolex
📂 Répertoire workflows : /home/user/Prolex/n8n-workflows

🔍 Étape 1/4 : Recherche des workflows avec 'manuel' ou 'approval'...
⚠️  Trouvé 3 workflow(s) avec validations manuelles
   - 900_manuel_test.json
   - 305_client_approval_workflow.json
   - 110_task_with_confirmation.json

🗑️  Étape 2/4 : Suppression des nœuds obsolètes...
   🔍 Recherche de 'human_approval'...
      ⚠️  Trouvé dans 2 fichier(s)
      ✅ Nettoyé: 305_client_approval_workflow.json
      ✅ Nettoyé: 110_task_with_confirmation.json
   🔍 Recherche de 'Wait for Matthieu'...
      ⚠️  Trouvé dans 1 fichier(s)
      ✅ Nettoyé: 900_manuel_test.json
   🔍 Recherche de 'manual_validation'...
      ✅ Aucune occurrence
   🔍 Recherche de 'askHuman'...
      ✅ Aucune occurrence
   🔍 Recherche de 'request_confirmation'...
      ✅ Aucune occurrence
   🔍 Recherche de 'human_in_the_loop'...
      ✅ Aucune occurrence

📊 Total de fichiers nettoyés : 3

✅ Étape 3/4 : Vérification de la validité JSON...
✅ Tous les fichiers JSON sont valides

🗑️  Étape 4/4 : Nettoyage des fichiers backup...
   🔍 Trouvé 3 fichier(s) backup
   ✅ Supprimés

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Nettoyage terminé - Prolex est propre et niveau 4 ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Résumé :
   - Workflows manuels détectés : 3
   - Fichiers nettoyés : 3
   - JSON invalides restaurés : 0

🔄 Prochaines étapes :
   1. Vérifier les modifications : git status
   2. Commit et push : git add . && git commit -m 'cleanup: remove manual validations for level 4' && git push
   3. Vérifier la synchro auto dans n8n

⚠️  Note : Les fichiers modifiés doivent être pushés sur GitHub
          pour que le workflow 010_sync-github-to-n8n les importe
```

---

## 🛠️ Patterns détectés et supprimés

### Nœuds de validation manuelle

```json
// AVANT (détecté et supprimé)
{
  "name": "Wait for Matthieu approval",
  "type": "n8n-nodes-base.wait",
  "parameters": {
    "resume": "webhook",
    "options": {
      "human_approval": true
    }
  }
}

// APRÈS (ligne supprimée)
// (le nœud entier est retiré du workflow)
```

### Conditions de validation

```json
// AVANT (détecté et supprimé)
{
  "name": "Check if human validation required",
  "type": "n8n-nodes-base.if",
  "parameters": {
    "conditions": {
      "boolean": [
        {
          "value1": "={{ $json.request_confirmation }}"
        }
      ]
    }
  }
}

// APRÈS (ligne request_confirmation supprimée)
```

### Webhooks de confirmation

```json
// AVANT (détecté et supprimé)
{
  "name": "Wait for manual_validation",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "manual-approve"
  }
}

// APRÈS (nœud retiré)
```

---

## 🔍 Vérifications post-nettoyage

### 1. Vérifier les modifications Git

```bash
# Voir les fichiers modifiés
git status

# Voir les différences
git diff n8n-workflows/

# Voir les patterns supprimés
git diff n8n-workflows/ | grep -E "-(.*)(human|approval|manuel)"
```

### 2. Valider les JSON

```bash
# Installer jq si pas déjà fait
sudo apt install jq -y

# Valider tous les JSON
for file in n8n-workflows/*.json; do
  if ! jq empty "$file" 2>/dev/null; then
    echo "❌ INVALIDE : $file"
  else
    echo "✅ VALIDE : $file"
  fi
done
```

### 3. Tester un workflow nettoyé

```bash
# Importer dans n8n et tester l'exécution manuelle
# Vérifier qu'il n'y a plus de nœuds "Wait" ou "Approval"
```

---

## ⚠️ Avertissements et limitations

### Limitations connues

1. **Suppression de lignes seulement** : Le script supprime les lignes contenant les patterns, mais ne restructure pas les workflows. Certains workflows peuvent devenir incomplets.

2. **Pas de validation sémantique** : Le script vérifie la validité JSON, mais pas la cohérence logique du workflow.

3. **Backup automatique** : Les backups `.backup` sont créés mais supprimés après validation. Si tu veux garder les backups, ne pas lancer le script.

### Cas où le script peut échouer

| Cas | Raison | Solution |
|-----|--------|----------|
| JSON invalide après nettoyage | Suppression d'une ligne critique | Restauration auto depuis backup |
| Workflow incomplet | Nœud approval au milieu du flow | Vérifier manuellement et restructurer |
| Pattern dans commentaire | Suppression d'un commentaire légitime | Vérifier diff Git et restaurer si besoin |

---

## 🔄 Rollback (annuler le nettoyage)

### Si le script a été exécuté mais pas encore commité

```bash
# Restaurer tous les fichiers modifiés
git checkout n8n-workflows/

# Vérifier que tout est revenu à l'état initial
git status
```

### Si le script a été commité mais pas pushé

```bash
# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1

# OU annuler complètement
git reset --hard HEAD~1
```

### Si le script a été commité ET pushé

```bash
# Revert le commit
git revert HEAD

# Push le revert
git push
```

---

## 📈 Impact attendu

### Avant nettoyage

```
n8n-workflows/
├── 900_manuel_test.json                    (avec "Wait for Matthieu")
├── 305_client_approval_workflow.json       (avec "human_approval")
├── 110_task_with_confirmation.json         (avec "request_confirmation")
└── ... autres workflows
```

### Après nettoyage

```
n8n-workflows/
├── 900_manuel_test.json                    (nettoyé)
├── 305_client_approval_workflow.json       (nettoyé)
├── 110_task_with_confirmation.json         (nettoyé)
└── ... autres workflows (inchangés)
```

**Taille du code** : Réduction de 5-15% selon le nombre de nœuds de validation.

---

## 📊 Métriques de nettoyage

Le script peut détecter et nettoyer environ :

- **3-10 workflows** avec validations manuelles (sur 50-100 workflows au total)
- **10-30 lignes** de code obsolète par workflow
- **100-300 lignes** au total supprimées

**Temps d'exécution** : 5-15 secondes selon le nombre de workflows.

---

## ✅ Checklist post-nettoyage

Après exécution du script :

- [ ] Vérifier `git status` → voir les fichiers modifiés
- [ ] Vérifier `git diff` → voir les patterns supprimés
- [ ] Tester 2-3 workflows nettoyés dans n8n
- [ ] Valider tous les JSON : `find n8n-workflows -name "*.json" -exec jq empty {} \;`
- [ ] Commit : `git add n8n-workflows/ && git commit -m "cleanup: remove manual validations for level 4"`
- [ ] Push : `git push`
- [ ] Vérifier la synchro auto : workflow 010 dans n8n
- [ ] Tester les workflows nettoyés en production

---

## 📞 Support

**Questions ou problèmes ?**

- **Maintainer** : Matthieu (Automatt.ai)
- **Email** : matthieu@automatt.ai
- **Script** : `scripts/cleanup-level4.sh`
- **Docs** : [INDEX_PROLEX.md](../../INDEX_PROLEX.md)

---

**Dernière mise à jour** : 22 novembre 2025
**Auteur** : Matthieu via Claude Code
**Statut** : Prêt à exécuter ✅
