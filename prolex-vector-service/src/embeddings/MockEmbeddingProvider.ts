import { EmbeddingProvider } from './EmbeddingProvider';

/**
 * Provider d'embeddings mock pour le développement
 * Génère des vecteurs pseudo-aléatoires mais déterministes basés sur le texte
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  private dimension: number;

  constructor(dimension: number = 1536) {
    this.dimension = dimension;
  }

  /**
   * Génère un embedding pseudo-aléatoire mais déterministe
   * Utilise un hash simple du texte comme seed
   */
  async getEmbedding(text: string): Promise<number[]> {
    // Hash simple du texte pour générer un seed
    const seed = this.hashString(text);

    // Génère un vecteur pseudo-aléatoire déterministe
    const embedding: number[] = [];
    let currentSeed = seed;

    for (let i = 0; i < this.dimension; i++) {
      // Linear Congruential Generator (LCG) pour pseudo-random déterministe
      currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
      // Normalise entre -1 et 1
      embedding.push((currentSeed / 0x7fffffff) * 2 - 1);
    }

    // Normalise le vecteur (norme L2 = 1)
    return this.normalize(embedding);
  }

  /**
   * Génère des embeddings pour plusieurs textes
   */
  async getEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.getEmbedding(text)));
  }

  getDimension(): number {
    return this.dimension;
  }

  getModelName(): string {
    return 'mock-embedding-v1';
  }

  /**
   * Hash simple d'une chaîne (djb2)
   */
  private hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash);
  }

  /**
   * Normalise un vecteur (norme L2 = 1)
   */
  private normalize(vector: number[]): number[] {
    const norm = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );

    if (norm === 0) {
      return vector;
    }

    return vector.map((val) => val / norm);
  }
}
