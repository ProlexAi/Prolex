/**
 * Google Docs API Client
 * SECURITY: All operations validated and logged
 */

import { googleAuth } from '../auth/googleAuth.js';
import { journal } from '../logging/systemJournal.js';
import type { DocumentMetadata, DocumentContent, ValidationResult } from '../types/index.js';
import { docs_v1 } from 'googleapis';

/**
 * Google Docs Client with security controls
 */
export class DocsClient {
  private api: docs_v1.Docs | null = null;

  /**
   * Initialize the Docs API client
   */
  async initialize(): Promise<void> {
    if (!googleAuth.isReady()) {
      throw new Error('Google Auth not initialized');
    }

    // Validate required scopes
    const requiredScopes = ['https://www.googleapis.com/auth/documents'];
    const hasScopes = await googleAuth.validateScopes(requiredScopes);

    if (!hasScopes) {
      throw new Error('Insufficient scopes for Docs API');
    }

    this.api = googleAuth.getDocsAPI();
    journal.info('docs_client_initialized');
  }

  /**
   * SECURITY: Validate document ID format
   */
  private validateDocumentId(documentId: string): ValidationResult {
    // Google Document IDs are similar to spreadsheet IDs
    const validPattern = /^[a-zA-Z0-9_-]{40,50}$/;

    if (!validPattern.test(documentId)) {
      return {
        valid: false,
        error: 'Invalid document ID format',
      };
    }

    return { valid: true };
  }

  /**
   * SECURITY: Validate document title
   */
  private validateTitle(title: string): ValidationResult {
    if (!title || title.trim().length === 0) {
      return {
        valid: false,
        error: 'Document title cannot be empty',
      };
    }

    if (title.length > 255) {
      return {
        valid: false,
        error: 'Document title too long (max 255 characters)',
      };
    }

    return { valid: true };
  }

  /**
   * SECURITY: Validate content size
   */
  private validateContentSize(content: string): ValidationResult {
    const maxSize = 1024 * 1024 * 10; // 10MB

    if (content.length > maxSize) {
      return {
        valid: false,
        error: `Content exceeds maximum size (${maxSize} bytes)`,
      };
    }

    return { valid: true };
  }

  /**
   * Read document content
   */
  async readDoc(documentId: string, correlationId: string): Promise<DocumentContent> {
    if (!this.api) {
      throw new Error('Docs API not initialized');
    }

    // SECURITY: Validate document ID
    const validation = this.validateDocumentId(documentId);
    if (!validation.valid) {
      journal.security('docs_invalid_document_id', {
        correlationId,
        error: validation.error,
      });
      throw new Error(validation.error);
    }

    journal.apiCall('docs', 'read', {
      correlationId,
      documentId,
    });

    try {
      const response = await this.api.documents.get({
        documentId,
      });

      return {
        documentId: response.data.documentId!,
        title: response.data.title || '',
        body: {
          content: response.data.body?.content || [],
        },
      };
    } catch (error: any) {
      journal.error('docs_read_error', error, {
        correlationId,
        documentId,
        errorCode: error.code,
      });
      throw error;
    }
  }

  /**
   * Create a new document
   */
  async createDoc(params: { title: string }, correlationId: string): Promise<DocumentMetadata> {
    if (!this.api) {
      throw new Error('Docs API not initialized');
    }

    // SECURITY: Validate title
    const validation = this.validateTitle(params.title);
    if (!validation.valid) {
      journal.security('docs_invalid_title', {
        correlationId,
        error: validation.error,
      });
      throw new Error(validation.error);
    }

    journal.apiCall('docs', 'create', {
      correlationId,
      title: params.title,
    });

    try {
      const response = await this.api.documents.create({
        requestBody: {
          title: params.title,
        },
      });

      const metadata: DocumentMetadata = {
        documentId: response.data.documentId!,
        title: response.data.title || params.title,
        revisionId: response.data.revisionId || '',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
      };

      journal.info('docs_created', {
        correlationId,
        documentId: metadata.documentId,
        title: metadata.title,
      });

      return metadata;
    } catch (error: any) {
      journal.error('docs_create_error', error, {
        correlationId,
        title: params.title,
      });
      throw error;
    }
  }

  /**
   * Update document content
   * SECURITY: Uses batch update requests for safe modifications
   */
  async updateDoc(
    params: {
      documentId: string;
      requests: any[]; // Google Docs API batch update requests
    },
    correlationId: string
  ): Promise<{ replies: any[] }> {
    if (!this.api) {
      throw new Error('Docs API not initialized');
    }

    // SECURITY: Validate document ID
    const validation = this.validateDocumentId(params.documentId);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // SECURITY: Validate request count
    if (params.requests.length > 100) {
      journal.security('docs_too_many_requests', {
        correlationId,
        requestCount: params.requests.length,
      });
      throw new Error('Too many update requests (max 100 per batch)');
    }

    journal.apiCall('docs', 'update', {
      correlationId,
      documentId: params.documentId,
      requestCount: params.requests.length,
    });

    try {
      const response = await this.api.documents.batchUpdate({
        documentId: params.documentId,
        requestBody: {
          requests: params.requests,
        },
      });

      return {
        replies: response.data.replies || [],
      };
    } catch (error: any) {
      journal.error('docs_update_error', error, {
        correlationId,
        documentId: params.documentId,
      });
      throw error;
    }
  }

  /**
   * Insert text into document
   * Helper method for common operation
   */
  async insertText(
    params: {
      documentId: string;
      text: string;
      index?: number; // Position to insert (default: end of document)
    },
    correlationId: string
  ): Promise<{ replies: any[] }> {
    // SECURITY: Validate content size
    const contentValidation = this.validateContentSize(params.text);
    if (!contentValidation.valid) {
      journal.security('docs_content_too_large', {
        correlationId,
        size: params.text.length,
      });
      throw new Error(contentValidation.error);
    }

    const requests = [
      {
        insertText: {
          location: {
            index: params.index || 1, // 1 = end of document
          },
          text: params.text,
        },
      },
    ];

    return this.updateDoc({ documentId: params.documentId, requests }, correlationId);
  }

  /**
   * Get document metadata (without full content)
   */
  async getDocMetadata(documentId: string, correlationId: string): Promise<DocumentMetadata> {
    if (!this.api) {
      throw new Error('Docs API not initialized');
    }

    const validation = this.validateDocumentId(documentId);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      const response = await this.api.documents.get({
        documentId,
      });

      return {
        documentId: response.data.documentId!,
        title: response.data.title || '',
        revisionId: response.data.revisionId || '',
        createdTime: '', // Not available in API response
        modifiedTime: '', // Not available in API response
      };
    } catch (error: any) {
      journal.error('docs_metadata_error', error, {
        correlationId,
        documentId,
      });
      throw error;
    }
  }

  /**
   * Extract plain text from document
   * Helper method to get text content only
   */
  extractPlainText(documentContent: DocumentContent): string {
    const extractTextFromContent = (content: any[]): string => {
      let text = '';
      for (const element of content) {
        if (element.paragraph) {
          for (const paragraphElement of element.paragraph.elements || []) {
            if (paragraphElement.textRun) {
              text += paragraphElement.textRun.content || '';
            }
          }
        } else if (element.table) {
          // Extract text from tables
          for (const row of element.table.tableRows || []) {
            for (const cell of row.tableCells || []) {
              text += extractTextFromContent(cell.content || []);
            }
          }
        }
      }
      return text;
    };

    return extractTextFromContent(documentContent.body.content || []);
  }
}

/**
 * Singleton instance
 */
export const docsClient = new DocsClient();
