/**
 * Rate Limiter pour MCP Communication
 * Protection contre l'abus et le spam
 */

import { config } from '../config/env.js';
import { journal } from '../logging/systemJournal.js';
import type { CanalCommunication, RateLimitInfo } from '../types/index.js';

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly WINDOW_MS = 60 * 60 * 1000; // 1 heure en millisecondes

  /**
   * Vérifier si la limite est atteinte pour un canal
   */
  async checkLimit(canal: CanalCommunication, correlationId?: string): Promise<RateLimitInfo> {
    const limite = this.getLimite(canal);
    const key = `canal:${canal}`;

    const entry = this.getOrCreateEntry(key);
    const restant = Math.max(0, limite - entry.count);
    const resetDans = Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000));

    const info: RateLimitInfo = {
      canal,
      limite,
      utilise: entry.count,
      restant,
      resetDans,
    };

    // Log si proche de la limite
    if (restant <= 5 && restant > 0) {
      journal.warn('Rate limit proche', {
        canal,
        restant,
        correlationId,
      });
    }

    return info;
  }

  /**
   * Vérifier ET incrémenter si autorisé
   */
  async checkAndIncrement(canal: CanalCommunication, correlationId?: string): Promise<boolean> {
    const limite = this.getLimite(canal);
    const key = `canal:${canal}`;

    const entry = this.getOrCreateEntry(key);

    // Limite atteinte ?
    if (entry.count >= limite) {
      const resetDans = Math.ceil((entry.resetAt - Date.now()) / 1000);

      journal.error('rate_limit_exceeded', new Error('Rate limit dépassé'), {
        canal,
        limite,
        utilise: entry.count,
        resetDans,
        correlationId,
      });

      return false;
    }

    // Incrémenter
    entry.count++;
    this.limits.set(key, entry);

    // Log l'utilisation
    journal.debug('Rate limit utilisé', {
      canal,
      utilise: entry.count,
      limite,
      restant: limite - entry.count,
    });

    return true;
  }

  /**
   * Vérifier la limite globale (tous canaux confondus)
   */
  async checkGlobalLimit(correlationId?: string): Promise<boolean> {
    const limite = config.security.rateLimits.global;
    const key = 'global';

    const entry = this.getOrCreateEntry(key);

    if (entry.count >= limite) {
      const resetDans = Math.ceil((entry.resetAt - Date.now()) / 1000);

      journal.error('global_rate_limit_exceeded', new Error('Rate limit global dépassé'), {
        limite,
        utilise: entry.count,
        resetDans,
        correlationId,
      });

      return false;
    }

    entry.count++;
    this.limits.set(key, entry);

    return true;
  }

  /**
   * Obtenir ou créer une entrée de rate limit
   */
  private getOrCreateEntry(key: string): RateLimitEntry {
    const now = Date.now();
    const entry = this.limits.get(key);

    // Si l'entrée existe et n'a pas expiré, la retourner
    if (entry && entry.resetAt > now) {
      return entry;
    }

    // Sinon, créer une nouvelle entrée
    const newEntry: RateLimitEntry = {
      count: 0,
      resetAt: now + this.WINDOW_MS,
    };

    this.limits.set(key, newEntry);
    return newEntry;
  }

  /**
   * Obtenir la limite pour un canal
   */
  private getLimite(canal: CanalCommunication): number {
    switch (canal) {
      case 'email':
        return config.security.rateLimits.email;
      case 'sms':
        return config.security.rateLimits.sms;
      case 'whatsapp':
        return config.security.rateLimits.whatsapp;
      case 'slack':
        return config.security.rateLimits.slack;
      case 'telegram':
        return config.security.rateLimits.telegram;
      default:
        return 10; // Par défaut très restrictif
    }
  }

  /**
   * Obtenir toutes les infos de rate limit
   */
  async getAllLimits(): Promise<RateLimitInfo[]> {
    const canaux: CanalCommunication[] = ['email', 'sms', 'whatsapp', 'slack', 'telegram'];
    const infos: RateLimitInfo[] = [];

    for (const canal of canaux) {
      const info = await this.checkLimit(canal);
      infos.push(info);
    }

    return infos;
  }

  /**
   * Réinitialiser les compteurs (pour tests ou admin)
   */
  reset(): void {
    this.limits.clear();
    journal.info('Rate limits réinitialisés');
  }

  /**
   * Nettoyer les entrées expirées (garbage collection)
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetAt <= now) {
        this.limits.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      journal.debug('Entrées rate limit nettoyées', { cleaned });
    }
  }

  /**
   * Démarrer le nettoyage automatique
   */
  startAutoCleanup(): void {
    // Nettoyer toutes les 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
    journal.info('Auto-cleanup rate limiter démarré (5min)');
  }
}

// Export singleton
export const rateLimiter = new RateLimiter();
