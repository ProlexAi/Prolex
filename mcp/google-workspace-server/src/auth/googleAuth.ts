/**
 * Google Authentication Client
 * SECURITY: Supports OAuth2 and Service Account with strict validation
 */

import { google, Auth } from 'googleapis';
import { config, getAuthMethod, getGoogleScopes } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import fs from 'fs';

/**
 * Google Auth Client singleton
 */
class GoogleAuthClient {
  private authClient: Auth.OAuth2Client | Auth.JWT | null = null;
  private initialized = false;

  /**
   * Initialize authentication client
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const authMethod = getAuthMethod();
    journal.info('google_auth_initializing', { authMethod });

    try {
      if (authMethod === 'service_account') {
        await this.initializeServiceAccount();
      } else {
        await this.initializeOAuth2();
      }

      this.initialized = true;
      journal.info('google_auth_initialized', { authMethod });
    } catch (error) {
      journal.fatal('google_auth_initialization_failed', error as Error, { authMethod });
      throw new Error(`Failed to initialize Google Auth: ${(error as Error).message}`);
    }
  }

  /**
   * Initialize Service Account authentication (RECOMMENDED for server-to-server)
   * SECURITY: Service Account keys should be rotated every 90 days
   */
  private async initializeServiceAccount(): Promise<void> {
    const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GOOGLE_SERVICE_ACCOUNT_JSON } = config;

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL is required for service account auth');
    }

    let credentials: any;

    // Option 1: Load from JSON string (environment variable)
    if (GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
        journal.debug('service_account_loaded_from_env');
      } catch (error) {
        throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON: must be valid JSON');
      }
    }
    // Option 2: Load from file path
    else if (GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      if (!fs.existsSync(GOOGLE_SERVICE_ACCOUNT_KEY_PATH)) {
        throw new Error(`Service account key file not found: ${GOOGLE_SERVICE_ACCOUNT_KEY_PATH}`);
      }

      try {
        const fileContent = fs.readFileSync(GOOGLE_SERVICE_ACCOUNT_KEY_PATH, 'utf-8');
        credentials = JSON.parse(fileContent);
        journal.debug('service_account_loaded_from_file', {
          path: GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
        });
      } catch (error) {
        throw new Error(`Failed to load service account key: ${(error as Error).message}`);
      }
    } else {
      throw new Error('Either GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_KEY_PATH must be provided');
    }

    // SECURITY: Validate service account key structure
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Invalid service account key: missing client_email or private_key');
    }

    if (credentials.client_email !== GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      journal.security('service_account_email_mismatch', {
        expected: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        actual: credentials.client_email,
      });
      throw new Error('Service account email mismatch');
    }

    const scopes = getGoogleScopes();

    this.authClient = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes,
    });

    journal.info('service_account_configured', {
      email: credentials.client_email,
      scopes,
    });
  }

  /**
   * Initialize OAuth2 authentication
   * SECURITY: OAuth2 is less secure for server-to-server, use Service Account instead
   */
  private async initializeOAuth2(): Promise<void> {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = config;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      throw new Error(
        'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI are required for OAuth2'
      );
    }

    this.authClient = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    journal.warn('oauth2_configured', {
      message: 'OAuth2 is less secure than Service Account for server-to-server communication',
      clientId: GOOGLE_CLIENT_ID,
    });

    // TODO: Implement token refresh logic
    // For now, this is a basic setup that requires manual token management
    journal.warn('oauth2_token_management_required', {
      message: 'OAuth2 tokens must be manually managed. Consider using Service Account instead.',
    });
  }

  /**
   * Get authenticated client
   * SECURITY: Always check if initialized before returning client
   */
  getClient(): Auth.OAuth2Client | Auth.JWT {
    if (!this.initialized || !this.authClient) {
      throw new Error('Google Auth client not initialized. Call initialize() first.');
    }

    return this.authClient;
  }

  /**
   * Check if client is ready
   */
  isReady(): boolean {
    return this.initialized && this.authClient !== null;
  }

  /**
   * Validate that the client has necessary scopes
   * SECURITY: Prevent privilege escalation by validating scopes
   */
  async validateScopes(requiredScopes: string[]): Promise<boolean> {
    const configuredScopes = getGoogleScopes();

    for (const required of requiredScopes) {
      if (!configuredScopes.includes(required)) {
        journal.security('insufficient_scopes', {
          required: requiredScopes,
          configured: configuredScopes,
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Get Google Sheets API instance
   */
  getSheetsAPI() {
    return google.sheets({ version: 'v4', auth: this.getClient() });
  }

  /**
   * Get Google Docs API instance
   */
  getDocsAPI() {
    return google.docs({ version: 'v1', auth: this.getClient() });
  }

  /**
   * Get Google Drive API instance
   */
  getDriveAPI() {
    return google.drive({ version: 'v3', auth: this.getClient() });
  }
}

/**
 * Singleton instance
 */
export const googleAuth = new GoogleAuthClient();
