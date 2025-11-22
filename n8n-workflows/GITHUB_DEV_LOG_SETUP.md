# 📊 GitHub Dev Log → Sheets

Workflow n8n qui enregistre automatiquement tous les commits de ton dépôt GitHub dans Google Sheets pour créer un journal de développement détaillé.

## 🎯 Objectif

Chaque fois qu'un push est effectué sur GitHub, ce workflow :
1. Reçoit le webhook GitHub
2. Extrait les informations de chaque commit (SHA, auteur, message, fichiers modifiés)
3. Ajoute une ligne par commit dans Google Sheets

**Résultat** : Un journal de développement complet et automatique dans Google Sheets !

---

## 📋 Prérequis

- n8n installé et fonctionnel (voir [README.md](./README.md))
- Credentials Google Sheets configurés dans n8n
- Accès admin au dépôt GitHub pour configurer le webhook

---

## 🚀 Configuration (étape par étape)

### Étape 1 : Préparer Google Sheets

1. **Créer ou ouvrir une Google Sheet** :
   - Crée un nouveau Google Sheets ou utilise un existant
   - Copie l'ID du document depuis l'URL :
     ```
     https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
     ```

2. **Créer l'onglet `dev_commits`** :
   - Créé un nouvel onglet nommé exactement `dev_commits`
   - ⚠️ Le nom doit être exact (sensible à la casse)

3. **Ajouter les en-têtes (ligne 1)** :
   Copie ces en-têtes exactement dans la première ligne :

   | A | B | C | D | E | F | G | H | I | J |
   |---|---|---|---|---|---|---|---|---|---|
   | timestamp_utc | repo | branch | commit_sha | author | message | files_changed | added | modified | removed |

4. **Partager le document** :
   - Assure-toi que le compte Google utilisé dans n8n a accès en écriture à ce document

### Étape 2 : Importer le workflow dans n8n

1. **Ouvrir n8n** :
   - Va sur http://localhost:5678

2. **Importer le workflow** :
   - Clique sur **"Add workflow"** → **"Import from File"**
   - Sélectionne le fichier `n8n-workflows/030_github-dev-log-to-sheets.json`
   - Ou copie-colle le contenu du fichier
   - Clique sur **"Import"**

3. **Le workflow apparaît** : "GitHub Dev Log → Sheets"

### Étape 3 : Configurer le nœud Google Sheets

1. **Ouvrir le workflow importé**

2. **Cliquer sur le nœud "Ajouter à Google Sheets"**

3. **Configurer le Document ID** :
   - Dans le champ **"Spreadsheet"**, clique sur l'icône de sélection
   - Entre l'ID de ton Google Sheet (copié à l'étape 1)
   - Ou sélectionne-le depuis la liste si disponible

4. **Vérifier le Sheet Name** :
   - Le champ **"Sheet"** doit être : `dev_commits`

5. **Vérifier les colonnes mappées** :
   - Les 10 colonnes doivent être mappées automatiquement :
     - timestamp_utc
     - repo
     - branch
     - commit_sha
     - author
     - message
     - files_changed
     - added
     - modified
     - removed

6. **Tester la connexion** :
   - Clique sur **"Test step"** pour vérifier que n8n peut accéder au sheet

### Étape 4 : Activer le webhook

1. **Cliquer sur le nœud "Webhook de push GitHub"**

2. **Copier l'URL du webhook** :
   - L'URL locale sera : `http://localhost:5678/webhook/github-dev-log`
   - ⚠️ **Important** : Si tu es en développement local, tu dois exposer cette URL publiquement

3. **Exposer le webhook avec ngrok** (si nécessaire) :
   ```bash
   # Installer ngrok
   brew install ngrok  # macOS
   # ou télécharger depuis https://ngrok.com/

   # Créer un tunnel vers n8n local
   ngrok http 5678

   # Copier l'URL publique (ex: https://abc123.ngrok-free.app)
   # L'URL du webhook devient : https://abc123.ngrok-free.app/webhook/github-dev-log
   ```

4. **Activer le workflow** :
   - Dans n8n, clique sur le toggle **"Active"** en haut à droite
   - Le workflow est maintenant en écoute !

### Étape 5 : Configurer le webhook GitHub

1. **Aller dans les paramètres du dépôt** :
   - https://github.com/ProlexAi/Prolex/settings/hooks

2. **Ajouter un nouveau webhook** :
   - Clique sur **"Add webhook"**

3. **Configurer le webhook** :
   - **Payload URL** : `https://abc123.ngrok-free.app/webhook/github-dev-log` (ton URL publique)
   - **Content type** : `application/json`
   - **Secret** : (laisser vide pour l'instant, peut être ajouté plus tard)
   - **Which events would you like to trigger this webhook?** :
     - Sélectionne **"Just the push event"**
   - **Active** : ✅ Coché

4. **Sauvegarder** :
   - Clique sur **"Add webhook"**
   - GitHub va envoyer un ping immédiatement

---

## 🧪 Test du workflow

### Test manuel avec un commit

1. **Faire un commit simple** :
   ```bash
   cd /chemin/vers/Prolex
   echo "Test dev log" >> test.txt
   git add test.txt
   git commit -m "test: vérification du dev log automatique"
   git push origin main
   ```

2. **Vérifier dans n8n** :
   - Ouvre le workflow "GitHub Dev Log → Sheets"
   - Clique sur **"Executions"** (barre latérale gauche)
   - Tu devrais voir une nouvelle exécution avec statut "Success"
   - Clique dessus pour voir les détails

3. **Vérifier dans Google Sheets** :
   - Ouvre ton Google Sheet
   - Va dans l'onglet `dev_commits`
   - Une nouvelle ligne doit apparaître avec :
     - **timestamp_utc** : Date/heure du push
     - **repo** : `ProlexAi/Prolex`
     - **branch** : `main` (ou ta branche)
     - **commit_sha** : Le SHA du commit
     - **author** : Ton nom
     - **message** : `test: vérification du dev log automatique`
     - **files_changed** : `test.txt`
     - **added** : `test.txt`
     - **modified** : (vide)
     - **removed** : (vide)

### Test avec plusieurs commits

Si ton push contient plusieurs commits, le workflow créera **une ligne par commit** dans Google Sheets.

```bash
# Exemple avec 2 commits
echo "Feature A" >> feature-a.txt
git add feature-a.txt
git commit -m "feat: add feature A"

echo "Feature B" >> feature-b.txt
git add feature-b.txt
git commit -m "feat: add feature B"

git push origin main
```

Résultat attendu : **2 nouvelles lignes** dans Google Sheets.

---

## 🔍 Détails techniques

### Nœud 1 : Webhook de push GitHub

- **Type** : Webhook
- **Méthode** : POST
- **Chemin** : `github-dev-log`
- **Réponse** : On Received (répond 200 immédiatement)
- **Authentification** : None (peut être ajoutée avec un secret)

### Nœud 2 : Extraire commits (Code JavaScript)

Logique du code :
1. Récupère le payload GitHub
2. Extrait le nom du repo (`repository.full_name`)
3. Extrait la branche (`ref` sans le préfixe `refs/heads/`)
4. Extrait l'auteur (`pusher.name` ou `sender.login`)
5. Pour chaque commit dans `commits[]` :
   - Récupère le SHA (`commit.id`)
   - Récupère le message (`commit.message`)
   - Liste les fichiers ajoutés (`added[]`)
   - Liste les fichiers modifiés (`modified[]`)
   - Liste les fichiers supprimés (`removed[]`)
   - Crée un objet JSON avec tous ces champs
6. Retourne un item par commit

**Mode** : `runOnceForEachItem` (exécute le code pour chaque élément)

### Nœud 3 : Ajouter à Google Sheets

- **Ressource** : Sheet
- **Opération** : Append (ajouter à la fin)
- **Mode colonnes** : Map Each Column
- **Mapping** :
  - Chaque champ JSON → Colonne correspondante
  - Utilise les expressions n8n : `={{ $json.field_name }}`

---

## 🐛 Dépannage

### Le webhook ne se déclenche pas

1. **Vérifier que le workflow est actif** :
   - Le toggle "Active" doit être ON dans n8n

2. **Vérifier le webhook GitHub** :
   - Va sur https://github.com/ProlexAi/Prolex/settings/hooks
   - Clique sur ton webhook
   - Vérifie **"Recent Deliveries"**
   - Si erreur 4xx/5xx : vérifie l'URL et que ngrok tourne

3. **Vérifier les logs n8n** :
   - Dans n8n, onglet "Executions"
   - Vérifie s'il y a des erreurs

### Erreur "Sheet not found"

- Vérifie que l'onglet `dev_commits` existe dans ton Google Sheet
- Vérifie l'orthographe exacte (sensible à la casse)

### Erreur "Permission denied" Google Sheets

- Vérifie que le compte Google utilisé dans n8n a accès en écriture au document
- Re-autorise les credentials Google Sheets dans n8n

### Les colonnes ne correspondent pas

- Vérifie que la ligne 1 de `dev_commits` contient exactement les 10 en-têtes
- Vérifie qu'il n'y a pas d'espaces supplémentaires
- Les en-têtes doivent être en minuscules avec underscore

### Pas de commits dans le payload

- Vérifie que tu push bien sur une branche (pas un tag)
- Vérifie que le push contient au moins 1 commit

---

## 🎨 Personnalisation

### Ajouter d'autres champs

Tu peux enrichir le code JavaScript pour ajouter d'autres informations :

```javascript
// Exemple : ajouter l'URL du commit
commit_url: `https://github.com/${repo}/commit/${commit.id}`

// Exemple : compter le nombre de fichiers
files_count: files.length

// Exemple : détecter le type de commit (feat, fix, etc.)
commit_type: commit.message.split(':')[0]
```

N'oublie pas d'ajouter les colonnes correspondantes dans Google Sheets !

### Filtrer certaines branches

Si tu veux ignorer certaines branches (ex: branches de test) :

```javascript
// Au début du code, après l'extraction de la branche
if (branch === 'test' || branch.startsWith('tmp-')) {
  return [];  // Ne rien retourner
}
```

### Ajouter une authentification webhook

Pour sécuriser le webhook :

1. **Dans GitHub** :
   - Ajoute un **Secret** dans les paramètres du webhook
   - Ex: `mon-secret-super-securise`

2. **Dans n8n** :
   - Dans le nœud Webhook, active **"Authentication"**
   - Sélectionne **"Header Auth"**
   - Configure la validation du header `X-Hub-Signature-256`

---

## 📊 Exemples d'utilisation du Google Sheet

Une fois que tu as accumulé des données :

### Analyses possibles

1. **Commits par auteur** :
   - Crée un tableau croisé dynamique avec `author` en ligne

2. **Commits par branche** :
   - Filtre par colonne `branch`

3. **Activité dans le temps** :
   - Graphique avec `timestamp_utc` en axe X

4. **Fichiers les plus modifiés** :
   - Analyse la colonne `files_changed`

5. **Types de commits** :
   - Extrait le préfixe de `message` (feat, fix, docs, etc.)

### Formules Google Sheets utiles

```
# Nombre de commits par auteur
=COUNTIF(E:E, "John Doe")

# Commits aujourd'hui
=COUNTIF(A:A, ">"&TODAY())

# Nombre de fichiers modifiés (moyenne)
=AVERAGE(ARRAYFORMULA(LEN(G:G)-LEN(SUBSTITUTE(G:G, ",", ""))+1))
```

---

## 🔐 Sécurité

### Bonnes pratiques

- ✅ Utilise un secret webhook en production
- ✅ Limite l'accès au Google Sheet
- ✅ Ne commite jamais l'ID du Google Sheet dans le code (utilise des variables d'environnement)
- ✅ Utilise HTTPS pour le webhook (obligatoire avec GitHub)

### En production

- Remplace ngrok par un serveur permanent
- Active la validation de signature GitHub
- Ajoute des alertes en cas d'échec du workflow

---

## 📚 Ressources

- [Documentation GitHub Webhooks](https://docs.github.com/en/webhooks)
- [Payload des événements Push](https://docs.github.com/en/webhooks/webhook-events-and-payloads#push)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [n8n Code Node](https://docs.n8n.io/code/builtin/code-node/)

---

**Bon logging ! 📊🚀**
