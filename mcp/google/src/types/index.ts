/**
 * Types communs pour MCP Google
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export type MCPToolResponse = CallToolResult;

export interface GoogleCredentials {
  type: 'service_account';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// ============================================================
// GOOGLE SHEETS
// ============================================================

export interface SheetRange {
  spreadsheetId: string;
  range: string; // Format: "Sheet1!A1:B10"
}

export interface SheetValue {
  [key: string]: string | number | boolean | null;
}

export interface SheetAppendOptions {
  valueInputOption?: 'RAW' | 'USER_ENTERED';
  insertDataOption?: 'OVERWRITE' | 'INSERT_ROWS';
}

// ============================================================
// GOOGLE DRIVE
// ============================================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  parents?: string[];
}

export interface DriveUploadOptions {
  folderId?: string;
  mimeType?: string;
  description?: string;
}

export interface DriveSearchOptions {
  query?: string;
  mimeType?: string;
  folderId?: string;
  maxResults?: number;
  orderBy?: string;
}

// ============================================================
// GOOGLE CALENDAR
// ============================================================

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string; // ISO 8601
    date?: string; // YYYY-MM-DD (all-day events)
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  location?: string;
  colorId?: string;
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface CalendarListOptions {
  timeMin?: string; // ISO 8601
  timeMax?: string; // ISO 8601
  maxResults?: number;
  orderBy?: 'startTime' | 'updated';
  singleEvents?: boolean;
}

// ============================================================
// GMAIL
// ============================================================

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  subject?: string;
  from?: string;
  to?: string[];
  cc?: string[];
  date?: string;
  body?: {
    text?: string;
    html?: string;
  };
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }>;
}

export interface GmailSendOptions {
  to: string | string[];
  subject: string;
  body: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    mimeType?: string;
  }>;
  isHtml?: boolean;
}

export interface GmailSearchOptions {
  query?: string; // Gmail search syntax
  maxResults?: number;
  labelIds?: string[];
  includeSpamTrash?: boolean;
}

// ============================================================
// GOOGLE TASKS
// ============================================================

export interface GoogleTask {
  id?: string;
  title: string;
  notes?: string;
  status?: 'needsAction' | 'completed';
  due?: string; // RFC 3339 timestamp
  completed?: string; // RFC 3339 timestamp
  parent?: string; // Parent task ID (for subtasks)
  position?: string;
  links?: Array<{
    type: string;
    description: string;
    link: string;
  }>;
}

export interface TaskListOptions {
  maxResults?: number;
  showCompleted?: boolean;
  showHidden?: boolean;
  dueMin?: string; // RFC 3339 timestamp
  dueMax?: string; // RFC 3339 timestamp
}

// ============================================================
// ERROR TYPES
// ============================================================

export class GoogleAPIError extends Error {
  constructor(
    message: string,
    public service: string,
    public operation: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GoogleAPIError';
  }
}

export class GoogleAuthError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'GoogleAuthError';
  }
}

export class GoogleQuotaError extends Error {
  constructor(
    message: string,
    public service: string,
    public quotaType: string
  ) {
    super(message);
    this.name = 'GoogleQuotaError';
  }
}
