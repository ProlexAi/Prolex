/**
 * Tools MCP pour Email
 * 4 tools: envoyer_email, lire_emails, rechercher_email, archiver_email
 */

import { z } from 'zod';
import { emailClient } from '../../clients/emailClient.js';
import { securityValidator } from '../../security/validator.js';
import { rateLimiter } from '../../security/rateLimiter.js';
import { journal } from '../../logging/systemJournal.js';
import type { MCPToolResponse } from '../../types/index.js';

// ============================================================
// SCHÉMAS ZOD
// ============================================================

export const EnvoyerEmailSchema = z.object({
  a: z.union([z.string().email(), z.array(z.string().email())]).describe('Destinataire(s)'),
  sujet: z.string().min(1).describe('Sujet de l\'email'),
  corps: z.string().min(1).describe('Corps du message (texte)'),
  html: z.string().optional().describe('Corps HTML (optionnel)'),
  cc: z.array(z.string().email()).optional().describe('Copie (CC)'),
  cci: z.array(z.string().email()).optional().describe('Copie cachée (BCC)'),
  pieceJointes: z.array(
    z.object({
      nom: z.string(),
      contenu: z.string().describe('Contenu en Base64'),
      type: z.string().describe('Type MIME'),
    })
  ).optional().describe('Pièces jointes'),
  priorite: z.enum(['basse', 'normale', 'haute']).optional().default('normale'),
});

export const LireEmailsSchema = z.object({
  nonLu: z.boolean().optional().default(true).describe('Seulement les non-lus'),
  limite: z.number().int().positive().max(50).optional().default(10).describe('Nombre max d\'emails'),
  depuis: z.string().optional().describe('Date de début (ISO 8601)'),
});

// ============================================================
// TOOLS
// ============================================================

/**
 * Tool: envoyer_email
 * Envoyer un email avec validation de sécurité
 */
export async function envoyerEmail(args: z.infer<typeof EnvoyerEmailSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    journal.info('📧 Envoi d\'email', {
      correlationId,
      destinataires: Array.isArray(args.a) ? args.a.length : 1,
      sujet: args.sujet,
    });

    // 1. SÉCURITÉ: Vérifier rate limit
    const rateLimitOk = await rateLimiter.checkAndIncrement('email', correlationId);
    if (!rateLimitOk) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            succes: false,
            erreur: '🚫 Rate limit dépassé. Trop d\'emails envoyés récemment. Réessayez plus tard.',
            canal: 'email',
          }, null, 2),
        }],
        isError: true,
      };
    }

    // 2. SÉCURITÉ: Valider TOUS les destinataires
    const destinataires = Array.isArray(args.a) ? args.a : [args.a];
    const tousDestinataires = [
      ...destinataires,
      ...(args.cc || []),
      ...(args.cci || []),
    ];

    for (const dest of tousDestinataires) {
      const validation = await securityValidator.validerEmail(dest, correlationId);

      if (!validation.valide) {
        journal.logAccesRefuse({
          canal: 'email',
          destinataire: dest,
          raison: validation.raison || 'Validation échouée',
          correlationId,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              succes: false,
              erreur: `🚫 Destinataire non autorisé: ${validation.raison}`,
              destinataire: dest,
              menaces: validation.menaces,
            }, null, 2),
          }],
          isError: true,
        };
      }

      // Alerte si menaces détectées
      if (validation.menaces && validation.menaces.length > 0) {
        journal.warn('Menaces détectées mais autorisées', {
          destinataire: dest,
          menaces: validation.menaces,
          correlationId,
        });
      }
    }

    // 3. SÉCURITÉ: Valider le contenu
    const menacesLiens = securityValidator.detecterLiensSuspects(args.corps);
    const menacesSpam = securityValidator.detecterSpam(args.corps);

    if (menacesLiens.some(m => m.action === 'bloque') || menacesSpam.some(m => m.action === 'bloque')) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            succes: false,
            erreur: '🚫 Message bloqué: contenu suspect détecté',
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

    // 4. SÉCURITÉ: Valider pièces jointes
    if (args.pieceJointes) {
      for (const pj of args.pieceJointes) {
        const tailleBrute = pj.contenu.length * 0.75; // Base64 est ~33% plus gros
        const validationPJ = await securityValidator.validerPieceJointe(
          pj.nom,
          tailleBrute,
          pj.type,
          correlationId
        );

        if (!validationPJ.valide) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                succes: false,
                erreur: `🚫 Pièce jointe refusée: ${validationPJ.raison}`,
                fichier: pj.nom,
              }, null, 2),
            }],
            isError: true,
          };
        }
      }
    }

    // 5. ENVOI: Tout est OK, envoyer l'email
    const result = await emailClient.envoyerEmail({
      a: args.a,
      sujet: args.sujet,
      corps: args.corps,
      html: args.html,
      cc: args.cc,
      cci: args.cci,
      pieceJointes: args.pieceJointes,
      priorite: args.priorite,
    }, correlationId);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          succes: true,
          message: '✅ Email envoyé avec succès',
          id: result.id,
          destinataires: destinataires.length,
          statut: result.statut,
        }, null, 2),
      }],
    };
  } catch (error) {
    journal.error('envoyer_email_error', error as Error, { correlationId });
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
 * Tool: lire_emails
 * Lire les emails récents
 */
export async function lireEmails(args: z.infer<typeof LireEmailsSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const emails = await emailClient.lireEmails({
      nonLu: args.nonLu,
      limite: args.limite,
      depuis: args.depuis,
    }, correlationId);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          succes: true,
          total: emails.length,
          emails: emails.map(e => ({
            id: e.id,
            de: e.de,
            sujet: e.sujet,
            apercu: e.corps.substring(0, 100) + '...',
            date: e.dateEnvoi,
          })),
        }, null, 2),
      }],
    };
  } catch (error) {
    journal.error('lire_emails_error', error as Error, { correlationId });
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
