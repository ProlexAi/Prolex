/**
 * Client SMS & WhatsApp pour MCP Communication
 * Utilise Twilio API
 */

import twilio from 'twilio';
import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import type { SMS, MessageWhatsApp, StatutMessage } from '../types/index.js';

class SMSClient {
  private client: any = null;
  private enabled: boolean;

  constructor() {
    this.enabled = config.twilio.enabled;

    if (this.enabled) {
      this.client = twilio(
        config.twilio.accountSid,
        config.twilio.authToken
      );
      journal.info('Client SMS/WhatsApp (Twilio) initialisé');
    }
  }

  /**
   * Envoyer un SMS
   */
  async envoyerSMS(sms: SMS, correlationId: string): Promise<{
    id: string;
    statut: StatutMessage;
    cout?: number;
  }> {
    if (!this.client) {
      throw new Error('Twilio non configuré');
    }

    try {
      const message = await this.client.messages.create({
        body: sms.message,
        from: sms.de || config.twilio.phoneNumber,
        to: sms.a,
      });

      journal.logMessageEnvoye({
        canal: 'sms',
        destinataire: sms.a,
        statut: this.mapTwilioStatus(message.status),
        messageId: message.sid,
        correlationId,
        metadata: {
          longueur: sms.message.length,
          segments: message.numSegments,
          prix: message.price,
        },
      });

      return {
        id: message.sid,
        statut: this.mapTwilioStatus(message.status),
        cout: parseFloat(message.price || '0'),
      };
    } catch (error) {
      journal.error('sms_send_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Envoyer un message WhatsApp
   */
  async envoyerWhatsApp(msg: MessageWhatsApp, correlationId: string): Promise<{
    id: string;
    statut: StatutMessage;
  }> {
    if (!this.client) {
      throw new Error('Twilio non configuré');
    }

    try {
      const messageData: any = {
        from: msg.de || config.twilio.whatsappNumber,
        to: msg.a.startsWith('whatsapp:') ? msg.a : `whatsapp:${msg.a}`,
      };

      if (msg.message) {
        messageData.body = msg.message;
      }

      if (msg.media) {
        messageData.mediaUrl = [msg.media.url];
        if (msg.media.legende) {
          messageData.body = msg.media.legende;
        }
      }

      const message = await this.client.messages.create(messageData);

      journal.logMessageEnvoye({
        canal: 'whatsapp',
        destinataire: msg.a,
        statut: this.mapTwilioStatus(message.status),
        messageId: message.sid,
        correlationId,
        metadata: {
          media: !!msg.media,
          type: msg.media?.type,
        },
      });

      return {
        id: message.sid,
        statut: this.mapTwilioStatus(message.status),
      };
    } catch (error) {
      journal.error('whatsapp_send_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Obtenir le statut d'un message
   */
  async obtenirStatut(messageId: string, correlationId: string): Promise<{
    statut: StatutMessage;
    dateLivraison?: string;
    erreur?: string;
  }> {
    if (!this.client) {
      throw new Error('Twilio non configuré');
    }

    try {
      const message = await this.client.messages(messageId).fetch();

      return {
        statut: this.mapTwilioStatus(message.status),
        dateLivraison: message.dateSent ? new Date(message.dateSent).toISOString() : undefined,
        erreur: message.errorMessage,
      };
    } catch (error) {
      journal.error('sms_status_error', error as Error, { correlationId, messageId });
      throw error;
    }
  }

  /**
   * Lire les messages reçus (SMS)
   */
  async lireMessageRecus(params: {
    depuis?: string;
    limite?: number;
  }, correlationId: string): Promise<SMS[]> {
    if (!this.client) {
      throw new Error('Twilio non configuré');
    }

    try {
      const options: any = {
        to: config.twilio.phoneNumber,
        limit: params.limite || 20,
      };

      if (params.depuis) {
        options.dateSentAfter = new Date(params.depuis);
      }

      const messages = await this.client.messages.list(options);

      return messages.map((msg: any) => ({
        id: msg.sid,
        de: msg.from,
        a: msg.to,
        message: msg.body,
        statut: this.mapTwilioStatus(msg.status),
        dateEnvoi: new Date(msg.dateCreated).toISOString(),
        dateLivraison: msg.dateSent ? new Date(msg.dateSent).toISOString() : undefined,
      }));
    } catch (error) {
      journal.error('sms_read_error', error as Error, { correlationId });
      throw error;
    }
  }

  /**
   * Mapper le statut Twilio vers notre système
   */
  private mapTwilioStatus(status: string): StatutMessage {
    switch (status) {
      case 'queued':
      case 'sending':
        return 'en_attente';
      case 'sent':
      case 'delivered':
        return 'livre';
      case 'read':
        return 'lu';
      case 'failed':
      case 'undelivered':
        return 'echoue';
      default:
        return 'envoye';
    }
  }
}

// Export singleton
export const smsClient = new SMSClient();
