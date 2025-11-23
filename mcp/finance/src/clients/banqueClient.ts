/**
 * Client Banque pour gestion des comptes et transactions
 * Version simple avec Google Sheets (pas besoin de Plaid au début)
 */

import { journal } from '../logging/systemJournal.js';
import type { CompterBancaire, Transaction, TypeTransaction, CategorieTransaction } from '../types/index.js';

class BanqueClient {
  /**
   * Obtenir le solde d'un compte
   * TODO: Intégrer avec Google Sheets ou Plaid
   */
  async obtenirSolde(
    compteId: string,
    correlationId?: string
  ): Promise<{ solde: number; devise: string; dernierMAJ: string }> {
    try {
      // TODO: Récupérer depuis Google Sheets
      // Pour l'instant, retour mockée

      journal.debug('Solde bancaire récupéré', { compteId, correlationId });

      return {
        solde: 0,
        devise: 'EUR',
        dernierMAJ: new Date().toISOString(),
      };
    } catch (error) {
      journal.error('bank_get_balance_error', error as Error, { correlationId, compteId });
      throw error;
    }
  }

  /**
   * Lister les transactions d'un compte
   */
  async listerTransactions(params: {
    compteId: string;
    dateDebut?: string;
    dateFin?: string;
    limite?: number;
  }, correlationId?: string): Promise<Transaction[]> {
    try {
      // TODO: Récupérer depuis Google Sheets ou Plaid

      journal.debug('Transactions bancaires listées', {
        compteId: params.compteId,
        correlationId,
      });

      return [];
    } catch (error) {
      journal.error('bank_list_transactions_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Synchroniser les comptes bancaires
   * TODO: Utiliser Plaid API quand disponible
   */
  async synchroniserComptes(correlationId?: string): Promise<{
    comptesSynchronises: number;
    derniereSync: string;
  }> {
    try {
      journal.info('Synchronisation bancaire lancée', { correlationId });

      // TODO: Implémenter avec Plaid
      return {
        comptesSynchronises: 0,
        derniereSync: new Date().toISOString(),
      };
    } catch (error) {
      journal.error('bank_sync_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Catégoriser automatiquement une transaction
   */
  categorizerTransaction(description: string): CategorieTransaction {
    const descriptionLower = description.toLowerCase();

    // Règles simples de catégorisation
    if (descriptionLower.includes('salaire') || descriptionLower.includes('virement employeur')) {
      return 'salaire';
    }
    if (descriptionLower.includes('loyer') || descriptionLower.includes('rent')) {
      return 'loyer';
    }
    if (descriptionLower.includes('edf') || descriptionLower.includes('eau') || descriptionLower.includes('internet')) {
      return 'utilities';
    }
    if (descriptionLower.includes('carrefour') || descriptionLower.includes('auchan') || descriptionLower.includes('leclerc')) {
      return 'nourriture';
    }
    if (descriptionLower.includes('uber') || descriptionLower.includes('sncf') || descriptionLower.includes('essence')) {
      return 'transport';
    }
    if (descriptionLower.includes('aws') || descriptionLower.includes('github') || descriptionLower.includes('vercel')) {
      return 'software';
    }
    if (descriptionLower.includes('google ads') || descriptionLower.includes('facebook ads')) {
      return 'marketing';
    }
    if (descriptionLower.includes('impot') || descriptionLower.includes('urssaf')) {
      return 'impots';
    }
    if (descriptionLower.includes('assurance')) {
      return 'assurances';
    }

    return 'autre';
  }

  /**
   * Enregistrer une transaction manuellement
   * (pour les transactions hors compte bancaire connecté)
   */
  async enregistrerTransaction(transaction: {
    date: string;
    montant: number;
    type: TypeTransaction;
    description: string;
    categorie?: CategorieTransaction;
    compte: string;
  }, correlationId?: string): Promise<Transaction> {
    try {
      const categorie = transaction.categorie || this.categorizerTransaction(transaction.description);

      const nouvelleTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        date: transaction.date,
        montant: transaction.montant,
        devise: 'EUR',
        type: transaction.type,
        categorie,
        description: transaction.description,
        compte: transaction.compte,
      };

      // TODO: Sauvegarder dans Google Sheets

      journal.logTransaction(
        transaction.type === 'credit' ? 'revenu' : 'depense',
        transaction.montant,
        {
          transactionId: nouvelleTransaction.id,
          categorie,
        },
        correlationId
      );

      return nouvelleTransaction;
    } catch (error) {
      journal.error('bank_record_transaction_error', error as Error, { correlationId });
      throw error;
    }
  }
}

// Export singleton
export const banqueClient = new BanqueClient();
