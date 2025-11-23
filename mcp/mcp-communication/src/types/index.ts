/**
 * Types pour le MCP Communication
 * Structures de données pour Email, SMS, WhatsApp, Slack, Telegram
 */

// ============================================================
// Types de base MCP
// ============================================================

export interface MCPToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

// ============================================================
// Canaux de communication
// ============================================================

export type CanalCommunication = 'email' | 'sms' | 'whatsapp' | 'slack' | 'telegram';

export type StatutMessage = 'envoye' | 'en_attente' | 'livre' | 'lu' | 'echoue' | 'rejete';

// ============================================================
// EMAIL
// ============================================================

export interface Email {
  id?: string;
  de: string;
  a: string | string[];
  cc?: string[];
  cci?: string[];
  sujet: string;
  corps: string;
  html?: string;
  pieceJointes?: PieceJointe[];
  priorite?: 'basse' | 'normale' | 'haute';
  repondreA?: string;
  statut?: StatutMessage;
  dateEnvoi?: string;
  dateLecture?: string;
}

export interface PieceJointe {
  nom: string;
  contenu: string; // Base64
  type: string; // MIME type
  taille: number; // bytes
}

export interface FiltreEmail {
  de?: string;
  objet?: string;
  nonLu?: boolean;
  depuis?: string; // date ISO
  etiquettes?: string[];
  limite?: number;
}

// ============================================================
// SMS
// ============================================================

export interface SMS {
  id?: string;
  de: string;
  a: string;
  message: string;
  statut?: StatutMessage;
  dateEnvoi?: string;
  dateLivraison?: string;
  cout?: number;
  segmentsUtilises?: number;
}

export interface SMSProgramme {
  id: string;
  a: string;
  message: string;
  dateEnvoiPrevue: string;
  statut: 'programme' | 'envoye' | 'annule';
}

// ============================================================
// WhatsApp
// ============================================================

export interface MessageWhatsApp {
  id?: string;
  de: string;
  a: string;
  message?: string;
  media?: MediaWhatsApp;
  statut?: StatutMessage;
  dateEnvoi?: string;
  dateLivraison?: string;
  dateLecture?: string;
}

export interface MediaWhatsApp {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  legende?: string;
}

// ============================================================
// Slack
// ============================================================

export interface MessageSlack {
  id?: string;
  canal: string; // #general, @username, ou ID
  message: string;
  blocs?: any[]; // Slack Block Kit
  fichiers?: {
    titre?: string;
    contenu: string;
    nom: string;
  }[];
  thread?: string; // Thread timestamp pour réponses
  mentionner?: string[]; // @user IDs ou @channel
  statut?: StatutMessage;
  dateEnvoi?: string;
  reactions?: string[];
}

export interface CanalSlack {
  id: string;
  nom: string;
  estPrive: boolean;
  nombreMembres: number;
  description?: string;
}

// ============================================================
// Telegram
// ============================================================

export interface MessageTelegram {
  id?: number;
  chatId: string | number;
  message?: string;
  parseMode?: 'Markdown' | 'HTML';
  photo?: string; // URL ou file_id
  document?: string;
  video?: string;
  audio?: string;
  boutons?: BoutonTelegram[][];
  reponseA?: number; // message_id
  statut?: StatutMessage;
  dateEnvoi?: string;
}

export interface BoutonTelegram {
  texte: string;
  url?: string;
  callbackData?: string;
}

// ============================================================
// Sécurité
// ============================================================

export interface ValidationResultat {
  valide: boolean;
  raison?: string;
  menaces?: string[];
  score: number; // 0-100, 100 = sûr
}

export interface RateLimitInfo {
  canal: CanalCommunication;
  limite: number;
  utilise: number;
  restant: number;
  resetDans: number; // secondes
}

export interface LogMessage {
  id: string;
  timestamp: string;
  canal: CanalCommunication;
  action: string;
  destinataire: string;
  statut: StatutMessage;
  correlationId: string;
  metadata?: Record<string, any>;
}

export interface MenaceDetectee {
  type: 'phishing' | 'spam' | 'malware' | 'lien_suspect' | 'destinataire_suspect';
  gravite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  description: string;
  action: 'bloque' | 'alerte' | 'autorise';
  timestamp: string;
}

// ============================================================
// Configuration sécurité
// ============================================================

export interface ConfigurationSecurite {
  whitelist: {
    emails: string[];
    telephones: string[];
    domainesEmail: string[];
    slackUsers: string[];
    telegramChats: string[];
  };
  blacklist: {
    contacts: string[];
  };
  rateLimits: {
    email: number;
    sms: number;
    whatsapp: number;
    slack: number;
    telegram: number;
    global: number;
  };
  confirmation: {
    seuilEnvoiMasse: number;
    requiseHorsWhitelist: boolean;
  };
  detection: {
    activee: boolean;
    bloquerLiensSuspects: boolean;
    scannerPiecesJointes: boolean;
  };
}

// ============================================================
// Statistiques
// ============================================================

export interface StatistiquesCommunication {
  periode: {
    debut: string;
    fin: string;
  };
  parCanal: {
    [canal in CanalCommunication]: {
      envoyes: number;
      livres: number;
      echoues: number;
      tauxLivraison: number;
    };
  };
  total: {
    messagesEnvoyes: number;
    destinatairesUniques: number;
    cout?: number;
  };
  topDestinataires: Array<{
    destinataire: string;
    canal: CanalCommunication;
    nombreMessages: number;
  }>;
}
