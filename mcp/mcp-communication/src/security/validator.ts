/**
 * Validateur de Sécurité pour MCP Communication
 * ⚠️ COUCHE CRITIQUE - Valide tous les messages avant envoi
 */

import validator from 'validator';
import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import type { ValidationResultat, MenaceDetectee, CanalCommunication } from '../types/index.js';

class SecurityValidator {
  /**
   * Valider un destinataire email
   */
  async validerEmail(email: string, correlationId?: string): Promise<ValidationResultat> {
    const menaces: string[] = [];
    let score = 100;

    // 1. Format email valide
    if (!validator.isEmail(email)) {
      return {
        valide: false,
        raison: `Format email invalide: ${email}`,
        score: 0,
      };
    }

    // 2. Blacklist (bloque immédiatement)
    if (config.security.blacklist.contacts.includes(email)) {
      journal.warn('Email bloqué (blacklist)', { email, correlationId });
      return {
        valide: false,
        raison: `Email bloqué: ${email}`,
        score: 0,
      };
    }

    // 3. Whitelist stricte en production
    if (config.isProduction) {
      const domaine = email.split('@')[1];

      const dansWhitelist =
        config.security.whitelist.emails.includes(email) ||
        config.security.whitelist.domainesEmail.some(d =>
          d.startsWith('*') ? domaine.endsWith(d.substring(1)) : domaine === d
        );

      if (!dansWhitelist) {
        journal.warn('Email hors whitelist (production)', { email, correlationId });

        if (config.security.confirmation.requiseHorsWhitelist) {
          return {
            valide: false,
            raison: `Email non autorisé (hors whitelist): ${email}`,
            menaces: ['destinataire_hors_whitelist'],
            score: 30,
          };
        }

        score -= 40;
        menaces.push('destinataire_non_verifie');
      }
    }

    // 4. Détection email jetable / temporaire
    const emailJetables = ['temp-mail.org', 'guerrillamail.com', '10minutemail.com', 'throwaway.email'];
    const domaine = email.split('@')[1];

    if (emailJetables.some(d => domaine.includes(d))) {
      journal.warn('Email jetable détecté', { email, correlationId });
      menaces.push('email_jetable');
      score -= 50;
    }

    // 5. Détection patterns suspects
    if (this.detecterPatternSuspect(email)) {
      menaces.push('pattern_suspect');
      score -= 30;
    }

    return {
      valide: score >= 50,
      raison: score < 50 ? 'Score de sécurité insuffisant' : undefined,
      menaces,
      score,
    };
  }

  /**
   * Valider un numéro de téléphone
   */
  async validerTelephone(numero: string, correlationId?: string): Promise<ValidationResultat> {
    const menaces: string[] = [];
    let score = 100;

    // 1. Format international requis (+33...)
    if (!validator.isMobilePhone(numero, 'any')) {
      return {
        valide: false,
        raison: `Format téléphone invalide: ${numero}. Utilisez le format international (+33...)`,
        score: 0,
      };
    }

    // 2. Blacklist
    if (config.security.blacklist.contacts.includes(numero)) {
      journal.warn('Téléphone bloqué (blacklist)', { numero, correlationId });
      return {
        valide: false,
        raison: `Numéro bloqué: ${numero}`,
        score: 0,
      };
    }

    // 3. Whitelist stricte en production
    if (config.isProduction) {
      if (!config.security.whitelist.telephones.includes(numero)) {
        journal.warn('Téléphone hors whitelist (production)', { numero, correlationId });

        if (config.security.confirmation.requiseHorsWhitelist) {
          return {
            valide: false,
            raison: `Numéro non autorisé (hors whitelist): ${numero}`,
            menaces: ['destinataire_hors_whitelist'],
            score: 30,
          };
        }

        score -= 40;
        menaces.push('destinataire_non_verifie');
      }
    }

    return {
      valide: score >= 50,
      raison: score < 50 ? 'Score de sécurité insuffisant' : undefined,
      menaces,
      score,
    };
  }

  /**
   * Valider un utilisateur Slack
   */
  async validerSlackUser(userId: string, correlationId?: string): Promise<ValidationResultat> {
    let score = 100;

    // Whitelist en production
    if (config.isProduction) {
      if (!config.security.whitelist.slackUsers.includes(userId) && !userId.startsWith('#')) {
        journal.warn('Slack user hors whitelist', { userId, correlationId });

        if (config.security.confirmation.requiseHorsWhitelist) {
          return {
            valide: false,
            raison: `User Slack non autorisé: ${userId}`,
            score: 30,
          };
        }

        score -= 40;
      }
    }

    return {
      valide: score >= 50,
      score,
    };
  }

  /**
   * Valider un chat Telegram
   */
  async validerTelegramChat(chatId: string, correlationId?: string): Promise<ValidationResultat> {
    let score = 100;

    // Whitelist en production
    if (config.isProduction) {
      if (!config.security.whitelist.telegramChats.includes(chatId)) {
        journal.warn('Telegram chat hors whitelist', { chatId, correlationId });

        if (config.security.confirmation.requiseHorsWhitelist) {
          return {
            valide: false,
            raison: `Chat Telegram non autorisé: ${chatId}`,
            score: 30,
          };
        }

        score -= 40;
      }
    }

    return {
      valide: score >= 50,
      score,
    };
  }

  /**
   * Détecter pattern suspect dans email
   */
  private detecterPatternSuspect(email: string): boolean {
    const patternsSuspects = [
      /admin@/i,
      /noreply@/i,
      /support@(?!automatt\.ai)/i, // OK si c'est notre propre support
      /\d{10,}/, // Trop de chiffres
      /^[a-z]{30,}@/, // Trop long avant @
    ];

    return patternsSuspects.some(pattern => pattern.test(email));
  }

  /**
   * Détecter liens suspects dans un message
   */
  detecterLiensSuspects(message: string): MenaceDetectee[] {
    if (!config.security.detection.activee) return [];

    const menaces: MenaceDetectee[] = [];

    // Extraire les URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex) || [];

    // Domaines suspects (phishing)
    const domainesSuspects = [
      'bit.ly',
      'tinyurl.com',
      'goo.gl',
      't.co',
      // Ajoutez vos propres patterns
    ];

    // Patterns de phishing
    const patternsPhishing = [
      /paypal.*verify/i,
      /amazon.*account/i,
      /urgent.*click/i,
      /suspended.*account/i,
      /verify.*identity/i,
      /claim.*prize/i,
      /free.*money/i,
    ];

    for (const url of urls) {
      try {
        const urlObj = new URL(url);
        const domaine = urlObj.hostname;

        // Raccourcisseurs d'URL (suspect)
        if (domainesSuspects.some(d => domaine.includes(d))) {
          menaces.push({
            type: 'lien_suspect',
            gravite: 'moyenne',
            description: `Raccourcisseur d'URL détecté: ${url}`,
            action: config.security.detection.bloquerLiensSuspects ? 'bloque' : 'alerte',
            timestamp: new Date().toISOString(),
          });
        }

        // IP au lieu de domaine (très suspect)
        if (/\d+\.\d+\.\d+\.\d+/.test(domaine)) {
          menaces.push({
            type: 'lien_suspect',
            gravite: 'elevee',
            description: `Lien vers adresse IP: ${url}`,
            action: 'bloque',
            timestamp: new Date().toISOString(),
          });
        }

        // Patterns de phishing dans l'URL
        if (patternsPhishing.some(p => p.test(url))) {
          menaces.push({
            type: 'phishing',
            gravite: 'elevee',
            description: `Pattern de phishing détecté dans l'URL: ${url}`,
            action: 'bloque',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        // URL invalide = suspect
        menaces.push({
          type: 'lien_suspect',
          gravite: 'moyenne',
          description: `URL mal formée: ${url}`,
          action: 'alerte',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return menaces;
  }

  /**
   * Détecter spam dans le message
   */
  detecterSpam(message: string): MenaceDetectee[] {
    if (!config.security.detection.activee) return [];

    const menaces: MenaceDetectee[] = [];

    // Patterns de spam
    const patternsSpam = [
      { pattern: /click here/gi, matches: (message.match(/click here/gi) || []).length },
      { pattern: /congratulations/gi, matches: (message.match(/congratulations/gi) || []).length },
      { pattern: /winner/gi, matches: (message.match(/winner/gi) || []).length },
      { pattern: /free/gi, matches: (message.match(/free/gi) || []).length },
      { pattern: /€|£|\$/g, matches: (message.match(/€|£|\$/g) || []).length },
      { pattern: /!!!/g, matches: (message.match(/!!!/g) || []).length },
      { pattern: /[A-Z]{5,}/g, matches: (message.match(/[A-Z]{5,}/g) || []).length }, // Caps lock abuse
    ];

    let scoreSpam = 0;

    for (const { pattern, matches } of patternsSpam) {
      scoreSpam += matches * 10;
    }

    if (scoreSpam > 30) {
      menaces.push({
        type: 'spam',
        gravite: scoreSpam > 60 ? 'elevee' : 'moyenne',
        description: `Message suspect de spam (score: ${scoreSpam})`,
        action: scoreSpam > 60 ? 'bloque' : 'alerte',
        timestamp: new Date().toISOString(),
      });
    }

    return menaces;
  }

  /**
   * Valider une pièce jointe
   */
  async validerPieceJointe(
    nom: string,
    taille: number,
    type: string,
    correlationId?: string
  ): Promise<ValidationResultat> {
    const menaces: string[] = [];
    let score = 100;

    // 1. Taille maximale
    const tailleMB = taille / (1024 * 1024);
    if (tailleMB > config.security.maxAttachmentSizeMB) {
      return {
        valide: false,
        raison: `Pièce jointe trop volumineuse: ${tailleMB.toFixed(2)}MB (max: ${config.security.maxAttachmentSizeMB}MB)`,
        score: 0,
      };
    }

    // 2. Extensions dangereuses
    const extensionsDangereuses = [
      '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js',
      '.jar', '.msi', '.app', '.deb', '.rpm', '.apk',
    ];

    const extension = nom.substring(nom.lastIndexOf('.')).toLowerCase();

    if (extensionsDangereuses.includes(extension)) {
      journal.warn('Extension dangereuse détectée', { nom, extension, correlationId });
      return {
        valide: false,
        raison: `Extension de fichier interdite: ${extension}`,
        menaces: ['malware_potentiel'],
        score: 0,
      };
    }

    // 3. Double extension (technique de phishing)
    const doubleExtensions = /\.[a-z]{2,4}\.[a-z]{2,4}$/i;
    if (doubleExtensions.test(nom)) {
      menaces.push('double_extension_suspecte');
      score -= 50;
    }

    // 4. Types MIME autorisés
    const typesAutorises = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/csv',
      'application/json',
      'application/zip',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!typesAutorises.includes(type)) {
      journal.warn('Type MIME non autorisé', { nom, type, correlationId });
      menaces.push('type_fichier_suspect');
      score -= 40;
    }

    return {
      valide: score >= 50,
      raison: score < 50 ? 'Fichier suspect' : undefined,
      menaces,
      score,
    };
  }

  /**
   * Validation globale d'un message
   */
  async validerMessage(params: {
    canal: CanalCommunication;
    destinataire: string;
    message?: string;
    pieceJointes?: Array<{ nom: string; taille: number; type: string }>;
    correlationId?: string;
  }): Promise<ValidationResultat> {
    const { canal, destinataire, message, pieceJointes, correlationId } = params;

    // 1. Valider le destinataire selon le canal
    let validationDestinataire: ValidationResultat;

    switch (canal) {
      case 'email':
        validationDestinataire = await this.validerEmail(destinataire, correlationId);
        break;
      case 'sms':
      case 'whatsapp':
        validationDestinataire = await this.validerTelephone(destinataire, correlationId);
        break;
      case 'slack':
        validationDestinataire = await this.validerSlackUser(destinataire, correlationId);
        break;
      case 'telegram':
        validationDestinataire = await this.validerTelegramChat(destinataire, correlationId);
        break;
      default:
        validationDestinataire = { valide: false, score: 0, raison: 'Canal inconnu' };
    }

    if (!validationDestinataire.valide) {
      return validationDestinataire;
    }

    // 2. Analyser le contenu du message
    const menaces: string[] = [...(validationDestinataire.menaces || [])];

    if (message) {
      // Détecter liens suspects
      const menacesLiens = this.detecterLiensSuspects(message);
      if (menacesLiens.some(m => m.action === 'bloque')) {
        return {
          valide: false,
          raison: 'Liens suspects détectés dans le message',
          menaces: menacesLiens.map(m => m.type),
          score: 0,
        };
      }

      // Détecter spam
      const menacesSpam = this.detecterSpam(message);
      if (menacesSpam.some(m => m.action === 'bloque')) {
        return {
          valide: false,
          raison: 'Message identifié comme spam',
          menaces: menacesSpam.map(m => m.type),
          score: 0,
        };
      }

      menaces.push(...menacesLiens.filter(m => m.action === 'alerte').map(m => m.type));
      menaces.push(...menacesSpam.filter(m => m.action === 'alerte').map(m => m.type));
    }

    // 3. Valider les pièces jointes
    if (pieceJointes && pieceJointes.length > 0) {
      for (const pj of pieceJointes) {
        const validationPJ = await this.validerPieceJointe(pj.nom, pj.taille, pj.type, correlationId);
        if (!validationPJ.valide) {
          return validationPJ;
        }
        if (validationPJ.menaces) {
          menaces.push(...validationPJ.menaces);
        }
      }
    }

    return {
      valide: true,
      menaces: menaces.length > 0 ? menaces : undefined,
      score: validationDestinataire.score,
    };
  }
}

// Export singleton
export const securityValidator = new SecurityValidator();
