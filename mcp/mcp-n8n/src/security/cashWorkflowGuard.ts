/**
 * CASH WORKFLOW GUARD — ZONE INTERDITE À PROLEX
 *
 * Verrouillage technique des workflows critiques générateurs de revenus.
 * Prolex n'a PAS LE DROIT de toucher à ces workflows sans autorisation explicite.
 *
 * Date de verrouillage: 2025-11-22
 * Autorité: Matthieu (Automatt.ai)
 */

import { journal } from '../logging/systemJournal.js';

/**
 * Patterns de workflows INTERDITS à Prolex
 * Tout workflow contenant ces patterns est PROTÉGÉ
 */
const CASH_FORBIDDEN_PATTERNS = [
  // Numéros de workflows cash
  '200_',
  '250_',
  '300_',
  '400_',
  '450_',
  '999_master',

  // Mots-clés cash dans les noms
  'leadgen',
  'lead',
  'offre',
  'proposal',
  'content_machine',
  'invoice',
  'facture',
  'stripe',
  'relance',
  'impaye',
  'cash',
  'tracker',

  // IDs de workflows spécifiques (si on les connaît)
  'li_mail',
  'proposal_auto',
];

/**
 * Liste explicite des workflows INTERDITS
 * Format: nom de fichier exact
 */
const CASH_FORBIDDEN_WORKFLOWS = [
  '200_leadgen_li_mail.json',
  '250_proposal_auto.json',
  '300_content_machine.json',
  '400_invoice_stripe_auto.json',
  '450_relances_impayes.json',
  '999_master_tracker.json',
];

/**
 * Actions INTERDITES sur les workflows cash
 */
const FORBIDDEN_ACTIONS = [
  'create',
  'modify',
  'update',
  'delete',
  'trigger',
  'repair',
  'analyze',
  'propose',
];

/**
 * Interface pour le résultat de la vérification
 */
export interface CashWorkflowCheckResult {
  isAllowed: boolean;
  isCashWorkflow: boolean;
  reason?: string;
  alertMatthieu: boolean;
  matchedPatterns?: string[];
}

/**
 * Vérifie si un nom de workflow correspond aux patterns interdits
 */
export function isCashWorkflow(workflowName: string): boolean {
  if (!workflowName) {
    return false;
  }

  const nameLower = workflowName.toLowerCase();

  // Vérification exacte des fichiers interdits
  for (const forbidden of CASH_FORBIDDEN_WORKFLOWS) {
    if (nameLower.includes(forbidden.toLowerCase().replace('.json', ''))) {
      return true;
    }
  }

  // Vérification des patterns
  for (const pattern of CASH_FORBIDDEN_PATTERNS) {
    if (nameLower.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Vérifie si une action est autorisée sur un workflow
 *
 * @param workflowName - Nom du workflow (peut contenir l'ID ou le nom)
 * @param action - Action à effectuer (create, update, trigger, etc.)
 * @param context - Contexte additionnel pour logging
 * @returns Résultat de la vérification avec détails
 */
export function checkCashWorkflowPermission(
  workflowName: string,
  action: string,
  context: Record<string, unknown> = {}
): CashWorkflowCheckResult {
  const correlationId = journal.generateCorrelationId();

  // Si ce n'est pas un workflow cash, autoriser
  if (!isCashWorkflow(workflowName)) {
    return {
      isAllowed: true,
      isCashWorkflow: false,
      alertMatthieu: false,
    };
  }

  // C'est un workflow cash - INTERDIRE
  const matchedPatterns = CASH_FORBIDDEN_PATTERNS.filter(pattern =>
    workflowName.toLowerCase().includes(pattern.toLowerCase())
  );

  const result: CashWorkflowCheckResult = {
    isAllowed: false,
    isCashWorkflow: true,
    reason: `🚫 CASH WORKFLOW PROTÉGÉ — Prolex n'a pas le droit de ${action} "${workflowName}". Seul Matthieu est autorisé.`,
    alertMatthieu: true,
    matchedPatterns,
  };

  // Logger l'incident
  journal.warn('cash_workflow_access_denied', {
    correlationId,
    workflowName,
    action,
    matchedPatterns,
    context,
    severity: 'CRITICAL',
    alertType: 'TELEGRAM',
  });

  return result;
}

/**
 * Valide une opération sur un workflow
 * Lance une exception si l'opération est interdite
 *
 * @throws Error si le workflow est protégé
 */
export function validateWorkflowOperation(
  workflowName: string,
  action: string,
  context: Record<string, unknown> = {}
): void {
  const check = checkCashWorkflowPermission(workflowName, action, context);

  if (!check.isAllowed) {
    // Log critical alert
    journal.error('cash_workflow_violation_attempt', new Error(check.reason || 'Unknown'), {
      workflowName,
      action,
      matchedPatterns: check.matchedPatterns,
      context,
      severity: 'CRITICAL',
      alertMatthieu: true,
    });

    throw new Error(check.reason);
  }
}

/**
 * Obtient la liste des workflows interdits (pour documentation)
 */
export function getForbiddenWorkflows(): string[] {
  return [...CASH_FORBIDDEN_WORKFLOWS];
}

/**
 * Obtient la liste des patterns interdits (pour documentation)
 */
export function getForbiddenPatterns(): string[] {
  return [...CASH_FORBIDDEN_PATTERNS];
}

/**
 * Message d'alerte formaté pour Telegram
 */
export function formatTelegramAlert(workflowName: string, action: string): string {
  return `
🚨 ALERTE SÉCURITÉ PROLEX 🚨

🔴 Tentative d'accès à un CASH WORKFLOW protégé !

📋 Workflow: ${workflowName}
⚡ Action tentée: ${action}
🤖 Agent: Prolex MCP Server
⏰ Timestamp: ${new Date().toISOString()}

❌ Opération REFUSÉE automatiquement
✅ Workflow PROTÉGÉ intact

📝 Rappel: Seul Matthieu peut modifier les workflows cash.
  `.trim();
}

/**
 * Export pour utilisation dans les tests
 */
export const _testing = {
  CASH_FORBIDDEN_PATTERNS,
  CASH_FORBIDDEN_WORKFLOWS,
  FORBIDDEN_ACTIONS,
};
