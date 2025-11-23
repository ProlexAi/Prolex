/**
 * Serveur MCP Finance
 * Enregistrement de tous les tools financiers
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config, validateConfig, logConfig } from './config/env.js';
import { journal } from './logging/systemJournal.js';

// Import des tools
import * as paiements from './tools/paiements/index.js';
import * as crypto from './tools/crypto/index.js';

/**
 * Serveur MCP Finance principal
 */
export class FinanceMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: '@prolex/finance-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    journal.info('Serveur MCP Finance initialisé');
  }

  /**
   * Configuration des handlers
   */
  private setupHandlers(): void {
    // Handler: Lister les tools disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // ===== PAIEMENTS (5 tools) =====
        {
          name: 'creer_facture',
          description: 'Créer une nouvelle facture avec Stripe',
          inputSchema: paiements.CreerFactureSchema,
        },
        {
          name: 'envoyer_facture',
          description: 'Envoyer une facture par email au client',
          inputSchema: paiements.EnvoyerFactureSchema,
        },
        {
          name: 'suivre_paiement',
          description: 'Suivre le statut d\'un paiement',
          inputSchema: paiements.SuivrePaiementSchema,
        },
        {
          name: 'rembourser_paiement',
          description: 'Rembourser un paiement (total ou partiel)',
          inputSchema: paiements.RembourserPaiementSchema,
        },
        {
          name: 'obtenir_statut_paiement',
          description: 'Obtenir le statut détaillé d\'un paiement',
          inputSchema: paiements.ObtenirStatutPaiementSchema,
        },

        // ===== CRYPTO (4 tools) =====
        {
          name: 'obtenir_portfolio_crypto',
          description: 'Calculer la valeur actuelle d\'un portfolio crypto',
          inputSchema: crypto.ObtenirPortfolioCryptoSchema,
        },
        {
          name: 'suivre_prix_crypto',
          description: 'Obtenir le prix actuel d\'une cryptomonnaie',
          inputSchema: crypto.SuivrePrixCryptoSchema,
        },
        {
          name: 'calculer_gains_crypto',
          description: 'Calculer les gains/pertes pour une position crypto',
          inputSchema: crypto.CalculerGainsCryptoSchema,
        },
        {
          name: 'generer_rapport_fiscal_crypto',
          description: 'Générer un rapport fiscal pour les cryptomonnaies',
          inputSchema: crypto.GenererRapportFiscalCryptoSchema,
        },

        // TODO: Ajouter les autres tools (comptabilite, banque, budget)
      ],
    }));

    // Handler: Exécuter un tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      journal.info(`Exécution du tool: ${name}`, { tool: name });

      try {
        // Router vers le bon tool
        switch (name) {
          // Paiements
          case 'creer_facture':
            return await paiements.creerFacture(args as any);
          case 'envoyer_facture':
            return await paiements.envoyerFacture(args as any);
          case 'suivre_paiement':
            return await paiements.suivrePaiement(args as any);
          case 'rembourser_paiement':
            return await paiements.rembourserPaiement(args as any);
          case 'obtenir_statut_paiement':
            return await paiements.obtenirStatutPaiement(args as any);

          // Crypto
          case 'obtenir_portfolio_crypto':
            return await crypto.obtenirPortfolioCrypto(args as any);
          case 'suivre_prix_crypto':
            return await crypto.suivrePrixCrypto(args as any);
          case 'calculer_gains_crypto':
            return await crypto.calculerGainsCrypto(args as any);
          case 'generer_rapport_fiscal_crypto':
            return await crypto.genererRapportFiscalCrypto(args as any);

          default:
            throw new Error(`Tool inconnu: ${name}`);
        }
      } catch (error) {
        journal.error(`tool_execution_error_${name}`, error as Error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  succes: false,
                  erreur: `Erreur lors de l'exécution du tool ${name}: ${(error as Error).message}`,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Démarrer le serveur
   */
  async start(): Promise<void> {
    // Valider la configuration
    const validation = validateConfig();
    if (!validation.valid) {
      console.error('❌ Erreurs de configuration:');
      validation.errors.forEach((err) => console.error(`   - ${err}`));
      process.exit(1);
    }

    // Afficher la configuration
    logConfig();

    // Démarrer le transport stdio
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    journal.info('🚀 Serveur MCP Finance démarré avec succès');
    console.log('💰 [MCP FINANCE] Serveur prêt - En attente de requêtes...\n');
  }

  /**
   * Arrêter le serveur
   */
  async stop(): Promise<void> {
    await this.server.close();
    journal.info('Serveur MCP Finance arrêté');
  }
}
