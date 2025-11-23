# 💰 MCP Finance - Serveur MCP pour Gestion Financière

> **Serveur MCP complet pour la gestion financière : Paiements, Comptabilité, Banque, Crypto**
> Version 1.0.0 | Clientèle française

---

## 📋 Vue d'ensemble

Le **MCP Finance** est un serveur Model Context Protocol qui fournit des outils financiers complets pour :

- 💳 **Paiements** : Facturation et encaissements (Stripe/PayPal)
- 📊 **Comptabilité** : Suivi des dépenses, revenus, rapports
- 🏦 **Banque** : Gestion des comptes, transactions, catégorisation
- ₿ **Crypto** : Portfolio, prix en temps réel, fiscalité
- 📈 **Budget** : Prévisions, alertes, suivi

---

## 🚀 Installation

### Prérequis

- Node.js >= 18.0.0
- npm ou yarn
- Compte Stripe (pour paiements)
- Credentials Google Sheets (pour stockage comptable)

### Installation des dépendances

```bash
cd mcp/finance
npm install
```

### Configuration

1. Copier le fichier d'exemple :
```bash
cp .env.example .env
```

2. Éditer `.env` avec vos credentials :
```env
# Stripe (obligatoire pour paiements)
STRIPE_SECRET_KEY=sk_test_xxxxx

# Google Sheets (optionnel)
COMPTABILITE_SPREADSHEET_ID=xxxxx

# Autres (optionnels)
COINGECKO_API_KEY=xxxxx
PLAID_CLIENT_ID=xxxxx
```

---

## 🛠️ Utilisation

### Démarrage en développement

```bash
npm run dev
```

### Build production

```bash
npm run build
npm start
```

### Tests

```bash
npm test
npm run test:coverage
```

---

## 📦 Tools Disponibles (9 tools)

### 💳 Paiements (5 tools)

#### 1. `creer_facture`
Créer une nouvelle facture avec Stripe

**Paramètres :**
```typescript
{
  client: {
    nom: string,
    email: string,
    adresse?: string,
    siret?: string
  },
  lignes: [{
    description: string,
    quantite: number,
    prixUnitaireHT: number,
    tauxTVA?: number  // Défaut: 20%
  }],
  dateEcheance?: string,
  notes?: string,
  conditions?: string
}
```

**Exemple :**
```json
{
  "client": {
    "nom": "Acme Corp",
    "email": "contact@acme.com",
    "siret": "12345678900001"
  },
  "lignes": [
    {
      "description": "Développement site web",
      "quantite": 1,
      "prixUnitaireHT": 5000,
      "tauxTVA": 20
    }
  ],
  "dateEcheance": "2025-12-31",
  "notes": "Merci pour votre confiance"
}
```

#### 2. `envoyer_facture`
Envoyer une facture par email au client

**Paramètres :**
```typescript
{
  factureId: string
}
```

#### 3. `suivre_paiement`
Suivre le statut d'un paiement

**Paramètres :**
```typescript
{
  factureId: string
}
```

#### 4. `rembourser_paiement`
Rembourser un paiement (total ou partiel)

**Paramètres :**
```typescript
{
  paiementId: string,
  montant?: number  // Optionnel, total par défaut
}
```

#### 5. `obtenir_statut_paiement`
Obtenir le statut détaillé d'un paiement

**Paramètres :**
```typescript
{
  factureId: string
}
```

---

### ₿ Crypto (4 tools)

#### 6. `obtenir_portfolio_crypto`
Calculer la valeur actuelle d'un portfolio crypto

**Paramètres :**
```typescript
{
  actifs: [{
    symbole: string,  // BTC, ETH, SOL, etc.
    quantite: number,
    prixAchatMoyen: number
  }],
  devise?: string  // Défaut: 'eur'
}
```

**Exemple :**
```json
{
  "actifs": [
    {
      "symbole": "BTC",
      "quantite": 0.5,
      "prixAchatMoyen": 30000
    },
    {
      "symbole": "ETH",
      "quantite": 2.5,
      "prixAchatMoyen": 2000
    }
  ],
  "devise": "eur"
}
```

#### 7. `suivre_prix_crypto`
Obtenir le prix actuel d'une cryptomonnaie

**Paramètres :**
```typescript
{
  symbole: string,  // BTC, ETH, SOL, etc.
  devise?: string   // Défaut: 'eur'
}
```

#### 8. `calculer_gains_crypto`
Calculer les gains/pertes pour une position crypto

**Paramètres :**
```typescript
{
  symbole: string,
  quantite: number,
  prixAchat: number,
  devise?: string
}
```

#### 9. `generer_rapport_fiscal_crypto`
Générer un rapport fiscal pour les cryptomonnaies

**Paramètres :**
```typescript
{
  actifs: [{
    symbole: string,
    quantite: number,
    prixAchatMoyen: number,
    dateAchat?: string
  }],
  annee: number
}
```

---

## 🏗️ Architecture

```
mcp/finance/
├── src/
│   ├── clients/           # Clients API externes
│   │   ├── stripeClient.ts      # Stripe (paiements)
│   │   ├── cryptoClient.ts      # CoinGecko (crypto)
│   │   └── banqueClient.ts      # Banque (Google Sheets)
│   │
│   ├── tools/             # Tools MCP
│   │   ├── paiements/     # 5 tools paiements
│   │   ├── crypto/        # 4 tools crypto
│   │   ├── comptabilite/  # TODO
│   │   ├── banque/        # TODO
│   │   └── budget/        # TODO
│   │
│   ├── types/             # Types TypeScript
│   ├── logging/           # SystemJournal
│   ├── config/            # Configuration
│   ├── server.ts          # Serveur MCP
│   └── index.ts           # Point d'entrée
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔌 Intégrations

### Stripe
- Création et envoi de factures
- Suivi des paiements
- Remboursements
- Webhooks (à venir)

### CoinGecko
- Prix des cryptomonnaies en temps réel
- Historique de prix
- Capitalisation marché
- API gratuite (pas de clé requise)

### Google Sheets
- Stockage des transactions
- Rapports comptables
- Budget tracking

### À venir
- PayPal (paiements alternatifs)
- Plaid (connexion bancaire automatique)
- Binance (trading crypto)
- Pennylane/QuickBooks (comptabilité avancée)

---

## 📊 Logging & Traçabilité

Toutes les opérations financières sont loggées vers :

1. **Console** (Pino pretty)
2. **SystemJournal** (Google Sheets) - À configurer

Exemples de logs :
- Création de facture
- Envoi de facture
- Paiement reçu
- Remboursement effectué
- Calcul de portfolio

---

## 🔒 Sécurité

### Validation
- Tous les inputs validés avec Zod
- Montants maximums configurables
- Confirmation requise au-dessus d'un seuil

### Secrets
- ❌ **JAMAIS** commiter les clés API
- ✅ Utiliser `.env` (gitignore)
- ✅ Variables d'environnement sur le VPS

### Permissions
- Pas d'accès direct aux comptes bancaires
- Lecture seule par défaut (Plaid)
- Webhooks signés (Stripe)

---

## 🧪 Développement

### Structure des tools

Chaque tool suit ce pattern :

```typescript
// 1. Schéma Zod
export const MonToolSchema = z.object({
  param1: z.string(),
  param2: z.number()
});

// 2. Fonction du tool
export async function monTool(
  args: z.infer<typeof MonToolSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    // Logique métier
    journal.logAction('mon_action', { ... }, correlationId);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ succes: true, ... })
      }]
    };
  } catch (error) {
    journal.error('mon_tool_error', error, { correlationId });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ succes: false, erreur: ... })
      }],
      isError: true
    };
  }
}
```

### Ajouter un nouveau tool

1. Créer le fichier dans `src/tools/<categorie>/`
2. Définir le schéma Zod
3. Implémenter la fonction
4. Enregistrer dans `src/server.ts`
5. Tester avec `npm test`

---

## 📝 TODO

### Tools à implémenter (16 restants)

**Comptabilité (5 tools)**
- [ ] `enregistrer_depense`
- [ ] `enregistrer_revenu`
- [ ] `categoriser_transaction`
- [ ] `generer_rapport_comptable`
- [ ] `exporter_csv`

**Banque (4 tools)**
- [ ] `obtenir_solde_banque`
- [ ] `lister_transactions_banque`
- [ ] `synchroniser_comptes`
- [ ] `categoriser_depenses_auto`

**Budget (4 tools)**
- [ ] `creer_budget`
- [ ] `suivre_depenses`
- [ ] `definir_alerte_budget`
- [ ] `obtenir_previsions`

**Analytics (3 tools)**
- [ ] `resume_mensuel`
- [ ] `comparer_periodes`
- [ ] `tendances_depenses`

---

## 🤝 Support

- **Auteur** : ProlexAi
- **Email** : matthieu@automatt.ai
- **Clientèle** : 🇫🇷 Française

---

## 📜 Licence

MIT

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-11-23
