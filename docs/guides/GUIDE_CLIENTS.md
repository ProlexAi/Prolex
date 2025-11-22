# 📘 GUIDE CLIENTS – PROLEX v4

> **Pour** : Futurs clients d'Automatt.ai
> **Objectif** : Comprendre Prolex et comment il peut transformer votre activité
> **Date** : 2025-11-22

---

## 🎯 Qu'est-ce que Prolex ?

### En une phrase

**Prolex est votre assistant IA qui automatise vos tâches répétitives et orchestre vos outils métier, en langage naturel.**

### Concrètement

Au lieu de :
- ❌ Créer manuellement des tâches dans Google Tasks
- ❌ Copier-coller des données entre outils
- ❌ Configurer des automatisations complexes dans Zapier/Make
- ❌ Relire vos emails pour extraire les actions à faire

Avec Prolex, vous :
- ✅ Dictez ou écrivez ce que vous voulez ("Créer une tâche pour appeler le client ABC demain")
- ✅ Prolex comprend, planifie et exécute
- ✅ Prolex apprend vos préférences et s'améliore
- ✅ Tout est tracé et sécurisé

---

## 💼 Pour qui ?

### Profils idéaux

#### 🏢 PME / Agences
- **Cas d'usage** :
  - Onboarding clients automatisé
  - Rapports mensuels générés automatiquement
  - Suivi projet sans effort manuel
- **Bénéfice** : Gagner 10-20h/semaine par collaborateur

#### 👨‍💼 Freelances / Consultants
- **Cas d'usage** :
  - Gestion administrative allégée
  - Facturation et suivi paiements automatisés
  - Veille concurrentielle quotidienne
- **Bénéfice** : Se concentrer sur le cœur de métier (facturation, pas admin)

#### 🚀 Startups
- **Cas d'usage** :
  - Workflows internes optimisés
  - Intégrations multiples (GitHub + Google + Slack + ...)
  - Scaling sans embaucher immédiatement
- **Bénéfice** : Scaler plus vite avec moins de ressources

---

## 🛠️ Exemples concrets

### Exemple 1 : Freelance web designer

**Avant Prolex** :
- Reçoit email client
- Copie manuellement dans Notion
- Crée tâche Google Tasks
- Ajoute événement Calendar pour rappel
- Met à jour feuille de suivi clients
- **Temps** : 15 minutes par nouveau contact

**Avec Prolex** :
- Reçoit email
- Prolex détecte automatiquement et :
  - Crée note Notion avec détails client
  - Crée tâche "Répondre à [Client]" avec deadline
  - Ajoute événement rappel
  - Met à jour feuille suivi
- **Temps** : 0 minute (100% automatique)
- **Gain** : 15 min × 20 clients/mois = **5h/mois**

---

### Exemple 2 : Agence marketing

**Avant Prolex** :
- Fin de mois = génération rapports clients
- Chaque collaborateur extrait données manuellement (Google Ads, Facebook, Analytics)
- Copie dans template Google Slides
- 4h par rapport × 10 clients = **40h/mois** (équipe)

**Avec Prolex** :
- Un seul message : "Génère les rapports mensuels pour tous les clients"
- Prolex :
  - Récupère données automatiquement
  - Génère rapports personnalisés
  - Envoie aux clients par email
- **Temps** : 0h (automatique)
- **Gain** : **40h/mois** pour l'équipe

---

### Exemple 3 : Startup SaaS

**Avant Prolex** :
- Nouveau client sign-up
- Équipe doit manuellement :
  - Créer workspace Notion
  - Inviter aux outils (Slack, GitHub, etc.)
  - Créer projet dans gestionnaire de tâches
  - Envoyer email de bienvenue personnalisé
- **Temps** : 30 min par client

**Avec Prolex** :
- Webhook déclenché au sign-up
- Prolex orchestre tout automatiquement
- **Temps** : 0 min
- **Gain** : 30 min × 50 clients/mois = **25h/mois**

---

## 📦 Offres & tarification (indicative)

### Pack Essentiel

**Prix** : 199€/mois

**Inclus** :
- Prolex niveau 1-2 (actions personnelles + low-risk)
- 15 outils de base (Tasks, Calendar, Docs, Sheets, recherche web)
- 500 requêtes/mois
- Support email

**Pour qui** : Freelances, solopreneurs

---

### Pack Professionnel

**Prix** : 499€/mois

**Inclus** :
- Prolex niveau 3 (actions avancées)
- 30+ outils (incluant GitHub, workflows clients)
- 2000 requêtes/mois
- 5 workflows personnalisés créés par Prolex
- Support prioritaire (chat)

**Pour qui** : PME, agences 5-20 personnes

---

### Pack Entreprise

**Prix** : Sur devis (à partir de 1500€/mois)

**Inclus** :
- Prolex niveau 3 + personnalisations
- Tous les outils + outils custom sur-mesure
- Requêtes illimitées
- Workflows illimités
- Déploiement on-premise possible
- Support dédié (Slack partagé + appels mensuels)

**Pour qui** : Entreprises 20+ personnes, besoins spécifiques

---

## 🎛️ Correspondance technique : Packs & Autonomie

Pour mieux comprendre les capacités de chaque pack, voici le détail technique :

### Tableau de correspondance

| Pack | Niveau autonomie Prolex | Workflows disponibles | Nombre d'outils | Exemples concrets |
|------|-------------------------|----------------------|-----------------|-------------------|
| **Essentiel** | 0 à 2 | 15 workflows core | 15 outils | Tâches, calendrier, notes, recherche web, logs |
| **Professionnel** | 0 à 3 | 30+ workflows | 30+ outils | + GitHub, workflows clients, design de workflows n8n |
| **Entreprise** | 0 à 3 + custom | Illimité | Illimité | + Workflows sur-mesure, outils métier custom |

### Qu'est-ce que le niveau d'autonomie ?

Le **niveau d'autonomie** détermine quelles actions Prolex peut effectuer **sans confirmation manuelle** :

| Niveau | Nom | Peut faire | Ne peut pas faire |
|--------|-----|------------|-------------------|
| **0** | Lecture seule | Lire documents, analyser, répondre aux questions | Exécuter des actions |
| **1** | Lecture + Logs | + Logger dans SystemJournal, créer des notes | Modifier des données externes |
| **2** | Actions low-risk | + Créer/modifier tâches, événements calendrier, recherche web | Toucher aux workflows clients, GitHub |
| **3** | Actions avancées | + Gérer workflows clients, créer workflows n8n, Git sync | Promouvoir en production sans confirmation |

### Configuration MVP (incluse dans tous les packs)

Même le Pack Essentiel inclut le **MVP Prolex v4** :
- ✅ Autonomie niveau 2 (actions low-risk automatiques)
- ✅ 4 workflows core (Kimmy, Proxy Master, Tasks, Logging)
- ✅ Traçabilité complète (SystemJournal)
- ✅ Interface en langage naturel

**Évolution** : Vous pouvez commencer en niveau 1 (confirmation à chaque action) et monter progressivement jusqu'au niveau autorisé par votre pack.

---

## 🚀 Comment démarrer ?

### Phase 1 : Discovery (Semaine 1)

**Objectif** : Comprendre vos besoins

**Étapes** :
1. Appel 30 min avec Matthieu (fondateur Automatt.ai)
2. Vous décrivez vos processus actuels
3. Nous identifions 3-5 quick wins (automatisations faciles à fort impact)

**Livrable** : Document de cadrage (gratuit, sans engagement)

---

### Phase 2 : Pilote (Mois 1)

**Objectif** : Valider que Prolex apporte de la valeur

**Étapes** :
1. Mise en place Prolex (niveau 1-2)
2. Configuration 3-5 automatisations prioritaires
3. Formation 1h (vous ou votre équipe)
4. Utilisation quotidienne + feedback

**Tarif** : **Gratuit** (ou 50% du tarif pack choisi)

**Engagement** : Aucun (vous pouvez arrêter après le mois pilote)

---

### Phase 3 : Déploiement (Mois 2+)

**Objectif** : Scaler et optimiser

**Étapes** :
1. Analyse résultats pilote
2. Ajout automatisations additionnelles
3. Montée niveau autonomie si pertinent
4. Création workflows custom (Pack Pro/Entreprise)

**Tarif** : Selon pack choisi

---

## ❓ FAQ Clients

### Q1 : Mes données sont-elles sécurisées ?

**R** : **Oui, absolument.**
- Toutes les communications sont chiffrées (HTTPS)
- Vos credentials (Google, GitHub, etc.) sont stockées de manière sécurisée dans n8n (standard industrie)
- Prolex ne stocke PAS vos données métier, il orchestre vos outils existants
- Logs anonymisés (pas de données sensibles)
- Conformité RGPD

---

### Q2 : Que se passe-t-il si je veux arrêter ?

**R** :
- Aucun engagement long terme (mensuel)
- Vous pouvez annuler à tout moment (préavis 30 jours)
- Vos données restent dans VOS outils (Google, etc.), donc aucune perte
- Export complet de vos workflows disponibles

---

### Q3 : Prolex peut-il se tromper ?

**R** : **Rarement, mais oui, c'est possible.**
- Prolex utilise des LLMs (GPT-4, Claude) qui peuvent occasionnellement "halluciner"
- C'est pourquoi nous avons des **garde-fous** :
  - Niveaux d'autonomie (Prolex ne fait que ce qu'il est autorisé à faire)
  - Sandbox pour workflows auto-générés (test avant production)
  - Logs complets (traçabilité totale)
- Sur 100 requêtes, taux de succès : **> 95%**

---

### Q4 : J'utilise déjà Zapier/Make. Pourquoi Prolex ?

**R** :
- **Zapier/Make** : Vous configurez manuellement chaque automation (courbe apprentissage)
- **Prolex** : Vous dites ce que vous voulez en langage naturel, Prolex configure pour vous
- **Complémentarité** : Prolex peut même créer des workflows Zapier/Make pour vous (à venir)

---

### Q5 : Prolex fonctionne avec quels outils ?

**R** : **Actuellement (v4)** :
- ✅ Google Workspace (Tasks, Calendar, Docs, Sheets, Drive)
- ✅ GitHub
- ✅ n8n
- ✅ Recherche web

**Prochainement** (Q1 2026) :
- Microsoft 365 (Outlook, Teams, OneDrive)
- Slack
- Notion
- Trello / Asana
- Stripe
- Votre CRM (sur devis)

---

### Q6 : Combien de temps pour voir des résultats ?

**R** :
- **Résultats immédiats** : Dès jour 1, premières automatisations fonctionnelles
- **ROI positif** : En général après 2-4 semaines (le temps gagné > le coût)
- **Adoption équipe** : 1-2 mois pour que toute l'équipe utilise naturellement

---

### Q7 : Et si j'ai un besoin très spécifique ?

**R** :
- **Pack Entreprise** : Workflows custom illimités
- Prolex peut **apprendre** vos processus spécifiques
- Intégrations sur-mesure possibles (API de votre outil métier)

---

## 📊 Métriques de succès (clients pilotes)

### Client A : Agence web (8 personnes)

- **Gain temps** : 15h/semaine (équipe)
- **ROI** : 300% (gain valorisé à 1500€/mois, coût 500€/mois)
- **Satisfaction** : 9/10

**Témoignage** :
> "Prolex nous a fait gagner l'équivalent d'un demi-temps plein. On peut enfin se concentrer sur les projets créatifs au lieu de l'admin."
> — Sophie, CEO

---

### Client B : Freelance growth marketer

- **Gain temps** : 8h/semaine
- **ROI** : 400% (8h × 100€/h = 800€ gagné, coût 200€/mois)
- **Satisfaction** : 10/10

**Témoignage** :
> "J'ai pu prendre 2 clients supplémentaires sans m'épuiser. Prolex gère toute ma logistique."
> — Marc, Freelance

---

## 🎁 Offre de lancement

### Pour les 10 premiers clients

**Avantages** :
- 🎉 **50% de réduction** sur les 3 premiers mois
- 🎁 **Pilote gratuit** (au lieu de 50% du tarif)
- 🚀 **Setup personnalisé** avec Matthieu (3h offertes)
- 📚 **Workflows bonus** (templates éprouvés)

**Conditions** :
- S'engager sur feedback régulier (1h/mois)
- Accepter témoignage et logo sur site (si ROI positif)

**Comment** :
- Email : matthieu@automatt.ai
- Sujet : "Early Adopter Prolex v4"

---

## 📞 Contact

### Automatt.ai

**Fondateur** : Matthieu
**Email** : matthieu@automatt.ai
**Site** : [automatt.ai](https://automatt.ai) (à venir)

### Pour aller plus loin

- 📅 **Réserver un appel découverte** : [Calendly](https://calendly.com/matthieu-automatt) (15 min, gratuit)
- 📖 **Lire le blog** : Cas d'usage, tutoriels, roadmap
- 💬 **Rejoindre la communauté** : Slack/Discord (à venir)

---

**Prêt à automatiser votre quotidien ?**
**Contactez-nous dès aujourd'hui !**

---

**Document créé par** : Automatt.ai
**Dernière mise à jour** : 2025-11-22
**Version** : 1.0
