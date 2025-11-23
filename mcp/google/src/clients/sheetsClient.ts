/**
 * Client Google Sheets
 * Lecture, écriture, et gestion de feuilles de calcul Google
 */

import { google, type sheets_v4 } from 'googleapis';
import { getAuthClient } from './authClient.js';
import type { SheetRange, SheetValue, SheetAppendOptions } from '../types/index.js';

let sheetsClient: sheets_v4.Sheets | null = null;

export function getSheetsClient(): sheets_v4.Sheets {
  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: 'v4' });
  }
  return sheetsClient;
}

/**
 * Lire des valeurs dans une feuille
 */
export async function readSheet(params: SheetRange): Promise<string[][]> {
  const auth = await getAuthClient();
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: params.spreadsheetId,
    range: params.range,
  });

  return response.data.values || [];
}

/**
 * Écrire des valeurs dans une feuille (écrase les données existantes)
 */
export async function writeSheet(
  params: SheetRange & { values: string[][] }
): Promise<void> {
  const auth = await getAuthClient();
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    auth,
    spreadsheetId: params.spreadsheetId,
    range: params.range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: params.values,
    },
  });
}

/**
 * Ajouter des valeurs à la fin d'une feuille
 */
export async function appendSheet(
  params: SheetRange & { values: string[][]; options?: SheetAppendOptions }
): Promise<void> {
  const auth = await getAuthClient();
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    auth,
    spreadsheetId: params.spreadsheetId,
    range: params.range,
    valueInputOption: params.options?.valueInputOption || 'USER_ENTERED',
    insertDataOption: params.options?.insertDataOption || 'INSERT_ROWS',
    requestBody: {
      values: params.values,
    },
  });
}

/**
 * Créer une nouvelle feuille dans un spreadsheet
 */
export async function createSheet(
  spreadsheetId: string,
  sheetTitle: string
): Promise<number> {
  const auth = await getAuthClient();
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.batchUpdate({
    auth,
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetTitle,
            },
          },
        },
      ],
    },
  });

  const sheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;
  if (sheetId === undefined) {
    throw new Error('Failed to create sheet: no sheetId returned');
  }

  return sheetId;
}

/**
 * Supprimer une feuille
 */
export async function deleteSheet(
  spreadsheetId: string,
  sheetId: number
): Promise<void> {
  const auth = await getAuthClient();
  const sheets = getSheetsClient();

  await sheets.spreadsheets.batchUpdate({
    auth,
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteSheet: {
            sheetId,
          },
        },
      ],
    },
  });
}

/**
 * Obtenir les métadonnées d'un spreadsheet
 */
export async function getSpreadsheetMetadata(spreadsheetId: string) {
  const auth = await getAuthClient();
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  return {
    title: response.data.properties?.title || '',
    sheets: response.data.sheets?.map((sheet) => ({
      sheetId: sheet.properties?.sheetId,
      title: sheet.properties?.title || '',
      index: sheet.properties?.index,
      rowCount: sheet.properties?.gridProperties?.rowCount,
      columnCount: sheet.properties?.gridProperties?.columnCount,
    })) || [],
  };
}
