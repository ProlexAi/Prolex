/**
 * MCP Tools Registry for Google Workspace
 * All 12 tools with Zod validation and security controls
 */

import { z } from 'zod';
import { sheetsClient } from '../clients/sheetsClient.js';
import { docsClient } from '../clients/docsClient.js';
import { driveClient } from '../clients/driveClient.js';
import { journal } from '../logging/systemJournal.js';
import type { MCPToolResponse } from '../types/index.js';

// ============================================================
// GOOGLE SHEETS TOOLS (4 tools)
// ============================================================

/**
 * Tool: read_sheet
 * Read data from a Google Sheets range
 */
export const ReadSheetSchema = z.object({
  spreadsheetId: z.string().describe('The ID of the spreadsheet'),
  range: z.string().describe('A1 notation range (e.g., "Sheet1!A1:D10")'),
});

export async function readSheet(args: z.infer<typeof ReadSheetSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const data = await sheetsClient.readSheet(
      {
        spreadsheetId: args.spreadsheetId,
        range: args.range,
      },
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              spreadsheetId: args.spreadsheetId,
              range: args.range,
              values: data.values,
              rowCount: data.values.length,
              columnCount: data.values[0]?.length || 0,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('read_sheet_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error reading sheet: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/**
 * Tool: write_sheet
 * Write data to a Google Sheets range
 */
export const WriteSheetSchema = z.object({
  spreadsheetId: z.string().describe('The ID of the spreadsheet'),
  range: z.string().describe('A1 notation range (e.g., "Sheet1!A1")'),
  values: z.array(z.array(z.any())).describe('2D array of values to write'),
});

export async function writeSheet(args: z.infer<typeof WriteSheetSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const result = await sheetsClient.writeSheet(
      {
        spreadsheetId: args.spreadsheetId,
        range: args.range,
        data: args.values,
      },
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              spreadsheetId: args.spreadsheetId,
              range: args.range,
              updatedCells: result.updatedCells,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('write_sheet_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error writing sheet: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/**
 * Tool: append_sheet
 * Append data to a Google Sheets range
 */
export const AppendSheetSchema = z.object({
  spreadsheetId: z.string().describe('The ID of the spreadsheet'),
  range: z.string().describe('A1 notation range (e.g., "Sheet1!A1")'),
  values: z.array(z.array(z.any())).describe('2D array of values to append'),
});

export async function appendSheet(
  args: z.infer<typeof AppendSheetSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const result = await sheetsClient.appendSheet(
      {
        spreadsheetId: args.spreadsheetId,
        range: args.range,
        data: args.values,
      },
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              spreadsheetId: args.spreadsheetId,
              updatedCells: result.updatedCells,
              updatedRange: result.updatedRange,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('append_sheet_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error appending to sheet: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/**
 * Tool: create_spreadsheet
 * Create a new Google Spreadsheet
 */
export const CreateSpreadsheetSchema = z.object({
  title: z.string().describe('Title of the new spreadsheet'),
  sheetTitles: z.array(z.string()).optional().describe('Optional list of sheet names'),
});

export async function createSpreadsheet(
  args: z.infer<typeof CreateSpreadsheetSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const metadata = await sheetsClient.createSpreadsheet(
      {
        title: args.title,
        sheetTitles: args.sheetTitles,
      },
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              spreadsheetId: metadata.spreadsheetId,
              title: metadata.title,
              sheets: metadata.sheets,
              url: `https://docs.google.com/spreadsheets/d/${metadata.spreadsheetId}/edit`,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('create_spreadsheet_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error creating spreadsheet: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

// ============================================================
// GOOGLE DOCS TOOLS (4 tools)
// ============================================================

/**
 * Tool: read_doc
 * Read content from a Google Doc
 */
export const ReadDocSchema = z.object({
  documentId: z.string().describe('The ID of the document'),
  plainTextOnly: z.boolean().optional().default(false).describe('Extract plain text only'),
});

export async function readDoc(args: z.infer<typeof ReadDocSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const doc = await docsClient.readDoc(args.documentId, correlationId);

    let text: string;
    if (args.plainTextOnly) {
      text = docsClient.extractPlainText(doc);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                documentId: doc.documentId,
                title: doc.title,
                plainText: text,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              documentId: doc.documentId,
              title: doc.title,
              body: doc.body,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('read_doc_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error reading document: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/**
 * Tool: create_doc
 * Create a new Google Doc
 */
export const CreateDocSchema = z.object({
  title: z.string().describe('Title of the new document'),
});

export async function createDoc(args: z.infer<typeof CreateDocSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const metadata = await docsClient.createDoc({ title: args.title }, correlationId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              documentId: metadata.documentId,
              title: metadata.title,
              url: `https://docs.google.com/document/d/${metadata.documentId}/edit`,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('create_doc_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error creating document: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/**
 * Tool: insert_text_doc
 * Insert text into a Google Doc
 */
export const InsertTextDocSchema = z.object({
  documentId: z.string().describe('The ID of the document'),
  text: z.string().describe('Text to insert'),
  index: z.number().optional().describe('Position to insert (default: end of document)'),
});

export async function insertTextDoc(
  args: z.infer<typeof InsertTextDocSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    await docsClient.insertText(
      {
        documentId: args.documentId,
        text: args.text,
        index: args.index,
      },
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              documentId: args.documentId,
              inserted: true,
              textLength: args.text.length,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('insert_text_doc_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error inserting text: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/**
 * Tool: update_doc
 * Batch update a Google Doc
 */
export const UpdateDocSchema = z.object({
  documentId: z.string().describe('The ID of the document'),
  requests: z.array(z.any()).describe('Array of batch update requests'),
});

export async function updateDoc(args: z.infer<typeof UpdateDocSchema>): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const result = await docsClient.updateDoc(
      {
        documentId: args.documentId,
        requests: args.requests,
      },
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              documentId: args.documentId,
              requestCount: args.requests.length,
              replies: result.replies,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('update_doc_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error updating document: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

// ============================================================
// GOOGLE DRIVE TOOLS (4 tools)
// ============================================================

/**
 * Tool: list_drive_files
 * List files in Google Drive
 */
export const ListDriveFilesSchema = z.object({
  folderId: z.string().optional().describe('Optional folder ID to list files from'),
  query: z.string().optional().describe('Optional search query'),
  maxResults: z.number().int().positive().max(1000).optional().default(100).describe('Max number of results'),
});

export async function listDriveFiles(
  args: z.infer<typeof ListDriveFilesSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const files = await driveClient.listFiles(
      {
        folderId: args.folderId,
        query: args.query,
        pageSize: args.maxResults,
      },
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              fileCount: files.length,
              files: files.map((f) => ({
                id: f.id,
                name: f.name,
                mimeType: f.mimeType,
                size: f.size,
                modifiedTime: f.modifiedTime,
                webViewLink: f.webViewLink,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('list_drive_files_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error listing files: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/**
 * Tool: upload_drive_file
 * Upload a file to Google Drive
 */
export const UploadDriveFileSchema = z.object({
  name: z.string().describe('File name'),
  content: z.string().describe('File content (text or base64)'),
  mimeType: z.string().describe('MIME type (e.g., "text/plain", "application/json")'),
  parentFolderId: z.string().optional().describe('Optional parent folder ID'),
});

export async function uploadDriveFile(
  args: z.infer<typeof UploadDriveFileSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const file = await driveClient.uploadFile(
      {
        name: args.name,
        content: args.content,
        mimeType: args.mimeType,
        parents: args.parentFolderId ? [args.parentFolderId] : undefined,
      },
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              fileId: file.id,
              name: file.name,
              mimeType: file.mimeType,
              size: file.size,
              webViewLink: file.webViewLink,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('upload_drive_file_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error uploading file: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/**
 * Tool: download_drive_file
 * Download a file from Google Drive
 */
export const DownloadDriveFileSchema = z.object({
  fileId: z.string().describe('The ID of the file to download'),
});

export async function downloadDriveFile(
  args: z.infer<typeof DownloadDriveFileSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const buffer = await driveClient.downloadFile(args.fileId, correlationId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              fileId: args.fileId,
              size: buffer.length,
              content: buffer.toString('base64'),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('download_drive_file_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error downloading file: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

/**
 * Tool: create_drive_folder
 * Create a folder in Google Drive
 */
export const CreateDriveFolderSchema = z.object({
  name: z.string().describe('Folder name'),
  parentFolderId: z.string().optional().describe('Optional parent folder ID'),
});

export async function createDriveFolder(
  args: z.infer<typeof CreateDriveFolderSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  try {
    const folder = await driveClient.createFolder(
      {
        name: args.name,
        parentId: args.parentFolderId,
      },
      correlationId
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              folderId: folder.id,
              name: folder.name,
              parents: folder.parents,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    journal.error('create_drive_folder_tool_error', error as Error, { correlationId });
    return {
      content: [{ type: 'text', text: `Error creating folder: ${(error as Error).message}` }],
      isError: true,
    };
  }
}
