/**
 * Tools MCP pour Crypto
 * 4 tools: obtenir_portfolio_crypto, suivre_prix_crypto, calculer_gains_crypto, generer_rapport_fiscal_crypto
 */

import { z } from 'zod';
import { cryptoClient } from '../../clients/cryptoClient.js';
import { journal } from '../../logging/systemJournal.js';
import type { MCPToolResponse } from '../../types/index.js';

// ============================================================
// SCHÉMAS ZOD
// ============================================================

export const ObtenirPortfolioCryptoSchema = z.object({
  actifs: z.array(
    z.object({
      symbole: z.string().describe('Symbole de la crypto (BTC, ETH, etc.)'),
      quantite: z.number().positive().describe('Quantité détenue'),
      prixAchatMoyen: z.number().positive().describe('Prix d\'achat moyen'),
    })
  ).min(1).describe('Liste des actifs crypto détenus'),
  devise: z.string().optional().default('eur').describe('Devise de référence (eur, usd, etc.)'),
});

export const SuivrePrixCryptoSchema = z.object({
  symbole: z.string().describe('Symbole de la crypto (BTC, ETH, SOL, etc.)'),
  devise: z.string().optional().default('eur').describe('Devise de référence'),
});

export const CalculerGainsCryptoSchema = z.object({
  symbole: z.string().describe('Symbole de la crypto'),
  quantite: z.number().positive().describe('Quantité'),
  prixAchat: z.number().positive().describe('Prix d\'achat'),
  devise: z.string().optional().default('eur').describe('Devise'),
});

export const GenererRapportFiscalCryptoSchema = z.object({
  actifs: z.array(
    z.object({
      symbole: z.string(),
      quantite: z.number(),
      prixAchatMoyen: z.number(),
      dateAchat: z.string().optional(),
    })
  ),
  annee: z.number().int().positive().describe('Année fiscale'),
});

// ============================================================
// TOOLS
// ============================================================

/**
 * Tool: obtenir_portfolio_crypto
 * Calculer la valeur actuelle d'un portfolio crypto
 */
export async function obtenirPortfolioCrypto(
  args: z.infer<typeof ObtenirPortfolioCryptoSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    journal.info('📊 Calcul du portfolio crypto', {
      correlationId,
      nbActifs: args.actifs.length,
    });

    const portfolio = await cryptoClient.calculerPortfolio(
      args.actifs,
      args.devise,
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: true,
              portfolio: {
                valeurTotale: `${portfolio.totalValeur.toFixed(2)} ${portfolio.devise}`,
                gainsPertesTotal: `${portfolio.gainsPertesTotal.toFixed(2)} ${portfolio.devise}`,
                pourcentageGainsPertesTotal: `${portfolio.pourcentageGainsPertesTotal.toFixed(2)}%`,
                derniereMAJ: portfolio.derniereMAJ,
                actifs: portfolio.actifs.map(a => ({
                  symbole: a.symbole,
                  nom: a.nom,
                  quantite: a.quantite,
                  prixActuel: `${a.prixActuel.toFixed(2)} ${portfolio.devise}`,
                  valeurActuelle: `${a.valeurActuelle.toFixed(2)} ${portfolio.devise}`,
                  gainsPerte: `${a.gainsPerte.toFixed(2)} ${portfolio.devise}`,
                  pourcentageGainsPerte: `${a.pourcentageGainsPerte.toFixed(2)}%`,
                })),
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('obtenir_portfolio_crypto_error', error as Error, { correlationId });
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

/**
 * Tool: suivre_prix_crypto
 * Obtenir le prix actuel d'une crypto
 */
export async function suivrePrixCrypto(
  args: z.infer<typeof SuivrePrixCryptoSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const prix = await cryptoClient.obtenirPrix(args.symbole, args.devise, correlationId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: true,
              crypto: {
                symbole: prix.symbole,
                nom: prix.nom,
                prix: `${prix.prix.toFixed(2)} ${prix.devise}`,
                variation24h: `${prix.variation24h > 0 ? '+' : ''}${prix.variation24h.toFixed(2)}%`,
                variation7j: `${prix.variation7j > 0 ? '+' : ''}${prix.variation7j.toFixed(2)}%`,
                capitalisationMarche: `${(prix.capitalisationMarche / 1000000000).toFixed(2)}B ${prix.devise}`,
                dernierMAJ: prix.dernierMAJ,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('suivre_prix_crypto_error', error as Error, { correlationId });
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

/**
 * Tool: calculer_gains_crypto
 * Calculer les gains/pertes pour une position crypto
 */
export async function calculerGainsCrypto(
  args: z.infer<typeof CalculerGainsCryptoSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const prix = await cryptoClient.obtenirPrix(args.symbole, args.devise, correlationId);

    const valeurActuelle = args.quantite * prix.prix;
    const coutTotal = args.quantite * args.prixAchat;
    const gainsPerte = valeurActuelle - coutTotal;
    const pourcentageGainsPerte = (gainsPerte / coutTotal) * 100;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: true,
              calcul: {
                symbole: args.symbole,
                quantite: args.quantite,
                prixAchat: `${args.prixAchat.toFixed(2)} ${args.devise}`,
                prixActuel: `${prix.prix.toFixed(2)} ${args.devise}`,
                investissement: `${coutTotal.toFixed(2)} ${args.devise}`,
                valeurActuelle: `${valeurActuelle.toFixed(2)} ${args.devise}`,
                gainsPerte: `${gainsPerte >= 0 ? '+' : ''}${gainsPerte.toFixed(2)} ${args.devise}`,
                pourcentageGainsPerte: `${pourcentageGainsPerte >= 0 ? '+' : ''}${pourcentageGainsPerte.toFixed(2)}%`,
                statut: gainsPerte >= 0 ? '📈 En profit' : '📉 En perte',
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('calculer_gains_crypto_error', error as Error, { correlationId });
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

/**
 * Tool: generer_rapport_fiscal_crypto
 * Générer un rapport fiscal pour les cryptos
 */
export async function genererRapportFiscalCrypto(
  args: z.infer<typeof GenererRapportFiscalCryptoSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    journal.info('📄 Génération rapport fiscal crypto', {
      correlationId,
      annee: args.annee,
      nbActifs: args.actifs.length,
    });

    const portfolio = await cryptoClient.calculerPortfolio(args.actifs, 'eur', correlationId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              succes: true,
              rapportFiscal: {
                annee: args.annee,
                valeurTotalePortfolio: `${portfolio.totalValeur.toFixed(2)} EUR`,
                gainsPertesTotaux: `${portfolio.gainsPertesTotal.toFixed(2)} EUR`,
                imposable: portfolio.gainsPertesTotal > 0,
                montantImposable: portfolio.gainsPertesTotal > 0 ? `${(portfolio.gainsPertesTotal * 0.30).toFixed(2)} EUR (flat tax 30%)` : '0 EUR',
                note: 'Ce rapport est indicatif. Consultez un expert-comptable pour votre déclaration fiscale.',
                details: portfolio.actifs.map(a => ({
                  symbole: a.symbole,
                  gainsPerte: a.gainsPerte,
                  pourcentage: a.pourcentageGainsPerte,
                })),
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('generer_rapport_fiscal_crypto_error', error as Error, { correlationId });
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
