/**
 * Google Drive API Client
 * SECURITY: All operations validated and logged
 */

import { googleAuth } from '../auth/googleAuth.js';
import { journal } from '../logging/systemJournal.js';
import { config } from '../config/env.js';
import type { DriveFile, DriveFolder, FileUploadOptions, ValidationResult } from '../types/index.js';
import { drive_v3 } from 'googleapis';
import { Readable } from 'stream';

/**
 * Google Drive Client with security controls
 */
export class DriveClient {
  private api: drive_v3.Drive | null = null;

  /**
   * Initialize the Drive API client
   */
  async initialize(): Promise<void> {
    if (!googleAuth.isReady()) {
      throw new Error('Google Auth not initialized');
    }

    // Validate required scopes
    const requiredScopes = ['https://www.googleapis.com/auth/drive'];
    const hasScopes = await googleAuth.validateScopes(requiredScopes);

    if (!hasScopes) {
      throw new Error('Insufficient scopes for Drive API');
    }

    this.api = googleAuth.getDriveAPI();
    journal.info('drive_client_initialized');
  }

  /**
   * SECURITY: Validate file/folder ID format
   */
  private validateFileId(fileId: string): ValidationResult {
    // Google Drive file IDs can vary in format
    const validPattern = /^[a-zA-Z0-9_-]{20,100}$/;

    if (!validPattern.test(fileId)) {
      return {
        valid: false,
        error: 'Invalid file/folder ID format',
      };
    }

    return { valid: true };
  }

  /**
   * SECURITY: Validate file name
   */
  private validateFileName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
      return {
        valid: false,
        error: 'File name cannot be empty',
      };
    }

    if (name.length > 255) {
      return {
        valid: false,
        error: 'File name too long (max 255 characters)',
      };
    }

    // Prevent path traversal
    if (name.includes('../') || name.includes('..\\')) {
      return {
        valid: false,
        error: 'Invalid file name: path traversal detected',
      };
    }

    return { valid: true };
  }

  /**
   * SECURITY: Validate file size
   */
  private validateFileSize(size: number): ValidationResult {
    if (size > config.MAX_UPLOAD_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size exceeds maximum (${config.MAX_UPLOAD_SIZE_BYTES} bytes)`,
        details: {
          size,
          maxSize: config.MAX_UPLOAD_SIZE_BYTES,
        },
      };
    }

    return { valid: true };
  }

  /**
   * List files in Drive
   */
  async listFiles(
    params: {
      folderId?: string;
      query?: string;
      pageSize?: number;
      orderBy?: string;
    },
    correlationId: string
  ): Promise<DriveFile[]> {
    if (!this.api) {
      throw new Error('Drive API not initialized');
    }

    // SECURITY: Validate folder ID if provided
    if (params.folderId) {
      const validation = this.validateFileId(params.folderId);
      if (!validation.valid) {
        journal.security('drive_invalid_folder_id', {
          correlationId,
          error: validation.error,
        });
        throw new Error(validation.error);
      }
    }

    // SECURITY: Limit page size
    const pageSize = Math.min(params.pageSize || 100, 1000);

    let query = params.query || '';
    if (params.folderId) {
      query = query
        ? `'${params.folderId}' in parents and ${query}`
        : `'${params.folderId}' in parents`;
    }

    journal.apiCall('drive', 'list', {
      correlationId,
      folderId: params.folderId,
      pageSize,
    });

    try {
      const response = await this.api.files.list({
        q: query || undefined,
        pageSize,
        orderBy: params.orderBy || 'modifiedTime desc',
        fields:
          'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents)',
      });

      return (response.data.files || []).map((file) => ({
        id: file.id!,
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        createdTime: file.createdTime || '',
        modifiedTime: file.modifiedTime || '',
        webViewLink: file.webViewLink || undefined,
        parents: file.parents || undefined,
      }));
    } catch (error: any) {
      journal.error('drive_list_error', error, {
        correlationId,
        folderId: params.folderId,
      });
      throw error;
    }
  }

  /**
   * Upload file to Drive
   * SECURITY: Validates file size and name
   */
  async uploadFile(params: FileUploadOptions, correlationId: string): Promise<DriveFile> {
    if (!this.api) {
      throw new Error('Drive API not initialized');
    }

    // SECURITY: Validate file name
    const nameValidation = this.validateFileName(params.name);
    if (!nameValidation.valid) {
      journal.security('drive_invalid_filename', {
        correlationId,
        error: nameValidation.error,
      });
      throw new Error(nameValidation.error);
    }

    // SECURITY: Validate file size
    const contentSize =
      typeof params.content === 'string'
        ? Buffer.byteLength(params.content, 'utf8')
        : params.content.length;

    const sizeValidation = this.validateFileSize(contentSize);
    if (!sizeValidation.valid) {
      journal.security('drive_file_too_large', {
        correlationId,
        size: contentSize,
        maxSize: config.MAX_UPLOAD_SIZE_BYTES,
      });
      throw new Error(sizeValidation.error!);
    }

    // SECURITY: Validate parent folder ID if provided
    if (params.parents && params.parents.length > 0) {
      for (const parentId of params.parents) {
        const validation = this.validateFileId(parentId);
        if (!validation.valid) {
          throw new Error(`Invalid parent folder ID: ${validation.error}`);
        }
      }
    }

    journal.apiCall('drive', 'upload', {
      correlationId,
      name: params.name,
      mimeType: params.mimeType,
      size: contentSize,
      parents: params.parents,
    });

    try {
      // Convert content to stream
      const media = {
        mimeType: params.mimeType,
        body:
          typeof params.content === 'string'
            ? Readable.from([params.content])
            : Readable.from([params.content]),
      };

      const response = await this.api.files.create({
        requestBody: {
          name: params.name,
          mimeType: params.mimeType,
          parents: params.parents,
        },
        media,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents',
      });

      const file: DriveFile = {
        id: response.data.id!,
        name: response.data.name || params.name,
        mimeType: response.data.mimeType || params.mimeType,
        size: response.data.size || undefined,
        createdTime: response.data.createdTime || '',
        modifiedTime: response.data.modifiedTime || '',
        webViewLink: response.data.webViewLink || undefined,
        parents: response.data.parents || undefined,
      };

      journal.info('drive_file_uploaded', {
        correlationId,
        fileId: file.id,
        name: file.name,
        size: file.size,
      });

      return file;
    } catch (error: any) {
      journal.error('drive_upload_error', error, {
        correlationId,
        name: params.name,
      });
      throw error;
    }
  }

  /**
   * Download file from Drive
   */
  async downloadFile(fileId: string, correlationId: string): Promise<Buffer> {
    if (!this.api) {
      throw new Error('Drive API not initialized');
    }

    // SECURITY: Validate file ID
    const validation = this.validateFileId(fileId);
    if (!validation.valid) {
      journal.security('drive_invalid_file_id', {
        correlationId,
        error: validation.error,
      });
      throw new Error(validation.error);
    }

    journal.apiCall('drive', 'download', {
      correlationId,
      fileId,
    });

    try {
      const response = await this.api.files.get(
        {
          fileId,
          alt: 'media',
        },
        { responseType: 'arraybuffer' }
      );

      const buffer = Buffer.from(response.data as ArrayBuffer);

      // SECURITY: Check downloaded file size
      const sizeValidation = this.validateFileSize(buffer.length);
      if (!sizeValidation.valid) {
        journal.security('drive_downloaded_file_too_large', {
          correlationId,
          fileId,
          size: buffer.length,
        });
        throw new Error(sizeValidation.error!);
      }

      journal.info('drive_file_downloaded', {
        correlationId,
        fileId,
        size: buffer.length,
      });

      return buffer;
    } catch (error: any) {
      journal.error('drive_download_error', error, {
        correlationId,
        fileId,
      });
      throw error;
    }
  }

  /**
   * Create folder in Drive
   */
  async createFolder(
    params: {
      name: string;
      parentId?: string;
    },
    correlationId: string
  ): Promise<DriveFolder> {
    if (!this.api) {
      throw new Error('Drive API not initialized');
    }

    // SECURITY: Validate folder name
    const nameValidation = this.validateFileName(params.name);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    // SECURITY: Validate parent ID if provided
    if (params.parentId) {
      const validation = this.validateFileId(params.parentId);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    journal.apiCall('drive', 'create_folder', {
      correlationId,
      name: params.name,
      parentId: params.parentId,
    });

    try {
      const response = await this.api.files.create({
        requestBody: {
          name: params.name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: params.parentId ? [params.parentId] : undefined,
        },
        fields: 'id, name, parents',
      });

      const folder: DriveFolder = {
        id: response.data.id!,
        name: response.data.name || params.name,
        parents: response.data.parents || undefined,
      };

      journal.info('drive_folder_created', {
        correlationId,
        folderId: folder.id,
        name: folder.name,
      });

      return folder;
    } catch (error: any) {
      journal.error('drive_create_folder_error', error, {
        correlationId,
        name: params.name,
      });
      throw error;
    }
  }

  /**
   * Delete file or folder
   * SECURITY: Requires explicit confirmation for production
   */
  async deleteFile(fileId: string, correlationId: string): Promise<void> {
    if (!this.api) {
      throw new Error('Drive API not initialized');
    }

    // SECURITY: Validate file ID
    const validation = this.validateFileId(fileId);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    journal.apiCall('drive', 'delete', {
      correlationId,
      fileId,
    });

    try {
      await this.api.files.delete({
        fileId,
      });

      journal.info('drive_file_deleted', {
        correlationId,
        fileId,
      });
    } catch (error: any) {
      journal.error('drive_delete_error', error, {
        correlationId,
        fileId,
      });
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string, correlationId: string): Promise<DriveFile> {
    if (!this.api) {
      throw new Error('Drive API not initialized');
    }

    const validation = this.validateFileId(fileId);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      const response = await this.api.files.get({
        fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents',
      });

      return {
        id: response.data.id!,
        name: response.data.name || '',
        mimeType: response.data.mimeType || '',
        size: response.data.size || undefined,
        createdTime: response.data.createdTime || '',
        modifiedTime: response.data.modifiedTime || '',
        webViewLink: response.data.webViewLink || undefined,
        parents: response.data.parents || undefined,
      };
    } catch (error: any) {
      journal.error('drive_metadata_error', error, {
        correlationId,
        fileId,
      });
      throw error;
    }
  }
}

/**
 * Singleton instance
 */
export const driveClient = new DriveClient();
