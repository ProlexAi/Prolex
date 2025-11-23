/**
 * MCP Tool: log_event
 * Permet aux agents IA de logger des événements dans PostgreSQL
 *
 * Autonomy Level: 0+ (disponible à tous les niveaux)
 * Use Case: Logging centralisé pour Prolex, n8n, MCP servers
 */

import { z } from 'zod';
import { logEvent as dbLogEvent, logError as dbLogError, type LogLevel } from '../dbClient.js';
import { journal } from '../logging/systemJournal.js';
import type { MCPToolResponse } from '../types/index.js';

// ============================================================
// SCHEMA
// ============================================================

export const LogEventSchema = z.object({
  source: z
    .string()
    .min(1)
    .max(50)
    .describe('Source du log (ex: "mcp_n8n", "prolex", "n8n_workflow_123")'),
  level: z
    .enum(['debug', 'info', 'warn', 'error'])
    .describe('Niveau de log: debug, info, warn, error'),
  message: z
    .string()
    .min(1)
    .max(500)
    .describe('Message du log (max 500 caractères)'),
  details: z
    .record(z.unknown())
    .optional()
    .describe('Détails additionnels au format JSON (optionnel)'),
});

export type LogEventInput = z.infer<typeof LogEventSchema>;

// ============================================================
// TOOL IMPLEMENTATION
// ============================================================

/**
 * Tool: log_event
 * Enregistre un événement dans PostgreSQL (table app_logs)
 *
 * @param args - Paramètres validés par Zod
 * @returns MCPToolResponse - Confirmation de l'enregistrement
 *
 * @example
 * ```typescript
 * await logEvent({
 *   source: 'prolex_agent',
 *   level: 'info',
 *   message: 'Workflow design completed successfully',
 *   details: { workflow_id: 'abc123', duration_ms: 1250 }
 * });
 * ```
 */
export async function logEvent(args: LogEventInput): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    journal.debug('log_event_tool_called', {
      source: args.source,
      level: args.level,
      correlationId,
    });

    // Appeler le client DB pour écrire dans PostgreSQL
    await dbLogEvent({
      source: args.source,
      level: args.level as LogLevel,
      message: args.message,
      details: args.details,
    });

    // Log dans SystemJournal v2 (JSONL) également pour traçabilité
    journal.info('postgres_log_written', {
      source: args.source,
      level: args.level,
      message: args.message.substring(0, 100), // Tronquer pour éviter le spam
      correlationId,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: '✅ Log enregistré dans PostgreSQL',
              source: args.source,
              level: args.level,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    // En cas d'erreur, logger dans SystemJournal
    journal.error('log_event_tool_error', error as Error, {
      source: args.source,
      correlationId,
    });

    // Tenter d'écrire l'erreur dans PostgreSQL
    try {
      await dbLogError('mcp_n8n', error, {
        tool: 'log_event',
        original_source: args.source,
        correlationId,
      });
    } catch (dbError) {
      // Si même le log d'erreur échoue, juste logger en console
      console.error('❌ Impossible de logger l\'erreur dans PostgreSQL:', dbError);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: `Erreur lors de l'enregistrement du log: ${(error as Error).message}`,
              source: args.source,
              fallback: 'Le log a été enregistré dans SystemJournal (JSONL)',
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
