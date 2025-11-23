/**
 * Tools MCP pour Paiements
 * 5 tools: créer_facture, envoyer_facture, suivre_paiement, rembourser_paiement, obtenir_statut_paiement
 */

import { z } from 'zod';
import { stripeClient } from '../../clients/stripeClient.js';
import { journal } from '../../logging/systemJournal.js';
import type { MCPToolResponse, CreerFactureParams } from '../../types/index.js';

// ============================================================
// SCHÉMAS ZOD
// ============================================================

export const CreerFactureSchema = z.object({
  client: z.object({
    nom: z.string().describe('Nom du client'),
    email: z.string().email().describe('Email du client'),
    adresse: z.string().optional().describe('Adresse du client'),
    siret: z.string().optional().describe('Numéro SIRET du client'),
  }),
  lignes: z.array(
    z.object({
      description: z.string().describe('Description de la ligne'),
      quantite: z.number().positive().describe('Quantité'),
      prixUnitaireHT: z.number().positive().describe('Prix unitaire HT'),
      tauxTVA: z.number().optional().default(20).describe('Taux de TVA (%)'),
    })
  ).min(1).describe('Lignes de la facture'),
  dateEcheance: z.string().optional().describe('Date d\'échéance (ISO 8601)'),
  notes: z.string().optional().describe('Notes additionnelles'),
  conditions: z.string().optional().describe('Conditions de paiement'),
});

export const EnvoyerFactureSchema = z.object({
  factureId: z.string().describe('ID de la facture à envoyer'),
});

export const SuivrePaiementSchema = z.object({
  factureId: z.string().describe('ID de la facture à suivre'),
});

export const RembourserPaiementSchema = z.object({
  paiementId: z.string().describe('ID du paiement à rembourser'),
  montant: z.number().positive().optional().describe('Montant à rembourser (optionnel, total par défaut)'),
});

export const ObtenirStatutPaiementSchema = z.object({
  factureId: z.string().describe('ID de la facture'),
});

// ============================================================
// TOOLS
// ============================================================

/**
 * Tool: creer_facture
 * Créer une nouvelle facture avec Stripe
 */
export async function creerFacture(
  args: z.infer<typeof CreerFactureSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    journal.info('🧾 Création d\'une nouvelle facture', {
      correlationId,
      client: args.client.nom,
      nbLignes: args.lignes.length,
    });

    const params: CreerFactureParams = {
      client: args.client,
      lignes: args.lignes,
      dateEcheance: args.dateEcheance,
      notes: args.notes,
      conditions: args.conditions,
    };

    const facture = await stripeClient.creerFacture(params, correlationId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: true,
              message: `Facture ${facture.numero} créée avec succès`,
              facture: {
                id: facture.id,
                numero: facture.numero,
                client: facture.client.nom,
                montantHT: `${facture.montantHT.toFixed(2)} ${facture.devise}`,
                montantTTC: `${facture.montantTTC.toFixed(2)} ${facture.devise}`,
                statut: facture.statut,
                dateEmission: facture.dateEmission,
                dateEcheance: facture.dateEcheance,
                urlPDF: facture.urlPDF,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('creer_facture_error', error as Error, { correlationId });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: false,
              erreur: `Erreur lors de la création de la facture: ${(error as Error).message}`,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Tool: envoyer_facture
 * Envoyer une facture par email au client
 */
export async function envoyerFacture(
  args: z.infer<typeof EnvoyerFactureSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    journal.info('📧 Envoi de facture par email', {
      correlationId,
      factureId: args.factureId,
    });

    const result = await stripeClient.envoyerFacture(args.factureId, correlationId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: true,
              message: 'Facture envoyée par email au client',
              factureId: args.factureId,
              envoye: result.envoye,
              urlFacture: result.url,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('envoyer_facture_error', error as Error, { correlationId });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: false,
              erreur: `Erreur lors de l'envoi de la facture: ${(error as Error).message}`,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Tool: suivre_paiement
 * Suivre le statut d'un paiement
 */
export async function suivrePaiement(
  args: z.infer<typeof SuivrePaiementSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const statut = await stripeClient.obtenirStatutFacture(args.factureId, correlationId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: true,
              factureId: args.factureId,
              statut: statut.statut,
              montant: `${statut.montant.toFixed(2)} EUR`,
              paye: statut.paye,
              message: statut.paye ? '✅ Facture payée' : '⏳ En attente de paiement',
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('suivre_paiement_error', error as Error, { correlationId });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: false,
              erreur: `Erreur lors du suivi du paiement: ${(error as Error).message}`,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Tool: rembourser_paiement
 * Rembourser un paiement (total ou partiel)
 */
export async function rembourserPaiement(
  args: z.infer<typeof RembourserPaiementSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    journal.info('💸 Remboursement de paiement', {
      correlationId,
      paiementId: args.paiementId,
      montant: args.montant,
    });

    const result = await stripeClient.rembourserPaiement(
      args.paiementId,
      args.montant,
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: true,
              message: 'Remboursement effectué avec succès',
              paiementId: args.paiementId,
              rembourse: result.rembourse,
              montantRembourse: `${result.montantRembourse.toFixed(2)} EUR`,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('rembourser_paiement_error', error as Error, { correlationId });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: false,
              erreur: `Erreur lors du remboursement: ${(error as Error).message}`,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Tool: obtenir_statut_paiement
 * Obtenir le statut détaillé d'un paiement
 */
export async function obtenirStatutPaiement(
  args: z.infer<typeof ObtenirStatutPaiementSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const statut = await stripeClient.obtenirStatutFacture(args.factureId, correlationId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: true,
              factureId: args.factureId,
              statut: statut.statut,
              montant: statut.montant,
              paye: statut.paye,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('obtenir_statut_paiement_error', error as Error, { correlationId });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: false,
              erreur: `Erreur: ${(error as Error).message}`,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}
