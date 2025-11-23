/**
 * Tools MCP pour SMS
 * 3 tools: envoyer_sms, lire_sms_recus, obtenir_statut_sms
 */

import { z } from 'zod';
import { smsClient } from '../../clients/smsClient.js';
import { securityValidator } from '../../security/validator.js';
import { rateLimiter } from '../../security/rateLimiter.js';
import { journal } from '../../logging/systemJournal.js';
import type { MCPToolResponse } from '../../types/index.js';

// ============================================================
// SCHÉMAS ZOD
// ============================================================

export const EnvoyerSMSSchema = z.object({
  a: z.string().describe('Numéro de téléphone (format international +33...)'),
  message: z.string().min(1).max(1600).describe('Message SMS (max 1600 caractères)'),
});

export const LireSMSRecusSchema = z.object({
  depuis: z.string().optional().describe('Date de début (ISO 8601)'),
  limite: z.number().int().positive().max(100).optional().default(20),
});

export const ObtenirStatutSMSSchema = z.object({
  messageId: z.string().describe('ID du message SMS'),
});

// ============================================================
// TOOLS
// ============================================================

/**
 * Tool: envoyer_sms
 * Envoyer un SMS avec validation stricte
 */
export async function envoyerSMS(args: z.infer<typeof EnvoyerSMSSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    journal.info('📱 Envoi de SMS', {
      correlationId,
      destinataire: args.a.substring(0, 5) + '***',
      longueur: args.message.length,
    });

    // 1. SÉCURITÉ: Vérifier rate limit SMS (plus strict que email)
    const rateLimitOk = await rateLimiter.checkAndIncrement('sms', correlationId);
    if (!rateLimitOk) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            succes: false,
            erreur: '🚫 Rate limit SMS dépassé. Limite de sécurité atteinte. Réessayez plus tard.',
            canal: 'sms',
          }, null, 2),
        }],
        isError: true,
      };
    }

    // 2. SÉCURITÉ: Valider le numéro de téléphone (STRICT)
    const validation = await securityValidator.validerTelephone(args.a, correlationId);

    if (!validation.valide) {
      journal.logAccesRefuse({
        canal: 'sms',
        destinataire: args.a,
        raison: validation.raison || 'Numéro non autorisé',
        correlationId,
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            succes: false,
            erreur: `🚫 Numéro non autorisé: ${validation.raison}`,
            numero: args.a,
            menaces: validation.menaces,
            conseil: 'Ajoutez ce numéro à la whitelist dans .env (ALLOWED_PHONE_NUMBERS)',
          }, null, 2),
        }],
        isError: true,
      };
    }

    // 3. SÉCURITÉ: Valider le contenu du SMS
    const menacesLiens = securityValidator.detecterLiensSuspects(args.message);
    const menacesSpam = securityValidator.detecterSpam(args.message);

    if (menacesLiens.some(m => m.action === 'bloque') || menacesSpam.some(m => m.action === 'bloque')) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            succes: false,
            erreur: '🚫 SMS bloqué: contenu suspect détecté',
            menaces: [...menacesLiens, ...menacesSpam].map(m => ({
              type: m.type,
              description: m.description,
              gravite: m.gravite,
            })),
          }, null, 2),
        }],
        isError: true,
      };
    }

    // 4. ENVOI: Tout est OK, envoyer le SMS
    const result = await smsClient.envoyerSMS({
      a: args.a,
      message: args.message,
    }, correlationId);

    // Calculer les segments SMS (160 caractères par segment)
    const segments = Math.ceil(args.message.length / 160);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          succes: true,
          message: '✅ SMS envoyé avec succès',
          id: result.id,
          destinataire: args.a,
          statut: result.statut,
          segments,
          cout: result.cout ? `${result.cout.toFixed(4)} EUR` : 'N/A',
        }, null, 2),
      }],
    };
  } catch (error) {
    journal.error('envoyer_sms_error', error as Error, { correlationId });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          succes: false,
          erreur: `Erreur lors de l'envoi: ${(error as Error).message}`,
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Tool: lire_sms_recus
 * Lire les SMS reçus
 */
export async function lireSMSRecus(args: z.infer<typeof LireSMSRecusSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const messages = await smsClient.lireMessageRecus({
      depuis: args.depuis,
      limite: args.limite,
    }, correlationId);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          succes: true,
          total: messages.length,
          messages: messages.map(m => ({
            id: m.id,
            de: m.de,
            message: m.message,
            date: m.dateEnvoi,
            statut: m.statut,
          })),
        }, null, 2),
      }],
    };
  } catch (error) {
    journal.error('lire_sms_recus_error', error as Error, { correlationId });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          succes: false,
          erreur: `Erreur: ${(error as Error).message}`,
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Tool: obtenir_statut_sms
 * Obtenir le statut de livraison d'un SMS
 */
export async function obtenirStatutSMS(args: z.infer<typeof ObtenirStatutSMSSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const statut = await smsClient.obtenirStatut(args.messageId, correlationId);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          succes: true,
          messageId: args.messageId,
          statut: statut.statut,
          dateLivraison: statut.dateLivraison,
          erreur: statut.erreur,
        }, null, 2),
      }],
    };
  } catch (error) {
    journal.error('obtenir_statut_sms_error', error as Error, { correlationId });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          succes: false,
          erreur: `Erreur: ${(error as Error).message}`,
        }, null, 2),
      }],
      isError: true,
    };
  }
}
