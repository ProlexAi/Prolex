# 🚨 CASH WORKFLOWS — ZONE INTERDITE À PROLEX 🚨

> **Date de verrouillage**: 2025-11-22
> **Autorité**: Matthieu (Automatt.ai)
> **Statut**: ACTIF ET APPLIQUÉ

---

## ⚠️ RÈGLE ABSOLUE

Prolex n'a **PLUS LE DROIT** de :

- ❌ **Créer** un workflow avec un nom contenant un pattern interdit
- ❌ **Modifier** un workflow cash existant
- ❌ **Supprimer** un workflow cash
- ❌ **Déclencher manuellement** un workflow cash
- ❌ **Réparer** un workflow cash cassé
- ❌ **Analyser** un workflow cash pour proposer des améliorations
- ❌ **Proposer** une amélioration d'un workflow cash

---

## 📋 WORKFLOWS PROTÉGÉS

Les workflows suivants sont **VERROUILLÉS** :

| Fichier | Nom | Catégorie | Impact |
|---------|-----|-----------|--------|
| `200_leadgen_li_mail.json` | Lead Generation LinkedIn + Email | Sales | HIGH |
| `250_proposal_auto.json` | Proposition Commerciale Automatique | Sales | **CRITICAL** |
| `300_content_machine.json` | Content Machine | Marketing | HIGH |
| `400_invoice_stripe_auto.json` | Invoice & Stripe Auto | Finance | **CRITICAL** |
| `450_relances_impayes.json` | Relances Impayés | Finance | **CRITICAL** |
| `999_master_tracker.json` | Master Tracker | Analytics | **CRITICAL** |

---

## 🔍 PATTERNS INTERDITS

Tout workflow contenant ces éléments est **automatiquement protégé** :

### Préfixes numériques
- `200_`, `250_`, `300_`, `400_`, `450_`, `999_master`

### Mots-clés cash
- `leadgen`, `lead`, `offre`, `proposal`
- `content_machine`, `invoice`, `facture`, `stripe`
- `relance`, `impaye`, `cash`, `tracker`
- `li_mail`, `proposal_auto`

---

## 🛡️ PROTECTION TECHNIQUE

### Implémentation

Le verrou technique est implémenté dans :

```
mcp/n8n-server/src/security/cashWorkflowGuard.ts
```

### Points d'application

Les vérifications sont effectuées dans :

1. **`tools/index.ts → createWorkflow()`**
   - Vérifie le nom avant création
   - Bloque si pattern interdit détecté

2. **`tools/index.ts → updateWorkflow()`**
   - Vérifie le workflow existant par ID
   - Vérifie le nouveau nom si fourni
   - Bloque si protection active

3. **`tools/index.ts → triggerWorkflow()`**
   - Récupère le nom du workflow par ID
   - Vérifie si protégé
   - Bloque le trigger manuel

### Exemple de code

```typescript
import { validateWorkflowOperation } from '../security/cashWorkflowGuard.js';

// Avant toute opération sensible
validateWorkflowOperation(workflowName, 'create', { context });
// Lance une exception si le workflow est protégé
```

---

## 🚨 PROCÉDURE EN CAS DE VIOLATION

Si Prolex détecte qu'il va toucher à un workflow protégé :

### 1. Arrêt immédiat
```
🛑 STOP — Opération annulée
```

### 2. Message d'erreur
```
🚫 CASH WORKFLOW PROTÉGÉ
Prolex n'a pas le droit de [action] "[nom_workflow]"
Seul Matthieu est autorisé.
```

### 3. Alerte Telegram automatique
```
🚨 ALERTE SÉCURITÉ PROLEX 🚨

🔴 Tentative d'accès à un CASH WORKFLOW protégé !

📋 Workflow: [nom]
⚡ Action tentée: [action]
🤖 Agent: Prolex MCP Server
⏰ Timestamp: [ISO 8601]

❌ Opération REFUSÉE automatiquement
✅ Workflow PROTÉGÉ intact
```

### 4. Logging SystemJournal
```json
{
  "event": "cash_workflow_violation_attempt",
  "severity": "CRITICAL",
  "alert_type": "TELEGRAM",
  "workflow_name": "250_proposal_auto.json",
  "action": "update",
  "matched_patterns": ["250_", "proposal", "proposal_auto"],
  "alert_matthieu": true
}
```

---

## 👤 AUTORISATIONS

### Seul autorisé

**Matthieu** (Owner / Administrator)
- **Permissions** : FULL
- **Contexte** : Seul autorisé à modifier les workflows cash

### Exceptions

**Aucune exception autorisée**

Si modification nécessaire → **demander à Matthieu**

---

## 🧪 TESTS DE VALIDATION

### Scénarios à tester

| Scénario | Comportement attendu |
|----------|---------------------|
| Création workflow avec pattern interdit | ❌ Erreur + 📱 Alerte Telegram |
| Modification workflow cash existant | ❌ Erreur + 📱 Alerte Telegram |
| Trigger manuel workflow cash | ❌ Erreur + 📱 Alerte Telegram |
| Création workflow légitime (non-cash) | ✅ Succès sans alerte |

### Commande de test

```bash
# Tester la création d'un workflow interdit
# Devrait échouer avec alerte

# Tester la modification d'un workflow cash
# Devrait échouer avec alerte

# Tester un workflow légitime
# Devrait réussir
```

---

## 📖 RÉFÉRENCES

- **Configuration détaillée** : [`config/cash_workflows_forbidden.yml`](config/cash_workflows_forbidden.yml)
- **Code source** : [`mcp/n8n-server/src/security/cashWorkflowGuard.ts`](mcp/n8n-server/src/security/cashWorkflowGuard.ts)
- **Intégration outils** : [`mcp/n8n-server/src/tools/index.ts`](mcp/n8n-server/src/tools/index.ts)
- **Guide AI** : [`CLAUDE.md`](CLAUDE.md) (section Safety & Security)

---

## 🔄 MAINTENANCE

- **Dernière mise à jour** : 2025-11-22
- **Propriétaire** : Matthieu
- **Prochaine révision** : 2026-01-01
- **Fréquence de mise à jour** : Selon besoins (ajout de nouveaux workflows cash)

---

## ❓ FAQ

### Q: Pourquoi ce verrouillage ?

**R:** Les workflows cash sont **critiques pour le business**. Toute modification non testée pourrait :
- Bloquer la génération de leads
- Casser la facturation automatique
- Perdre des revenus
- Créer des erreurs dans les relances clients

### Q: Prolex peut-il analyser ces workflows en lecture seule ?

**R:** ❌ **NON**. Même l'analyse est interdite pour éviter que Prolex propose des modifications.

### Q: Comment ajouter un nouveau workflow à la liste interdite ?

**R:** Modifier les fichiers suivants (accès Matthieu uniquement) :
1. `config/cash_workflows_forbidden.yml` → ajouter l'entrée
2. `mcp/n8n-server/src/security/cashWorkflowGuard.ts` → ajouter le pattern si nécessaire
3. Rebuild du MCP server

### Q: Que faire si un workflow cash est vraiment cassé ?

**R:**
1. Alerter Matthieu immédiatement
2. Ne PAS tenter de réparer automatiquement
3. Logger l'incident dans SystemJournal
4. Attendre intervention manuelle de Matthieu

---

## 🎯 RÉSUMÉ POUR PROLEX

Si tu détectes que tu vas toucher à un de ces fichiers :

1. **STOP** immédiatement ✋
2. **ALERTE** Telegram à Matthieu 📱
3. **PASSE** à autre chose ➡️

**Violation = alerte critique + arrêt total de l'agent**

---

**Fin du document**
