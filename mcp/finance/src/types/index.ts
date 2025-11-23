/**
 * Types pour le MCP Finance
 * Structures de données pour paiements, comptabilité, banque, crypto
 */

// ============================================================
// Types de base MCP
// ============================================================

export interface MCPToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

// ============================================================
// Factures & Paiements
// ============================================================

export type StatutFacture = 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee';

export interface Facture {
  id: string;
  numero: string;
  client: {
    nom: string;
    email: string;
    adresse?: string;
    siret?: string;
  };
  montantHT: number;
  montantTTC: number;
  tauxTVA: number;
  devise: string;
  statut: StatutFacture;
  dateEmission: string;
  dateEcheance: string;
  datePaiement?: string;
  lignes: LigneFacture[];
  notes?: string;
  conditions?: string;
  urlPDF?: string;
}

export interface LigneFacture {
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  montantHT: number;
  montantTTC: number;
}

export interface CreerFactureParams {
  client: {
    nom: string;
    email: string;
    adresse?: string;
    siret?: string;
  };
  lignes: Array<{
    description: string;
    quantite: number;
    prixUnitaireHT: number;
    tauxTVA?: number;
  }>;
  dateEcheance?: string;
  notes?: string;
  conditions?: string;
}

// ============================================================
// Paiements
// ============================================================

export type StatutPaiement = 'en_attente' | 'reussi' | 'echoue' | 'rembourse' | 'annule';
export type MethodePaiement = 'carte' | 'virement' | 'prelevement' | 'paypal' | 'crypto' | 'especes' | 'cheque';

export interface Paiement {
  id: string;
  factureId?: string;
  montant: number;
  devise: string;
  methode: MethodePaiement;
  statut: StatutPaiement;
  dateCreation: string;
  datePaiement?: string;
  description?: string;
  client?: {
    nom: string;
    email: string;
  };
  frais?: number;
  netRecu?: number;
  urlRecu?: string;
}

// ============================================================
// Transactions bancaires
// ============================================================

export type TypeTransaction = 'debit' | 'credit';
export type CategorieTransaction =
  | 'salaire' | 'revenus' | 'ventes'
  | 'loyer' | 'utilities' | 'nourriture' | 'transport'
  | 'software' | 'marketing' | 'frais_bancaires'
  | 'impots' | 'assurances' | 'autre';

export interface Transaction {
  id: string;
  date: string;
  montant: number;
  devise: string;
  type: TypeTransaction;
  categorie?: CategorieTransaction;
  description: string;
  destinataire?: string;
  compte: string;
  soldeApres?: number;
  estRecurrente?: boolean;
  etiquettes?: string[];
}

export interface CompterBancaire {
  id: string;
  nom: string;
  type: 'courant' | 'epargne' | 'professionnel';
  banque: string;
  solde: number;
  devise: string;
  derniereMiseAJour: string;
}

// ============================================================
// Comptabilité
// ============================================================

export interface Depense {
  id: string;
  date: string;
  montant: number;
  categorie: CategorieTransaction;
  description: string;
  fournisseur?: string;
  numeroFacture?: string;
  tva?: number;
  estDeductible?: boolean;
  justificatif?: string;
}

export interface Revenu {
  id: string;
  date: string;
  montant: number;
  source: string;
  description: string;
  numeroFacture?: string;
  tva?: number;
  client?: string;
}

export interface RapportComptable {
  periode: {
    debut: string;
    fin: string;
  };
  revenus: {
    total: number;
    parCategorie: Record<string, number>;
  };
  depenses: {
    total: number;
    parCategorie: Record<string, number>;
  };
  beneficeNet: number;
  tva: {
    collectee: number;
    deductible: number;
    aVerser: number;
  };
}

// ============================================================
// Budget
// ============================================================

export interface Budget {
  id: string;
  nom: string;
  periode: 'mensuel' | 'trimestriel' | 'annuel';
  dateDebut: string;
  dateFin: string;
  categories: CategoriBudget[];
  total: number;
}

export interface CategoriBudget {
  categorie: CategorieTransaction;
  montantPrevu: number;
  montantDepense: number;
  pourcentageUtilise: number;
  alerte?: {
    seuil: number;
    active: boolean;
  };
}

export interface SuiviBudget {
  budget: Budget;
  progression: number;
  joursRestants: number;
  moyenneJournaliere: number;
  previsionFinMois: number;
  categories: Array<{
    categorie: string;
    prevu: number;
    depense: number;
    restant: number;
    statut: 'ok' | 'attention' | 'depasse';
  }>;
}

// ============================================================
// Crypto
// ============================================================

export interface PortfolioCrypto {
  totalValeur: number;
  devise: string;
  derniereMAJ: string;
  actifs: ActifCrypto[];
  gainsPertesTotal: number;
  pourcentageGainsPertesTotal: number;
}

export interface ActifCrypto {
  symbole: string;
  nom: string;
  quantite: number;
  prixAchatMoyen: number;
  prixActuel: number;
  valeurActuelle: number;
  gainsPerte: number;
  pourcentageGainsPerte: number;
}

export interface PrixCrypto {
  symbole: string;
  nom: string;
  prix: number;
  devise: string;
  variation24h: number;
  variation7j: number;
  volumeMarche: number;
  capitalisationMarche: number;
  dernierMAJ: string;
}

// ============================================================
// Prévisions
// ============================================================

export interface Prevision {
  periode: string;
  type: 'revenus' | 'depenses' | 'tresorerie';
  montantPrevu: number;
  montantReel?: number;
  ecart?: number;
  confiance: 'faible' | 'moyenne' | 'elevee';
  baseSur: string;
}

// ============================================================
// Exports & Rapports
// ============================================================

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  periode?: {
    debut: string;
    fin: string;
  };
  categories?: CategorieTransaction[];
  includeDetails?: boolean;
}

export interface RapportFiscal {
  annee: number;
  revenus: {
    total: number;
    detail: Array<{
      type: string;
      montant: number;
    }>;
  };
  depenses: {
    total: number;
    deductibles: number;
    detail: Array<{
      type: string;
      montant: number;
      deductible: boolean;
    }>;
  };
  tva: {
    collectee: number;
    deductible: number;
    netAVerser: number;
  };
  beneficeImposable: number;
}
