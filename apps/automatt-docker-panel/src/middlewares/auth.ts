/**
 * auth.ts
 *
 * Middleware d'authentification simple pour protéger l'accès au dashboard.
 *
 * FONCTIONNEMENT :
 * - Si la variable d'environnement DASHBOARD_BASIC_AUTH_TOKEN est définie,
 *   toutes les requêtes doivent fournir un header Authorization avec ce token.
 * - Si la variable n'est PAS définie, l'authentification est désactivée (mode dev).
 *
 * UTILISATION :
 * - En production : définir DASHBOARD_BASIC_AUTH_TOKEN avec un token secret fort.
 * - En développement local : ne pas définir la variable (accès libre).
 *
 * SÉCURITÉ :
 * - C'est une authentification TRÈS basique, adaptée pour un usage interne.
 * - Pour un usage public, préférer OAuth2, JWT, ou une vraie gestion utilisateurs.
 * - TOUJOURS utiliser HTTPS en production pour protéger le token.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Récupère le token d'authentification depuis les variables d'environnement
 *
 * Si non défini : authentification désactivée
 * Si défini : toutes les requêtes doivent fournir ce token
 */
const AUTH_TOKEN = process.env.DASHBOARD_BASIC_AUTH_TOKEN;

/**
 * Middleware d'authentification
 *
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction pour passer au middleware suivant
 *
 * Vérifie le header Authorization: Bearer <token>
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Si aucun token n'est configuré, on laisse passer (mode dev)
  if (!AUTH_TOKEN) {
    console.log('⚠️  No auth token configured - authentication disabled');
    return next();
  }

  // Récupérer le header Authorization
  const authHeader = req.headers.authorization;

  // Si pas de header Authorization
  if (!authHeader) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide an Authorization header with format: Bearer <token>'
    });
    return;
  }

  // Vérifier le format : "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      error: 'Invalid authorization format',
      message: 'Authorization header must use format: Bearer <token>'
    });
    return;
  }

  const providedToken = parts[1];

  // Comparer le token fourni avec le token configuré
  if (providedToken !== AUTH_TOKEN) {
    res.status(403).json({
      error: 'Invalid token',
      message: 'The provided authentication token is invalid'
    });
    return;
  }

  // Token valide, on laisse passer
  console.log('✅ Authentication successful');
  next();
}

/**
 * Message d'information au démarrage
 */
if (AUTH_TOKEN) {
  console.log('🔐 Authentication enabled with token');
} else {
  console.log('⚠️  Authentication DISABLED - set DASHBOARD_BASIC_AUTH_TOKEN to enable');
}
