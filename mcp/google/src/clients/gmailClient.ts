/**
 * Client Gmail
 */

import { google, type gmail_v1 } from 'googleapis';
import { getAuthClient } from './authClient.js';
import type { GmailMessage, GmailSendOptions, GmailSearchOptions } from '../types/index.js';

let gmailClient: gmail_v1.Gmail | null = null;

export function getGmailClient(): gmail_v1.Gmail {
  if (!gmailClient) {
    gmailClient = google.gmail({ version: 'v1' });
  }
  return gmailClient;
}

export async function listMessages(
  options: GmailSearchOptions = {}
): Promise<GmailMessage[]> {
  const auth = await getAuthClient();
  const gmail = getGmailClient();

  const response = await gmail.users.messages.list({
    auth,
    userId: 'me',
    q: options.query,
    maxResults: options.maxResults || 100,
    labelIds: options.labelIds,
    includeSpamTrash: options.includeSpamTrash,
  });

  if (!response.data.messages) {
    return [];
  }

  // Récupérer les détails de chaque message
  const messages = await Promise.all(
    response.data.messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        auth,
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value;

      return {
        id: detail.data.id!,
        threadId: detail.data.threadId!,
        labelIds: detail.data.labelIds,
        snippet: detail.data.snippet || '',
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To')?.split(',').map((e) => e.trim()),
        date: getHeader('Date'),
      };
    })
  );

  return messages;
}

export async function sendMessage(options: GmailSendOptions): Promise<string> {
  const auth = await getAuthClient();
  const gmail = getGmailClient();

  const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
  const cc = options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : '';
  const bcc = options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : '';

  const messageParts = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : '',
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: ${options.subject}`,
    options.isHtml ? 'Content-Type: text/html; charset=utf-8' : 'Content-Type: text/plain; charset=utf-8',
    '',
    options.body,
  ].filter(Boolean);

  const message = messageParts.join('\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    auth,
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  return response.data.id!;
}

export async function getMessage(messageId: string): Promise<GmailMessage> {
  const auth = await getAuthClient();
  const gmail = getGmailClient();

  const response = await gmail.users.messages.get({
    auth,
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const headers = response.data.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value;

  return {
    id: response.data.id!,
    threadId: response.data.threadId!,
    labelIds: response.data.labelIds,
    snippet: response.data.snippet || '',
    subject: getHeader('Subject'),
    from: getHeader('From'),
    to: getHeader('To')?.split(',').map((e) => e.trim()),
    date: getHeader('Date'),
  };
}
