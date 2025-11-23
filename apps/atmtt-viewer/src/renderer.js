const { ipcRenderer } = require('electron');
const { marked } = require('marked');

// ===== ÉTAT DE L'APPLICATION =====
let allFiles = [];
let currentFile = null;
let isPreviewMode = false;
let isDirty = false; // Indique si le fichier a été modifié

// ===== ÉLÉMENTS DOM =====
const elements = {
  fileList: document.getElementById('file-list'),
  editor: document.getElementById('editor'),
  preview: document.getElementById('preview'),
  welcomeMessage: document.getElementById('welcome-message'),
  currentFilePath: document.getElementById('current-file-path'),
  rootDirDisplay: document.getElementById('root-dir-display'),
  searchInput: document.getElementById('search-input'),
  btnSave: document.getElementById('btn-save'),
  btnTogglePreview: document.getElementById('btn-toggle-preview'),
  btnChangeDir: document.getElementById('btn-change-dir')
};

// Configuration de marked pour un meilleur rendu
marked.setOptions({
  breaks: true,
  gfm: true
});

// ===== INITIALISATION =====
async function init() {
  await loadConfig();
  await loadFiles();
  attachEventListeners();
}

/**
 * Charge la configuration
 */
async function loadConfig() {
  const config = await ipcRenderer.invoke('get-config');
  elements.rootDirDisplay.textContent = config.rootDir;
  elements.rootDirDisplay.title = config.rootDir;
}

/**
 * Charge la liste des fichiers
 */
async function loadFiles() {
  elements.fileList.innerHTML = '<div class="loading">Chargement des fichiers...</div>';

  const result = await ipcRenderer.invoke('list-files');

  if (result.success) {
    allFiles = result.files;
    renderFileList(allFiles);
  } else {
    elements.fileList.innerHTML = `
      <div class="error">
        ❌ Erreur lors du chargement des fichiers:<br>
        ${result.error}
      </div>
    `;
  }
}

/**
 * Affiche la liste des fichiers
 */
function renderFileList(files) {
  if (files.length === 0) {
    elements.fileList.innerHTML = `
      <div class="no-files">
        Aucun fichier trouvé dans ce dossier.
      </div>
    `;
    return;
  }

  // Trie les fichiers par chemin relatif
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  let html = '<div class="file-items">';

  files.forEach(file => {
    const icon = getFileIcon(file.ext);
    html += `
      <div class="file-item" data-path="${file.path}" title="${file.path}">
        <span class="file-icon">${icon}</span>
        <span class="file-name">${file.relativePath}</span>
      </div>
    `;
  });

  html += '</div>';
  elements.fileList.innerHTML = html;

  // Attache les événements de clic
  document.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', () => {
      const filePath = item.dataset.path;
      openFile(filePath);
    });
  });
}

/**
 * Retourne l'icône appropriée selon l'extension
 */
function getFileIcon(ext) {
  const icons = {
    '.md': '📝',
    '.txt': '📄',
    '.json': '🔧',
    '.yaml': '⚙️',
    '.yml': '⚙️',
    '.log': '📋'
  };
  return icons[ext] || '📄';
}

/**
 * Ouvre un fichier
 */
async function openFile(filePath) {
  // Vérifie si le fichier actuel a été modifié
  if (isDirty && currentFile) {
    const confirmation = confirm(
      'Le fichier actuel a été modifié. Voulez-vous enregistrer les modifications ?'
    );
    if (confirmation) {
      await saveFile();
    }
  }

  const result = await ipcRenderer.invoke('read-file', filePath);

  if (result.success) {
    currentFile = {
      path: filePath,
      content: result.content,
      ext: filePath.substring(filePath.lastIndexOf('.')).toLowerCase()
    };

    displayFile();
    isDirty = false;
    updateSaveButton();

    // Met en surbrillance le fichier sélectionné
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.toggle('active', item.dataset.path === filePath);
    });
  } else {
    alert(`Erreur lors de l'ouverture du fichier:\n${result.error}`);
  }
}

/**
 * Affiche le fichier dans l'éditeur
 */
function displayFile() {
  if (!currentFile) return;

  // Cache le message de bienvenue
  elements.welcomeMessage.style.display = 'none';

  // Affiche le chemin du fichier
  elements.currentFilePath.textContent = currentFile.path;
  elements.currentFilePath.title = currentFile.path;

  // Affiche le contenu dans l'éditeur
  elements.editor.value = currentFile.content;
  elements.editor.style.display = 'block';

  // Pour les fichiers Markdown, affiche le bouton de prévisualisation
  if (currentFile.ext === '.md') {
    elements.btnTogglePreview.style.display = 'inline-block';
    isPreviewMode = false;
    updatePreviewButton();
  } else {
    elements.btnTogglePreview.style.display = 'none';
    elements.preview.style.display = 'none';
  }

  elements.btnSave.disabled = false;
}

/**
 * Bascule entre le mode édition et prévisualisation
 */
function togglePreview() {
  if (!currentFile || currentFile.ext !== '.md') return;

  isPreviewMode = !isPreviewMode;

  if (isPreviewMode) {
    // Mode prévisualisation
    const html = marked.parse(elements.editor.value);
    elements.preview.innerHTML = html;
    elements.preview.style.display = 'block';
    elements.editor.style.display = 'none';
  } else {
    // Mode édition
    elements.preview.style.display = 'none';
    elements.editor.style.display = 'block';
  }

  updatePreviewButton();
}

/**
 * Met à jour le bouton de prévisualisation
 */
function updatePreviewButton() {
  if (isPreviewMode) {
    elements.btnTogglePreview.textContent = '✏️ Éditer';
  } else {
    elements.btnTogglePreview.textContent = '👁️ Aperçu';
  }
}

/**
 * Sauvegarde le fichier
 */
async function saveFile() {
  if (!currentFile) return;

  const content = elements.editor.value;
  const result = await ipcRenderer.invoke('write-file', currentFile.path, content);

  if (result.success) {
    currentFile.content = content;
    isDirty = false;
    updateSaveButton();
    showNotification('✅ Fichier enregistré avec succès');
  } else {
    alert(`Erreur lors de l'enregistrement:\n${result.error}`);
  }
}

/**
 * Met à jour l'état du bouton Enregistrer
 */
function updateSaveButton() {
  if (isDirty) {
    elements.btnSave.classList.add('btn-dirty');
    elements.btnSave.textContent = '💾 Enregistrer *';
  } else {
    elements.btnSave.classList.remove('btn-dirty');
    elements.btnSave.textContent = '💾 Enregistrer';
  }
}

/**
 * Change le dossier racine
 */
async function changeDirectory() {
  const result = await ipcRenderer.invoke('select-directory');

  if (result.success) {
    elements.rootDirDisplay.textContent = result.rootDir;
    elements.rootDirDisplay.title = result.rootDir;
    await loadFiles();
    showNotification('✅ Dossier racine mis à jour');
  }
}

/**
 * Recherche dans les fichiers
 */
function handleSearch(query) {
  if (!query.trim()) {
    renderFileList(allFiles);
    return;
  }

  const filtered = allFiles.filter(file =>
    file.name.toLowerCase().includes(query.toLowerCase()) ||
    file.relativePath.toLowerCase().includes(query.toLowerCase())
  );

  renderFileList(filtered);
}

/**
 * Affiche une notification temporaire
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

/**
 * Attache les événements
 */
function attachEventListeners() {
  // Bouton Enregistrer
  elements.btnSave.addEventListener('click', saveFile);

  // Bouton Toggle Preview
  elements.btnTogglePreview.addEventListener('click', togglePreview);

  // Bouton Changer de dossier
  elements.btnChangeDir.addEventListener('click', changeDirectory);

  // Recherche
  elements.searchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value);
  });

  // Détection des modifications dans l'éditeur
  elements.editor.addEventListener('input', () => {
    if (currentFile) {
      isDirty = (elements.editor.value !== currentFile.content);
      updateSaveButton();
    }
  });

  // Raccourcis clavier
  document.addEventListener('keydown', (e) => {
    // Ctrl+S ou Cmd+S pour enregistrer
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (currentFile) {
        saveFile();
      }
    }

    // Ctrl+P ou Cmd+P pour toggle preview (fichiers .md uniquement)
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      if (currentFile && currentFile.ext === '.md') {
        togglePreview();
      }
    }
  });

  // Réception d'un fichier passé en argument
  ipcRenderer.on('open-file-arg', (event, filePath) => {
    openFile(filePath);
  });
}

// ===== DÉMARRAGE =====
init();
