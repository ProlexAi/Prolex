/**
 * MCP Tools: Gmail
 */

import { z } from 'zod';
import * as gmailClient from '../../clients/gmailClient.js';
import type { MCPToolResponse } from '../../types/index.js';

export const GmailListSchema = z.object({
  query: z.string().optional().describe('Requête de recherche Gmail (syntaxe Gmail)'),
  maxResults: z.number().optional().default(50).describe('Nombre max de résultats'),
});

export const GmailSendSchema = z.object({
  to: z.union([z.string(), z.array(z.string())]).describe('Destinataire(s)'),
  subject: z.string().describe('Sujet de l\'email'),
  body: z.string().describe('Corps de l\'email'),
  cc: z.union([z.string(), z.array(z.string())]).optional().describe('CC'),
  isHtml: z.boolean().optional().default(false).describe('Email HTML?'),
});

export const GmailReadSchema = z.object({
  messageId: z.string().describe('ID du message à lire'),
});

export async function gmailList(args: z.infer<typeof GmailListSchema>): Promise<MCPToolResponse> {
  try {
    const messages = await gmailClient.listMessages(args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            messageCount: messages.length,
            messages: messages.map((m) => ({
              id: m.id,
              from: m.from,
              subject: m.subject,
              snippet: m.snippet,
              date: m.date,
            })),
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Gmail list: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

export async function gmailSend(args: z.infer<typeof GmailSendSchema>): Promise<MCPToolResponse> {
  try {
    const messageId = await gmailClient.sendMessage(args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ Email envoyé: "${args.subject}"`,
            messageId,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Gmail send: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

export async function gmailRead(args: z.infer<typeof GmailReadSchema>): Promise<MCPToolResponse> {
  try {
    const message = await gmailClient.getMessage(args.messageId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Gmail read: ${(error as Error).message}` }],
      isError: true,
    };
  }
}
