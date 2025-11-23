/**
 * MCP Tools: Google Sheets
 */

import { z } from 'zod';
import * as sheetsClient from '../../clients/sheetsClient.js';
import type { MCPToolResponse } from '../../types/index.js';

// ============================================================
// SCHEMAS
// ============================================================

export const SheetsReadSchema = z.object({
  spreadsheetId: z.string().describe('ID du spreadsheet Google Sheets'),
  range: z.string().describe('Plage de cellules (ex: "Sheet1!A1:C10")'),
});

export const SheetsWriteSchema = z.object({
  spreadsheetId: z.string().describe('ID du spreadsheet'),
  range: z.string().describe('Plage de cellules'),
  values: z.array(z.array(z.string())).describe('Tableau 2D de valeurs à écrire'),
});

export const SheetsAppendSchema = z.object({
  spreadsheetId: z.string().describe('ID du spreadsheet'),
  range: z.string().describe('Plage de départ (ex: "Sheet1!A1")'),
  values: z.array(z.array(z.string())).describe('Valeurs à ajouter'),
});

export const SheetsCreateSchema = z.object({
  spreadsheetId: z.string().describe('ID du spreadsheet'),
  sheetTitle: z.string().describe('Nom de la nouvelle feuille'),
});

// ============================================================
// TOOLS
// ============================================================

export async function sheetsRead(args: z.infer<typeof SheetsReadSchema>): Promise<MCPToolResponse> {
  try {
    const values = await sheetsClient.readSheet(args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            spreadsheetId: args.spreadsheetId,
            range: args.range,
            rowCount: values.length,
            columnCount: values[0]?.length || 0,
            values,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Erreur lecture Sheets: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function sheetsWrite(args: z.infer<typeof SheetsWriteSchema>): Promise<MCPToolResponse> {
  try {
    await sheetsClient.writeSheet(args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ ${args.values.length} lignes écrites dans ${args.range}`,
            spreadsheetId: args.spreadsheetId,
            range: args.range,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Erreur écriture Sheets: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function sheetsAppend(args: z.infer<typeof SheetsAppendSchema>): Promise<MCPToolResponse> {
  try {
    await sheetsClient.appendSheet(args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ ${args.values.length} lignes ajoutées à ${args.range}`,
            spreadsheetId: args.spreadsheetId,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Erreur ajout Sheets: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function sheetsCreate(args: z.infer<typeof SheetsCreateSchema>): Promise<MCPToolResponse> {
  try {
    const sheetId = await sheetsClient.createSheet(args.spreadsheetId, args.sheetTitle);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ Feuille "${args.sheetTitle}" créée`,
            sheetId,
            spreadsheetId: args.spreadsheetId,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Erreur création feuille: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
