/**
 * Serveur MCP pour Kimmy Tools Pack
 *
 * Expose 3 outils via le protocole MCP (Model Context Protocol) :
 * - audio_to_text : Transcription audio → texte
 * - preprocess_text : Prétraitement de texte
 * - structure_output : Structuration de sortie Kimmy
 *
 * Version: 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

import { handleAudioToText } from './handlers/audioHandler.js';
import { handlePreprocessText } from './handlers/preprocessHandler.js';
import { handleStructureOutput } from './handlers/structureHandler.js';
import {
  AudioToTextInput,
  PreprocessTextInput,
  StructureOutputInput,
  KimmyToolError,
} from '../types/toolTypes.js';

/**
 * Classe principale du serveur MCP Kimmy
 */
export class KimmyMcpServer {
  private server: Server;
  private transport: StdioServerTransport | null = null;

  constructor() {
    // Initialiser le serveur MCP
    this.server = new Server(
      {
        name: 'kimmy-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    console.log('✅ Serveur MCP Kimmy initialisé (v1.0.0)');
  }

  /**
   * Configure les handlers MCP pour les requêtes
   */
  private setupHandlers(): void {
    // Handler: Lister les outils disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.log('📋 Requête: list_tools');

      return {
        tools: [
          // ========================================
          // TOOL 1: audio_to_text
          // ========================================
          {
            name: 'audio_to_text',
            description:
              'Transcrit un fichier audio en texte en utilisant Whisper. ' +
              'Retourne la transcription brute, nettoyée, la langue détectée et la durée.',
            inputSchema: {
              type: 'object',
              properties: {
                audioPath: {
                  type: 'string',
                  description:
                    'Chemin absolu ou relatif vers le fichier audio à transcrire ' +
                    '(formats supportés: .mp3, .wav, .m4a, .ogg, .webm, .flac)',
                },
                targetLanguage: {
                  type: 'string',
                  description:
                    'Code langue cible pour la transcription (ex: fr, en, es). ' +
                    'Optionnel, par défaut: fr',
                },
              },
              required: ['audioPath'],
            },
          },

          // ========================================
          // TOOL 2: preprocess_text
          // ========================================
          {
            name: 'preprocess_text',
            description:
              'Prétraite un texte brut : nettoyage, normalisation, segmentation en phrases, ' +
              'détection de langue. Utile pour préparer du texte avant analyse ou traitement NLP.',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'Texte brut à prétraiter (max 10MB)',
                },
              },
              required: ['text'],
            },
          },

          // ========================================
          // TOOL 3: structure_output
          // ========================================
          {
            name: 'structure_output',
            description:
              'Structure la sortie de Kimmy en extrayant : résumé, intention, entités clés, ' +
              'actions proposées, et contraintes. Permet de transformer un texte libre en données structurées.',
            inputSchema: {
              type: 'object',
              properties: {
                text_from_kimmy: {
                  type: 'string',
                  description: 'Texte produit par Kimmy à analyser et structurer',
                },
              },
              required: ['text_from_kimmy'],
            },
          },
        ],
      };
    });

    // Handler: Appeler un outil
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const args = request.params.arguments || {};

      console.log(`🔧 Requête: call_tool → ${toolName}`);
      console.log(`   Arguments:`, JSON.stringify(args, null, 2));

      try {
        let result: unknown;

        // Router vers le bon handler
        switch (toolName) {
          case 'audio_to_text':
            result = await handleAudioToText(args as unknown as AudioToTextInput);
            break;

          case 'preprocess_text':
            result = await handlePreprocessText(args as unknown as PreprocessTextInput);
            break;

          case 'structure_output':
            result = await handleStructureOutput(args as unknown as StructureOutputInput);
            break;

          default:
            throw new Error(
              `Outil inconnu: ${toolName}. Outils disponibles: audio_to_text, preprocess_text, structure_output`
            );
        }

        console.log(`✅ Outil ${toolName} exécuté avec succès`);

        // Retourner le résultat au format MCP
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        } satisfies CallToolResult;
      } catch (error) {
        // Gestion des erreurs
        console.error(`❌ Erreur lors de l'exécution de ${toolName}:`, error);

        let errorMessage: string;
        let errorDetails: unknown = undefined;

        if (error instanceof KimmyToolError) {
          // Erreur métier connue
          errorMessage = `[${error.code}] ${error.message}`;
          errorDetails = error.details;
        } else if (error instanceof Error) {
          // Erreur JavaScript standard
          errorMessage = error.message;
        } else {
          // Erreur inconnue
          errorMessage = String(error);
        }

        // Retourner l'erreur au format MCP
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: errorMessage,
                  tool: toolName,
                  details: errorDetails,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        } satisfies CallToolResult;
      }
    });
  }

  /**
   * Démarre le serveur MCP via stdio
   */
  async start(): Promise<void> {
    console.log('🚀 Démarrage du serveur MCP Kimmy...');

    // Créer le transport stdio
    this.transport = new StdioServerTransport();

    // Connecter le serveur au transport
    await this.server.connect(this.transport);

    console.log('✅ Serveur MCP Kimmy démarré avec succès');
    console.log('📡 En écoute sur stdio...');
    console.log('');
    console.log('Outils disponibles:');
    console.log('  - audio_to_text');
    console.log('  - preprocess_text');
    console.log('  - structure_output');
  }

  /**
   * Arrête le serveur MCP proprement
   */
  async stop(): Promise<void> {
    console.log('🛑 Arrêt du serveur MCP Kimmy...');

    if (this.transport) {
      await this.server.close();
      console.log('✅ Serveur MCP Kimmy arrêté');
    }
  }
}
