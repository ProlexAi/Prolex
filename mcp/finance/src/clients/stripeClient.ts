/**
 * Client Stripe pour gestion des paiements et factures
 */

import Stripe from 'stripe';
import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import type { Facture, CreerFactureParams, Paiement } from '../types/index.js';

class StripeClient {
  private stripe: Stripe | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = config.stripe.enabled;

    if (this.enabled && config.stripe.secretKey) {
      this.stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2024-11-20.acacia',
        typescript: true,
      });
      journal.info('Client Stripe initialisé');
    } else {
      journal.warn('Client Stripe non disponible', {
        reason: 'STRIPE_SECRET_KEY manquante',
      });
    }
  }

  /**
   * Vérifie si Stripe est disponible
   */
  private ensureEnabled(): void {
    if (!this.stripe) {
      throw new Error('Stripe n\'est pas configuré. Vérifiez STRIPE_SECRET_KEY.');
    }
  }

  /**
   * Créer une facture Stripe
   */
  async creerFacture(
    params: CreerFactureParams,
    correlationId: string
  ): Promise<Facture> {
    this.ensureEnabled();

    try {
      journal.info('Création facture Stripe', { correlationId, client: params.client.nom });

      // 1. Créer ou récupérer le client
      const customer = await this.stripe!.customers.create({
        name: params.client.nom,
        email: params.client.email,
        metadata: {
          siret: params.client.siret || '',
          adresse: params.client.adresse || '',
        },
      });

      // 2. Calculer les montants
      let montantTotalHT = 0;
      let montantTotalTTC = 0;

      const lignesAvecMontants = params.lignes.map((ligne) => {
        const tauxTVA = ligne.tauxTVA || config.defaults.tauxTVA;
        const montantHT = ligne.quantite * ligne.prixUnitaireHT;
        const montantTTC = montantHT * (1 + tauxTVA / 100);

        montantTotalHT += montantHT;
        montantTotalTTC += montantTTC;

        return {
          description: ligne.description,
          quantite: ligne.quantite,
          prixUnitaireHT: ligne.prixUnitaireHT,
          tauxTVA,
          montantHT,
          montantTTC,
        };
      });

      // 3. Créer la facture Stripe
      const invoice = await this.stripe!.invoices.create({
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: params.dateEcheance
          ? Math.ceil(
              (new Date(params.dateEcheance).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
          : config.defaults.delaiPaiement,
        description: params.notes,
        footer: params.conditions,
        metadata: {
          correlationId,
        },
      });

      // 4. Ajouter les lignes de facture
      for (const ligne of lignesAvecMontants) {
        await this.stripe!.invoiceItems.create({
          customer: customer.id,
          invoice: invoice.id,
          description: ligne.description,
          quantity: ligne.quantite,
          unit_amount: Math.round(ligne.prixUnitaireHT * 100), // Centimes
          currency: 'eur',
          tax_rates: [], // TODO: Gérer les taux de TVA Stripe
        });
      }

      // 5. Finaliser la facture
      const finalInvoice = await this.stripe!.invoices.finalizeInvoice(invoice.id);

      // 6. Construire l'objet Facture
      const facture: Facture = {
        id: finalInvoice.id,
        numero: finalInvoice.number || `DRAFT-${finalInvoice.id}`,
        client: params.client,
        montantHT: montantTotalHT,
        montantTTC: montantTotalTTC,
        tauxTVA: config.defaults.tauxTVA,
        devise: 'EUR',
        statut: this.mapStripeStatus(finalInvoice.status),
        dateEmission: new Date(finalInvoice.created * 1000).toISOString(),
        dateEcheance:
          params.dateEcheance ||
          new Date(
            Date.now() + config.defaults.delaiPaiement * 24 * 60 * 60 * 1000
          ).toISOString(),
        lignes: lignesAvecMontants,
        notes: params.notes,
        conditions: params.conditions,
        urlPDF: finalInvoice.invoice_pdf || undefined,
      };

      journal.logTransaction('facture', montantTotalTTC, {
        factureId: facture.id,
        numero: facture.numero,
        client: facture.client.nom,
      }, correlationId);

      return facture;
    } catch (error) {
      journal.error('stripe_create_invoice_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Envoyer une facture par email
   */
  async envoyerFacture(
    factureId: string,
    correlationId: string
  ): Promise<{ envoye: boolean; url: string }> {
    this.ensureEnabled();

    try {
      const invoice = await this.stripe!.invoices.sendInvoice(factureId);

      journal.logAction('facture_envoyee', {
        factureId,
        email: invoice.customer_email,
        correlationId,
      });

      return {
        envoye: true,
        url: invoice.hosted_invoice_url || '',
      };
    } catch (error) {
      journal.error('stripe_send_invoice_error', error as Error, { correlationId, factureId });
      throw error;
    }
  }

  /**
   * Obtenir le statut d'une facture
   */
  async obtenirStatutFacture(
    factureId: string,
    correlationId: string
  ): Promise<{ statut: string; montant: number; paye: boolean }> {
    this.ensureEnabled();

    try {
      const invoice = await this.stripe!.invoices.retrieve(factureId);

      return {
        statut: this.mapStripeStatus(invoice.status),
        montant: (invoice.amount_due || 0) / 100,
        paye: invoice.status === 'paid',
      };
    } catch (error) {
      journal.error('stripe_get_invoice_status_error', error as Error, { correlationId, factureId });
      throw error;
    }
  }

  /**
   * Créer un paiement (charge)
   */
  async creerPaiement(params: {
    montant: number;
    devise: string;
    description: string;
    email?: string;
    source?: string;
  }, correlationId: string): Promise<Paiement> {
    this.ensureEnabled();

    try {
      const charge = await this.stripe!.charges.create({
        amount: Math.round(params.montant * 100),
        currency: params.devise.toLowerCase(),
        description: params.description,
        receipt_email: params.email,
        source: params.source || 'tok_visa', // Token de test par défaut
        metadata: {
          correlationId,
        },
      });

      const paiement: Paiement = {
        id: charge.id,
        montant: params.montant,
        devise: params.devise,
        methode: 'carte',
        statut: charge.status === 'succeeded' ? 'reussi' : 'echoue',
        dateCreation: new Date(charge.created * 1000).toISOString(),
        datePaiement: charge.status === 'succeeded' ? new Date(charge.created * 1000).toISOString() : undefined,
        description: params.description,
        frais: (charge.application_fee_amount || 0) / 100,
        netRecu: ((charge.amount - (charge.application_fee_amount || 0)) / 100),
        urlRecu: charge.receipt_url || undefined,
      };

      journal.logTransaction('paiement', params.montant, {
        paiementId: paiement.id,
        statut: paiement.statut,
      }, correlationId);

      return paiement;
    } catch (error) {
      journal.error('stripe_create_payment_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Rembourser un paiement
   */
  async rembourserPaiement(
    paiementId: string,
    montant?: number,
    correlationId?: string
  ): Promise<{ rembourse: boolean; montantRembourse: number }> {
    this.ensureEnabled();

    try {
      const refund = await this.stripe!.refunds.create({
        charge: paiementId,
        amount: montant ? Math.round(montant * 100) : undefined,
        metadata: {
          correlationId: correlationId || journal.generateCorrelationId(),
        },
      });

      journal.logAction('remboursement', {
        paiementId,
        montantRembourse: (refund.amount || 0) / 100,
        correlationId,
      });

      return {
        rembourse: refund.status === 'succeeded',
        montantRembourse: (refund.amount || 0) / 100,
      };
    } catch (error) {
      journal.error('stripe_refund_error', error as Error, { correlationId, paiementId });
      throw error;
    }
  }

  /**
   * Mapper le statut Stripe vers notre système
   */
  private mapStripeStatus(status: string | null): any {
    switch (status) {
      case 'draft':
        return 'brouillon';
      case 'open':
        return 'envoyee';
      case 'paid':
        return 'payee';
      case 'uncollectible':
        return 'en_retard';
      case 'void':
        return 'annulee';
      default:
        return 'brouillon';
    }
  }
}

// Export singleton
export const stripeClient = new StripeClient();
