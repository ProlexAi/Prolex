# Intégration v4 - Architecture Kimmy & Prolex

## Vue d'ensemble

Ce document décrit l'intégration de l'architecture v4 du système Automatt.ai, composée de deux agents IA complémentaires :

- **Kimmy** : Filtre d'entrée intelligent (LLM léger + logique n8n)
- **Prolex** : Cerveau architecte et orchestrateur (Claude Sonnet via AnythingLLM)

## 📁 Structure des fichiers

```
Prolex/
├── config/
│   ├── kimmy_config.yml          # Configuration comportementale de Kimmy
│   └── prolex_config.yml         # Configuration comportementale de Prolex
├── schemas/
│   ├── kimmy_payload.schema.json # Schéma JSON des payloads Kimmy → Prolex
│   └── prolex_output.schema.json # Schéma JSON des réponses de Prolex
├── docs/
│   └── 00_INTEGRATION_V4_KIMMY_PROLEX.md  # Ce fichier
└── n8n-workflows/                # Workflows n8n (source de vérité)
```

## 🧠 Architecture logique

### Flux de traitement

```
Utilisateur
    ↓
┌───────────────┐
│     Kimmy     │  ← Filtre d'entrée
│ (LLM léger)   │  • Analyse l'intention
│               │  • Extrait les paramètres
│               │  • Évalue la complexité
└───────────────┘
    ↓
    ↓ (si requires_prolex = true)
    ↓
┌───────────────┐
│    Prolex     │  ← Cerveau
│ (Claude via   │  • Planifie les actions
│  AnythingLLM) │  • Choisit les outils
│               │  • Orchestre l'exécution
└───────────────┘
    ↓
┌───────────────┐
│  Proxy Master │  ← Moteur d'exécution
│     (n8n)     │  • Exécute les workflows
│               │  • Appelle les outils
└───────────────┘
```

## 📋 Fichiers de configuration

### config/kimmy_config.yml

Configuration du comportement de Kimmy :

**Paramètres clés :**
- `kimmy_mode` : `safe` ou `quick_actions`
- `kimmy_intents` : Liste des intentions reconnues
- `kimmy_sensitive_intents` : Intentions nécessitant l'escalade vers Prolex
- `kimmy_sensitive_keywords` : Mots-clés déclenchant l'escalade automatique
- `kimmy_confidence_min_simple` : Seuil de confiance pour traiter en quick action (0.85)
- `kimmy_quick_actions_intents_allowed` : Intentions autorisées en quick actions

**Intents disponibles :**
- `task_create`, `task_update` : Gestion de tâches
- `calendar_event` : Événements du calendrier
- `doc_note`, `doc_structuring` : Documentation
- `question_simple`, `question_systeme` : Questions
- `debug_infra` : Débogage infrastructure
- `client_workflow`, `dev_workflow` : Workflows
- `reporting`, `config_change` : Rapports et configuration
- `other` : Autre

### config/prolex_config.yml

Configuration du comportement de Prolex :

**Paramètres clés :**
- `prolex_execution_mode` : `advisory` ou `autonomous`
- `prolex_security_level` : `low_check`, `normal_check`, ou `high_check`
- `prolex_current_autonomy_level` : 0 à 3 (actuellement : 2)
- `prolex_autonomy_levels` : Définition des niveaux et outils autorisés

**Niveaux d'autonomie :**

| Niveau | Description | Outils autorisés |
|--------|-------------|------------------|
| 0 | Lecture seule, analyse, conseils | Aucun |
| 1 | + Écriture de logs et notes | LOG_APPEND, DOC_CREATE_NOTE |
| 2 | + Actions personnelles low-risk | + TASK_CREATE, TASK_UPDATE, CAL_EVENT_CREATE, WEB_SEARCH |
| 3 | + Actions avancées non destructives | + GIT_CLONE, GIT_SYNC, CLIENT_WORKFLOW_RUN, HEALTHCHECK_RUN |

**Outils sensibles** (nécessitent confirmation explicite) :
- `GIT_SYNC`
- `CLIENT_WORKFLOW_RUN`
- `BACKUP_RUN`, `RESTORE_RUN`
- `CONFIG_CHANGE_APPLY`

## 📊 Schémas JSON

### schemas/kimmy_payload.schema.json

Schéma de validation pour les payloads que Kimmy envoie à Prolex.

**Structure principale :**
```json
{
  "request_id": "uuid-v4",
  "source": "chat|whatsapp|telegram|email|webform|other",
  "raw_input": "texte original de l'utilisateur",
  "language": "fr",
  "kimmy_summary": "résumé de la demande",
  "intent": "task_create|...",
  "complexity": "simple|complex|unclear",
  "confidence": 0.0-1.0,
  "requires_prolex": true|false,
  "suggested_tools": ["TOOL_ID", ...],
  "parameters": {
    "title": "...",
    "description": "...",
    "due_date": "YYYY-MM-DD",
    "client_name": "...",
    "priority": "low|medium|high",
    "tags": [...]
  },
  "constraints": {
    "max_cost_usd": 0.02,
    "can_use_web": true,
    "sensitivity": "low|medium|high"
  },
  "history_refs": [...]
}
```

### schemas/prolex_output.schema.json

Schéma de validation pour les réponses de Prolex.

**Types de sortie :**

1. **answer** : Réponse textuelle simple
   ```json
   {
     "type": "answer",
     "content": "Texte de la réponse"
   }
   ```

2. **tool_call** : Appel d'un seul outil
   ```json
   {
     "type": "tool_call",
     "tool": "TASK_CREATE",
     "payload": { ... }
   }
   ```

3. **multi_tool_plan** : Plan multi-étapes
   ```json
   {
     "type": "multi_tool_plan",
     "plan": [
       {
         "step_index": 1,
         "description": "...",
         "tool": "TOOL_ID",
         "payload": { ... }
       }
     ]
   }
   ```

4. **clarification** : Questions de clarification
   ```json
   {
     "type": "clarification",
     "questions": ["Question 1?", "Question 2?"]
   }
   ```

## 🔄 Processus d'infrastructure

### N8N_SYNC_GITHUB_WORKFLOWS

**Important** : Processus automatique que Prolex **NE DOIT PAS** déclencher directement.

**Fonctionnement :**
- Déclenché automatiquement par webhook GitHub
- Synchronise les fichiers `n8n-workflows/*.json` vers n8n
- Crée / met à jour / désactive les workflows n8n
- Écrit les logs dans Google Sheets (onglet `events`)

**Logs disponibles** (Google Sheets `Automatt_Logs`, onglet `events`) :
- `timestamp_utc` : Horodatage de l'événement
- `repo` : Dépôt GitHub
- `branch` : Branche concernée
- `commit_sha` : Hash du commit
- `actor` : Auteur du commit
- `file_path` : Chemin du fichier JSON
- `change_type` : `added|modified|removed`
- `action_taken` : Action effectuée par le workflow
- `workflow_id` : ID du workflow n8n
- `workflow_name` : Nom du workflow
- `trigger_origin` : Origine du déclenchement
- `status` : `success|error`
- `error_message` : Message d'erreur éventuel
- `source_file_version` : Version du fichier source

**Utilisation par Prolex :**

Prolex peut **consulter** ces logs pour répondre à des questions comme :
- "Quand ce workflow a-t-il été mis à jour ?"
- "La dernière synchronisation GitHub→n8n a-t-elle échoué ?"
- "Quels workflows ont été modifiés aujourd'hui ?"

Pour cela, Prolex doit :
1. Lire les fichiers JSON dans `n8n-workflows/` (via outils GitHub)
2. Consulter les logs de l'onglet `events` (via outil SYSTEMJOURNAL_QUERY)
3. Corréler les informations sans déclencher la synchronisation

## 🛡️ Règles de sécurité

### Kimmy

1. **Escalade obligatoire** vers Prolex si :
   - Intent dans `kimmy_sensitive_intents`
   - Mot-clé dans `kimmy_sensitive_keywords` détecté
   - Confiance < `kimmy_confidence_min_escalation` (0.80)
   - Complexité = `complex` ou `unclear`

2. **Quick actions** autorisées si :
   - Intent dans `kimmy_quick_actions_intents_allowed`
   - Confiance ≥ `kimmy_confidence_min_simple` (0.85)
   - Sensibilité ≤ `kimmy_quick_actions_max_sensitivity` (low)
   - Mode = `quick_actions`

### Prolex

1. **Outils sensibles** : toujours vérifier, même au niveau 3
2. **Confirmation requise** : demander validation utilisateur avant exécution
3. **Niveau d'autonomie** : respecter strictement les outils autorisés
4. **Processus d'infra** : ne jamais déclencher `N8N_SYNC_GITHUB_WORKFLOWS` directement

## 📝 Utilisation pratique

### Exemple de flux complet

**Entrée utilisateur :**
> "Crée-moi une tâche pour préparer la démo client demain"

**1. Kimmy analyse :**
```yaml
intent: task_create
complexity: simple
confidence: 0.92
requires_prolex: false  # Confiance élevée, intent autorisé
```

**2. Kimmy exécute en quick action** (si mode = quick_actions)
OU
**2. Kimmy escalade vers Prolex** (si confiance < seuil ou mode = safe)

**3. Prolex planifie :**
```json
{
  "type": "tool_call",
  "tool": "TASK_CREATE",
  "payload": {
    "title": "Préparer la démo client",
    "due_date": "2025-11-23",
    "priority": "high"
  }
}
```

**4. Proxy Master (n8n) exécute** le workflow TASK_CREATE

**5. Réponse à l'utilisateur :**
> "✓ Tâche créée : 'Préparer la démo client' pour demain (priorité haute)"

## 🔧 Maintenance et évolution

### Modifier le comportement de Kimmy

Éditer `config/kimmy_config.yml` :
- Ajouter des intents à `kimmy_intents`
- Ajuster les seuils de confiance
- Modifier les mots-clés sensibles

### Modifier le comportement de Prolex

Éditer `config/prolex_config.yml` :
- Ajuster le niveau d'autonomie (`prolex_current_autonomy_level`)
- Ajouter des outils à `allowed_tool_ids`
- Modifier les outils sensibles

### Validation des schémas

Les schémas JSON peuvent être utilisés pour valider :
- Les payloads générés par Kimmy
- Les réponses générées par Prolex

Outils recommandés :
- Python : `jsonschema`
- Node.js : `ajv`
- Validation en ligne : https://www.jsonschemavalidator.net/

## 📚 Documentation liée

Fichiers de documentation du projet (à créer selon `config/prolex_config.yml`) :
- `docs/01_ARCHITECTURE_SYSTEME_V4.md` : Architecture complète du système
- `docs/02_VARIABLES_ET_CONTEXTE.md` : Variables et contexte du projet
- `docs/03_DECISIONS_CLEF_PROJET.md` : Décisions architecturales (ADR)
- `docs/05_KIMMY_PROLEX_SPEC_V4.md` : Spécifications détaillées de Kimmy et Prolex

## ✅ Checklist d'intégration

- [x] Créer `config/kimmy_config.yml`
- [x] Créer `schemas/kimmy_payload.schema.json`
- [x] Créer `config/prolex_config.yml`
- [x] Créer `schemas/prolex_output.schema.json`
- [x] Créer documentation d'intégration
- [ ] Configurer Kimmy pour utiliser `config/kimmy_config.yml`
- [ ] Configurer Prolex (AnythingLLM) pour utiliser `config/prolex_config.yml`
- [ ] Implémenter la validation des schémas JSON dans les workflows n8n
- [ ] Créer le workflow n8n "Proxy Master" (orchestrateur)
- [ ] Tester le flux Kimmy → Prolex → Proxy Master
- [ ] Configurer l'accès de Prolex à l'onglet `events` (SystemJournal)

---

**Version** : v4.0
**Dernière mise à jour** : 2025-11-22
**Auteur** : Claude (assistant développeur & architecte système)
