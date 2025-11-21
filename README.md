# Prolex

Prolex est le **cerveau IA** de l’entreprise Automatt.ai.  
Son rôle : orchestrer des agents et des automatisations (n8n, outils externes, workflows) à partir de requêtes naturelles.

> Statut actuel : phase initiale – premier sous-projet technique disponible : `mcp/n8n-server` (serveur MCP pour piloter n8n depuis Claude Desktop).

---

## Objectifs de Prolex

- Centraliser la logique “cerveau” de l’écosystème Automatt.ai.
- Décider, à partir d’une demande utilisateur :
  - s’il faut répondre directement ;
  - ou déclencher/ajuster des workflows n8n ;
  - ou appeler d’autres outils / services.
- Offrir une base claire pour expérimenter puis industrialiser des agents IA autonomes.

---

## Structure du dépôt

Structure actuelle (évolutive) :

```text
.
├─ README.md              # Vue d’ensemble de Prolex (ce fichier)
├─ docs/                  # Documentation interne (spécifications, notes…)
│  └─ overview.md         # Optionnel : vue plus détaillée
└─ mcp/
   └─ n8n-server/         # Serveur MCP pour contrôler n8n
      ├─ src/             # Code TypeScript
      ├─ dist/            # Code compilé JavaScript (build)
      ├─ .env.example     # Variables d’environnement à copier en .env
      ├─ package.json     # Dépendances & scripts npm
      ├─ tsconfig.json    # Configuration TypeScript
      └─ README.md        # Documentation dédiée au MCP n8n
 