@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: Prolex Tools - Script d'installation automatique
:: ============================================================================
:: Ce script installe automatiquement tous les outils et applications Prolex
:: sur votre PC Windows.
::
:: Prérequis : Node.js 16+ et npm installés
:: ============================================================================

echo.
echo ========================================
echo  Prolex Tools - Installation
echo ========================================
echo.

:: Vérifier si Node.js est installé
echo [1/4] Verification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe.
    echo.
    echo Veuillez installer Node.js depuis : https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js est installe
node --version
npm --version
echo.

:: Récupérer le répertoire du script
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo [2/4] Installation du Tools Manager...
cd apps\prolex-tools-manager
if exist node_modules (
    echo [INFO] node_modules existe deja, nettoyage...
    rmdir /s /q node_modules
)
call npm install
if errorlevel 1 (
    echo [ERREUR] Installation du Tools Manager a echoue
    pause
    exit /b 1
)
echo [OK] Tools Manager installe
echo.

:: Revenir au dossier racine
cd /d "%SCRIPT_DIR%"

echo [3/4] Installation des applications...

:: AtmttViewer
echo   - Installation de AtmttViewer...
cd apps\atmtt-viewer
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo     [ATTENTION] Installation de AtmttViewer a echoue
    ) else (
        echo     [OK] AtmttViewer installe
    )
) else (
    echo     [SKIP] AtmttViewer deja installe
)
cd /d "%SCRIPT_DIR%"

:: Automatt Docker Panel
echo   - Installation de Docker Panel...
cd apps\automatt-docker-panel
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo     [ATTENTION] Installation de Docker Panel a echoue
    ) else (
        echo     [OK] Docker Panel installe
    )
) else (
    echo     [SKIP] Docker Panel deja installe
)
cd /d "%SCRIPT_DIR%"

:: Prolex Run Logger
echo   - Installation de Prolex Run Logger...
cd apps\prolex-run-logger
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo     [ATTENTION] Installation de Prolex Run Logger a echoue
    ) else (
        echo     [OK] Prolex Run Logger installe
    )
) else (
    echo     [SKIP] Prolex Run Logger deja installe
)
cd /d "%SCRIPT_DIR%"

:: Prolex Web Scraper
echo   - Installation de Prolex Web Scraper...
cd apps\prolex-web-scraper
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo     [ATTENTION] Installation de Prolex Web Scraper a echoue
    ) else (
        echo     [OK] Prolex Web Scraper installe
    )
) else (
    echo     [SKIP] Prolex Web Scraper deja installe
)
cd /d "%SCRIPT_DIR%"

echo.
echo [OK] Applications installees
echo.

:: Créer raccourci sur le bureau (optionnel)
echo [4/4] Creation du raccourci bureau...

:: Utiliser PowerShell pour créer le raccourci
set "DESKTOP=%USERPROFILE%\Desktop"
set "TARGET=%SCRIPT_DIR%apps\prolex-tools-manager\node_modules\.bin\electron.cmd"
set "ARGS=%SCRIPT_DIR%apps\prolex-tools-manager"
set "SHORTCUT=%DESKTOP%\Prolex Tools Manager.lnk"

powershell -Command "$WScriptShell = New-Object -ComObject WScript.Shell; $Shortcut = $WScriptShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = 'cmd.exe'; $Shortcut.Arguments = '/c cd /d \"%SCRIPT_DIR%apps\prolex-tools-manager\" && npm start'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%apps\prolex-tools-manager'; $Shortcut.IconLocation = '%SystemRoot%\System32\SHELL32.dll,21'; $Shortcut.Save()"

if exist "%SHORTCUT%" (
    echo [OK] Raccourci cree sur le bureau
) else (
    echo [INFO] Raccourci non cree (pas d'erreur)
)

echo.
echo ========================================
echo  Installation terminee !
echo ========================================
echo.
echo Vous pouvez maintenant :
echo   1. Lancer le Tools Manager depuis le raccourci bureau
echo   2. Ou executer : cd apps\prolex-tools-manager ^&^& npm start
echo.
echo Le Tools Manager vous permettra de gerer tous vos outils.
echo.

:: Demander si on veut lancer le Tools Manager
set /p LAUNCH="Voulez-vous lancer le Tools Manager maintenant ? (O/N) : "
if /i "%LAUNCH%"=="O" (
    echo.
    echo Lancement du Tools Manager...
    cd apps\prolex-tools-manager
    start npm start
    exit /b 0
) else (
    echo.
    echo A bientot !
    pause
    exit /b 0
)
