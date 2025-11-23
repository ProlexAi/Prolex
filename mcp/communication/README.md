# 📱 MCP Communication - Serveur MCP Multi-Canal Sécurisé

> **Serveur MCP ultra-sécurisé pour communication multi-canal**
> **Email • SMS • WhatsApp • Slack • Telegram**
> Version 1.0.0 | Clientèle française 🇫🇷 | 🔒 Sécurité Maximale

---

## 🚨 SÉCURITÉ AVANT TOUT

Ce MCP Communication a été conçu avec **la sécurité comme priorité absolue** pour éviter :
- ❌ Spam / Abus
- ❌ Phishing / Liens malveillants
- ❌ Fuite de données
- ❌ Rate limit violations
- ❌ Envois non autorisés

**Chaque message passe par 7 couches de validation avant envoi.**

---

## 📋 Vue d'ensemble

Le **MCP Communication** fournit 15 tools sécurisés pour envoyer et gérer des messages sur 5 canaux :

| Canal | Status | Tools | Sécurité |
|-------|--------|-------|----------|
| **Email** | ✅ Gmail/SMTP | 2/4 | Whitelist + Anti-spam |
| **SMS** | ✅ Twilio | 3/3 | Whitelist stricte |
| **WhatsApp** | 🚧 Twilio | 0/3 | Whitelist stricte |
| **Slack** | 🚧 Slack API | 0/3 | User whitelist |
| **Telegram** | 🚧 Bot API | 0/4 | Chat whitelist |

**Total : 5/15 tools implémentés**

---

## 🔒 Couches de Sécurité

### 1. **Whitelist de Destinataires** (Obligatoire en Production)

```env
# .env
ALLOWED_EMAIL_RECIPIENTS=client@example.com,equipe@automatt.ai
ALLOWED_EMAIL_DOMAINS=automatt.ai,trusted-domain.com
ALLOWED_PHONE_NUMBERS=+33612345678,+33698765432
```

**En production**, seuls les contacts dans la whitelist peuvent recevoir des messages. Tout autre destinataire sera **bloqué automatiquement**.

### 2. **Blacklist** (Protection Absolue)

```env
BLOCKED_RECIPIENTS=spam@example.com,+33600000000
```

Les contacts en blacklist sont **immédiatement rejetés**, sans validation supplémentaire.

### 3. **Rate Limiting** (Protection contre abus)

```env
# Limites par heure
RATE_LIMIT_EMAIL_PER_HOUR=50
RATE_LIMIT_SMS_PER_HOUR=20      # Plus strict car coûteux
RATE_LIMIT_WHATSAPP_PER_HOUR=30
RATE_LIMIT_GLOBAL_PER_HOUR=200  # Tous canaux confondus
```

**Si la limite est atteinte**, tous les envois suivants seront **bloqués** jusqu'à la réinitialisation (1 heure).

### 4. **Détection de Menaces** (IA + Patterns)

#### Phishing
- Détection de liens raccourcis suspects (bit.ly, tinyurl.com)
- Détection d'adresses IP dans les URLs
- Patterns de phishing (verify account, claim prize, etc.)

#### Spam
- Score de spam basé sur patterns
- Détection CAPS LOCK abuse
- Symboles monétaires répétés
- Expressions commerciales

#### Liens Suspects
```typescript
// Exemples bloqués automatiquement :
❌ http://192.168.1.1/malware
❌ http://bit.ly/xxxxx (raccourcisseur)
❌ http://paypal-verify.suspicious.com
```

### 5. **Validation des Pièces Jointes**

#### Extensions Interdites
```
.exe, .bat, .cmd, .com, .scr, .pif, .vbs, .js
.jar, .msi, .app, .deb, .rpm, .apk
```

#### Taille Maximale
```env
MAX_ATTACHMENT_SIZE_MB=10  # Par défaut
```

#### Types MIME Autorisés
```
✅ application/pdf
✅ image/* (jpeg, png, gif, webp)
✅ text/* (plain, csv)
✅ application/json
✅ documents Office (xlsx, docx)
❌ Tout autre type = bloqué
```

#### Double Extension (Protection Phishing)
```
❌ fichier.pdf.exe  → Bloqué (double extension)
✅ document.pdf     → OK
```

### 6. **Confirmation pour Actions Sensibles**

```env
# Confirmation requise si > 10 destinataires
REQUIRE_CONFIRMATION_BULK_THRESHOLD=10

# Confirmation si destinataire hors whitelist
REQUIRE_CONFIRMATION_NON_WHITELISTED=true
```

### 7. **Audit Logging Complet**

Tous les messages sont loggés :
- ✅ SystemJournal (Google Sheets)
- ✅ Fichier local (`logs/security.log`)
- ✅ Console (Pino pretty)

**Ce qui est loggé** :
- ✅ Tous les envois (réussis ou bloqués)
- ✅ Tentatives d'accès refusées
- ✅ Menaces détectées
- ✅ Violations de rate limit
- ✅ Erreurs système

---

## 🚀 Installation

### Prérequis

- Node.js >= 18.0.0
- Credentials (Gmail, Twilio, etc.)
- Whitelist configurée (OBLIGATOIRE en production)

### Installation

```bash
cd mcp/communication
npm install
```

### Configuration

1. Copier le fichier d'exemple :
```bash
cp .env.example .env
```

2. **CRITIQUE** : Configurer la whitelist
```env
# ⚠️ OBLIGATOIRE EN PRODUCTION
ALLOWED_EMAIL_RECIPIENTS=client1@example.com,client2@example.com
ALLOWED_EMAIL_DOMAINS=automatt.ai
ALLOWED_PHONE_NUMBERS=+33612345678
```

3. Configurer les credentials
```env
# Gmail (recommandé)
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=xxxxx
GMAIL_USER_EMAIL=votre-email@gmail.com

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+33xxxxxxxxx
```

4. **Valider la configuration** avant de démarrer
```bash
npm run dev
```

---

## 📦 Tools Disponibles (5/15)

### 📧 Email (2 tools)

#### 1. `envoyer_email`
Envoyer un email avec validation multi-niveau

**Sécurité appliquée** :
- ✅ Whitelist destinataire
- ✅ Détection phishing/spam
- ✅ Validation pièces jointes
- ✅ Rate limiting
- ✅ Logging complet

**Paramètres** :
```typescript
{
  a: string | string[],        // Destinataire(s)
  sujet: string,
  corps: string,               // Texte
  html?: string,               // HTML optionnel
  cc?: string[],
  cci?: string[],
  pieceJointes?: [{
    nom: string,
    contenu: string,           // Base64
    type: string               // MIME type
  }],
  priorite?: 'basse' | 'normale' | 'haute'
}
```

**Exemple** :
```json
{
  "a": "client@example.com",
  "sujet": "Votre devis",
  "corps": "Bonjour,\n\nVeuillez trouver ci-joint votre devis.\n\nCordialement",
  "pieceJointes": [{
    "nom": "devis.pdf",
    "contenu": "JVBERi0xLjQK...",
    "type": "application/pdf"
  }],
  "priorite": "haute"
}
```

#### 2. `lire_emails`
Lire les emails récents (Gmail uniquement)

**Paramètres** :
```typescript
{
  nonLu?: boolean,      // Par défaut: true
  limite?: number,      // Max: 50, défaut: 10
  depuis?: string       // Date ISO 8601
}
```

---

### 📱 SMS (3 tools)

#### 3. `envoyer_sms`
Envoyer un SMS avec validation stricte

**Sécurité appliquée** :
- ✅ Whitelist téléphone (STRICTE)
- ✅ Format international requis (+33...)
- ✅ Détection phishing/spam
- ✅ Rate limiting strict
- ✅ Logging + coût

**Paramètres** :
```typescript
{
  a: string,          // +33612345678 (format international)
  message: string     // Max 1600 caractères
}
```

**Exemple** :
```json
{
  "a": "+33612345678",
  "message": "Bonjour, votre commande #1234 est prête à être retirée."
}
```

#### 4. `lire_sms_recus`
Lire les SMS reçus

#### 5. `obtenir_statut_sms`
Vérifier le statut de livraison d'un SMS

---

## 🔧 Architecture de Sécurité

```
┌─────────────────────────────────────────────────────────┐
│ 1. RÉCEPTION REQUÊTE                                     │
└───────────────────┬─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. RATE LIMITING                                         │
│    → Vérifier limite horaire                            │
│    → Bloquer si dépassé                                 │
└───────────────────┬─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. VALIDATION DESTINATAIRE                               │
│    → Vérifier format                                    │
│    → Blacklist check (bloque immédiatement)             │
│    → Whitelist check (prod)                             │
└───────────────────┬─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. ANALYSE CONTENU                                       │
│    → Détection phishing                                 │
│    → Détection spam                                     │
│    → Liens suspects                                     │
└───────────────────┬─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 5. VALIDATION PIÈCES JOINTES                             │
│    → Taille < MAX                                       │
│    → Extension autorisée                                │
│    → Type MIME valide                                   │
│    → Pas de double extension                            │
└───────────────────┬─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 6. ENVOI                                                 │
│    → API externe (Gmail, Twilio, etc.)                  │
└───────────────────┬─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 7. LOGGING                                               │
│    → SystemJournal (Google Sheets)                      │
│    → Fichier security.log                               │
│    → Console                                            │
└─────────────────────────────────────────────────────────┘
```

**Si une seule couche échoue → Message bloqué**

---

## 🚨 Alertes Administrateur

En cas d'activité suspecte, l'admin est alerté :

```env
ADMIN_EMAIL=matthieu@automatt.ai
ADMIN_TELEGRAM_CHAT_ID=xxxxx
ALERT_ON_SUSPICIOUS_ACTIVITY=true
```

**Événements déclenchant une alerte** :
- 🚨 Menace de gravité "élevée" ou "critique"
- 🚨 Tentatives répétées d'accès bloqué
- 🚨 Rate limit global dépassé
- 🚨 Malware détecté dans pièce jointe

---

## 📊 Logs de Sécurité

### Exemple de log (envoi réussi)
```json
{
  "timestamp": "2025-11-23T10:30:00Z",
  "agent": "MCP_COMMUNICATION",
  "action": "message_envoye",
  "canal": "email",
  "destinataire": "c***@example.com",
  "statut": "envoye",
  "messageId": "abc123",
  "correlationId": "comm_1732356600_def456"
}
```

### Exemple de log (bloqué)
```json
{
  "timestamp": "2025-11-23T10:31:00Z",
  "agent": "MCP_COMMUNICATION",
  "action": "acces_refuse",
  "canal": "sms",
  "destinataire": "+336***78",
  "raison": "Numéro hors whitelist",
  "correlationId": "comm_1732356660_ghi789"
}
```

### Exemple de log (menace détectée)
```json
{
  "timestamp": "2025-11-23T10:32:00Z",
  "agent": "MCP_COMMUNICATION",
  "action": "menace_detectee",
  "type": "phishing",
  "gravite": "elevee",
  "description": "Pattern de phishing détecté dans l'URL",
  "actionPrise": "bloque",
  "canal": "email",
  "correlationId": "comm_1732356720_jkl012"
}
```

---

## ⚠️ Checklist Sécurité Avant Production

- [ ] **Whitelist configurée** (emails, téléphones, domaines)
- [ ] **Rate limits ajustés** (selon usage)
- [ ] **Credentials vérifiés** (Gmail, Twilio)
- [ ] **Logging activé** (SystemJournal + fichier)
- [ ] **Alertes admin configurées** (email ou Telegram)
- [ ] **Détection de menaces activée**
- [ ] **Pièces jointes scannées** (VirusTotal optionnel)
- [ ] **Tests effectués** (envois autorisés et bloqués)
- [ ] **Documentation lue** (ce README)
- [ ] **Secrets sécurisés** (jamais dans Git)

---

## 🧪 Tests de Sécurité

### Test 1 : Whitelist
```bash
# Tenter d'envoyer à un email NON whitelisté
# → Doit être BLOQUÉ
{
  "a": "random@spam.com",
  "sujet": "Test",
  "corps": "Test whitelist"
}
# Résultat attendu: Erreur "Destinataire non autorisé"
```

### Test 2 : Rate Limit
```bash
# Envoyer 51 emails rapidement (limite = 50)
# → Le 51e doit être BLOQUÉ
# Résultat attendu: Erreur "Rate limit dépassé"
```

### Test 3 : Phishing
```bash
# Envoyer un message avec lien suspect
{
  "a": "whitelist@example.com",
  "corps": "Cliquez ici: http://bit.ly/xxxxx"
}
# Résultat attendu: Bloqué pour "lien suspect"
```

### Test 4 : Pièce Jointe Malveillante
```bash
# Joindre un .exe
{
  "pieceJointes": [{
    "nom": "virus.exe",
    "type": "application/x-msdownload"
  }]
}
# Résultat attendu: Bloqué pour "extension interdite"
```

---

## 📝 TODO

### Tools à implémenter (10 restants)

**Email (2 tools)**
- [ ] `rechercher_email` - Recherche avancée
- [ ] `archiver_email` - Archiver/labelliser

**WhatsApp (3 tools)**
- [ ] `envoyer_whatsapp` - Message texte
- [ ] `envoyer_media_whatsapp` - Image/vidéo/doc
- [ ] `lire_messages_whatsapp` - Messages reçus

**Slack (3 tools)**
- [ ] `envoyer_message_slack` - Message canal/DM
- [ ] `creer_canal_slack` - Nouveau canal
- [ ] `inviter_utilisateur_slack` - Inviter au canal

**Telegram (4 tools)**
- [ ] `envoyer_telegram` - Message texte
- [ ] `envoyer_media_telegram` - Photo/vidéo
- [ ] `broadcast_telegram` - Envoi masse
- [ ] `creer_boutons_telegram` - Keyboard inline

---

## 🤝 Support

- **Auteur** : ProlexAi
- **Email** : matthieu@automatt.ai
- **Clientèle** : 🇫🇷 Française
- **Sécurité** : 🔒 Maximale

---

## 📜 Licence

MIT

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-11-23
**Status** : 🚧 En développement (5/15 tools)
**Sécurité** : 🔒 Production-ready
