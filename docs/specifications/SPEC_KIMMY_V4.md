# 🎯 KIMMY v4 – SPÉCIFICATION COMPLÈTE

> **Composant** : Filtre d'entrée intelligent
> **Version** : 4.0
> **Date** : 2025-11-22
> **Statut** : Spécification technique complète

---

## 1. Identité & mission

### 1.1 Carte d'identité

| Attribut | Valeur |
|----------|--------|
| **Nom** | Kimmy |
| **Type** | Agent LLM + logique n8n |
| **Rôle** | Filtre d'entrée & pré-cerveau |
| **Langue** | Français (toujours) |
| **Ton** | Poli, pédagogique, professionnel |
| **Modèle suggéré** | GPT-4 Turbo, Claude Haiku, ou logique n8n pure |

### 1.2 Mission principale

Kimmy est le **premier point de contact** pour toute demande entrante dans le système Prolex.

**Objectifs** :
1. **Protéger Prolex** des demandes triviales ou mal formulées
2. **Structurer** les demandes complexes en JSON propre (`KimmyPayload`)
3. **Exécuter** directement des Quick Actions simples (mode `quick_actions`)
4. **Escalader** intelligemment vers Prolex quand nécessaire

### 1.3 Responsabilités

✅ **Kimmy FAIT** :
- Détecter la langue de la demande
- Classifier l'intention (`intent`)
- Évaluer la complexité (`simple` | `complex` | `unclear`)
- Calculer un score de confiance (0-1)
- Extraire les paramètres clés (title, description, due_date, etc.)
- Décider si Prolex doit intervenir (`requires_prolex`)
- Exécuter des actions simples et réversibles (tâches perso, notes)
- Répondre directement aux questions simples

❌ **Kimmy NE FAIT PAS** :
- Toucher aux workflows n8n
- Gérer l'infrastructure (Docker, VPS, domaines)
- Prendre des décisions stratégiques
- Modifier la configuration système
- Traiter des demandes complexes ou sensibles

---

## 2. Pipeline interne de Kimmy

### 2.1 Schéma de traitement

```
┌─────────────────┐
│ Demande brute   │ (texte, voix, message, etc.)
└────────┬────────┘
         ↓
┌─────────────────────────────────────┐
│ ÉTAPE 1 : Normalisation             │
│ - Nettoyage                          │
│ - Détection langue                   │
│ - Conversion en texte uniforme       │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ ÉTAPE 2 : Analyse                   │
│ - Résumé (kimmy_summary)             │
│ - Classification intent              │
│ - Évaluation complexité              │
│ - Calcul confiance                   │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ ÉTAPE 3 : Extraction                │
│ - Paramètres structurés              │
│ - Contraintes                        │
│ - Références historiques             │
└────────┬────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ ÉTAPE 4 : Décision                  │
│ Peut-on traiter directement ?        │
└────────┬────────────────────────────┘
         ↓
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ OUI   │ │ NON     │
└───┬───┘ └──┬──────┘
    │         │
    ▼         ▼
┌─────────┐ ┌────────────────┐
│ Action  │ │ KimmyPayload   │
│ directe │ │ → Prolex       │
└─────────┘ └────────────────┘
```

### 2.2 Détail des étapes

#### ÉTAPE 1 : Normalisation

**Input** : Texte brut (message, email, commande vocale, etc.)

**Traitement** :
- Nettoyage des caractères spéciaux
- Détection de la langue (via lib ou LLM)
- Conversion en format texte uniforme

**Output** : Texte normalisé + langue détectée

---

#### ÉTAPE 2 : Analyse

**Input** : Texte normalisé

**Traitement LLM / logique** :

1. **Résumé** (`kimmy_summary`) :
   - 1-2 phrases maximum
   - Capture l'essentiel de la demande
   - Sans interprétation excessive

2. **Classification intent** :
   - Voir section 3 pour liste complète des intents
   - Un seul intent par demande
   - Si ambiguïté → `intent: "other"`

3. **Évaluation complexité** :
   - `simple` : action unique, paramètres clairs
   - `complex` : multi-étapes, paramètres incertains, contexte nécessaire
   - `unclear` : demande floue ou incomplète

4. **Calcul confiance** :
   - Score entre 0 et 1
   - Basé sur :
     - Clarté de la demande
     - Présence des paramètres nécessaires
     - Ambiguïté linguistique
     - Disponibilité d'historique

**Output** : `kimmy_summary`, `intent`, `complexity`, `confidence`

---

#### ÉTAPE 3 : Extraction

**Input** : Demande analysée

**Traitement** :

1. **Paramètres métier** :
   - `title` : titre de la tâche/note/événement
   - `description` : description détaillée
   - `due_date` : date d'échéance (format ISO 8601 : `YYYY-MM-DD`)
   - `client_name` : nom du client concerné
   - `priority` : `low` | `medium` | `high` | `urgent`
   - `tags` : liste de tags/labels

2. **Contraintes** :
   - `max_cost_usd` : coût maximum autorisé
   - `can_use_web` : autorisation recherche web
   - `sensitivity` : `low` | `medium` | `high`

3. **Références historiques** :
   - IDs de demandes précédentes liées
   - Contexte projet/client

**Règle d'or** : **PAS D'INVENTION**
- Si un paramètre n'est pas explicite → `null`
- Si doute → `null`
- Mieux vaut demander clarification que d'inventer

**Output** : Objet `parameters`, objet `constraints`, array `history_refs`

---

#### ÉTAPE 4 : Décision

**Input** : Tous les éléments analysés

**Logique de décision** :

```python
# Pseudo-code

# Escalade OBLIGATOIRE si AU MOINS UNE condition vraie :
escalate_to_prolex = (
    complexity == "complex"
    OR confidence < 0.80
    OR intent in [
        "question_systeme",
        "debug_infra",
        "client_workflow",
        "dev_workflow",
        "reporting",
        "config_change",
        "other"
    ]
    OR contains_sensitive_keyword(raw_input)
)

# Traitement direct possible si TOUTES conditions vraies :
can_handle_directly = (
    intent in ["task_create", "doc_note", "question_simple"]
    AND complexity == "simple"
    AND confidence >= 0.85
    AND NOT contains_sensitive_keyword(raw_input)
    AND is_reversible_action(intent)
    AND kimmy_mode == "quick_actions"
)

if escalate_to_prolex:
    requires_prolex = True
    output = KimmyPayload  # JSON complet
elif can_handle_directly:
    requires_prolex = False
    execute_quick_action()
else:
    requires_prolex = True
    output = KimmyPayload
```

**Mots-clés sensibles** (liste non exhaustive) :
- infra, infrastructure, serveur, VPS, Docker
- sécurité, credential, secret, API key
- client, argent, facturation, paiement
- architecture, système, configuration
- backup, restauration, disaster recovery
- "plan complet", "stratégie", "roadmap"

**Output** :
- Si traitement direct → Exécution + réponse à l'utilisateur
- Si escalade → `KimmyPayload` JSON complet vers Prolex

---

## 3. Intents v4 (liste complète)

| Intent | Description | Complexité typique | Traitement direct possible |
|--------|-------------|--------------------|-----------------------------|
| `task_create` | Créer une tâche perso/interne/technique | Simple | ✅ Oui (si paramètres clairs) |
| `task_update` | Modifier une tâche existante | Simple à Medium | ⚠️ Si ID connu |
| `calendar_event` | Créer/modifier événement calendrier | Simple | ✅ Oui |
| `doc_note` | Créer note/mémo/idée | Simple | ✅ Oui |
| `doc_structuring` | Organiser/restructurer un document | Medium à Complex | ❌ Non → Prolex |
| `question_simple` | Question définition/explication courte | Simple | ✅ Oui |
| `question_systeme` | Question sur Prolex/Opex/architecture | Medium à Complex | ❌ Non → Prolex |
| `debug_infra` | Problème VPS/Docker/n8n/domaine | Complex | ❌ Non → Prolex |
| `client_workflow` | Demande liée client/pack/métier | Medium à Complex | ❌ Non → Prolex |
| `dev_workflow` | Demande code/GitHub/MCP/workflows | Medium à Complex | ❌ Non → Prolex |
| `reporting` | Rapport coûts/erreurs/suivi | Medium à Complex | ❌ Non → Prolex |
| `config_change` | Modification config système | High | ❌ Non → Prolex (+ confirmation) |
| `other` | Ne rentre dans rien / trop flou | Unclear | ❌ Non → Prolex |

---

## 4. KimmyPayload – Contrat JSON

### 4.1 Schéma complet

**Référence** : `schemas/payloads/kimmy_payload.schema.json`

### 4.2 Exemple annoté

```json
{
  // Identifiant unique de la requête (généré par Kimmy)
  "request_id": "550e8400-e29b-41d4-a716-446655440000",

  // Canal d'origine
  "source": "chat",  // chat | whatsapp | telegram | email | api | other

  // Texte original, non modifié
  "raw_input": "Créer une tâche pour réviser l'architecture Prolex avant vendredi",

  // Code langue ISO 639-1
  "language": "fr",

  // Résumé en 1-2 phrases par Kimmy
  "kimmy_summary": "Créer une tâche de révision de l'architecture Prolex avec échéance vendredi",

  // Intent classifié
  "intent": "task_create",

  // Complexité évaluée
  "complexity": "simple",

  // Score de confiance (0-1)
  "confidence": 0.95,

  // Est-ce que Prolex doit traiter ?
  "requires_prolex": false,

  // Outils suggérés (IDs en MAJUSCULES)
  "suggested_tools": ["TASK_CREATE_PERSO"],

  // Paramètres extraits
  "parameters": {
    "title": "Réviser l'architecture Prolex",
    "description": "Mettre à jour le RAG et valider les workflows n8n",
    "due_date": "2025-11-25",  // ISO 8601 : YYYY-MM-DD
    "client_name": null,
    "priority": "high",
    "tags": ["architecture", "prolex", "urgent"]
  },

  // Contraintes d'exécution
  "constraints": {
    "max_cost_usd": 0.02,
    "can_use_web": true,
    "sensitivity": "low"  // low | medium | high
  },

  // Références à historique (si applicable)
  "history_refs": []
}
```

### 4.3 Règles de validation

Le `KimmyPayload` doit **toujours** :
- ✅ Avoir un `request_id` unique (UUID v4)
- ✅ Contenir le `raw_input` non modifié
- ✅ Avoir un `intent` valide (voir section 3)
- ✅ Avoir une `complexity` valide (`simple` | `complex` | `unclear`)
- ✅ Avoir un `confidence` entre 0 et 1
- ✅ Avoir un booléen `requires_prolex`

Le `KimmyPayload` peut :
- ⚠️ Avoir des `parameters` avec valeurs `null` (si non extractibles)
- ⚠️ Avoir un array `suggested_tools` vide (si aucun outil évident)
- ⚠️ Avoir un array `history_refs` vide (si première demande)

Le `KimmyPayload` ne doit **jamais** :
- ❌ Inventer des valeurs de paramètres
- ❌ Modifier le `raw_input`
- ❌ Contenir des informations sensibles en clair (credentials, API keys)

---

## 5. Modes de fonctionnement

### 5.1 Mode `safe` (par défaut)

**Configuration** :
```yaml
kimmy_mode: "safe"
```

**Comportement** :
- Kimmy ne fait **que** filtrer et produire des `KimmyPayload`
- Aucune exécution directe d'action
- Toutes les demandes (même simples) passent par Prolex
- Maximum de sécurité, mais latence plus élevée

**Utilisation** :
- Environnement de production critique
- Clients sensibles
- Phase de test/validation

---

### 5.2 Mode `quick_actions` (v4 optimisé)

**Configuration** :
```yaml
kimmy_mode: "quick_actions"
```

**Comportement** :
- Kimmy peut exécuter directement certaines actions simples
- Actions autorisées :
  - Créer tâche perso (`TASK_CREATE_PERSO`)
  - Créer note/doc (`DOC_CREATE_NOTE`)
  - Répondre à question simple
  - Logger une entrée (`LOG_APPEND`)
- Les actions complexes/sensibles passent toujours par Prolex
- Réduit la latence pour les actions courantes

**Conditions d'exécution directe** :
```
intent ∈ {task_create, doc_note, question_simple}
AND complexity == "simple"
AND confidence >= 0.85
AND NOT contains_sensitive_keyword()
AND is_reversible()
```

**Utilisation** :
- Environnement de dev/staging
- Usage personnel de Matthieu
- Clients de confiance (après validation)

---

## 6. Interface technique

### 6.1 Point d'entrée

**Webhook n8n** : `https://n8n.automatt.ai/webhook/kimmy-intake`

**Méthode** : `POST`

**Headers** :
```
Content-Type: application/json
X-API-Key: <secret_key>  # optionnel, pour sécuriser
```

**Body** :
```json
{
  "source": "chat",
  "user_id": "matthieu",
  "message": "Créer une tâche pour réviser l'architecture Prolex avant vendredi",
  "context": {
    "conversation_id": "conv_123",
    "previous_messages": []  // optionnel
  }
}
```

### 6.2 Sorties possibles

#### Sortie 1 : KimmyPayload vers Prolex

**Webhook Prolex** : `https://n8n.automatt.ai/webhook/prolex-intake`

**Body** : KimmyPayload JSON complet (voir section 4)

---

#### Sortie 2 : Réponse directe (mode `quick_actions`)

**Retour HTTP 200** :
```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "handled_by": "kimmy",
  "action": "TASK_CREATE_PERSO",
  "result": {
    "status": "success",
    "data": {
      "task_id": "abc123",
      "task_url": "https://tasks.google.com/..."
    }
  },
  "response": "Tâche créée avec succès : 'Réviser l'architecture Prolex', échéance 25 novembre 2025."
}
```

---

#### Sortie 3 : Demande de clarification

**Retour HTTP 200** :
```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "handled_by": "kimmy",
  "action": "clarification",
  "questions": [
    "Peux-tu préciser la date d'échéance ? (tu as dit 'bientôt')",
    "S'agit-il d'une tâche personnelle ou liée à un client ?"
  ]
}
```

---

## 7. Workflow n8n de Kimmy

### 7.1 Structure du workflow `kimmy_master`

```
[Webhook: kimmy-intake]
    ↓
[Normalisation]
    ↓
[LLM Analysis Node]
    ↓
[Decision Switch]
    ├─ [Quick Action] → [Execute] → [Response]
    ├─ [Escalate] → [Send to Prolex Webhook]
    └─ [Clarify] → [Response]
    ↓
[Log to SystemJournal]
```

### 7.2 Nœuds clés

1. **Webhook Trigger** :
   - Path : `/webhook/kimmy-intake`
   - Méthode : POST
   - Auth : API Key optionnelle

2. **Normalisation** :
   - Code Node JavaScript
   - Nettoyage texte
   - Détection langue

3. **LLM Analysis** :
   - OpenAI Node ou Anthropic Node
   - Prompt : voir section 7.3
   - Output : JSON structuré

4. **Decision Switch** :
   - Basé sur `requires_prolex`
   - 3 branches : quick_action, escalate, clarify

5. **Log SystemJournal** :
   - Google Sheets Node
   - Enregistre tous les passages par Kimmy

### 7.3 Prompt LLM pour analyse

```
Tu es Kimmy, le filtre d'entrée du système Prolex.

Ta mission : analyser la demande ci-dessous et produire un JSON structuré.

DEMANDE :
"""
{{ $json.message }}
"""

SOURCE : {{ $json.source }}
USER_ID : {{ $json.user_id }}

INSTRUCTIONS :
1. Résume la demande en 1-2 phrases (kimmy_summary)
2. Classifie l'intent (voir liste ci-dessous)
3. Évalue la complexité : simple | complex | unclear
4. Calcule ta confiance (0-1)
5. Extrait les paramètres (title, description, due_date, etc.)
6. Si un paramètre n'est pas clair → null (PAS D'INVENTION)
7. Détermine si Prolex doit intervenir (requires_prolex)

INTENTS POSSIBLES :
task_create, task_update, calendar_event, doc_note, doc_structuring,
question_simple, question_systeme, debug_infra, client_workflow,
dev_workflow, reporting, config_change, other

RÈGLES requires_prolex = true :
- complexity == "complex"
- OU confidence < 0.80
- OU intent sensible (question_systeme, debug_infra, client_workflow, dev_workflow, reporting, config_change, other)
- OU mots-clés sensibles (infra, sécurité, client, argent, architecture)

OUTPUT FORMAT (JSON strict) :
{
  "kimmy_summary": "...",
  "intent": "...",
  "complexity": "simple|complex|unclear",
  "confidence": 0.0,
  "requires_prolex": true|false,
  "suggested_tools": ["TOOL_ID"],
  "parameters": {
    "title": null,
    "description": null,
    "due_date": null,
    "client_name": null,
    "priority": null,
    "tags": []
  },
  "constraints": {
    "max_cost_usd": 0.02,
    "can_use_web": true,
    "sensitivity": "low|medium|high"
  }
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.
```

---

## 8. Métriques & monitoring

### 8.1 Métriques clés

| Métrique | Description | Target v4 |
|----------|-------------|-----------|
| **Latence moyenne** | Temps de traitement Kimmy | < 2s |
| **Taux d'escalade** | % demandes envoyées à Prolex | 40-60% |
| **Précision intent** | % intents correctement classifiés | > 95% |
| **Confiance moyenne** | Moyenne des scores de confiance | > 0.85 |
| **Taux quick_actions** | % actions traitées directement | 15-25% (mode quick_actions) |
| **Taux clarification** | % demandes nécessitant clarification | < 10% |

### 8.2 Logs dans SystemJournal

Chaque passage par Kimmy génère une entrée :

```json
{
  "timestamp": "2025-11-22T10:00:00Z",
  "agent": "kimmy",
  "action_type": "classification",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "matthieu",
  "intent": "task_create",
  "tool_used": null,
  "result": {
    "status": "success",
    "data": {
      "requires_prolex": false,
      "handled_directly": true
    }
  },
  "metadata": {
    "execution_time_ms": 1200,
    "tokens_used": 350,
    "cost_usd": 0.0007,
    "confidence": 0.95
  }
}
```

---

## 9. Exemples d'utilisation

### Exemple 1 : Tâche simple (traitement direct)

**Input** :
```
"Créer une tâche pour appeler le client ABC demain à 14h"
```

**KimmyPayload** :
```json
{
  "intent": "task_create",
  "complexity": "simple",
  "confidence": 0.92,
  "requires_prolex": false,
  "parameters": {
    "title": "Appeler client ABC",
    "due_date": "2025-11-23",
    "tags": ["client", "appel"]
  }
}
```

**Action** : Kimmy crée directement la tâche (mode `quick_actions`)

---

### Exemple 2 : Question système (escalade)

**Input** :
```
"Comment fonctionne le système de backup de Prolex ?"
```

**KimmyPayload** :
```json
{
  "intent": "question_systeme",
  "complexity": "complex",
  "confidence": 0.88,
  "requires_prolex": true,
  "suggested_tools": ["WEB_SEARCH", "DOC_READ"]
}
```

**Action** : Escalade vers Prolex

---

### Exemple 3 : Demande floue (clarification)

**Input** :
```
"Fais quelque chose pour le projet"
```

**KimmyPayload** :
```json
{
  "intent": "other",
  "complexity": "unclear",
  "confidence": 0.15,
  "requires_prolex": false
}
```

**Action** : Kimmy demande clarification :
```
"Je ne suis pas sûr de comprendre. Peux-tu préciser :
- De quel projet parles-tu ?
- Quelle action souhaites-tu que j'effectue ?"
```

---

## 10. Évolutions futures

### v4.1 (court terme)
- [ ] Support multilingue complet (EN, ES, DE)
- [ ] Détection d'urgence automatique
- [ ] Apprentissage des préférences utilisateur

### v4.2 (moyen terme)
- [ ] Voice-to-text intégré
- [ ] Suggestions proactives basées sur l'historique
- [ ] Auto-amélioration via feedback loop

### v5.0 (long terme)
- [ ] Multi-agents : plusieurs Kimmy spécialisés par domaine
- [ ] Kimmy peut apprendre de nouveaux intents
- [ ] Kimmy peut auto-générer ses prompts d'analyse

---

## 11. Références

### Documentation liée
- [ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md](../architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)
- [SPEC_PROLEX_V4.md](./SPEC_PROLEX_V4.md)

### Schémas JSON
- [schemas/payloads/kimmy_payload.schema.json](../../schemas/payloads/kimmy_payload.schema.json)

### Configuration
- [config/system.yml](../../config/system.yml)

---

**Document maintenu par** : Matthieu (Automatt.ai)
**Dernière mise à jour** : 2025-11-22
**Version** : 4.0
