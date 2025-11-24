# 🎤 Kimmy MCP Server

> **Serveur MCP exposant les outils du Kimmy Tools Pack via le protocole Model Context Protocol**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-green)](https://modelcontextprotocol.io/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-brightgreen)](https://nodejs.org/)

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Outils exposés](#-outils-exposés)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Architecture](#-architecture)
- [Développement](#-développement)
- [Exemples](#-exemples)
- [Roadmap](#-roadmap)
- [Licence](#-licence)

---

## 🎯 Vue d'ensemble

**Kimmy MCP Server** est un serveur MCP (Model Context Protocol) qui expose 3 outils du **Kimmy Tools Pack** pour permettre à des modèles de langage (LLM) d'effectuer :

1. **Transcription audio → texte** (via Whisper)
2. **Prétraitement de texte** (nettoyage, segmentation, détection de langue)
3. **Structuration de sortie** (extraction d'intent, entités, actions)

### Pourquoi ce serveur ?

- ✅ **Plug-and-play** : Utilisable immédiatement dans Claude Desktop ou LM Studio
- ✅ **Mode stub** : Testez sans dépendances externes (données simulées)
- ✅ **Mode real** : Connectez-vous au vrai `kimmy-tools-pack` pour des résultats réels
- ✅ **TypeScript strict** : Code 100% typé avec validation d'erreurs complète
- ✅ **Gestion d'erreurs robuste** : Messages d'erreur clairs et exploitables
- ✅ **Configuration flexible** : `.env` pour adapter le comportement

---

## 🛠️ Outils exposés

### 1. `audio_to_text`

**Description** : Transcrit un fichier audio en texte en utilisant Whisper.

**Entrée** :

```json
{
  "audioPath": "/path/to/audio.mp3",
  "targetLanguage": "fr"  // Optionnel, par défaut: fr
}
```

**Sortie** :

```json
{
  "raw_transcript": "bonjour ceci est un test...",
  "cleaned_transcript": "Bonjour, ceci est un test.",
  "language_detected": "fr",
  "duration_seconds": 45
}
```

**Formats supportés** : `.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm`, `.flac`

---

### 2. `preprocess_text`

**Description** : Prétraite un texte brut (nettoyage, segmentation, détection de langue).

**Entrée** :

```json
{
  "text": "Voici un texte brut à analyser..."
}
```

**Sortie** :

```json
{
  "clean_text": "Voici un texte brut à analyser.",
  "sentences": [
    "Voici un texte brut à analyser."
  ],
  "metadata": {
    "length_chars": 32,
    "language_detected": "fr"
  }
}
```

---

### 3. `structure_output`

**Description** : Structure la sortie de Kimmy en extrayant intent, entités, actions, et contraintes.

**Entrée** :

```json
{
  "text_from_kimmy": "Peux-tu créer un workflow pour envoyer des emails automatiques ?"
}
```

**Sortie** :

```json
{
  "summary": "Demande de création d'un workflow d'envoi d'emails automatiques",
  "intent": "commande",
  "key_entities": ["workflow", "emails", "automatiques"],
  "actions_proposees": [
    "Créer un workflow n8n",
    "Configurer l'envoi d'emails"
  ],
  "constraints": ["aucune contrainte détectée"],
  "raw_text": "Peux-tu créer un workflow pour envoyer des emails automatiques ?"
}
```

---

## 📦 Installation

### Prérequis

- **Node.js** >= 18.0.0
- **npm** ou **yarn**

### Étapes

```bash
# 1. Cloner le projet
cd kimmy-mcp

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env depuis l'exemple
cp .env.example .env

# 4. Compiler le TypeScript
npm run build

# 5. Démarrer le serveur
npm start
```

---

## ⚙️ Configuration

### Fichier `.env`

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```bash
# Chemin vers le package kimmy-tools-pack compilé
# Exemple: ../kimmy-tools-pack/dist ou ./node_modules/kimmy-tools-pack/dist
KIMMY_TOOLS_PATH=../kimmy-tools-pack/dist

# Clé API pour Whisper (si utilisée pour audio_to_text)
WHISPER_API_KEY=sk-...

# Langue par défaut pour la transcription
DEFAULT_LANGUAGE=fr

# Mode de fonctionnement (stub ou real)
# stub: utilise des fonctions simulées pour démonstration
# real: charge les vrais outils depuis kimmy-tools-pack
MODE=stub
```

### Variables détaillées

| Variable | Description | Valeurs | Défaut |
|----------|-------------|---------|--------|
| `KIMMY_TOOLS_PATH` | Chemin vers kimmy-tools-pack compilé | Chemin absolu ou relatif | `../kimmy-tools-pack/dist` |
| `WHISPER_API_KEY` | Clé API OpenAI Whisper | `sk-...` | *(vide)* |
| `DEFAULT_LANGUAGE` | Langue par défaut | `fr`, `en`, `es`, etc. | `fr` |
| `MODE` | Mode de fonctionnement | `stub` ou `real` | `stub` |

### Mode STUB vs REAL

#### Mode `stub` (recommandé pour tester)

- ✅ **Aucune dépendance** : Pas besoin de `kimmy-tools-pack`
- ✅ **Rapide** : Retourne des résultats simulés instantanément
- ✅ **Démonstration** : Parfait pour tester l'intégration MCP
- ⚠️ **Données fictives** : Les résultats ne sont pas réels

#### Mode `real` (production)

- ✅ **Résultats réels** : Utilise le vrai `kimmy-tools-pack`
- ✅ **Whisper réel** : Transcriptions audio authentiques
- ⚠️ **Dépendance** : Nécessite `kimmy-tools-pack` installé et compilé
- ⚠️ **Coûts API** : Utilise l'API Whisper (payante)

---

## 🚀 Utilisation

### 1. Développement local

```bash
# Mode watch (rechargement automatique)
npm run dev
```

### 2. Production

```bash
# Build + start
npm run build
npm start
```

### 3. Intégration avec Claude Desktop

Ajoutez ce serveur dans votre configuration MCP Claude Desktop :

**`~/Library/Application Support/Claude/claude_desktop_config.json`** (macOS)

```json
{
  "mcpServers": {
    "kimmy": {
      "command": "node",
      "args": ["/path/to/kimmy-mcp/dist/index.js"],
      "env": {
        "MODE": "stub"
      }
    }
  }
}
```

**Redémarrez Claude Desktop** pour charger le serveur.

### 4. Intégration avec LM Studio

Configurez LM Studio pour utiliser ce serveur MCP via stdio.

---

## 🏗️ Architecture

### Structure du projet

```
kimmy-mcp/
├── package.json              # Dépendances et scripts
├── tsconfig.json             # Configuration TypeScript
├── README.md                 # Ce fichier
├── .gitignore                # Fichiers ignorés par Git
├── .env.example              # Exemple de configuration
│
└── src/
    ├── index.ts              # Point d'entrée du serveur
    ├── mcp/
    │   ├── server.ts         # Logique du serveur MCP
    │   └── handlers/
    │       ├── audioHandler.ts        # Gestion audio_to_text
    │       ├── preprocessHandler.ts   # Gestion preprocess_text
    │       └── structureHandler.ts    # Gestion structure_output
    ├── config/
    │   └── paths.ts          # Configuration et chargement .env
    └── types/
        └── toolTypes.ts      # Interfaces TypeScript
```

### Flux de traitement

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client MCP (Claude Desktop, LM Studio, etc.)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ stdio (MCP Protocol)
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Kimmy MCP Server (src/mcp/server.ts)                    │
│    - Écoute les requêtes MCP                                │
│    - Liste les outils (list_tools)                          │
│    - Route les appels (call_tool)                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Routing
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Handlers (src/mcp/handlers/*.ts)                        │
│    - audioHandler.ts                                        │
│    - preprocessHandler.ts                                   │
│    - structureHandler.ts                                    │
│                                                              │
│    Validation → Mode check (stub/real)                      │
└─────────────┬───────────────────────┬───────────────────────┘
              │                       │
     MODE=stub│                       │MODE=real
              ↓                       ↓
┌─────────────────────┐   ┌─────────────────────────────────┐
│ Simulation          │   │ kimmy-tools-pack                │
│ (données fictives)  │   │ (vrais outils)                  │
└─────────────────────┘   └─────────────────────────────────┘
```

---

## 👨‍💻 Développement

### Scripts disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| `dev` | `npm run dev` | Lance le serveur en mode watch (rechargement auto) |
| `build` | `npm run build` | Compile TypeScript → JavaScript (dist/) |
| `start` | `npm start` | Lance le serveur compilé (production) |
| `clean` | `npm run clean` | Supprime le dossier dist/ |
| `type-check` | `npm run type-check` | Vérifie les types sans compiler |

### Ajouter un nouvel outil

1. **Créer le handler** : `src/mcp/handlers/myToolHandler.ts`

```typescript
import { MyToolInput, MyToolOutput, KimmyToolError } from '../../types/toolTypes.js';

export async function handleMyTool(input: MyToolInput): Promise<MyToolOutput> {
  // Validation
  // Logique stub/real
  // Retour
}
```

2. **Définir les types** : `src/types/toolTypes.ts`

```typescript
export interface MyToolInput {
  param1: string;
}

export interface MyToolOutput {
  result: string;
}
```

3. **Enregistrer dans le serveur** : `src/mcp/server.ts`

```typescript
import { handleMyTool } from './handlers/myToolHandler.js';

// Dans setupHandlers(), ajouter :
case 'my_tool':
  result = await handleMyTool(args as MyToolInput);
  break;
```

4. **Ajouter dans `list_tools`** :

```typescript
{
  name: 'my_tool',
  description: 'Description de mon outil',
  inputSchema: { /* ... */ }
}
```

---

## 📚 Exemples

### Exemple 1 : Transcription audio (mode stub)

**Requête MCP** :

```json
{
  "tool": "audio_to_text",
  "arguments": {
    "audioPath": "/tmp/test.mp3",
    "targetLanguage": "fr"
  }
}
```

**Réponse** :

```json
{
  "raw_transcript": "bonjour ceci est une transcription de test générée en mode stub...",
  "cleaned_transcript": "Bonjour, ceci est une transcription de test générée en mode stub...",
  "language_detected": "fr",
  "duration_seconds": 15
}
```

---

### Exemple 2 : Prétraitement de texte

**Requête MCP** :

```json
{
  "tool": "preprocess_text",
  "arguments": {
    "text": "Bonjour ! Voici un texte.   Il a des espaces bizarres."
  }
}
```

**Réponse** :

```json
{
  "clean_text": "Bonjour ! Voici un texte. Il a des espaces bizarres.",
  "sentences": [
    "Bonjour !",
    "Voici un texte.",
    "Il a des espaces bizarres."
  ],
  "metadata": {
    "length_chars": 53,
    "language_detected": "fr"
  }
}
```

---

### Exemple 3 : Structuration de sortie Kimmy

**Requête MCP** :

```json
{
  "tool": "structure_output",
  "arguments": {
    "text_from_kimmy": "Urgent : Créer un rapport de ventes pour Q4 avec graphiques"
  }
}
```

**Réponse** :

```json
{
  "summary": "Urgent : Créer un rapport de ventes pour Q4 avec graphiques",
  "intent": "commande",
  "key_entities": ["Urgent", "Créer", "rapport", "ventes", "graphiques"],
  "actions_proposees": [
    "Traiter la demande"
  ],
  "constraints": ["urgence"],
  "raw_text": "Urgent : Créer un rapport de ventes pour Q4 avec graphiques"
}
```

---

## 🗺️ Roadmap

### Version 1.0 (actuelle)

- ✅ Serveur MCP fonctionnel avec 3 outils
- ✅ Mode stub pour tests sans dépendances
- ✅ Mode real avec chargement dynamique de kimmy-tools-pack
- ✅ Gestion d'erreurs robuste
- ✅ Configuration via .env
- ✅ TypeScript strict

### Version 1.1 (prochaine)

- 🔄 Support RAG mini pour Kimmy (contexte local)
- 🔄 Logging structuré (Pino)
- 🔄 Healthcheck HTTP endpoint
- 🔄 Métriques et monitoring
- 🔄 Tests unitaires (Jest)

### Version 2.0 (future)

- 🔮 Cache intelligent pour les transcriptions
- 🔮 Support de webhooks pour notifications
- 🔮 Interface web de monitoring
- 🔮 Support multi-langues étendu
- 🔮 Intégration avec SystemJournal (Prolex)

---

## 🐛 Résolution de problèmes

### Erreur : `Cannot find module 'kimmy-tools-pack'`

**Cause** : Le mode est `real` mais le package n'est pas trouvé.

**Solution** :

1. Vérifiez `KIMMY_TOOLS_PATH` dans `.env`
2. Assurez-vous que le package est compilé
3. Ou passez en `MODE=stub` pour tester

---

### Erreur : `File not found` (audio_to_text)

**Cause** : Le fichier audio n'existe pas au chemin spécifié.

**Solution** :

- Vérifiez que le chemin est absolu ou relatif correct
- Utilisez un fichier de test existant
- En mode stub, le fichier doit quand même exister (validation)

---

### Erreur : `UNSUPPORTED_FORMAT`

**Cause** : Format audio non supporté.

**Solution** :

- Convertissez votre fichier en `.mp3`, `.wav`, ou `.m4a`
- Formats supportés : `.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm`, `.flac`

---

## 📄 Licence

MIT © Automatt.ai

---

## 🤝 Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Committez vos changements (`git commit -m 'feat: ajout de ma feature'`)
4. Pushez (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

---

## 📞 Support

- **Documentation MCP** : https://modelcontextprotocol.io/
- **Issues** : Ouvrez une issue sur GitHub
- **Email** : support@automatt.ai

---

**Fait avec ❤️ par l'équipe Automatt.ai**
