import { query, queryOne } from '../db';
import { Collection, CreateCollectionRequest, ErrorCode } from '../types';

/**
 * Repository pour la gestion des collections
 */
export class CollectionsRepository {
  /**
   * Crée une nouvelle collection
   */
  async create(data: CreateCollectionRequest): Promise<Collection> {
    // Vérifie si une collection avec ce nom existe déjà
    const existing = await this.findByName(data.name);
    if (existing) {
      throw {
        error_code: ErrorCode.VALIDATION_ERROR,
        message: `Collection '${data.name}' already exists`,
      };
    }

    const sql = `
      INSERT INTO collections (name, domain, type, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await queryOne<Collection>(sql, [
      data.name,
      data.domain,
      data.type,
      JSON.stringify(data.metadata || {}),
    ]);

    if (!result) {
      throw {
        error_code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to create collection',
      };
    }

    return result;
  }

  /**
   * Récupère toutes les collections
   */
  async findAll(): Promise<Collection[]> {
    const sql = `
      SELECT * FROM collections
      ORDER BY created_at DESC
    `;

    return await query<Collection>(sql);
  }

  /**
   * Récupère une collection par son nom
   */
  async findByName(name: string): Promise<Collection | null> {
    const sql = `
      SELECT * FROM collections
      WHERE name = $1
    `;

    return await queryOne<Collection>(sql, [name]);
  }

  /**
   * Récupère une collection par son ID
   */
  async findById(id: string): Promise<Collection | null> {
    const sql = `
      SELECT * FROM collections
      WHERE id = $1
    `;

    return await queryOne<Collection>(sql, [id]);
  }

  /**
   * Supprime une collection (et tous ses documents via CASCADE)
   */
  async delete(name: string): Promise<void> {
    const sql = `
      DELETE FROM collections
      WHERE name = $1
    `;

    await query(sql, [name]);
  }

  /**
   * Met à jour les métadonnées d'une collection
   */
  async updateMetadata(
    name: string,
    metadata: Record<string, unknown>
  ): Promise<Collection> {
    const sql = `
      UPDATE collections
      SET metadata = $2, updated_at = NOW()
      WHERE name = $1
      RETURNING *
    `;

    const result = await queryOne<Collection>(sql, [
      name,
      JSON.stringify(metadata),
    ]);

    if (!result) {
      throw {
        error_code: ErrorCode.COLLECTION_NOT_FOUND,
        message: `Collection '${name}' not found`,
      };
    }

    return result;
  }
}
