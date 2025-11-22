/**
 * TypeScript type definitions for Google Workspace MCP Server
 */

/**
 * MCP Tool Response format
 */
export interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Google Sheets types
 */
export interface SheetRange {
  spreadsheetId: string;
  range: string; // A1 notation (e.g., "Sheet1!A1:D10")
}

export interface SheetData {
  values: any[][];
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: Array<{
    sheetId: number;
    title: string;
    index: number;
    rowCount: number;
    columnCount: number;
  }>;
}

/**
 * Google Docs types
 */
export interface DocumentMetadata {
  documentId: string;
  title: string;
  revisionId: string;
  createdTime: string;
  modifiedTime: string;
}

export interface DocumentContent {
  documentId: string;
  title: string;
  body: {
    content: any[];
  };
}

/**
 * Google Drive types
 */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  parents?: string[];
}

export interface FileUploadOptions {
  name: string;
  mimeType: string;
  parents?: string[];
  content: Buffer | string;
}

/**
 * Security validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * API operation metadata for audit logging
 */
export interface OperationMetadata {
  correlationId: string;
  operation: string;
  resource: string;
  timestamp: string;
  userId?: string;
}
