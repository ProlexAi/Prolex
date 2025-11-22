# VARIABLES ET CONTEXTE PROLEX v4

## Variables système (référence config/system.yml)

### Projet
- `current_project`: "Automatt.ai"
- `current_environment`: "development"

### Modèles
- `kimmy_model`: "gpt-4-turbo"
- `prolex_model`: "claude-3-5-sonnet-20250101"

### Autonomie
- `prolex_current_autonomy_level`: 2 (voir config/autonomy.yml)
- `kimmy_mode`: "quick_actions"

### Style
- `agent_role`: "Architecte & Stratège"
- `execution_mode`: "Autonomous"
- `response_style`: "Concise-Technical"

## Contexte actuel

### Utilisateur principal
- Nom : Matthieu
- Rôle : Fondateur Automatt.ai
- Email : matthieu@automatt.ai

### Infrastructure
- VPS : À déployer
- n8n : Local (http://localhost:5678)
- AnythingLLM : À configurer
- Traefik : À configurer

### État du projet
- Phase : Développement v4
- Workflows existants : 3 (sync GitHub, hello-world, dev-log)
- MCP servers : 1 (n8n)
- Clients actifs : 0 (phase pilote)

## Sources de vérité

### Technique
- Repo GitHub : ProlexAi/Prolex
- Branche actuelle : claude/integrate-kimmy-prolex-01WKxk6qA7oWB3YUvwoo9AyH

### Logs
- SystemJournal : Google Sheet "Automatt_Logs"
- Onglet principal : "SystemJournal"

### Documentation
- Architecture : docs/architecture/
- Spécifications : docs/specifications/
- RAG : rag/

## Limites opérationnelles

### Coûts
- Par requête : $0.50 max
- Par jour : $20.00 max
- Par mois : $500.00 max

### Temps
- Timeout requête : 10 minutes
- Timeout workflow : 30 minutes

### Rate limits
- Requêtes/minute : 30
- Requêtes/heure : 500

## Priorités

1. Sécurité avant rapidité
2. Traçabilité avant performance
3. Qualité avant quantité
4. Clarification avant action hasardeuse
