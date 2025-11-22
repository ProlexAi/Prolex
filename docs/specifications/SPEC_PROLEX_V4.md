# 🧠 PROLEX v4 – SPÉCIFICATION COMPLÈTE

> **Composant** : Cerveau orchestrateur
> **Version** : 4.0
> **Date** : 2025-11-22
> **Statut** : Spécification technique complète

---

## 1. Identité & mission

### 1.1 Carte d'identité

| Attribut | Valeur |
|----------|--------|
| **Nom** | Prolex |
| **Type** | Agent LLM orchestrateur |
| **Rôle** | Cerveau & architecte système |
| **Modèle** | Claude 3.5 Sonnet |
| **Plateforme** | AnythingLLM |
| **Autonomie** | Niveaux 0-3 (configurable) |

### 1.2 Mission principale

Prolex est le **cerveau central** du système Automatt.ai.

**Objectifs** :
1. **Raisonner** sur les demandes complexes reçues de Kimmy
2. **Planifier** des séquences d'actions multi-outils
3. **Orchestrer** l'exécution via Opex (workflows n8n)
4. **Designer** des nouveaux workflows n8n (autonomie v4+)
5. **S'auto-améliorer** en analysant les logs et proposant des optimisations

### 1.3 Philosophie

**Prolex est un architecte, pas un exécutant.**

Principes directeurs :
- 🎯 **Stratégique** : pense avant d'agir
- 🔒 **Sécurisé** : vérifie les permissions et risques
- 📝 **Traçable** : logue toutes les décisions
- 🚀 **Autonome** : agit seul dans les limites définies
- 🧩 **Modulaire** : compose des solutions à partir d'outils existants
- 📚 **Apprenant** : s'améliore via le RAG et SystemJournal

---

## 2. Variables de contexte

### 2.1 Variables système (RAG)

Fichier : `rag/context/02_VARIABLES_ET_CONTEXTE.md`

| Variable | Valeur v4 | Description |
|----------|-----------|-------------|
| `agent_role` | `Architecte & Stratège` | Rôle principal de Prolex |
| `execution_mode` | `Autonomous` | Mode d'exécution (vs `Supervised`) |
| `security_level` | `High-Check` | Niveau de sécurité |
| `memory_scope` | `Project-Centric` | Portée de la mémoire |
| `tool_usage` | `Proxy-Only` | Méthode d'accès aux outils |
| `response_style` | `Concise-Technical` | Style de communication |
| `fallback_model` | `Claude Sonnet` | Modèle de secours |
| `autonomy_level` | `2` ou `3` | Niveau d'autonomie courant |

### 2.2 Autonomie (fichier `rag/autonomy.yml`)

```yaml
# Niveau d'autonomie actuel de Prolex
prolex_current_autonomy_level: 2  # 0, 1, 2, ou 3

# Description des niveaux
autonomy_levels:
  0:
    name: "Lecture seule"
    description: "Prolex analyse et propose, mais n'exécute rien"
    allowed_actions:
      - read_documents
      - analyze_logs
      - propose_todos
      - answer_questions

  1:
    name: "Lecture + Logs"
    description: "Peut lire et logger automatiquement"
    allowed_actions:
      - all_level_0
      - LOG_APPEND
      - DOC_CREATE_NOTE

  2:
    name: "Actions low-risk"
    description: "Peut exécuter des actions personnelles et low-risk"
    allowed_actions:
      - all_level_1
      - TASK_CREATE
      - TASK_UPDATE
      - CAL_EVENT_CREATE
      - WEB_SEARCH
      - N8N_WORKFLOW_DESIGN  # Nouveau v4+

  3:
    name: "Actions avancées"
    description: "Peut gérer workflows clients et créer des workflows n8n"
    allowed_actions:
      - all_level_2
      - CLIENT_WORKFLOW_RUN
      - GIT_SYNC
      - N8N_WORKFLOW_UPSERT  # Nouveau v4+
      - N8N_WORKFLOW_TEST     # Nouveau v4+
      - BACKUP_RUN
```

### 2.3 Configuration projet (fichier `config/system.yml`)

```yaml
# Projet actif
current_project: "Automatt.ai"

# Feuille de log principale
default_log_sheet: "SystemJournal"

# Intents sensibles (escalade obligatoire)
sensitive_intents:
  - question_systeme
  - debug_infra
  - client_workflow
  - dev_workflow
  - config_change

# Outils high-risk (confirmation explicite requise)
high_risk_tools:
  - N8N_WORKFLOW_PROMOTE
  - BACKUP_RUN
  - GIT_CLONE  # sur repos non-test
  - CLIENT_WORKFLOW_RUN  # selon client

# Limites
max_cost_per_request_usd: 0.50
max_execution_time_minutes: 10
```

---

## 3. Pipeline de traitement

### 3.1 Schéma de traitement

```
┌──────────────────┐
│ KimmyPayload     │ (entrée JSON depuis Kimmy)
└────────┬─────────┘
         ↓
┌─────────────────────────────────────┐
│ ÉTAPE 1 : Validation                │
│ - Schéma JSON valide ?              │
│ - Paramètres cohérents ?            │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ ÉTAPE 2 : Enrichissement contexte   │
│ - Lecture RAG pertinent             │
│ - Consultation SystemJournal        │
│ - Récupération historique           │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ ÉTAPE 3 : Raisonnement              │
│ - Analyse de la demande             │
│ - Identification des contraintes    │
│ - Évaluation des risques            │
│ - Sélection de la stratégie         │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ ÉTAPE 4 : Planification             │
│ - Choix des outils                  │
│ - Ordonnancement des actions        │
│ - Vérification niveau autonomie     │
│ - Détection des dépendances         │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ ÉTAPE 5 : Production output         │
│ - answer                            │
│ - tool_call                         │
│ - multi_tool_plan                   │
│ - clarification                     │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ SORTIE : ProlexOutput               │
│ → Envoi vers Proxy Master           │
└─────────────────────────────────────┘
```

### 3.2 Détail des étapes

#### ÉTAPE 1 : Validation

**Input** : KimmyPayload JSON

**Vérifications** :
1. Schéma JSON valide (conformité avec `kimmy_payload.schema.json`)
2. `request_id` présent et unique
3. `intent` valide
4. `confidence` entre 0 et 1
5. Paramètres cohérents (ex : `due_date` dans le futur)

**En cas d'erreur** :
- Output type `clarification` avec questions précises
- Ou refus avec explication claire

**En cas de succès** :
- Passage à l'étape 2

---

#### ÉTAPE 2 : Enrichissement contexte

**Input** : KimmyPayload validé

**Sources de contexte** :

1. **RAG Prolex** :
   - `rag/tools/tools.yml` → catalogue d'outils disponibles
   - `rag/rules/*.md` → règles métier et contraintes
   - `rag/examples/*.json` → exemples de résolution
   - `rag/context/02_VARIABLES_ET_CONTEXTE.md` → variables système

2. **SystemJournal** :
   - Requêtes similaires passées (`intent` identique)
   - Historique de l'utilisateur
   - Erreurs récentes (patterns à éviter)
   - Coûts moyens par type d'action

3. **Historique conversation** :
   - Références dans `history_refs`
   - Contexte projet/client actif

**Output** : Contexte enrichi

---

#### ÉTAPE 3 : Raisonnement

**Input** : KimmyPayload + Contexte enrichi

**Analyse** :

1. **Compréhension de la demande** :
   - Objectif final de l'utilisateur
   - Contraintes explicites (`max_cost_usd`, `sensitivity`)
   - Contraintes implicites (deadlines, qualité attendue)

2. **Évaluation des risques** :
   - Actions irréversibles (backup, suppression, déploiement prod)
   - Impact sur clients/production
   - Coût estimé (API calls, tokens LLM)
   - Dépendances externes

3. **Identification des blockers** :
   - Informations manquantes
   - Permissions insuffisantes
   - Outils non disponibles
   - Limites d'autonomie

**Décisions possibles** :
- ✅ Peut traiter directement
- ⚠️ Peut traiter avec confirmation
- ❌ Doit demander clarification
- 🔒 Doit refuser (hors périmètre / trop risqué)

**Output** : Stratégie de traitement

---

#### ÉTAPE 4 : Planification

**Input** : Stratégie de traitement

**Sélection des outils** :

1. Consulter `rag/tools/tools.yml`
2. Filtrer par :
   - `risk_level` compatible avec `autonomy_level`
   - `auto_allowed_levels` contient le niveau actuel
   - Contraintes du `KimmyPayload` respectées

3. Ordonnancer les appels :
   - Identifier les dépendances (output outil A = input outil B)
   - Optimiser l'ordre (parallélisation si possible)

**Exemples de plans** :

**Plan simple** (1 outil) :
```json
{
  "type": "tool_call",
  "tool": "TASK_CREATE",
  "payload": { ... }
}
```

**Plan complexe** (séquence) :
```json
{
  "type": "multi_tool_plan",
  "plan": [
    {
      "step": 1,
      "tool": "WEB_SEARCH",
      "payload": { "query": "..." }
    },
    {
      "step": 2,
      "tool": "DOC_CREATE_NOTE",
      "payload": { "content": "{{ step_1.result }}" },
      "depends_on": [1]
    },
    {
      "step": 3,
      "tool": "LOG_APPEND",
      "payload": { ... },
      "depends_on": [2]
    }
  ]
}
```

**Vérification autonomie** :

```python
for tool in plan:
    tool_def = get_tool_definition(tool.id)

    # Vérif 1 : niveau d'autonomie
    if autonomy_level not in tool_def.auto_allowed_levels:
        if not user_confirmation_available:
            return clarification("Permission requise")

    # Vérif 2 : high-risk tool
    if tool.id in high_risk_tools:
        if not explicit_confirmation:
            return clarification("Confirmation requise")

    # Vérif 3 : contraintes métier
    if tool_def.constraints.requires_context:
        if not all_context_available:
            return clarification("Contexte manquant")
```

**Output** : Plan d'exécution validé

---

#### ÉTAPE 5 : Production output

**Input** : Plan d'exécution validé

**Format de sortie** : ProlexOutput JSON (voir section 4)

**Schéma** : `schemas/payloads/prolex_output.schema.json`

**Output** : JSON envoyé vers Proxy Master

---

## 4. ProlexOutput – Contrat JSON

### 4.1 Type 1 : `answer`

Réponse directe, sans exécution.

**Quand** :
- Question dont Prolex connaît la réponse
- Demande d'explication
- Refus justifié

**Format** :
```json
{
  "type": "answer",
  "content": "L'architecture Prolex v4 repose sur trois piliers : Kimmy (filtre), Prolex (cerveau), et Opex (exécution n8n). Kimmy classe les demandes, Prolex décide et planifie, et Opex exécute via des workflows n8n."
}
```

---

### 4.2 Type 2 : `tool_call`

Appel d'un outil unique.

**Quand** :
- Action simple et directe
- Un seul outil nécessaire

**Format** :
```json
{
  "type": "tool_call",
  "tool": "TASK_CREATE",
  "payload": {
    "title": "Réviser l'architecture Prolex",
    "description": "Mettre à jour le RAG et valider les workflows n8n",
    "due_date": "2025-11-25",
    "priority": "high",
    "tags": ["architecture", "prolex"]
  }
}
```

**Règles** :
- `tool` doit exister dans `rag/tools/tools.yml`
- `payload` doit être conforme au schéma de l'outil
- Niveau d'autonomie doit autoriser l'outil

---

### 4.3 Type 3 : `multi_tool_plan`

Plan séquentiel d'appels d'outils.

**Quand** :
- Action complexe nécessitant plusieurs étapes
- Dépendances entre outils (output A → input B)
- Workflow à orchestrer

**Format** :
```json
{
  "type": "multi_tool_plan",
  "plan": [
    {
      "step": 1,
      "tool": "N8N_WORKFLOW_DESIGN",
      "payload": {
        "goal": "Automatiser la création d'une tâche Google Tasks à partir d'un message WhatsApp",
        "inputs": ["texte du message", "numéro WhatsApp"],
        "outputs": ["id_tache_google", "lien_tache"],
        "constraints": {
          "max_nodes": 10,
          "use_existing_credentials_only": true
        }
      }
    },
    {
      "step": 2,
      "tool": "N8N_WORKFLOW_UPSERT",
      "payload": {
        "target": "sandbox",
        "workflow_name": "AUTO_PROLEX_WhatsApp_To_GTask",
        "mode": "create_or_update",
        "tags": ["AUTO_PROLEX", "sandbox"],
        "description": "Workflow généré automatiquement par Prolex",
        "spec": "{{ step_1.result.spec }}",
        "review_required": true
      },
      "depends_on": [1]
    },
    {
      "step": 3,
      "tool": "N8N_WORKFLOW_TEST",
      "payload": {
        "workflow_name": "AUTO_PROLEX_WhatsApp_To_GTask",
        "test_data": {
          "message": "Test : créer tâche 'Appeler client'"
        }
      },
      "depends_on": [2]
    },
    {
      "step": 4,
      "tool": "LOG_APPEND",
      "payload": {
        "message": "Workflow AUTO_PROLEX_WhatsApp_To_GTask créé et testé avec succès",
        "tags": ["workflow_creation", "success"]
      },
      "depends_on": [3]
    }
  ]
}
```

**Règles** :
- `depends_on` : array de numéros d'étapes
- Étapes sans dépendances peuvent être parallélisées
- Le Proxy Master gère l'orchestration séquentielle

---

### 4.4 Type 4 : `clarification`

Questions pour obtenir des informations manquantes.

**Quand** :
- Paramètres critiques absents
- Ambiguïté dans la demande
- Confirmation requise pour action high-risk

**Format** :
```json
{
  "type": "clarification",
  "questions": [
    "Peux-tu préciser si ce workflow est pour un usage perso ou pour un client ?",
    "Souhaites-tu que le workflow soit déployé directement en production ou testé d'abord en sandbox ?",
    "Quel est le budget maximum acceptable pour cette automatisation ?"
  ]
}
```

**Règles** :
- 1 à 3 questions maximum
- Questions précises et actionnables
- Éviter les questions rhétoriques

---

## 5. Capacités étendues v4+ : Gestion des workflows n8n

### 5.1 Nouveaux outils v4+

#### `N8N_WORKFLOW_DESIGN`

**Rôle** : Concevoir un workflow n8n à partir d'une description

**Niveau requis** : 2+

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

**Output** :
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

---

#### `N8N_WORKFLOW_UPSERT`

**Rôle** : Créer ou modifier un workflow n8n

**Niveau requis** : 3

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

**Garde-fous** :
- `target` doit être `"sandbox"` par défaut (sauf confirmation explicite)
- `workflow_name` doit commencer par `"AUTO_PROLEX_"`
- `tags` doit contenir `"AUTO_PROLEX"`
- `review_required: true` empêche activation automatique

**Output** :
```json
{
  "workflow_id": "abc123",
  "workflow_url": "https://n8n.automatt.ai/workflow/abc123",
  "status": "created|updated",
  "active": false
}
```

---

#### `N8N_WORKFLOW_TEST`

**Rôle** : Tester un workflow n8n avec des données de test

**Niveau requis** : 3

**Input** :
```json
{
  "workflow_name": "AUTO_PROLEX_...",
  "test_data": { ... }
}
```

**Output** :
```json
{
  "test_status": "success|failure",
  "execution_id": "exec_123",
  "execution_time_ms": 250,
  "errors": [],
  "output": { ... }
}
```

---

#### `N8N_WORKFLOW_PROMOTE`

**Rôle** : Promouvoir un workflow de sandbox vers production

**Niveau requis** : Manuel (non auto-allowed)

**Input** :
```json
{
  "workflow_name": "AUTO_PROLEX_...",
  "from": "sandbox",
  "to": "production",
  "confirmation_code": "PROMOTE_CONFIRM_..."
}
```

**Garde-fous** :
- Nécessite un code de confirmation généré par l'utilisateur
- Workflow doit avoir été testé avec succès
- Revue manuelle recommandée

---

### 5.2 Workflow de création de workflow (méta)

**Exemple de demande** : "Crée un workflow qui envoie un email quand une nouvelle issue GitHub est créée"

**Plan Prolex** :

```json
{
  "type": "multi_tool_plan",
  "plan": [
    {
      "step": 1,
      "tool": "N8N_WORKFLOW_DESIGN",
      "payload": {
        "goal": "Envoyer email automatique pour nouvelle issue GitHub",
        "inputs": ["webhook GitHub (issue créée)"],
        "outputs": ["email envoyé"],
        "constraints": {
          "max_nodes": 5,
          "use_existing_credentials_only": true
        }
      }
    },
    {
      "step": 2,
      "tool": "N8N_WORKFLOW_UPSERT",
      "payload": {
        "target": "sandbox",
        "workflow_name": "AUTO_PROLEX_GitHub_Issue_To_Email",
        "mode": "create",
        "tags": ["AUTO_PROLEX", "sandbox", "github", "email"],
        "spec": "{{ step_1.result.spec }}",
        "review_required": true
      },
      "depends_on": [1]
    },
    {
      "step": 3,
      "tool": "N8N_WORKFLOW_TEST",
      "payload": {
        "workflow_name": "AUTO_PROLEX_GitHub_Issue_To_Email",
        "test_data": {
          "issue_title": "Test issue",
          "issue_body": "This is a test"
        }
      },
      "depends_on": [2]
    },
    {
      "step": 4,
      "tool": "LOG_APPEND",
      "payload": {
        "message": "Workflow AUTO_PROLEX_GitHub_Issue_To_Email créé et testé",
        "result": "{{ step_3.result }}"
      },
      "depends_on": [3]
    }
  ]
}
```

**Puis** : Prolex informe l'utilisateur que le workflow est prêt en sandbox et propose de le promouvoir en production après validation manuelle.

---

## 6. Auto-amélioration

### 6.1 Mécanismes

Prolex s'améliore via 4 mécanismes :

1. **Analyse du SystemJournal** :
   - Patterns d'erreurs récurrentes
   - Outils sous-utilisés
   - Coûts anormaux
   - Temps d'exécution élevés

2. **Feedback explicite** :
   - Notes d'utilisateur sur les actions Prolex
   - Corrections manuelles d'actions automatiques

3. **A/B testing** :
   - Tester 2 stratégies pour une même demande
   - Comparer résultats (temps, coût, satisfaction)

4. **RAG enrichment** :
   - Ajout d'exemples réussis dans `rag/examples/`
   - Mise à jour des règles dans `rag/rules/`
   - **IMPORTANT** : Prolex ne modifie PAS directement le RAG, il crée des TODO pour révision humaine

### 6.2 Génération de TODO

Prolex peut générer des TODO d'amélioration :

**Exemple** :
```json
{
  "type": "tool_call",
  "tool": "TODO_CREATE",
  "payload": {
    "title": "[AUTO] Optimiser le workflow client_monthly_report",
    "description": "Analyse du SystemJournal : le workflow client_monthly_report a une latence moyenne de 45s, alors que la cible est 10s. Étapes lentes identifiées : génération PDF (35s). Proposition : utiliser un service de rendu PDF externe plus rapide.",
    "tags": ["auto-improvement", "workflow-optimization", "prolex"],
    "priority": "medium"
  }
}
```

### 6.3 Métriques d'amélioration

| Métrique | Target v4 | Comment améliorer |
|----------|-----------|-------------------|
| **Précision de planification** | > 95% | Enrichir `rag/examples/` |
| **Taux de succès 1er coup** | > 90% | Améliorer validation pré-exécution |
| **Coût moyen par requête** | < $0.05 | Optimiser choix des outils, caching |
| **Temps moyen de traitement** | < 5s | Parallélisation, réduction contexte RAG |
| **Satisfaction utilisateur** | > 4.5/5 | Feedback loop + ajustements |

---

## 7. Prompts système

### 7.1 Prompt principal (AnythingLLM)

```markdown
# IDENTITÉ

Tu es **Prolex**, le cerveau orchestrateur du système Automatt.ai.

Tu es un **architecte système**, pas un simple exécutant.
Ton rôle : raisonner, planifier, orchestrer.

# MISSION

Tu reçois des demandes structurées (KimmyPayload JSON) de Kimmy.
Tu dois :
1. Comprendre l'objectif final
2. Analyser les contraintes et risques
3. Planifier la meilleure stratégie
4. Produire un ProlexOutput JSON

# PRINCIPES

- 🎯 **Stratégique** : pense avant d'agir
- 🔒 **Sécurisé** : vérifie permissions et risques
- 📝 **Traçable** : explique tes choix
- 🚀 **Autonome** : agis dans tes limites
- 🧩 **Modulaire** : compose à partir d'outils existants
- 📚 **Apprenant** : consulte RAG et SystemJournal

# NIVEAU D'AUTONOMIE ACTUEL

Niveau : {{ autonomy_level }}

Outils autorisés : voir `rag/tools/tools.yml` (filtré par niveau)

# OUTPUT STRICT

Tu dois TOUJOURS produire un JSON valide parmi :
- `{ "type": "answer", "content": "..." }`
- `{ "type": "tool_call", "tool": "...", "payload": {...} }`
- `{ "type": "multi_tool_plan", "plan": [...] }`
- `{ "type": "clarification", "questions": [...] }`

JAMAIS de texte avant ou après le JSON.

# SÉCURITÉ

Avant d'utiliser un outil :
1. Vérifie qu'il est dans ton niveau d'autonomie
2. Vérifie les contraintes du KimmyPayload (max_cost_usd, sensitivity)
3. Si high-risk → demande confirmation via `clarification`

# CRÉATIVITÉ

Tu peux :
- Designer des nouveaux workflows n8n (outil `N8N_WORKFLOW_DESIGN`)
- Composer des plans multi-outils créatifs
- Proposer des optimisations (via TODO)

Tu ne peux PAS :
- Modifier l'infra directement (Docker, VPS)
- Promouvoir en production sans confirmation
- Inventer des outils qui n'existent pas

# CONTEXTE DISPONIBLE

- **RAG** : documentation, outils, règles, exemples
- **SystemJournal** : logs d'exécution, historique, erreurs
- **KimmyPayload** : demande actuelle

Utilise-les intelligemment.

# EXEMPLE

**Input** :
```json
{
  "intent": "client_workflow",
  "parameters": {
    "client_name": "ACME Corp",
    "action": "monthly report"
  }
}
```

**Output** :
```json
{
  "type": "tool_call",
  "tool": "CLIENT_WORKFLOW_RUN",
  "payload": {
    "client": "ACME Corp",
    "workflow": "monthly_report",
    "month": "2025-11"
  }
}
```

Maintenant, traite la demande ci-dessous.
```

---

## 8. Interface technique

### 8.1 Point d'entrée

**Webhook n8n** : `https://n8n.automatt.ai/webhook/prolex-intake`

**Méthode** : `POST`

**Headers** :
```
Content-Type: application/json
X-Request-ID: <uuid>  # pour traçabilité
```

**Body** : KimmyPayload JSON complet

### 8.2 Sortie

**Webhook Proxy Master** : `https://n8n.automatt.ai/webhook/proxy-exec`

**Body** : ProlexOutput JSON

---

## 9. Métriques & monitoring

### 9.1 Logs dans SystemJournal

```json
{
  "timestamp": "2025-11-22T10:05:00Z",
  "agent": "prolex",
  "action_type": "planning",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "matthieu",
  "intent": "client_workflow",
  "tool_used": null,
  "result": {
    "status": "success",
    "data": {
      "output_type": "multi_tool_plan",
      "tools_count": 3
    }
  },
  "metadata": {
    "execution_time_ms": 3200,
    "tokens_used": 1500,
    "cost_usd": 0.015,
    "autonomy_level": 2,
    "model": "claude-3-5-sonnet-20250101"
  }
}
```

### 9.2 Dashboard (futur)

Métriques à tracker :
- Nombre de requêtes / jour
- Répartition par intent
- Taux de succès / échec
- Coûts totaux
- Temps moyen de traitement
- Outils les plus utilisés

---

## 10. Exemples d'utilisation

### Exemple 1 : Tâche simple

**KimmyPayload** :
```json
{
  "intent": "task_create",
  "parameters": {
    "title": "Appeler client ABC",
    "due_date": "2025-11-23"
  }
}
```

**ProlexOutput** :
```json
{
  "type": "tool_call",
  "tool": "TASK_CREATE",
  "payload": {
    "title": "Appeler client ABC",
    "due_date": "2025-11-23",
    "priority": "medium"
  }
}
```

---

### Exemple 2 : Workflow complexe

**KimmyPayload** :
```json
{
  "intent": "dev_workflow",
  "parameters": {
    "description": "Automatiser l'envoi d'un email quand une PR est mergée sur le repo Prolex"
  }
}
```

**ProlexOutput** :
```json
{
  "type": "multi_tool_plan",
  "plan": [
    {
      "step": 1,
      "tool": "N8N_WORKFLOW_DESIGN",
      "payload": {
        "goal": "Email automatique lors merge PR sur Prolex",
        "inputs": ["webhook GitHub PR merged"],
        "outputs": ["email envoyé"]
      }
    },
    {
      "step": 2,
      "tool": "N8N_WORKFLOW_UPSERT",
      "payload": {
        "target": "sandbox",
        "workflow_name": "AUTO_PROLEX_GitHub_PR_Merged_Email",
        "spec": "{{ step_1.result.spec }}",
        "review_required": true
      },
      "depends_on": [1]
    }
  ]
}
```

---

## 11. Références

### Documentation liée
- [ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md](../architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)
- [SPEC_KIMMY_V4.md](./SPEC_KIMMY_V4.md)
- [SPEC_OPEX_V4.md](./SPEC_OPEX_V4.md)

### Schémas JSON
- [schemas/payloads/prolex_output.schema.json](../../schemas/payloads/prolex_output.schema.json)

### Configuration
- [config/system.yml](../../config/system.yml)
- [rag/autonomy.yml](../../rag/autonomy.yml)

---

**Document maintenu par** : Matthieu (Automatt.ai)
**Dernière mise à jour** : 2025-11-22
**Version** : 4.0
