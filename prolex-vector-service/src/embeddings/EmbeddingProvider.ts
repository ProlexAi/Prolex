/**
 * Interface abstraite pour les providers d'embeddings
 * Permet de facilement changer de modèle d'embedding (Mock, Claude, OpenAI, etc.)
 */
export interface EmbeddingProvider {
  /**
   * Génère un vecteur d'embedding pour un texte donné
   * @param text - Le texte à vectoriser
   * @returns Un tableau de nombres représentant l'embedding (dimension 1536)
   */
  getEmbedding(text: string): Promise<number[]>;

  /**
   * Génère des embeddings pour plusieurs textes en batch
   * @param texts - Les textes à vectoriser
   * @returns Un tableau d'embeddings
   */
  getEmbeddings(texts: string[]): Promise<number[][]>;

  /**
   * Retourne la dimension des vecteurs d'embedding
   */
  getDimension(): number;

  /**
   * Retourne le nom du modèle utilisé
   */
  getModelName(): string;
}
