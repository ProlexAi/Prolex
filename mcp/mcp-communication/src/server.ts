/**
 * Serveur MCP Communication
 * Enregistrement de tous les tools communication
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config, validateConfig, logConfig } from './config/env.js';
import { journal } from './logging/systemJournal.js';
import { rateLimiter } from './security/rateLimiter.js';

// Import des tools
import * as email from './tools/email/index.js';
import * as sms from './tools/sms/index.js';

/**
 * Serveur MCP Communication principal
 */
export class CommunicationMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: '@prolex/communication-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    journal.info('Serveur MCP Communication initialisé');
  }

  /**
   * Configuration des handlers
   */
  private setupHandlers(): void {
    // Handler: Lister les tools disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // ===== EMAIL (2 tools) =====
        {
          name: 'envoyer_email',
          description: 'Envoyer un email avec validation de sécurité stricte',
          inputSchema: email.EnvoyerEmailSchema,
        },
        {
          name: 'lire_emails',
          description: 'Lire les emails récents (Gmail uniquement)',
          inputSchema: email.LireEmailsSchema,
        },

        // ===== SMS (3 tools) =====
        {
          name: 'envoyer_sms',
          description: 'Envoyer un SMS avec validation stricte (Twilio)',
          inputSchema: sms.EnvoyerSMSSchema,
        },
        {
          name: 'lire_sms_recus',
          description: 'Lire les SMS reçus',
          inputSchema: sms.LireSMSRecusSchema,
        },
        {
          name: 'obtenir_statut_sms',
          description: 'Obtenir le statut de livraison d\'un SMS',
          inputSchema: sms.ObtenirStatutSMSSchema,
        },

        // TODO: Ajouter les autres tools (WhatsApp, Slack, Telegram)
      ],
    }));

    // Handler: Exécuter un tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      journal.info(`Exécution du tool: ${name}`, { tool: name });

      try {
        // Router vers le bon tool
        switch (name) {
          // Email
          case 'envoyer_email':
            return await email.envoyerEmail(args as any);
          case 'lire_emails':
            return await email.lireEmails(args as any);

          // SMS
          case 'envoyer_sms':
            return await sms.envoyerSMS(args as any);
          case 'lire_sms_recus':
            return await sms.lireSMSRecus(args as any);
          case 'obtenir_statut_sms':
            return await sms.obtenirStatutSMS(args as any);

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

    // Afficher les warnings
    if (validation.warnings.length > 0) {
      console.warn('\n⚠️  Warnings de configuration:');
      validation.warnings.forEach((warn) => console.warn(`   ${warn}`));
    }

    // Afficher la configuration
    logConfig();

    // Démarrer le rate limiter cleanup
    rateLimiter.startAutoCleanup();

    // Démarrer le transport stdio
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    journal.info('🚀 Serveur MCP Communication démarré avec succès');
    console.log('📱 [MCP COMMUNICATION] Serveur prêt - Sécurité maximale activée\n');
  }

  /**
   * Arrêter le serveur
   */
  async stop(): Promise<void> {
    await this.server.close();
    journal.info('Serveur MCP Communication arrêté');
  }
}
