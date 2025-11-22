# Schémas JSON / schemas

Ce répertoire contient les schémas JSON (JSON Schema draft-07) pour valider les échanges de données entre les agents IA du système Automatt.ai.

## Fichiers

### kimmy_payload.schema.json

**Description** : Schéma de validation pour les payloads que Kimmy envoie à Prolex.

**Utilisation** : Garantir que les données structurées par Kimmy sont complètes et conformes avant d'être traitées par Prolex.

**Champs principaux** :
- `request_id` : Identifiant unique de la requête (UUID v4)
- `intent` : Intention classifiée par Kimmy
- `complexity` : Niveau de complexité (simple / complex / unclear)
- `confidence` : Score de confiance (0 à 1)
- `parameters` : Paramètres extraits (title, description, due_date, etc.)
- `constraints` : Contraintes (budget, web, sensibilité)

### prolex_output.schema.json

**Description** : Schéma de validation pour les réponses générées par Prolex.

**Utilisation** : Valider la structure des réponses de Prolex avant exécution ou présentation à l'utilisateur.

**Types de sortie** :
- `answer` : Réponse textuelle simple
- `tool_call` : Appel d'un outil unique
- `multi_tool_plan` : Plan d'exécution multi-étapes
- `clarification` : Questions de clarification

## Validation

Ces schémas peuvent être utilisés pour valider les données avec :

### Python
```python
import jsonschema
import json

with open('schemas/kimmy_payload.schema.json') as f:
    schema = json.load(f)

# Valider un payload
jsonschema.validate(instance=payload_data, schema=schema)
```

### Node.js
```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = require('./schemas/kimmy_payload.schema.json');
const validate = ajv.compile(schema);

const valid = validate(payloadData);
if (!valid) console.log(validate.errors);
```

### Validation en ligne
https://www.jsonschemavalidator.net/

## Documentation

Pour plus de détails sur l'utilisation de ces schémas, consulter :
- [docs/00_INTEGRATION_V4_KIMMY_PROLEX.md](../docs/00_INTEGRATION_V4_KIMMY_PROLEX.md)

## Évolution

Ces schémas suivent la spécification JSON Schema draft-07. Toute modification doit :
1. Maintenir la compatibilité ascendante si possible
2. Être documentée dans le changelog
3. Être testée avec les implémentations existantes
