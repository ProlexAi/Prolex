/**
 * MCP Tools: Google Drive
 */

import { z } from 'zod';
import * as driveClient from '../../clients/driveClient.js';
import type { MCPToolResponse } from '../../types/index.js';

export const DriveListSchema = z.object({
  query: z.string().optional().describe('Requête de recherche Drive'),
  folderId: z.string().optional().describe('ID du dossier parent'),
  maxResults: z.number().optional().default(100).describe('Nombre max de résultats'),
});

export const DriveUploadSchema = z.object({
  filename: z.string().describe('Nom du fichier'),
  content: z.string().describe('Contenu du fichier (base64 ou texte)'),
  folderId: z.string().optional().describe('ID du dossier de destination'),
  mimeType: z.string().optional().describe('Type MIME du fichier'),
});

export const DriveDeleteSchema = z.object({
  fileId: z.string().describe('ID du fichier à supprimer'),
});

export async function driveList(args: z.infer<typeof DriveListSchema>): Promise<MCPToolResponse> {
  try {
    const files = await driveClient.listFiles(args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            fileCount: files.length,
            files: files.map((f) => ({
              id: f.id,
              name: f.name,
              mimeType: f.mimeType,
              size: f.size,
              webViewLink: f.webViewLink,
            })),
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Drive list: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

export async function driveUpload(args: z.infer<typeof DriveUploadSchema>): Promise<MCPToolResponse> {
  try {
    const content = args.content.startsWith('data:')
      ? Buffer.from(args.content.split(',')[1], 'base64')
      : args.content;

    const file = await driveClient.uploadFile(args.filename, content, {
      folderId: args.folderId,
      mimeType: args.mimeType,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ Fichier "${args.filename}" uploadé`,
            fileId: file.id,
            webViewLink: file.webViewLink,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Drive upload: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

export async function driveDelete(args: z.infer<typeof DriveDeleteSchema>): Promise<MCPToolResponse> {
  try {
    await driveClient.deleteFile(args.fileId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ Fichier ${args.fileId} supprimé`,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Drive delete: ${(error as Error).message}` }],
      isError: true,
    };
  }
}
