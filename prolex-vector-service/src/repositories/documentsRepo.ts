import { query, queryOne } from '../db';
import {
  Document,
  SearchFilter,
  SearchResult,
  ErrorCode,
  CollectionStats,
} from '../types';

/**
 * Repository pour la gestion des documents
 */
export class DocumentsRepository {
  /**
   * Crée un nouveau document
   */
  async create(
    collectionId: string,
    content: string,
    metadata: Record<string, unknown>,
    embedding: number[]
  ): Promise<Document> {
    const sql = `
      INSERT INTO documents (collection_id, content, metadata, embedding)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await queryOne<Document>(sql, [
      collectionId,
      content,
      JSON.stringify(metadata),
      `[${embedding.join(',')}]`, // Format PostgreSQL array
    ]);

    if (!result) {
      throw {
        error_code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to create document',
      };
    }

    return result;
  }

  /**
   * Recherche sémantique par similarité cosinus
   */
  async searchSimilar(
    collectionId: string,
    queryEmbedding: number[],
    topK: number,
    filter?: SearchFilter
  ): Promise<SearchResult[]> {
    // Construction de la clause WHERE dynamique pour les filtres
    const whereClauses: string[] = ['d.collection_id = $1'];
    const params: any[] = [collectionId, `[${queryEmbedding.join(',')}]`, topK];
    let paramIndex = 4;

    if (filter?.domain) {
      whereClauses.push(`c.domain = $${paramIndex}`);
      params.push(filter.domain);
      paramIndex++;
    }

    if (filter?.type) {
      whereClauses.push(`c.type = $${paramIndex}`);
      params.push(filter.type);
      paramIndex++;
    }

    if (filter?.tags && filter.tags.length > 0) {
      whereClauses.push(`d.metadata->'tags' ?| $${paramIndex}`);
      params.push(filter.tags);
      paramIndex++;
    }

    if (filter?.client) {
      whereClauses.push(`d.metadata->>'client' = $${paramIndex}`);
      params.push(filter.client);
      paramIndex++;
    }

    const whereClause = whereClauses.join(' AND ');

    const sql = `
      SELECT
        d.id,
        d.content,
        d.metadata,
        1 - (d.embedding <=> $2::vector) AS score
      FROM documents d
      JOIN collections c ON d.collection_id = c.id
      WHERE ${whereClause}
      ORDER BY d.embedding <=> $2::vector
      LIMIT $3
    `;

    const results = await query<SearchResult>(sql, params);
    return results;
  }

  /**
   * Récupère un document par son ID
   */
  async findById(id: string): Promise<Document | null> {
    const sql = `
      SELECT * FROM documents
      WHERE id = $1
    `;

    return await queryOne<Document>(sql, [id]);
  }

  /**
   * Supprime un document par son ID
   */
  async delete(id: string): Promise<void> {
    const sql = `
      DELETE FROM documents
      WHERE id = $1
    `;

    await query(sql, [id]);
  }

  /**
   * Compte le nombre de documents dans une collection
   */
  async countByCollection(collectionId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM documents
      WHERE collection_id = $1
    `;

    const result = await queryOne<{ count: string }>(sql, [collectionId]);
    return result ? parseInt(result.count, 10) : 0;
  }

  /**
   * Récupère des statistiques sur une collection
   */
  async getCollectionStats(collectionName: string): Promise<CollectionStats | null> {
    const sql = `
      SELECT
        c.name as collection,
        COUNT(d.id) as documents_count,
        MAX(d.created_at) as last_insert_at,
        ARRAY_AGG(DISTINCT c.domain) FILTER (WHERE c.domain IS NOT NULL) as domains_detected,
        ARRAY_AGG(DISTINCT c.type) FILTER (WHERE c.type IS NOT NULL) as types_detected,
        (
          SELECT ARRAY_AGG(DISTINCT tag)
          FROM documents d2
          CROSS JOIN LATERAL jsonb_array_elements_text(d2.metadata->'tags') as tag
          WHERE d2.collection_id = c.id
          LIMIT 20
        ) as top_tags
      FROM collections c
      LEFT JOIN documents d ON c.id = d.collection_id
      WHERE c.name = $1
      GROUP BY c.id, c.name
    `;

    const result = await queryOne<any>(sql, [collectionName]);

    if (!result) {
      return null;
    }

    return {
      collection: result.collection,
      documents_count: parseInt(result.documents_count, 10),
      last_insert_at: result.last_insert_at ? new Date(result.last_insert_at) : null,
      domains_detected: result.domains_detected || [],
      types_detected: result.types_detected || [],
      top_tags: result.top_tags || [],
    };
  }

  /**
   * Récupère tous les documents d'une collection (pour debug)
   */
  async findByCollection(
    collectionId: string,
    limit: number = 100
  ): Promise<Document[]> {
    const sql = `
      SELECT * FROM documents
      WHERE collection_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    return await query<Document>(sql, [collectionId, limit]);
  }
}
