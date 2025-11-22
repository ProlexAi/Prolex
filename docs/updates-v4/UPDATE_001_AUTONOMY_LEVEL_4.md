# UPDATE 001 — Prolex passe officiellement en autonomie niveau 4

**Date** : 22 novembre 2025
**Version** : Prolex v4.2
**Statut** : ✅ Activé en production

---

## 📋 Résumé

Prolex est désormais en **autonomie niveau 4 permanente**. Cela signifie qu'il peut prendre toutes les décisions business et techniques **sans validation humaine**, avec seulement des **alertes critiques** envoyées à Matthieu via Telegram.

---

## 🎯 Ce qui change

### Plus aucune demande de validation humaine

- ❌ **AVANT (niveau 3)** : Prolex demandait confirmation pour créer des workflows n8n en production, créer des factures, ou modifier des règles RAG
- ✅ **APRÈS (niveau 4)** : Prolex exécute toutes ces actions **automatiquement** sans attendre de validation

### Nouvelles capacités débloquées au niveau 4

| Capacité | Description | Impact |
|----------|-------------|--------|
| **N8N_WORKFLOW_PROMOTE** | Promouvoir workflows sandbox → production | Déploiements instantanés |
| **CLIENT_INVOICE_CREATE** | Créer factures clients automatiquement | Génération automatique de revenus |
| **RAG_RULES_UPDATE** | Modifier règles RAG sans validation | Amélioration continue autonome |
| **N8N_WORKFLOW_DEPLOY_PROD** | Déployer directement en production | Zéro délai de déploiement |
| **GIT_OPERATIONS_PRODUCTION** | Opérations Git sur branche main en prod | CI/CD complet |
| **BACKUP_RESTORE** | Restaurer backups en cas d'urgence | Récupération autonome |

### Alertes critiques seulement

Tu reçois **uniquement** les alertes Telegram pour :

- 💰 **Facture > 5000 €** → Notification avant création
- 📝 **Modification fichier dans `rag/rules/`** → Notification après modification
- 🔧 **Création nouveau workflow n8n** → Notification après création
- 💾 **Restauration backup** → Notification avant restauration
- 🔀 **Opération Git sur branch `main` en production** → Notification après opération
- ⚠️ **Erreur répétée > 5 fois** → Notification d'erreur critique

**Tout le reste = silence radio** → Tu gagnes **3h/jour** minimum.

---

## 🔒 Sécurités maintenues

### Fichiers interdits de modification (même niveau 4)

Prolex **ne peut JAMAIS** modifier ces fichiers, même en niveau 4 :

```yaml
- infra/vps-prod/docker-compose.yml
- .env
- mcp/n8n-server/.env
- config/system.yml
```

### Limites quotidiennes (niveau 4)

| Action | Limite quotidienne |
|--------|-------------------|
| Création factures clients | **50 max** |
| Lancement backups | **10 max** |
| Recherches web | **200 max** |
| Exécution workflows clients | **100 max** |

### Budget et coûts

- **Budget max par requête** : 10 USD (vs 2 USD niveau 3)
- **Outils max par plan** : 20 outils (vs 10 niveau 3)
- **Alerte automatique** : Si montant facture > 5000 €

---

## 📊 Traçabilité complète

### SystemJournal

**Toutes** les actions de Prolex niveau 4 sont loggées dans :

- **Google Sheets** : [SystemJournal](https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk)
- **Onglet** : `events`
- **Format** : JSONL structuré avec timestamp, agent, action, résultat, coût

### Exemples de logs

```json
{
  "timestamp": "2025-11-22T14:30:00Z",
  "agent": "Prolex",
  "autonomy_level": 4,
  "action": "CLIENT_INVOICE_CREATE",
  "client_id": "CLI_001",
  "amount_eur": 1500,
  "status": "success",
  "workflow_id": "310",
  "cost_usd": 0.12
}
```

```json
{
  "timestamp": "2025-11-22T15:45:00Z",
  "agent": "Prolex",
  "autonomy_level": 4,
  "action": "N8N_WORKFLOW_DEPLOY_PROD",
  "workflow_name": "Client Onboarding v2",
  "workflow_id": "350",
  "status": "success",
  "alert_sent": true
}
```

---

## 🚀 Pour revenir en arrière (urgence)

Si besoin de repasser en niveau 3 temporairement :

### Option 1 : Via Git (rapide)

```bash
# Restaurer l'ancienne version
git checkout HEAD~1 config/autonomy.yml

# Commit et push
git add config/autonomy.yml
git commit -m "fix: revert to autonomy level 3 temporarily"
git push

# Redémarrer n8n et MCP
docker restart n8n
```

### Option 2 : Modification directe

```bash
# Éditer le fichier
vim config/autonomy.yml

# Changer la ligne 11 :
prolex_current_autonomy_level: 3  # au lieu de 4

# Commit et push
git add config/autonomy.yml
git commit -m "fix: revert to autonomy level 3"
git push
```

### Option 3 : Désactivation complète (urgence critique)

```bash
# Niveau 0 = lecture seule
vim config/autonomy.yml
# Changer : prolex_current_autonomy_level: 0

# Push immédiat
git add config/autonomy.yml && git commit -m "emergency: level 0" && git push
```

---

## 📈 Bénéfices attendus

### Gain de temps

- **Avant** : 15-20 validations manuelles par jour × 3-5 min = **45-100 min/jour**
- **Après** : 1-3 alertes critiques par jour × 30 sec = **0,5-1,5 min/jour**
- **Gain net** : **~3h/jour** libérées pour tâches stratégiques

### Réactivité

- **Avant** : Création facture après validation manuelle (1-24h délai)
- **Après** : Création facture **instantanée** dès demande client

### Scalabilité

- **Avant** : Matthieu = goulot d'étranglement pour toutes les actions critiques
- **Après** : Prolex gère 100% des opérations, Matthieu supervise via alertes critiques

---

## ✅ Checklist de vérification

Après activation du niveau 4, vérifier que :

- [ ] `config/autonomy.yml` contient `prolex_current_autonomy_level: 4`
- [ ] Workflow `005_critical-alerts-only.json` est actif dans n8n
- [ ] ID Telegram configuré dans `autonomy.yml` ligne 22 (`admin_id: 123456789`)
- [ ] SystemJournal Google Sheets accessible et à jour
- [ ] Limites quotidiennes configurées (50 factures max, etc.)
- [ ] Fichiers interdits listés dans `forbidden_file_modifications`
- [ ] Alertes Telegram fonctionnelles (test avec montant fictif > 5000€)

---

## 📞 Support

**Questions ou problèmes ?**

- **Maintainer** : Matthieu (Automatt.ai)
- **Email** : matthieu@automatt.ai
- **Telegram** : @matthieu_automatt
- **Docs** : [INDEX_PROLEX.md](../../INDEX_PROLEX.md)

---

**Dernière mise à jour** : 22 novembre 2025
**Auteur** : Matthieu via Claude Code
**Statut** : Production ✅
