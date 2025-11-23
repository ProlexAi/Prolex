/**
 * SystemJournal Logger pour MCP Finance
 * Logs vers Google Sheets pour traçabilité complète
 */

import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

class SystemJournal {
  private logger: pino.Logger;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.SYSTEM_JOURNAL_ENABLED === 'true';

    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:dd/mm/yyyy HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  /**
   * Génère un ID de corrélation unique
   */
  generateCorrelationId(): string {
    return `finance_${Date.now()}_${uuidv4().substring(0, 8)}`;
  }

  /**
   * Log une action financière
   */
  logAction(
    action: string,
    details: Record<string, any>,
    correlationId?: string
  ): void {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: 'MCP_FINANCE',
      action,
      correlationId: correlationId || this.generateCorrelationId(),
      ...details,
    };

    this.logger.info(logEntry, `[FINANCE] ${action}`);

    // TODO: Envoyer vers Google Sheets SystemJournal
    // Via API Google Sheets ou webhook n8n
  }

  /**
   * Log une transaction financière
   */
  logTransaction(
    type: 'facture' | 'paiement' | 'depense' | 'revenu',
    montant: number,
    details: Record<string, any>,
    correlationId?: string
  ): void {
    this.logAction(`transaction_${type}`, {
      type,
      montant,
      devise: details.devise || 'EUR',
      ...details,
    }, correlationId);
  }

  /**
   * Log une erreur
   */
  error(
    action: string,
    error: Error,
    context?: Record<string, any>
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: 'MCP_FINANCE',
      action,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    };

    this.logger.error(logEntry, `[FINANCE ERROR] ${action}: ${error.message}`);

    // TODO: Envoyer vers Google Sheets SystemJournal
  }

  /**
   * Log un warning
   */
  warn(
    action: string,
    message: string,
    context?: Record<string, any>
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: 'MCP_FINANCE',
      action,
      message,
      ...context,
    };

    this.logger.warn(logEntry, `[FINANCE WARN] ${action}: ${message}`);
  }

  /**
   * Log info
   */
  info(message: string, context?: Record<string, any>): void {
    this.logger.info({ agent: 'MCP_FINANCE', ...context }, message);
  }

  /**
   * Log de débogage
   */
  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug({ agent: 'MCP_FINANCE', ...context }, message);
  }
}

// Export singleton
export const journal = new SystemJournal();
