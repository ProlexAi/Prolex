import { z } from 'zod';

// ============================================
// Database Types
// ============================================

export interface Collection {
  id: string;
  name: string;
  domain: string;
  type: string;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  collection_id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// API Request/Response Types
// ============================================

// Collection Creation
export const CreateCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().min(1).max(50),
  type: z.string().min(1).max(50),
  metadata: z.record(z.unknown()).optional().default({}),
});

export type CreateCollectionRequest = z.infer<typeof CreateCollectionSchema>;

// Document Creation
export const DocumentInputSchema = z.object({
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const CreateDocumentsSchema = z.object({
  collection: z.string().min(1),
  documents: z.array(DocumentInputSchema).min(1),
});

export type DocumentInput = z.infer<typeof DocumentInputSchema>;
export type CreateDocumentsRequest = z.infer<typeof CreateDocumentsSchema>;

// Search
export const SearchFilterSchema = z.object({
  domain: z.string().optional(),
  type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  client: z.string().optional(),
});

export const SearchRequestSchema = z.object({
  collection: z.string().min(1),
  query: z.string().min(1),
  topK: z.number().int().positive().optional().default(5),
  filter: SearchFilterSchema.optional(),
});

export type SearchFilter = z.infer<typeof SearchFilterSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

// Debug Stats
export interface CollectionStats {
  collection: string;
  documents_count: number;
  last_insert_at: Date | null;
  domains_detected: string[];
  types_detected: string[];
  top_tags: string[];
}

// ============================================
// Error Types
// ============================================

export enum ErrorCode {
  COLLECTION_NOT_FOUND = 'COLLECTION_NOT_FOUND',
  INVALID_FILTER = 'INVALID_FILTER',
  EMBEDDING_ERROR = 'EMBEDDING_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
}

export interface ApiError {
  error_code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================
// Preprocessing Types
// ============================================

export interface InferredMetadata {
  domain?: string;
  type?: string;
  tags?: string[];
}

export interface PreprocessInput {
  rawContent: string;
  source?: string;
}

// ============================================
// Configuration Types
// ============================================

export interface DatabaseConfig {
  connectionString: string;
  maxConnections?: number;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin?: string;
  logLevel: string;
}

export interface EmbeddingConfig {
  model: 'mock' | 'claude' | 'openai';
  apiKey?: string;
}
