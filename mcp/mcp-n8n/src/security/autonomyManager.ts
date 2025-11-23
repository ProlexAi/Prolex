/**
 * Autonomy Manager
 * Manages autonomy level and persists configuration to YAML
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'yaml';
import type { AutonomyLevel, AutonomyConfig } from '../types/security.js';
import { journal } from '../logging/systemJournal.js';

export class AutonomyManager {
  private static instance: AutonomyManager;
  private configPath: string;
  private currentConfig: AutonomyConfig;

  private constructor() {
    // Path to config/autonomy.yml
    this.configPath = join(process.cwd(), '..', '..', 'config', 'autonomy.yml');
    this.currentConfig = this.loadConfig();

    journal.info('autonomy_manager_initialized', {
      currentLevel: this.currentConfig.current_level,
      configPath: this.configPath,
    });
  }

  static getInstance(): AutonomyManager {
    if (!AutonomyManager.instance) {
      AutonomyManager.instance = new AutonomyManager();
    }
    return AutonomyManager.instance;
  }

  /**
   * Load autonomy configuration from YAML
   */
  private loadConfig(): AutonomyConfig {
    try {
      const yamlContent = readFileSync(this.configPath, 'utf-8');
      const parsed = parse(yamlContent);

      // Extract MCP-specific autonomy level (NOT the Prolex level 4)
      // MCP uses levels 0-3 only
      const prolexLevel = parsed.prolex_current_autonomy_level || 2;
      const mcpLevel = Math.min(prolexLevel, 3) as AutonomyLevel;

      const config: AutonomyConfig = {
        current_level: mcpLevel,
        max_level: 3, // MCP max is 3, never 4
        mode: this.getLevelMode(mcpLevel),
        human_in_the_loop: mcpLevel < 3,
      };

      journal.info('autonomy_config_loaded', {
        prolexLevel,
        mcpLevel,
        mode: config.mode,
      });

      return config;
    } catch (error) {
      journal.error('autonomy_config_load_error', error as Error);

      // Fallback to safe defaults
      return {
        current_level: 0,
        max_level: 3,
        mode: 'read-only',
        human_in_the_loop: true,
      };
    }
  }

  /**
   * Get mode based on level
   */
  private getLevelMode(level: AutonomyLevel): AutonomyConfig['mode'] {
    switch (level) {
      case 0:
        return 'read-only';
      case 1:
        return 'read-write';
      case 2:
        return 'low-risk';
      case 3:
        return 'advanced';
    }
  }

  /**
   * Get current autonomy level
   */
  getCurrentLevel(): AutonomyLevel {
    return this.currentConfig.current_level;
  }

  /**
   * Get full autonomy configuration
   */
  getConfig(): AutonomyConfig {
    return { ...this.currentConfig };
  }

  /**
   * Set new autonomy level (with validation)
   */
  async setLevel(newLevel: AutonomyLevel, reason?: string): Promise<void> {
    const correlationId = journal.generateCorrelationId();

    // Validate level
    if (newLevel < 0 || newLevel > 3) {
      throw new Error(`Invalid autonomy level: ${newLevel}. Must be 0-3.`);
    }

    journal.info('autonomy_level_change_request', {
      oldLevel: this.currentConfig.current_level,
      newLevel,
      reason,
      correlationId,
    });

    try {
      // Read current YAML
      const yamlContent = readFileSync(this.configPath, 'utf-8');
      const parsed = parse(yamlContent);

      // Update level
      parsed.prolex_current_autonomy_level = newLevel;
      parsed.autonomy_config = parsed.autonomy_config || {};
      parsed.autonomy_config.current = newLevel;
      parsed.autonomy_config.mode = this.getLevelMode(newLevel);
      parsed.autonomy_config.human_in_the_loop = newLevel < 3;

      // Write back to file
      const newYaml = stringify(parsed);
      writeFileSync(this.configPath, newYaml, 'utf-8');

      // Update in-memory config
      this.currentConfig = {
        current_level: newLevel,
        max_level: 3,
        mode: this.getLevelMode(newLevel),
        human_in_the_loop: newLevel < 3,
      };

      journal.info('autonomy_level_changed', {
        newLevel,
        mode: this.currentConfig.mode,
        reason,
        correlationId,
      });
    } catch (error) {
      journal.error('autonomy_level_change_error', error as Error, {
        newLevel,
        correlationId,
      });
      throw error;
    }
  }

  /**
   * Check if level requires human confirmation
   */
  requiresHumanConfirmation(): boolean {
    return this.currentConfig.human_in_the_loop;
  }

  /**
   * Reload configuration from disk
   */
  reload(): void {
    this.currentConfig = this.loadConfig();
    journal.info('autonomy_config_reloaded', {
      currentLevel: this.currentConfig.current_level,
    });
  }
}

// Export singleton instance
export const autonomyManager = AutonomyManager.getInstance();
