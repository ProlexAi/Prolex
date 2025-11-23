/**
 * Client Email pour MCP Communication
 * Support Gmail API et SMTP
 */

import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import type { Email, StatutMessage } from '../types/index.js';

class EmailClient {
  private transporter: any = null;
  private gmail: any = null;

  constructor() {
    if (config.email.gmail.enabled) {
      this.initGmail();
    } else if (config.email.smtp.enabled) {
      this.initSMTP();
    }
  }

  /**
   * Initialiser Gmail API (recommandé)
   */
  private async initGmail(): Promise<void> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        config.email.gmail.clientId,
        config.email.gmail.clientSecret,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: config.email.gmail.refreshToken,
      });

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: config.email.gmail.userEmail,
          clientId: config.email.gmail.clientId,
          clientSecret: config.email.gmail.clientSecret,
          refreshToken: config.email.gmail.refreshToken,
        },
      });

      this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      journal.info('Client Email (Gmail API) initialisé');
    } catch (error) {
      journal.error('email_gmail_init_error', error as Error);
      throw error;
    }
  }

  /**
   * Initialiser SMTP (alternatif)
   */
  private initSMTP(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: {
          user: config.email.smtp.user,
          pass: config.email.smtp.password,
        },
      });

      journal.info('Client Email (SMTP) initialisé');
    } catch (error) {
      journal.error('email_smtp_init_error', error as Error);
      throw error;
    }
  }

  /**
   * Envoyer un email
   */
  async envoyerEmail(email: Email, correlationId: string): Promise<{
    id: string;
    statut: StatutMessage;
  }> {
    if (!this.transporter) {
      throw new Error('Client email non configuré');
    }

    try {
      const mailOptions = {
        from: email.de || config.email.from,
        to: Array.isArray(email.a) ? email.a.join(', ') : email.a,
        cc: email.cc?.join(', '),
        bcc: email.cci?.join(', '),
        subject: email.sujet,
        text: email.corps,
        html: email.html,
        replyTo: email.repondreA,
        attachments: email.pieceJointes?.map(pj => ({
          filename: pj.nom,
          content: Buffer.from(pj.contenu, 'base64'),
          contentType: pj.type,
        })),
        priority: email.priorite === 'haute' ? 'high' : email.priorite === 'basse' ? 'low' : 'normal',
      };

      const info = await this.transporter.sendMail(mailOptions);

      journal.logMessageEnvoye({
        canal: 'email',
        destinataire: Array.isArray(email.a) ? email.a[0] : email.a,
        statut: 'envoye',
        messageId: info.messageId,
        correlationId,
        metadata: {
          sujet: email.sujet,
          pieceJointes: email.pieceJointes?.length || 0,
        },
      });

      return {
        id: info.messageId,
        statut: 'envoye',
      };
    } catch (error) {
      journal.error('email_send_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Lire les emails (Gmail uniquement)
   */
  async lireEmails(params: {
    nonLu?: boolean;
    limite?: number;
    depuis?: string;
  }, correlationId: string): Promise<Email[]> {
    if (!this.gmail) {
      throw new Error('Gmail API non configuré');
    }

    try {
      let query = '';
      if (params.nonLu) query += 'is:unread ';
      if (params.depuis) query += `after:${params.depuis} `;

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query.trim(),
        maxResults: params.limite || 10,
      });

      const messages = response.data.messages || [];
      const emails: Email[] = [];

      for (const message of messages) {
        const detail = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        });

        const headers = detail.data.payload.headers;
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        emails.push({
          id: detail.data.id,
          de: getHeader('from'),
          a: getHeader('to'),
          sujet: getHeader('subject'),
          corps: this.extractBody(detail.data.payload),
          dateEnvoi: new Date(parseInt(detail.data.internalDate)).toISOString(),
        });
      }

      return emails;
    } catch (error) {
      journal.error('email_read_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Extraire le corps de l'email
   */
  private extractBody(payload: any): string {
    let body = '';

    if (payload.body?.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }
    }

    return body;
  }
}

// Export singleton
export const emailClient = new EmailClient();
