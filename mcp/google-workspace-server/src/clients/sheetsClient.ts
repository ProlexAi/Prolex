/**
 * Google Sheets API Client
 * SECURITY: All operations validated and logged
 */

import { googleAuth } from '../auth/googleAuth.js';
import { journal } from '../logging/systemJournal.js';
import type { SheetRange, SheetData, SpreadsheetMetadata, ValidationResult } from '../types/index.js';
import { sheets_v4 } from 'googleapis';

/**
 * Google Sheets Client with security controls
 */
export class SheetsClient {
  private api: sheets_v4.Sheets | null = null;

  /**
   * Initialize the Sheets API client
   */
  async initialize(): Promise<void> {
    if (!googleAuth.isReady()) {
      throw new Error('Google Auth not initialized');
    }

    // Validate required scopes
    const requiredScopes = ['https://www.googleapis.com/auth/spreadsheets'];
    const hasScopes = await googleAuth.validateScopes(requiredScopes);

    if (!hasScopes) {
      throw new Error('Insufficient scopes for Sheets API');
    }

    this.api = googleAuth.getSheetsAPI();
    journal.info('sheets_client_initialized');
  }

  /**
   * SECURITY: Validate spreadsheet ID format
   */
  private validateSpreadsheetId(spreadsheetId: string): ValidationResult {
    // Google Spreadsheet IDs are 44 characters long
    const validPattern = /^[a-zA-Z0-9_-]{40,50}$/;

    if (!validPattern.test(spreadsheetId)) {
      return {
        valid: false,
        error: 'Invalid spreadsheet ID format',
      };
    }

    return { valid: true };
  }

  /**
   * SECURITY: Validate A1 range notation
   */
  private validateRange(range: string): ValidationResult {
    // Basic A1 notation validation (e.g., "Sheet1!A1:D10" or "A1:D10")
    const validPattern = /^([a-zA-Z0-9_ ]+!)?[A-Z]+[0-9]+(:[A-Z]+[0-9]+)?$/;

    if (!validPattern.test(range)) {
      return {
        valid: false,
        error: 'Invalid A1 range notation',
      };
    }

    return { valid: true };
  }

  /**
   * SECURITY: Validate data size before write operations
   */
  private validateDataSize(data: any[][]): ValidationResult {
    const maxRows = 10000;
    const maxCols = 100;

    if (data.length > maxRows) {
      return {
        valid: false,
        error: `Data exceeds maximum row limit (${maxRows})`,
      };
    }

    for (const row of data) {
      if (row.length > maxCols) {
        return {
          valid: false,
          error: `Data exceeds maximum column limit (${maxCols})`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Read data from a spreadsheet range
   */
  async readSheet(params: SheetRange, correlationId: string): Promise<SheetData> {
    if (!this.api) {
      throw new Error('Sheets API not initialized');
    }

    // SECURITY: Validate inputs
    const spreadsheetIdValidation = this.validateSpreadsheetId(params.spreadsheetId);
    if (!spreadsheetIdValidation.valid) {
      journal.security('sheets_invalid_spreadsheet_id', {
        correlationId,
        error: spreadsheetIdValidation.error,
      });
      throw new Error(spreadsheetIdValidation.error);
    }

    const rangeValidation = this.validateRange(params.range);
    if (!rangeValidation.valid) {
      journal.security('sheets_invalid_range', {
        correlationId,
        error: rangeValidation.error,
      });
      throw new Error(rangeValidation.error);
    }

    journal.apiCall('sheets', 'read', {
      correlationId,
      spreadsheetId: params.spreadsheetId,
      range: params.range,
    });

    try {
      const response = await this.api.spreadsheets.values.get({
        spreadsheetId: params.spreadsheetId,
        range: params.range,
      });

      return {
        values: response.data.values || [],
      };
    } catch (error: any) {
      journal.error('sheets_read_error', error, {
        correlationId,
        spreadsheetId: params.spreadsheetId,
        range: params.range,
        errorCode: error.code,
      });
      throw error;
    }
  }

  /**
   * Write data to a spreadsheet range
   * SECURITY: Validates data size and permissions
   */
  async writeSheet(
    params: SheetRange & { data: any[][] },
    correlationId: string
  ): Promise<{ updatedCells: number }> {
    if (!this.api) {
      throw new Error('Sheets API not initialized');
    }

    // SECURITY: Validate inputs
    const spreadsheetIdValidation = this.validateSpreadsheetId(params.spreadsheetId);
    if (!spreadsheetIdValidation.valid) {
      throw new Error(spreadsheetIdValidation.error);
    }

    const rangeValidation = this.validateRange(params.range);
    if (!rangeValidation.valid) {
      throw new Error(rangeValidation.error);
    }

    const dataSizeValidation = this.validateDataSize(params.data);
    if (!dataSizeValidation.valid) {
      journal.security('sheets_data_size_exceeded', {
        correlationId,
        error: dataSizeValidation.error,
        rows: params.data.length,
      });
      throw new Error(dataSizeValidation.error);
    }

    journal.apiCall('sheets', 'write', {
      correlationId,
      spreadsheetId: params.spreadsheetId,
      range: params.range,
      rowCount: params.data.length,
      columnCount: params.data[0]?.length || 0,
    });

    try {
      const response = await this.api.spreadsheets.values.update({
        spreadsheetId: params.spreadsheetId,
        range: params.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: params.data,
        },
      });

      return {
        updatedCells: response.data.updatedCells || 0,
      };
    } catch (error: any) {
      journal.error('sheets_write_error', error, {
        correlationId,
        spreadsheetId: params.spreadsheetId,
        range: params.range,
      });
      throw error;
    }
  }

  /**
   * Append data to a spreadsheet
   */
  async appendSheet(
    params: { spreadsheetId: string; range: string; data: any[][] },
    correlationId: string
  ): Promise<{ updatedCells: number; updatedRange: string }> {
    if (!this.api) {
      throw new Error('Sheets API not initialized');
    }

    // SECURITY: Validate inputs
    const spreadsheetIdValidation = this.validateSpreadsheetId(params.spreadsheetId);
    if (!spreadsheetIdValidation.valid) {
      throw new Error(spreadsheetIdValidation.error);
    }

    const dataSizeValidation = this.validateDataSize(params.data);
    if (!dataSizeValidation.valid) {
      throw new Error(dataSizeValidation.error);
    }

    journal.apiCall('sheets', 'append', {
      correlationId,
      spreadsheetId: params.spreadsheetId,
      range: params.range,
      rowCount: params.data.length,
    });

    try {
      const response = await this.api.spreadsheets.values.append({
        spreadsheetId: params.spreadsheetId,
        range: params.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: params.data,
        },
      });

      return {
        updatedCells: response.data.updates?.updatedCells || 0,
        updatedRange: response.data.updates?.updatedRange || '',
      };
    } catch (error: any) {
      journal.error('sheets_append_error', error, {
        correlationId,
        spreadsheetId: params.spreadsheetId,
      });
      throw error;
    }
  }

  /**
   * Create a new spreadsheet
   */
  async createSpreadsheet(
    params: { title: string; sheetTitles?: string[] },
    correlationId: string
  ): Promise<SpreadsheetMetadata> {
    if (!this.api) {
      throw new Error('Sheets API not initialized');
    }

    // SECURITY: Validate title
    if (!params.title || params.title.trim().length === 0) {
      throw new Error('Spreadsheet title cannot be empty');
    }

    if (params.title.length > 255) {
      throw new Error('Spreadsheet title too long (max 255 characters)');
    }

    journal.apiCall('sheets', 'create', {
      correlationId,
      title: params.title,
      sheetCount: params.sheetTitles?.length || 1,
    });

    try {
      const sheets = params.sheetTitles?.map((title, index) => ({
        properties: {
          title,
          index,
        },
      })) || [{ properties: { title: 'Sheet1', index: 0 } }];

      const response = await this.api.spreadsheets.create({
        requestBody: {
          properties: {
            title: params.title,
          },
          sheets,
        },
      });

      const metadata: SpreadsheetMetadata = {
        spreadsheetId: response.data.spreadsheetId!,
        title: response.data.properties?.title || params.title,
        sheets:
          response.data.sheets?.map((sheet) => ({
            sheetId: sheet.properties?.sheetId || 0,
            title: sheet.properties?.title || '',
            index: sheet.properties?.index || 0,
            rowCount: sheet.properties?.gridProperties?.rowCount || 1000,
            columnCount: sheet.properties?.gridProperties?.columnCount || 26,
          })) || [],
      };

      journal.info('sheets_created', {
        correlationId,
        spreadsheetId: metadata.spreadsheetId,
        title: metadata.title,
      });

      return metadata;
    } catch (error: any) {
      journal.error('sheets_create_error', error, {
        correlationId,
        title: params.title,
      });
      throw error;
    }
  }

  /**
   * Get spreadsheet metadata
   */
  async getSpreadsheetMetadata(
    spreadsheetId: string,
    correlationId: string
  ): Promise<SpreadsheetMetadata> {
    if (!this.api) {
      throw new Error('Sheets API not initialized');
    }

    const validation = this.validateSpreadsheetId(spreadsheetId);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      const response = await this.api.spreadsheets.get({
        spreadsheetId,
      });

      return {
        spreadsheetId: response.data.spreadsheetId!,
        title: response.data.properties?.title || '',
        sheets:
          response.data.sheets?.map((sheet) => ({
            sheetId: sheet.properties?.sheetId || 0,
            title: sheet.properties?.title || '',
            index: sheet.properties?.index || 0,
            rowCount: sheet.properties?.gridProperties?.rowCount || 0,
            columnCount: sheet.properties?.gridProperties?.columnCount || 0,
          })) || [],
      };
    } catch (error: any) {
      journal.error('sheets_metadata_error', error, {
        correlationId,
        spreadsheetId,
      });
      throw error;
    }
  }
}

/**
 * Singleton instance
 */
export const sheetsClient = new SheetsClient();
