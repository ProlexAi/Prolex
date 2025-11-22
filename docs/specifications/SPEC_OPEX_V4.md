# ⚙️ OPEX v4 – SPÉCIFICATION COMPLÈTE

> **Composant** : Couche d'exécution (n8n + Proxy Master)
> **Version** : 4.0
> **Date** : 2025-11-22
> **Statut** : Spécification technique complète

---

## 1. Vision d'ensemble

### 1.1 Définition

**Opex** = **Op**erational **Ex**ecution layer

C'est l'ensemble de :
- Workflows n8n (exécutants métier)
- Proxy Master (garde-fou et routeur)
- MCP servers (connecteurs externes)

### 1.2 Métaphore

Si Prolex est le **cerveau**, Opex est le **corps** :
- **Bras** : workflows d'actions (Google, GitHub, etc.)
- **Jambes** : workflows de mouvement (backup, sync, deploy)
- **Sens** : monitoring, healthchecks, logs
- **Système nerveux** : Proxy Master (transmet les ordres du cerveau)

### 1.3 Responsabilités

✅ **Opex FAIT** :
- Exécuter les ordres de Prolex (via `ProlexOutput`)
- Gérer les connexions aux APIs externes (Google, GitHub, etc.)
- Surveiller l'infrastructure (healthchecks, alertes)
- Faire les backups automatiques
- Logger toutes les actions dans SystemJournal
- Créer/modifier/tester des workflows n8n (nouveauté v4+)

❌ **Opex NE FAIT PAS** :
- Raisonner ou décider de stratégies
- Modifier les décisions de Prolex
- Filtrer les demandes utilisateur (c'est le rôle de Kimmy)

---

## 2. Architecture Opex

### 2.1 Schéma global

```
┌─────────────────────────────────────┐
│ PROLEX (Cerveau)                    │
└──────────┬──────────────────────────┘
           ↓ ProlexOutput JSON
┌─────────────────────────────────────┐
│ PROXY MASTER (Garde-fou & Routeur)  │
│ - Valide le JSON                    │
│ - Vérifie les permissions           │
│ - Route vers le bon workflow        │
└──────────┬──────────────────────────┘
           ↓
    ┌──────┴────────┬─────────────┬──────────────┬─────────────┐
    ↓               ↓             ↓              ↓             ↓
┌────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│Producti│   │Dev/Git  │   │Client    │   │Monitor   │   │N8N Mgmt  │
│vité    │   │Hub      │   │Workflows │   │& Backup  │   │(v4+)     │
└────────┘   └─────────┘   └──────────┘   └──────────┘   └──────────┘
    ↓               ↓             ↓              ↓             ↓
┌──────────────────────────────────────────────────────────────────┐
│ APIs EXTERNES                                                    │
│ - Google Workspace (Tasks, Calendar, Docs, Sheets, Drive)        │
│ - GitHub (repos, issues, PRs, actions)                           │
│ - n8n API (pour gestion workflows)                               │
│ - Autres services                                                │
└──────────────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────────────┐
│ SYSTEMJOURNAL (Google Sheets)                                    │
│ - Tous les workflows loggent leurs actions ici                   │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Composants clés

#### Proxy Master
- **Fichier** : `n8n-workflows/100_proxy_master_exec.json`
- **Rôle** : Point d'entrée unique pour Prolex
- **Webhook** : `/webhook/proxy-exec`

#### Workflows métier
- **Emplacement** : `n8n-workflows/*.json`
- **Catégories** : voir section 3

#### MCP Servers
- **Emplacement** : `mcp/*-server/`
- **Rôle** : Connecteurs pour services externes

---

## 3. Catalogue de workflows v4

### 3.1 Référence complète

**Fichier central** : [config/opex_workflows.yml](../../config/opex_workflows.yml)

Le catalogue Opex v4 contient **25 workflows** organisés en 8 catégories :

| Catégorie | Plage | Workflows | Description |
|-----------|-------|-----------|-------------|
| **Core / Proxy** | 000-099 | 3 | Workflows système (Proxy Master, Kimmy, sync GitHub) |
| **Productivité** | 100-199 | 5 | Google Tasks, Calendar, Docs |
| **Dev / GitHub** | 200-299 | 4 | Git clone, sync, PR, list repos |
| **Client workflows** | 300-399 | 5 | Onboarding, rapports, packs automatisation |
| **Monitoring / Backup** | 400-499 | 5 | Healthchecks, alertes, backups |
| **Reporting** | 500-599 | 4 | Logs, coûts, résumés |
| **N8N Management** | 600-699 | 5 | Design, upsert, test, promote workflows (v4+) |
| **Exemples / Tests** | 900-999 | 2 | Tests et démos |

### 3.2 Configuration MVP

**MVP Prolex v4** :
- **Autonomie max** : Niveau 2
- **Workflows core** : 4 workflows essentiels
  - `020_proxy_master_exec.json` (Proxy Master)
  - `030_kimmy_master.json` (Kimmy)
  - `100_task_create.json` (Tasks)
  - `500_systemjournal_entry.json` (Logging)

### 3.3 Structure de fichier

Chaque workflow est un fichier JSON dans `n8n-workflows/` avec :
- **Nom** : `<numéro>_<nom-descriptif>.json`
- **Numérotation** : voir tableau ci-dessus
- **Métadonnées** : définies dans `config/opex_workflows.yml`

Pour la liste exhaustive avec détails (tool_id, autonomy_levels, webhooks), consulter :
👉 [config/opex_workflows.yml](../../config/opex_workflows.yml)

---

## 4. Proxy Master – Spécification détaillée

### 4.1 Rôle

Le Proxy Master est le **garde-fou** entre Prolex et les workflows métier.

**Responsabilités** :
1. **Valider** le `ProlexOutput` JSON
2. **Vérifier** les permissions et niveau d'autonomie
3. **Router** vers le(s) bon(s) workflow(s)
4. **Orchestrer** les plans multi-outils
5. **Logger** toutes les actions

### 4.2 Workflow n8n `proxy_master_exec`

**Fichier** : `n8n-workflows/020_proxy_master_exec.json`

**Webhook** : `https://n8n.automatt.ai/webhook/proxy-exec`

**Input** : `ProlexOutput` JSON

**Structure** :

```
[Webhook Trigger: /webhook/proxy-exec]
    ↓
[Validation JSON Schema]
    ├─ Invalide → [Error Response]
    └─ Valide ↓
[Switch by type]
    ├─ type: "answer" → [Return Answer]
    ├─ type: "tool_call" → [Single Tool Executor]
    ├─ type: "multi_tool_plan" → [Multi Tool Orchestrator]
    └─ type: "clarification" → [Return Clarification]
    ↓
[Log to SystemJournal]
    ↓
[Return Response]
```

### 4.3 Nœuds clés

#### Nœud 1 : Validation JSON Schema

```javascript
// Code Node
const schema = $input.item.json;
const ajv = require('ajv');
const validator = new ajv();

// Charger schéma depuis fichier
const prolexOutputSchema = require('./schemas/payloads/prolex_output.schema.json');

const valid = validator.validate(prolexOutputSchema, schema);

if (!valid) {
  return [{
    json: {
      error: "Invalid ProlexOutput schema",
      details: validator.errors
    }
  }];
}

return [$input.item];
```

#### Nœud 2 : Single Tool Executor

```javascript
// Code Node
const toolCall = $input.item.json;
const toolId = toolCall.tool;
const payload = toolCall.payload;

// Charger catalogue d'outils
const toolsCatalog = require('/rag/tools/tools.yml');
const tool = toolsCatalog.find(t => t.id === toolId);

if (!tool) {
  return [{
    json: {
      error: `Tool ${toolId} not found`
    }
  }];
}

// Vérifier niveau d'autonomie
const currentAutonomy = $vars.prolex_current_autonomy_level;
if (!tool.auto_allowed_levels.includes(currentAutonomy)) {
  return [{
    json: {
      error: `Tool ${toolId} requires autonomy level ${tool.auto_allowed_levels}, current: ${currentAutonomy}`
    }
  }];
}

// Router vers le webhook/MCP de l'outil
return [{
  json: {
    target: tool.target,
    payload: payload
  }
}];
```

#### Nœud 3 : Multi Tool Orchestrator

```javascript
// Code Node
const plan = $input.item.json.plan;
const results = [];

// Exécuter séquentiellement (gère les dépendances)
for (const step of plan) {
  // Vérifier dépendances
  if (step.depends_on) {
    for (const depStep of step.depends_on) {
      if (!results[depStep - 1] || results[depStep - 1].status !== 'success') {
        results.push({
          step: step.step,
          status: 'skipped',
          reason: `Dependency step ${depStep} failed or skipped`
        });
        continue;
      }
    }
  }

  // Remplacer les références {{ step_X.result }}
  let resolvedPayload = JSON.stringify(step.payload);
  for (let i = 0; i < results.length; i++) {
    const regex = new RegExp(`{{ step_${i + 1}\\.result }}`, 'g');
    resolvedPayload = resolvedPayload.replace(regex, JSON.stringify(results[i].data));
  }
  step.payload = JSON.parse(resolvedPayload);

  // Exécuter l'outil
  const result = await executeTool(step.tool, step.payload);
  results.push({
    step: step.step,
    status: result.status,
    data: result.data,
    error: result.error
  });
}

return [{
  json: {
    plan_results: results
  }
}];
```

### 4.4 Sécurité & garde-fous

**Vérifications obligatoires** :

1. **Schéma JSON** : `ProlexOutput` conforme au schéma
2. **Outil existant** : `tool` dans le catalogue
3. **Niveau d'autonomie** : `autonomy_level` autorise l'outil
4. **Contraintes métier** : respect `max_cost_usd`, `sensitivity`, etc.
5. **High-risk tools** : confirmation explicite si `tool.id in high_risk_tools`

**En cas d'erreur** :

```json
{
  "error": "Permission denied",
  "details": {
    "tool": "N8N_WORKFLOW_PROMOTE",
    "required_autonomy_level": "manual",
    "current_autonomy_level": 3,
    "reason": "This tool requires explicit user confirmation"
  },
  "timestamp": "2025-11-22T10:00:00Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 5. Gestion des workflows n8n (v4+)

### 5.1 Workflow : `N8N_WORKFLOW_DESIGN`

**Fichier** : `n8n-workflows/600_n8n_workflow_design.json`

**Input** :
```json
{
  "goal": "Description de l'objectif du workflow",
  "inputs": ["liste", "des", "entrées"],
  "outputs": ["liste", "des", "sorties"],
  "constraints": {
    "max_nodes": 10,
    "use_existing_credentials_only": true
  }
}
```

**Traitement** :

1. **Nœud LLM** :
   - Prompt : "Conçois un workflow n8n pour : {{ goal }}"
   - Output : Structure JSON du workflow

2. **Validation** :
   - Vérifier que le nombre de nodes ≤ `max_nodes`
   - Vérifier credentials disponibles

3. **Output** :
```json
{
  "spec": {
    "name": "...",
    "nodes": [...],
    "connections": {...}
  },
  "estimated_complexity": "low|medium|high",
  "dependencies": ["credential_google", "credential_twilio"]
}
```

### 5.2 Workflow : `N8N_WORKFLOW_UPSERT`

**Fichier** : `n8n-workflows/601_n8n_workflow_upsert.json`

**Input** :
```json
{
  "target": "sandbox|staging|production",
  "workflow_name": "AUTO_PROLEX_...",
  "mode": "create_or_update",
  "tags": ["AUTO_PROLEX", "sandbox"],
  "description": "...",
  "spec": { ... },
  "review_required": true
}
```

**Traitement** :

1. **Validation garde-fous** :
   ```javascript
   // Vérif 1 : nom commence par AUTO_PROLEX_
   if (!workflow_name.startsWith('AUTO_PROLEX_')) {
     throw new Error('Workflow name must start with AUTO_PROLEX_');
   }

   // Vérif 2 : target = sandbox par défaut
   if (target !== 'sandbox' && !explicit_confirmation) {
     throw new Error('Creating workflows outside sandbox requires confirmation');
   }

   // Vérif 3 : tag AUTO_PROLEX obligatoire
   if (!tags.includes('AUTO_PROLEX')) {
     throw new Error('Workflow must have AUTO_PROLEX tag');
   }
   ```

2. **Appel API n8n** :
   ```javascript
   const n8nClient = require('./n8nClient');

   if (mode === 'create_or_update') {
     // Vérifier si existe
     const existing = await n8nClient.getWorkflowByName(workflow_name);

     if (existing) {
       // Update
       await n8nClient.updateWorkflow(existing.id, spec);
     } else {
       // Create
       await n8nClient.createWorkflow(spec);
     }
   }
   ```

3. **Log SystemJournal** :
   ```json
   {
     "action_type": "workflow_create",
     "workflow_name": "AUTO_PROLEX_...",
     "target": "sandbox",
     "review_required": true
   }
   ```

4. **Output** :
   ```json
   {
     "workflow_id": "abc123",
     "workflow_url": "https://n8n.automatt.ai/workflow/abc123",
     "status": "created",
     "active": false
   }
   ```

### 5.3 Workflow : `N8N_WORKFLOW_TEST`

**Fichier** : `n8n-workflows/602_n8n_workflow_test.json`

**Input** :
```json
{
  "workflow_name": "AUTO_PROLEX_...",
  "test_data": { ... }
}
```

**Traitement** :

1. **Récupérer workflow** :
   ```javascript
   const workflow = await n8nClient.getWorkflowByName(workflow_name);
   ```

2. **Exécuter test** :
   ```javascript
   const execution = await n8nClient.executeWorkflow(workflow.id, test_data);
   ```

3. **Analyser résultat** :
   ```javascript
   const testStatus = execution.finished ? 'success' : 'failure';
   const errors = execution.data.resultData.error ? [execution.data.resultData.error] : [];
   ```

4. **Output** :
   ```json
   {
     "test_status": "success",
     "execution_id": "exec_123",
     "execution_time_ms": 250,
     "errors": [],
     "output": { ... }
   }
   ```

### 5.4 Workflow : `N8N_WORKFLOW_PROMOTE`

**Fichier** : `n8n-workflows/603_n8n_workflow_promote.json`

**Input** :
```json
{
  "workflow_name": "AUTO_PROLEX_...",
  "from": "sandbox",
  "to": "production",
  "confirmation_code": "PROMOTE_CONFIRM_abc123"
}
```

**Garde-fous** :

```javascript
// Vérif 1 : code de confirmation valide
const expectedCode = generateConfirmationCode(workflow_name, from, to);
if (confirmation_code !== expectedCode) {
  throw new Error('Invalid confirmation code');
}

// Vérif 2 : workflow a été testé avec succès
const testResults = await getTestResults(workflow_name);
if (!testResults || testResults.test_status !== 'success') {
  throw new Error('Workflow must pass tests before promotion');
}

// Vérif 3 : revue manuelle effectuée
if (!review_completed) {
  throw new Error('Manual review required before production promotion');
}
```

**Traitement** :

1. Récupérer workflow source (sandbox)
2. Créer/mettre à jour dans target (production)
3. Changer tags : `["AUTO_PROLEX", "production"]`
4. Logger dans SystemJournal
5. Notifier utilisateur

---

## 6. MCP Servers

### 6.1 MCP n8n (existant)

**Emplacement** : `mcp/n8n-server/`

**Outils exposés** :
- `list_workflows` : Lister workflows n8n
- `trigger_workflow` : Déclencher un workflow

### 6.2 MCP Google Sheets (à créer)

**Emplacement** : `mcp/google-sheets/`

**Outils exposés** :
- `read_sheet` : Lire données d'une feuille
- `write_sheet` : Écrire dans une feuille
- `append_row` : Ajouter une ligne

### 6.3 MCP Google Drive (à créer)

**Emplacement** : `mcp/google-drive/`

**Outils exposés** :
- `list_files` : Lister fichiers
- `read_file` : Lire un fichier
- `write_file` : Écrire un fichier
- `create_folder` : Créer un dossier

### 6.4 MCP SystemJournal (à créer)

**Emplacement** : `mcp/systemjournal/`

**Outils exposés** :
- `log_entry` : Ajouter une entrée SystemJournal
- `query_logs` : Requêter les logs (par date, agent, intent, etc.)
- `get_metrics` : Obtenir métriques (coûts, erreurs, etc.)

---

## 7. Bonnes pratiques de développement de workflows

### 7.1 Structure standard d'un workflow

Tous les workflows doivent suivre cette structure :

```
[Webhook Trigger]
    ↓
[Validation Input]
    ↓
[Business Logic]
    ↓
[Error Handling]
    ↓
[Log to SystemJournal]
    ↓
[Return Response]
```

### 7.2 Logging obligatoire

**Chaque workflow DOIT** :
1. Logger une entrée dans SystemJournal (début)
2. Logger le résultat (succès/échec)
3. Logger les métriques (temps, coût)

**Nœud de log standard** :

```javascript
// Code Node : Log to SystemJournal
const logEntry = {
  timestamp: new Date().toISOString(),
  agent: "opex",
  action_type: "execution",
  request_id: $json.request_id,
  user_id: $json.user_id || "system",
  tool_used: "{{ workflow_name }}",
  result: {
    status: "{{ status }}",
    data: $json.result,
    error: $json.error || null
  },
  metadata: {
    execution_time_ms: $json.execution_time_ms,
    cost_usd: $json.cost_usd || 0
  }
};

// Appeler workflow systemjournal_entry
return [{ json: logEntry }];
```

### 7.3 Gestion d'erreurs

**Toujours** :
- Utiliser des nœuds "Error Trigger"
- Capturer et logger les erreurs
- Retourner un JSON structuré en cas d'erreur

**Format d'erreur standard** :

```json
{
  "error": "Description courte de l'erreur",
  "error_code": "TOOL_EXECUTION_FAILED",
  "details": {
    "tool": "TASK_CREATE",
    "payload": { ... },
    "original_error": "..."
  },
  "timestamp": "2025-11-22T10:00:00Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 7.4 Versioning

**Convention de nommage** :
- Fichier : `<numéro>_<nom>_v<version>.json`
- Exemple : `100_task_create_v2.json`

**Migration** :
- Garder l'ancienne version pendant 1 mois
- Router progressivement le trafic vers nouvelle version
- Logger les versions utilisées

---

## 8. Métriques & monitoring

### 8.1 Métriques par workflow

Tracker pour chaque workflow :
- Nombre d'exécutions / jour
- Taux de succès / échec
- Latence moyenne
- Coût moyen par exécution

### 8.2 Dashboard n8n

Utiliser les métriques natives n8n :
- Executions en cours
- Erreurs récentes
- Workflows les plus utilisés

### 8.3 Alertes

**Configurer des alertes pour** :
- Taux d'erreur > 10%
- Latence > 30s
- Coût journalier > $10
- Workflow inactif depuis > 7 jours (si attendu actif)

---

## 9. Sécurité

### 9.1 Credentials

**Toutes les credentials** doivent être :
- Stockées dans n8n Credentials Manager
- Jamais en clair dans le code
- Renouvelées tous les 90 jours

### 9.2 Webhooks

**Tous les webhooks** doivent :
- Être sécurisés par API Key ou HMAC signature
- Valider l'origine des requêtes
- Rate-limiter (max 100 req/min par défaut)

### 9.3 Données sensibles

**Ne jamais logger** :
- Mots de passe
- API keys
- Tokens
- Données clients sensibles (PII)

**Toujours** :
- Masquer les données sensibles (`***`)
- Utiliser `sensitivity: high` dans les contraintes

---

## 10. Évolutions futures

### v4.1 (court terme)
- [ ] MCP Google Sheets, Drive, SystemJournal
- [ ] Workflows de gestion n8n complets
- [ ] Dashboard de monitoring unifié

### v4.2 (moyen terme)
- [ ] Auto-scaling des workflows selon charge
- [ ] Retry automatique avec backoff exponentiel
- [ ] Circuit breaker pour APIs externes

### v5.0 (long terme)
- [ ] Workflows auto-optimisés (A/B testing automatique)
- [ ] IA pour détecter anomalies
- [ ] Multi-région (Europe + US)

---

## 11. Références

### Documentation liée
- [ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md](../architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)
- [SPEC_KIMMY_V4.md](./SPEC_KIMMY_V4.md)
- [SPEC_PROLEX_V4.md](./SPEC_PROLEX_V4.md)

### Schémas JSON
- [schemas/tools/tool_definition.schema.json](../../schemas/tools/tool_definition.schema.json)

### Configuration
- [rag/tools/tools.yml](../../rag/tools/tools.yml)

---

**Document maintenu par** : Matthieu (Automatt.ai)
**Dernière mise à jour** : 2025-11-22
**Version** : 4.0
