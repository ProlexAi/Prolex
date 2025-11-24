/**
 * Types pour les outils Kimmy Tools Pack
 *
 * Ce fichier définit les interfaces TypeScript pour les entrées et sorties
 * de chaque outil exposé via MCP.
 */

// ========================================
// TOOL 1: audio_to_text
// ========================================

/**
 * Arguments pour l'outil audio_to_text
 */
export interface AudioToTextInput {
  /** Chemin vers le fichier audio à transcrire */
  audioPath: string;
  /** Langue cible (optionnel, par défaut: fr) */
  targetLanguage?: string;
}

/**
 * Résultat de l'outil audio_to_text
 */
export interface AudioToTextOutput {
  /** Transcription brute directe de Whisper */
  raw_transcript: string;
  /** Transcription nettoyée (ponctuation, casse, etc.) */
  cleaned_transcript: string;
  /** Langue détectée dans l'audio */
  language_detected: string;
  /** Durée de l'audio en secondes */
  duration_seconds: number;
}

// ========================================
// TOOL 2: preprocess_text
// ========================================

/**
 * Arguments pour l'outil preprocess_text
 */
export interface PreprocessTextInput {
  /** Texte à prétraiter */
  text: string;
}

/**
 * Résultat de l'outil preprocess_text
 */
export interface PreprocessTextOutput {
  /** Texte nettoyé (sans caractères spéciaux inutiles, normalisé) */
  clean_text: string;
  /** Liste des phrases extraites */
  sentences: string[];
  /** Métadonnées sur le texte traité */
  metadata: {
    /** Nombre de caractères du texte nettoyé */
    length_chars: number;
    /** Langue détectée (ex: fr, en, etc.) */
    language_detected: string;
  };
}

// ========================================
// TOOL 3: structure_output
// ========================================

/**
 * Arguments pour l'outil structure_output
 */
export interface StructureOutputInput {
  /** Texte produit par Kimmy à structurer */
  text_from_kimmy: string;
}

/**
 * Résultat de l'outil structure_output
 */
export interface StructureOutputOutput {
  /** Résumé concis du texte (1-2 phrases) */
  summary: string;
  /** Intention détectée (question, commande, information, etc.) */
  intent: string;
  /** Entités clés extraites (noms, dates, lieux, etc.) */
  key_entities: string[];
  /** Actions proposées à effectuer */
  actions_proposees: string[];
  /** Contraintes ou conditions identifiées */
  constraints: string[];
  /** Texte brut d'origine pour référence */
  raw_text: string;
}

// ========================================
// TYPES GÉNÉRIQUES
// ========================================

/**
 * Configuration globale du serveur MCP
 */
export interface KimmyMcpConfig {
  /** Chemin vers kimmy-tools-pack */
  kimmyToolsPath: string;
  /** Clé API Whisper */
  whisperApiKey: string | undefined;
  /** Langue par défaut */
  defaultLanguage: string;
  /** Mode de fonctionnement (stub ou real) */
  mode: 'stub' | 'real';
}

/**
 * Erreur métier des outils Kimmy
 */
export class KimmyToolError extends Error {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'KimmyToolError';
  }
}
