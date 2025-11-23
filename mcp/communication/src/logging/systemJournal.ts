/**
 * SystemJournal Logger pour MCP Communication
 * Logs vers Google Sheets + fichier local pour traçabilité complète
 */

import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';
import type { CanalCommunication, StatutMessage, MenaceDetectee } from '../types/index.js';

class SystemJournal {
  private logger: pino.Logger;
  private securityLogger: pino.Logger | null = null;

  constructor() {
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

    // Logger de sécurité séparé (fichier)
    if (config.logging.securityLog.enabled) {
      this.initSecurityLogger();
    }
  }

  /**
   * Initialiser le logger de sécurité
   */
  private initSecurityLogger(): void {
    try {
      const logDir = path.dirname(config.logging.securityLog.path);

      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      this.securityLogger = pino({
        level: 'info',
      }, pino.destination(config.logging.securityLog.path));

      this.info('Logger de sécurité initialisé', {
        path: config.logging.securityLog.path,
      });
    } catch (error) {
      this.error('security_logger_init_error', error as Error);
    }
  }

  /**
   * Génère un ID de corrélation unique
   */
  generateCorrelationId(): string {
    return `comm_${Date.now()}_${uuidv4().substring(0, 8)}`;
  }

  /**
   * Log l'envoi d'un message
   */
  logMessageEnvoye(params: {
    canal: CanalCommunication;
    destinataire: string;
    statut: StatutMessage;
    messageId?: string;
    correlationId: string;
    metadata?: Record<string, any>;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: 'MCP_COMMUNICATION',
      action: 'message_envoye',
      canal: params.canal,
      destinataire: this.masquerDestinataire(params.destinataire),
      statut: params.statut,
      messageId: params.messageId,
      correlationId: params.correlationId,
      ...params.metadata,
    };

    this.logger.info(logEntry, `[${params.canal.toUpperCase()}] Message ${params.statut}`);

    // Log dans SystemJournal (Google Sheets)
    if (config.logging.systemJournal.enabled) {
      // TODO: Envoyer vers Google Sheets via API ou webhook n8n
    }

    // Log de sécurité (tous les messages)
    if (config.logging.logAllMessages && this.securityLogger) {
      this.securityLogger.info(logEntry);
    }
  }

  /**
   * Log une menace détectée
   */
  logMenace(menace: MenaceDetectee, context: {
    canal: CanalCommunication;
    destinataire: string;
    correlationId: string;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: 'MCP_COMMUNICATION',
      action: 'menace_detectee',
      type: menace.type,
      gravite: menace.gravite,
      description: menace.description,
      actionPrise: menace.action,
      canal: context.canal,
      destinataire: this.masquerDestinataire(context.destinataire),
      correlationId: context.correlationId,
    };

    // Log selon la gravité
    if (menace.gravite === 'critique' || menace.gravite === 'elevee') {
      this.logger.error(logEntry, `[MENACE ${menace.gravite.toUpperCase()}] ${menace.description}`);
    } else {
      this.logger.warn(logEntry, `[MENACE ${menace.gravite.toUpperCase()}] ${menace.description}`);
    }

    // Toujours logger les menaces dans le fichier de sécurité
    if (this.securityLogger) {
      this.securityLogger.error(logEntry);
    }

    // Alerte admin si activité suspecte
    if (config.alertes.alerterActiviteSuspecte &&
        (menace.gravite === 'elevee' || menace.gravite === 'critique')) {
      this.alerterAdmin(menace, context);
    }
  }

  /**
   * Log une violation de rate limit
   */
  logRateLimitViolation(params: {
    canal: CanalCommunication;
    limite: number;
    utilise: number;
    correlationId: string;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: 'MCP_COMMUNICATION',
      action: 'rate_limit_violation',
      canal: params.canal,
      limite: params.limite,
      utilise: params.utilise,
      correlationId: params.correlationId,
    };

    this.logger.error(logEntry, `[RATE LIMIT] Limite dépassée pour ${params.canal}`);

    if (this.securityLogger) {
      this.securityLogger.error(logEntry);
    }
  }

  /**
   * Log un accès refusé (whitelist/blacklist)
   */
  logAccesRefuse(params: {
    canal: CanalCommunication;
    destinataire: string;
    raison: string;
    correlationId: string;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: 'MCP_COMMUNICATION',
      action: 'acces_refuse',
      canal: params.canal,
      destinataire: this.masquerDestinataire(params.destinataire),
      raison: params.raison,
      correlationId: params.correlationId,
    };

    this.logger.warn(logEntry, `[ACCÈS REFUSÉ] ${params.raison}`);

    if (this.securityLogger) {
      this.securityLogger.warn(logEntry);
    }
  }

  /**
   * Masquer partiellement le destinataire pour la confidentialité
   */
  private masquerDestinataire(destinataire: string): string {
    if (!config.isProduction) return destinataire;

    // Email: m***@example.com
    if (destinataire.includes('@')) {
      const [local, domain] = destinataire.split('@');
      return `${local[0]}***@${domain}`;
    }

    // Téléphone: +336***78
    if (destinataire.startsWith('+')) {
      return `${destinataire.substring(0, 4)}***${destinataire.substring(destinataire.length - 2)}`;
    }

    // Autre: masquer le milieu
    if (destinataire.length > 6) {
      return `${destinataire.substring(0, 3)}***${destinataire.substring(destinataire.length - 3)}`;
    }

    return '***';
  }

  /**
   * Alerter l'administrateur
   */
  private alerterAdmin(menace: MenaceDetectee, context: {
    canal: CanalCommunication;
    destinataire: string;
    correlationId: string;
  }): void {
    // TODO: Implémenter alerte Telegram ou Email
    this.logger.error({
      alert: 'ADMIN',
      menace,
      context,
    }, '🚨 ALERTE ADMIN: Activité suspecte détectée');
  }

  /**
   * Log une erreur
   */
  error(action: string, error: Error, context?: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: 'MCP_COMMUNICATION',
      action,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    };

    this.logger.error(logEntry, `[ERROR] ${action}: ${error.message}`);

    if (this.securityLogger) {
      this.securityLogger.error(logEntry);
    }
  }

  /**
   * Log un warning
   */
  warn(message: string, context?: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: 'MCP_COMMUNICATION',
      message,
      ...context,
    };

    this.logger.warn(logEntry, `[WARN] ${message}`);
  }

  /**
   * Log info
   */
  info(message: string, context?: Record<string, any>): void {
    this.logger.info({ agent: 'MCP_COMMUNICATION', ...context }, message);
  }

  /**
   * Log de débogage
   */
  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug({ agent: 'MCP_COMMUNICATION', ...context }, message);
  }
}

// Export singleton
export const journal = new SystemJournal();
