/**
 * Client d'authentification Google (Service Account)
 * Utilisé par tous les services Google (Sheets, Drive, Calendar, Gmail, Tasks)
 */

import { google, type Auth } from 'googleapis';
import type { GoogleCredentials, GoogleAuthError } from '../types/index.js';

let authClient: Auth.GoogleAuth | null = null;

/**
 * Initialise le client d'authentification Google
 * Utilise les credentials d'un Service Account stockés dans une variable d'environnement
 */
export function getGoogleAuth(): Auth.GoogleAuth {
  if (authClient) {
    return authClient;
  }

  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

  if (!credentialsJson) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable is not set. ' +
        'Please provide Google Service Account JSON credentials.'
    );
  }

  try {
    const credentials: GoogleCredentials = JSON.parse(credentialsJson);

    authClient = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets', // Google Sheets
        'https://www.googleapis.com/auth/drive', // Google Drive
        'https://www.googleapis.com/auth/calendar', // Google Calendar
        'https://www.googleapis.com/auth/gmail.send', // Gmail send
        'https://www.googleapis.com/auth/gmail.readonly', // Gmail read
        'https://www.googleapis.com/auth/gmail.modify', // Gmail modify
        'https://www.googleapis.com/auth/tasks', // Google Tasks
      ],
    });

    console.log('✅ Google Auth initialized successfully');
    console.log(`   Service Account: ${credentials.client_email}`);
    console.log(`   Project: ${credentials.project_id}`);

    return authClient;
  } catch (error) {
    const authError: GoogleAuthError = new Error(
      `Failed to initialize Google Auth: ${error instanceof Error ? error.message : String(error)}`
    ) as GoogleAuthError;
    authError.name = 'GoogleAuthError';
    authError.originalError = error;
    throw authError;
  }
}

/**
 * Obtient un client OAuth2 authentifié
 * Utilisé pour les requêtes aux APIs Google
 */
export async function getAuthClient(): Promise<Auth.OAuth2Client> {
  const auth = getGoogleAuth();
  const client = await auth.getClient();
  return client as Auth.OAuth2Client;
}

/**
 * Vérifie que le client d'authentification est initialisé et fonctionnel
 */
export async function verifyAuth(): Promise<boolean> {
  try {
    await getAuthClient();
    return true;
  } catch (error) {
    console.error('❌ Google Auth verification failed:', error);
    return false;
  }
}
